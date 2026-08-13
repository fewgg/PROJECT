import { getUserRequests } from "@/app/actions/requests";
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react";

export const revalidate = 0;

export default async function UserRequestsPage() {
  const requests = await getUserRequests();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto py-8">
      <div>
        <h1 className="text-3xl kanit-bold tracking-tight text-slate-900">ประวัติการเบิกวัสดุ</h1>
        <p className="kanit-regular text-slate-500 mt-1">รายการคำร้องขอเบิกวัสดุของคุณและสถานะปัจจุบัน</p>
      </div>

      <div className="grid gap-4">
        {requests.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-[24px] p-12 text-center text-slate-400 kanit-regular shadow-sm flex flex-col items-center justify-center">
            <FileText className="w-12 h-12 mb-4 opacity-20" />
            คุณยังไม่มีประวัติการขอเบิกวัสดุ
          </div>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:shadow-md">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100">
                  <img src={req.material_image} alt={req.material_name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="kanit-medium text-lg text-slate-800">{req.material_name}</h3>
                  <div className="text-sm kanit-regular text-slate-500 mt-1 space-y-1">
                    <p>เลขที่คำร้อง: {req.id.substring(0, 8)}...</p>
                    <p className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 
                      {new Date(req.created_at).toLocaleString('th-TH')}
                    </p>
                  </div>
                  {req.remark && <p className="text-xs text-slate-400 mt-1 italic">"{req.remark}"</p>}
                </div>
              </div>
              
              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                <div className="text-center">
                  <div className="text-xs kanit-medium text-slate-400">จำนวนที่ขอเบิก</div>
                  <div className="kanit-bold text-2xl text-slate-700">{req.quantity}</div>
                </div>
                
                <div className="flex flex-col items-end min-w-[120px]">
                  {req.status === 'PENDING' && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-50 text-amber-600 kanit-medium text-sm border border-amber-100">
                      <Clock className="w-4 h-4 mr-1.5" /> รออนุมัติ
                    </div>
                  )}
                  {req.status === 'APPROVED' && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 kanit-medium text-sm border border-emerald-100">
                      <CheckCircle className="w-4 h-4 mr-1.5" /> อนุมัติแล้ว
                    </div>
                  )}
                  {req.status === 'REJECTED' && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-rose-50 text-rose-600 kanit-medium text-sm border border-rose-100">
                      <XCircle className="w-4 h-4 mr-1.5" /> ไม่อนุมัติ
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
