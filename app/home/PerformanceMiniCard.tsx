"use client";

const metrics = [
  ["거래 종료율", "68%"],
  ["수금률", "85%"],
  ["최근 정확도", "97%"]
];

export function PerformanceMiniCard() {
  return (
    <button
      type="button"
      onClick={() => (window.location.href = "/performance")}
      className="h-[168px] min-w-0 overflow-hidden rounded-[20px] border border-[#e5eaf3] bg-white p-4 text-left shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-[#cbdaf5]"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-[950] text-[#111827]">성과 / 배지</h2>
        <span className="rounded-full bg-[#f3f7ff] px-3 py-1 text-[11px] font-[900] text-[#2563eb]">바로가기</span>
      </div>
      <div className="mt-4 grid min-w-0 grid-cols-3 gap-2">
        {metrics.map(([label, value]) => (
          <div key={label} className="min-w-0 overflow-hidden rounded-[16px] bg-[#f8fbff] px-3 py-4 text-center">
            <p className="truncate text-[11px] font-[800] text-[#64748b]">{label}</p>
            <p className="mt-2 truncate text-[22px] font-[950] leading-none text-[#111827]">{value}</p>
          </div>
        ))}
      </div>
    </button>
  );
}
