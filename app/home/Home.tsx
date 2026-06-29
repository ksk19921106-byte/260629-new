"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { RequestKind } from "../services/formValidation";
import { routeWithUser, searchGlobal } from "../services/globalSearch";
import { searchChips } from "./homeData";
import { HeroSection } from "./HeroSection";
import { MonthlyCheckCard } from "./MonthlyCheckCard";
import { CollectionCheckCard } from "./CollectionCheckCard";
import { GatekeeperBanner } from "./GatekeeperBanner";
import { QuickRequestSection } from "./QuickRequestSection";
import { RequestStatusSection } from "./RequestStatusSection";
import { ExchangeRateMiniCard, type MiniExchangeRate } from "./ExchangeRateMiniCard";
import { TodayFlowCard } from "./TodayFlowCard";
import { PerformanceMiniCard } from "./PerformanceMiniCard";

export function Home({ userName, exchange, onSelectRequestKind }: { userName: string; exchange: MiniExchangeRate; onSelectRequestKind: (kind: RequestKind) => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchGlobal(query, 6), [query]);
  const showResults = query.trim().length > 0;

  const goToResult = (route: string) => {
    router.push(routeWithUser(route, userName));
    setQuery("");
  };

  const submitSearch = () => {
    if (results[0]) goToResult(results[0].route);
  };

  return (
    <main className="home-main w-full overflow-x-hidden bg-[#f5f7fb]">
      <div className="home-shell mx-auto flex w-full max-w-[1600px] flex-col gap-3 px-6 pb-6 pt-[18px]">
        <section className="relative z-30 flex h-[74px] min-w-0 items-start justify-center overflow-visible">
          <div className="relative min-w-0">
            <div className="mx-auto flex h-[42px] w-[560px] max-w-full items-center gap-3 rounded-full border border-[#dfe7f2] bg-white px-5 shadow-[0_10px_24px_rgba(15,23,42,0.055)]">
              <Search size={18} className="shrink-0 text-[#64748b]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") submitSearch();
                }}
                placeholder="무엇을 찾고 계신가요?"
                className="h-full min-w-0 flex-1 bg-transparent text-[14px] font-[750] text-[#10203f] outline-none placeholder:text-[#94a3b8]"
              />
              <span className="shrink-0 rounded-lg bg-[#f2f4f8] px-2 py-1 text-[11px] font-[900] text-[#64748b]">⌘K</span>
            </div>
            <div className="mt-2 flex h-7 min-w-0 flex-wrap justify-center gap-2 overflow-hidden">
              {searchChips.map((chip) => (
                <button key={chip} onClick={() => setQuery(chip)} className="h-7 rounded-full border border-[#e7ecf4] bg-white px-3 text-[12px] font-[850] text-[#475569] shadow-sm">{chip}</button>
              ))}
            </div>
            {showResults ? (
              <div className="absolute left-1/2 top-[50px] z-50 w-[620px] max-w-[calc(100vw-64px)] -translate-x-1/2 overflow-hidden rounded-[22px] border border-[#dce6f3] bg-white p-2 shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
                {results.length === 0 ? (
                  <div className="px-4 py-5 text-center text-[13px] font-[850] text-[#64748b]">검색 결과가 없습니다. 다른 키워드로 찾아보세요.</div>
                ) : (
                  results.map((result) => (
                    <button
                      key={result.id}
                      type="button"
                      onClick={() => goToResult(result.route)}
                      className="flex w-full min-w-0 items-center gap-3 rounded-[16px] px-3 py-3 text-left transition hover:bg-[#f6f8fb]"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#f2f6ff] text-[17px]">{result.iconLabel}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[11px] font-[950] text-[#2563eb]">{result.categoryLabel}</span>
                        <span className="block truncate text-[14px] font-[950] text-[#111827]">{result.title}</span>
                        <span className="block truncate text-[12px] font-[750] text-[#64748b]">{result.description}</span>
                        {result.readTime || result.tags?.length ? (
                          <span className="mt-1 flex min-w-0 flex-wrap gap-1">
                            {result.readTime ? <span className="rounded-full bg-[#f8fbff] px-2 py-0.5 text-[10px] font-[850] text-[#64748b]">{result.readTime}</span> : null}
                            {result.tags?.slice(0, 2).map((tag) => (
                              <span key={tag} className="rounded-full bg-[#f8fbff] px-2 py-0.5 text-[10px] font-[850] text-[#64748b]">{tag}</span>
                            ))}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  ))
                )}
              </div>
            ) : null}
          </div>
        </section>

        <HeroSection userName={userName} />

        <div className="grid min-w-0 grid-cols-2 gap-3">
          <MonthlyCheckCard />
          <CollectionCheckCard />
        </div>

        <GatekeeperBanner />

        <div className="grid min-w-0 grid-cols-2 gap-3">
          <QuickRequestSection onSelectRequestKind={onSelectRequestKind} />
          <RequestStatusSection />
        </div>

        <div className="grid min-w-0 grid-cols-3 gap-3">
          <TodayFlowCard />
          <PerformanceMiniCard />
          <ExchangeRateMiniCard exchange={exchange} />
        </div>
      </div>
    </main>
  );
}
