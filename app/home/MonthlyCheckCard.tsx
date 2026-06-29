"use client";

import { monthlyItems, toneClass } from "./homeData";

export function MonthlyCheckCard() {
  return (
    <section className="min-w-0 overflow-hidden rounded-[22px] border border-[#e5eaf3] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate text-[22px] font-[950] tracking-[-0.02em] text-[#111827]">월마감 체크</h2>
          <p className="mt-1 truncate text-[13px] font-[700] text-[#64748b]">계산서, 출고, Deduct 등 월마감 전 확인할 거래입니다.</p>
        </div>
        <span className="shrink-0 rounded-full bg-[#fff0ef] px-3 py-1 text-[12px] font-[950] text-[#ef4444]">6건</span>
      </div>
      <div className="mt-4 grid min-w-0 grid-cols-4 gap-3">
        {monthlyItems.map((item) => (
          <div key={item.label} className="h-[112px] min-w-0 overflow-hidden rounded-[18px] border border-[#edf1f6] bg-[#fbfcff] p-3 shadow-[0_8px_18px_rgba(15,23,42,0.035)]">
            <span className={`flex h-9 w-9 items-center justify-center rounded-full ${toneClass(item.tone)}`}><item.icon size={18} /></span>
            <p className="mt-2 truncate text-[12px] font-[900] text-[#475569]">{item.label}</p>
            <p className="mt-1 truncate text-[28px] font-[950] leading-none tracking-[-0.03em] text-[#111827]">{item.count}</p>
            <p className="mt-1 truncate text-[11px] font-[800] text-[#64748b]">{item.amount}</p>
          </div>
        ))}
      </div>
      <button onClick={() => (window.location.href = "/month-end")} className="mt-4 h-[40px] w-full rounded-[14px] border border-[#ffd7d4] bg-[#fff0ef]/80 text-[13px] font-[950] text-[#e13d35] shadow-[0_8px_18px_rgba(239,68,68,0.06)] transition hover:bg-[#ffe7e4]">
        월마감 점검하기
      </button>
    </section>
  );
}
