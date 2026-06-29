"use client";

const statusItems = [
  { label: "접수", value: "12", color: "text-[#2563eb]", bg: "bg-[#eaf2ff]" },
  { label: "처리중", value: "8", color: "text-[#f97316]", bg: "bg-[#fff3df]" },
  { label: "완료", value: "23", color: "text-[#0d9b6c]", bg: "bg-[#e9f8f1]" },
  { label: "반려", value: "2", color: "text-[#ef4444]", bg: "bg-[#fff0ef]" }
];

export function RequestStatusSection() {
  return (
    <section className="h-[148px] min-w-0 overflow-hidden rounded-[20px] border border-[#e5eaf3] bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.045)]">
      <div className="flex h-8 items-center justify-between">
        <div>
          <h2 className="text-[16px] font-[950] text-[#111827]">나의 요청현황</h2>
          <p className="mt-0.5 text-[11px] font-[750] text-[#64748b]">요청 상태를 한눈에 확인합니다.</p>
        </div>
        <button onClick={() => (window.location.href = "/request-status")} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e7ecf4] bg-[#f8fbff] text-[15px] font-[950] text-[#2563eb] shadow-sm transition hover:bg-[#eef5ff]">
          →
        </button>
      </div>

      <div className="mt-3 grid min-w-0 grid-cols-4 gap-2">
        {statusItems.map((item) => (
          <div key={item.label} className="flex h-[72px] min-w-0 items-center gap-2 overflow-hidden rounded-[16px] border border-[#edf1f6] bg-[#fbfcff] px-3 shadow-[0_6px_14px_rgba(15,23,42,0.035)]">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.bg}`} />
            <div className="min-w-0">
              <p className="truncate text-[11px] font-[850] text-[#64748b]">{item.label}</p>
              <p className={`mt-1 truncate text-[26px] font-[950] leading-none ${item.color}`}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
