"use client";
import React, { useEffect, useState } from "react";
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  User,
  Shield,
  Wrench,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { themeColors } from "@/lib/themeColors";
import { useRole, UserRole } from "@/lib/RoleContext";
import axios from "axios";

interface Technician {
  empId: string;
  name: string;
}

const Topbar = ({
  onToggleSidebar,
  onToggleCollapse,
  sidebarCollapsed,
}: {
  onToggleSidebar: () => void;
  onToggleCollapse: () => void;
  sidebarCollapsed: boolean;
}) => {
  const [isDesktop, setIsDesktop] = useState(false);
  const { role, setRole, technicianId, setTechnicianId } = useRole();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loadingTechs, setLoadingTechs] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  // Device detection
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (role === "TECHNICIAN") {
      fetchTechnicians();
    }
  }, [role]);

  const fetchTechnicians = async () => {
    setLoadingTechs(true);
    try {
      const res = await axios.get("/api/technicians");
      if (res.data.success) {
        setTechnicians(res.data.data);
        if (res.data.data.length > 0 && !technicianId) {
          setTechnicianId(res.data.data[0].empId);
        }
      }
    } catch (err) {
      console.error("Failed to fetch technicians", err);
    } finally {
      setLoadingTechs(false);
    }
  };

  const headerStyle = {
    left: isDesktop ? (sidebarCollapsed ? "5rem" : "16rem") : "0",
  };

  return (
    <header
      className="fixed top-0 right-0 h-16 px-3 sm:px-4 md:px-6 flex justify-between items-center z-20 transition-all duration-300 ease-in-out"
      style={{
        ...headerStyle,
        backgroundColor: themeColors.cardBackground,
        borderBottom: `1px solid ${themeColors.border}`,
      }}
    >
      {/* LEFT SIDE */}
      <div className="flex items-center space-x-1 sm:space-x-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 cursor-pointer rounded-xl transition"
          style={{
            backgroundColor: themeColors.sidebarActiveBackground,
            color: themeColors.textSecondary,
          }}
        >
          <Menu size={20} />
        </button>

        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-2 cursor-pointer rounded-xl transition"
          style={{
            backgroundColor: themeColors.sidebarActiveBackground,
            color: themeColors.textSecondary,
          }}
        >
          {sidebarCollapsed ? (
            <ChevronRight size={20} />
          ) : (
            <ChevronLeft size={20} />
          )}
        </button>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Role Toggle Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 transition-all hover:bg-gray-50 cursor-pointer"
            style={{ borderColor: themeColors.border }}
          >
            <div
              className={`p-1 rounded-lg ${role === "OPERATOR" ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500"}`}
            >
              {role === "OPERATOR" ? (
                <Shield size={14} />
              ) : (
                <Wrench size={14} />
              )}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-0.5">
                Current View
              </p>
              <p className="text-xs font-bold text-gray-800 leading-none">
                {role === "OPERATOR" ? "Operator" : "Technician"}
              </p>
            </div>
            <ChevronDown
              size={14}
              className={`text-gray-400 transition-transform ${showRoleDropdown ? "rotate-180" : ""}`}
            />
          </button>

          {showRoleDropdown && (
            <div
              className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border-2 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50"
              style={{ borderColor: themeColors.border }}
            >
              <button
                onClick={() => {
                  setRole("OPERATOR");
                  setShowRoleDropdown(false);
                }}
                className={`w-full flex items-center gap-3 p-3 transition hover:bg-gray-50 text-left cursor-pointer ${role === "OPERATOR" ? "bg-red-50/50" : ""}`}
              >
                <div className="p-1.5 rounded-lg bg-red-50 text-red-500 border border-red-100">
                  <Shield size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">
                    Operator View
                  </p>
                  <p className="text-[9px] text-gray-400 font-medium">
                    Full management access
                  </p>
                </div>
              </button>
              <button
                onClick={() => {
                  setRole("TECHNICIAN");
                  setShowRoleDropdown(false);
                }}
                className={`w-full flex items-center gap-3 p-3 transition hover:bg-gray-50 text-left cursor-pointer ${role === "TECHNICIAN" ? "bg-emerald-50/50" : ""}`}
              >
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-500 border border-emerald-100">
                  <Wrench size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">
                    Technician View
                  </p>
                  <p className="text-[9px] text-gray-400 font-medium">
                    Assigned tasks & repairs
                  </p>
                </div>
              </button>
            </div>
          )}
        </div>

        <button className="flex items-center space-x-2 sm:space-x-3 bg-gray-50 border-2 border-gray-200 rounded-xl px-2 sm:px-3 py-1 hover:bg-red-50 hover:border-red-300 text-gray-600 transition cursor-pointer">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold text-gray-800 truncate max-w-[80px] sm:max-w-none">
              {role === "OPERATOR"
                ? "Operator"
                : technicians.find((t) => t.empId === technicianId)?.name ||
                  "Technician"}
            </p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500 border-2 border-red-600 rounded-xl flex items-center justify-center">
            <User size={18} className="text-white" />
          </div>
        </button>
      </div>
    </header>
  );
};

export default Topbar;
