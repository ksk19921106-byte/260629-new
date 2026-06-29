"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, ArrowRight, Banknote, CheckCircle2, CircleDollarSign, Search, ShieldCheck, UserRound } from "lucide-react";
import { ModulePage } from "../components/ModulePage";
import { useSelectedUser } from "../hooks/useSelectedUser";
import {
  buildCollectionIssues,
  buildCollectionComposition,
  buildCollectionSummary,
  buildSalesStats,
  buildTeamStats,
  filterReceivablesByUser,
  formatKrwShort,
  normalizeSalesName,
  receivableRecords,
  type CollectionIssue,
  type ReceivableRecord
} from "../services/receivables";

type TableFilter = "all" | "completed" | "partial" | "unpaid" | "long_overdue" | "unmatched_payment";
type CollectionActionStatus = {
  issueId: string;
  status: "open" | "checked" | "request_vips";
  memo?: string;
  checkedAt?: string;
  checkedBy?: string;
};

const ACTION_STATUS_KEY = "icbanq.ops.collectionActionStatus";

const filterOptions: Array<{ key: TableFilter; label: string }> = [
  { key: "all", label: "전체" },
  { key: "completed", label: "완료" },
  { key: "partial", label: "부분수금" },
  { key: "unpaid", label: "미수" },
  { key: "long_overdue", label: "장기미수" },
  { key: "unmatched_payment", label: "입금자명 확인" }
];

const priorityStyle = {
  high: "bg-[#fff0ef] text-[#dc2626] border-[#ffd0cb]",
  medium: "bg-[#fff7e8] text-[#d97706] border-[#ffe3b5]",
  low: "bg-[#eef6ff] text-[#2563eb] border-[#cfe2ff]"
};

function priorityLabel(priority: CollectionIssue["priority"]) {
  if (priority === "high") return "높음";
  if (priority === "medium") return "보통";
  return "낮음";
}

function statusStyle(status: ReceivableRecord["status"]) {
  if (status === "완료") return "bg-[#ecfdf5] text-[#059669]";
  if (status === "부분수금") return "bg-[#fff7e8] text-[#d97706]";
  return "bg-[#fff0ef] text-[#dc2626]";
}

