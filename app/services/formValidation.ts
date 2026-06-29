export type RequestKind =
  | "taxInvoice"
  | "revisedTaxInvoice"
  | "reverseIssueApproval"
  | "depositConfirmation"
  | "cardPayment"
  | "guaranteeInsurance"
  | "invoiceMatching"
  | "collectionMatching"
  | "monthEndCheck";

export type RequestFormValues = {
  companyName: string;
  contactEmail: string;
  issueDate: string;
  originalInvoiceNo: string;
  originalInvoiceLink: string;
  revisionChange: string;
  revisionReason: string;
  approvalNo: string;
  reverseIssueSite: string;
  reverseIssueCount: string;
  reverseFinalAmount: string;
  itemName: string;
  quantity: string;
  unitPrice: string;
  supplyAmount: string;
  vatAmount: string;
  invoiceTotalAmount: string;
  trackingMatchStatus: string;
  trackingNumber: string;
  trackingMatchMemo: string;
  depositDate: string;
  depositAccount: string;
  depositorName: string;
  depositAmount: string;
  paymentDate: string;
  paymentAmount: string;
  cardReceiptName: string;
  guaranteeRequestType: string;
  guaranteeType: string;
  guaranteeRate: string;
  guaranteeStartDate: string;
  guaranteeEndDate: string;
  contractName: string;
  contractAmount: string;
  contractFileName: string;
  invoiceMatchType: string;
  invoiceLink: string;
  trackingLink: string;
  matchReason: string;
  collectionMatchType: string;
  collectionLink: string;
  collectionTrackingUrl: string;
  collectionInvoiceLink: string;
  monthEndCase: string;
  note: string;
};

export type RequestFormField = keyof RequestFormValues;

export type RequestFormConfig = {
  kind: RequestKind;
  title: string;
  formTitle: string;
  subtitle: string;
  requiresTaxPrecheck?: boolean;
  requiredFields: RequestFormField[];
};

export const REQUEST_FORM_CONFIGS: Record<RequestKind, RequestFormConfig> = {
  taxInvoice: {
    kind: "taxInvoice",
    title: "세금계산서 발행 요청",
    formTitle: "세금계산서 발행 요청",
    subtitle: "발행일자, 업체명, 품목 내역을 기준으로 공급가액과 VAT를 자동 계산합니다.",
    requiresTaxPrecheck: true,
    requiredFields: ["companyName", "contactEmail", "issueDate", "itemName", "quantity", "unitPrice"]
  },
  revisedTaxInvoice: {
    kind: "revisedTaxInvoice",
    title: "수정세금계산서 요청",
    formTitle: "수정세금계산서 요청",
    subtitle: "기존 세금계산서 링크, 수정사항, 수정이유를 기준으로 검토 요청합니다.",
    requiredFields: ["companyName", "originalInvoiceLink", "revisionChange", "revisionReason"]
  },
  reverseIssueApproval: {
    kind: "reverseIssueApproval",
    title: "역발행 요청",
    formTitle: "역발행 세금계산서 요청",
    subtitle: "역발행 사이트, 최종금액, 건수를 기준으로 VIPS팀 처리를 요청합니다.",
    requiredFields: ["reverseIssueSite", "reverseFinalAmount", "reverseIssueCount"]
  },
  depositConfirmation: {
    kind: "depositConfirmation",
    title: "입금확인 요청(등록)",
    formTitle: "입금확인 요청",
    subtitle: "입금일자, 계좌, 입금자명, 입금금액을 기준으로 확인 요청합니다.",
    requiredFields: ["companyName", "depositDate", "depositAccount", "depositorName", "depositAmount", "note"]
  },
  cardPayment: {
    kind: "cardPayment",
    title: "카드결제 확인 요청(등록)",
    formTitle: "카드결제 확인 요청",
    subtitle: "카드매출전표를 첨부해 결제 확인을 요청합니다.",
    requiredFields: ["companyName", "paymentDate", "paymentAmount", "cardReceiptName", "note"]
  },
  guaranteeInsurance: {
    kind: "guaranteeInsurance",
    title: "보증보험 요청",
    formTitle: "보증보험 요청",
    subtitle: "계약 조건과 계약서 첨부 정보를 기준으로 보증보험 발급/처리를 요청합니다.",
    requiredFields: [
      "guaranteeRequestType",
      "guaranteeType",
      "companyName",
      "guaranteeRate",
      "guaranteeStartDate",
      "guaranteeEndDate",
      "contractName",
      "contractAmount",
      "contractFileName"
    ]
  },
  invoiceMatching: {
    kind: "invoiceMatching",
    title: "계산서매칭/해제 요청",
    formTitle: "계산서매칭/해제 요청",
    subtitle: "계산서와 트래킹 연결 또는 연결 해제를 하나의 흐름으로 접수합니다.",
    requiredFields: ["invoiceMatchType", "companyName", "invoiceLink", "trackingLink", "matchReason"]
  },
  collectionMatching: {
    kind: "collectionMatching",
    title: "수금매칭/해제 요청",
    formTitle: "수금매칭/해제 요청",
    subtitle: "수금과 거래 또는 세금계산서 연결/해제 요청을 접수합니다.",
    requiredFields: ["collectionMatchType", "companyName", "collectionLink", "collectionTrackingUrl", "collectionInvoiceLink", "matchReason"]
  },
  monthEndCheck: {
    kind: "monthEndCheck",
    title: "월마감 관련 확인 요청",
    formTitle: "월마감 관련 확인 요청",
    subtitle: "IKI 월마감 확인 중 VIPS팀 확인이 필요한 건을 요청합니다.",
    requiredFields: ["companyName", "monthEndCase", "note"]
  }
};

