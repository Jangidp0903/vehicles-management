"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  Loader2,
  Bike,
  Gauge,
  ClipboardCheck,
  Camera,
  Save,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Plus,
  Circle,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { themeColors } from "@/lib/themeColors";

interface ChecklistItem {
  status: "OK" | "DAMAGED" | null;
  notes: string;
  photos: string[];
}

interface JobCard {
  _id: string;
  jobCardId: string;
  vehicleId: string;
  inspection: {
    odometer: number;
    checklist: {
      bodyAndFrame: ChecklistItem;
      tyresAndWheels: ChecklistItem;
      batteryAndCables: ChecklistItem;
      lightsAndIndicators: ChecklistItem;
      brakes: ChecklistItem;
    };
    isDamaged: boolean;
  };
  status: string;
}

interface Vehicle {
  vehicleId: string;
  modelName: string;
  status: string;
  currentOdometer: number;
}

const INSPECTION_ITEMS = [
  { id: "bodyAndFrame", label: "Body & Frame", icon: <Bike size={20} /> },
  { id: "tyresAndWheels", label: "Tyres & Wheels", icon: <Gauge size={20} /> },
  {
    id: "batteryAndCables",
    label: "Battery & Cables",
    icon: <AlertCircle size={20} />,
  },
  {
    id: "lightsAndIndicators",
    label: "Lights & Indicators",
    icon: <AlertCircle size={20} />,
  },
  { id: "brakes", label: "Brakes System", icon: <Gauge size={20} /> },
];

