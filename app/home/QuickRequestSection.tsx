"use client";

import type { RequestKind } from "../services/formValidation";
import { quickRequests, toneClass } from "./homeData";

export function QuickRequestSection({ onSelectRequestKind }: { onSelectRequestKind: (kind: RequestKind) => void }) {
  return (
    <section className="h-[148px] min-w-0 overflow-hidden rounded-[20px] border border-[#e5eaf3] bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.045)]">
      <div className="flex h-8 items-center justify-between">
        <div>
          <h2 className="text-[16px] font-[950] text-[#111827]">VIPS팀 요청 바로가기</h2>
          <p className="mt-0.5 text-[11px] font-[750] text-[#64748b]">자주 쓰는 요청만 빠르게 이동합니다.</p>
        </div>
        <button onClick={() => (window.location.href = "/requests")} className="h-8 rounded-full border border-[#e7ecf4] bg-[#f8fbff] px-3 text-[11px] font-[900] text-[#2563eb]">
          전체 메뉴
        </button>
      </div>

      <div className="mt-3 grid min-w-0 grid-cols-4 gap-2">
        {quickRequests.map((item) => (
          <button
            key={item.kind}
            onClick={() => onSelectRequestKind(item.kind)}
            className="flex h-[72px] min-w-0 items-center gap-2 overflow-hidden rounded-[16px] border border-[#edf1f6] bg-[#fbfcff] px-3 text-left shadow-[0_6px_14px_rgba(15,23,42,0.035)] transition hover:-translate-y-0.5 hover:border-[#cbdaf5]"
          >
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${toneClass(item.tone)}`}>
              <item.icon size={18} />
            </span>
            <span className="min-w-0 whitespace-pre-line text-[12px] font-[900] leading-[15px] text-[#111827]">{item.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
