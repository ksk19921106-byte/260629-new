"use client";

const statusItems = [
  ["접수", "12", "#2563eb"],
  ["처리중", "8", "#f97316"],
  ["완료", "23", "#0d9b6c"],
  ["반려", "2", "#ef4444"]
];

const recentRequests = [
  ["세금계산서", "(주)OOIOO_세금계산서 발행 요청", "처리중"],
  ["입금확인", "OOO 프로젝트 입금확인 요청", "접수"]
];

export function RequestStatusSection() {
  return (
    <section className="h-[188px] min-w-0 overflow-hidden rounded-[20px] border border-[#e5eaf3] bg-white p-[18px] shadow-[0_10px_24px_rgba(15,23,42,0.045)]">
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-[950] text-[#111827]">나의 요청현황</h2>
        <button onClick={() => (window.location.href = "/request-status")} className="rounded-full border border-[#e7ecf4] bg-[#f8fbff] px-3 py-1.5 text-[11px] font-[900] text-[#34496b] shadow-sm transition hover:bg-[#eef5ff]">
          바로가기
        </button>
      </div>

      <div className="mt-2 grid h-[62px] grid-cols-4 overflow-hidden rounded-[15px] border border-[#e6edf6] text-center">
        {statusItems.map(([label, value, color]) => (
          <div key={label} className="flex min-w-0 flex-col justify-center border-r border-[#e6edf6] px-2 last:border-r-0">
            <p className="truncate text-[11px] font-[900]" style={{ color }}>{label}</p>
            <p className="mt-0.5 truncate text-[24px] font-[950] leading-none" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-2 space-y-1">
        {recentRequests.map(([type, title, status]) => (
          <div key={title} className="grid h-[25px] min-w-0 grid-cols-[74px_minmax(0,1fr)_58px] items-center gap-2 rounded-[10px] bg-[#f8fbff] px-2 text-[11px]">
            <span className="truncate font-[900] text-[#2563eb]">{type}</span>
            <span className="truncate font-[800] text-[#475569]">{title}</span>
            <span className={`truncate text-right font-[900] ${status === "처리중" ? "text-[#f97316]" : "text-[#2563eb]"}`}>{status}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
