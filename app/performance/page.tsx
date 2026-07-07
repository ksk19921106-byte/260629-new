import { Award, BadgeCheck, CheckCircle2, Medal, TrendingUp } from "lucide-react";
import { ModulePage } from "../components/ModulePage";

const performancePoints = [
  "?? ??",
  "??? ??",
  "?? ??",
  "?? ??",
  "??? ??",
  "???? ??",
  "???? ??",
  "?? ??? ??",
  "?? ??? ??",
  "?? ?? ??"
];

const badges = [
  { title: "?? ?? ??", note: "?? ?? ?? ?? ?? ??", date: "2026 Q2" },
  { title: "??? ??", note: "Gatekeeper ??? ????? ??", date: "2026 Q2" },
  { title: "???? ??", note: "????? ?? ?? ??", date: "2026 Q1" }
];

const metrics = [
  { label: "??? ??", value: "42?", note: "?? ?? +8" },
  { label: "?? ?? streak", value: "11?", note: "?? ?? ??" },
  { label: "?? ???", value: "96%", note: "?? ?? ??" }
];

export default function PerformancePage() {
  const completed = 7;

  return (
    <ModulePage
      eyebrow="Performance & Badge"
      title="?깃낵 / 諛곗?"
      description="寃뚯엫 ??겕媛 ?꾨땲?? 諛섎났 ?ㅼ닔瑜?以꾩씠怨??댁쁺 湲곗???吏??湲곕줉?낅땲??"
    >
      <div className="mt-6 grid grid-cols-3 gap-3">
        {metrics.map((metric) => (
          <article key={metric.label} className="rounded-[22px] border border-[#e7ecf4] bg-[#fbfdff] p-4">
            <p className="text-[12px] font-[850] text-[#5b6b84]">{metric.label}</p>
            <p className="mt-2 text-[26px] font-[950] tracking-[-0.02em] text-[#10203f]">{metric.value}</p>
            <p className="mt-1 text-[12px] font-[700] text-[#075bdc]">{metric.note}</p>
          </article>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-[1.05fr_0.95fr] gap-4">
        <section className="rounded-[24px] border border-[#e7ecf4] bg-white p-5 shadow-[0_10px_26px_rgba(21,31,53,0.045)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] font-[900] text-[#075bdc]">?댁쁺 ?몃옓</p>
              <h2 className="mt-1 text-[21px] font-[950] tracking-[-0.02em] text-[#10203f]">?대쾲 遺꾧린 ?깃낵 ?ъ씤??{completed}/10</h2>
              <p className="mt-2 text-[13px] font-[650] leading-5 text-[#5b6b84]">湲곗???袁몄???吏?ㅻ㈃ ?댁쁺 諛곗?媛 ?볦엯?덈떎.</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf4ff] text-[#075bdc]">
              <Award size={27} />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-5 gap-3">
            {performancePoints.map((label, index) => {
              const active = index < completed;
              return (
                <div key={label} className="rounded-[18px] border border-[#e7ecf4] bg-[#fbfdff] px-3 py-3 text-center">
                  <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full ${active ? "bg-[#1D50A2] text-white" : "bg-[#e7edf6] text-[#7a8ba4]"}`}>
                    {active ? <CheckCircle2 size={18} /> : index + 1}
                  </div>
                  <p className="mt-2 min-h-[34px] text-[11px] font-[800] leading-[17px] text-[#34496b]">{label}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-5 rounded-[18px] border border-[#dce6f3] bg-[#fbfdff] px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-[850] text-[#34496b]">?댁쁺 諛곗?源뚯?</span>
              <span className="text-[13px] font-[900] text-[#075bdc]">3?ъ씤???⑥쓬</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#dce6f3]">
              <div className="h-full w-[70%] rounded-full bg-[#1D50A2]" />
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-[#e7ecf4] bg-white p-5 shadow-[0_10px_26px_rgba(21,31,53,0.045)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-[900] text-[#075bdc]">?띾뱷 諛곗?</p>
              <h2 className="mt-1 text-[21px] font-[950] tracking-[-0.02em] text-[#10203f]">?댁쁺 湲곗뿬 湲곕줉</h2>
            </div>
            <Medal size={28} className="text-[#075bdc]" />
          </div>

          <div className="mt-5 space-y-3">
            {badges.map((badge) => (
              <article key={badge.title} className="flex items-center gap-3 rounded-[18px] border border-[#e7ecf4] bg-[#fbfdff] px-4 py-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#075bdc] shadow-sm">
                  <BadgeCheck size={23} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-[900] text-[#10203f]">{badge.title}</p>
                  <p className="mt-1 text-[12px] font-[650] text-[#5b6b84]">{badge.note}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-[850] text-[#075bdc]">{badge.date}</span>
              </article>
            ))}
          </div>

          <div className="mt-5 rounded-[18px] border border-[#dce6f3] bg-[#fbfdff] p-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-[#075bdc]" />
              <p className="text-[14px] font-[900] text-[#10203f]">?ㅼ쓬 怨좊룄??諛⑺뼢</p>
            </div>
            <p className="mt-2 text-[12px] font-[650] leading-5 text-[#5b6b84]">
              異뷀썑 ?붿껌 ?곗씠?곗? 濡쒓렇??湲곕줉???곌껐???ㅼ젣 泥섎━ ?뺥솗?? ?붾쭏媛?streak, ?ㅻ쪟 ZERO 諛곗?瑜??먮룞 吏묎퀎?????덉뒿?덈떎.
            </p>
          </div>
        </section>
      </div>
    </ModulePage>
  );
}
