"use client";

import { useEffect, useMemo, useState } from "react";
import { RequestDetailModal } from "../components/RequestDetailModal";
import { ModulePage } from "../components/ModulePage";
import { useSelectedUser } from "../hooks/useSelectedUser";
import { fetchRequests, type RequestItem, type RequestStatus } from "../services/requestStorage";

const statusStyles: Record<RequestStatus, string> = {
  요청접수: "bg-slate-100 text-slate-600 border-slate-200",
  "VIPS팀 확인중": "bg-blue-50 text-[#075bdc] border-blue-200",
  완료: "bg-emerald-50 text-emerald-700 border-emerald-200",
  반려: "bg-red-50 text-red-600 border-red-200"
};

export default function RequestStatusPage() {
  const { selectedUser } = useSelectedUser();
  const [items, setItems] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailRequest, setDetailRequest] = useState<RequestItem | null>(null);

  useEffect(() => {
    fetchRequests()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const myItems = useMemo(
    () =>
      items.filter((item) => {
        const requester = item.requester.toLowerCase();
        return requester === selectedUser.email.toLowerCase() || requester === selectedUser.name.toLowerCase();
      }),
    [items, selectedUser]
  );

  return (
    <ModulePage
      eyebrow="Request Status"
      title="요청 현황"
      description="내가 요청한 VIPS팀 업무의 접수, 처리 상태, 처리결과를 확인하는 화면입니다."
    >
      <div className="mt-6 overflow-hidden rounded-md border border-[#dce6f3]">
        <div className="grid grid-cols-[1fr_145px_130px_1.4fr] bg-[#f4f8fd] px-4 py-3 text-[12px] font-[850] text-[#34496b]">
          <span>요청 종류</span>
          <span>요청일시</span>
          <span>상태</span>
          <span>처리결과</span>
        </div>

        {loading ? (
          <div className="px-4 py-12 text-center text-[13px] font-[650] text-[#5b6b84]">요청 현황을 불러오는 중입니다.</div>
        ) : myItems.length === 0 ? (
          <div className="px-4 py-12 text-center text-[13px] font-[650] text-[#5b6b84]">아직 표시할 요청이 없습니다.</div>
        ) : (
          myItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setDetailRequest(item)}
              className="grid w-full grid-cols-[1fr_145px_130px_1.4fr] items-center border-t border-[#e5edf7] px-4 py-3 text-left text-[13px] transition hover:bg-[#f8fbff]"
            >
              <span>
                <b className="block text-[#10203f]">{item.type}</b>
                <span className="mt-1 block text-[11px] font-[650] text-[#7a8ba4]">{item.id}</span>
              </span>
              <span className="font-[650] text-[#34496b]">{item.requestedAt}</span>
              <span className={`w-fit rounded-full border px-3 py-1 text-[12px] font-[850] ${statusStyles[item.status]}`}>{item.status}</span>
              <span className="font-[750] text-[#10203f]">{item.result}</span>
            </button>
          ))
        )}
      </div>
      <RequestDetailModal request={detailRequest} onClose={() => setDetailRequest(null)} />
    </ModulePage>
  );
}
