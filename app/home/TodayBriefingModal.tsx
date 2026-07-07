"use client";

import { AlertTriangle, CalendarCheck, Clock3, WalletCards, X } from "lucide-react";
import { collectionItems, monthlyItems, summary } from "./homeData";

type BriefingReason = {
  id: string;
  title: string;
  description: string;
  tone: "red" | "orange" | "blue";
  route: string;
};

function toneClass(tone: BriefingReason["tone"]) {
  if (tone === "red") return "bg-[#fff5ec] text-[#F39945]";
  if (tone === "orange") return "bg-[#fff5ec] text-[#F39945]";
  return "bg-[#edf4ff] text-[#1D50A2]";
}

export function getTodayBriefingReasons() {
  const today = new Date();
  const day = today.getDate();
  const reasons: BriefingReason[] = [];

  if (day === 3) {
    reasons.push({
      id: "month-start",
      title: "오늘부터 월마감이 시작되었습니다.",
      description: "이번 달 거래 중 아직 종료되지 않은 건을 먼저 확인해주세요.",
      tone: "orange",
      route: "/month-end"
    });
  }

  if (day === 9) {
    reasons.push({
      id: "month-deadline-d1",
      title: "월마감 마감 D-1입니다.",
      description: "마감일은 매월 10일입니다. 월마감 이슈를 먼저 정리해주세요.",
      tone: "red",
      route: "/month-end"
    });
  }

  if (summary.totalNeedCheckCount >= 5) {
    reasons.push({
      id: "many-issues",
      title: `오늘 확인이 필요한 업무가 ${summary.totalNeedCheckCount}건 있습니다.`,
      description: `월마감 ${summary.monthlyNeedCount}건, 수금 ${summary.collectionNeedCount}건, 반려/지연 ${summary.delayedRequestCount}건`,
      tone: "red",
      route: "/month-end"
    });
  }

  if (summary.delayedRequestCount > 0) {
    reasons.push({
      id: "delayed-request",
      title: `반려/지연 요청이 ${summary.delayedRequestCount}건 있습니다.`,
      description: "VIPS 요청 처리 흐름이 멈춘 건을 확인해주세요.",
      tone: "orange",
      route: "/request-status"
    });
  }

  const hasRiskIssue = monthlyItems.some((item) => item.tone === "needCheck" && !item.count.startsWith("0")) || collectionItems.some((item) => item.tone === "needCheck" && !item.count.startsWith("0"));
  if (hasRiskIssue) {
    reasons.push({
      id: "risk-issue",
      title: "월마감/수금 위험 이슈가 있습니다.",
      description: "출고O/계산서X, Deduct, 수금 확인 이슈를 먼저 점검해주세요.",
      tone: "blue",
      route: "/month-end"
    });
  }

  return reasons;
}

export function TodayBriefingModal({
  userName,
  reasons,
  onClose,
  onDismissToday
}: {
  userName: string;
  reasons: BriefingReason[];
  onClose: () => void;
  onDismissToday: () => void;
}) {
  if (reasons.length === 0) return null;

  const primaryRoute = reasons[0]?.route ?? "/month-end";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0f172a]/28 px-4 py-6 backdrop-blur-[2px]">
      <section className="w-full max-w-[560px] overflow-hidden rounded-[28px] border border-[#e5eaf3] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.22)]">
        <div className="flex items-start justify-between gap-4 border-b border-[#eef2f7] px-6 py-5">
          <div className="min-w-0">
            <p className="text-[11px] font-[950] uppercase tracking-[0.1em] text-[#F39945]">Today Briefing</p>
            <h2 className="mt-1 text-[25px] font-[950] tracking-[-0.035em] text-[#111827]">{userName}님, 오늘 먼저 확인할 업무가 있어요.</h2>
            <p className="mt-2 text-[13px] font-[750] text-[#64748b]">월마감·수금·요청 이슈 중 우선 확인할 항목만 정리했습니다.</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f8fafc] text-[#64748b] transition hover:bg-[#eef2f7]">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2.5 px-6 py-5">
          {reasons.slice(0, 5).map((reason) => (
            <button
              key={reason.id}
              type="button"
              onClick={() => (window.location.href = reason.route)}
              className="flex w-full min-w-0 items-start gap-3 rounded-[18px] border border-[#edf2f8] bg-[#fbfcff] p-4 text-left transition hover:border-[#cfe0ff] hover:bg-[#f8fbff]"
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${toneClass(reason.tone)}`}>
                {reason.id.includes("request") ? <Clock3 size={18} /> : reason.id.includes("risk") ? <WalletCards size={18} /> : reason.tone === "red" ? <AlertTriangle size={18} /> : <CalendarCheck size={18} />}
              </span>
              <span className="min-w-0">
                <span className="block text-[14px] font-[950] text-[#111827]">{reason.title}</span>
                <span className="mt-1 block text-[12px] font-[750] leading-5 text-[#64748b]">{reason.description}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#f8fbff] px-6 py-4">
          <button type="button" onClick={onDismissToday} className="h-10 rounded-full border border-[#dce6f3] bg-white px-4 text-[12px] font-[900] text-[#64748b] transition hover:bg-[#f8fafc]">
            오늘 다시 보지 않기
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="h-10 rounded-full border border-[#dce6f3] bg-white px-4 text-[12px] font-[900] text-[#64748b] transition hover:bg-[#f8fafc]">
              나중에 보기
            </button>
            <button type="button" onClick={() => (window.location.href = primaryRoute)} className="h-10 rounded-full bg-[#F39945] px-5 text-[12px] font-[950] text-white shadow-[0_10px_18px_rgba(239,68,68,0.18)] transition hover:bg-[#b85f18]">
              오늘 업무 시작하기
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

