"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, ClipboardPaste, Eraser, Save, Search, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { useSelectedUser } from "../hooks/useSelectedUser";
import {
  formatKrw,
  getIssueActionLabel,
  parseClosingPaste,
  type ClosingIssue,
  type ClosingIssueType,
  type ClosingSnapshot
} from "../services/closingPasteParser";

type FilterKey = "all" | "mine" | ClosingIssueType;

const SNAPSHOT_KEY = "icbanq.ops.monthEnd.latestSnapshot";

const samplePaste = `NO	TEAM	FSales / ISales	Company	Billing	GPD	GP	출고소요기간	TAX발행기간	지연AR(A)	Deduct(A)	입고O/출고X/계산서O	출고O/계산서X	입고O/출고X/계산서X	세일즈 미출고
1	B2D	Tommy_G / Harvey	OO전자	1,429,024	1,300,000	129,024	4	2	1,429,024	0	0	0	0	0
2	B2D	Tommy_G / Morgan	재일전자	1,761,433	1,600,000	161,433	15	26	0	0	0	1,761,433	0	0
3	B2D	Tommy_G / Eric	아이씨	75,000	70,000	5,000	8	0	0	0	0	0	75,000	1
4	S1	Tommy / Tommy	나라센서	5,252,933	5,000,000	252,933	18	0	0	75,000	5,252,933	0	0	0`;

const filterOptions: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "전체" },
  { key: "invoice_required", label: "출고O/계산서X" },
  { key: "shipment_check", label: "입고O/출고X/계산서O" },
  { key: "deduct_check", label: "Deduct 확인 필요" },
  { key: "long_pending", label: "입고O/출고X/계산서X" },
  { key: "sales_unshipped", label: "세일즈 미출고" }
];

const issueHelpText: Partial<Record<ClosingIssueType, string>> = {
  invoice_required: "고객사에 출고는 완료하였지만, 계산서 미발행 건",
  shipment_check: "입고 및 계산서 발행은 완료하였지만, 고객에게 출고되지 않은 건",
  long_pending: "입고된 건이지만, 고객에게 출고 및 계산서 발행하지 않은 건",
  deduct_check: "Deduct 금액 또는 사유 확인이 필요한 건",
  sales_unshipped: "Sales 미출고 상태로 출고 처리 확인이 필요한 건"
};

function issueDisplayLabel(type: ClosingIssueType, fallback?: string) {
  if (type === "invoice_required") return "출고O/계산서X";
  if (type === "shipment_check") return "입고O/출고X/계산서O";
  if (type === "long_pending") return "입고O/출고X/계산서X";
  if (type === "deduct_check") return "Deduct 확인 필요";
  if (type === "sales_unshipped") return "세일즈 미출고";
  return fallback ?? type;
}

const priorityClass = {
  high: "border-[#f7c999] bg-[#fff5ec] text-[#b85f18]",
  medium: "border-[#f7c999] bg-[#fff5ec] text-[#b85f18]",
  low: "border-[#dbe7ff] bg-[#edf4ff] text-[#1D50A2]"
};

function readSnapshot() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SNAPSHOT_KEY);
    return raw ? (JSON.parse(raw) as ClosingSnapshot) : null;
  } catch {
    return null;
  }
}

function writeSnapshot(snapshot: ClosingSnapshot) {
  window.localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
}

async function readServerSnapshot() {
  try {
    const response = await fetch("/api/month-end-snapshot", { cache: "no-store" });
    if (!response.ok) return null;
    const data = (await response.json()) as { snapshot?: ClosingSnapshot | null };
    return data.snapshot ?? null;
  } catch {
    return null;
  }
}

async function writeServerSnapshot(snapshot: ClosingSnapshot) {
  const response = await fetch("/api/month-end-snapshot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(snapshot)
  });

  if (!response.ok) {
    throw new Error("server snapshot save failed");
  }
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function getElapsedDays(issue: ClosingIssue) {
  return Math.max(issue.shipmentDays ?? 0, issue.taxIssueDays ?? 0);
}

