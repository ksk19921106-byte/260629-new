"use client";

import { AlertTriangle } from "lucide-react";

export function GatekeeperBanner() {
  return (
    <section className="flex h-[76px] min-w-0 items-center overflow-hidden rounded-[18px] border border-[#ffe0bf] bg-[#fff8ec] px-[22px] py-[14px] shadow-[0_10px_22px_rgba(240,139,26,0.08)]">
      <div className="flex min-w-0 items-center gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#f97316] shadow-sm"><AlertTriangle size={21} /></span>
        <div className="min-w-0">
          <p className="truncate text-[16px] font-[950] text-[#111827]">월마감·수금 확인이 끝나야 VIPS팀 요청을 진행할 수 있어요.</p>
          <p className="mt-0.5 truncate text-[12px] font-[750] text-[#64748b]">요청 전, 아직 종료되지 않은 거래를 먼저 확인해주세요.</p>
        </div>
      </div>
    </section>
  );
}
