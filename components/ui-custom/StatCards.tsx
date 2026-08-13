"use client";

import { motion, Variants } from "framer-motion";
import { Package, AlertCircle, FileText, CheckCircle2 } from "lucide-react";

interface StatCardsProps {
  stats: {
    totalMaterials: number;
    lowStock: number;
    pendingRequests: number;
    approvedToday: number;
  }
}

export function StatCards({ stats }: StatCardsProps) {
  const statItems = [
    {
      title: "รายการวัสดุทั้งหมด",
      value: stats.totalMaterials.toLocaleString(),
      description: "รายการ",
      icon: Package,
      color: "bg-blue-500",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-600",
    },
    {
      title: "วัสดุใกล้หมด",
      value: stats.lowStock.toLocaleString(),
      description: "รายการ",
      icon: AlertCircle,
      color: "bg-amber-500",
      bgColor: "bg-amber-500/10",
      textColor: "text-amber-600",
    },
    {
      title: "รออนุมัติเบิกจ่าย",
      value: stats.pendingRequests.toLocaleString(),
      description: "คำร้อง",
      icon: FileText,
      color: "bg-indigo-500",
      bgColor: "bg-indigo-500/10",
      textColor: "text-indigo-600",
    },
    {
      title: "อนุมัติแล้ววันนี้",
      value: stats.approvedToday.toLocaleString(),
      description: "รายการ",
      icon: CheckCircle2,
      color: "bg-emerald-500",
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-600",
    }
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-6"
    >
      {statItems.map((stat, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="bg-white rounded-[24px] p-6 shadow-sm hover:shadow-xl transition-shadow border border-slate-100 flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="kanit-medium text-slate-500 text-sm">{stat.title}</h3>
            <div className={`p-3 rounded-2xl ${stat.bgColor}`}>
              <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl kanit-bold tracking-tight text-slate-900">{stat.value}</span>
            <span className="text-sm kanit-regular text-slate-500">{stat.description}</span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
