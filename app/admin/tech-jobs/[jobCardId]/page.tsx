"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  Loader2,
  Bike,
  ClipboardCheck,
  Wrench,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Camera,
  User,
  X,
  Calculator,
  Settings,
} from "lucide-react";
import { themeColors } from "@/lib/themeColors";
import { useRole } from "@/lib/RoleContext";
import { useNotification } from "@/lib/NotificationContext";
import AccessDenied from "@/components/AccessDenied";

interface ChecklistItem {
  status: "OK" | "DAMAGED" | "WEAR" | "MISSING" | null;
  notes?: string;
  photo?: string;
}

interface JobCard {
  _id: string;
  jobCardId: string;
  vehicleId: string;
  status: string;
  technicianId: string;
  createdAt: string;
  inspection: {
    odometer: number;
    checklist: Record<string, ChecklistItem>;
    isDamaged: boolean;
  };
  repairDetails: {
    parts: { partName: string; price: number }[];
    estimatedCost: number;
  };
  closure?: {
    partsCost: number;
    labourCost: number;
    finalCost: number;
    closedAt?: string;
  };
}

interface Vehicle {
  vehicleId: string;
  modelName: string;
  status: string;
  currentOdometer: number;
}

export default function JobCardDetailsPage() {
  const { jobCardId } = useParams();
  const router = useRouter();
  const { role, technicianId } = useRole();
  const { showSuccess, showError, showLoading, hideNotification } = useNotification();

  const [jobCard, setJobCard] = useState<JobCard | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [partsCost, setPartsCost] = useState<string>("");
  const [labourCost, setLabourCost] = useState<string>("1000"); // Default labour cost

  if (role !== "TECHNICIAN") {
    return <AccessDenied requiredRole="TECHNICIAN" />;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const jRes = await axios.get(`/api/job-cards/id/${jobCardId}`);
        if (jRes.data.success) {
          const jc = jRes.data.data;
          setJobCard(jc);
          
          // Calculate initial parts total
          const pTotal = jc.repairDetails.parts.reduce((acc: number, p: any) => acc + (p.price || 0), 0);
          setPartsCost(pTotal.toString());

          const vRes = await axios.get(`/api/vehicles/${jc.vehicleId}`);
          if (vRes.data.success) {
            setVehicle(vRes.data.data);
          }
        }
      } catch (err) {
        console.error("Error fetching details:", err);
        setError("Failed to load job card details.");
      } finally {
        setLoading(false);
      }
    };

    if (jobCardId) fetchData();
  }, [jobCardId]);

  const handleCompleteRepair = async () => {
    if (!jobCard) return;

    setCompleting(true);
    showLoading("Processing", "Finalizing maintenance records...");
    try {
      const pCost = Number(partsCost) || 0;
      const lCost = Number(labourCost) || 0;
      const fTotal = pCost + lCost;

      await axios.patch(`/api/job-cards/id/${jobCardId}`, {
        status: "CLOSED",
        closure: {
          partsCost: pCost,
          labourCost: lCost,
          finalCost: fTotal,
          closedAt: new Date(),
        },
      });
      showSuccess(
        "Repair Completed",
        "Vehicle is now Available for Redeployment.",
      );
      setIsCompletionModalOpen(false);
      setTimeout(() => {
        hideNotification();
        router.push("/admin/tech-jobs");
      }, 2000);
    } catch (err) {
      console.error("Error completing repair:", err);
      showError(
        "Submission Failed",
        "There was an error updating the maintenance records.",
      );
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          Loading job details...
        </p>
      </div>
    );
  }

  if (error || !jobCard || !vehicle) {
    return (
      <div className="p-4 text-center space-y-4">
        <div className="p-4 rounded-full bg-red-50 text-red-500 w-fit mx-auto">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-lg font-bold">Error</h2>
        <p className="text-xs text-gray-500">{error || "Data not found"}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full mx-auto p-1 space-y-4 pb-20">
      {/* Header */}
      <div
        className="flex items-center justify-between bg-white p-3 rounded-2xl border-2"
        style={{ borderColor: themeColors.border }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition border-2 cursor-pointer"
            style={{ borderColor: themeColors.border }}
          >
            <ChevronLeft size={16} />
          </button>
          <div>
            <h1
              className="text-base font-black"
              style={{ color: themeColors.textPrimary }}
            >
              Job Card Details
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">
              ID: #{jobCard.jobCardId}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${
              jobCard.status === "CLOSED"
                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                : "bg-amber-50 text-amber-600 border-amber-200"
            }`}
          >
            {jobCard.status}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Row 1: Vehicle & Technician (Side by Side on MD+) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Vehicle Info */}
          <div
            className="p-4 rounded-2xl border-2 space-y-4 bg-white"
            style={{ borderColor: themeColors.border }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-red-50 text-red-500 border border-red-100">
                <Bike size={14} />
              </div>
              <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Vehicle Information
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase">
                  Vehicle ID
                </p>
                <p className="text-xs font-black text-gray-800">
                  {vehicle.vehicleId}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase">
                  Model
                </p>
                <p className="text-xs font-bold text-gray-700">
                  {vehicle.modelName}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase">
                  Status
                </p>
                <span className="text-[10px] font-black text-amber-600 uppercase">
                  {vehicle.status}
                </span>
              </div>
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase">
                  Mileage
                </p>
                <p className="text-xs font-black text-gray-800">
                  {vehicle.currentOdometer?.toLocaleString()}{" "}
                  <span className="text-[9px] text-gray-400">KM</span>
                </p>
              </div>
            </div>
          </div>

          {/* Technician Info */}
          <div
            className="p-4 rounded-2xl border-2 space-y-4 bg-emerald-50/30 border-emerald-100/50"
            style={{ borderColor: themeColors.border }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-500 border border-emerald-100">
                <User size={14} />
              </div>
              <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Assigned Personnel
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-emerald-500/20">
                {jobCard.technicianId.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mb-0.5">
                  Technician Lead
                </p>
                <p className="text-sm font-black text-gray-800 leading-none">
                  ID: {jobCard.technicianId}
                </p>
                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">
                  Primary Mechanic
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Inspection Results Section */}
        <div
          className="p-4 rounded-2xl border-2 space-y-4 bg-white"
          style={{ borderColor: themeColors.border }}
        >
          <div
            className="flex items-center gap-2 border-b pb-3 mb-1"
            style={{ borderColor: themeColors.border }}
          >
            <div className="p-1.5 rounded-lg bg-red-50 text-red-500 border border-red-100">
              <ClipboardCheck size={14} />
            </div>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Initial Inspection Checklist
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(jobCard.inspection.checklist).map(([key, item]) => (
                <div
                  key={key}
                  className={`p-3 rounded-xl border-2 transition-all hover:shadow-md ${
                    item.status === "DAMAGED" ? "border-red-100 bg-red-50/10" : 
                    item.status === "WEAR" ? "border-orange-100 bg-orange-50/10" :
                    item.status === "MISSING" ? "border-gray-200 bg-gray-50/50" :
                    "border-gray-50 bg-gray-50/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-tight truncate mr-2">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                        item.status === "DAMAGED" ? "bg-red-500 text-white" : 
                        item.status === "WEAR" ? "bg-orange-500 text-white" :
                        item.status === "MISSING" ? "bg-gray-700 text-white" :
                        "bg-emerald-500 text-white"
                      }`}
                    >
                      {item.status || "N/A"}
                    </span>
                  </div>

                  {(item.status === "DAMAGED" || item.status === "WEAR" || item.status === "MISSING") && (
                  <div className="space-y-2">
                    {item.notes && (
                      <div className={`p-2 rounded-lg border ${
                        item.status === "DAMAGED" ? "bg-red-50/50 border-red-100" :
                        item.status === "WEAR" ? "bg-orange-50/50 border-orange-100" :
                        "bg-gray-100/50 border-gray-200"
                      }`}>
                        <p className={`text-[9px] font-bold italic ${
                          item.status === "DAMAGED" ? "text-red-600" :
                          item.status === "WEAR" ? "text-orange-600" :
                          "text-gray-600"
                        }`}>
                          &quot;{item.notes}&quot;
                        </p>
                      </div>
                    )}
                    {item.photo ? (
                      <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border-2 border-red-100 group">
                        <img
                          src={item.photo}
                          alt={key}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          onError={(e) => {
                            e.currentTarget.src = "https://placehold.co/400x300?text=Image+Not+Found";
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <Camera size={20} className="text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full aspect-[4/3] rounded-lg bg-gray-100 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300">
                        <Camera size={24} className="mb-1 opacity-20" />
                        <span className="text-[8px] font-bold uppercase tracking-widest opacity-40">No Image</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Repair & Completion Section */}
        <div
          className="rounded-2xl border-2 overflow-hidden bg-gradient-to-br from-gray-900 to-black text-white shadow-xl relative"
          style={{ borderColor: themeColors.border }}
        >
          {/* Header Bar */}
          <div className="px-4 py-3 border-b border-white/10 bg-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Wrench size={18} />
              </div>
              <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 leading-none">
                  Repair Workorder
                </h2>
                <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">
                  Authorized Maintenance Task
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-4 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 w-full sm:w-auto justify-between sm:justify-end">
              {jobCard.status === "CLOSED" ? (
                <>
                  <div className="text-left sm:text-right">
                    <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Parts</p>
                    <p className="text-xs font-bold text-gray-300">₹{jobCard.closure?.partsCost?.toLocaleString() || "0"}</p>
                  </div>
                  <div className="w-[1px] h-6 bg-white/10" />
                  <div className="text-left sm:text-right">
                    <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Labour</p>
                    <p className="text-xs font-bold text-gray-300">₹{jobCard.closure?.labourCost?.toLocaleString() || "0"}</p>
                  </div>
                  <div className="w-[1px] h-6 bg-white/10" />
                  <div className="text-right">
                    <p className="text-[8px] font-bold text-emerald-500/60 uppercase tracking-widest">Final Total</p>
                    <p className="text-sm font-black text-emerald-400">₹ {jobCard.closure?.finalCost?.toLocaleString() || "0"}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-left sm:text-right">
                    <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Labour (Est)</p>
                    <p className="text-xs font-bold text-gray-300">₹1,000</p>
                  </div>
                  <div className="w-[1px] h-6 bg-white/10" />
                  <div className="text-right">
                    <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Est. Total</p>
                    <p className="text-sm font-black text-emerald-400">₹ {jobCard.repairDetails.estimatedCost.toLocaleString()}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Parts List */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {jobCard.repairDetails.parts.map((part, idx) => (
                <div
                  key={idx}
                  className="flex flex-col p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] font-bold text-gray-300 truncate">{part.partName}</span>
                  </div>
                  <span className="text-[10px] font-black text-emerald-500/80 font-mono">
                    ₹{part.price.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial Summary (When Closed) */}
            {jobCard.status === "CLOSED" && jobCard.closure && (
              <div className="mt-6 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center gap-2 mb-4">
                  <Calculator size={14} className="text-emerald-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Financial Summary</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Final Parts Cost</p>
                    <p className="text-lg font-black text-gray-200">₹ {(jobCard.closure?.partsCost || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Final Labour Cost</p>
                    <p className="text-lg font-black text-gray-200">₹ {(jobCard.closure?.labourCost || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                    <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Grand Total</p>
                    <p className="text-lg font-black text-emerald-400">₹ {(jobCard.closure?.finalCost || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Completion Action */}
            <div className="pt-2">
              {jobCard.status !== "CLOSED" ? (
                <button
                  onClick={() => setIsCompletionModalOpen(true)}
                  disabled={completing}
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 border-b-2 border-emerald-700"
                >
                  {completing ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Confirm & Complete Repair
                    </>
                  )}
                </button>
              ) : (
                <div className="w-full py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span className="text-emerald-500 font-black uppercase tracking-widest text-[10px]">
                    Maintenance Completed
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {isCompletionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div 
            className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border-2 animate-in zoom-in-95 duration-200"
            style={{ borderColor: themeColors.border }}
          >
            {/* Modal Header */}
            <div className="p-6 border-b bg-gray-50 flex items-center justify-between" style={{ borderColor: themeColors.border }}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <Wrench size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-800 uppercase tracking-tight">Finalize Repair</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">#{jobCard.jobCardId}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCompletionModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Estimated Total</p>
                  <p className="text-lg font-black text-gray-700">₹ {jobCard.repairDetails.estimatedCost.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Final Total</p>
                  <p className="text-lg font-black text-emerald-700">₹ {( (Number(partsCost) || 0) + (Number(labourCost) || 0) ).toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Parts Cost Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Settings size={12} />
                    Final Parts Cost
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                    <input
                      type="text"
                      value={partsCost}
                      onChange={(e) => setPartsCost(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3.5 rounded-2xl border-2 text-sm font-black focus:outline-none transition-all placeholder:text-gray-200"
                      style={{ 
                        borderColor: themeColors.border,
                        backgroundColor: themeColors.cardBackground
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = themeColors.primary}
                      onBlur={(e) => e.currentTarget.style.borderColor = themeColors.border}
                    />
                  </div>
                </div>

                {/* Labour Cost Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <User size={12} />
                    Final Labour Cost
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                    <input
                      type="text"
                      value={labourCost}
                      onChange={(e) => setLabourCost(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3.5 rounded-2xl border-2 text-sm font-black focus:outline-none transition-all placeholder:text-gray-200"
                      style={{ 
                        borderColor: themeColors.border,
                        backgroundColor: themeColors.cardBackground
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = themeColors.primary}
                      onBlur={(e) => e.currentTarget.style.borderColor = themeColors.border}
                    />
                  </div>
                </div>
              </div>

              <p className="text-[9px] font-bold text-gray-400 leading-relaxed italic text-center">
                * Verify all charges before closing. Total will be calculated automatically.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 flex items-center gap-3">
              <button 
                onClick={() => setIsCompletionModalOpen(false)}
                className="flex-1 py-3.5 rounded-2xl font-bold text-xs text-gray-500 bg-white border-2 hover:bg-gray-50 transition active:scale-95 cursor-pointer"
                style={{ borderColor: themeColors.border }}
              >
                Cancel
              </button>
              <button 
                onClick={handleCompleteRepair}
                disabled={completing || (!partsCost && !labourCost)}
                className="flex-[1.5] py-3.5 rounded-2xl font-black text-xs text-white shadow-lg shadow-emerald-500/20 hover:opacity-90 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                style={{ backgroundColor: "#10B981" }}
              >
                {completing ? <Loader2 size={16} className="animate-spin" /> : <><CheckCircle2 size={16} /> Close Job</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
