"use client";

import { useEffect, useMemo, useState } from "react";
import { RequestDetailModal } from "../components/RequestDetailModal";
import { ModulePage } from "../components/ModulePage";
import { useSelectedUser } from "../hooks/useSelectedUser";
import { fetchRequests, type RequestItem } from "../services/requestStorage";
import { REQUEST_FORM_CONFIGS, type RequestKind } from "../services/formValidation";

type RequestBucket = "received" | "processing" | "done" | "rejected";

const bucketLabels: Record<RequestBucket, string> = {
  received: "접수",
  processing: "처리중",
  done: "완료",
  rejected: "반려"
};

const bucketStyles: Record<RequestBucket, string> = {
  received: "bg-slate-100 text-slate-600 border-slate-200",
  processing: "bg-orange-50 text-orange-700 border-orange-200",
  done: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-600 border-red-200"
};

const defaultQuery = {
  scope: "",
  kind: "",
  status: "",
  requester: "",
  date: ""
};

function requestBucket(status: string): RequestBucket {
  const text = String(status);
  if (text.includes("완료") || text.includes("?꾨즺")) return "done";
  if (text.includes("반려") || text.includes("諛섎젮")) return "rejected";
  if (text.includes("처리") || text.includes("확인") || text.includes("VIPS")) return "processing";
  return "received";
}

function requesterKey(value: string) {
  return String(value || "").trim().toLowerCase();
}

function isOwnRequest(item: RequestItem, selectedUser: { name: string; email: string }) {
  const requester = requesterKey(item.requester);
  return requester === selectedUser.email.toLowerCase() || requester === selectedUser.name.toLowerCase();
}

