import {
  Banknote,
  CalendarCheck,
  CreditCard,
  FileText,
  Landmark,
  ShieldCheck,
  Truck,
  WalletCards,
  type LucideIcon
} from "lucide-react";
import type { RequestKind } from "../services/formValidation";

export const summary = {
  totalNeedCheckCount: 7,
  totalNeedCheckAmount: 86577903,
  monthlyNeedCount: 6,
  collectionNeedCount: 1
};

export const searchChips = ["수정세금계산서", "입금확인", "보증보험", "수금매칭", "계산서매칭"];

export const monthlyItems = [
  { label: "계산서 발행 필요", count: "3건", amount: "79,895,946원", icon: FileText, tone: "red" },
  { label: "출고 확인 필요", count: "2건", amount: "5,252,933원", icon: Truck, tone: "orange" },
  { label: "장기 미진행 거래", count: "1건", amount: "75,000원", icon: CalendarCheck, tone: "purple" },
  { label: "Deduct 확인 필요", count: "0건", amount: "0원", icon: ShieldCheck, tone: "teal" }
];

export const collectionItems = [
  { label: "수금 확인 필요", count: "1건", sub: "1,429,024원", icon: WalletCards, tone: "blue" },
  { label: "수금매칭 보류", count: "2건", sub: "부분입금 / 일괄입금 확인", icon: Banknote, tone: "purple" },
  { label: "입금매칭 오류", count: "1건", sub: "입금자명 / 거래처 확인", icon: CreditCard, tone: "red" }
];

export const quickRequests: Array<{ kind: RequestKind; label: string; icon: LucideIcon; tone: string }> = [
  { kind: "taxInvoice", label: "세금계산서\n발행 요청", icon: FileText, tone: "blue" },
  { kind: "revisedTaxInvoice", label: "수정세금계산서\n요청", icon: FileText, tone: "green" },
  { kind: "depositConfirmation", label: "입금확인\n요청", icon: Landmark, tone: "purple" },
  { kind: "invoiceMatching", label: "계산서매칭", icon: FileText, tone: "teal" }
];

export function toneClass(tone: string) {
  if (tone === "red") return "bg-[#fff0ef] text-[#ef4444]";
  if (tone === "orange") return "bg-[#fff3df] text-[#f97316]";
  if (tone === "purple") return "bg-[#f3edff] text-[#8b5cf6]";
  if (tone === "green") return "bg-[#e9f8f1] text-[#0d9b6c]";
  if (tone === "teal") return "bg-[#e8fbfb] text-[#0ea5a8]";
  if (tone === "pink") return "bg-[#ffeaf2] text-[#f04583]";
  return "bg-[#eaf2ff] text-[#2563eb]";
}
