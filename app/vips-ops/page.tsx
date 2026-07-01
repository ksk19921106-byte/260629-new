"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileText,
  ShieldAlert,
  UsersRound,
  WalletCards,
  type LucideIcon
} from "lucide-react";
import { AccessDenied } from "../components/AccessDenied";
import { ModulePage } from "../components/ModulePage";
import { TEST_USERS, useSelectedUser } from "../hooks/useSelectedUser";
import { REQUEST_FORM_CONFIGS } from "../services/formValidation";
import { fetchRequests, type RequestItem, type RequestStatus } from "../services/requestStorage";

type StatusTone = "blue" | "orange" | "red" | "green" | "gray";
type IssueStatus = "normal" | "attention" | "needCheck";

const salesMetrics = [
  {
    name: "Morgan",
    team: "B2D",
    monthEndCount: 4,
    monthEndAmount: 31594963,
    collectionCount: 2,
    collectionAmount: 8968520,
    status: "needCheck" as IssueStatus
  },
  {
    name: "Harvey",
    team: "B2D",
    monthEndCount: 1,
    monthEndAmount: 2508220,
    collectionCount: 1,
    collectionAmount: 3675419,
    status: "attention" as IssueStatus
  },
  {
    name: "Eric",
    team: "B2D",
    monthEndCount: 1,
    monthEndAmount: 1429024,
    collectionCount: 0,
    collectionAmount: 0,
    status: "attention" as IssueStatus
  },
  {
    name: "Tommy",
    team: "S1",
    monthEndCount: 2,
    monthEndAmount: 75000,
    collectionCount: 1,
    collectionAmount: 1429024,
    status: "normal" as IssueStatus
  }
];

const teamMetrics = [
  {
    team: "B2D",
    members: ["Morgan", "Harvey", "Eric"],
    monthEndCount: 6,
    monthEndAmount: 79475205,
    collectionCount: 3,
    collectionAmount: 14367650,
    status: "needCheck" as IssueStatus,
    risk: "30일 이상 미수 존재"
  },
  {
    team: "S1",
    members: ["Tommy"],
    monthEndCount: 2,
    monthEndAmount: 75000,
    collectionCount: 1,
    collectionAmount: 1429024,
    status: "attention" as IssueStatus,
    risk: "월마감 확인 필요"
  }
];

