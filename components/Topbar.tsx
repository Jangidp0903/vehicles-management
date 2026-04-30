"use client";
import React, { useEffect, useState } from "react";
import { Menu, ChevronLeft, ChevronRight, User } from "lucide-react";
import { themeColors } from "@/lib/themeColors";

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
  const [pageTitle] = useState("Dashboard");

  // Device detection
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = themeColors.border;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor =
              themeColors.sidebarActiveBackground;
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
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = themeColors.border;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor =
              themeColors.sidebarActiveBackground;
          }}
        >
          {sidebarCollapsed ? (
            <ChevronRight size={20} />
          ) : (
            <ChevronLeft size={20} />
          )}
        </button>

        <h1
          className="text-base sm:text-lg lg:text-xl font-bold truncate max-w-[140px] sm:max-w-none"
          style={{ color: themeColors.primary }}
        >
          {pageTitle}
        </h1>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        <button className="flex items-center space-x-2 sm:space-x-3 bg-gray-50 border-2 border-gray-200 rounded-xl px-2 sm:px-3 py-1 hover:bg-red-50 hover:border-red-300 text-gray-600 transition cursor-pointer">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold text-gray-800 truncate max-w-[80px] sm:max-w-none">
              Puneet Jangid
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
