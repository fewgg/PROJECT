"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ActivityItem {
  id: string;
  user: string;
  avatar: string;
  action: string;
  item: string;
  quantity: number;
  time: string;
  status: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <section className="w-full py-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-blue-500/10 rounded-xl">
          <Clock className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-2xl kanit-bold tracking-tight text-slate-900">กิจกรรมล่าสุด</h2>
      </div>

      <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-slate-100">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-slate-500 kanit-regular">ไม่มีกิจกรรมล่าสุด</div>
        ) : (
          <div className="space-y-6">
            {activities.map((activity, index) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                key={activity.id} 
                className="flex items-start gap-4 group"
              >
                {/* Timeline Connector */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <img 
                      src={activity.avatar} 
                      alt={activity.user} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                      activity.action === "เบิก" ? "bg-amber-500" :
                      activity.action === "คืน" ? "bg-emerald-500" : "bg-blue-500"
                    }`}>
                      {/* Status dot */}
                    </div>
                  </div>
                  {index !== activities.length - 1 && (
                    <div className="w-0.5 h-full min-h-[40px] bg-slate-100 rounded-full my-1"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-1 pb-4 border-b border-slate-50 group-last:border-0 group-last:pb-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div>
                      <p className="text-slate-800 kanit-medium text-lg">
                        {activity.user} <span className="text-slate-400 font-normal mx-1">ได้ทำการ</span> {activity.action}
                      </p>
                      <p className="text-slate-600 kanit-regular">
                        {activity.item} <span className="kanit-medium text-slate-800 ml-1">จำนวน {activity.quantity}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-400 kanit-regular whitespace-nowrap">{activity.time}</span>
                      <Badge variant="secondary" className={`kanit-regular border-none ${
                        activity.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {activity.status === 'APPROVED' ? 'อนุมัติแล้ว' : 'รออนุมัติ'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
