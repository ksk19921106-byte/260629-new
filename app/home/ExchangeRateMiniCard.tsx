"use client";

export type MiniExchangeRate = {
  rate?: number;
  baseDate?: string;
  isLive: boolean;
  sourceLabel?: string;
};

export function ExchangeRateMiniCard({ exchange }: { exchange: MiniExchangeRate }) {
  const rateText = exchange.rate ? `${exchange.rate.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}원` : "로딩 중";
  return (
    <section className="h-[168px] min-w-0 overflow-hidden rounded-[20px] border border-[#e5eaf3] bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-[950] text-[#111827]">환율 정보</h2>
        <span className="text-[11px] font-[750] text-[#94a3b8]">{exchange.baseDate ?? ""}</span>
      </div>
      <p className="mt-4 text-[13px] font-[850] text-[#475569]">USD/KRW</p>
      <p className="mt-1 truncate text-[29px] font-[950] leading-tight tracking-[-0.03em] text-[#111827]">{rateText}</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-[12px] font-[800] text-[#2563eb]">전일대비 ▲0.17%</p>
        <p className="truncate text-[10px] font-[750] text-[#94a3b8]">{exchange.sourceLabel ?? ""}</p>
      </div>
    </section>
  );
}