function todayText() {
  const now = new Date();
  return `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;
}

function isToday(item: RequestItem) {
  return String(item.requestedAt || "").startsWith(todayText());
}

function kindLabel(kind?: RequestKind, fallback?: string) {
  if (kind && REQUEST_FORM_CONFIGS[kind]) return REQUEST_FORM_CONFIGS[kind].title;
  return fallback || "VIPS 요청";
}

function readQuery() {
  if (typeof window === "undefined") return defaultQuery;
  const params = new URLSearchParams(window.location.search);
  return {
    scope: params.get("scope") ?? "",
    kind: params.get("kind") ?? "",
    status: params.get("status") ?? "",
    requester: params.get("requester") ?? "",
    date: params.get("date") ?? ""
  };
}

export default function RequestStatusPage() {
  const { selectedUser } = useSelectedUser();
  const [items, setItems] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailRequest, setDetailRequest] = useState<RequestItem | null>(null);
  const [query, setQuery] = useState(defaultQuery);

  useEffect(() => {
    setQuery(readQuery());
    fetchRequests()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const visibleItems = useMemo(() => {
    const isAdminAll = selectedUser.accessRole === "admin" && query.scope === "all";
    const kindSet = new Set(query.kind.split(",").map((value) => value.trim()).filter(Boolean));
    const requesterSet = new Set(query.requester.split(",").map((value) => requesterKey(value)).filter(Boolean));

    return items
      .filter((item) => {
        if (!isAdminAll && !isOwnRequest(item, selectedUser)) return false;
        if (kindSet.size > 0 && (!item.kind || !kindSet.has(item.kind))) return false;
        if (query.status && requestBucket(item.status) !== query.status) return false;
        if (query.date === "today" && !isToday(item)) return false;
        if (requesterSet.size > 0 && !requesterSet.has(requesterKey(item.requester))) return false;
        return true;
      })
      .sort((a, b) => String(b.requestedAt).localeCompare(String(a.requestedAt)));
  }, [items, query, selectedUser]);

  const counts = useMemo(
    () =>
      visibleItems.reduce(
        (acc, item) => {
          acc[requestBucket(item.status)] += 1;
          return acc;
        },
        { received: 0, processing: 0, done: 0, rejected: 0 } as Record<RequestBucket, number>
      ),
    [visibleItems]
  );

  const isAdminAll = selectedUser.accessRole === "admin" && query.scope === "all";
  const description = isAdminAll
    ? "Sally Admin 권한으로 Sales가 올린 VIPS팀 요청 전체를 확인합니다."
    : "내가 요청한 VIPS팀 업무의 접수, 처리 상태, 처리결과를 확인합니다.";

  return (
    <ModulePage eyebrow="Request Status" title="요청 현황" description={description}>
      <div className="mt-5 space-y-4">
        <section className="grid gap-3 md:grid-cols-4">
          {([
            ["접수", counts.received, "received"],
            ["처리중", counts.processing, "processing"],
            ["완료", counts.done, "done"],
            ["반려", counts.rejected, "rejected"]
          ] as const).map(([label, value, bucket]) => (
            <article key={bucket} className="ops-card p-4">
              <p className="text-[12px] font-[900] text-[#64748b]">{label}</p>
              <p className="mt-2 text-[28px] font-[950] tracking-[-0.03em] text-[#111827]">{value}건</p>
              <span className={`mt-3 inline-flex rounded-full border px-3 py-1 text-[11px] font-[900] ${bucketStyles[bucket]}`}>
                {bucketLabels[bucket]}
              </span>
            </article>
          ))}
        </section>

        <section className="ops-card overflow-hidden p-0">
          <div className="flex items-center justify-between gap-3 border-b border-[#eef2f7] px-4 py-3">
            <div>
              <h2 className="text-[16px] font-[950] text-[#111827]">요청 목록</h2>
              <p className="mt-0.5 text-[12px] font-[750] text-[#64748b]">
                {isAdminAll ? "VIPS 운영에서 선택한 조건의 요청입니다." : "내 요청만 표시됩니다."}
              </p>
            </div>
            <span className="rounded-full bg-[#eef5ff] px-3 py-1.5 text-[12px] font-[950] text-[#2563eb]">총 {visibleItems.length}건</span>
          </div>

          <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(120px,0.8fr)_150px_120px_minmax(0,1.2fr)] bg-[#f8fbff] px-4 py-3 text-[12px] font-[850] text-[#64748b]">
            <span>요청 종류</span>
            <span>요청자</span>
            <span>요청일시</span>
            <span>상태</span>
            <span>처리결과</span>
          </div>

          {loading ? (
            <div className="px-4 py-12 text-center text-[13px] font-[750] text-[#64748b]">요청 현황을 불러오는 중입니다.</div>
          ) : visibleItems.length === 0 ? (
            <div className="px-4 py-12 text-center text-[13px] font-[750] text-[#64748b]">조건에 해당하는 요청이 없습니다.</div>
          ) : (
            visibleItems.map((item) => {
              const bucket = requestBucket(item.status);
              return (
                <button
                  key={item.id}
                  onClick={() => setDetailRequest(item)}
                  className="grid w-full grid-cols-[minmax(0,1.2fr)_minmax(120px,0.8fr)_150px_120px_minmax(0,1.2fr)] items-center border-t border-[#eef2f7] px-4 py-3 text-left text-[13px] transition hover:bg-[#f8fbff]"
                >
                  <span className="min-w-0">
                    <b className="block truncate text-[#111827]">{kindLabel(item.kind, item.type)}</b>
                    <span className="mt-1 block truncate text-[11px] font-[750] text-[#94a3b8]">{item.id}</span>
                  </span>
                  <span className="truncate font-[750] text-[#64748b]">{item.requester}</span>
                  <span className="font-[750] text-[#64748b]">{item.requestedAt}</span>
                  <span className={`w-fit rounded-full border px-3 py-1 text-[12px] font-[900] ${bucketStyles[bucket]}`}>{bucketLabels[bucket]}</span>
                  <span className="truncate font-[750] text-[#111827]">{item.result || "처리 결과 대기"}</span>
                </button>
              );
            })
          )}
        </section>
      </div>
      <RequestDetailModal request={detailRequest} onClose={() => setDetailRequest(null)} />
    </ModulePage>
  );
}
