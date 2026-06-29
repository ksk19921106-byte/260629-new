"use client";

import { AlertCircle, Building2, CalendarDays, CheckCircle2, Clock3 } from "lucide-react";
import { weeklyWorkItems, type WorkItem, type WorkItemStatus, type WorkItemType } from "./homeData";

const typeLabel: Record<WorkItemType, string> = {
  common: "전사 공통",
  monthClose: "월마감",
  collection: "수금",
  request: "요청",
  notice: "공지",
  issue: "자동 이슈"
};

const statusLabel: Record<WorkItemStatus, string> = {
  notStarted: "시작 전",
  inProgress: "진행중",
  needCheck: "확인 필요",
  done: "완료",
  delayed: "지연"
};

function statusClass(status: WorkItemStatus) {
  if (status === "done") return "bg-[#ecfdf5] text-[#059669]";
  if (status === "inProgress") return "bg-[#eef6ff] text-[#2563eb]";
  if (status === "needCheck") return "bg-[#fff7e8] text-[#f97316]";
  if (status === "delayed") return "bg-[#fff0ef] text-[#ef4444]";
  return "bg-[#f1f5f9] text-[#64748b]";
}

function typeClass(type: WorkItemType) {
  if (type === "monthClose") return "bg-[#fff7e8] text-[#f97316]";
  if (type === "collection") return "bg-[#eef6ff] text-[#2563eb]";
  if (type === "request") return "bg-[#fff0ef] text-[#ef4444]";
  if (type === "common") return "bg-[#f3f4f6] text-[#475569]";
  return "bg-[#f8fbff] text-[#64748b]";
}

function iconFor(item: WorkItem) {
  if (item.status === "delayed") return AlertCircle;
  if (item.status === "done") return CheckCircle2;
  if (item.type === "common") return Building2;
  if (item.type === "monthClose") return CalendarDays;
  return Clock3;
}

function handleWorkItemClick(item: WorkItem) {
  if (item.relatedRoute) {
    window.location.href = item.relatedRoute;
    return;
  }

  window.alert("WR 작성 연결은 준비 중입니다.");
}

export function WeeklyOpsCalendar() {
  return (
    <section className="min-w-0 overflow-hidden rounded-[24px] border border-[#e5eaf3] bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.055)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[12px] font-[950] uppercase tracking-[0.08em] text-[#2563eb]">Weekly Work View</p>
          <h2 className="mt-1 text-[20px] font-[950] tracking-[-0.03em] text-[#111827]">이번 주 운영 캘린더</h2>
        </div>
        <p className="rounded-full bg-[#f8fbff] px-3 py-1 text-[12px] font-[900] text-[#64748b]">공통 업무 + OPS 자동 이슈</p>
      </div>

      <div className="mt-3 grid min-w-0 grid-cols-5 gap-2">
        {weeklyWorkItems.map((item) => {
          const Icon = iconFor(item);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleWorkItemClick(item)}
              className="flex min-h-[124px] min-w-0 flex-col justify-between overflow-hidden rounded-[18px] border border-[#edf1f7] bg-[#fbfdff] p-3 text-left transition hover:-translate-y-0.5 hover:border-[#2563eb] hover:bg-white hover:shadow-sm"
            >
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[18px] font-[950] text-[#111827]">{item.date}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-[900] ${statusClass(item.status)}`}>{statusLabel[item.status]}</span>
                </div>
                <div className="mt-3 flex min-w-0 items-center gap-2">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl ${typeClass(item.type)}`}>
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-[950] text-[#111827]">{item.title}</p>
                    <p className="mt-0.5 truncate text-[11px] font-[800] text-[#64748b]">{item.description}</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className={`rounded-full px-2 py-1 text-[10px] font-[900] ${typeClass(item.type)}`}>{typeLabel[item.type]}</span>
                {item.source === "opsData" ? <span className="rounded-full bg-white px-2 py-1 text-[10px] font-[900] text-[#2563eb]">자동 이슈</span> : null}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
