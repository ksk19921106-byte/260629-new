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

const samplePaste = `TEAM\tFSales / ISales\tCompany\tBilling\tGPD\tGP\t출고소요기간\tTAX발행기간\t지연AR(A)\tDeduct(A)\t입고O/출고X/계산서O\t출고O/계산서X\t입고O/출고X/계산서X\t세일즈 미출고
영업1팀\tTommy_G / Harvey\tOO프로젝트\t1,429,024\t1,300,000\t129,024\t4\t2\t1,429,024\t0\t0\t0\t0\t0
영업1팀\tTommy_G / Morgan\t재일전자\t1,761,433\t1,600,000\t161,433\t15\t26\t0\t0\t0\t1,761,433\t0\t0
영업1팀\tTommy_G / Eric\t동양부품\t75,000\t70,000\t5,000\t8\t0\t0\t0\t0\t0\t75,000\t1
영업3팀\tTommy / Tommy\t하이테크\t5,252,933\t5,000,000\t252,933\t18\t0\t0\t75,000\t5,252,933\t0\t0\t0`;

const filterOptions: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "전체" },
  { key: "mine", label: "내 권한 범위" },
  { key: "invoice_required", label: "계산서 발행 필요" },
  { key: "shipment_check", label: "출고 확인 필요" },
  { key: "collection_check", label: "수금 확인 필요" },
  { key: "deduct_check", label: "차감/공제 확인 필요" },
  { key: "long_pending", label: "장기 미진행 거래" },
  { key: "sales_unshipped", label: "세일즈 미출고" }
];

