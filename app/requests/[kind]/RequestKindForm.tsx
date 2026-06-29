"use client";

import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { REQUEST_FORM_CONFIGS, type RequestKind } from "../../services/formValidation";

type FormValues = Record<string, string>;

const trackingOptions = ["매칭 필요", "매칭 불필요"];

function Field({
  label,
  name,
  values,
  setValues,
  type = "text",
  required = false,
  placeholder = ""
}: {
  label: string;
  name: string;
  values: FormValues;
  setValues: (updater: (current: FormValues) => FormValues) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  const updateValue = (event: ChangeEvent<HTMLInputElement> | FormEvent<HTMLInputElement>) => {
    const target = event.currentTarget;
    const nextValue = type === "file" ? target.files?.[0]?.name ?? "" : target.value;
    setValues((current) => ({ ...current, [name]: nextValue }));
  };

  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-1 text-[13px] font-[850] text-[#1d2f4f]">
        {label}
        {required && <span className="text-red-500">*</span>}
      </span>
      <input
        name={name}
        aria-label={label}
        type={type}
        value={type === "file" ? undefined : values[name] ?? ""}
        placeholder={placeholder}
        onInput={type === "file" ? undefined : updateValue}
        onChange={updateValue}
        className="h-11 w-full rounded-xl border border-[#dce6f3] bg-white px-3 text-[14px] font-[650] text-[#10203f] outline-none focus:border-[#075bdc] focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function CalculatedField({ label, value, helper }: { label: string; value: string; helper?: string }) {
  const calcKey = label === "공급가액" ? "supply" : label === "부가세액" ? "vat" : label === "합계액" ? "total" : undefined;

  return (
    <div className="block">
      <span className="mb-2 block text-[13px] font-[850] text-[#1d2f4f]">{label}</span>
      <div className="flex h-11 w-full items-center justify-between rounded-xl border border-[#dce6f3] bg-[#f4f8fd] px-3 text-[14px] font-[850] text-[#10203f]">
        <span data-tax-calc={calcKey}>{value}</span>
        {helper && <span className="text-[11px] font-[800] text-[#7a8aa3]">{helper}</span>}
      </div>
    </div>
  );
}

function TextArea({
  label,
  name,
  values,
  setValues,
  required = false,
  placeholder = ""
}: {
  label: string;
  name: string;
  values: FormValues;
  setValues: (updater: (current: FormValues) => FormValues) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="col-span-2 block">
      <span className="mb-2 flex items-center gap-1 text-[13px] font-[850] text-[#1d2f4f]">
        {label}
        {required && <span className="text-red-500">*</span>}
      </span>
      <textarea
        value={values[name] ?? ""}
        onChange={(event) => setValues((current) => ({ ...current, [name]: event.target.value }))}
        placeholder={placeholder}
        className="h-[96px] w-full resize-none rounded-xl border border-[#dce6f3] bg-white px-3 py-3 text-[14px] font-[650] text-[#10203f] outline-none focus:border-[#075bdc] focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  values,
  setValues,
  required = false,
  options
}: {
  label: string;
  name: string;
  values: FormValues;
  setValues: (updater: (current: FormValues) => FormValues) => void;
  required?: boolean;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-1 text-[13px] font-[850] text-[#1d2f4f]">
        {label}
        {required && <span className="text-red-500">*</span>}
      </span>
      <select
        value={values[name] ?? ""}
        onChange={(event) => setValues((current) => ({ ...current, [name]: event.target.value }))}
        className="h-11 w-full rounded-xl border border-[#dce6f3] bg-white px-3 text-[14px] font-[650] text-[#10203f] outline-none focus:border-[#075bdc] focus:ring-2 focus:ring-blue-100"
      >
        <option value="">선택해주세요</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function OperationNote({ kind }: { kind: RequestKind }) {
  const notes: Record<RequestKind, { title: string; body: string; risks: string[] }> = {
    taxInvoice: {
      title: "세금계산서는 매출 확정의 기준입니다",
      body: "수량과 단가를 입력하면 공급가액, 부가세액, 합계액이 자동 계산됩니다. 전자부품 유통 거래에서는 계산서와 트래킹 흐름이 어긋나면 수금과 월마감까지 영향을 줍니다.",
      risks: ["공급가액 = 수량 x 단가", "VAT = 공급가액 x 10%", "333원인 경우 VAT는 33원"]
    },
    revisedTaxInvoice: {
      title: "전월 계산서 수정은 먼저 확인이 필요합니다",
      body: "전월 계산서 수정은 월마감 및 부가세 신고 흐름에 영향을 줄 수 있습니다. 수정 가능 여부를 반드시 확인 후 요청해주세요.",
      risks: ["매출 흐름 영향", "부가세 신고 영향", "수금 및 회계 반영 영향"]
    },
    reverseIssueApproval: { title: "역발행 기준 확인", body: "사이트와 최종금액, 건수를 정확히 남겨주세요.", risks: ["사이트 정보", "최종금액", "건수"] },
    depositConfirmation: { title: "입금 흐름 확인", body: "거래는 수금까지 완료되어야 정상 종료됩니다.", risks: ["미수금 오류", "거래 종료 상태 오류", "회계 반영 지연"] },
    cardPayment: { title: "카드전표 첨부 필수", body: "카드매출전표 누락 시 거래 확인과 매칭이 지연될 수 있습니다.", risks: ["전표 첨부", "금액 대조", "회계 반영"] },
    guaranteeInsurance: { title: "계약서 첨부 필수", body: "계약 조건과 증빙을 맞춰야 발급 지연을 줄일 수 있습니다.", risks: ["PDF/JPG/JPEG/PNG", "VAT 포함 계약금액", "보증기간"] },
    invoiceMatching: { title: "계산서 매칭", body: "거래 흐름과 세금계산서를 연결합니다.", risks: ["매출 흐름 오류", "거래 상태 불일치", "수금 연결 문제"] },
    collectionMatching: { title: "수금 매칭", body: "입금 흐름과 거래/세금계산서를 연결합니다.", risks: ["부분입금", "일괄입금", "타업체명 입금"] },
    monthEndCheck: { title: "월마감 통제", body: "미완료 거래를 정리하는 운영 통제 단계입니다.", risks: ["매출 누락", "장기 미수금", "재고 리스크"] }
  };
  const note = notes[kind];

  return (
    <aside className="rounded-[22px] border border-[#e7ecf4] bg-[#f8fbff] p-5">
      <p className="text-[15px] font-[900] text-[#10203f]">{note.title}</p>
      <p className="mt-2 text-[12px] font-[650] leading-5 text-[#667085]">{note.body}</p>
      <div className="mt-4 space-y-2">
        {note.risks.map((risk) => (
          <p key={risk} className="flex items-start gap-2 text-[12px] font-[750] leading-5 text-[#34496b]">
            <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#1ca678]" />
            {risk}
          </p>
        ))}
      </div>
    </aside>
  );
}

function TaxInvoiceFields({
  values,
  setValues
}: {
  values: FormValues;
  setValues: (updater: (current: FormValues) => FormValues) => void;
}) {
  return (
    <>
      <Field label="업체명" name="companyName" values={values} setValues={setValues} required placeholder="예: 아이씨뱅큐" />
      <div className="col-span-2 rounded-[18px] border border-[#e7ecf4] bg-[#fbfdff] p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[13px] font-[900] text-[#10203f]">품목 내역</p>
            <p className="mt-1 text-[11px] font-[650] text-[#7a8ba4]">기본 1줄로 시작하고, 여러 품목이면 필요한 만큼만 추가합니다.</p>
          </div>
          <button
            type="button"
            data-add-tax-line="true"
            className="h-9 rounded-xl bg-[#eef5ff] px-3 text-[12px] font-[900] text-[#075bdc]"
          >
            + 품목 추가
          </button>
        </div>
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((index) => (
            <div
              key={index}
              data-tax-line={index}
              className={`grid grid-cols-[1.2fr_90px_120px_130px_36px] items-end gap-3 rounded-2xl border border-[#edf1f6] bg-white p-3 ${
                index === 0 ? "" : "hidden"
              }`}
            >
              <label className="block">
                <span className="mb-2 block text-[12px] font-[850] text-[#1d2f4f]">품목 {index + 1}</span>
                <input
                  name={index === 0 ? "itemName" : `itemName_${index + 1}`}
                  data-tax-item={index}
                  aria-label={`품목 ${index + 1}`}
                  placeholder="예: 전자부품 공급"
                  className="h-10 w-full rounded-xl border border-[#dce6f3] bg-white px-3 text-[13px] font-[650] text-[#10203f] outline-none focus:border-[#075bdc] focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[12px] font-[850] text-[#1d2f4f]">수량</span>
                <input
                  name={index === 0 ? "quantity" : `quantity_${index + 1}`}
                  data-tax-quantity={index}
                  aria-label={`수량 ${index + 1}`}
                  type="number"
                  placeholder="0"
                  className="h-10 w-full rounded-xl border border-[#dce6f3] bg-white px-3 text-[13px] font-[650] text-[#10203f] outline-none focus:border-[#075bdc] focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[12px] font-[850] text-[#1d2f4f]">단가</span>
                <input
                  name={index === 0 ? "unitPrice" : `unitPrice_${index + 1}`}
                  data-tax-unit={index}
                  aria-label={`단가 ${index + 1}`}
                  type="number"
                  placeholder="0"
                  className="h-10 w-full rounded-xl border border-[#dce6f3] bg-white px-3 text-[13px] font-[650] text-[#10203f] outline-none focus:border-[#075bdc] focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <div>
                <span className="mb-2 block text-[12px] font-[850] text-[#1d2f4f]">공급가액</span>
                <div className="flex h-10 items-center rounded-xl border border-[#dce6f3] bg-[#f4f8fd] px-3 text-[13px] font-[900] text-[#10203f]">
                  <span data-tax-line-supply={index}>0원</span>
                </div>
              </div>
              <button
                type="button"
                data-remove-tax-line={index}
                className={`h-10 rounded-xl border border-[#dce6f3] text-[12px] font-[900] text-[#7a8ba4] ${index === 0 ? "invisible" : ""}`}
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      </div>
      <CalculatedField label="공급가액" value="0원" helper="품목합계" />
      <CalculatedField label="부가세액" value="0원" helper="10%" />
      <CalculatedField label="합계액" value="0원" helper="공급가+VAT" />
      <Field label="발행일자" name="issueDate" values={values} setValues={setValues} required type="date" />
      <SelectField label="트래킹 매칭 여부" name="trackingMatchStatus" values={values} setValues={setValues} required options={trackingOptions} />
      {values.trackingMatchStatus === "매칭 필요" && (
        <Field label="트래킹 번호" name="trackingNumber" values={values} setValues={setValues} placeholder="Tracking Number 입력" />
      )}
      <TextArea label="비고" name="note" values={values} setValues={setValues} placeholder="추가 확인사항이나 VIPS팀에 전달할 내용을 입력해주세요." />
    </>
  );
}

function RequestFields({ kind, values, setValues }: { kind: RequestKind; values: FormValues; setValues: (updater: (current: FormValues) => FormValues) => void }) {
  if (kind === "taxInvoice") return <TaxInvoiceFields values={values} setValues={setValues} />;

  if (kind === "revisedTaxInvoice") {
    return (
      <>
        <Field label="업체명" name="companyName" values={values} setValues={setValues} required placeholder="업체명 입력" />
        <Field label="기존 세금계산서 링크" name="originalInvoiceLink" values={values} setValues={setValues} required placeholder="기존 세금계산서 링크 입력" />
        <Field label="수정사항" name="revisionChange" values={values} setValues={setValues} required placeholder="품목/금액/발행일자 등 수정사항" />
        <TextArea label="수정이유" name="revisionReason" values={values} setValues={setValues} required placeholder="수정 가능 여부 확인을 위해 사유를 구체적으로 입력해주세요." />
        <TextArea label="비고" name="note" values={values} setValues={setValues} placeholder="추가 확인사항 입력" />
      </>
    );
  }

  if (kind === "reverseIssueApproval") return <><Field label="역발행 세금계산서 사이트" name="reverseIssueSite" values={values} setValues={setValues} required /><Field label="최종금액" name="reverseFinalAmount" values={values} setValues={setValues} required type="number" /><Field label="건수" name="reverseIssueCount" values={values} setValues={setValues} required type="number" /><TextArea label="비고" name="note" values={values} setValues={setValues} /></>;
  if (kind === "depositConfirmation") return <><Field label="입금일자" name="depositDate" values={values} setValues={setValues} required type="date" /><Field label="업체명/고객명" name="companyName" values={values} setValues={setValues} required /><Field label="입금금액" name="depositAmount" values={values} setValues={setValues} required type="number" /><SelectField label="입금계좌" name="depositAccount" values={values} setValues={setValues} required options={["우리은행145961", "우리은행648954", "우리은행16563.", "기업은행01014", "어음발행"]} /><TextArea label="비고" name="note" values={values} setValues={setValues} /></>;
  if (kind === "cardPayment") return <><Field label="업체명/고객명" name="companyName" values={values} setValues={setValues} required /><Field label="카드전표 첨부" name="cardReceiptName" values={values} setValues={setValues} required type="file" /><TextArea label="비고" name="note" values={values} setValues={setValues} /></>;
  if (kind === "guaranteeInsurance") return <><SelectField label="요청 구분" name="guaranteeRequestType" values={values} setValues={setValues} required options={["나라장터 건", "일반 계약 건"]} /><SelectField label="보증보험 종류" name="guaranteeType" values={values} setValues={setValues} required options={["계약이행", "하자이행", "선금이행"]} /><Field label="업체명" name="companyName" values={values} setValues={setValues} required /><Field label="보증요율" name="guaranteeRate" values={values} setValues={setValues} required /><Field label="보증기간" name="guaranteePeriod" values={values} setValues={setValues} required /><Field label="계약명" name="contractName" values={values} setValues={setValues} required /><Field label="계약금액(VAT 포함)" name="contractAmount" values={values} setValues={setValues} required type="number" /><Field label="계약서 첨부" name="contractFileName" values={values} setValues={setValues} required type="file" /></>;
  if (kind === "invoiceMatching") return <><SelectField label="요청 유형" name="invoiceMatchType" values={values} setValues={setValues} required options={["계산서매칭", "계산서매칭해제"]} /><Field label="업체명" name="companyName" values={values} setValues={setValues} required /><Field label="계산서 링크" name="invoiceLink" values={values} setValues={setValues} required /><Field label="트래킹 URL" name="trackingLink" values={values} setValues={setValues} required /><TextArea label="요청 사유" name="matchReason" values={values} setValues={setValues} required /><TextArea label="메모" name="note" values={values} setValues={setValues} /></>;
  if (kind === "collectionMatching") return <><SelectField label="요청 유형" name="collectionMatchType" values={values} setValues={setValues} required options={["수금매칭", "수금매칭해제"]} /><Field label="업체명" name="companyName" values={values} setValues={setValues} required /><Field label="수금 링크" name="collectionLink" values={values} setValues={setValues} required /><Field label="트래킹 URL" name="collectionTrackingUrl" values={values} setValues={setValues} required /><Field label="세금계산서 링크" name="collectionInvoiceLink" values={values} setValues={setValues} required /><TextArea label="요청 사유" name="matchReason" values={values} setValues={setValues} required /><TextArea label="메모" name="note" values={values} setValues={setValues} /></>;
  return <><Field label="업체명" name="companyName" values={values} setValues={setValues} required /><Field label="월마감 확인 유형" name="monthEndCase" values={values} setValues={setValues} required /><TextArea label="비고" name="note" values={values} setValues={setValues} required /></>;
}

export function RequestKindForm({ kind }: { kind: RequestKind }) {
  const [values, setValues] = useState<FormValues>({});
  const [showRevisionModal, setShowRevisionModal] = useState(kind === "revisedTaxInvoice");
  const config = REQUEST_FORM_CONFIGS[kind];
  const stableSetValues = useMemo(() => setValues, []);

  useEffect(() => {
    if (kind === "revisedTaxInvoice") setShowRevisionModal(true);
  }, [kind]);

  return (
    <>
      {showRevisionModal && (
        <div data-revision-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d1b3e]/35 px-4">
          <div className="w-[460px] rounded-[24px] border border-[#e7ecf4] bg-white p-6 shadow-[0_26px_80px_rgba(30,37,52,0.24)]">
            <p className="text-[18px] font-[900] text-[#10203f]">수정세금계산서 요청 전 확인</p>
            <p className="mt-3 text-[13px] font-[650] leading-6 text-[#435a7b]">
              전월 계산서 수정은 월마감 및 부가세 신고 흐름에 영향을 줄 수 있습니다. 수정 가능 여부를 반드시 확인 후 요청해주세요.
            </p>
            <button
              type="button"
              data-revision-confirm="true"
              onClick={() => setShowRevisionModal(false)}
              className="mt-5 h-11 w-full rounded-xl bg-[#075bdc] text-[13px] font-[900] text-white"
            >
              확인 후 진행
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between rounded-[22px] border border-[#e7ecf4] bg-[#f8fbff] px-5 py-4">
        <Link href="/requests" className="flex items-center gap-2 text-[13px] font-[850] text-[#1f5fe0]">
          <ArrowLeft size={16} />
          요청 메뉴로 돌아가기
        </Link>
        <span className="rounded-full bg-white px-3 py-1 text-[12px] font-[850] text-[#667085]">월마감 미완료자는 모든 VIPS팀 요청 진입이 불가합니다.</span>
      </div>

      <div className="mt-5 grid grid-cols-[1fr_300px] gap-5 max-[980px]:grid-cols-1">
        <form className="rounded-[24px] border border-[#e7ecf4] bg-white p-6 shadow-sm">
          <div className="mb-5 border-b border-[#edf1f6] pb-4">
            <p className="text-[12px] font-[850] uppercase tracking-[0.08em] text-[#075bdc]">VIPS Request</p>
            <h2 className="mt-1 text-[20px] font-[900] text-[#10203f]">{config.formTitle}</h2>
          </div>
          <div className="grid grid-cols-2 gap-5 max-[760px]:grid-cols-1">
            <RequestFields kind={kind} values={values} setValues={stableSetValues} />
          </div>
          <div className="mt-6 flex justify-end gap-2 border-t border-[#edf1f6] pt-5">
            <Link href="/requests" className="flex h-11 items-center rounded-xl border border-[#dce6f3] bg-white px-5 text-[13px] font-[850] text-[#34496b]">
              취소
            </Link>
            <button type="button" className="h-11 rounded-xl bg-[#075bdc] px-6 text-[13px] font-[900] text-white shadow-sm">
              요청 제출
            </button>
          </div>
        </form>
        <OperationNote kind={kind} />
      </div>
    </>
  );
}
