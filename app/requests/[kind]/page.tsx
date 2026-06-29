import Link from "next/link";
import { ModulePage } from "../../components/ModulePage";
import { REQUEST_FORM_CONFIGS, type RequestKind } from "../../services/formValidation";
import { RequestKindForm } from "./RequestKindForm";

const requestKinds = Object.keys(REQUEST_FORM_CONFIGS) as RequestKind[];

export default async function RequestKindPage({ params }: { params: Promise<{ kind: string }> }) {
  const { kind: rawKind } = await params;
  const kind = rawKind as RequestKind;
  const config = REQUEST_FORM_CONFIGS[kind];

  if (!config || !requestKinds.includes(kind)) {
    return (
      <ModulePage eyebrow="VIPS Requests" title="요청 유형을 찾을 수 없습니다" description="요청 메뉴에서 다시 선택해주세요.">
        <Link href="/requests" className="mt-6 inline-flex h-10 items-center rounded-full bg-[#075bdc] px-4 text-[13px] font-[850] text-white">
          요청 메뉴로 돌아가기
        </Link>
      </ModulePage>
    );
  }

  return (
    <ModulePage eyebrow="VIPS Request Form" title={config.formTitle} description={config.subtitle}>
      <RequestKindForm kind={kind} />
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
                if (document.querySelector("[data-request-blocked-gate]")) return;
                document.querySelectorAll("form").forEach((form) => {
                  form.style.display = "none";
                });
                const panel = document.createElement("div");
                panel.setAttribute("data-request-blocked-gate", "true");
                panel.className = "mt-6 rounded-[22px] border border-red-100 bg-red-50 px-5 py-8 text-center";
                panel.innerHTML = '<p class="text-[18px] font-[900] text-[#10203f]">VIPS팀 요청 진입 불가</p><p class="mt-2 text-[13px] font-[700] leading-6 text-[#435a7b]">' + user + '님은 미종료 거래가 남아 있습니다. 거래가 정상 종료되기 전에는 모든 VIPS팀 요청 작성 화면에 진입할 수 없습니다.</p>';
                const anchor = document.querySelector("form") || document.querySelector("main");
                if (anchor && anchor.parentElement) anchor.parentElement.insertBefore(panel, anchor);

                const modal = document.createElement("div");
                modal.setAttribute("data-request-blocked-gate", "true");
                modal.className = "fixed inset-0 z-[80] flex items-center justify-center bg-[#0d1b3e]/35 px-4";
                modal.innerHTML = '<div class="w-[520px] rounded-[24px] border border-red-100 bg-white p-6 shadow-[0_26px_80px_rgba(30,37,52,0.24)]"><p class="text-[18px] font-[900] text-[#10203f]">VIPS팀 요청 진입 불가</p><p class="mt-3 whitespace-pre-line text-[13px] font-[700] leading-6 text-[#435a7b]">미종료 거래가 남아 있어 VIPS팀 요청 진입이 불가합니다.\\n거래 종료 관리에서 남은 거래를 먼저 확인해주세요.</p><div class="mt-5 flex gap-2"><button data-open-trades="true" class="h-11 flex-1 rounded-xl bg-red-600 text-[13px] font-[900] text-white">미종료 거래 확인하기</button><button data-open-iki="true" class="h-11 flex-1 rounded-xl bg-[#075bdc] text-[13px] font-[900] text-white">IKI 월마감 바로가기</button><button data-back-requests="true" class="h-11 flex-1 rounded-xl border border-[#dce6f3] bg-white text-[13px] font-[900] text-[#34496b]">요청 메뉴로</button></div></div>';
                document.body.appendChild(modal);
                modal.querySelector("[data-open-trades]")?.addEventListener("click", () => window.location.href = "/month-end");
                modal.querySelector("[data-open-iki]")?.addEventListener("click", () => window.open("https://iki.icbanq.com", "_blank", "noopener,noreferrer"));
                modal.querySelector("[data-back-requests]")?.addEventListener("click", () => {
                  window.location.href = "/requests";
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
      {kind === "taxInvoice" && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                const formatWon = (value) => Math.floor(value || 0).toLocaleString("ko-KR") + "원";
                const numberValue = (value) => Number(String(value || "").replaceAll(",", "")) || 0;
                const visibleLines = () => Array.from(document.querySelectorAll('[data-tax-line]')).filter((line) => !line.classList.contains("hidden"));
                const updateTaxAmounts = () => {
                  const supplyTarget = document.querySelector('[data-tax-calc="supply"]');
                  const vatTarget = document.querySelector('[data-tax-calc="vat"]');
                  const totalTarget = document.querySelector('[data-tax-calc="total"]');
                  if (!supplyTarget || !vatTarget || !totalTarget) return;
                  let supply = 0;
                  visibleLines().forEach((line) => {
                    const index = line.getAttribute("data-tax-line");
                    const quantityInput = line.querySelector('[data-tax-quantity]');
                    const unitPriceInput = line.querySelector('[data-tax-unit]');
                    const lineSupplyTarget = document.querySelector('[data-tax-line-supply="' + index + '"]');
                    const lineSupply = numberValue(quantityInput && quantityInput.value) * numberValue(unitPriceInput && unitPriceInput.value);
                    supply += lineSupply;
                    if (lineSupplyTarget) lineSupplyTarget.textContent = formatWon(lineSupply);
                  });
                  const vat = Math.floor(supply * 0.1);
                  const total = supply + vat;
                  supplyTarget.textContent = formatWon(supply);
                  vatTarget.textContent = formatWon(vat);
                  totalTarget.textContent = formatWon(total);
                };
                const bindTaxLineControls = () => {
                  const addButton = document.querySelector('[data-add-tax-line="true"]');
                  if (addButton && addButton.dataset.bound !== "true") {
                    addButton.dataset.bound = "true";
                    addButton.addEventListener("click", () => {
                      const nextLine = Array.from(document.querySelectorAll('[data-tax-line].hidden'))[0];
                      if (nextLine) nextLine.classList.remove("hidden");
                      if (!Array.from(document.querySelectorAll('[data-tax-line].hidden')).length) addButton.setAttribute("disabled", "true");
                      updateTaxAmounts();
                    });
                  }
                  document.querySelectorAll('[data-remove-tax-line]').forEach((button) => {
                    if (button.dataset.bound === "true") return;
                    button.dataset.bound = "true";
                    button.addEventListener("click", () => {
                      const index = button.getAttribute("data-remove-tax-line");
                      const line = document.querySelector('[data-tax-line="' + index + '"]');
                      if (!line) return;
                      line.querySelectorAll("input").forEach((input) => {
                        input.value = "";
                      });
                      line.classList.add("hidden");
                      const add = document.querySelector('[data-add-tax-line="true"]');
                      if (add) add.removeAttribute("disabled");
                      updateTaxAmounts();
                    });
                  });
                };
                window.clearInterval(window.__icbanqTaxCalcTimer);
                window.__icbanqTaxCalcTimer = window.setInterval(() => {
                  bindTaxLineControls();
                  updateTaxAmounts();
                }, 120);
                window.addEventListener("input", updateTaxAmounts, true);
                window.addEventListener("change", updateTaxAmounts, true);
                bindTaxLineControls();
                updateTaxAmounts();
              })();
            `
          }}
        />
      )}
      {kind === "revisedTaxInvoice" && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                const bindRevisionConfirm = () => {
                  const button = document.querySelector('[data-revision-confirm="true"]');
                  const modal = document.querySelector('[data-revision-modal="true"]');
                  if (!button || !modal || button.dataset.bound === "true") return;
                  button.dataset.bound = "true";
                  button.addEventListener("click", () => {
                    modal.remove();
                  });
                };
                bindRevisionConfirm();
                window.clearInterval(window.__icbanqRevisionModalTimer);
                window.__icbanqRevisionModalTimer = window.setInterval(bindRevisionConfirm, 120);
              })();
            `
          }}
        />
      )}
    </ModulePage>
  );
}
