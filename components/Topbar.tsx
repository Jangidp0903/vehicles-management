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
} from "lucide-react";
import { themeColors } from "@/lib/themeColors";
import { useRole } from "@/lib/RoleContext";
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
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  // Device detection
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const fetchTechnicians = React.useCallback(async () => {
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
    }
  }, [technicianId, setTechnicianId]);

  useEffect(() => {
    if (role === "TECHNICIAN") {
      // Use microtask to avoid synchronous setState warning in some lint rules
      queueMicrotask(() => {
        fetchTechnicians();
      });
    }
  }, [role, fetchTechnicians]);

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
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center space-x-2 sm:space-x-3 bg-gray-50 border-2 border-gray-200 rounded-xl px-2 sm:px-3 py-1 hover:bg-red-50 hover:border-red-300 text-gray-600 transition cursor-pointer"
          >
            <div className="hidden sm:block text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Active View
              </p>
              <p className="text-xs font-black text-gray-800">
                {role === "OPERATOR" ? "Operator" : "Technician"}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500 border-2 border-red-600 rounded-xl flex items-center justify-center">
              <User size={18} className="text-white" />
            </div>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-2 z-50">
              <button
                onClick={() => {
                  setRole("OPERATOR");
                  setShowRoleDropdown(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${
                  role === "OPERATOR"
                    ? "bg-red-50 text-red-600"
                    : "hover:bg-gray-50 text-gray-600"
                }`}
              >
                <Shield size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Operator View
                </span>
              </button>
              <button
                onClick={() => {
                  setRole("TECHNICIAN");
                  setShowRoleDropdown(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${
                  role === "TECHNICIAN"
                    ? "bg-red-50 text-red-600"
                    : "hover:bg-gray-50 text-gray-600"
                }`}
              >
                <Wrench size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Technician View
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
