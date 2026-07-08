"use client";

import { monthlyItems } from "./homeData";

export function MonthlyCheckCard() {
  const hasCount = (value: string) => Number(value.replace(/[^0-9]/g, "")) > 0;

  return (
    <section className="min-w-0 overflow-hidden rounded-[20px] border border-[#e9eef6] bg-white p-4 shadow-[0_6px_16px_rgba(15,23,42,0.032)]">
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate text-[18px] font-[950] tracking-[-0.02em] text-[#111827]">월마감 체크</h2>
          <p className="mt-1 truncate text-[12px] font-[750] text-[#64748b]">계산서, 출고, Deduct 등 마감 전 확인할 거래입니다.</p>
        </div>
        <span className="shrink-0 rounded-full bg-[#fff5ec] px-3 py-1 text-[12px] font-[950] text-[#F39945]">6건</span>
      </div>

      <div className="mt-3 grid min-w-0 grid-cols-2 gap-2 min-[1180px]:grid-cols-4">
        {monthlyItems.map((item) => (
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
            <p className={`mt-0.5 truncate text-[21px] font-[900] leading-none tracking-[-0.02em] ${item.tone === "needCheck" ? "text-[#F39945]" : "text-[#111827]"}`}>
              {item.count}
            </p>
            <p className="mt-1 truncate text-[9.5px] font-[650] leading-none text-[#64748b]">{item.amount}</p>
          </div>
        ))}
      </div>

      <button onClick={() => (window.location.href = "/month-end")} className="mt-3 h-[38px] w-full rounded-[14px] border border-[#e9eef6] bg-[#f8fbff] text-[13px] font-[950] text-[#1D50A2] shadow-[0_4px_10px_rgba(15,23,42,0.025)] transition hover:bg-[#edf4ff]">
        월마감 점검하기
      </button>
    </section>
  );
}

