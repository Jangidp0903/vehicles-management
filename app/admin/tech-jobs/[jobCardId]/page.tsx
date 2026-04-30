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
      alert("You are not assigned to this job card.");
      return;
    }

    setCompleting(true);
    try {
      await axios.patch(`/api/job-cards/id/${jobCardId}`, {
        status: "CLOSED",
      });
      alert("Repair marked as completed! Vehicle is now AVAILABLE.");
      router.push("/admin/tech-jobs");
    } catch (err) {
      console.error("Error completing repair:", err);
      alert("Failed to complete repair. Please try again.");
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
    <div className="w-full max-w-full mx-auto p-1 space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
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
              className="text-lg font-black"
              style={{ color: themeColors.textPrimary }}
            >
              Job Details
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Job ID: #{jobCard.jobCardId}
            </p>
          </div>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Vehicle & Technician */}
        <div className="lg:col-span-1 space-y-6">
          {/* Vehicle Info */}
          <div
            className="p-4 rounded-2xl border-2 space-y-4 bg-white"
            style={{ borderColor: themeColors.border }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Bike className="text-red-500" size={16} />
              <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Vehicle Info
              </h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase">
                  Vehicle ID
                </p>
                <p className="text-sm font-black text-gray-800">
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
              <div
                className="flex items-center justify-between pt-2 border-t"
                style={{ borderColor: themeColors.border }}
              >
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase">
                    Current Status
                  </p>
                  <span className="text-[10px] font-black text-amber-600 uppercase">
                    {vehicle.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-gray-400 uppercase">
                    Odometer
                  </p>
                  <p className="text-xs font-black text-gray-800">
                    {vehicle.currentOdometer?.toLocaleString()}{" "}
                    <span className="text-[9px]">KM</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Technician Info */}
          <div
            className="p-4 rounded-2xl border-2 space-y-4 bg-gray-50/50"
            style={{ borderColor: themeColors.border }}
          >
            <div className="flex items-center gap-2 mb-1">
              <User className="text-emerald-500" size={16} />
              <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Assigned Tech
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-black text-xs">
                {jobCard.technicianId.slice(0, 2)}
              </div>
              <div>
                <p className="text-xs font-black text-gray-800">
                  Technician ID
                </p>
                <p className="text-[10px] font-bold text-gray-400">
                  {jobCard.technicianId}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Inspection & Repairs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Inspection Results */}
          <div
            className="p-4 rounded-2xl border-2 space-y-4 bg-white"
            style={{ borderColor: themeColors.border }}
          >
            <div className="flex items-center gap-2 mb-1">
              <ClipboardCheck className="text-red-500" size={16} />
              <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Inspection Summary
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(jobCard.inspection.checklist).map(
                ([key, item]) => (
                  <div
                    key={key}
                    className={`p-3 rounded-xl border-2 space-y-2 ${item.status === "DAMAGED" ? "border-red-100 bg-red-50/20" : "border-gray-50 bg-gray-50/30"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-gray-700 uppercase tracking-tight">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${item.status === "DAMAGED" ? "bg-red-500 text-white" : "bg-emerald-500 text-white"}`}
                      >
                        {item.status || "N/A"}
                      </span>
                    </div>

                    {item.status === "DAMAGED" && (
                      <div className="space-y-2 pt-1">
                        {item.notes && (
                          <div className="flex items-start gap-1.5">
                            <AlertCircle
                              size={10}
                              className="text-red-400 mt-0.5"
                            />
                            <p className="text-[10px] font-medium text-red-600 italic">
                              "{item.notes}"
                            </p>
                          </div>
                        )}
                        {item.photo && (
                          <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-black/5">
                            <img
                              src={item.photo}
                              alt={key}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/50 backdrop-blur-md rounded text-[7px] text-white font-bold flex items-center gap-1">
                              <Camera size={8} /> DAMAGE EVIDENCE
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Repair Work Detail */}
          <div
            className="p-4 rounded-2xl border-2 space-y-4 bg-gray-900 text-white shadow-xl"
            style={{ borderColor: themeColors.border }}
          >
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Wrench className="text-emerald-400" size={16} />
                <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Repair Work Detail
                </h2>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-bold text-gray-500 uppercase">
                  Estimated Total
                </p>
                <p className="text-lg font-black text-emerald-400">
                  ₹ {jobCard.repairDetails.estimatedCost.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                  Parts Replaced/Repaired
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {jobCard.repairDetails.parts.map((part, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10 text-[11px] font-bold"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={12} className="text-emerald-500" />
                        <span>{part.partName}</span>
                      </div>
                      <span className="text-gray-400">
                        ₹ {part.price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-dashed border-white/20">
                <div className="flex items-center gap-2">
                  <IndianRupee size={14} className="text-emerald-400" />
                  <span className="text-xs font-bold">
                    Fixed Labour Cost Included
                  </span>
                </div>
                <span className="text-xs font-black text-emerald-400">
                  ₹ 1,000
                </span>
              </div>
            </div>

            {/* Action Button */}
            {jobCard.status !== "CLOSED" && (
              <button
                onClick={handleCompleteRepair}
                disabled={completing}
                className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm uppercase tracking-widest transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                {completing ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 size={18} /> Mark as Repair Completed
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
