"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function HeroSection({ userName }: { userName: string }) {
  return (
    <section className="grid min-h-[158px] min-w-0 grid-cols-[minmax(0,1fr)_250px] overflow-hidden rounded-[20px] border border-[#e5eaf3] bg-[linear-gradient(135deg,#fff7f3_0%,#ffffff_52%,#edf4ff_100%)] shadow-[0_10px_24px_rgba(15,23,42,0.065)]">
      <div className="flex min-w-0 flex-col justify-center px-8 py-5">
        <p className="truncate text-[18px] font-[900] text-[#111827]">{userName}님 👋</p>
        <h1 className="mt-1 text-[38px] font-[950] leading-[1.05] tracking-[-0.045em] text-[#111827]">
          오늘 처리할 업무 <span className="text-[#F39945]">8건</span>
        </h1>
        <p className="mt-2 text-[13px] font-[750] text-[#64748b]">월마감·수금·반려 이슈를 먼저 확인하세요.</p>
      </div>

      <div className="hero-visual relative min-w-0 overflow-hidden">
        <Image
          src="/assets/mascots/hero-target.png"
          alt="오늘 업무 목표"
          width={210}
          height={210}
          className="absolute right-[16px] top-[8px] z-10 max-h-[132px] max-w-[132px] object-contain opacity-65 drop-shadow-[0_12px_22px_rgba(239,68,68,0.10)]"
          priority
        />
        <Image
          src="/assets/brand/bandol-full.png"
          alt="ICBANQ OPS 마스코트"
          width={190}
          height={190}
          className="absolute bottom-[18px] left-[6px] z-20 max-h-[124px] max-w-[124px] object-contain drop-shadow-[0_12px_18px_rgba(15,23,42,0.16)]"
          priority
        />
        <button
          onClick={() => (window.location.href = "/month-end")}
          className="absolute bottom-[18px] right-[18px] z-30 inline-flex h-[36px] items-center gap-1.5 rounded-full bg-[#F39945] px-4 text-[12px] font-[950] text-white shadow-[0_10px_20px_rgba(239,68,68,0.24)] transition hover:bg-[#b85f18]"
        >
          오늘 업무 시작하기
          <ArrowRight size={14} />
        </button>
      </div>
    </section>
  );
}

