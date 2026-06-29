export type ClosingIssueType =
  | "invoice_required"
  | "shipment_check"
  | "long_pending"
  | "collection_check"
  | "deduct_check"
  | "sales_unshipped";

export type ClosingIssue = {
  id: string;
  sourceRowId: string;
  team: string;
  fSales: string;
  iSales: string;
  company: string;
  companyCount?: number;
  issueType: ClosingIssueType;
  issueLabel: string;
  amount: number;
  shipmentDays?: number;
  taxIssueDays?: number;
  priority: "high" | "medium" | "low";
  recommendedAction: string;
  uploadedAt: string;
  uploadedBy: string;
  status: "open" | "done" | "dismissed";
  memo?: string;
};

export type ClosingSnapshot = {
  id: string;
  closingMonth: string;
  uploadedAt: string;
  uploadedBy: string;
  rawText: string;
  issues: ClosingIssue[];
};

export type ClosingParseResult = {
  ok: boolean;
  rowCount: number;
  issues: ClosingIssue[];
  message: string;
  missingColumns: string[];
};

const issueMeta: Record<ClosingIssueType, { label: string; action: string }> = {
  invoice_required: {
    label: "계산서 발행 필요",
    action: "출고는 완료됐지만 계산서가 아직 연결되지 않았습니다. 세금계산서 발행 요청이 필요합니다."
  },
  shipment_check: {
    label: "출고 확인 필요",
    action: "입고와 계산서 흐름은 있으나 출고 상태가 비어 있습니다. 출고 진행 여부를 확인해주세요."
  },
  long_pending: {
    label: "장기 미진행 거래",
    action: "입고 이후 출고와 계산서가 모두 멈춰 있습니다. 거래 진행 상태를 먼저 확인해주세요."
  },
  collection_check: {
    label: "수금 확인 필요",
    action: "AR 지연 금액이 있습니다. 입금 확인 또는 수금관리 확인이 필요합니다."
  },
  deduct_check: {
    label: "차감/공제 확인 필요",
    action: "Deduct 금액이 있습니다. 차감 사유와 반영 여부를 확인해주세요."
  },
  sales_unshipped: {
    label: "세일즈 미출고 확인 필요",
    action: "세일즈 미출고 건입니다. 출고 처리 가능 여부와 보류 사유를 확인해주세요."
  }
};

function normalizeMoney(value: string | undefined) {
  if (!value) return 0;
  const match = value.replace(/,/g, "").replace(/원/g, "").replace(/\s/g, "").match(/-?\d+(\.\d+)?/);
  return match ? Math.round(Number(match[0])) : 0;
}

function normalizeCount(value: string | undefined) {
  if (!value) return undefined;
  const compact = value.replace(/,/g, "");
  const companyCountMatch = compact.match(/(?:업체|company|거래처)[^\d-]*(\d+)/i);
  if (companyCountMatch) return Number(companyCountMatch[1]);
  const firstNumber = compact.match(/\d+/);
  return firstNumber ? Number(firstNumber[0]) : undefined;
}

function splitSalesPair(value: string) {
  const normalized = value.replace(/\s*\n\s*/g, " ").replace(/\s+/g, " ").trim();
  const parts = normalized.split("/").map((part) => part.trim()).filter(Boolean);

  if (parts.length >= 2) {
    return { fSales: parts[0], iSales: parts.slice(1).join(" / ") };
  }

  const fallback = normalized || "미지정";
  return { fSales: fallback, iSales: fallback };
}

function priorityFor(type: ClosingIssueType, amount: number, shipmentDays: number, taxIssueDays: number): "high" | "medium" | "low" {
  if ((type === "invoice_required" || type === "collection_check") && amount >= 1000000) return "high";
  if (taxIssueDays >= 14 || shipmentDays >= 14) return "high";
  if (amount > 0 || Math.max(shipmentDays, taxIssueDays) >= 7) return "medium";
  return "low";
}

function createIssue(params: {
  rowNo: string;
  team: string;
  salesPair: string;
  company: string;
  companyCount?: number;
  type: ClosingIssueType;
  amount: number;
  shipmentDays: number;
  taxIssueDays: number;
  uploadedAt: string;
  uploadedBy: string;
}): ClosingIssue {
  const meta = issueMeta[params.type];
  const { fSales, iSales } = splitSalesPair(params.salesPair);

  return {
    id: `${params.uploadedAt}-${params.rowNo}-${fSales}-${iSales}-${params.type}`,
    sourceRowId: `erp-row-${params.rowNo}`,
    team: params.team || "-",
    fSales,
    iSales,
    company: params.company,
    companyCount: params.companyCount,
    issueType: params.type,
    issueLabel: meta.label,
    amount: params.amount,
    shipmentDays: params.shipmentDays,
    taxIssueDays: params.taxIssueDays,
    priority: priorityFor(params.type, params.amount, params.shipmentDays, params.taxIssueDays),
    recommendedAction: meta.action,
    uploadedAt: params.uploadedAt,
    uploadedBy: params.uploadedBy,
    status: "open"
  };
}

