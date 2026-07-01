"use client";

import { AlertTriangle } from "lucide-react";

export function GatekeeperBanner() {
  return (
    <section className="flex h-[54px] min-w-0 items-center overflow-hidden rounded-[18px] border border-[#fecaca] bg-[#fff1f2] px-4 shadow-[0_8px_18px_rgba(239,68,68,0.055)]">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#ef4444] shadow-sm">
          <AlertTriangle size={17} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-[950] text-[#111827]">월마감 미완료시 요청이 불가합니다.</p>
          <p className="mt-0.5 truncate text-[11px] font-[750] text-[#64748b]">VIPS팀 요청 전, 아직 종료되지 않은 거래를 먼저 확인해주세요.</p>
        </div>
      </div>
    </section>
  );
}