export const initialRequestFormValues: RequestFormValues = {
  companyName: "",
  contactEmail: "",
  issueDate: "",
  originalInvoiceNo: "",
  originalInvoiceLink: "",
  revisionChange: "",
  revisionReason: "",
  approvalNo: "",
  reverseIssueSite: "",
  reverseIssueCount: "",
  reverseFinalAmount: "",
  itemName: "",
  quantity: "",
  unitPrice: "",
  supplyAmount: "",
  vatAmount: "",
  invoiceTotalAmount: "",
  trackingMatchStatus: "",
  trackingNumber: "",
  trackingMatchMemo: "",
  depositDate: "",
  depositAccount: "",
  depositorName: "",
  depositAmount: "",
  paymentDate: "",
  paymentAmount: "",
  cardReceiptName: "",
  guaranteeRequestType: "",
  guaranteeType: "",
  guaranteeRate: "",
  guaranteeStartDate: "",
  guaranteeEndDate: "",
  contractName: "",
  contractAmount: "",
  contractFileName: "",
  invoiceMatchType: "",
  invoiceLink: "",
  trackingLink: "",
  matchReason: "",
  collectionMatchType: "",
  collectionLink: "",
  collectionTrackingUrl: "",
  collectionInvoiceLink: "",
  monthEndCase: "",
  note: ""
};

export function validateRequestForm(kind: RequestKind, values: RequestFormValues) {
  const missingFields = REQUEST_FORM_CONFIGS[kind].requiredFields.filter((field) => !values[field].trim());
  const contractFileExtension = values.contractFileName.split(".").pop()?.toLowerCase();
  const hasInvalidContractFile =
    kind === "guaranteeInsurance" &&
    Boolean(values.contractFileName.trim()) &&
    !["pdf", "jpg", "jpeg", "png"].includes(contractFileExtension ?? "");

  return {
    isValid: missingFields.length === 0 && !hasInvalidContractFile,
    missingFields
  };
}

export type RequiredTaxFormField = RequestFormField;
export type TaxFormValues = RequestFormValues;

export function validateTaxInvoiceForm(values: RequestFormValues) {
  return validateRequestForm("taxInvoice", values);
}
