"use client";
import React from "react";
import { CheckCircle2, AlertCircle, X, Loader2 } from "lucide-react";
import { themeColors } from "@/lib/themeColors";

export type NotificationType = "success" | "error" | "loading" | null;

interface NotificationModalProps {
  isOpen: boolean;
  type: NotificationType;
  title: string;
  message: string;
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  type,
  title,
  message,
  onClose,
}) => {
  if (!isOpen) return null;

  const getColors = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-emerald-50",
          border: "border-emerald-100",
          icon: "text-emerald-500",
          button: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200",
        };
      case "error":
        return {
          bg: "bg-red-50",
          border: "border-red-100",
          icon: "text-red-500",
          button: "bg-red-500 hover:bg-red-600 shadow-red-200",
        };
      case "loading":
        return {
          bg: "bg-gray-50",
          border: "border-gray-100",
          icon: "text-gray-400",
          button: "bg-gray-900 hover:bg-black shadow-gray-200",
        };
      default:
        return {
          bg: "bg-white",
          border: "border-gray-100",
          icon: "text-gray-400",
          button: "bg-gray-900",
        };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={type !== "loading" ? onClose : undefined}
      />
      
      {/* Modal Content */}
      <div 
        className={`relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border-2 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300`}
        style={{ borderColor: themeColors.border }}
      >
        {/* Top Strip */}
        <div className={`h-1.5 w-full ${colors.bg.replace('50', '500')}`} />
        
        <div className="p-6 pt-8 text-center space-y-4">
          {/* Icon */}
          <div className={`mx-auto w-16 h-16 rounded-2xl ${colors.bg} ${colors.border} border-2 flex items-center justify-center`}>
            {type === "success" && <CheckCircle2 className={colors.icon} size={32} />}
            {type === "error" && <AlertCircle className={colors.icon} size={32} />}
            {type === "loading" && <Loader2 className={`${colors.icon} animate-spin`} size={32} />}
          </div>

          {/* Text Content */}
          <div className="space-y-1">
            <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">
              {title}
            </h3>
            <p className="text-xs font-medium text-gray-500 leading-relaxed px-4">
              {message}
            </p>
          </div>

          {/* Action Button */}
          {type !== "loading" && (
            <button
              onClick={onClose}
              className={`w-full py-3 rounded-2xl text-white font-black text-xs uppercase tracking-widest transition shadow-lg active:scale-95 cursor-pointer ${colors.button}`}
            >
              Dismiss
            </button>
          )}
        </div>

        {/* Close Button (X) */}
        {type !== "loading" && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 transition text-gray-400"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationModal;
