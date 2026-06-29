"use client";

import { AlertTriangle, CalendarCheck, CircleDollarSign, WalletCards } from "lucide-react";
import { summary } from "./homeData";

const kpis = [
  { label: "확인 필요 거래", value: `${summary.totalNeedCheckCount}건`, color: "text-[#ef4444]", icon: AlertTriangle, valueClass: "text-[36px]" },
  { label: "총 금액", value: summary.totalNeedCheckAmount.toLocaleString("ko-KR") + "원", color: "text-[#111827]", icon: CircleDollarSign, valueClass: "text-[28px]" },
  { label: "월마감 체크 필요", value: `${summary.monthlyNeedCount}건`, color: "text-[#f97316]", icon: CalendarCheck, valueClass: "text-[32px]" },
  { label: "수금 확인 필요", value: `${summary.collectionNeedCount}건`, color: "text-[#2563eb]", icon: WalletCards, valueClass: "text-[32px]" }
];

export function SummaryKpiStrip() {
  return (
    <div className="grid min-w-0 grid-cols-4 overflow-hidden rounded-[20px] border border-[#e5eaf3] bg-white px-[22px] py-[18px] shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
      {kpis.map((item, index) => (
        <div key={item.label} className={`min-w-0 px-4 first:pl-0 ${index > 0 ? "border-l border-[#e5eaf3]" : ""}`}>
          <div className="flex min-w-0 items-center gap-3">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${item.color === "text-[#ef4444]" ? "bg-[#fff0ef]" : item.color === "text-[#f97316]" ? "bg-[#fff4e8]" : "bg-[#eef6ff]"}`}>
              <item.icon size={20} className={item.color} />
            </span>
            <div className="min-w-0">
              <p className="mb-1.5 truncate text-[13px] font-[800] text-[#64748b]">{item.label}</p>
              <p className={`truncate font-[800] leading-none tracking-[-0.03em] ${item.valueClass} ${item.color}`}>{item.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
