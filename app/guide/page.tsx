"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  Calculator,
  CheckSquare,
  FileQuestion,
  HelpCircle,
  LibraryBig,
  MonitorCheck,
  Search,
  ShieldAlert,
  Sparkles,
  Tags
} from "lucide-react";
import { ModulePage } from "../components/ModulePage";
import { wikiArticles, wikiCategoryLabels, type WikiArticle, type WikiCategory } from "../services/wikiArticles";

const categoryMeta: Record<WikiCategory, { desc: string; icon: typeof MonitorCheck; tone: string }> = {
  iki: { desc: "Tracking, Order, Accounting 기준으로 바로 따라 하는 IKI 실무 가이드입니다.", icon: MonitorCheck, tone: "blue" },
  ops: { desc: "Home, 월마감, 수금관리, VIPS 요청을 업무 흐름으로 이해합니다.", icon: Sparkles, tone: "green" },
  tax: { desc: "Sales가 알아야 하는 계산서, 부가세, AR, Deduct 기본 개념입니다.", icon: Calculator, tone: "orange" },
  faq: { desc: "업무 중 자주 막히는 상황을 질문과 답변으로 빠르게 찾습니다.", icon: HelpCircle, tone: "purple" },
  mistake: { desc: "반복 실수를 실제 상황처럼 보고 예방 방법을 확인합니다.", icon: ShieldAlert, tone: "red" },
  glossary: { desc: "AR, Booking, Billing, COC처럼 자주 나오는 회사 용어를 확인합니다.", icon: LibraryBig, tone: "slate" }
};

const categoryOrder: WikiCategory[] = ["iki", "ops", "tax", "faq", "mistake", "glossary"];
const situationChips = ["계산서", "입금", "출고", "발주", "월마감", "반려", "AR", "COC", "여신", "가상계산서", "퀵배송", "선출고"];
const recommendedKeywords = ["수정세금계산서", "입금확인", "COC", "AR", "월마감", "왜 반려", "퀵배송", "가상계산서"];

const naturalLanguageIntents: Array<{ terms: string[]; articleIds: string[] }> = [
  { terms: ["출고안됨", "출고안돼", "출고막힘", "출고가안돼요", "출고불가"], articleIds: ["iki-advance-shipment", "iki-arrange", "iki-credit-request", "ops-month-end"] },
  { terms: ["입금들어왔는데", "입금들어옴", "입금됐는데", "입금확인", "돈들어왔", "입금"], articleIds: ["iki-payment", "ops-collections", "iki-collect-money", "ops-collection-match", "tax-ar"] },
  { terms: ["계산서왜안", "계산서안끊", "계산서발행", "계산서"], articleIds: ["iki-tracking-tax-issue", "tax-issue-timing", "tax-revise", "tax-virtual-invoice", "ops-invoice-match"] },
  { terms: ["반려", "왜반려", "요청반려", "수정반려"], articleIds: ["faq-2", "faq-6", "ops-request-status", "ops-request", "mistake-4"] },
  { terms: ["여신막힘", "여신만료", "한도초과", "선출고"], articleIds: ["iki-advance-shipment", "iki-credit-request", "tax-ar", "ops-gatekeeper"] },
  { terms: ["퀵배송", "긴급출고", "당일출고"], articleIds: ["iki-quick-delivery-approval", "iki-arrange", "iki-shipment"] },
  { terms: ["coc", "증명서", "인증서"], articleIds: ["iki-coc", "iki-order-coc-request", "glossary-coc"] },
  { terms: ["가상계산서", "가상계산"], articleIds: ["tax-virtual-invoice", "iki-virtual-tax", "iki-invoice-date"] },
  { terms: ["수금매칭", "매칭안됨", "ar남음"], articleIds: ["ops-collection-match", "iki-collect-money", "ops-collections", "mistake-10"] }
];

