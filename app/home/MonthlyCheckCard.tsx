"use client";

import { monthlyItems, toneClass } from "./homeData";

export function MonthlyCheckCard() {
  return (
    <section className="min-w-0 overflow-hidden rounded-[20px] border border-[#e5eaf3] bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.045)]">
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate text-[18px] font-[950] tracking-[-0.02em] text-[#111827]">월마감 체크</h2>
          <p className="mt-1 truncate text-[12px] font-[750] text-[#64748b]">계산서, 출고, Deduct 등 마감 전 확인할 거래입니다.</p>
        </div>
        <span className="shrink-0 rounded-full bg-[#fff0ef] px-3 py-1 text-[12px] font-[950] text-[#ef4444]">6건</span>
      </div>

      <div className="mt-3 grid min-w-0 grid-cols-4 gap-2">
        {monthlyItems.map((item) => (
          <div key={item.label} className="h-[100px] min-w-0 overflow-hidden rounded-[16px] border border-[#edf1f6] bg-[#fbfcff] p-3 shadow-[0_6px_14px_rgba(15,23,42,0.035)]">
            <span className={`flex h-8 w-8 items-center justify-center rounded-full ${toneClass(item.tone)}`}>
              <item.icon size={16} />
            </span>
            <p className="mt-2 truncate text-[12px] font-[900] text-[#475569]">{item.label}</p>
            <p className="mt-1 truncate text-[24px] font-[950] leading-none tracking-[-0.03em] text-[#111827]">{item.count}</p>
            <p className="mt-0.5 truncate text-[10px] font-[800] text-[#64748b]">{item.amount}</p>
          </div>
        ))}
      </div>

      <button onClick={() => (window.location.href = "/month-end")} className="mt-3 h-[38px] w-full rounded-[14px] border border-[#ffd7d4] bg-[#fff0ef]/80 text-[13px] font-[950] text-[#e13d35] shadow-[0_8px_18px_rgba(239,68,68,0.06)] transition hover:bg-[#ffe7e4]">
        월마감 점검하기
      </button>
    </section>
  );
}