export default function CollectionsPage() {
  const { selectedUser } = useSelectedUser();
  const topSectionRef = useRef<HTMLElement | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<TableFilter>("all");
  const [actionStatuses, setActionStatuses] = useState<Record<string, CollectionActionStatus>>({});
  const [activeIssue, setActiveIssue] = useState<CollectionIssue | null>(null);
  const [actionMemo, setActionMemo] = useState("");
  const [highlightTop, setHighlightTop] = useState(false);
  const [showAllRows, setShowAllRows] = useState(false);
  const [assignedSales, setAssignedSales] = useState<Record<string, string>>({});

  const isAdmin = selectedUser.accessRole === "admin" || selectedUser.team === "VIPS팀";
  const recordsWithAssignments = useMemo(
    () => receivableRecords.map((record) => ({ ...record, sales: assignedSales[record.id] ?? record.sales })),
    [assignedSales]
  );
  const visibleRecords = useMemo(() => filterReceivablesByUser(recordsWithAssignments, selectedUser), [recordsWithAssignments, selectedUser]);
  const summary = useMemo(() => buildCollectionSummary(visibleRecords), [visibleRecords]);
  const composition = useMemo(() => buildCollectionComposition(visibleRecords), [visibleRecords]);
  const unmappedRecords = useMemo(() => recordsWithAssignments.filter((record) => !normalizeSalesName(record.sales)), [recordsWithAssignments]);
  const mappedRecordsCount = useMemo(() => recordsWithAssignments.filter((record) => Boolean(normalizeSalesName(record.sales))).length, [recordsWithAssignments]);
  const allIssues = useMemo(() => buildCollectionIssues(visibleRecords), [visibleRecords]);
  const openIssues = useMemo(
    () => allIssues.filter((issue) => actionStatuses[issue.id]?.status !== "checked"),
    [actionStatuses, allIssues]
  );
  const checkedCount = allIssues.filter((issue) => actionStatuses[issue.id]?.status === "checked").length;
  const todayTotal = allIssues.length;
  const todayProgress = todayTotal > 0 ? Math.round((checkedCount / todayTotal) * 100) : 100;
  const partialCount = composition.partialRecords.length;
  const collectionScore = Math.max(
    0,
    100 -
      (summary.unpaidAmount > 0 ? 20 : 0) -
      (summary.longOverdueCount > 0 ? 20 : 0) -
      (partialCount > 0 ? 10 : 0) -
      (openIssues.length > 0 ? 10 : 0)
  );
  const scoreLabel = collectionScore >= 90 ? "Healthy" : collectionScore >= 70 ? "Attention" : "Risk";

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(ACTION_STATUS_KEY);
      if (raw) setActionStatuses(JSON.parse(raw) as Record<string, CollectionActionStatus>);
    } catch {
      setActionStatuses({});
    }
  }, []);

  const saveActionStatuses = (next: Record<string, CollectionActionStatus>) => {
    setActionStatuses(next);
    try {
      window.localStorage.setItem(ACTION_STATUS_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("icbanq:collection-action-change"));
    } catch {
      // Local UI still updates even when browser storage is unavailable.
    }
  };

  const visibleRecordRows = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return visibleRecords.filter((record) => {
      const matchFilter =
        filter === "all" ||
        (filter === "completed" && record.status === "완료") ||
        (filter === "partial" && record.status === "부분수금") ||
        (filter === "unpaid" && record.status === "미수") ||
        (filter === "long_overdue" && record.status !== "완료" && record.overdueDays >= 30) ||
        (filter === "unmatched_payment" && record.gubun === "신규매칭");
      const matchKeyword =
        !keyword ||
        record.name.toLowerCase().includes(keyword) ||
        record.sales.toLowerCase().includes(keyword) ||
        normalizeSalesName(record.sales).toLowerCase().includes(keyword);
      return matchFilter && matchKeyword;
    });
  }, [filter, query, visibleRecords]);
  const displayedRecordRows = showAllRows ? visibleRecordRows : visibleRecordRows.slice(0, 10);

  const teamStats = useMemo(() => buildTeamStats(recordsWithAssignments), [recordsWithAssignments]);
  const salesStats = useMemo(() => buildSalesStats(recordsWithAssignments), [recordsWithAssignments]);
  const highValue = useMemo(
    () => recordsWithAssignments.filter((record) => record.status !== "완료" && record.diff >= 1000000).sort((a, b) => b.diff - a.diff),
    [recordsWithAssignments]
  );
  const agingRows = useMemo(() => {
    const buckets = ["7일이내", "14일이내", "21일이내", "30일이내", "30일초과"];
    return buckets.map((bucket) => {
      const records = recordsWithAssignments.filter((record) => record.status !== "완료" && record.agingBucket === bucket);
      return {
        bucket,
        count: records.length,
        amount: records.reduce((sum, record) => sum + record.diff, 0)
      };
    });
  }, [recordsWithAssignments]);

  const issueActionLabel = (issue: CollectionIssue) => issue.actionLabel;

  const completeIssue = (issue: CollectionIssue, status: CollectionActionStatus["status"] = "checked") => {
    const next = {
      ...actionStatuses,
      [issue.id]: {
        issueId: issue.id,
        status,
        memo: actionMemo,
        checkedAt: new Date().toISOString(),
        checkedBy: selectedUser.name
      }
    };
    saveActionStatuses(next);
    setActionMemo("");
    setActiveIssue(null);
  };

  const focusTopIssue = () => {
    topSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setHighlightTop(true);
    window.setTimeout(() => setHighlightTop(false), 1400);
  };

  const assignSales = (record: ReceivableRecord) => {
    const nextSales = window.prompt(`${record.name} 담당자를 입력해주세요.`, record.fSales || "");
    if (!nextSales?.trim()) return;
    setAssignedSales((current) => ({ ...current, [record.id]: nextSales.trim() }));
  };

  return (
    <ModulePage
      eyebrow="COLLECTION ACTION CENTER"
      title="수금관리"
      description="입금확인, 수금매칭, 미수금 이슈를 한 곳에서 확인합니다."
    >
      <div className="space-y-5">
        <section className="rounded-[28px] border border-[#dce6f3] bg-[linear-gradient(135deg,#ffffff_0%,#f5f9ff_52%,#fff7f3_100%)] p-6 shadow-[0_16px_34px_rgba(15,23,42,0.065)]">
          <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
            <div>
              <div className="flex items-center gap-2 text-[#2563eb]">
                <ShieldCheck size={18} />
                <p className="text-[12px] font-[950] uppercase tracking-[0.08em]">{isAdmin ? "ADMIN COLLECTION VIEW" : "MY COLLECTION VIEW"}</p>
              </div>
              <h2 className="mt-3 text-[30px] font-[950] leading-tight tracking-[-0.03em] text-[#111827]">
                {isAdmin
                  ? `Sally님, 전체 수금 확인 필요 건이 ${openIssues.length}건 있습니다.`
                  : `${selectedUser.name}님, 오늘 확인해야 할 수금이 ${openIssues.length}건 있습니다.`}
              </h2>
              <p className="mt-2 text-[14px] font-[750] text-[#64748b]">
                미수, 부분수금, 입금자명 매칭 이슈를 우선순위대로 정리했습니다.
              </p>
              <button
                type="button"
                onClick={focusTopIssue}
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-2xl bg-[#111827] px-5 text-[14px] font-[950] text-white shadow-[0_12px_22px_rgba(15,23,42,0.16)] transition hover:-translate-y-0.5"
              >
                지금 확인하기
                <ArrowRight size={17} />
              </button>
            </div>
            <div className="rounded-[22px] border border-white/80 bg-white/86 p-5 shadow-sm">
              <p className="text-[12px] font-[900] text-[#64748b]">오늘의 Collection Score</p>
              <div className="mt-3 flex items-end justify-between gap-3">
                <p className="text-[48px] font-[950] leading-none tracking-[-0.05em] text-[#111827]">{collectionScore}<span className="text-[20px]">점</span></p>
                <span className={`rounded-full px-3 py-1 text-[12px] font-[950] ${scoreLabel === "Healthy" ? "bg-[#ecfdf5] text-[#059669]" : scoreLabel === "Attention" ? "bg-[#fff7e8] text-[#d97706]" : "bg-[#fff0ef] text-[#dc2626]"}`}>
                  {scoreLabel}
                </span>
              </div>
              <p className="mt-4 text-[12px] font-[800] leading-5 text-[#64748b]">현재 사용자 {selectedUser.name} · {selectedUser.accessRole.toUpperCase()}</p>
            </div>
          </div>
        </section>

        <section className={`grid gap-3 ${isAdmin ? "md:grid-cols-5" : "md:grid-cols-4"}`}>
          <KpiCard icon={AlertCircle} label="오늘 확인 필요" value={`${openIssues.length}건`} tone="red" />
          <KpiCard icon={CircleDollarSign} label="미수금" value={formatKrwShort(summary.unpaidAmount)} tone="orange" />
          <KpiCard icon={Banknote} label="수금률" value={`${summary.collectionRate}%`} tone="blue" />
          <KpiCard icon={AlertCircle} label="30일 이상 미수" value={`${summary.longOverdueCount}건`} tone="purple" />
          {isAdmin ? <KpiCard icon={UserRound} label="담당자 미매칭" value={`${unmappedRecords.length}건`} tone="slate" /> : null}
        </section>

        <section className="rounded-[24px] border border-[#dce6f3] bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-[20px] font-[950] tracking-[-0.02em] text-[#111827]">전체 수금 현황</h3>
              <p className="mt-1 text-[13px] font-[750] text-[#64748b]">
                {selectedUser.name}님의 전체 수금 대상 {composition.totalRecords}건 중 완료 {composition.completedRecords.length}건, 부분수금 {composition.partialRecords.length}건, 미수 {composition.unpaidRecords.length}건입니다.
              </p>
            </div>
            <div className="rounded-full bg-[#f8fbff] px-3 py-1.5 text-[12px] font-[900] text-[#2563eb]">완료 기준 수금률 {composition.collectionRate}%</div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <SummaryTile label="전체 수금 대상" count={`${composition.totalRecords}건`} amount={formatKrwShort(composition.totalExpected)} tone="blue" />
            <SummaryTile label="완료" count={`${composition.completedRecords.length}건`} amount={formatKrwShort(composition.completedAmount)} tone="green" />
            <SummaryTile label="부분수금" count={`${composition.partialRecords.length}건`} amount={`차액 ${formatKrwShort(composition.partialDiff)}`} tone="orange" />
            <SummaryTile label="미수" count={`${composition.unpaidRecords.length}건`} amount={formatKrwShort(composition.unpaidAmount)} tone="red" />
          </div>
          <div className="mt-4 rounded-[18px] border border-[#e7ecf4] bg-[#fbfdff] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[13px] font-[950] text-[#111827]">오늘 확인 {checkedCount} / {todayTotal} 완료</p>
              <p className="text-[12px] font-[850] text-[#64748b]">{todayProgress}%</p>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#e7ecf4]">
              <span className="block h-full rounded-full bg-[#2563eb] transition-all" style={{ width: `${todayProgress}%` }} />
            </div>
          </div>
        </section>

        {isAdmin ? <section className="rounded-[18px] border border-[#e7ecf4] bg-[#fbfdff] px-4 py-3 text-[12px] font-[800] text-[#64748b]">
          전체 {recordsWithAssignments.length}건 중 담당자 매핑 성공 {mappedRecordsCount}건 · 담당자 미매칭 {unmappedRecords.length}건 · 현재 사용자 {selectedUser.name} 기준 {visibleRecords.length}건 표시
        </section> : null}

        <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <article
            ref={topSectionRef}
            className={`min-w-0 overflow-hidden rounded-[24px] border bg-white p-5 shadow-sm transition ${
              highlightTop ? "border-[#2563eb] ring-4 ring-blue-100" : "border-[#dce6f3]"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[20px] font-[950] tracking-[-0.02em] text-[#111827]">오늘 확인해야 할 수금 TOP5</h3>
                <p className="mt-1 text-[13px] font-[750] text-[#64748b]">우선순위와 확인 이유를 기준으로 먼저 볼 거래를 정리했습니다.</p>
              </div>
              <span className="rounded-full bg-[#fff0ef] px-3 py-1 text-[12px] font-[950] text-[#dc2626]">{openIssues.length}건</span>
            </div>
            <div className="mt-4 space-y-3">
              {openIssues.slice(0, 5).length === 0 ? (
                <p className="rounded-[18px] bg-[#f8fbff] p-5 text-center text-[13px] font-[850] text-[#64748b]">오늘 확인할 수금 이슈가 없습니다.</p>
              ) : (
                openIssues.slice(0, 5).map((issue) => (
                  <div
                    key={issue.id}
                    className="w-full min-w-0 rounded-[18px] border border-[#e7ecf4] bg-[#fbfdff] p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                  >
                    <div className="flex min-w-0 items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full border px-2.5 py-1 text-[11px] font-[950] ${priorityStyle[issue.priority]}`}>{issue.priority.toUpperCase()}</span>
                          <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-[900] text-[#475569]">{issue.status}</span>
                        </div>
                        <p className="mt-2 truncate text-[17px] font-[950] text-[#111827]">{issue.company}</p>
                        <p className="mt-1 text-[12px] font-[850] text-[#64748b]">이유: {issue.reason} · 경과일 {issue.overdueDays}일</p>
                      </div>
                      <button onClick={() => { setActiveIssue(issue); setActionMemo(""); }} className="h-9 shrink-0 rounded-xl bg-[#111827] px-3 text-[12px] font-[950] text-white">
                        {issueActionLabel(issue)}
                      </button>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <MiniAmount label="예정금액" value={formatKrwShort(issue.expected)} />
                      <MiniAmount label="입금금액" value={formatKrwShort(issue.paid)} />
                      <MiniAmount label="차액" value={formatKrwShort(issue.diff)} strong />
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button onClick={() => { setActiveIssue(issue); setActionMemo(""); }} className="text-[12px] font-[900] text-[#2563eb]">
                        메모 / 완료 처리
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="min-w-0 overflow-hidden rounded-[24px] border border-[#dce6f3] bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-[20px] font-[950] tracking-[-0.02em] text-[#111827]">{isAdmin ? "전체 수금현황" : "내 전체 수금현황"}</h3>
                <p className="mt-1 text-[13px] font-[750] text-[#64748b]">완료/부분수금/미수 상태를 거래처별로 확인합니다.</p>
              </div>
              <div className="flex h-10 min-w-[230px] items-center gap-2 rounded-xl border border-[#dce6f3] bg-[#fbfdff] px-3">
                <Search size={15} className="text-[#94a3b8]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="거래처명, 담당자 검색"
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
                    filter === option.key ? "bg-[#111827] text-white" : "border border-[#e7ecf4] bg-white text-[#475569] hover:bg-[#f8fbff]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="mt-4 overflow-hidden rounded-[18px] border border-[#e7ecf4]">
              <div className="grid grid-cols-[minmax(180px,1fr)_108px_108px_108px_84px_76px_88px_112px] gap-2 bg-[#f8fbff] px-4 py-3 text-[11px] font-[950] text-[#64748b]">
                <span>거래처</span>
                <span>예정금액</span>
                <span>입금금액</span>
                <span>차액</span>
                <span>상태</span>
                <span>경과일</span>
                <span>Aging</span>
                <span>액션</span>
              </div>
              <div className="max-h-[440px] overflow-auto">
                {visibleRecordRows.length === 0 ? (
                  <p className="p-6 text-center text-[13px] font-[850] text-[#64748b]">조건에 맞는 수금 데이터가 없습니다.</p>
                ) : (
                  displayedRecordRows.map((record) => {
                    const issue = buildCollectionIssues([record])[0];
                    return (
                      <div key={record.id} className="grid grid-cols-[minmax(180px,1fr)_108px_108px_108px_84px_76px_88px_112px] items-center gap-2 border-t border-[#eef2f7] bg-white px-4 py-3 text-[12px]">
                        <div className="min-w-0">
                          <p className="truncate font-[950] text-[#111827]">{record.name}</p>
                          <p className="truncate text-[11px] font-[800] text-[#64748b]">{normalizeSalesName(record.sales) || "담당자 미매칭"} · {record.team}</p>
                        </div>
                        <span className="truncate font-[900] text-[#111827]">{formatKrwShort(record.expected)}</span>
                        <span className="truncate font-[850] text-[#475569]">{formatKrwShort(record.paid)}</span>
                        <span className="truncate font-[900] text-[#dc2626]">{formatKrwShort(record.diff)}</span>
                        <span className={`rounded-full px-2 py-1 text-center text-[11px] font-[950] ${statusStyle(record.status)}`}>{record.status}</span>
                        <span className="font-[850] text-[#64748b]">{record.overdueDays}일</span>
                        <span className="font-[850] text-[#64748b]">{record.agingBucket}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (issue) {
                              setActiveIssue(issue);
                              setActionMemo("");
                            }
                          }}
                          disabled={!issue}
                          className="h-8 rounded-lg bg-[#f3f7ff] px-2 text-[11px] font-[900] text-[#2563eb] disabled:bg-[#f8fafc] disabled:text-[#94a3b8]"
                        >
                          {issue ? issueActionLabel(issue) : "완료됨"}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            {visibleRecordRows.length > 10 ? (
              <button
                type="button"
                onClick={() => setShowAllRows((current) => !current)}
                className="mt-3 h-10 w-full rounded-xl border border-[#dce6f3] bg-[#fbfdff] text-[13px] font-[900] text-[#475569]"
              >
                {showAllRows ? "접기" : `더보기 ${visibleRecordRows.length - 10}건`}
              </button>
            ) : null}
          </article>
        </section>

        {isAdmin ? (
          <>
            <section className="rounded-[24px] border border-[#dce6f3] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-[20px] font-[950] tracking-[-0.02em] text-[#111827]">담당자 미매칭 수금건</h3>
                  <p className="mt-1 text-[13px] font-[750] text-[#64748b]">담당자_DB에 연결되지 않은 수금건입니다. 1차 버전은 화면에서 임시 지정합니다.</p>
                </div>
                <span className="rounded-full bg-[#fff0ef] px-3 py-1 text-[12px] font-[950] text-[#dc2626]">{unmappedRecords.length}건</span>
              </div>
              <div className="mt-4 overflow-hidden rounded-[18px] border border-[#e7ecf4]">
                <div className="grid grid-cols-[1fr_108px_108px_108px_82px_1fr_92px_118px] gap-2 bg-[#f8fbff] px-4 py-3 text-[11px] font-[950] text-[#64748b]">
                  <span>거래처명</span>
                  <span>예정금액</span>
                  <span>입금금액</span>
                  <span>차액</span>
                  <span>상태</span>
                  <span>매칭근거</span>
                  <span>추천 담당자</span>
                  <span>관리</span>
                </div>
                <div>
                  {unmappedRecords.length === 0 ? (
                    <p className="p-5 text-center text-[13px] font-[850] text-[#64748b]">담당자 미매칭 수금건이 없습니다.</p>
                  ) : (
                    unmappedRecords.map((record) => (
                      <div key={record.id} className="grid grid-cols-[1fr_108px_108px_108px_82px_1fr_92px_118px] items-center gap-2 border-t border-[#eef2f7] bg-white px-4 py-3 text-[12px]">
                        <span className="truncate font-[950] text-[#111827]">{record.name}</span>
                        <span className="truncate font-[900] text-[#111827]">{formatKrwShort(record.expected)}</span>
                        <span className="truncate font-[850] text-[#475569]">{formatKrwShort(record.paid)}</span>
                        <span className="truncate font-[900] text-[#dc2626]">{formatKrwShort(record.diff)}</span>
                        <span className={`rounded-full px-2 py-1 text-center text-[11px] font-[950] ${statusStyle(record.status)}`}>{record.status}</span>
                        <span className="truncate font-[800] text-[#64748b]">{record.basis ?? "-"}</span>
                        <span className="truncate font-[900] text-[#2563eb]">{record.fSales || "확인 필요"}</span>
                        <button onClick={() => assignSales(record)} className="h-8 rounded-lg bg-[#111827] px-3 text-[11px] font-[950] text-white">담당자 지정</button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
            <section className="grid gap-5 xl:grid-cols-3">
              <AdminPanel title="팀별 성과" rows={teamStats.map((row) => [`${row.label}`, `${row.rate}%`, formatKrwShort(row.remain)])} />
              <AdminPanel title="담당자별 성과" rows={salesStats.map((row) => [`${row.label}`, `${row.rate}%`, `${row.count}건`])} />
              <AdminPanel title="고액 미수" rows={highValue.slice(0, 5).map((row) => [row.name, normalizeSalesName(row.sales) || "미매칭", formatKrwShort(row.diff)])} />
              <AdminPanel title="Aging 분석" rows={agingRows.map((row) => [row.bucket, `${row.count}건`, formatKrwShort(row.amount)])} />
              <AdminPanel title="신규 매칭 검증" rows={recordsWithAssignments.filter((row) => row.gubun === "신규매칭").map((row) => [row.name, row.matched_payer ?? "-", "확인 필요"])} />
              <AdminPanel title="매칭 사전" rows={[["별칭_DB", "입금자명 학습", "준비"], ["매칭_제외", "오매칭 방지", "준비"]]} />
            </section>
          </>
        ) : null}
      </div>

      {activeIssue ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/45 px-4">
          <div className="w-full max-w-[520px] rounded-[24px] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[12px] font-[950] uppercase tracking-[0.08em] text-[#2563eb]">COLLECTION ACTION</p>
                <h3 className="mt-2 text-[24px] font-[950] tracking-[-0.02em] text-[#111827]">{activeIssue.company}</h3>
                <p className="mt-1 text-[13px] font-[800] text-[#64748b]">{activeIssue.reason}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-[12px] font-[950] ${priorityStyle[activeIssue.priority]}`}>{priorityLabel(activeIssue.priority)}</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <InfoTile label="예정금액" value={formatKrwShort(activeIssue.expected)} />
              <InfoTile label="입금금액" value={formatKrwShort(activeIssue.paid)} />
              <InfoTile label="차액" value={formatKrwShort(activeIssue.diff)} />
              <InfoTile label="경과일" value={`${activeIssue.overdueDays}일`} />
            </div>
            <label className="mt-4 block">
              <span className="text-[12px] font-[900] text-[#475569]">처리 메모</span>
              <textarea
                value={actionMemo}
                onChange={(event) => setActionMemo(event.target.value)}
                className="mt-2 h-24 w-full resize-none rounded-[16px] border border-[#dce6f3] bg-[#fbfdff] p-3 text-[13px] font-[750] outline-none focus:border-[#2563eb]"
                placeholder="확인 내용이나 후속 액션을 남겨주세요."
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setActiveIssue(null)} className="h-10 rounded-xl border border-[#dce6f3] bg-white px-4 text-[13px] font-[900] text-[#475569]">닫기</button>
              <button onClick={() => completeIssue(activeIssue, "request_vips")} className="h-10 rounded-xl bg-[#eef6ff] px-4 text-[13px] font-[950] text-[#2563eb]">
                VIPS 확인 요청
              </button>
              <button onClick={() => completeIssue(activeIssue)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#111827] px-4 text-[13px] font-[950] text-white">
                <CheckCircle2 size={16} />
                확인 완료
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ModulePage>
  );
}

function KpiCard({ icon: Icon, label, value, tone }: { icon: typeof AlertCircle; label: string; value: string; tone: "red" | "orange" | "blue" | "purple" | "slate" }) {
  const toneClass = {
    red: "bg-[#fff0ef] text-[#dc2626]",
    orange: "bg-[#fff7e8] text-[#d97706]",
    blue: "bg-[#eef6ff] text-[#2563eb]",
    purple: "bg-[#f5f3ff] text-[#7c3aed]",
    slate: "bg-[#f8fafc] text-[#475569]"
  }[tone];

  return (
    <article className="min-w-0 overflow-hidden rounded-[20px] border border-[#e7ecf4] bg-white p-4 shadow-sm">
      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${toneClass}`}>
        <Icon size={20} />
      </div>
      <p className="mt-3 text-[12px] font-[850] text-[#64748b]">{label}</p>
      <p className="mt-1 truncate text-[27px] font-[950] tracking-[-0.03em] text-[#111827]">{value}</p>
    </article>
  );
}

function SummaryTile({ label, count, amount, tone }: { label: string; count: string; amount: string; tone: "blue" | "green" | "orange" | "red" }) {
  const toneClass = {
    blue: "bg-[#eef6ff] text-[#2563eb]",
    green: "bg-[#ecfdf5] text-[#059669]",
    orange: "bg-[#fff7e8] text-[#d97706]",
    red: "bg-[#fff0ef] text-[#dc2626]"
  }[tone];

  return (
    <article className="min-w-0 overflow-hidden rounded-[18px] border border-[#e7ecf4] bg-[#fbfdff] p-4">
      <p className="text-[12px] font-[900] text-[#64748b]">{label}</p>
      <p className={`mt-3 inline-flex rounded-full px-3 py-1 text-[12px] font-[950] ${toneClass}`}>{count}</p>
      <p className="mt-3 truncate text-[19px] font-[950] tracking-[-0.02em] text-[#111827]">{amount}</p>
    </article>
  );
}

function MiniAmount({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="min-w-0 rounded-[14px] border border-[#eef2f7] bg-white px-3 py-2">
      <p className="text-[10px] font-[850] text-[#94a3b8]">{label}</p>
      <p className={`mt-1 truncate text-[12px] font-[950] ${strong ? "text-[#dc2626]" : "text-[#111827]"}`}>{value}</p>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-[#e7ecf4] bg-[#fbfdff] p-4">
      <p className="text-[11px] font-[850] text-[#64748b]">{label}</p>
      <p className="mt-1 truncate text-[17px] font-[950] text-[#111827]">{value}</p>
    </div>
  );
}

function AdminPanel({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <article className="min-w-0 overflow-hidden rounded-[22px] border border-[#dce6f3] bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <UserRound size={17} className="text-[#2563eb]" />
        <h3 className="truncate text-[17px] font-[950] text-[#111827]">{title}</h3>
      </div>
      <div className="mt-4 space-y-2">
        {rows.length === 0 ? (
          <p className="rounded-[14px] bg-[#f8fbff] p-3 text-[12px] font-[800] text-[#64748b]">표시할 데이터가 없습니다.</p>
        ) : (
          rows.map((row, index) => (
            <div key={`${title}-${index}`} className="grid grid-cols-3 gap-2 rounded-[14px] border border-[#eef2f7] bg-[#fbfdff] px-3 py-2 text-[12px] font-[850] text-[#475569]">
              <span className="truncate font-[950] text-[#111827]">{row[0]}</span>
              <span className="truncate">{row[1]}</span>
              <span className="truncate text-right">{row[2]}</span>
            </div>
          ))
        )}
      </div>
    </article>
  );
}
