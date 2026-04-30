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

  const fetchStats = React.useCallback(async () => {
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
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      fetchStats();
    });
  }, [fetchStats]);

  const statConfig = [
    {
      label: "Total Vehicles",
      value: stats?.TOTAL || 0,
      icon: <Bike size={18} />,
      color: themeColors.primary,
      textColor: "text-white",
    },
    {
      label: "On Road (Rented)",
      value: stats?.RENTED || 0,
      icon: <History size={18} />,
      color: "#3B82F6", // blue-500
      textColor: "text-white",
    },
    {
      label: "Ready for Delivery",
      value: stats?.RFD || 0,
      icon: <CheckCircle2 size={18} />,
      color: "#10B981", // emerald-500
      textColor: "text-white",
    },
    {
      label: "Under Inspection",
      value: stats?.UNDER_INSPECTION || 0,
      icon: <Search size={18} />,
      color: "#14B8A6", // teal-500
      textColor: "text-white",
    },
    {
      label: "Under Repair",
      value: stats?.UNDER_REPAIR || 0,
      icon: <Wrench size={18} />,
      color: "#F59E0B", // amber-500
      textColor: "text-white",
    },
    {
      label: "Damaged",
      value: stats?.DAMAGED || 0,
      icon: <AlertCircle size={18} />,
      color: "#EF4444", // red-500
      textColor: "text-white",
    },
  ];

  return (
    <div className="w-full p-1 space-y-6">
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
              className={`w-8 h-8 rounded-xl ${item.textColor} flex items-center justify-center mb-3`}
              style={{ backgroundColor: item.color }}
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
                className="group relative flex flex-col items-start p-5 rounded-2xl border-2 transition-all text-left bg-white cursor-pointer hover:shadow-lg active:scale-[0.98]"
                style={{ 
                  borderColor: themeColors.border,
                  backgroundColor: themeColors.cardBackground 
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = themeColors.primary}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = themeColors.border}
              >
                <div 
                  className="p-3 rounded-xl mb-4 transition-colors group-hover:text-white"
                  style={{ 
                    backgroundColor: themeColors.sidebarActiveBackground,
                    color: themeColors.primary
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeColors.primary}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = themeColors.sidebarActiveBackground}
                >
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
                 <div 
                  className="mt-auto flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest"
                  style={{ color: themeColors.primary }}
                >
                  Initiate Return
                  <ChevronRight size={14} />
                </div>
              </button>

              {/* Inspection Queue Card */}
              <button
                onClick={() => router.push("/admin/inspections")}
                className="group relative flex flex-col items-start p-5 rounded-2xl border-2 transition-all text-left bg-white cursor-pointer hover:shadow-lg active:scale-[0.98]"
                style={{ 
                  borderColor: themeColors.border,
                  backgroundColor: themeColors.cardBackground 
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = themeColors.primary}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = themeColors.border}
              >
                <div 
                  className="p-3 rounded-xl mb-4 transition-colors group-hover:text-white"
                  style={{ 
                    backgroundColor: themeColors.sidebarActiveBackground,
                    color: themeColors.primary
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeColors.primary}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = themeColors.sidebarActiveBackground}
                >
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
                <div 
                  className="mt-auto flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest"
                  style={{ color: themeColors.primary }}
                >
                  Open Queue
                  <ChevronRight size={14} />
                </div>
              </button>
            </>
          ) : (
            /* Maintenance Queue Card */
            <button
              onClick={() => router.push("/admin/tech-jobs")}
              className="group relative flex flex-col items-start p-5 rounded-2xl border-2 transition-all text-left bg-white cursor-pointer hover:shadow-lg active:scale-[0.98]"
              style={{ 
                borderColor: themeColors.border,
                backgroundColor: themeColors.cardBackground 
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = themeColors.primary}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = themeColors.border}
            >
              <div 
                className="p-3 rounded-xl mb-4 transition-colors group-hover:text-white"
                style={{ 
                  backgroundColor: themeColors.sidebarActiveBackground,
                  color: themeColors.primary
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeColors.primary}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = themeColors.sidebarActiveBackground}
              >
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
              <div 
                className="mt-auto flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest"
                style={{ color: themeColors.primary }}
              >
                Go to Tasks
                <ChevronRight size={14} />
              </div>
            </button>
          )}

          {/* Fleet Inventory Card (Visible to All) */}
          <button
            onClick={() => router.push("/admin/vehicles")}
            className="group relative flex flex-col items-start p-5 rounded-2xl border-2 transition-all text-left bg-white cursor-pointer hover:shadow-lg active:scale-[0.98]"
            style={{ 
              borderColor: themeColors.border,
              backgroundColor: themeColors.cardBackground 
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = themeColors.primary}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = themeColors.border}
          >
            <div 
              className="p-3 rounded-xl mb-4 transition-colors group-hover:text-white"
              style={{ 
                backgroundColor: themeColors.sidebarActiveBackground,
                color: themeColors.primary
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeColors.primary}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = themeColors.sidebarActiveBackground}
            >
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
            <div 
              className="mt-auto flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest"
              style={{ color: themeColors.primary }}
            >
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
