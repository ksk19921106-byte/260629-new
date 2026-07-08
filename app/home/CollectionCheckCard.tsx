"use client";

import { useEffect, useState } from "react";
import { Banknote, CreditCard, WalletCards } from "lucide-react";
import { useSelectedUser } from "../hooks/useSelectedUser";
import { buildCollectionIssues, buildCollectionSummary, filterReceivablesByUser, formatKrwShort, receivableRecords } from "../services/receivables";

const ACTION_STATUS_KEY = "icbanq.ops.collectionActionStatus";

export function CollectionCheckCard() {
  const { selectedUser } = useSelectedUser();
  const [checkedIssueIds, setCheckedIssueIds] = useState<string[]>([]);
  const hasCount = (value: string) => Number(value.replace(/[^0-9]/g, "")) > 0;

  useEffect(() => {
    const sync = () => {
      try {
        const raw = window.localStorage.getItem(ACTION_STATUS_KEY);
        const statuses = raw ? (JSON.parse(raw) as Record<string, { status?: string }>) : {};
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
    { label: "수금 확인 필요", count: `${issues.length}건`, sub: formatKrwShort(summary.unpaidAmount), icon: WalletCards, status: "needCheck" },
    { label: "수금매칭 보류", count: `${partialCount}건`, sub: "부분입금 확인", icon: Banknote, status: "inProgress" },
    { label: "입금매칭 오류", count: `${unmatchedCount}건`, sub: "입금자명 확인", icon: CreditCard, status: "needCheck" }
  ];

  return (
    <section className="min-w-0 overflow-hidden rounded-[20px] border border-[#e9eef6] bg-white p-4 shadow-[0_6px_16px_rgba(15,23,42,0.032)]">
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate text-[18px] font-[950] tracking-[-0.02em] text-[#111827]">수금 체크</h2>
          <p className="mt-1 truncate text-[12px] font-[750] text-[#64748b]">입금확인, 수금매칭, AR 보류 건을 확인합니다.</p>
        </div>
        <span className="shrink-0 rounded-full bg-[#fff5ec] px-3 py-1 text-[12px] font-[950] text-[#F39945]">{issues.length}건</span>
      </div>

      <div className="mt-3 grid min-w-0 grid-cols-2 gap-2 min-[1180px]:grid-cols-3">
        {collectionItems.map((item) => (
          <div
            key={item.label}
            className={`flex h-[104px] min-w-0 flex-col justify-center overflow-hidden rounded-[16px] border bg-[#fbfcff] px-3 py-2 shadow-[0_4px_10px_rgba(15,23,42,0.022)] ${
              hasCount(item.count) ? "border-[#cbd5e1] ring-1 ring-[#e2e8f0]" : "border-[#edf2f8]"
            }`}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b]">
              <item.icon size={14} />
            </span>
            <p className="mt-1.5 truncate text-[11px] font-[800] leading-[1.2] text-[#475569]">{item.label}</p>
            <p className={`mt-0.5 truncate text-[21px] font-[900] leading-none tracking-[-0.02em] ${item.status === "needCheck" ? "text-[#F39945]" : "text-[#111827]"}`}>
              {item.count}
            </p>
            <p className="mt-1 truncate text-[9.5px] font-[650] leading-none text-[#64748b]">{item.sub}</p>
          </div>
        ))}
      </div>

      <button onClick={() => (window.location.href = "/collections")} className="mt-3 h-[38px] w-full rounded-[14px] border border-[#e9eef6] bg-[#f8fbff] text-[13px] font-[950] text-[#1D50A2] shadow-[0_4px_10px_rgba(15,23,42,0.025)] transition hover:bg-[#edf4ff]">
        수금관리 바로가기
      </button>
    </section>
  );
}

