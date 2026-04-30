"use client";
import React, { useState, useEffect } from "react";
import { themeColors } from "@/lib/themeColors";
import {
  LogOut,
  ChevronRight,
  Bike,
  Search,
  Wrench,
  AlertCircle,
  CheckCircle2,
  History,
  Loader2,
  LayoutDashboard,
  ClipboardCheck,
} from "lucide-react";
import SurrenderModal from "@/components/SurrenderModal";
import { useRole } from "@/lib/RoleContext";
import { useRouter } from "next/navigation";
import axios from "axios";

interface Stats {
  RENTED: number;
  UNDER_INSPECTION: number;
  DAMAGED: number;
  UNDER_REPAIR: number;
  RFD: number;
  TOTAL: number;
}

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { role } = useRole();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/dashboard/stats");
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statConfig = [
    {
      label: "Total Vehicles",
      value: stats?.TOTAL || 0,
      icon: <Bike size={18} />,
      color: "bg-gray-900",
      textColor: "text-white",
    },
    {
      label: "On Road (Rented)",
      value: stats?.RENTED || 0,
      icon: <History size={18} />,
      color: "bg-blue-500",
      textColor: "text-white",
    },
    {
      label: "Ready for Delivery",
      value: stats?.RFD || 0,
      icon: <CheckCircle2 size={18} />,
      color: "bg-emerald-500",
      textColor: "text-white",
    },
    {
      label: "Under Inspection",
      value: stats?.UNDER_INSPECTION || 0,
      icon: <Search size={18} />,
      color: "bg-teal-500",
      textColor: "text-white",
    },
    {
      label: "Under Repair",
      value: stats?.UNDER_REPAIR || 0,
      icon: <Wrench size={18} />,
      color: "bg-amber-500",
      textColor: "text-white",
    },
    {
      label: "Damaged",
      value: stats?.DAMAGED || 0,
      icon: <AlertCircle size={18} />,
      color: "bg-red-500",
      textColor: "text-white",
    },
  ];

  return (
    <div className="w-full px-4 py-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1
            className="text-xl font-bold tracking-tight"
            style={{ color: themeColors.textPrimary }}
          >
            Vehicle Overview
          </h1>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-1">
            Real-time Vehicle Insights
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 hover:bg-gray-50 transition font-bold text-[10px] uppercase tracking-widest cursor-pointer"
          style={{ borderColor: themeColors.border }}
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <LayoutDashboard size={14} />
          )}
          Refresh Stats
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statConfig.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl border-2 bg-white flex flex-col justify-between group transition-colors"
            style={{ borderColor: themeColors.border }}
          >
            <div
              className={`w-8 h-8 rounded-xl ${item.color} ${item.textColor} flex items-center justify-center mb-3`}
            >
              {item.icon}
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-tight mb-1">
                {item.label}
              </p>
              <h2 className="text-xl font-bold text-gray-900">
                {loading ? "..." : item.value.toLocaleString()}
              </h2>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {role === "OPERATOR" ? (
            <>
              {/* Surrender Card */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="group relative flex flex-col items-start p-5 rounded-2xl border-2 transition-colors hover:border-red-400 text-left bg-white cursor-pointer"
                style={{ borderColor: themeColors.border }}
              >
                <div className="p-3 rounded-xl bg-red-50 text-red-500 mb-4 transition-colors group-hover:bg-red-500 group-hover:text-white">
                  <LogOut size={24} />
                </div>
                <h3
                  className="text-base font-bold mb-1"
                  style={{ color: themeColors.textPrimary }}
                >
                  Surrender Vehicle
                </h3>
                <p className="text-xs text-gray-500 mb-6 font-medium leading-relaxed">
                  Search for a vehicle to end a rental and move it to the
                  inspection stage.
                </p>
                <div className="mt-auto flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest text-red-600">
                  Initiate Return
                  <ChevronRight size={14} />
                </div>
              </button>

              {/* Inspection Queue Card */}
              <button
                onClick={() => router.push("/admin/inspections")}
                className="group relative flex flex-col items-start p-5 rounded-2xl border-2 transition-colors hover:border-teal-400 text-left bg-white cursor-pointer"
                style={{ borderColor: themeColors.border }}
              >
                <div className="p-3 rounded-xl bg-teal-50 text-teal-500 mb-4 transition-colors group-hover:bg-teal-500 group-hover:text-white">
                  <ClipboardCheck size={24} />
                </div>
                <h3
                  className="text-base font-bold mb-1"
                  style={{ color: themeColors.textPrimary }}
                >
                  Pending Inspections
                </h3>
                <p className="text-xs text-gray-500 mb-6 font-medium leading-relaxed">
                  Review and complete reports for vehicles currently under
                  inspection.
                </p>
                <div className="mt-auto flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest text-teal-600">
                  Open Queue
                  <ChevronRight size={14} />
                </div>
              </button>
            </>
          ) : (
            /* Maintenance Queue Card */
            <button
              onClick={() => router.push("/admin/tech-jobs")}
              className="group relative flex flex-col items-start p-5 rounded-2xl border-2 transition-colors hover:border-emerald-400 text-left bg-white cursor-pointer"
              style={{ borderColor: themeColors.border }}
            >
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-500 mb-4 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
                <Wrench size={24} />
              </div>
              <h3
                className="text-base font-bold mb-1"
                style={{ color: themeColors.textPrimary }}
              >
                My Maintenance Queue
              </h3>
              <p className="text-xs text-gray-500 mb-6 font-medium leading-relaxed">
                Check and update your assigned repair tasks and mark them as
                completed.
              </p>
              <div className="mt-auto flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest text-emerald-600">
                Go to Tasks
                <ChevronRight size={14} />
              </div>
            </button>
          )}

          {/* Fleet Inventory Card (Visible to All) */}
          <button
            onClick={() => router.push("/admin/vehicles")}
            className="group relative flex flex-col items-start p-5 rounded-2xl border-2 transition-colors hover:border-blue-400 text-left bg-white cursor-pointer"
            style={{ borderColor: themeColors.border }}
          >
            <div className="p-3 rounded-xl bg-blue-50 text-blue-500 mb-4 transition-colors group-hover:bg-blue-500 group-hover:text-white">
              <Bike size={24} />
            </div>
            <h3
              className="text-base font-bold mb-1"
              style={{ color: themeColors.textPrimary }}
            >
              View Inventory
            </h3>
            <p className="text-xs text-gray-500 mb-6 font-medium leading-relaxed">
              View comprehensive details of all vehicles, history and current
              status.
            </p>
            <div className="mt-auto flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest text-blue-600">
              View Inventory
              <ChevronRight size={14} />
            </div>
          </button>
        </div>
      </div>

      {/* Modal */}
      <SurrenderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
