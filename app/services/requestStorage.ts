import type { RequestFormValues, RequestKind } from "./formValidation";

export type RequestStatus = "요청접수" | "VIPS팀 확인중" | "완료" | "반려";

export type RequestItem = {
  id: string;
  type: string;
  kind?: RequestKind;
  companyName: string;
  requester: string;
  requestedAt: string;
  issueDate: string;
  itemName: string;
  quantity: string;
  unitPrice: string;
  supplyAmount: string;
  totalAmount: string;
  note: string;
  status: RequestStatus;
  result: string;
  processor: string;
  processedAt: string;
  details?: Record<string, string>;
};

export type RequestCreatePayload = {
  kind: RequestKind;
  values: RequestFormValues;
  totalAmount: string;
  existingCount: number;
  requester: string;
};

export type TaxInvoiceRequestPayload = RequestCreatePayload;

export type RequestUpdatePayload = {
  id: string;
  status: RequestStatus;
  result: string;
};

export async function fetchRequests(): Promise<RequestItem[]> {
  const response = await fetch("/api/requests", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("VIPS request fetch failed");
  }

  const data = (await response.json()) as { items: RequestItem[] };
  return data.items;
}

export async function saveRequest(payload: RequestCreatePayload): Promise<RequestItem> {
  const response = await fetch("/api/requests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("VIPS request storage failed");
  }

  const data = (await response.json()) as { item: RequestItem };
  return data.item;
}

export async function updateRequest(payload: RequestUpdatePayload): Promise<RequestItem> {
  const response = await fetch("/api/requests", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("VIPS request update failed");
  }

  const data = (await response.json()) as { item: RequestItem };
  return data.item;
}
