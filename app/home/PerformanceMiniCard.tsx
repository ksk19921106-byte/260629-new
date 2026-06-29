"use client";

const metrics = [
  { label: "거래 종료율", value: "68%", color: "text-[#2563eb]", bg: "bg-[#eaf2ff]" },
  { label: "수금률", value: "85%", color: "text-[#0d9b6c]", bg: "bg-[#e9f8f1]" },
  { label: "최근 정확도", value: "97%", color: "text-[#f97316]", bg: "bg-[#fff3df]" }
];

export function PerformanceMiniCard() {
  return (
    <button
      type="button"
      onClick={() => (window.location.href = "/performance")}
      className="h-[168px] min-w-0 overflow-hidden rounded-[20px] border border-[#e5eaf3] bg-white p-4 text-left shadow-[0_8px_20px_rgba(15,23,42,0.045)] transition hover:-translate-y-0.5 hover:border-[#cbdaf5]"
    >
      <div className="flex h-8 items-center justify-between">
        <h2 className="text-[16px] font-[950] text-[#111827]">성과 / 배지</h2>
        <span className="rounded-full bg-[#f8fbff] px-3 py-1 text-[11px] font-[900] text-[#2563eb]">바로가기</span>
      </div>

      <div className="mt-3 grid min-w-0 grid-cols-3 gap-2">
        {metrics.map((item) => (
          <div key={item.label} className="min-w-0 overflow-hidden rounded-[16px] border border-[#edf1f6] bg-[#fbfcff] px-3 py-4 text-center shadow-[0_6px_14px_rgba(15,23,42,0.03)]">
            <span className={`mx-auto block h-2 w-8 rounded-full ${item.bg}`} />
            <p className="mt-2 truncate text-[11px] font-[850] text-[#64748b]">{item.label}</p>
            <p className={`mt-2 truncate text-[24px] font-[950] leading-none ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>
    </button>
  );
}
