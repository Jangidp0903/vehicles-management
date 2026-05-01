import React, { useState, useEffect } from "react";
import {
  X,
  Wrench,
  User,
  CheckSquare,
  Square,
  Calculator,
  Loader2,
  AlertCircle,
  Settings,
} from "lucide-react";
import axios from "axios";
import { themeColors } from "@/lib/themeColors";

interface Technician {
  empId: string;
  name: string;
  isAvailable: boolean;
}

interface Part {
  id: string;
  label: string;
  price: number;
}

const PART_PRICES: Part[] = [
  { id: "bodyAndFrame", label: "Body & Frame", price: 2500 },
  { id: "tyresAndWheels", label: "Tyres & Wheels", price: 1800 },
  { id: "batteryAndCables", label: "Battery & Cables", price: 1200 },
  { id: "lightsAndIndicators", label: "Lights & Indicators", price: 500 },
  { id: "brakes", label: "Brakes System", price: 950 },
];

interface RepairAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobCardId: string;
  vehicleId: string;
  damagedItems: string[];
  onSuccess: () => void;
  itemStatuses?: Record<string, string>;
}

const RepairAssignmentModal: React.FC<RepairAssignmentModalProps> = ({
  isOpen,
  onClose,
  jobCardId,
  damagedItems,
  onSuccess,
  itemStatuses = {},
}) => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState("");
  const [selectedParts, setSelectedParts] = useState<string[]>(damagedItems);
  const [labourCost] = useState<number>(1000);
  const [loading, setLoading] = useState(false);
  const [fetchingTechs, setFetchingTechs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTechDropdownOpen, setIsTechDropdownOpen] = useState(false);

  const fetchTechnicians = React.useCallback(async () => {
    setFetchingTechs(true);
    try {
      const res = await axios.get("/api/technicians");
      if (res.data.success) {
        setTechnicians(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch technicians", err);
    } finally {
      setFetchingTechs(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Use queueMicrotask to avoid synchronous setState warning
      queueMicrotask(() => {
        fetchTechnicians();
        setSelectedParts(damagedItems);
      });
    }
  }, [isOpen, damagedItems, fetchTechnicians]);

  const togglePart = (id: string) => {
    setSelectedParts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const partsTotal = selectedParts.reduce((acc, partId) => {
    const part = PART_PRICES.find((p) => p.id === partId);
    return acc + (part?.price || 0);
  }, 0);

  const estimatedTotal = partsTotal + labourCost;

  const handleSubmit = async () => {
    if (!selectedTechnician) {
      setError("Please select a technician.");
      return;
    }
    if (selectedParts.length === 0) {
      setError("Please select at least one part for repair.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const repairParts = selectedParts.map((partId) => {
        const part = PART_PRICES.find((p) => p.id === partId);
        return {
          partName: part?.label || partId,
          price: part?.price || 0,
        };
      });

      // Update Job Card and Vehicle Status
      await axios.patch(`/api/job-cards/id/${jobCardId}`, {
        technicianId: selectedTechnician,
        repairDetails: {
          parts: repairParts,
          estimatedCost: estimatedTotal,
        },
        status: "IN_PROGRESS",
      });

      onSuccess();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Failed to assign repair");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        style={{ border: `1px solid ${themeColors.border}` }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b bg-gray-50/50"
          style={{ borderColor: themeColors.border }}
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-50 text-red-500">
              <Wrench size={18} />
            </div>
            <div>
              <h2
                className="text-base font-bold"
                style={{ color: themeColors.textPrimary }}
              >
                Assign Repair Workflow
              </h2>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                Job Card: #{jobCardId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition cursor-pointer"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* Parts Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <Settings size={12} />
              Select Parts for Repair
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PART_PRICES.map((part) => (
                <div
                  key={part.id}
                  onClick={() => togglePart(part.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer ${selectedParts.includes(part.id) ? "border-red-200 bg-red-50/30" : "border-gray-100 hover:border-gray-200"}`}
                >
                  <div className="flex items-center gap-3">
                    {selectedParts.includes(part.id) ? (
                      <CheckSquare size={18} className="text-red-500" />
                    ) : (
                      <Square size={18} className="text-gray-300" />
                    )}
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-gray-700">
                        {part.label}
                      </span>
                      {itemStatuses[part.id] && (
                        <span 
                          className={`text-[8px] font-black uppercase tracking-tighter w-fit px-1 rounded mt-0.5 ${
                            itemStatuses[part.id] === "WEAR" ? "bg-orange-100 text-orange-600" :
                            itemStatuses[part.id] === "MISSING" ? "bg-gray-200 text-gray-700" :
                            "bg-red-100 text-red-600"
                          }`}
                        >
                          {itemStatuses[part.id]}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-400">
                    ₹ {part.price.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Technician Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <User size={12} />
              Assign Technician
            </label>
            <div className="relative">
              <div
                onClick={() =>
                  !fetchingTechs && setIsTechDropdownOpen(!isTechDropdownOpen)
                }
                className={`w-full px-4 py-3 rounded-xl border-2 text-sm flex items-center justify-between cursor-pointer transition-all ${isTechDropdownOpen ? "border-red-400 bg-white ring-4 ring-red-50" : "bg-gray-50 border-gray-100 hover:border-gray-200"}`}
              >
                <div className="flex items-center gap-3">
                  {selectedTechnician ? (
                    <>
                      <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px] font-black">
                        {technicians
                          .find((t) => t.empId === selectedTechnician)
                          ?.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">
                          {
                            technicians.find(
                              (t) => t.empId === selectedTechnician,
                            )?.name
                          }
                        </p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">
                          {selectedTechnician}
                        </p>
                      </div>
                    </>
                  ) : (
                    <span className="text-gray-400 font-medium italic">
                      Select a technician...
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {fetchingTechs ? (
                    <Loader2 className="animate-spin text-gray-400" size={16} />
                  ) : (
                    <div
                      className={`transition-transform duration-200 ${isTechDropdownOpen ? "rotate-180" : ""}`}
                    >
                      <Settings size={14} className="text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {isTechDropdownOpen && (
                <div
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border-2 shadow-md z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200"
                  style={{ borderColor: themeColors.border }}
                >
                  <div className="max-h-60 overflow-y-auto">
                    {technicians.length > 0 ? (
                      technicians.map((tech) => (
                        <div
                          key={tech.empId}
                          onClick={() => {
                            if (tech.isAvailable) {
                              setSelectedTechnician(tech.empId);
                              setIsTechDropdownOpen(false);
                            }
                          }}
                          className={`p-3 flex items-center justify-between border-b last:border-b-0 transition-colors ${!tech.isAvailable ? "opacity-50 cursor-not-allowed bg-gray-50" : "cursor-pointer hover:bg-red-50/50"}`}
                          style={{ borderColor: themeColors.border }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-black ${tech.isAvailable ? "bg-gray-800" : "bg-gray-400"}`}
                            >
                              {tech.name.charAt(0)}
                            </div>
                            <div>
                              <p
                                className={`text-xs font-bold ${tech.isAvailable ? "text-gray-800" : "text-gray-500"}`}
                              >
                                {tech.name}
                              </p>
                              <p className="text-[9px] font-bold text-gray-400 uppercase">
                                {tech.empId}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${tech.isAvailable ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-amber-50 text-amber-600 border-amber-200"}`}
                          >
                            {tech.isAvailable ? "Available" : "On Job"}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <Loader2
                          className="animate-spin mx-auto text-gray-300 mb-2"
                          size={24}
                        />
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Fetching Technicians...
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cost Breakdown */}
          <div
            className="p-4 rounded-2xl bg-gray-50 border-2 space-y-3"
            style={{ borderColor: themeColors.border }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Calculator size={14} className="text-gray-400" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Cost Breakdown
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 font-medium">Parts Total</span>
                <span className="text-gray-700 font-bold">
                  ₹ {partsTotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs items-center">
                <span className="text-gray-500 font-medium">Labour Cost</span>
                <span className="text-gray-700 font-bold">
                  ₹ {labourCost.toLocaleString()}
                </span>
              </div>
              <div
                className="pt-2 border-t flex justify-between items-center"
                style={{ borderColor: themeColors.border }}
              >
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Total Estimation
                </span>
                <span
                  className="text-lg font-black"
                  style={{ color: themeColors.primary }}
                >
                  ₹ {estimatedTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs font-medium">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="p-4 border-t bg-gray-50/50 flex gap-3"
          style={{ borderColor: themeColors.border }}
        >
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 rounded-xl border-2 font-bold text-gray-500 text-xs hover:bg-white transition cursor-pointer"
            style={{ borderColor: themeColors.border }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-[2] py-3 rounded-xl text-white font-bold text-xs transition hover:opacity-95 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            style={{ backgroundColor: themeColors.primary }}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Assign & Start Repair"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RepairAssignmentModal;