const titleMap: Record<string, string> = {
  "iki-arrange": "출고 요청하기",
  "iki-quick-delivery-approval": "퀵배송 승인 요청",
  "iki-tracking-search": "Tracking 검색하기",
  "iki-tracking-tax-issue": "계산서 발행하기",
  "iki-advance-shipment": "선출고 승인 요청",
  "iki-collect-money": "수금매칭하기",
  "iki-rma": "RMA 처리하기",
  "iki-coc": "COC 작성 및 발송하기",
  "iki-order-split": "Order 분할하기",
  "iki-month-end-write": "월마감 의견 작성하기",
  "iki-order-quotation-to-order": "Quotation을 Order로 전환하기",
  "iki-order-attachment": "발주요청 파일 첨부하기",
  "iki-order-coc-request": "COC 요청 남기기",
  "iki-order-hold": "Order Hold 설정하기",
  "iki-order-delete": "Order 삭제하기",
  "iki-payment-request": "입금요청서 발송하기",
  "iki-delivery-statement": "거래명세서 다운로드하기",
  "iki-order-memo": "Order Memo 남기기",
  "iki-invoice-date": "계산서 발행일 설정하기",
  "iki-auto-issue-exclude": "자동발행 제외하기",
  "iki-shop-share": "Shop Share 확인하기",
  "iki-credit-request": "여신 신청/연장하기"
};

function toneClass(tone: string) {
  if (tone === "green") return "bg-[#ecfdf5] text-[#059669]";
  if (tone === "orange") return "bg-[#fff7e8] text-[#d97706]";
  if (tone === "purple") return "bg-[#f5f3ff] text-[#7c3aed]";
  if (tone === "red") return "bg-[#fff0ef] text-[#dc2626]";
  if (tone === "slate") return "bg-[#f1f5f9] text-[#475569]";
  return "bg-[#eef6ff] text-[#2563eb]";
}

function displayTitle(article: WikiArticle) {
  return titleMap[article.id] ?? article.title.replace(/^Tracking\s+/, "").replace(/^Order\s+/, "");
}

function articleGroup(article: WikiArticle) {
  if (article.category === "iki") {
    if (article.id.includes("order") || article.title.includes("Order") || article.title.includes("Quotation") || article.title.includes("여신") || article.title.includes("입금요청서")) return "Order";
    if (article.title.includes("Accounting") || article.title.includes("입금")) return "Accounting";
    return "Tracking";
  }
  if (article.category === "ops") return "OPS";
  if (article.category === "tax") return "Tax";
  if (article.category === "faq") return "FAQ";
  if (article.category === "mistake") return "Mistake";
  return "Glossary";
}

function getSection(article: WikiArticle, heading: string) {
  return article.sections.find((section) => section.heading === heading)?.body ?? [];
}

function quickSteps(article: WikiArticle) {
  return getSection(article, "처리 순서").map((step) => step.replace(/^\d+\.\s*/, "").replace(/합니다\.$/, "").replace(/합니다$/, ""));
}

function articleSummary(article: WikiArticle) {
  return getSection(article, "언제 사용하는가")[0] ?? getSection(article, "의미")[0] ?? article.description;
}

function iconForArticle(article: WikiArticle) {
  const title = displayTitle(article);
  if (title.includes("출고")) return "🚚";
  if (title.includes("퀵")) return "⚡";
  if (title.includes("계산서")) return "🧾";
  if (title.includes("수금") || title.includes("입금") || title.includes("AR")) return "💳";
  if (title.includes("COC")) return "📄";
  if (title.includes("여신") || title.includes("선출고")) return "🛡";
  if (article.category === "faq") return "❓";
  if (article.category === "mistake") return "⚠";
  if (article.category === "glossary") return "🔎";
  return "📘";
}

