"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useSelectedUser, type TestUserName, type UserRole } from "../hooks/useSelectedUser";
import {
  BadgeCheck,
  BarChart3,
  CalendarCheck,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  FileText,
  GraduationCap,
  Home,
  LogOut,
  UserRound
} from "lucide-react";

const DALBAENG_CHALLENGE_URL = "https://script.google.com/macros/s/AKfycbxP-bK6z-aWZtNrBF-he1ljukZ_mMFZvK_Ejce98vvFur3pfnx5rxOX8_2KT_N2LQ4GpQ/exec";
const BOOKBAENG_TEAMS_URL = "https://teams.microsoft.com/l/chat/19:88655096fbd943189e74fc222f276f15@thread.v2/conversations?context=%7B%22contextType%22%3A%22chat%22%7D";

const navItems: Array<{ id: string; label: string; href: string; icon: typeof Home; roles: UserRole[]; adminOnly?: boolean; badge?: number }> = [
  { id: "home", label: "홈", href: "/", icon: Home, roles: ["SALES", "VIPS"] },
  { id: "requests", label: "VIPS팀 요청", href: "/requests", icon: FileText, roles: ["SALES", "VIPS"] },
  { id: "request-status", label: "나의 요청현황", href: "/request-status", icon: FileText, roles: ["SALES", "VIPS"] },
  { id: "month-end", label: "월마감 체크", href: "/month-end", icon: CalendarCheck, roles: ["SALES", "VIPS"], badge: 7 },
  { id: "collections", label: "수금관리", href: "/collections", icon: CircleDollarSign, roles: ["SALES", "VIPS"] },
  { id: "vips-ops", label: "VIPS 운영", href: "/vips-ops", icon: BarChart3, roles: ["VIPS"], adminOnly: true },
  { id: "education", label: "교육센터", href: "/guide", icon: GraduationCap, roles: ["SALES", "VIPS"] },
  { id: "performance", label: "성과 / 배지", href: "/performance", icon: BadgeCheck, roles: ["SALES", "VIPS"] }
];

