"use client";

import { ShieldAlert } from "lucide-react";
import { OpsShell } from "./OpsShell";

export function AccessDenied() {
  return (
    <OpsShell>
      <section className="px-6 py-5">
        <div className="rounded-lg border border-[#dce6f3] bg-white p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[#eef5ff] text-[#075bdc]">
              <ShieldAlert size={26} />
            </div>
            <div>
              <p className="text-[12px] font-[800] uppercase tracking-[0.08em] text-[#075bdc]">Access Control</p>
              <h1 className="mt-1 text-[24px] font-[850] tracking-[-0.01em] text-[#10203f]">접근 권한이 없습니다.</h1>
              <p className="mt-2 text-[14px] font-[550] leading-6 text-[#5b6b84]">
                이 화면은 VIPS팀 권한 사용자만 접근할 수 있습니다. MVP 테스트 사용자에서 VIPS 권한 계정으로 전환해 주세요.
              </p>
            </div>
          </div>
        </div>
      </section>
    </OpsShell>
  );
}
