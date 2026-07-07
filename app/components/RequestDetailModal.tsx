"use client";

import { useState } from "react";
import { CalendarDays, FileText, Paperclip, X } from "lucide-react";
import { updateRequest, type RequestItem, type RequestStatus } from "../services/requestStorage";

const statusStyles: Record<RequestStatus, string> = {
  요청접수: "ops-status-muted",
  "VIPS팀 확인중": "ops-status-info",
  완료: "ops-status-info",
  반려: "ops-status-attention"
};

function DetailCell({ label, value, highlight }: { label: string; value?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-md border px-3 py-3 ${highlight ? "border-[rgba(29,80,162,0.18)] bg-[#f7faff]" : "border-[#e2ebf6] bg-white"}`}>
      <p className="text-[11px] font-[800] text-[#63748d]">{label}</p>
      <p className={`mt-1 min-h-[20px] break-words text-[13px] font-[750] ${highlight ? "text-[#1D50A2]" : "text-[#10203f]"}`}>{value || "-"}</p>
    </div>
  );
}

function previewKind(attachment: { name: string; type: string }) {
  const name = attachment.name.toLowerCase();
  if (attachment.type.startsWith("image/") || /\.(png|jpe?g|gif|webp)$/i.test(name)) return "image";
  if (attachment.type === "application/pdf" || /\.pdf$/i.test(name)) return "pdf";
  return "file";
}

export function RequestDetailModal({
  request,
  onClose,
  canProcess = false,
  onUpdated
}: {
  request: RequestItem | null;
  onClose: () => void;
  canProcess?: boolean;
  onUpdated?: (request: RequestItem) => void;
}) {
  const [resultText, setResultText] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState<RequestStatus | null>(null);

  if (!request) return null;
  const detailEntries = Object.entries(request.details ?? {}).filter(([, value]) => value);
  const attachments = request.attachments ?? [];
  const attachmentFileNames = detailEntries.filter(([label]) => label.includes("첨부") || label.includes("업로드"));

  const processRequest = async (status: RequestStatus) => {
    const fallbackResult =
      status === "완료" ? "요청 처리 완료" : status === "반려" ? "요청 반려 처리" : "VIPS팀 확인중";
    try {
      setUpdatingStatus(status);
      const nextRequest = await updateRequest({
        id: request.id,
        status,
        result: resultText.trim() || fallbackResult
      });
      onUpdated?.(nextRequest);
      setResultText("");
    } catch {
      window.alert("처리 상태 저장 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setUpdatingStatus(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d1b3e]/34 px-4 backdrop-blur-[2px]">
      <section className="max-h-[90vh] w-[940px] overflow-hidden rounded-[26px] border border-white bg-[#f7fbff] shadow-[0_28px_90px_rgba(15,35,70,0.28)]">
        <header className="flex items-start justify-between border-b border-[#e3ebf6] bg-white px-7 py-6">
          <div>
            <p className="flex items-center gap-2 text-[12px] font-[900] uppercase tracking-[0.08em] text-[#1D50A2]">
              <FileText size={16} />
              Request Detail
            </p>
            <div className="mt-2 flex items-center gap-3">
              <h2 className="text-[22px] font-[950] tracking-[-0.02em] text-[#10203f]">{request.type}</h2>
              <span className={`rounded-full border px-3 py-1 text-[12px] font-[900] ${statusStyles[request.status]}`}>{request.status}</span>
            </div>
            <p className="mt-1 text-[13px] font-[750] text-[#64748b]">{request.id}</p>
          </div>
          <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dce6f3] bg-[#f8fbff] text-[#31445e] transition hover:bg-[#edf4ff] hover:text-[#1D50A2]">
            <X size={18} />
          </button>
        </header>

        <div className="max-h-[calc(90vh-104px)] overflow-y-auto px-7 py-6">
          <div className="grid grid-cols-3 gap-3">
            <DetailCell label="업체명" value={request.companyName} highlight />
            <DetailCell label="요청자" value={request.requester} />
            <DetailCell label="요청일시" value={request.requestedAt} />
          </div>

          <div className="mt-5 rounded-[20px] border border-[#e6edf7] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <p className="mb-3 flex items-center gap-2 text-[13px] font-[850] text-[#10203f]">
              <CalendarDays size={16} className="text-[#1D50A2]" />
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

          <div className="mt-5 rounded-[20px] border border-[#e6edf7] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <p className="mb-3 text-[13px] font-[850] text-[#10203f]">VIPS팀 처리 정보</p>
            <div className="grid grid-cols-2 gap-3">
              <DetailCell label="처리결과" value={request.result} highlight />
              <DetailCell label="처리자" value={request.processor} />
              <DetailCell label="처리일시" value={request.processedAt} />
              <DetailCell label="상태" value={request.status} />
            </div>
            {canProcess && (
              <div className="mt-3 rounded-[18px] border border-[#d7e2f1] bg-[#f8fbff] p-4">
                <label className="block">
                  <span className="mb-2 block text-[12px] font-[850] text-[#31445e]">처리 메모 / 반려 사유</span>
                  <textarea
                    value={resultText}
                    onChange={(event) => setResultText(event.target.value)}
                    placeholder="예: 계약서 확인 완료 / 필수 서류 누락으로 반려"
                    className="h-[78px] w-full resize-none rounded-[14px] border border-[#dce6f3] bg-white px-3 py-2 text-[13px] font-[650] text-[#10203f] outline-none focus:border-[#1D50A2] focus:ring-2 focus:ring-[#dbe7f5]"
                  />
                </label>
                <div className="mt-3 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    disabled={!!updatingStatus}
                    onClick={() => processRequest("VIPS팀 확인중")}
                    className="h-10 rounded-full border border-[rgba(29,80,162,0.18)] bg-[#edf4ff] px-5 text-[12px] font-[900] text-[#1D50A2] disabled:opacity-50"
                  >
                    {updatingStatus === "VIPS팀 확인중" ? "저장 중" : "처리중"}
                  </button>
                  <button
                    type="button"
                    disabled={!!updatingStatus}
                    onClick={() => processRequest("완료")}
                    className="h-10 rounded-full border border-[rgba(29,80,162,0.18)] bg-[#edf4ff] px-5 text-[12px] font-[900] text-[#1D50A2] disabled:opacity-50"
                  >
                    {updatingStatus === "완료" ? "저장 중" : "완료"}
                  </button>
                  <button
                    type="button"
                    disabled={!!updatingStatus}
                    onClick={() => processRequest("반려")}
                    className="h-10 rounded-full border border-[rgba(243,153,69,0.30)] bg-[#fff5ec] px-5 text-[12px] font-[900] text-[#F39945] disabled:opacity-50"
                  >
                    {updatingStatus === "반려" ? "저장 중" : "반려"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 rounded-[20px] border border-[#e6edf7] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <p className="flex items-center gap-2 text-[13px] font-[850] text-[#10203f]">
              <Paperclip size={16} className="text-[#1D50A2]" />
              첨부파일 미리보기
            </p>
            {attachments.length === 0 ? (
              <div className="mt-3 rounded-lg border border-dashed border-[#c6d4e9] bg-white px-3 py-3">
                {attachmentFileNames.length > 0 ? (
                  <div className="space-y-2">
                    {attachmentFileNames.map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between gap-3 text-[12px]">
                        <span className="font-[800] text-[#63748d]">{label}</span>
                        <span className="min-w-0 truncate font-[850] text-[#10203f]">{value}</span>
                      </div>
                    ))}
                    <p className="pt-1 text-[11px] font-[700] leading-5 text-[#7a8ba4]">
                      이전에 저장된 요청은 파일명만 보관되어 있습니다. 새로 제출하는 요청부터 이미지/PDF 미리보기가 함께 저장됩니다.
                    </p>
                  </div>
                ) : (
                  <p className="text-[12px] font-[700] text-[#5b6b84]">첨부된 파일이 없습니다.</p>
                )}
              </div>
            ) : (
              <div className="mt-3 grid gap-3">
                {attachments.map((attachment) => (
                  <article key={`${attachment.field}-${attachment.name}`} className="overflow-hidden rounded-lg border border-[#dce6f3] bg-white">
                    <div className="flex items-center justify-between gap-3 border-b border-[#edf1f6] px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-[11px] font-[800] text-[#63748d]">{attachment.label}</p>
                        <p className="truncate text-[13px] font-[850] text-[#10203f]">{attachment.name}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-[#edf4ff] px-3 py-1 text-[11px] font-[900] text-[#1D50A2]">
                        {previewKind(attachment) === "pdf" ? "PDF" : previewKind(attachment) === "image" ? "IMAGE" : "FILE"}
                      </span>
                    </div>
                    {previewKind(attachment) === "image" ? (
                      <img src={attachment.dataUrl} alt={`${attachment.label} 미리보기`} className="max-h-[360px] w-full object-contain p-3" />
                    ) : previewKind(attachment) === "pdf" ? (
                      <iframe title={`${attachment.label} PDF 미리보기`} src={attachment.dataUrl} className="h-[420px] w-full bg-white" />
                    ) : (
                      <div className="px-3 py-4 text-[12px] font-[750] text-[#5b6b84]">이 파일 형식은 파일명만 확인할 수 있습니다.</div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

