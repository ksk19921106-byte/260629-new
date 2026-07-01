"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  FileCheck2,
  FileText,
  Landmark,
  Link2,
  MessageCircle,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  type LucideIcon
} from "lucide-react";
import { BlockedGateDialog } from "../components/BlockedGateDialog";
import { ModulePage } from "../components/ModulePage";
import { useSelectedUser } from "../hooks/useSelectedUser";
import { checkMonthEndGate } from "../services/monthEndGate";
import { REQUEST_FORM_CONFIGS, type RequestKind } from "../services/formValidation";

const requestCards: Array<{
  kind: RequestKind;
  group: "계산서" | "수금" | "계약" | "매칭" | "월마감";
  icon: LucideIcon;
  summary: string;
  chips: string[];
}> = [
  { kind: "taxInvoice", group: "계산서", icon: FileText, summary: "품목 내역 입력 시 공급가액, VAT, 합계액 자동 계산", chips: ["발행일자", "다품목", "자동계산"] },
  { kind: "revisedTaxInvoice", group: "계산서", icon: RotateCcw, summary: "전월 수정 여부 확인 후 기존 계산서와 수정 사유 접수", chips: ["사전확인", "수정사유", "리스크"] },
  { kind: "reverseIssueApproval", group: "계산서", icon: ShieldCheck, summary: "역발행 사이트, 최종금액, 건수 기준으로 처리 요청", chips: ["역발행", "최종금액", "건수"] },
  { kind: "depositConfirmation", group: "수금", icon: Landmark, summary: "입금일자, 계좌, 입금자명, 금액 기준으로 수금 확인", chips: ["회사계좌", "입금확인", "수금"] },
  { kind: "cardPayment", group: "수금", icon: CreditCard, summary: "카드매출전표 첨부 기준으로 카드결제 확인 요청", chips: ["전표필수", "카드결제", "대조"] },
  { kind: "guaranteeInsurance", group: "계약", icon: BadgeCheck, summary: "계약서 첨부와 보증조건 기준으로 보험 처리 요청", chips: ["계약서", "보증기간", "VAT포함"] },
  { kind: "invoiceMatching", group: "매칭", icon: Link2, summary: "계산서와 트래킹 흐름 연결 또는 잘못된 연결 해제", chips: ["매칭", "해제", "트래킹"] },
  { kind: "collectionMatching", group: "매칭", icon: Landmark, summary: "입금, 거래, 세금계산서 흐름 연결 또는 해제", chips: ["수금매칭", "부분입금", "해제"] },
  { kind: "monthEndCheck", group: "월마감", icon: FileCheck2, summary: "IKI 월마감 확인 중 VIPS팀 확인 필요 건 접수", chips: ["Gatekeeper", "IKI확인", "리스크"] }
];

const groups = ["전체", "계산서", "수금", "계약", "매칭", "월마감"] as const;

const helpCards = [
  { title: "어떤 요청인지 모르겠어요", body: "계산서/수금/매칭 흐름 기준으로 먼저 고르면 됩니다.", icon: Search },
  { title: "거래가 아직 안 끝났어요", body: "미종료 거래가 있으면 요청 진입이 차단됩니다. 거래 종료 관리에서 확인해주세요.", icon: ShieldCheck },
  { title: "VIPS팀 문의 바로가기", body: "요청 전 애매한 건은 VIPS팀에 먼저 확인합니다.", icon: MessageCircle }
];

