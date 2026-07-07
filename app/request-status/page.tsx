"use client";

import Image from "next/image";
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
  received: "ops-status-muted",
  processing: "ops-status-attention",
  done: "ops-status-info",
  rejected: "ops-status-attention"
};

const defaultQuery = {
  scope: "",
  kind: "",
  status: "",
  requester: "",
  assignee: "",
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

function isAssignedToUser(item: RequestItem, selectedUser: { name: string; email: string }) {
  const owners = (item.assignedOwners ?? []).map((owner) => requesterKey(owner));
  return owners.includes(requesterKey(selectedUser.name)) || owners.includes(requesterKey(selectedUser.email));
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
    assignee: params.get("assignee") ?? "",
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
    const assigneeSet = new Set(query.assignee.split(",").map((value) => requesterKey(value)).filter(Boolean));

    return items
      .filter((item) => {
        if (!isAdminAll && !isOwnRequest(item, selectedUser) && !isAssignedToUser(item, selectedUser)) return false;
        if (kindSet.size > 0 && (!item.kind || !kindSet.has(item.kind))) return false;
        if (query.status && requestBucket(item.status) !== query.status) return false;
        if (query.date === "today" && !isToday(item)) return false;
        if (requesterSet.size > 0 && !requesterSet.has(requesterKey(item.requester))) return false;
        if (assigneeSet.size > 0) {
          const owners = (item.assignedOwners ?? []).map((owner) => requesterKey(owner));
          if (!owners.some((owner) => assigneeSet.has(owner))) return false;
        }
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
  const canProcessDetail = !!detailRequest && (selectedUser.accessRole === "admin" || isAssignedToUser(detailRequest, selectedUser));
  const assignedCount = visibleItems.filter((item) => isAssignedToUser(item, selectedUser)).length;
  const ownCount = visibleItems.filter((item) => isOwnRequest(item, selectedUser)).length;
  const description = isAdminAll
    ? "Sally Admin 권한으로 Sales가 올린 VIPS팀 요청 전체를 확인합니다."
    : "내가 요청했거나 나에게 배정된 VIPS팀 업무의 접수, 처리 상태, 처리결과를 확인합니다.";

  return (
    <ModulePage eyebrow="Request Status" title="요청 현황" description={description}>
      <div className="space-y-5">
        <section className="grid gap-5 xl:grid-cols-[330px_minmax(0,1fr)]">
          <article className="rounded-[24px] border border-white bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.07)]">
            <div className="relative mx-auto h-[104px] w-[104px] overflow-hidden rounded-full bg-[#eaf3ff] shadow-[inset_0_0_0_1px_rgba(29,80,162,0.08)]">
              <Image src="/assets/brand/bandol-full.png" alt="ICBANQ 반돌이" fill sizes="104px" className="object-contain p-2" priority />
            </div>
            <div className="mt-4 text-center">
              <p className="text-[18px] font-[950] tracking-[-0.02em] text-[#10203f]">{selectedUser.name}님</p>
              <p className="mt-1 text-[12px] font-[800] text-[#64748b]">{selectedUser.role === "VIPS" ? "VIPS 담당자" : "SALES 담당자"}</p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-[16px] bg-[#f5f9ff] px-4 py-3 text-center">
                <p className="text-[11px] font-[900] text-[#64748b]">내 요청</p>
                <p className="mt-1 text-[22px] font-[950] text-[#10203f]">{ownCount}</p>
              </div>
              <div className="rounded-[16px] bg-[#edf4ff] px-4 py-3 text-center">
                <p className="text-[11px] font-[900] text-[#1D50A2]">배정 업무</p>
                <p className="mt-1 text-[22px] font-[950] text-[#1D50A2]">{assignedCount}</p>
              </div>
            </div>
          </article>

          <article className="rounded-[24px] border border-white bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.07)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-[18px] font-[950] tracking-[-0.02em] text-[#10203f]">요청 처리 보드</h2>
                <p className="mt-1 text-[12px] font-[750] text-[#64748b]">접수부터 완료/반려까지 현재 업무 흐름을 한눈에 확인합니다.</p>
              </div>
              <span className="rounded-full bg-[#1D50A2] px-4 py-2 text-[12px] font-[950] text-white">총 {visibleItems.length}건</span>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-4">
              {([
                ["접수", counts.received, "received"],
                ["처리중", counts.processing, "processing"],
                ["완료", counts.done, "done"],
                ["반려", counts.rejected, "rejected"]
              ] as const).map(([label, value, bucket]) => (
                <article key={bucket} className="rounded-[18px] border border-[#e6edf7] bg-[#fbfdff] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[12px] font-[900] text-[#64748b]">{label}</p>
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-[900] ${bucketStyles[bucket]}`}>{bucketLabels[bucket]}</span>
                  </div>
                  <p className="mt-5 text-[30px] font-[950] tracking-[-0.04em] text-[#10203f]">{value}건</p>
                </article>
              ))}
            </div>
          </article>
        </section>

        <section className="rounded-[24px] border border-white bg-white p-5 shadow-[0_18px_42px_rgba(15,23,42,0.07)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[18px] font-[950] tracking-[-0.02em] text-[#10203f]">요청 목록</h2>
              <p className="mt-1 text-[12px] font-[750] text-[#64748b]">
                {isAdminAll ? "VIPS 운영에서 선택한 조건의 요청입니다." : "내 요청과 배정받은 요청만 표시됩니다."}
              </p>
            </div>
            <span className="rounded-full bg-[#edf4ff] px-4 py-2 text-[12px] font-[950] text-[#1D50A2]">총 {visibleItems.length}건</span>
          </div>

          <div className="mt-5 grid grid-cols-[minmax(0,1.15fr)_minmax(110px,0.75fr)_minmax(120px,0.8fr)_150px_120px_minmax(0,1fr)] rounded-[16px] bg-[#f3f8ff] px-4 py-3 text-[12px] font-[900] text-[#64748b]">
            <span>요청 종류</span>
            <span>요청자</span>
            <span>배정담당자</span>
            <span>요청일시</span>
            <span>상태</span>
            <span>처리결과</span>
          </div>

          {loading ? (
            <div className="mt-3 rounded-[18px] bg-[#f8fbff] px-4 py-12 text-center text-[13px] font-[750] text-[#64748b]">요청 현황을 불러오는 중입니다.</div>
          ) : visibleItems.length === 0 ? (
            <div className="mt-3 rounded-[18px] bg-[#f8fbff] px-4 py-12 text-center text-[13px] font-[750] text-[#64748b]">조건에 해당하는 요청이 없습니다.</div>
          ) : (
            <div className="mt-3 space-y-2.5">
              {visibleItems.map((item) => {
                const bucket = requestBucket(item.status);
                return (
                  <button
                    key={item.id}
                    onClick={() => setDetailRequest(item)}
                    className="grid w-full grid-cols-[minmax(0,1.15fr)_minmax(110px,0.75fr)_minmax(120px,0.8fr)_150px_120px_minmax(0,1fr)] items-center rounded-[16px] border border-[#e8eef8] bg-white px-4 py-4 text-left text-[13px] shadow-[0_5px_16px_rgba(15,23,42,0.035)] transition hover:-translate-y-0.5 hover:border-[#cddff8] hover:shadow-[0_12px_30px_rgba(23,105,232,0.09)]"
                  >
                    <span className="min-w-0">
                      <b className="block truncate text-[14px] font-[950] text-[#10203f]">{kindLabel(item.kind, item.type)}</b>
                      <span className="mt-1 block truncate text-[11px] font-[750] text-[#94a3b8]">{item.id}</span>
                    </span>
                    <span className="truncate font-[800] text-[#64748b]">{item.requester}</span>
                    <span className="truncate font-[900] text-[#1D50A2]">{(item.assignedOwners ?? []).join(", ") || "-"}</span>
                    <span className="font-[800] text-[#64748b]">{item.requestedAt}</span>
                    <span className={`w-fit rounded-full border px-3 py-1 text-[12px] font-[900] ${bucketStyles[bucket]}`}>{bucketLabels[bucket]}</span>
                    <span className="truncate font-[800] text-[#10203f]">{item.result || "처리 결과 대기"}</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>
      <RequestDetailModal
        request={detailRequest}
        canProcess={canProcessDetail}
        onClose={() => setDetailRequest(null)}
        onUpdated={(nextRequest) => {
          setItems((current) => current.map((item) => (item.id === nextRequest.id ? nextRequest : item)));
          setDetailRequest(nextRequest);
        }}
      />
    </ModulePage>
  );
}

