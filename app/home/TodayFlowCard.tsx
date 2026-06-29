"use client";

const flowItems = [
  ["수정세금계산서 재확인", "2건"],
  ["카드전표 누락 보완", "1건"],
  ["수금매칭 보류 점검", "1건"]
];

export function TodayFlowCard() {
  return (
    <section className="h-[168px] min-w-0 overflow-hidden rounded-[20px] border border-[#e5eaf3] bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
      <h2 className="text-[18px] font-[950] text-[#111827]">Today&apos;s Flow</h2>
      <div className="mt-3 space-y-2">
        {flowItems.map(([label, count]) => (
          <div key={label} className="flex h-8 min-w-0 items-center justify-between gap-3 rounded-xl border border-[#edf1f6] bg-[#fbfcff] px-3">
            <span className="min-w-0 truncate text-[12px] font-[850] text-[#475569]">{label}</span>
            <span className="shrink-0 text-[12px] font-[950] text-[#2563eb]">{count}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