export default function InspectionPage() {
  const { vehicleId } = useParams();
  const router = useRouter();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [jobCard, setJobCard] = useState<JobCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [checklist, setChecklist] = useState<Record<string, ChecklistItem>>({
    bodyAndFrame: { status: null, notes: "", photos: [] },
    tyresAndWheels: { status: null, notes: "", photos: [] },
    batteryAndCables: { status: null, notes: "", photos: [] },
    lightsAndIndicators: { status: null, notes: "", photos: [] },
    brakes: { status: null, notes: "", photos: [] },
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [vRes, jRes] = await Promise.all([
          axios.get(`/api/vehicles/${vehicleId}`),
          axios.get(`/api/job-cards/vehicle/${vehicleId}`),
        ]);

        if (vRes.data.success) setVehicle(vRes.data.data);
        if (jRes.data.success) {
          const jc = jRes.data.data;
          setJobCard(jc);
          if (jc.inspection.checklist) {
            setChecklist(jc.inspection.checklist);
          }
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.error || "Failed to load data");
        } else {
          setError("Failed to load inspection data");
        }
      } finally {
        setLoading(false);
      }
    };

    if (vehicleId) fetchData();
  }, [vehicleId]);

  const updateItemStatus = (id: string, status: "OK" | "DAMAGED") => {
    setChecklist((prev) => ({
      ...prev,
      [id]: { ...prev[id], status },
    }));
  };

  const updateItemNotes = (id: string, notes: string) => {
    setChecklist((prev) => ({
      ...prev,
      [id]: { ...prev[id], notes },
    }));
  };

  const handleSave = async () => {
    if (!jobCard) return;

    // Validation: Check if all items are selected
    const allSelected = INSPECTION_ITEMS.every(
      (item) => checklist[item.id].status !== null,
    );
    if (!allSelected) {
      alert(
        "Please complete all inspection checklist items before submitting.",
      );
      return;
    }

    // Validation: Check if damaged items have notes
    const missingNotes = INSPECTION_ITEMS.find(
      (item) =>
        checklist[item.id].status === "DAMAGED" &&
        !checklist[item.id].notes.trim(),
    );
    if (missingNotes) {
      alert(`Please provide notes for the damaged item: ${missingNotes.label}`);
      return;
    }

    setSaving(true);
    try {
      const isDamaged = Object.values(checklist).some(
        (item) => item.status === "DAMAGED",
      );

      await axios.patch(`/api/job-cards/id/${jobCard.jobCardId}`, {
        inspection: {
          ...jobCard.inspection,
          checklist,
          isDamaged,
        },
        status: "IN_PROGRESS",
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      router.push("/admin/dashboard");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(
          "Error saving: " + (err.response?.data?.error || "Unknown error"),
        );
      } else {
        alert("Error saving: An unexpected error occurred");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2
          className="animate-spin"
          size={40}
          style={{ color: themeColors.primary }}
        />
        <p className="font-medium text-gray-500">Loading inspection form...</p>
      </div>
    );
  }

  if (error || !vehicle || !jobCard) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center space-y-4 max-w-lg mx-auto">
          <AlertCircle size={48} className="text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-red-700">Error</h2>
          <p className="text-red-600">{error || "Data not found"}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-white border-2 border-red-200 rounded-xl font-bold text-red-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full mx-auto p-1 space-y-4 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition border-2 cursor-pointer"
          style={{ borderColor: themeColors.border }}
        >
          <ChevronLeft size={16} />
        </button>
        <div>
          <h1
            className="text-lg font-bold"
            style={{ color: themeColors.textPrimary }}
          >
            Complete Inspection
          </h1>
          <p className="text-[10px] text-gray-400 font-medium">
            Job Card: #{jobCard.jobCardId}
          </p>
        </div>
      </div>

      {/* Vehicle Summary Card */}
      <div
        className="p-4 rounded-2xl border-2 space-y-3"
        style={{
          borderColor: themeColors.border,
          backgroundColor: themeColors.cardBackground,
        }}
      >
        <div
          className="flex items-center gap-3 pb-3 border-b"
          style={{ borderColor: themeColors.border }}
        >
          <div className="p-2 rounded-xl bg-red-50 text-red-500 border-2 border-red-100">
            <Bike size={24} />
          </div>
          <div>
            <h3
              className="text-lg font-bold"
              style={{ color: themeColors.textPrimary }}
            >
              {vehicle.vehicleId}
            </h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {vehicle.modelName}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
              Entry Odometer
            </p>
            <p
              className="font-bold text-base"
              style={{ color: themeColors.primary }}
            >
              {jobCard.inspection.odometer.toLocaleString()}{" "}
              <span className="text-[9px]">KM</span>
            </p>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
            Stage: Inspection
          </span>
        </div>
      </div>

      {/* Inspection Checklist */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <ClipboardCheck className="text-red-500" size={24} />
          <h2
            className="text-xl font-black"
            style={{ color: themeColors.textPrimary }}
          >
            Detailed Checklist
          </h2>
        </div>

        {INSPECTION_ITEMS.map((item) => {
          const state = checklist[item.id];
          return (
            <div
              key={item.id}
              className="p-4 rounded-2xl border-2 space-y-4 transition-all"
              style={{
                borderColor: themeColors.border,
                backgroundColor: themeColors.cardBackground,
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-gray-50 text-gray-400 border">
                    {item.icon}
                  </div>
                  <span className="font-bold text-gray-800 uppercase tracking-wide text-[11px]">
                    {item.label}
                  </span>
                </div>

                {/* Status Selection (Custom Radios) */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateItemStatus(item.id, "OK")}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-widest transition border-2 cursor-pointer ${state.status === "OK" ? "bg-emerald-50 border-emerald-500 text-emerald-600" : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"}`}
                  >
                    {state.status === "OK" ? (
                      <CheckCircle size={14} />
                    ) : (
                      <Circle size={14} />
                    )}
                    OK
                  </button>
                  <button
                    onClick={() => updateItemStatus(item.id, "DAMAGED")}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-widest transition border-2 cursor-pointer ${state.status === "DAMAGED" ? "bg-red-50 border-red-500 text-red-600" : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"}`}
                  >
                    {state.status === "DAMAGED" ? (
                      <AlertTriangle size={14} />
                    ) : (
                      <Circle size={14} />
                    )}
                    Damaged
                  </button>
                </div>
              </div>

              {/* Conditional Fields: Notes & Photos */}
              {state.status === "DAMAGED" && (
                <div
                  className="space-y-4 pt-6 border-t animate-in fade-in slide-in-from-top-4 duration-300"
                  style={{ borderColor: themeColors.border }}
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <ClipboardCheck size={14} /> Damage Notes (Required)
                    </label>
                    <textarea
                      placeholder={`Explain damage for ${item.label}...`}
                      className="w-full px-5 py-4 rounded-2xl border-2 min-h-[100px] transition focus:outline-none focus:border-red-400 bg-gray-50/50"
                      style={{ borderColor: themeColors.border }}
                      value={state.notes}
                      onChange={(e) => updateItemNotes(item.id, e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Camera size={14} /> Damage Photos (Required)
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300 hover:border-red-200 hover:text-red-300 transition cursor-pointer">
                        <Plus size={20} />
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold italic">
                        No photos uploaded yet
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submission */}
      <div
        className="flex flex-col items-center gap-6 pt-10 border-t"
        style={{ borderColor: themeColors.border }}
      >
        {saved && (
          <div className="flex items-center gap-2 text-emerald-500 font-black text-sm uppercase tracking-widest animate-in fade-in zoom-in">
            <CheckCircle2 size={20} /> Inspection Submitted Successfully
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-5 rounded-3xl text-white font-black uppercase tracking-widest transition hover:opacity-95 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
          style={{ backgroundColor: themeColors.primary }}
        >
          {saving ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            <>
              <Save size={24} /> Submit Inspection Result
            </>
          )}
        </button>
      </div>
    </div>
  );
}
