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
} from "lucide-react";
import { themeColors } from "@/lib/themeColors";

interface Vehicle {
  vehicleId: string;
  modelName: string;
  status: string;
  currentOdometer: number;
}

interface JobCard {
  _id: string;
  jobCardId: string;
  vehicleId: string;
  inspection: {
    odometer: number;
    checklist: {
      bodyAndFrame: string;
      tyresAndWheels: string;
      batteryAndCables: string;
      lightsAndIndicators: string;
      brakes: string;
    };
    findings: string;
    photos: string[];
    isDamaged: boolean;
  };
  status: string;
}

export default function InspectionPage() {
  const { vehicleId } = useParams();
  const router = useRouter();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [jobCard, setJobCard] = useState<JobCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [checklist, setChecklist] = useState({
    bodyAndFrame: "OK",
    tyresAndWheels: "OK",
    batteryAndCables: "OK",
    lightsAndIndicators: "OK",
    brakes: "OK"
  });
  const [findings, setFindings] = useState("");
  const [isDamaged, setIsDamaged] = useState(false);
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
          setChecklist(jc.inspection.checklist || {
            bodyAndFrame: "OK",
            tyresAndWheels: "OK",
            batteryAndCables: "OK",
            lightsAndIndicators: "OK",
            brakes: "OK"
          });
          setFindings(jc.inspection.findings || "");
          setIsDamaged(jc.inspection.isDamaged || false);
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.error || "Failed to load inspection data",
          );
        } else {
          setError("Failed to load inspection data");
        }
      } finally {
        setLoading(false);
      }
    };

    if (vehicleId) {
      fetchData();
    }
  }, [vehicleId]);

  const toggleChecklistItem = (key: keyof typeof checklist) => {
    const newVal = checklist[key] === "OK" ? "DAMAGED" : "OK";
    const newChecklist = { ...checklist, [key]: newVal };
    setChecklist(newChecklist);
    
    // Automatically set isDamaged to true if any item is DAMAGED
    const hasAnyDamage = Object.values(newChecklist).some(val => val === "DAMAGED");
    setIsDamaged(hasAnyDamage);
  };

  const handleSave = async () => {
    if (!jobCard) return;

    setSaving(true);
    try {
      await axios.patch(`/api/job-cards/id/${jobCard.jobCardId}`, {
        inspection: {
          ...jobCard.inspection,
          checklist,
          findings,
          isDamaged,
        },
        status: "IN_PROGRESS",
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
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
            className="px-6 py-2 bg-white border-2 border-red-200 rounded-xl font-bold text-red-600 hover:bg-red-50 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const checklistItems = [
    { key: "bodyAndFrame", label: "Body & Frame", icon: <Bike size={18} /> },
    { key: "tyresAndWheels", label: "Tyres & Wheels", icon: <Gauge size={18} /> },
    { key: "batteryAndCables", label: "Battery & Cables", icon: <AlertCircle size={18} /> },
    { key: "lightsAndIndicators", label: "Lights & Indicators", icon: <AlertCircle size={18} /> },
    { key: "brakes", label: "Brakes System", icon: <Gauge size={18} /> },
  ];

  return (
    <div className="w-full max-w-full mx-auto p-2 space-y-8 pb-20">
      {/* Top Navigation */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="p-2 hover:bg-gray-100 rounded-xl transition border-2"
          style={{ borderColor: themeColors.border }}
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1
            className="text-2xl font-black"
            style={{ color: themeColors.textPrimary }}
          >
            Vehicle Inspection
          </h1>
          <p className="text-sm font-medium text-gray-400">
            Job Card:{" "}
            <span className="text-gray-600">#{jobCard.jobCardId}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Vehicle Details Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div
            className="p-6 rounded-2xl border-2 space-y-6 sticky top-24"
            style={{
              borderColor: themeColors.border,
              backgroundColor: themeColors.cardBackground,
            }}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-red-50 text-red-500 border-2 border-red-100">
                <Bike size={32} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  In Service
                </p>
                <h3
                  className="text-xl font-black"
                  style={{ color: themeColors.textPrimary }}
                >
                  {vehicle.vehicleId}
                </h3>
              </div>
            </div>

            <div
              className="space-y-4 pt-4 border-t"
              style={{ borderColor: themeColors.border }}
            >
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Model Name
                </p>
                <p
                  className="font-bold"
                  style={{ color: themeColors.textPrimary }}
                >
                  {vehicle.modelName}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Current Odometer
                </p>
                <div className="flex items-center gap-2">
                  <Gauge size={16} className="text-gray-400" />
                  <p
                    className="font-black text-lg"
                    style={{ color: themeColors.primary }}
                  >
                    {jobCard.inspection.odometer.toLocaleString()}{" "}
                    <span className="text-[10px] uppercase">KM</span>
                  </p>
                </div>
              </div>
            </div>

            <div
              className="pt-4 border-t"
              style={{ borderColor: themeColors.border }}
            >
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                Stage: Inspection
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Inspection Form */}
        <div className="lg:col-span-2 space-y-6">
          <div
            className="p-8 rounded-3xl border-2 space-y-8"
            style={{
              borderColor: themeColors.border,
              backgroundColor: themeColors.cardBackground,
            }}
          >
            <div className="flex items-center gap-3">
              <ClipboardCheck className="text-red-500" size={28} />
              <h2
                className="text-xl font-black"
                style={{ color: themeColors.textPrimary }}
              >
                Inspection Checklist
              </h2>
            </div>

            {/* Checklist Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {checklistItems.map((item) => (
                <div 
                  key={item.key}
                  className="flex items-center justify-between p-4 rounded-2xl border-2 transition-all"
                  style={{ borderColor: themeColors.border }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${checklist[item.key as keyof typeof checklist] === "DAMAGED" ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500"}`}>
                      {item.icon}
                    </div>
                    <span className="font-bold text-sm" style={{ color: themeColors.textPrimary }}>{item.label}</span>
                  </div>
                  <button 
                    onClick={() => toggleChecklistItem(item.key as keyof typeof checklist)}
                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition border-2 ${
                      checklist[item.key as keyof typeof checklist] === "OK"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                      : "bg-red-50 border-red-200 text-red-600"
                    }`}
                  >
                    {checklist[item.key as keyof typeof checklist]}
                  </button>
                </div>
              ))}
            </div>

            {/* Findings Field */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <ClipboardCheck size={16} />
                Visual Inspection & Findings
              </label>
              <textarea
                placeholder="Describe any visible scratches, dents, or mechanical issues..."
                className="w-full px-6 py-4 rounded-2xl border-2 min-h-[140px] transition focus:outline-none focus:border-red-400"
                style={{ borderColor: themeColors.border }}
                value={findings}
                onChange={(e) => setFindings(e.target.value)}
              />
            </div>

            {/* Damage Status */}
            <div
              className="flex items-center gap-4 p-6 rounded-2xl border-2"
              style={{ borderColor: themeColors.border }}
            >
              <div
                className={`p-3 rounded-xl transition ${isDamaged ? "bg-red-500 text-white" : "bg-gray-100 text-gray-400"}`}
              >
                <AlertCircle size={24} />
              </div>
              <div className="flex-1">
                <h4
                  className="font-bold text-sm"
                  style={{ color: themeColors.textPrimary }}
                >
                  Vehicle Damaged?
                </h4>
                <p className="text-xs text-gray-400">
                  Mark if any significant damage is found that requires repair.
                </p>
              </div>
              <button
                onClick={() => setIsDamaged(!isDamaged)}
                className={`px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition border-2 ${
                  isDamaged
                    ? "bg-red-50 border-red-500 text-red-500"
                    : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
                }`}
              >
                {isDamaged ? "Yes, Damaged" : "No Damage"}
              </button>
            </div>

            {/* Photos (Placeholder for now) */}
            <div className="space-y-4">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Camera size={16} />
                Vehicle Photos
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300 hover:border-red-200 hover:text-red-300 transition cursor-pointer">
                  <Plus size={24} />
                  <span className="text-[10px] font-bold mt-2">Add Photo</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              className="flex items-center justify-end gap-4 pt-8 border-t"
              style={{ borderColor: themeColors.border }}
            >
              {saved && (
                <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm animate-in fade-in slide-in-from-right-4">
                  <CheckCircle2 size={18} />
                  Changes Saved
                </div>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-10 py-4 rounded-2xl text-white font-black uppercase tracking-widest transition hover:opacity-90 active:scale-95 flex items-center gap-3"
                style={{ backgroundColor: themeColors.primary }}
              >
                {saving ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <Save size={20} /> Save Progress
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