function Logo() {
  return (
    <div className="flex h-10 items-center gap-2.5">
      <svg width="28" height="28" viewBox="0 0 38 38" aria-hidden="true">
        <path d="M19 2.6 33.3 10.8v16.4L19 35.4 4.7 27.2V10.8L19 2.6Z" fill="#1267d9" />
        <path d="M19 2.6v16.5L4.7 10.8 19 2.6Z" fill="#8bc7ff" />
        <path d="M33.3 10.8 19 19.1V35.4l14.3-8.2V10.8Z" fill="#0b4fb7" />
        <path d="M4.7 10.8 19 19.1v16.3L4.7 27.2V10.8Z" fill="#1d78e8" />
      </svg>
      <div>
        <span className="block text-[17px] font-[950] tracking-[-0.02em] text-[#111827]">ICBANQ</span>
        <span className="block text-[10px] font-[800] text-[#64748b]">OPS Portal</span>
      </div>
    </div>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function TestUserSwitcher({
  selectedUser,
  users,
  onChange,
  pathname
}: {
  selectedUser: ReturnType<typeof useSelectedUser>["selectedUser"];
  users: ReturnType<typeof useSelectedUser>["users"];
  onChange: (name: TestUserName) => void;
  pathname: string;
}) {
  return (
    <div className="rounded-[18px] border border-[#e5eaf3] bg-[#f8fbff] px-3 py-2.5">
      <div className="flex items-center gap-3">
        <div className="ops-icon-circle h-9 w-9 shrink-0">
          <UserRound size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p data-selected-user-name="true" className="truncate text-[13px] font-[850] text-[#10203f]">
            {selectedUser.name}님
          </p>
          <p data-selected-user-meta="true" className="text-xs font-[650] text-[#435a7b]">
            {selectedUser.role === "VIPS" ? "VIPS팀" : "SALES"} · {selectedUser.role}
          </p>
        </div>
        <ChevronDown size={15} className="text-[#2563eb]" />
      </div>
      <div className="mt-2.5">
        <span className="mb-2 block text-[10px] font-[850] uppercase tracking-[0.08em] text-[#7a8ba4]">테스트 로그인</span>
        <div className="grid gap-1.5">
          {users.map((user) => {
            const active = selectedUser.name === user.name;
            const switchHref = `${pathname}?user=${encodeURIComponent(user.name)}`;
            return (
              <a
                key={user.name}
                href={switchHref}
                data-test-user={user.name}
                data-test-role={user.role}
                onClick={() => onChange(user.name)}
                className={`flex h-9 items-center justify-between rounded-xl px-3 text-left text-[12px] font-[850] transition ${
                  active ? "bg-[#2563eb] text-white shadow-sm" : "bg-white text-[#475569] hover:bg-[#eef6ff]"
                }`}
              >
                <span>{user.name}</span>
                <span className={active ? "text-white/80" : "text-[#7a8ba4]"}>{user.role}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SidebarChallengeCard() {
  return (
    <div className="ops-card overflow-hidden p-3.5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[13px] font-[950] text-[#111827]">사내 챌린지</p>
          <p className="mt-0.5 text-[11px] font-[750] text-[#64748b]">운동 · 독서 캠페인</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <a
          href={DALBAENG_CHALLENGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-[16px] border border-[#edf1f6] bg-[#fbfcff] px-2 py-3 text-center transition hover:-translate-y-0.5 hover:border-[#cbdaf5]"
        >
          <div className="relative mx-auto h-[82px] w-[82px]">
            <Image src="/assets/mascots/dalbaeng.png" alt="달뱅 챌린지" fill sizes="90px" className="object-contain drop-shadow-sm" />
          </div>
          <p className="-mt-1 text-[12px] font-[950] text-[#1769e8]">달뱅</p>
        </a>
        <a
          href={BOOKBAENG_TEAMS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-[16px] border border-[#edf1f6] bg-[#fbfcff] px-2 py-3 text-center transition hover:-translate-y-0.5 hover:border-[#cbdaf5]"
        >
          <div className="relative mx-auto h-[82px] w-[82px]">
            <Image src="/assets/mascots/bookbaeng.png" alt="북뱅 챌린지" fill sizes="90px" className="object-contain drop-shadow-sm" />
          </div>
          <p className="-mt-1 text-[12px] font-[950] text-[#0d9b6c]">북뱅</p>
        </a>
      </div>
    </div>
  );
}

export function OpsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { selectedUser, setSelectedUser, users } = useSelectedUser();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f6f8fb] text-[#111827]">
      <div className="grid min-h-screen grid-cols-[220px_minmax(0,1fr)]">
        <aside className="flex w-[220px] flex-col border-r border-[#e5eaf3] bg-white px-3 py-[18px]">
          <Logo />
          <div className="mt-4">
            <TestUserSwitcher selectedUser={selectedUser} users={users} onChange={setSelectedUser} pathname={pathname} />
          </div>

          <nav className="mt-5 space-y-1">
            {navItems.filter((item) => item.roles.includes(selectedUser.role) && (!item.adminOnly || selectedUser.accessRole === "admin" || selectedUser.team === "VIPS팀" || selectedUser.role === "VIPS")).map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.id}
                  href={`${item.href}?user=${encodeURIComponent(selectedUser.name)}`}
                  onClick={(event) => {
                    if (item.id !== "home") return;
                    event.preventDefault();
                    window.location.href = `/?user=${encodeURIComponent(selectedUser.name)}&home-reset=${Date.now()}`;
                  }}
                  className={`group flex h-[40px] w-full items-center gap-2.5 rounded-[12px] px-2.5 text-[12px] font-[850] transition ${
                    active ? "bg-[#eef6ff] text-[#2563eb]" : "text-[#475569] hover:bg-[#f6f8fb] hover:text-[#111827]"
                  }`}
                >
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full ${active ? "bg-[#dbeafe]" : "bg-[#f1f5f9] text-[#64748b] group-hover:bg-[#eaf2ff] group-hover:text-[#2563eb]"}`}>
                    <item.icon size={16} strokeWidth={2.2} />
                  </span>
                  <span className="truncate">{item.label}</span>
                  {item.badge ? (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ef3f32] px-1.5 text-[11px] font-[900] text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-3">
            <SidebarChallengeCard />
            <button className="flex h-[40px] w-full items-center gap-3 rounded-[12px] bg-[#f8fbff] px-3 text-[12px] font-[850] text-[#64748b] hover:bg-[#eef6ff] hover:text-[#2563eb]">
              <LogOut size={16} />
              로그아웃
            </button>
          </div>
        </aside>

        {children}
      </div>
    </main>
  );
}
