"use client";

import React, { useState } from "react";
import { themeColors } from "@/lib/themeColors";
import { LogOut, ChevronRight } from "lucide-react";
import SurrenderModal from "@/components/SurrenderModal";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="w-full px-4 py-6">
      <div className="w-full max-w-full mx-auto space-y-8">
        {/* Header */}
        <div
          className="pb-2 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{ borderColor: themeColors.border }}
        >
          <div>
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{ color: themeColors.textPrimary }}
            >
              Management Dashboard
            </h1>
            <p
              className="mt-1.5 text-sm"
              style={{ color: themeColors.textSecondary }}
            >
              Control fleet operations and maintenance.
            </p>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Surrender Vehicle Action Card */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="group relative flex flex-col items-start p-6 rounded-2xl border-2 transition-all hover:border-red-400 text-left bg-white"
            style={{ borderColor: themeColors.border }}
          >
            <div className="p-3 rounded-xl bg-red-50 text-red-500 mb-4 transition-colors group-hover:bg-red-500 group-hover:text-white">
              <LogOut size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: themeColors.textPrimary }}>
              Surrender Vehicle
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Search for a vehicle to end a rental and move it to the inspection stage.
            </p>
            <div className="mt-auto flex items-center gap-2 font-bold text-sm" style={{ color: themeColors.primary }}>
              Get Started
              <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        </div>

        {/* Modal */}
        <SurrenderModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      </div>
    </div>
  );
}