function krw(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function requesterKey(value: string) {
  return String(value || "").trim().toLowerCase();
}

function requestForSales(requests: RequestItem[], salesName: string) {
  const user = TEST_USERS.find((item) => item.name === salesName);
  if (!user) return [];
  return requests.filter((item) => {
    const requester = requesterKey(item.requester);
    return requester === user.name.toLowerCase() || requester === user.email.toLowerCase();
  });
}

function requestsForTeam(requests: RequestItem[], members: string[]) {
  return requests.filter((item) => members.some((member) => requestForSales([item], member).length > 0));
}

function statusBucket(status: RequestStatus | string) {
  const text = String(status);
  if (text.includes("완료") || text.includes("?꾨즺")) return "done";
  if (text.includes("반려") || text.includes("諛섎젮")) return "rejected";
  if (text.includes("처리") || text.includes("확인") || text.includes("VIPS")) return "processing";
  return "received";
}

function countByStatus(items: RequestItem[]) {
  return items.reduce(
    (acc, item) => {
      acc[statusBucket(item.status)] += 1;
      return acc;
    },
    { received: 0, processing: 0, done: 0, rejected: 0 }
  );
}

function todayText() {
  const now = new Date();
  return `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;
}

function isToday(item: RequestItem) {
  return String(item.requestedAt || "").startsWith(todayText());
}

function toneClass(tone: StatusTone) {
  if (tone === "red") return "bg-[#fff1f2] text-[#ef4444]";
  if (tone === "orange") return "bg-[#fff7ed] text-[#f97316]";
  if (tone === "green") return "bg-[#eefdf4] text-[#16a34a]";
  if (tone === "gray") return "bg-[#f1f5f9] text-[#64748b]";
  return "bg-[#eef5ff] text-[#2563eb]";
}

function statusLabel(status: IssueStatus) {
  if (status === "needCheck") return "확인 필요";
  if (status === "attention") return "주의";
  return "정상";
}

function statusTone(status: IssueStatus): StatusTone {
  if (status === "needCheck") return "red";
  if (status === "attention") return "orange";
  return "green";
}

function openRequestStatus(params: Record<string, string> = {}) {
  const search = new URLSearchParams({ user: "Sally", scope: "all", ...params });
  window.location.href = `/request-status?${search.toString()}`;
}

function teamRequesterParam(members: string[]) {
  return TEST_USERS.filter((user) => members.includes(user.name)).map((user) => user.email).join(",");
}

function KpiCard({
  icon: Icon,
  label,
  value,
  helper,
  tone,
  onClick
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  helper: string;
  tone: StatusTone;
  onClick?: () => void;
}) {
  const Tag = onClick ? "button" : "article";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className="ops-card min-w-0 p-4 text-left transition hover:border-[#cfe0ff] hover:shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
    >
      <div className={`ops-icon-circle ${toneClass(tone)}`}>
        <Icon size={23} />
      </div>
      <p className="mt-3 truncate text-[12px] font-[850] text-[#64748b]">{label}</p>
      <p className="mt-1 truncate text-[25px] font-[950] leading-none tracking-[-0.03em] text-[#111827]">{value}</p>
      <p className="mt-2 truncate text-[11px] font-[800] text-[#94a3b8]">{helper}</p>
    </Tag>
  );
}

function TodayAlertCard() {
  const alerts = [
    { title: "B2D팀 월마감 이슈 6건", helper: "79,475,205원", tone: "red" as StatusTone },
    { title: "Morgan 수금 이슈 3건", helper: "14,367,650원", tone: "orange" as StatusTone },
    { title: "담당자 미매칭 요청 2건", helper: "요청 분류 확인 필요", tone: "blue" as StatusTone },
    { title: "30일 이상 미수 2건", helper: "장기미수 확인 필요", tone: "red" as StatusTone }
  ];

  return (
    <section className="ops-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-[950] uppercase tracking-[0.08em] text-[#ef4444]">Today Alert</p>
          <h2 className="mt-1 text-[20px] font-[950] tracking-[-0.03em] text-[#111827]">오늘 먼저 확인할 이슈</h2>
          <p className="mt-1 text-[12px] font-[750] text-[#64748b]">VIPS팀이 오늘 우선 확인해야 할 운영 병목입니다.</p>
        </div>
        <span className="rounded-full bg-[#fff1f2] px-3 py-1.5 text-[12px] font-[950] text-[#ef4444]">High 2</span>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-4">
        {alerts.map((alert, index) => (
          <div key={alert.title} className="rounded-[18px] border border-[#edf2f8] bg-[#fbfcff] p-4">
            <div className="flex items-center gap-2">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-[950] ${toneClass(alert.tone)}`}>{index + 1}</span>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-[950] ${toneClass(alert.tone)}`}>
                {alert.tone === "red" ? "High" : alert.tone === "orange" ? "Medium" : "Info"}
              </span>
            </div>
            <p className="mt-3 text-[14px] font-[950] leading-5 text-[#111827]">{alert.title}</p>
            <p className="mt-1 truncate text-[12px] font-[750] text-[#64748b]">{alert.helper}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TeamControlCard({ team, requests }: { team: (typeof teamMetrics)[number]; requests: RequestItem[] }) {
  const teamRequests = requestsForTeam(requests, team.members);
  const counts = countByStatus(teamRequests);
  const requester = teamRequesterParam(team.members);

  return (
    <article className="rounded-[20px] border border-[#e9eef6] bg-white p-4 shadow-[0_4px_10px_rgba(15,23,42,0.02)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[22px] font-[950] tracking-[-0.03em] text-[#111827]">{team.team}</h3>
            <span className={`rounded-full px-3 py-1 text-[11px] font-[950] ${toneClass(statusTone(team.status))}`}>{statusLabel(team.status)}</span>
          </div>
          <p className="mt-1 truncate text-[12px] font-[750] text-[#64748b]">담당 Sales: {team.members.join(" · ")}</p>
        </div>
        <button
          type="button"
          onClick={() => openRequestStatus({ requester })}
          className="shrink-0 rounded-full bg-[#eef5ff] px-3 py-1.5 text-[12px] font-[950] text-[#2563eb] transition hover:bg-[#dceaff]"
        >
          팀 상세 보기
        </button>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-[16px] border border-[#edf2f8] bg-[#fbfcff] p-3">
          <p className="text-[11px] font-[850] text-[#64748b]">월마감 이슈</p>
          <p className="mt-1 text-[21px] font-[950] text-[#ef4444]">{team.monthEndCount}건</p>
          <p className="mt-1 truncate text-[11px] font-[750] text-[#94a3b8]">{krw(team.monthEndAmount)}</p>
        </div>
        <div className="rounded-[16px] border border-[#edf2f8] bg-[#fbfcff] p-3">
          <p className="text-[11px] font-[850] text-[#64748b]">수금 이슈</p>
          <p className="mt-1 text-[21px] font-[950] text-[#f97316]">{team.collectionCount}건</p>
          <p className="mt-1 truncate text-[11px] font-[750] text-[#94a3b8]">{krw(team.collectionAmount)}</p>
        </div>
        <div className="rounded-[16px] border border-[#edf2f8] bg-[#fbfcff] p-3">
          <p className="text-[11px] font-[850] text-[#64748b]">VIPS 요청</p>
          <p className="mt-1 text-[21px] font-[950] text-[#2563eb]">{teamRequests.length}건</p>
          <p className="mt-1 truncate text-[11px] font-[750] text-[#94a3b8]">접수 {counts.received} · 처리중 {counts.processing}</p>
        </div>
        <div className="rounded-[16px] border border-[#edf2f8] bg-[#fbfcff] p-3">
          <p className="text-[11px] font-[850] text-[#64748b]">반려/재확인</p>
          <p className="mt-1 text-[21px] font-[950] text-[#ef4444]">{counts.rejected}건</p>
          <p className="mt-1 truncate text-[11px] font-[750] text-[#94a3b8]">{team.risk}</p>
        </div>
      </div>
    </article>
  );
}

function SalesStatusTable({ requests }: { requests: RequestItem[] }) {
  const rows = salesMetrics
    .map((sales) => {
      const userRequests = requestForSales(requests, sales.name);
      return {
        ...sales,
        requestCount: userRequests.length,
        rejectedCount: countByStatus(userRequests).rejected
      };
    })
    .sort((a, b) => {
      const rank = { needCheck: 0, attention: 1, normal: 2 };
      return rank[a.status] - rank[b.status] || b.monthEndCount + b.collectionCount - (a.monthEndCount + a.collectionCount);
    });

  return (
    <section className="ops-card overflow-hidden p-0">
      <div className="flex items-start justify-between gap-3 border-b border-[#eef2f7] px-4 py-4">
        <div>
          <h2 className="text-[18px] font-[950] text-[#111827]">Sales별 확인 필요 현황</h2>
          <p className="mt-0.5 text-[12px] font-[750] text-[#64748b]">VIPS팀이 먼저 지원해야 할 Sales를 확인합니다.</p>
        </div>
      </div>
      <div className="grid grid-cols-[110px_74px_minmax(0,1.1fr)_minmax(0,1.1fr)_90px_96px] bg-[#f8fbff] px-4 py-3 text-[11px] font-[900] text-[#64748b]">
        <span>Sales</span>
        <span>Team</span>
        <span>월마감</span>
        <span>수금</span>
        <span>요청</span>
        <span>상태</span>
      </div>
      {rows.map((row) => {
        const user = TEST_USERS.find((item) => item.name === row.name);
        return (
          <button
            key={row.name}
            type="button"
            onClick={() => openRequestStatus({ requester: user?.email ?? row.name })}
            className="grid w-full grid-cols-[110px_74px_minmax(0,1.1fr)_minmax(0,1.1fr)_90px_96px] items-center border-t border-[#eef2f7] px-4 py-3 text-left text-[12px] transition hover:bg-[#f8fbff]"
          >
            <span className="font-[950] text-[#111827]">{row.name}</span>
            <span className="font-[850] text-[#64748b]">{row.team}</span>
            <span className="truncate font-[850] text-[#111827]">{row.monthEndCount}건 / {krw(row.monthEndAmount)}</span>
            <span className="truncate font-[850] text-[#111827]">{row.collectionCount}건 / {krw(row.collectionAmount)}</span>
            <span className="font-[850] text-[#64748b]">{row.requestCount}건</span>
            <span className={`w-fit rounded-full px-3 py-1 text-[11px] font-[950] ${toneClass(statusTone(row.status))}`}>{statusLabel(row.status)}</span>
          </button>
        );
      })}
    </section>
  );
}

function PendingRequests({ requests }: { requests: RequestItem[] }) {
  const waiting = requests.filter((item) => ["received", "processing", "rejected"].includes(statusBucket(item.status)));
  const counts = countByStatus(requests);
  const typeSummary = waiting.reduce<Record<string, number>>((acc, item) => {
    const label = item.kind && REQUEST_FORM_CONFIGS[item.kind] ? REQUEST_FORM_CONFIGS[item.kind].title.replace(" 요청", "") : item.type || "VIPS 요청";
    acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <section className="ops-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-[950] text-[#111827]">VIPS 처리 대기</h2>
          <p className="mt-0.5 text-[12px] font-[750] text-[#64748b]">지금 VIPS팀이 처리해야 할 요청만 간단히 확인합니다.</p>
        </div>
        <button
          type="button"
          onClick={() => openRequestStatus({ status: "received" })}
          className="rounded-full bg-[#eef5ff] px-3 py-1.5 text-[12px] font-[950] text-[#2563eb]"
        >
          요청 관리로 이동
        </button>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {[
          ["접수", counts.received, "blue"],
          ["처리중", counts.processing, "orange"],
          ["반려/재확인", counts.rejected, "red"],
          ["오늘 완료", requests.filter((item) => statusBucket(item.status) === "done" && isToday(item)).length || counts.done, "green"]
        ].map(([label, value, tone]) => (
          <div key={label} className="rounded-[16px] border border-[#edf2f8] bg-[#fbfcff] p-3">
            <p className="text-[11px] font-[850] text-[#64748b]">{label}</p>
            <p className={`mt-1 text-[23px] font-[950] ${toneClass(String(tone) as StatusTone).split(" ")[1]}`}>{value}건</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {Object.entries(typeSummary).slice(0, 5).map(([label, count]) => (
          <span key={label} className="rounded-full bg-[#f8fbff] px-3 py-1.5 text-[12px] font-[850] text-[#64748b]">
            {label} {count}건
          </span>
        ))}
      </div>
    </section>
  );
}

function RiskAlerts() {
  const risks = [
    { label: "30일 이상 미수", value: "2건 / 12,860,424원", tone: "red" as StatusTone },
    { label: "담당자 미매칭", value: "2건", tone: "orange" as StatusTone },
    { label: "월마감 장기 미진행", value: "1건", tone: "red" as StatusTone },
    { label: "반려 후 재요청 미진행", value: "1건", tone: "orange" as StatusTone }
  ];

  return (
    <section className="ops-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-[950] text-[#111827]">운영 위험 알림</h2>
          <p className="mt-0.5 text-[12px] font-[750] text-[#64748b]">장기미수, 미매칭, 재확인 지연만 compact하게 표시합니다.</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-4">
        {risks.map((risk) => (
          <div key={risk.label} className="rounded-[16px] border border-[#edf2f8] bg-[#fbfcff] p-3">
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-[950] ${toneClass(risk.tone)}`}>{risk.tone === "red" ? "High" : "Medium"}</span>
            <p className="mt-2 text-[13px] font-[950] text-[#111827]">{risk.label}</p>
            <p className="mt-1 truncate text-[12px] font-[800] text-[#64748b]">{risk.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function VipsOpsPage() {
  const { selectedUser } = useSelectedUser();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests()
      .then(setRequests)
      .finally(() => setLoading(false));
  }, []);

  const waitingCount = useMemo(() => {
    const counts = countByStatus(requests);
    return counts.received + counts.processing + counts.rejected;
  }, [requests]);
  const monthEndCount = teamMetrics.reduce((sum, team) => sum + team.monthEndCount, 0);
  const monthEndAmount = teamMetrics.reduce((sum, team) => sum + team.monthEndAmount, 0);
  const collectionCount = teamMetrics.reduce((sum, team) => sum + team.collectionCount, 0);
  const collectionAmount = teamMetrics.reduce((sum, team) => sum + team.collectionAmount, 0);
  const needCheckTeams = teamMetrics.filter((team) => team.status !== "normal").length;

  const canAccess = selectedUser.accessRole === "admin" || selectedUser.role === "VIPS" || selectedUser.team === "VIPS팀";
  if (!canAccess) return <AccessDenied />;

  return (
    <ModulePage
      eyebrow="VIPS CONTROL TOWER"
      title="VIPS Control Tower"
      description="팀별 월마감·수금·요청 이슈를 한눈에 확인하고, 오늘 먼저 봐야 할 운영 이슈를 관리합니다."
    >
      <div className="mt-5 space-y-4">
        <TodayAlertCard />

        <section className="grid gap-3 md:grid-cols-4">
          <KpiCard icon={UsersRound} label="확인 필요 팀" value={`${needCheckTeams}팀`} helper="주의 이상 팀 기준" tone="red" />
          <KpiCard icon={AlertTriangle} label="월마감 이슈" value={`${monthEndCount}건`} helper={krw(monthEndAmount)} tone="red" onClick={() => (window.location.href = "/month-end?user=Sally")} />
          <KpiCard icon={WalletCards} label="수금 이슈" value={`${collectionCount}건`} helper={krw(collectionAmount)} tone="orange" onClick={() => (window.location.href = "/collections?user=Sally")} />
          <KpiCard icon={Clock3} label="VIPS 처리 대기" value={`${waitingCount}건`} helper={loading ? "불러오는 중" : "접수/처리/재확인"} tone="blue" onClick={() => openRequestStatus()} />
        </section>

        <section className="ops-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[18px] font-[950] text-[#111827]">팀별 운영 현황</h2>
              <p className="mt-0.5 text-[12px] font-[750] text-[#64748b]">월마감, 수금, 요청 이슈를 팀 단위로 보고 우선순위를 판단합니다.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 xl:grid-cols-2">
            {teamMetrics.map((team) => (
              <TeamControlCard key={team.team} team={team} requests={requests} />
            ))}
          </div>
        </section>

        <SalesStatusTable requests={requests} />

        <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <PendingRequests requests={requests} />
          <RiskAlerts />
        </div>
      </div>
    </ModulePage>
  );
}