function searchWiki(query: string) {
  const normalized = query.trim().toLowerCase().replace(/\s+/g, "");
  if (!normalized) return [];
  const intentMatches = naturalLanguageIntents
    .filter((intent) => intent.terms.some((term) => normalized.includes(term)))
    .flatMap((intent) => intent.articleIds);

  return wikiArticles
    .map((article) => {
      const body = [displayTitle(article), article.title, article.description, wikiCategoryLabels[article.category], articleGroup(article), ...article.tags, ...article.sections.flatMap((section) => [section.heading, ...section.body])]
        .join(" ")
        .toLowerCase()
        .replace(/\s+/g, "");
      const title = displayTitle(article).toLowerCase().replace(/\s+/g, "");
      let score = 0;
      if (intentMatches.includes(article.id)) score += 160;
      if (title.includes(normalized)) score += 80;
      if (article.tags.some((tag) => tag.toLowerCase().replace(/\s+/g, "").includes(normalized))) score += 50;
      if (body.includes(normalized)) score += 25;
      return { article, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.article)
    .slice(0, 12);
}

export default function GuidePage() {
  const defaultArticle = wikiArticles.find((article) => article.id === "iki-arrange") ?? wikiArticles[0];
  const [query, setQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<WikiArticle>(defaultArticle);
  const [expandedGroup, setExpandedGroup] = useState(`${defaultArticle.category}-${articleGroup(defaultArticle)}`);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const articleId = params.get("article") ?? params.get("topic");
    const article = wikiArticles.find((item) => item.id === articleId);
    if (article) setSelectedArticle(article);
  }, []);

  const searchResults = useMemo(() => searchWiki(query), [query]);
  const tableOfContents = useMemo(() => {
    return categoryOrder.map((category) => ({
      category,
      groups: Array.from(new Set(wikiArticles.filter((article) => article.category === category).map(articleGroup))).map((group) => ({
        group,
        articles: wikiArticles.filter((article) => article.category === category && articleGroup(article) === group)
      }))
    }));
  }, []);

  const pickArticle = (article: WikiArticle) => {
    setSelectedArticle(article);
    setExpandedGroup(`${article.category}-${articleGroup(article)}`);
    window.history.replaceState(null, "", `/guide?user=${new URLSearchParams(window.location.search).get("user") ?? "Eric"}&article=${article.id}`);
  };

  const recommendedDocs = searchResults.filter((article) => article.category !== "faq" && article.category !== "glossary").slice(0, 4);
  const relatedFaqs = searchResults.filter((article) => article.category === "faq").slice(0, 3);
  const relatedTerms = searchResults.filter((article) => article.category === "glossary").slice(0, 4);
  const relatedMistakes = searchResults.filter((article) => article.category === "mistake").slice(0, 3);
  const relatedFeatures = Array.from(
    new Map(searchResults.flatMap((article) => article.relatedRoutes ?? []).map((route) => [route.path, route])).values()
  ).slice(0, 4);

  return (
    <ModulePage eyebrow="Education Center" title="OPS Wiki" description="업무가 막혔을 때 10초 안에 답을 찾는 ICBANQ 운영 지식 허브입니다.">
      <div className="space-y-5">
        <section className="grid min-h-[214px] grid-cols-[1fr_190px] gap-5 overflow-hidden rounded-[28px] border border-[#dce6f3] bg-[linear-gradient(135deg,#ffffff_0%,#f4f8ff_58%,#fff7f0_100%)] p-6 shadow-[0_16px_34px_rgba(15,23,42,0.06)]">
          <div className="min-w-0">
            <p className="text-[12px] font-[950] uppercase tracking-[0.08em] text-[#2563eb]">ICBANQ OPS WIKI</p>
            <h2 className="mt-2 text-[32px] font-[950] tracking-[-0.035em] text-[#111827]">업무 중 막혔나요?</h2>
            <p className="mt-2 text-[14px] font-[750] text-[#64748b]">검색하고, 바로 문서를 보고, Step대로 따라 하는 실무형 Help Center입니다.</p>
            <div className="mt-5 flex h-12 max-w-[720px] items-center gap-3 rounded-full border border-[#dce6f3] bg-white px-5 shadow-sm">
              <Search size={18} className="shrink-0 text-[#64748b]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && searchResults[0]) pickArticle(searchResults[0]);
                }}
                placeholder="무엇이 궁금하세요? 예: 선출고, 입금확인, COC, 왜 반려"
                className="h-full min-w-0 flex-1 bg-transparent text-[14px] font-[750] text-[#10203f] outline-none placeholder:text-[#94a3b8]"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {recommendedKeywords.map((keyword) => (
                <button key={keyword} onClick={() => setQuery(keyword)} className="rounded-full border border-[#e7ecf4] bg-white px-3 py-1.5 text-[12px] font-[850] text-[#475569] shadow-sm">
                  {keyword}
                </button>
              ))}
            </div>
          </div>
          <div className="hidden items-center justify-center lg:flex">
            <div className="relative h-[132px] w-[132px]">
              <Image src="/assets/mascots/bookbaeng.png" alt="OPS Wiki 마스코트" fill sizes="132px" className="object-contain drop-shadow-sm" />
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-[#dce6f3] bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[12px] font-[950] text-[#64748b]">상황별 찾기</span>
            {situationChips.map((chip) => (
              <button key={chip} onClick={() => setQuery(chip)} className="rounded-full bg-[#f8fbff] px-3 py-1.5 text-[12px] font-[850] text-[#475569] transition hover:bg-[#eaf2ff] hover:text-[#2563eb]">
                {chip}
              </button>
            ))}
          </div>
        </section>

        {query.trim() ? (
          <section className="grid gap-3 rounded-[24px] border border-[#dce6f3] bg-white p-4 shadow-sm xl:grid-cols-5">
            <SearchColumn title="추천 문서" articles={recommendedDocs} onPick={pickArticle} />
            <SearchColumn title="관련 FAQ" articles={relatedFaqs} onPick={pickArticle} />
            <SearchColumn title="관련 용어" articles={relatedTerms} onPick={pickArticle} />
            <RouteColumn title="관련 기능" routes={relatedFeatures} />
            <SearchColumn title="실수 사례" articles={relatedMistakes} onPick={pickArticle} />
          </section>
        ) : null}

        <section className="grid min-w-0 gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="max-h-[calc(100vh-160px)] overflow-auto rounded-[24px] border border-[#dce6f3] bg-white p-4 shadow-sm xl:sticky xl:top-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[16px] font-[950] text-[#111827]">문서 목차</h3>
              <span className="rounded-full bg-[#f8fbff] px-2.5 py-1 text-[11px] font-[900] text-[#64748b]">{wikiArticles.length}개</span>
            </div>
            <div className="space-y-5">
              {tableOfContents.map(({ category, groups }) => {
                const Icon = categoryMeta[category].icon;
                return (
                  <div key={category}>
                    <div className="flex items-center gap-2">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${toneClass(categoryMeta[category].tone)}`}>
                        <Icon size={16} />
                      </span>
                      <span className="text-[13px] font-[950] text-[#111827]">{wikiCategoryLabels[category]}</span>
                    </div>
                    <div className="mt-2 space-y-2">
                      {groups.map(({ group, articles }) => {
                        const groupKey = `${category}-${group}`;
                        const isOpen = expandedGroup === groupKey;
                        return (
                        <div key={group} className="rounded-[16px] bg-[#fbfdff] p-2">
                          <button
                            type="button"
                            onClick={() => setExpandedGroup(isOpen ? "" : groupKey)}
                            className="flex w-full items-center justify-between rounded-xl px-2 py-1 text-left text-[11px] font-[950] text-[#2563eb]"
                          >
                            <span>{category === "iki" ? group : wikiCategoryLabels[category]}</span>
                            <span>{isOpen ? "접기" : "열기"}</span>
                          </button>
                          {isOpen ? <div className="mt-1 space-y-1">
                            {articles.map((article) => (
                              <button
                                key={article.id}
                                onClick={() => pickArticle(article)}
                                className={`flex w-full min-w-0 items-center gap-2 rounded-xl px-2 py-2 text-left text-[12px] font-[850] transition ${selectedArticle.id === article.id ? "bg-[#eaf2ff] text-[#2563eb]" : "text-[#475569] hover:bg-white hover:text-[#111827]"}`}
                              >
                                <span className="shrink-0">{iconForArticle(article)}</span>
                                <span className="truncate">{displayTitle(article)}</span>
                              </button>
                            ))}
                          </div> : null}
                        </div>
                      );})}
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          <ArticleViewer article={selectedArticle} onPick={pickArticle} />
        </section>
      </div>
    </ModulePage>
  );
}

function SearchColumn({ title, articles, onPick }: { title: string; articles: WikiArticle[]; onPick: (article: WikiArticle) => void }) {
  return (
    <div className="rounded-[18px] bg-[#fbfdff] p-3">
      <h3 className="text-[13px] font-[950] text-[#111827]">{title}</h3>
      <div className="mt-2 space-y-2">
        {articles.length ? articles.map((article, index) => (
          <button key={article.id} onClick={() => onPick(article)} className="flex w-full min-w-0 items-center gap-2 rounded-xl bg-white px-3 py-2 text-left text-[12px] font-[850] text-[#475569] shadow-sm hover:text-[#2563eb]">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f8fbff] text-[11px] font-[950] text-[#2563eb]">{index + 1}</span>
            <span className="min-w-0">
              <span className="block truncate text-[#111827]">{displayTitle(article)}</span>
              <span className="block truncate text-[10px] text-[#94a3b8]">{wikiCategoryLabels[article.category]} · {article.readTime}</span>
            </span>
          </button>
        )) : <p className="rounded-xl bg-white px-3 py-4 text-[12px] font-[800] text-[#94a3b8]">관련 결과 없음</p>}
      </div>
    </div>
  );
}

function RouteColumn({ title, routes }: { title: string; routes: Array<{ label: string; path: string }> }) {
  return (
    <div className="rounded-[18px] bg-[#fbfdff] p-3">
      <h3 className="text-[13px] font-[950] text-[#111827]">{title}</h3>
      <div className="mt-2 space-y-2">
        {routes.length ? routes.map((route) => (
          <Link key={route.path} href={route.path} className="flex w-full items-center justify-between rounded-xl bg-white px-3 py-2 text-[12px] font-[900] text-[#475569] shadow-sm hover:text-[#2563eb]">
            <span>{route.label}</span>
            <ArrowRight size={14} />
          </Link>
        )) : <p className="rounded-xl bg-white px-3 py-4 text-[12px] font-[800] text-[#94a3b8]">관련 기능 없음</p>}
      </div>
    </div>
  );
}

function ArticleViewer({ article, onPick }: { article: WikiArticle; onPick: (article: WikiArticle) => void }) {
  const [detailOpen, setDetailOpen] = useState(false);
  const steps = quickSteps(article);
  const checklist = getSection(article, "체크포인트");
  const mistakes = getSection(article, "자주 하는 실수");
  const tip = getSection(article, "VIPS TIP");
  const frequent = getSection(article, "언제 가장 많이 사용하는가");
  const relatedArticles = (article.relatedArticleIds ?? [])
    .map((id) => wikiArticles.find((candidate) => candidate.id === id))
    .filter(Boolean) as WikiArticle[];

  useEffect(() => {
    setDetailOpen(false);
  }, [article.id]);

  return (
    <article className="min-w-0 rounded-[28px] border border-[#dce6f3] bg-white p-6 shadow-sm">
      <header className="border-b border-[#eef2f7] pb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[#f8fbff] text-[28px]">{iconForArticle(article)}</span>
              <div className="min-w-0">
                <p className="text-[12px] font-[950] uppercase tracking-[0.08em] text-[#2563eb]">{wikiCategoryLabels[article.category]} · {articleGroup(article)}</p>
                <h2 className="mt-1 text-[28px] font-[950] tracking-[-0.035em] text-[#111827]">{displayTitle(article)}</h2>
              </div>
            </div>
            <p className="mt-3 max-w-[760px] text-[14px] font-[800] leading-5 text-[#475569]">{article.description}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <MetaPill label="소요시간" value={article.readTime} />
            <MetaPill label="난이도" value={article.level} />
            <MetaPill label="대상" value={article.target} />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {article.tags.slice(0, 8).map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-[#f8fbff] px-2.5 py-1 text-[11px] font-[850] text-[#64748b]">
              <Tags size={12} />
              {tag}
            </span>
          ))}
        </div>
      </header>

      <section className="mt-4 rounded-[20px] border border-[#dce6f3] bg-[#f8fbff] p-4">
        <div className="flex items-center gap-2 text-[#2563eb]">
          <FileQuestion size={18} />
          <h3 className="text-[16px] font-[950] text-[#111827]">이 기능은 언제 쓰나요?</h3>
        </div>
        <p className="mt-2 text-[15px] font-[850] leading-6 text-[#334155]">{articleSummary(article)}</p>
      </section>

      <section className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <SectionTitle icon={ArrowRight} title="바로 따라하기" />
          <span className="rounded-full bg-[#ecfdf5] px-3 py-1 text-[11px] font-[950] text-[#059669]">Quick Mode</span>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {steps.slice(0, detailOpen ? 12 : 6).map((step, index) => (
            <div key={`${step}-${index}`} className="overflow-hidden rounded-[18px] border border-[#e7ecf4] bg-white shadow-sm">
              <StepVisual articleId={article.id} index={index} />
              <div className="p-4">
              <p className="text-[11px] font-[950] text-[#2563eb]">STEP {index + 1}</p>
              <p className="mt-2 text-[14px] font-[950] leading-5 text-[#111827]">{step}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[20px] border border-[#dce6f3] bg-[#fbfdff] p-4">
          <SectionTitle icon={CheckSquare} title="체크리스트" />
          <div className="mt-3 space-y-2">
            {checklist.slice(0, detailOpen ? 8 : 5).map((item) => (
              <label key={item} className="flex items-start gap-2 rounded-xl bg-white px-3 py-2 text-[13px] font-[850] text-[#475569]">
                <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-[#cfdbea]" />
                <span>{item.replace(/^□\s*/, "")}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-[20px] border border-[#ffd6c2] bg-[#fff7f3] p-4">
          <SectionTitle icon={AlertTriangle} title="자주 하는 실수" />
          <ul className="mt-3 space-y-2">
            {mistakes.slice(0, detailOpen ? 6 : 3).map((item) => (
              <li key={item} className="rounded-xl bg-white/75 px-3 py-2 text-[13px] font-[850] leading-5 text-[#9f3412]">{item.replace(/^×\s*/, "")}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-4 rounded-[20px] border border-[#ffe3b5] bg-[#fff9ef] p-4">
        <div className="flex items-center gap-2 text-[#d97706]">
          <Sparkles size={18} />
          <h3 className="text-[16px] font-[950] text-[#111827]">VIPS TIP</h3>
        </div>
        <p className="mt-3 text-[14px] font-[900] leading-6 text-[#7c4a03]">{tip.join(" ")}</p>
      </section>

      {detailOpen ? (
        <section className="mt-4 rounded-[20px] border border-[#dce6f3] bg-[#fbfdff] p-4">
          <SectionTitle icon={FileQuestion} title="자세히 보기" />
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {frequent.map((item) => (
              <div key={item} className="rounded-xl bg-white px-3 py-2 text-[13px] font-[850] text-[#475569]">{item}</div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-4 flex justify-center">
        <button onClick={() => setDetailOpen((value) => !value)} className="rounded-full border border-[#dce6f3] bg-white px-4 py-2 text-[12px] font-[950] text-[#475569] shadow-sm">
          {detailOpen ? "Quick Mode로 보기" : "자세히 보기"}
        </button>
      </div>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[20px] border border-[#dce6f3] bg-[#fbfdff] p-4">
          <SectionTitle icon={BookOpenCheck} title="관련 기능" />
          <div className="mt-3 flex flex-wrap gap-2">
            {article.relatedRoutes?.map((route) => (
              <Link key={route.path} href={route.path} className="rounded-xl bg-white px-3 py-2 text-[12px] font-[900] text-[#2563eb] shadow-sm">
                {route.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[20px] border border-[#dce6f3] bg-[#fbfdff] p-4">
          <SectionTitle icon={BookOpenCheck} title="관련 문서" />
          <div className="mt-3 flex flex-wrap gap-2">
            {relatedArticles.slice(0, 5).map((related) => (
              <button key={related.id} onClick={() => onPick(related)} className="rounded-xl bg-white px-3 py-2 text-left text-[12px] font-[900] text-[#475569] shadow-sm transition hover:text-[#2563eb]">
                {displayTitle(related)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <footer className="mt-5 rounded-[16px] bg-[#f8fafc] px-4 py-3 text-[12px] font-[850] text-[#64748b]">
        최종 수정일 {article.updatedAt} · {article.version} · 작성 VIPS Team · 검토 전
      </footer>
    </article>
  );
}

function MetaPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[72px] rounded-2xl bg-[#f8fbff] px-3 py-2">
      <p className="text-[10px] font-[900] text-[#94a3b8]">{label}</p>
      <p className="mt-0.5 text-[12px] font-[950] text-[#111827]">{value}</p>
    </div>
  );
}

function StepVisual({ articleId, index }: { articleId: string; index: number }) {
  return (
    <img
      src={`/assets/wiki/${articleId}-step-${index + 1}.png`}
      alt=""
      className="hidden h-28 w-full border-b border-[#eef2f7] object-cover"
      onLoad={(event) => {
        event.currentTarget.classList.remove("hidden");
      }}
      onError={(event) => {
        event.currentTarget.style.display = "none";
      }}
    />
  );
}

function SectionTitle({ icon: Icon, title }: { icon: typeof ArrowRight; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={18} className="text-[#2563eb]" />
      <h3 className="text-[16px] font-[950] text-[#111827]">{title}</h3>
    </div>
  );
}