export default function RequestsPage() {
  const { selectedUser } = useSelectedUser();
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState<(typeof groups)[number]>("전체");

  useEffect(() => {
    setLoading(true);
    checkMonthEndGate(selectedUser.name)
      .then((result) => setIsBlocked(result.isBlocked))
      .catch(() => setIsBlocked(false))
      .finally(() => setLoading(false));
  }, [selectedUser.name]);

  const visibleCards = useMemo(() => {
    const keyword = query.trim();
    return requestCards.filter((item) => {
      const config = REQUEST_FORM_CONFIGS[item.kind];
      const inGroup = activeGroup === "전체" || item.group === activeGroup;
      const inSearch = !keyword || [config.title, item.group, item.summary, ...item.chips].some((value) => value.includes(keyword));
      return inGroup && inSearch;
    });
  }, [activeGroup, query]);

  if (isBlocked) {
    return (
      <ModulePage
        eyebrow="Month-End Gatekeeper"
        title="VIPS팀 요청 제한"
        description="미종료 거래가 남아 있으면 VIPS팀 요청 기능을 사용할 수 없습니다."
      >
        <div className="mt-6 rounded-[20px] border border-red-100 bg-red-50 px-5 py-8 text-center text-[14px] font-[750] leading-6 text-[#435a7b]">
          미종료 거래가 남아 있어 VIPS팀 요청 진입이 불가합니다.
        </div>
        <BlockedGateDialog open={true} onClose={() => window.history.back()} />
      </ModulePage>
    );
  }

  return (
    <ModulePage
      eyebrow="VIPS Requests"
      title="VIPS팀 요청"
      description="필요한 요청을 검색하거나 카테고리로 골라 전용 Form으로 이동합니다."
    >
      <section className="ops-card mt-5 overflow-hidden bg-[#fbfcff]">
        <div className="grid grid-cols-[1.1fr_0.9fr] gap-4 px-5 py-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="ops-icon-circle">
                <Sparkles size={20} />
              </span>
              <p className="text-[12px] font-[950] uppercase tracking-[0.08em] text-[#2563eb]">Request Support Center</p>
            </div>
            <h2 className="mt-3 text-[26px] font-[950] tracking-[-0.025em] text-[#111827]">무슨 요청이 필요하세요?</h2>
            <p className="mt-2 text-[13px] font-[700] leading-5 text-[#64748b]">
              전자부품 유통 SALES 흐름에 맞춰 계산서, 수금, 매칭, 월마감 요청을 빠르게 찾습니다.
            </p>
            <div className="mt-5 flex h-12 items-center gap-3 rounded-[16px] border border-[#e5eaf3] bg-white px-4 shadow-sm">
              <Search size={19} className="text-[#2563eb]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="예: 전월 수정, 입금확인, 카드전표, 수금매칭"
                className="h-full min-w-0 flex-1 bg-transparent text-[14px] font-[750] text-[#10203f] outline-none placeholder:text-[#8a9bb4]"
              />
            </div>
          </div>

          <div className="grid gap-3">
            {helpCards.map((card) => (
              <article key={card.title} className="flex items-center gap-3 rounded-[16px] border border-[#edf1f6] bg-white px-4 py-3 shadow-sm">
                <span className="ops-icon-circle shrink-0">
                  <card.icon size={20} />
                </span>
                <span>
                  <span className="block text-[13px] font-[900] text-[#111827]">{card.title}</span>
                  <span className="mt-0.5 block text-[12px] font-[700] leading-5 text-[#64748b]">{card.body}</span>
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-5 flex flex-wrap gap-2">
        {groups.map((group) => (
          <button
            key={group}
            type="button"
            onClick={() => setActiveGroup(group)}
            className={`h-10 rounded-full px-4 text-[13px] font-[900] transition ${
              activeGroup === group ? "bg-[#2563eb] text-white shadow-sm" : "border border-[#e5eaf3] bg-white text-[#64748b] hover:bg-[#f8fbff]"
            }`}
          >
            {group}
          </button>
        ))}
      </div>

      <div data-request-menu-list="true" className="mt-4 grid grid-cols-3 gap-4">
        {visibleCards.map((item) => {
          const config = REQUEST_FORM_CONFIGS[item.kind];
          return (
            <a
              key={item.kind}
              href={`/requests/${item.kind}`}
              className="ops-card group p-4 text-left transition hover:-translate-y-0.5 hover:border-[#cbdaf5]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="ops-icon-circle">
                  <item.icon size={24} />
                </div>
                <span className="rounded-full bg-[#f3f6fb] px-3 py-1 text-[11px] font-[850] text-[#5b6b84]">{item.group}</span>
              </div>
              <h2 className="mt-4 text-[17px] font-[950] tracking-[-0.01em] text-[#111827]">{config.title}</h2>
              <p className="mt-2 min-h-[40px] text-[13px] font-[700] leading-5 text-[#64748b]">{item.summary}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {item.chips.map((chip) => (
                  <span key={chip} className="rounded-full border border-[#e7ecf4] bg-[#fbfdff] px-2.5 py-1 text-[11px] font-[850] text-[#435a7b]">
                    {chip}
                  </span>
                ))}
              </div>
              <div className="ops-btn-primary mt-5 flex h-10 items-center justify-between px-4 text-[13px] transition group-hover:bg-[#1d4ed8]">
                작성하기
                <ArrowRight size={16} />
              </div>
            </a>
          );
        })}
      </div>

      {visibleCards.length === 0 && (
        <div className="mt-4 rounded-[22px] border border-[#e7ecf4] bg-[#fbfdff] px-5 py-10 text-center text-[13px] font-[750] text-[#5b6b84]">
          검색 결과가 없습니다. 키워드를 조금 짧게 입력해보세요.
        </div>
      )}

      <div className="mt-5 rounded-[18px] border border-[#dce6f3] bg-[#fbfdff] px-4 py-3 text-[12px] font-[750] leading-5 text-[#435a7b]">
        미종료 거래가 남아 있어 VIPS팀 요청 진입이 불가합니다. 요청이 막히면 거래 종료 관리에서 내 미종료 거래를 먼저 확인해주세요.
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            (() => {
              const users = { Sally: true, Harvey: true, Tommy: true };
              const currentUser = () => {
                const params = new URLSearchParams(window.location.search);
                const fromUrl = params.get("user");
                if (users[fromUrl]) {
                  window.localStorage.setItem("icbanq.ops.selectedUser", fromUrl);
                  return fromUrl;
                }
                const stored = window.localStorage.getItem("icbanq.ops.selectedUser");
                return users[stored] ? stored : "Sally";
              };
              const showBlockedGate = (user) => {
                if (document.querySelector("[data-request-menu-blocked-gate]")) return;
                const list = document.querySelector("[data-request-menu-list]");
                if (list) list.style.display = "none";
                const panel = document.createElement("div");
                panel.setAttribute("data-request-menu-blocked-gate", "true");
                panel.className = "mt-6 rounded-[22px] border border-red-100 bg-red-50 px-5 py-8 text-center";
                panel.innerHTML = '<p class="text-[18px] font-[900] text-[#10203f]">VIPS팀 요청 진입 불가</p><p class="mt-2 text-[13px] font-[700] leading-6 text-[#435a7b]">' + user + '님은 미종료 거래가 남아 있습니다. 거래가 정상 종료되기 전에는 모든 VIPS팀 요청 메뉴에 진입할 수 없습니다.</p>';
                const anchor = document.querySelector("[data-request-menu-list]");
                if (anchor && anchor.parentElement) anchor.parentElement.insertBefore(panel, anchor);

                const modal = document.createElement("div");
                modal.setAttribute("data-request-menu-blocked-gate", "true");
                modal.className = "fixed inset-0 z-[80] flex items-center justify-center bg-[#0d1b3e]/35 px-4";
                modal.innerHTML = '<div class="w-[520px] rounded-[24px] border border-red-100 bg-white p-6 shadow-[0_26px_80px_rgba(30,37,52,0.24)]"><p class="text-[18px] font-[900] text-[#10203f]">VIPS팀 요청 진입 불가</p><p class="mt-3 whitespace-pre-line text-[13px] font-[700] leading-6 text-[#435a7b]">미종료 거래가 남아 있어 VIPS팀 요청 진입이 불가합니다.\\n거래 종료 관리에서 남은 거래를 먼저 확인해주세요.</p><div class="mt-5 flex gap-2"><button data-open-trades="true" class="h-11 flex-1 rounded-xl bg-red-600 text-[13px] font-[900] text-white">미종료 거래 확인하기</button><button data-open-iki="true" class="h-11 flex-1 rounded-xl bg-[#075bdc] text-[13px] font-[900] text-white">IKI 월마감 바로가기</button><button data-back-home="true" class="h-11 flex-1 rounded-xl border border-[#dce6f3] bg-white text-[13px] font-[900] text-[#34496b]">홈으로</button></div></div>';
                document.body.appendChild(modal);
                modal.querySelector("[data-open-trades]")?.addEventListener("click", () => window.location.href = "/month-end");
                modal.querySelector("[data-open-iki]")?.addEventListener("click", () => window.open("https://iki.icbanq.com", "_blank", "noopener,noreferrer"));
                modal.querySelector("[data-back-home]")?.addEventListener("click", () => {
                  window.location.href = "/";
                });
              };
              fetch("/api/month-end/blocked?user=" + encodeURIComponent(currentUser()), { cache: "no-store" })
                .then((response) => response.json())
                .then((result) => {
                  if (result && result.isBlocked) showBlockedGate(result.user || currentUser());
                })
                .catch(() => {});
            })();
          `
        }}
      />
    </ModulePage>
  );
}