function priorityLabel(priority: ClosingIssue["priority"]) {
  if (priority === "high") return "높음";
  if (priority === "medium") return "보통";
  return "낮음";
}

function kpiFor(issues: ClosingIssue[]) {
  const openIssues = issues.filter((issue) => issue.status === "open");
  const count = (type: ClosingIssueType) => openIssues.filter((issue) => issue.issueType === type).length;
  return {
    totalCount: openIssues.length,
    totalAmount: openIssues.reduce((sum, issue) => sum + issue.amount, 0),
    invoiceRequired: count("invoice_required"),
    shipmentCheck: count("shipment_check"),
    deductCheck: count("deduct_check")
  };
}

function groupBySales(issues: ClosingIssue[]) {
  const map = new Map<string, { fSales: string; iSales: string; totalCount: number; totalAmount: number; byType: Partial<Record<ClosingIssueType, number>> }>();

  for (const issue of issues) {
    const key = `${issue.fSales} / ${issue.iSales}`;
    const group = map.get(key) ?? { fSales: issue.fSales, iSales: issue.iSales, totalCount: 0, totalAmount: 0, byType: {} };
    group.totalCount += 1;
    group.totalAmount += issue.amount;
    group.byType[issue.issueType] = (group.byType[issue.issueType] ?? 0) + 1;
    map.set(key, group);
  }

  return Array.from(map.values()).sort((a, b) => b.totalCount - a.totalCount);
}

