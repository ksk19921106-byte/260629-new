import type { ReactNode } from "react";
import { OpsShell } from "./OpsShell";

export function ModulePage({
  eyebrow,
  title,
  description,
  children
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <OpsShell>
      <section className="min-w-0 px-6 py-5">
        <div className="ops-card min-w-0 p-5">
          <div className="flex min-h-[72px] items-center justify-between gap-4 border-b border-[#eef2f7] pb-4">
            <div className="min-w-0">
              <p className="text-[11px] font-[950] uppercase tracking-[0.08em] text-[#2563eb]">{eyebrow}</p>
              <h1 className="mt-1 truncate text-[24px] font-[950] tracking-[-0.02em] text-[#111827]">{title}</h1>
              <p className="mt-1 text-[13px] font-[700] leading-5 text-[#64748b]">{description}</p>
            </div>
          </div>
          {children ?? (
            <div className="mt-5 rounded-[16px] border border-dashed border-[#c6d4e9] bg-[#f8fbff] px-5 py-8 text-[13px] font-[750] text-[#64748b]">
              이 영역은 이후 운영 기능 확장을 위한 기본 화면입니다.
            </div>
          )}
        </div>
      </section>
    </OpsShell>
  );
}