const priorityClass = {
  high: "border-[#ffd0cb] bg-[#fff0ef] text-[#dc2626]",
  medium: "border-[#ffe3b5] bg-[#fff7e8] text-[#d97706]",
  low: "border-[#dbe7ff] bg-[#f1f5ff] text-[#2563eb]"
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
    collectionCheck: count("collection_check"),
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
  const [message, setMessage] = useState(isAdmin ? "ERP 표 데이터를 붙여넣고 데이터 인식하기를 눌러주세요." : "VIPS팀이 업로드한 최신 월마감 데이터를 불러오는 중입니다.");
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

  const allIssues = isAdmin ? recognizedIssues.length > 0 ? recognizedIssues : snapshot?.issues ?? [] : snapshot?.issues ?? [];

  const permissionIssues = useMemo(() => {
    if (isAdmin) return allIssues;
    if (isManager) return allIssues.filter((issue) => issue.fSales === selectedUser.salesName);
    return allIssues.filter((issue) => issue.iSales === selectedUser.salesName);
  }, [allIssues, isAdmin, isManager, selectedUser.salesName]);

  const filteredIssues = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return permissionIssues.filter((issue) => {
      const matchFilter = filter === "all" || filter === "mine" || issue.issueType === filter;
      const matchQuery =
        !keyword ||
        issue.company.toLowerCase().includes(keyword) ||
        issue.fSales.toLowerCase().includes(keyword) ||
        issue.iSales.toLowerCase().includes(keyword);
      return matchFilter && matchQuery;
    });
  }, [filter, permissionIssues, query]);

  const kpi = useMemo(() => kpiFor(permissionIssues), [permissionIssues]);
  const salesGroups = useMemo(() => groupBySales(permissionIssues), [permissionIssues]);

  const recognizeData = (text = pasteText) => {
    const uploadedAt = new Date().toISOString();
    const result = parseClosingPaste(text, selectedUser.name, uploadedAt);
    setMessage(result.message);
    setMessageType(result.ok ? "success" : "error");
    setRecognizedIssues(result.ok ? result.issues : []);
    if (result.ok) {
      setFilter("all");
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
      setMessage(`저장 완료: ${recognizedIssues.length}건의 확인 필요 이슈가 영업별로 배포되었습니다. 다른 계정에서도 권한에 맞게 조회됩니다.`);
      setMessageType("success");
    } catch {
      setMessage("브라우저에는 저장됐지만 서버 저장 파일에는 반영하지 못했습니다. 로컬 개발 서버가 켜져 있는지 확인해주세요.");
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
    setQuery("");
    setMessage("ERP 표 데이터를 붙여넣고 데이터 인식하기를 눌러주세요.");
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
            <div className="flex items-center gap-2 text-[#2563eb]">
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
            <p className="text-[11px] font-[800] text-[#2563eb]">{selectedUser.accessRole.toUpperCase()} · {selectedUser.salesName}</p>
          </div>
        </div>

        {snapshot ? (
          <div className="mt-4 rounded-[16px] border border-[#e5eaf3] bg-[#fbfdff] px-4 py-3 text-[12px] font-[800] text-[#64748b]">
            최신 저장 데이터: {snapshot.closingMonth} · 업로드 {new Date(snapshot.uploadedAt).toLocaleString("ko-KR")} · 업로드 담당 {snapshot.uploadedBy}
          </div>
        ) : null}
      </section>

      {isAdmin ? (
        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <article className="ops-card min-w-0 overflow-hidden p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-[950] uppercase tracking-[0.08em] text-[#2563eb]">ERP PASTE PARSER</p>
                <h3 className="mt-1 text-[22px] font-[950] tracking-[-0.02em] text-[#111827]">ERP 표 복사 붙여넣기</h3>
                <p className="mt-1 text-[13px] font-[700] text-[#64748b]">VIPS팀/Admin만 전체 월마감 데이터를 저장할 수 있습니다.</p>
              </div>
              <button type="button" onClick={loadSample} className="rounded-full bg-[#f3f7ff] px-3 py-1.5 text-[11px] font-[900] text-[#2563eb]">
                샘플 넣기
              </button>
            </div>
            <textarea
              value={pasteText}
              onChange={(event) => setPasteText(event.target.value)}
              placeholder="ERP 월마감 화면에서 표 영역을 복사한 뒤 여기에 붙여넣으세요."
              className="mt-4 h-[220px] w-full resize-none rounded-[16px] border border-[#e5eaf3] bg-[#fbfdff] p-4 text-[13px] font-[700] leading-6 text-[#10203f] outline-none placeholder:text-[#94a3b8] focus:border-[#2563eb]"
            />
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => recognizeData()} className="ops-btn-primary inline-flex h-10 items-center gap-2 px-4 text-[13px]">
                <ClipboardPaste size={16} />
                데이터 인식하기
              </button>
              <button type="button" onClick={saveRecognizedData} className="ops-btn-danger inline-flex h-10 items-center gap-2 px-4 text-[13px]">
                <Save size={16} />
                저장하기
              </button>
              <button type="button" onClick={resetData} className="ops-btn-secondary inline-flex h-10 items-center gap-2 px-4 text-[13px]">
                <Eraser size={16} />
                초기화
              </button>
            </div>
            <p className={`mt-3 rounded-xl px-4 py-3 text-[12px] font-[850] ${
              messageType === "success" ? "bg-[#ecfdf5] text-[#047857]" : messageType === "error" ? "bg-[#fff0ef] text-[#dc2626]" : "bg-[#f8fbff] text-[#475569]"
            }`}>
              {message}
            </p>
          </article>

          <article className="ops-card min-w-0 overflow-hidden bg-[linear-gradient(135deg,#fff7f3,#f7fbff)] p-4">
            <div className="flex items-center gap-2 text-[#dc2626]">
              <AlertCircle size={18} />
              <p className="text-[12px] font-[950] uppercase tracking-[0.08em]">배포 구조</p>
            </div>
            <h3 className="mt-3 text-[22px] font-[950] text-[#111827]">전체 업로드 후 권한별 조회</h3>
            <p className="mt-2 text-[13px] font-[750] leading-6 text-[#64748b]">
              영업이 각자 데이터를 올리는 구조가 아닙니다. VIPS팀/Admin이 전체 ERP 데이터를 1회 저장하면, 팀장은 FSales 기준으로, 영업은 ISales 기준으로 본인 데이터만 확인합니다.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <InfoTile label="Admin" value="전체 조회" />
              <InfoTile label="팀장/FSales" value="하위 ISales" />
              <InfoTile label="영업/ISales" value="본인 건만" />
              <InfoTile label="저장 단위" value="월마감 Snapshot" />
            </div>
          </article>
        </section>
      ) : (
        <section className="ops-card bg-[linear-gradient(135deg,#fff7f3,#f7fbff)] p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 text-[#dc2626]" size={20} />
            <div>
              <h3 className="text-[18px] font-[950] text-[#111827]">업로드 영역은 VIPS팀/Admin 전용입니다.</h3>
              <p className="mt-1 text-[13px] font-[750] text-[#64748b]">
                영업 사용자는 VIPS팀/Admin이 마지막으로 저장한 월마감 데이터 중 본인에게 해당하는 이슈만 조회합니다.
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <KpiCard label="확인 필요 거래" value={`${kpi.totalCount}건`} tone="bg-[#fff0ef] text-[#dc2626]" />
        <KpiCard label="총 확인 필요 금액" value={formatKrw(kpi.totalAmount)} tone="bg-[#fff7e8] text-[#d97706]" />
        <KpiCard label="계산서 발행 필요" value={`${kpi.invoiceRequired}건`} tone="bg-[#f1f5ff] text-[#2563eb]" />
        <KpiCard label="출고 확인 필요" value={`${kpi.shipmentCheck}건`} tone="bg-[#ecfeff] text-[#0891b2]" />
        <KpiCard label="수금 확인 필요" value={`${kpi.collectionCheck}건`} tone="bg-[#eef6ff] text-[#2563eb]" />
        <KpiCard label="차감/공제 확인" value={`${kpi.deductCheck}건`} tone="bg-[#f8fafc] text-[#475569]" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <article className="ops-card min-w-0 overflow-hidden p-4">
          <h3 className="text-[18px] font-[950] text-[#111827]">{isAdmin ? "영업별 요약" : "내 권한 범위 요약"}</h3>
          <div className="mt-4 space-y-2">
            {salesGroups.length === 0 ? (
              <p className="rounded-[16px] bg-[#f8fbff] p-4 text-[13px] font-[800] text-[#64748b]">표시할 월마감 이슈가 없습니다.</p>
            ) : (
              salesGroups.map((group) => (
                <div key={`${group.fSales}-${group.iSales}`} className="rounded-[16px] border border-[#e7ecf4] bg-[#fbfdff] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[15px] font-[950] text-[#111827]">{group.fSales} / {group.iSales}</p>
                    <p className="rounded-full bg-[#fff0ef] px-3 py-1 text-[12px] font-[950] text-[#dc2626]">{group.totalCount}건</p>
                  </div>
                  <p className="mt-1 text-[12px] font-[850] text-[#64748b]">총 금액 {formatKrw(group.totalAmount)}</p>
                  <p className="mt-2 text-[12px] font-[800] text-[#475569]">
                    계산서 {group.byType.invoice_required ?? 0}건 / 수금 {group.byType.collection_check ?? 0}건 / 출고 {group.byType.shipment_check ?? 0}건
                  </p>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="ops-card min-w-0 overflow-hidden p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-[18px] font-[950] text-[#111827]">{isAdmin ? "전체 이슈 테이블" : "내 월마감 이슈"}</h3>
              <p className="mt-1 text-[12px] font-[750] text-[#64748b]">ERP 원본 컬럼이 아니라, 지금 해야 할 행동 중심으로 정리합니다.</p>
            </div>
            <div className="flex h-10 min-w-[220px] items-center gap-2 rounded-xl border border-[#dce6f3] bg-[#fbfdff] px-3">
              <Search size={15} className="text-[#94a3b8]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="거래처명, FSales, ISales 검색"
                className="min-w-0 flex-1 bg-transparent text-[12px] font-[800] text-[#10203f] outline-none placeholder:text-[#94a3b8]"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setFilter(option.key)}
                className={`h-9 rounded-full px-4 text-[12px] font-[900] transition ${
                  filter === option.key ? "bg-[#2563eb] text-white" : "border border-[#e5eaf3] bg-white text-[#475569] hover:bg-[#f8fbff]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-4 overflow-hidden rounded-[18px] border border-[#e7ecf4]">
            <div className="grid grid-cols-[76px_132px_1fr_110px_110px_108px_78px_1.2fr_142px] gap-2 bg-[#f8fbff] px-4 py-3 text-[11px] font-[950] text-[#64748b]">
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
                    className={`grid grid-cols-[76px_132px_1fr_110px_110px_108px_78px_1.2fr_142px] items-center gap-2 border-t border-[#eef2f7] px-4 py-3 text-[12px] ${
                      issue.status !== "open" ? "bg-[#f8fafc] opacity-60" : "bg-white"
                    }`}
                  >
                    <span className={`rounded-full border px-2 py-1 text-center text-[11px] font-[950] ${priorityClass[issue.priority]}`}>{priorityLabel(issue.priority)}</span>
                    <span className="truncate font-[900] text-[#111827]">{issue.issueLabel}</span>
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
                      <button type="button" onClick={() => updateIssueStatus(issue, "done")} title="확인 완료" className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ecfdf5] text-[#059669]">
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
            월마감 데이터는 VIPS팀/Admin이 전체 데이터를 저장하고, 영업은 FSales/ISales 권한에 따라 본인 범위만 확인합니다.
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
