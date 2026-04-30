"use client";
import React from "react";
import { AlertCircle, ArrowLeft, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { themeColors } from "@/lib/themeColors";

interface AccessDeniedProps {
  requiredRole: "OPERATOR" | "TECHNICIAN";
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ requiredRole }) => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center animate-in fade-in duration-500">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center border-4 border-white shadow-xl">
          <ShieldAlert size={48} className="text-red-500" />
        </div>
        <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md">
          <AlertCircle size={20} className="text-red-600" />
        </div>
      </div>

      <h1 className="text-2xl font-black mb-2" style={{ color: themeColors.textPrimary }}>
        Access Restricted
      </h1>
      
      <p className="text-sm text-gray-500 max-w-sm mb-8 font-medium">
        This section is reserved for <span className="text-red-500 font-bold uppercase tracking-wider">{requiredRole}S</span>. 
        Please switch your view from the top navigation to gain access.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-all active:scale-95 cursor-pointer shadow-lg"
        >
          <ArrowLeft size={16} />
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default AccessDenied;
