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
  Clock,
  Camera,
  IndianRupee,
  User,
  Gauge,
} from "lucide-react";
import { themeColors } from "@/lib/themeColors";
import { useRole } from "@/lib/RoleContext";
import { useNotification } from "@/lib/NotificationContext";

interface ChecklistItem {
  status: "OK" | "DAMAGED" | null;
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const jRes = await axios.get(`/api/job-cards/id/${jobCardId}`);
        if (jRes.data.success) {
          const jc = jRes.data.data;
          setJobCard(jc);

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

    // Security check
    if (role === "TECHNICIAN" && jobCard.technicianId !== technicianId) {
      showError("Access Denied", "You are not assigned to this job card.");
      return;
    }

    setCompleting(true);
    showLoading("Processing", "Finalizing maintenance records...");
    try {
      await axios.patch(`/api/job-cards/id/${jobCardId}`, {
        status: "CLOSED",
      });
      showSuccess("Repair Completed", "Vehicle is now AVAILABLE and cleared for operations.");
      setTimeout(() => {
        hideNotification();
        router.push("/admin/tech-jobs");
      }, 2000);
    } catch (err) {
      console.error("Error completing repair:", err);
      showError("Submission Failed", "There was an error updating the maintenance records. Please try again.");
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
                  Odometer
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
                className={`p-3 rounded-xl border-2 transition-all hover:shadow-md ${item.status === "DAMAGED" ? "border-red-100 bg-red-50/10" : "border-gray-50 bg-gray-50/20"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-gray-700 uppercase tracking-tight truncate mr-2">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${item.status === "DAMAGED" ? "bg-red-500 text-white" : "bg-emerald-500 text-white"}`}
                  >
                    {item.status || "N/A"}
                  </span>
                </div>

                {item.status === "DAMAGED" && (
                  <div className="space-y-2">
                    {item.notes && (
                      <div className="p-2 bg-red-50/50 rounded-lg border border-red-100">
                        <p className="text-[9px] font-bold text-red-600 italic">
                          "{item.notes}"
                        </p>
                      </div>
                    )}
                    {item.photo && (
                      <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border-2 border-red-100 group">
                        <img
                          src={item.photo}
                          alt={key}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera size={20} className="text-white" />
                        </div>
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
          className="p-6 rounded-3xl border-2 space-y-6 bg-gray-900 text-white shadow-2xl relative overflow-hidden"
          style={{ borderColor: themeColors.border }}
        >
          {/* Subtle Background Pattern */}
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Wrench size={120} />
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-emerald-400">
                <Wrench size={24} />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">
                  Repair Workorder
                </h2>
                <p className="text-xs text-gray-500 font-bold uppercase mt-1">
                  Authorized Maintenance Task
                </p>
              </div>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-6">
              <div className="text-center">
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                  Labour
                </p>
                <p className="text-sm font-black">₹ 1,000</p>
              </div>
              <div className="w-[1px] h-8 bg-white/10" />
              <div className="text-right">
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">
                  Total Due
                </p>
                <p className="text-2xl font-black text-emerald-400 leading-none">
                  ₹ {jobCard.repairDetails.estimatedCost.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              Selected Components for Repair
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {jobCard.repairDetails.parts.map((part, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold">{part.partName}</span>
                  </div>
                  <span className="text-[11px] font-black text-gray-400 font-mono">
                    ₹{part.price.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Completion Action */}
          <div className="pt-4">
            {jobCard.status !== "CLOSED" ? (
              <button
                onClick={handleCompleteRepair}
                disabled={completing}
                className="w-full py-5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm uppercase tracking-[0.3em] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 cursor-pointer shadow-2xl shadow-emerald-500/40 border-b-4 border-emerald-700"
              >
                {completing ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 size={24} />
                    Confirm & Complete Repair
                  </>
                )}
              </button>
            ) : (
              <div className="w-full py-5 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/50 flex items-center justify-center gap-3">
                <CheckCircle2 size={24} className="text-emerald-500" />
                <span className="text-emerald-500 font-black uppercase tracking-widest text-sm">
                  Maintenance Completed
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
