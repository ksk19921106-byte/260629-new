"use client";

import type { RequestKind } from "../services/formValidation";
import { quickRequests, toneClass } from "./homeData";

export function QuickRequestSection({ onSelectRequestKind }: { onSelectRequestKind: (kind: RequestKind) => void }) {
  return (
    <section className="h-[188px] min-w-0 overflow-hidden rounded-[20px] border border-[#e5eaf3] bg-white p-[18px] shadow-[0_10px_24px_rgba(15,23,42,0.045)]">
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-[950] text-[#111827]">VIPS팀 요청 바로가기</h2>
        <button onClick={() => (window.location.href = "/requests")} className="rounded-full border border-[#e7ecf4] px-3 py-1.5 text-[11px] font-[900] text-[#34496b]">전체 메뉴</button>
      </div>
      <div className="mt-3 grid min-w-0 grid-cols-4 gap-2">
        {quickRequests.map((item) => (
          <button key={item.kind} onClick={() => onSelectRequestKind(item.kind)} className="flex h-[108px] min-w-0 flex-col items-center justify-center overflow-hidden rounded-[16px] border border-[#edf1f6] bg-white text-center shadow-[0_8px_18px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-[#cbdaf5]">
            <span className={`flex h-9 w-9 items-center justify-center rounded-full ${toneClass(item.tone)}`}><item.icon size={18} /></span>
            <span className="mt-2 whitespace-pre-line text-[11px] font-[900] leading-[15px] text-[#111827]">{item.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
