"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { SummaryKpiStrip } from "./SummaryKpiStrip";

export function HeroSection({ userName }: { userName: string }) {
  return (
    <section className="grid min-h-[318px] min-w-0 grid-cols-[minmax(0,1fr)_360px] overflow-hidden rounded-[26px] border border-[#e5eaf3] bg-[linear-gradient(135deg,#fff7f3_0%,#ffffff_46%,#eef6ff_100%)] shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
      <div className="min-w-0 px-7 py-6">
        <p className="truncate text-[18px] font-[900] text-[#111827]">{userName}님, 오늘 처리할 업무를 확인해요!</p>
        <h1 className="mt-2 text-[38px] font-[950] leading-[1.15] tracking-[-0.04em] text-[#111827]">
          오늘 확인할 업무가 <span className="text-[#ef4444]">8건</span> 있습니다
        </h1>
        <p className="mt-2 text-[14px] font-[750] text-[#64748b]">월마감, 수금, 요청 이슈를 놓치지 마세요.</p>
        <div className="mt-5">
          <SummaryKpiStrip />
        </div>
      </div>
      <div className="hero-visual relative min-w-0 overflow-hidden">
        <Image src="/assets/mascots/hero-mascot.png" alt="ICBANQ OPS 히어로 마스코트" width={190} height={190} className="absolute bottom-[34px] left-[18px] z-20 max-h-[168px] max-w-[168px] object-contain drop-shadow-[0_12px_18px_rgba(15,23,42,0.14)]" priority />
        <button onClick={() => (window.location.href = "/month-end")} className="absolute bottom-[22px] left-[30px] z-30 inline-flex h-[38px] items-center gap-2 rounded-full bg-[#ef4444] px-5 text-[12px] font-[950] text-white shadow-[0_12px_24px_rgba(239,68,68,0.22)]">
          오늘 업무 시작하기
          <ArrowRight size={15} />
        </button>
        <Image src="/assets/mascots/hero-target.png" alt="거래 종료 목표 과녁" width={260} height={260} className="absolute right-[14px] top-[42px] z-10 max-h-[238px] max-w-[238px] object-contain drop-shadow-[0_16px_26px_rgba(239,68,68,0.12)]" priority />
      </div>
    </section>
  );
}