function splitErpRows(text: string) {
  const rows: string[][] = [];
  let current: string[] = [];

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    if (!line.trim()) continue;

    if (/^\d+\t/.test(line)) {
      if (current.length > 0) rows.push(current);
      current = [line];
      continue;
    }

    if (current.length > 0) current.push(line);
  }

  if (current.length > 0) rows.push(current);
  return rows;
}

function parseErpMultiLinePaste(text: string, uploadedBy: string, uploadedAt: string): ClosingParseResult | null {
  const rowBlocks = splitErpRows(text);
  if (rowBlocks.length === 0) return null;

  const issues: ClosingIssue[] = [];
  let parsedRows = 0;

  for (const rowBlock of rowBlocks) {
    const cells = rowBlock.join("\n").split("\t").map((cell) => cell.trim());
    if (cells.length < 14 || !/^\d+$/.test(cells[0])) continue;

    parsedRows += 1;

    const rowNo = cells[0];
    const team = cells[1] || "-";
    const salesPair = cells[2] || "미지정";
    const companyCount = normalizeCount(cells[3]);
    const { fSales, iSales } = splitSalesPair(salesPair);
    const company = `${team} ${fSales} / ${iSales} 월마감 집계`;
    const shipmentDays = normalizeMoney(cells[6]);
    const taxIssueDays = normalizeMoney(cells[7]);

    const issueValues: Array<[ClosingIssueType, number]> = [
      ["collection_check", normalizeMoney(cells[8])],
      ["deduct_check", normalizeMoney(cells[9])],
      ["shipment_check", normalizeMoney(cells[10])],
      ["invoice_required", normalizeMoney(cells[11])],
      ["long_pending", normalizeMoney(cells[12])],
      ["sales_unshipped", normalizeMoney(cells[13])]
    ];

    for (const [type, amount] of issueValues) {
      if (amount <= 0) continue;
      issues.push(createIssue({ rowNo, team, salesPair, company, companyCount, type, amount, shipmentDays, taxIssueDays, uploadedAt, uploadedBy }));
    }
  }

  if (parsedRows === 0) return null;

  return {
    ok: true,
    rowCount: parsedRows,
    issues,
    message: `ERP 복사 데이터 ${parsedRows}개 행을 인식했습니다. 확인 필요 이슈 ${issues.length}건을 생성했습니다.`,
    missingColumns: []
  };
}

export function parseClosingPaste(text: string, uploadedBy = "Sally", uploadedAt = new Date().toISOString()): ClosingParseResult {
  const normalizedText = text.trim();

  if (!normalizedText) {
    return {
      ok: false,
      rowCount: 0,
      issues: [],
      message: "데이터를 인식하지 못했습니다. ERP 월마감 화면에서 표 전체를 복사한 뒤 다시 붙여넣어주세요.",
      missingColumns: ["ERP pasted table"]
    };
  }

  const erpResult = parseErpMultiLinePaste(normalizedText, uploadedBy, uploadedAt);
  if (erpResult) return erpResult;

  return {
    ok: false,
    rowCount: 0,
    issues: [],
    message: "필수 컬럼을 충분히 인식하지 못했습니다. ERP 월마감 화면에서 표 전체를 복사한 뒤 다시 붙여넣어주세요.",
    missingColumns: ["NO", "TEAM", "FSales / ISales", "출고/계산서/AR/Deduct columns"]
  };
}

export function formatKrw(value: number) {
  return `${Math.round(value).toLocaleString("ko-KR")}원`;
}

export function getIssueActionLabel(issueType: ClosingIssueType) {
  switch (issueType) {
    case "invoice_required":
      return "세금계산서 요청";
    case "shipment_check":
      return "출고 확인";
    case "long_pending":
      return "진행상태 확인";
    case "collection_check":
      return "수금관리 이동";
    case "deduct_check":
      return "차감 사유 입력";
    case "sales_unshipped":
      return "출고 처리 확인";
    default:
      return "확인";
  }
}
