"use client";

import { monthlyItems } from "./homeData";

export function MonthlyCheckCard() {
  return (
    <section className="min-w-0 overflow-hidden rounded-[20px] border border-[#e9eef6] bg-white p-4 shadow-[0_6px_16px_rgba(15,23,42,0.032)]">
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate text-[18px] font-[950] tracking-[-0.02em] text-[#111827]">월마감 체크</h2>
          <p className="mt-1 truncate text-[12px] font-[750] text-[#64748b]">계산서, 출고, Deduct 등 마감 전 확인할 거래입니다.</p>
        </div>
        <span className="shrink-0 rounded-full bg-[#fff1f2] px-3 py-1 text-[12px] font-[950] text-[#ef4444]">6건</span>
      </div>

      <div className="mt-3 grid min-w-0 grid-cols-4 gap-2">
        {monthlyItems.map((item) => (
          <div key={item.label} className="h-[100px] min-w-0 overflow-hidden rounded-[16px] border border-[#edf2f8] bg-[#fbfcff] p-3 shadow-[0_4px_10px_rgba(15,23,42,0.022)]">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b]">
              <item.icon size={16} />
            </span>
            <p className="mt-2 truncate text-[12px] font-[900] text-[#475569]">{item.label}</p>
            <p className={`mt-1 truncate text-[24px] font-[950] leading-none tracking-[-0.03em] ${item.tone === "needCheck" ? "text-[#ef4444]" : "text-[#111827]"}`}>
              {item.count}
            </p>
            <p className="mt-0.5 truncate text-[10px] font-[800] text-[#64748b]">{item.amount}</p>
          </div>
        ))}
      </div>

      <button onClick={() => (window.location.href = "/month-end")} className="mt-3 h-[38px] w-full rounded-[14px] border border-[#e9eef6] bg-[#f8fbff] text-[13px] font-[950] text-[#2563eb] shadow-[0_4px_10px_rgba(15,23,42,0.025)] transition hover:bg-[#eef5ff]">
        월마감 점검하기
      </button>
    </section>
  );
}
