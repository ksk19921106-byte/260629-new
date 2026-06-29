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
      <section className="px-6 py-5">
        <div className="rounded-lg border border-[#dce6f3] bg-white p-6 shadow-sm">
          <p className="text-[12px] font-[800] uppercase tracking-[0.08em] text-[#075bdc]">{eyebrow}</p>
          <h1 className="mt-1 text-[24px] font-[850] tracking-[-0.01em] text-[#10203f]">{title}</h1>
          <p className="mt-2 text-[14px] font-[550] text-[#5b6b84]">{description}</p>
          {children ?? (
            <div className="mt-6 rounded-md border border-dashed border-[#c6d4e9] bg-[#f8fbff] px-5 py-8 text-[13px] font-[650] text-[#435a7b]">
              이 영역은 이후 운영 기능 확장을 위한 기본 화면입니다.
            </div>
          )}
        </div>
      </section>
    </OpsShell>
  );
}
