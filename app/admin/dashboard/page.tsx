"use client";

import { themeColors } from "@/lib/themeColors";

export default function Dashboard() {
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
              Rider Overview
            </h1>
            <p
              className="mt-1.5 text-sm"
              style={{ color: themeColors.textSecondary }}
            >
              Live status of all riders in your system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

