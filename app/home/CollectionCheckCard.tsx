"use client";

import { useEffect, useState } from "react";
import { Banknote, CreditCard, WalletCards } from "lucide-react";
import { useSelectedUser } from "../hooks/useSelectedUser";
import { buildCollectionIssues, buildCollectionSummary, filterReceivablesByUser, formatKrwShort, receivableRecords } from "../services/receivables";
import { toneClass } from "./homeData";

const ACTION_STATUS_KEY = "icbanq.ops.collectionActionStatus";

export function CollectionCheckCard() {
  const { selectedUser } = useSelectedUser();
  const [checkedIssueIds, setCheckedIssueIds] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => {
      try {
        const raw = window.localStorage.getItem(ACTION_STATUS_KEY);
        const statuses = raw ? JSON.parse(raw) as Record<string, { status?: string }> : {};
        setCheckedIssueIds(Object.entries(statuses).filter(([, value]) => value.status === "checked").map(([key]) => key));
      } catch {
        setCheckedIssueIds([]);
      }
    };

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("icbanq:collection-action-change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("icbanq:collection-action-change", sync);
    };
  }, []);

  const visibleRecords = filterReceivablesByUser(receivableRecords, selectedUser);
  const summary = buildCollectionSummary(visibleRecords);
  const issues = buildCollectionIssues(visibleRecords).filter((issue) => !checkedIssueIds.includes(issue.id));
  const partialCount = issues.filter((issue) => issue.issueType === "partial_payment").length;
  const unmatchedCount = issues.filter((issue) => issue.issueType === "unmatched_payment").length;
  const collectionItems = [
    { label: "수금 확인 필요", count: `${issues.length}건`, sub: formatKrwShort(summary.unpaidAmount), icon: WalletCards, tone: "blue" },
    { label: "수금매칭 보류", count: `${partialCount}건`, sub: "부분입금 확인", icon: Banknote, tone: "purple" },
    { label: "입금매칭 오류", count: `${unmatchedCount}건`, sub: "입금자명 확인", icon: CreditCard, tone: "red" }
  ];

  return (
    <section className="min-w-0 overflow-hidden rounded-[22px] border border-[#e5eaf3] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate text-[22px] font-[950] tracking-[-0.02em] text-[#111827]">수금 체크</h2>
          <p className="mt-1 truncate text-[13px] font-[700] text-[#64748b]">입금확인, 수금매칭, AR 보류 건을 확인합니다.</p>
        </div>
        <span className="shrink-0 rounded-full bg-[#eef6ff] px-3 py-1 text-[12px] font-[950] text-[#2563eb]">수금 이슈</span>
      </div>
      <div className="mt-4 grid min-w-0 grid-cols-3 gap-3">
        {collectionItems.map((item) => (
          <div key={item.label} className="h-[112px] min-w-0 overflow-hidden rounded-[18px] border border-[#edf1f6] bg-[#fbfcff] p-3 shadow-[0_8px_18px_rgba(15,23,42,0.035)]">
            <span className={`flex h-9 w-9 items-center justify-center rounded-full ${toneClass(item.tone)}`}><item.icon size={18} /></span>
            <p className="mt-2 truncate text-[12px] font-[900] text-[#475569]">{item.label}</p>
            <p className="mt-1 truncate text-[28px] font-[950] leading-none tracking-[-0.03em] text-[#111827]">{item.count}</p>
            <p className="mt-1 truncate text-[11px] font-[800] text-[#64748b]">{item.sub}</p>
          </div>
        ))}
      </div>
      <button onClick={() => (window.location.href = "/collections")} className="mt-4 h-[40px] w-full rounded-[14px] border border-[#cfe2ff] bg-[#eef6ff]/85 text-[13px] font-[950] text-[#2563eb] shadow-[0_8px_18px_rgba(37,99,235,0.06)] transition hover:bg-[#e3f0ff]">
        수금관리 바로가기
      </button>
    </section>
  );
}