export function MonthEndPasteClient() {
  const { selectedUser } = useSelectedUser();
  const isAdmin = selectedUser.accessRole === "admin";
  const isManager = selectedUser.accessRole === "manager";
  const [pasteText, setPasteText] = useState("");
  const [recognizedIssues, setRecognizedIssues] = useState<ClosingIssue[]>([]);
  const [snapshot, setSnapshot] = useState<ClosingSnapshot | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [salesFilter, setSalesFilter] = useState("all");
  const [message, setMessage] = useState(isAdmin ? "ERP 월마감 데이터를 붙여넣고 데이터 인식하기를 눌러주세요." : "VIPS팀/Admin이 업로드한 최신 월마감 데이터를 불러오는 중입니다.");
  const [messageType, setMessageType] = useState<"info" | "success" | "error">("info");

  useEffect(() => {
    let alive = true;

    const loadLatestSnapshot = async () => {
      const browserSnapshot = readSnapshot();
      if (alive && browserSnapshot) {
        setSnapshot(browserSnapshot);
      }

      const serverSnapshot = await readServerSnapshot();
      if (!alive) return;

      const latest = serverSnapshot ?? browserSnapshot;
      setSnapshot(latest);
      if (serverSnapshot) writeSnapshot(serverSnapshot);

      if (!isAdmin) {
        setMessage(latest ? "내 거래 중 아직 월마감이 완료되지 않은 건입니다." : "아직 VIPS팀/Admin이 저장한 월마감 데이터가 없습니다.");
        setMessageType(latest ? "success" : "info");
      }
    };

    loadLatestSnapshot();

    return () => {
      alive = false;
    };
  }, [isAdmin]);

  const allIssuesRaw = isAdmin ? recognizedIssues.length > 0 ? recognizedIssues : snapshot?.issues ?? [] : snapshot?.issues ?? [];
  const allIssues = allIssuesRaw.filter((issue) => issue.issueType !== "collection_check");

  const permissionIssues = useMemo(() => {
    if (isAdmin) return allIssues;
    if (isManager) return allIssues.filter((issue) => issue.fSales === selectedUser.salesName);
    return allIssues.filter((issue) => issue.iSales === selectedUser.salesName);
  }, [allIssues, isAdmin, isManager, selectedUser.salesName]);

  const salesFilterOptions = useMemo(() => {
    const names = new Set<string>();
    for (const issue of permissionIssues) {
      if (issue.fSales) names.add(issue.fSales);
      if (issue.iSales) names.add(issue.iSales);
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [permissionIssues]);

  const filteredIssues = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return permissionIssues.filter((issue) => {
      const matchSales = salesFilter === "all" || issue.fSales === salesFilter || issue.iSales === salesFilter;
      const matchFilter = filter === "all" || filter === "mine" || issue.issueType === filter;
      const matchQuery =
        !keyword ||
        issue.company.toLowerCase().includes(keyword) ||
        issue.fSales.toLowerCase().includes(keyword) ||
        issue.iSales.toLowerCase().includes(keyword);
      return matchSales && matchFilter && matchQuery;
    });
  }, [filter, permissionIssues, query, salesFilter]);

  const metricIssues = useMemo(() => permissionIssues.filter((issue) => salesFilter === "all" || issue.fSales === salesFilter || issue.iSales === salesFilter), [permissionIssues, salesFilter]);
  const kpi = useMemo(() => kpiFor(metricIssues), [metricIssues]);
  const salesGroups = useMemo(() => groupBySales(metricIssues), [metricIssues]);

  const recognizeData = (text = pasteText) => {
    const uploadedAt = new Date().toISOString();
    const result = parseClosingPaste(text, selectedUser.name, uploadedAt);
    setMessage(result.message);
    setMessageType(result.ok ? "success" : "error");
    setRecognizedIssues(result.ok ? result.issues : []);
    if (result.ok) {
      setFilter("all");
      setSalesFilter("all");
      setQuery("");
    }
  };

  const saveRecognizedData = async () => {
    if (!recognizedIssues.length) {
      setMessage("저장할 인식 데이터가 없습니다. 먼저 데이터 인식하기를 눌러주세요.");
      setMessageType("error");
      return;
    }

    const uploadedAt = recognizedIssues[0]?.uploadedAt ?? new Date().toISOString();
    const nextSnapshot: ClosingSnapshot = {
      id: `closing-${uploadedAt}`,
      closingMonth: currentMonth(),
      uploadedAt,
      uploadedBy: selectedUser.name,
      rawText: pasteText,
      issues: recognizedIssues
    };
    writeSnapshot(nextSnapshot);
    setSnapshot(nextSnapshot);

    try {
      await writeServerSnapshot(nextSnapshot);
      setMessage(`저장 완료: 확인 필요 이슈 ${recognizedIssues.length}건이 영업별로 배포되었습니다. 다른 계정에서는 권한에 맞게 조회됩니다.`);
      setMessageType("success");
    } catch {
      setMessage("브라우저에는 저장되었지만 서버 저장 파일에는 반영하지 못했습니다. 로컬 개발 서버가 켜져 있는지 확인해주세요.");
      setMessageType("error");
    }
  };

  const loadSample = () => {
    setPasteText(samplePaste);
    recognizeData(samplePaste);
  };

  const resetData = () => {
    setPasteText("");
    setRecognizedIssues([]);
    setFilter("all");
    setSalesFilter("all");
    setQuery("");
    setMessage("ERP 월마감 데이터를 붙여넣고 데이터 인식하기를 눌러주세요.");
    setMessageType("info");
  };

  const updateIssueStatus = (issue: ClosingIssue, status: ClosingIssue["status"]) => {
    const memo = status === "open" ? issue.memo : window.prompt(status === "done" ? "확인 완료 메모를 입력해주세요." : "제외 사유를 입력해주세요.", issue.memo || "") ?? "";
    const updater = (target: ClosingIssue) => target.id === issue.id ? { ...target, status, memo } : target;

    setRecognizedIssues((prev) => prev.map(updater));
    setSnapshot((prev) => {
      if (!prev) return prev;
      const next = { ...prev, issues: prev.issues.map(updater) };
      writeSnapshot(next);
      writeServerSnapshot(next).catch(() => undefined);
      return next;
    });
  };

  const handleIssueAction = (issue: ClosingIssue) => {
    if (issue.issueType === "invoice_required") {
      window.location.href = `/requests/taxInvoice?user=${encodeURIComponent(selectedUser.name)}`;
      return;
    }
    if (issue.issueType === "collection_check") {
      window.location.href = `/collections?user=${encodeURIComponent(selectedUser.name)}`;
      return;
    }
    window.alert(`${issue.issueLabel}: ${issue.company} 확인이 필요합니다.`);
  };

  return (
    <div className="space-y-5">
      <section className="ops-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#1D50A2]">
              <ShieldCheck size={18} />
              <p className="text-[12px] font-[950] uppercase tracking-[0.08em]">
                {isAdmin ? "ADMIN UPLOAD MODE" : isManager ? "FSALES VIEW MODE" : "ISALES VIEW MODE"}
              </p>
            </div>
            <h2 className="mt-2 text-[24px] font-[950] tracking-[-0.02em] text-[#111827]">
              {isAdmin ? "ERP 월마감 데이터 업로드" : "내 월마감 체크 현황"}
            </h2>
            <p className="mt-1 text-[13px] font-[750] text-[#64748b]">
              {isAdmin
                ? "ERP 월마감 데이터를 붙여넣으면 영업별 확인 필요 거래가 자동 생성됩니다."
                : "내 거래 중 아직 월마감이 완료되지 않은 건입니다."}
            </p>
          </div>
          <div className="rounded-[16px] border border-[#e5eaf3] bg-[#f8fbff] px-4 py-3 text-right">
            <p className="text-[11px] font-[850] text-[#64748b]">현재 사용자</p>
            <p className="text-[15px] font-[950] text-[#111827]">{selectedUser.name}</p>
            <p className="text-[11px] font-[800] text-[#1D50A2]">{selectedUser.accessRole.toUpperCase()} · {selectedUser.salesName}</p>
          </div>
        </div>

        {snapshot ? (
          <div className="mt-4 rounded-[16px] border border-[#e5eaf3] bg-[#fbfdff] px-4 py-3 text-[12px] font-[800] text-[#64748b]">
            마지막 업로드 {snapshot.closingMonth} · {new Date(snapshot.uploadedAt).toLocaleString("ko-KR")} · 업로드 {snapshot.uploadedBy}
          </div>
        ) : null}
      </section>

        <section className="w-full min-w-0">
          <article className="ops-card w-full min-w-0 overflow-hidden p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-[18px] font-[950] text-[#111827]">{isAdmin ? "월마감 이슈 전체" : "내 월마감 이슈"}</h3>
              <p className="mt-1 text-[12px] font-[750] text-[#64748b]">ERP 데이터를 영업 행동 기준으로 번역해 확인이 필요한 거래만 보여줍니다.</p>
            </div>
            <div className="flex h-10 min-w-[220px] items-center gap-2 rounded-xl border border-[#dce6f3] bg-[#fbfdff] px-3">
              <Search size={15} className="text-[#94a3b8]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="거래처, FSales, ISales 검색"
                className="min-w-0 flex-1 bg-transparent text-[12px] font-[800] text-[#10203f] outline-none placeholder:text-[#94a3b8]"
              />
            </div>
          </div>

          {isAdmin ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-[16px] border border-[#e5eaf3] bg-[#fbfdff] px-3 py-3">
              <span className="text-[12px] font-[950] text-[#64748b]">담당자 필터</span>
              <select
                value={salesFilter}
                onChange={(event) => setSalesFilter(event.target.value)}
                className="h-9 rounded-full border border-[#dce6f3] bg-white px-3 text-[12px] font-[900] text-[#111827] outline-none"
              >
                <option value="all">전체 담당자</option>
                {salesFilterOptions.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setFilter(option.key)}
                title={issueHelpText[option.key as ClosingIssueType] ?? option.label}
                className={`h-9 rounded-full px-4 text-[12px] font-[900] transition ${
                  filter === option.key ? "bg-[#1D50A2] text-white" : "border border-[#e5eaf3] bg-white text-[#475569] hover:bg-[#f8fbff]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-4 overflow-x-auto rounded-[18px] border border-[#e7ecf4]">
            <div className="grid min-w-[1180px] grid-cols-[82px_170px_minmax(180px,1fr)_120px_120px_130px_90px_minmax(260px,1.4fr)_150px] gap-2 bg-[#f8fbff] px-4 py-3 text-[11px] font-[950] text-[#64748b]">
              <span>우선순위</span>
              <span>상태</span>
              <span>거래처</span>
              <span>FSales</span>
              <span>ISales</span>
              <span>금액</span>
              <span>경과일</span>
              <span>추천 행동</span>
              <span>액션</span>
            </div>
            <div className="max-h-[520px] overflow-auto">
              {filteredIssues.length === 0 ? (
                <p className="p-6 text-center text-[13px] font-[850] text-[#64748b]">조건에 맞는 이슈가 없습니다.</p>
              ) : (
                filteredIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`grid min-w-[1180px] grid-cols-[82px_170px_minmax(180px,1fr)_120px_120px_130px_90px_minmax(260px,1.4fr)_150px] items-center gap-2 border-t border-[#eef2f7] px-4 py-3 text-[12px] ${
                      issue.status !== "open" ? "bg-[#f8fafc] opacity-60" : "bg-white"
                    }`}
                  >
                    <span className={`rounded-full border px-2 py-1 text-center text-[11px] font-[950] ${priorityClass[issue.priority]}`}>{priorityLabel(issue.priority)}</span>
                    <span className="truncate font-[900] text-[#111827]" title={issueHelpText[issue.issueType] ?? issue.issueLabel}>
                      {issueDisplayLabel(issue.issueType, issue.issueLabel)}
                    </span>
                    <span className="truncate font-[850] text-[#10203f]">{issue.company}</span>
                    <span className="truncate font-[850] text-[#475569]">{issue.fSales}</span>
                    <span className="truncate font-[850] text-[#475569]">{issue.iSales}</span>
                    <span className="truncate font-[900] text-[#111827]">{formatKrw(issue.amount)}</span>
                    <span className="font-[850] text-[#64748b]">{getElapsedDays(issue)}일</span>
                    <span className="truncate font-[800] text-[#475569]">{issue.recommendedAction}</span>
                    <span className="flex gap-1.5">
                      <button type="button" onClick={() => handleIssueAction(issue)} className="ops-btn-primary h-8 px-3 text-[11px]">
                        {getIssueActionLabel(issue.issueType)}
                      </button>
                      <button type="button" onClick={() => updateIssueStatus(issue, "done")} title="확인 완료" className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf4ff] text-[#1D50A2]">
                        <CheckCircle2 size={15} />
                      </button>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-[16px] bg-[#f8fbff] px-4 py-3 text-[12px] font-[800] text-[#64748b]">
            <SlidersHorizontal size={15} />
            월마감 데이터는 VIPS/Admin이 전체 데이터를 저장하고, 영업은 FSales/ISales 권한에 따라 본인 범위만 확인합니다.
          </div>
        </article>
      </section>
    </div>
  );
}

function KpiCard({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="ops-card min-w-0 overflow-hidden p-4">
      <p className="text-[11px] font-[850] text-[#64748b]">{label}</p>
      <p className={`mt-2 truncate rounded-[14px] px-3 py-2 text-[19px] font-[950] ${tone}`}>{value}</p>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-[#e5eaf3] bg-white/85 p-4">
      <p className="text-[11px] font-[850] text-[#64748b]">{label}</p>
      <p className="mt-1 truncate text-[18px] font-[950] tracking-[-0.02em] text-[#111827]">{value}</p>
    </div>
  );
}
