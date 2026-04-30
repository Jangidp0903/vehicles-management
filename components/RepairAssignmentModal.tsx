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
  Settings
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
}

const RepairAssignmentModal: React.FC<RepairAssignmentModalProps> = ({
  isOpen,
  onClose,
  jobCardId,
  damagedItems,
  onSuccess
}) => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState("");
  const [selectedParts, setSelectedParts] = useState<string[]>(damagedItems);
  const [labourCost] = useState<number>(1000);
  const [loading, setLoading] = useState(false);
  const [fetchingTechs, setFetchingTechs] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setSelectedParts(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const partsTotal = selectedParts.reduce((acc, partId) => {
    const part = PART_PRICES.find(p => p.id === partId);
    return acc + (part?.price || 0);
  }, 0);

  const estimatedTotal = partsTotal + labourCost;

  const handleSubmit = async () => {
    if (!selectedTechnician) {
      alert("Please select a technician.");
      return;
    }
    if (selectedParts.length === 0) {
      alert("Please select at least one part for repair.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const repairParts = selectedParts.map(partId => {
        const part = PART_PRICES.find(p => p.id === partId);
        return {
          partName: part?.label || partId,
          price: part?.price || 0
        };
      });

      // Update Job Card and Vehicle Status
      await axios.patch(`/api/job-cards/id/${jobCardId}`, {
        technicianId: selectedTechnician,
        repairDetails: {
          parts: repairParts,
          estimatedCost: estimatedTotal
        },
        status: "IN_PROGRESS"
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
        <div className="flex items-center justify-between p-4 border-b bg-gray-50/50" style={{ borderColor: themeColors.border }}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-50 text-red-500">
              <Wrench size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: themeColors.textPrimary }}>
                Assign Repair Workflow
              </h2>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Job Card: #{jobCardId}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-md transition cursor-pointer">
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
                    <span className="text-xs font-semibold text-gray-700">{part.label}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-400">₹ {part.price.toLocaleString()}</span>
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
              <select 
                value={selectedTechnician}
                onChange={(e) => setSelectedTechnician(e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 rounded-xl border-2 text-sm appearance-none focus:outline-none focus:border-red-400 transition cursor-pointer"
                style={{ borderColor: themeColors.border, backgroundColor: "#FAFAFA" }}
              >
                <option value="">Select a technician...</option>
                {technicians.map((tech) => (
                  <option key={tech.empId} value={tech.empId} disabled={!tech.isAvailable}>
                    {tech.name} ({tech.empId}) - {tech.isAvailable ? "Available" : "On Job"}
                  </option>
                ))}
              </select>
              {fetchingTechs && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" size={16} />}
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="p-4 rounded-2xl bg-gray-50 border-2 space-y-3" style={{ borderColor: themeColors.border }}>
            <div className="flex items-center gap-2 mb-1">
              <Calculator size={14} className="text-gray-400" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cost Breakdown</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 font-medium">Parts Total</span>
                <span className="text-gray-700 font-bold">₹ {partsTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs items-center">
                <span className="text-gray-500 font-medium">Labour Cost</span>
                <span className="text-gray-700 font-bold">₹ {labourCost.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t flex justify-between items-center" style={{ borderColor: themeColors.border }}>
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">Total Estimation</span>
                <span className="text-lg font-black" style={{ color: themeColors.primary }}>₹ {estimatedTotal.toLocaleString()}</span>
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
        <div className="p-4 border-t bg-gray-50/50 flex gap-3" style={{ borderColor: themeColors.border }}>
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
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Assign & Start Repair"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RepairAssignmentModal;
