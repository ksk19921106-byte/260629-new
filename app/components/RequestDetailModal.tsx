"use client";

import { CalendarDays, FileText, Link2, MessageSquare, Paperclip, X } from "lucide-react";
import type { RequestItem, RequestStatus } from "../services/requestStorage";

const statusStyles: Record<RequestStatus, string> = {
  요청접수: "bg-slate-100 text-slate-600 border-slate-200",
  "VIPS팀 확인중": "bg-blue-50 text-[#075bdc] border-blue-200",
  완료: "bg-emerald-50 text-emerald-700 border-emerald-200",
  반려: "bg-red-50 text-red-600 border-red-200"
};

function DetailCell({ label, value, highlight }: { label: string; value?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-md border px-3 py-3 ${highlight ? "border-blue-200 bg-[#f3f8ff]" : "border-[#e2ebf6] bg-white"}`}>
      <p className="text-[11px] font-[800] text-[#63748d]">{label}</p>
      <p className={`mt-1 min-h-[20px] break-words text-[13px] font-[750] ${highlight ? "text-[#075bdc]" : "text-[#10203f]"}`}>{value || "-"}</p>
    </div>
  );
}

export function RequestDetailModal({ request, onClose }: { request: RequestItem | null; onClose: () => void }) {
  if (!request) return null;
  const detailEntries = Object.entries(request.details ?? {}).filter(([, value]) => value);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d1b3e]/30 px-4">
      <section className="max-h-[88vh] w-[820px] overflow-hidden rounded-lg border border-[#d7e2f1] bg-white shadow-[0_22px_70px_rgba(15,35,70,0.22)]">
        <header className="flex items-start justify-between border-b border-[#e3ebf6] px-6 py-5">
          <div>
            <p className="flex items-center gap-2 text-[12px] font-[850] uppercase tracking-[0.08em] text-[#075bdc]">
              <FileText size={16} />
              Request Detail
            </p>
            <div className="mt-2 flex items-center gap-3">
              <h2 className="text-[20px] font-[850] tracking-[-0.01em] text-[#10203f]">{request.type}</h2>
              <span className={`rounded-full border px-3 py-1 text-[12px] font-[850] ${statusStyles[request.status]}`}>{request.status}</span>
            </div>
            <p className="mt-1 text-[13px] font-[650] text-[#5b6b84]">{request.id}</p>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-md border border-[#dce6f3] bg-[#f8fbff] text-[#31445e]">
            <X size={18} />
          </button>
        </header>

        <div className="max-h-[calc(88vh-92px)] overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-3 gap-3">
            <DetailCell label="업체명" value={request.companyName} highlight />
            <DetailCell label="요청자" value={request.requester} />
            <DetailCell label="요청일시" value={request.requestedAt} />
          </div>

          <div className="mt-5">
            <p className="mb-3 flex items-center gap-2 text-[13px] font-[850] text-[#10203f]">
              <CalendarDays size={16} className="text-[#075bdc]" />
              요청 입력 정보
            </p>
            {detailEntries.length > 0 && (
              <div className="mb-3 grid grid-cols-3 gap-3">
                {detailEntries.map(([label, value]) => (
                  <DetailCell key={label} label={label} value={value} highlight={label.includes("금액") || label === "총금액"} />
                ))}
              </div>
            )}
            <div className="grid grid-cols-3 gap-3">
              <DetailCell label="발행일자" value={request.issueDate} />
              <DetailCell label="품목명" value={request.itemName} highlight />
              <DetailCell label="수량" value={request.quantity} />
              <DetailCell label="단가" value={request.unitPrice} />
              <DetailCell label="공급가액" value={request.supplyAmount} />
              <DetailCell label="합계액" value={request.totalAmount} highlight />
            </div>
            <div className="mt-3">
              <DetailCell label="비고" value={request.note} />
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-3 text-[13px] font-[850] text-[#10203f]">VIPS팀 처리 정보</p>
            <div className="grid grid-cols-2 gap-3">
              <DetailCell label="처리결과" value={request.result} highlight />
              <DetailCell label="처리자" value={request.processor} />
              <DetailCell label="처리일시" value={request.processedAt} />
              <DetailCell label="상태" value={request.status} />
            </div>
          </div>

          <div className="mt-5 rounded-md border border-dashed border-[#c6d4e9] bg-[#f8fbff] px-4 py-3">
            <p className="text-[12px] font-[850] text-[#31445e]">확장 예정 영역</p>
            <div className="mt-3 grid grid-cols-4 gap-2 text-[12px] font-[700] text-[#5b6b84]">
              <span className="flex items-center gap-2"><Paperclip size={15} className="text-[#075bdc]" />첨부파일명/미리보기</span>
              <span className="flex items-center gap-2"><CalendarDays size={15} className="text-[#075bdc]" />요청 이력</span>
              <span className="flex items-center gap-2"><MessageSquare size={15} className="text-[#075bdc]" />코멘트</span>
              <span className="flex items-center gap-2"><Link2 size={15} className="text-[#075bdc]" />ERP 링크</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
