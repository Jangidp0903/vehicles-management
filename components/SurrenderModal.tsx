import React, { useState } from "react";
import { 
  X, 
  Search, 
  Loader2, 
  Bike, 
  ChevronRight, 
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Gauge
} from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { themeColors } from "@/lib/themeColors";

interface Vehicle {
  vehicleId: string;
  modelName: string;
  status: string;
  currentOdometer: number;
}

interface SurrenderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SurrenderModal: React.FC<SurrenderModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // New state for odometer
  const [newOdometer, setNewOdometer] = useState<string>("");

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setLoading(true);
    setError(null);
    setVehicle(null);
    setSuccess(false);
    setNewOdometer("");

    try {
      const res = await axios.get(`/api/vehicles/${searchId.trim()}`);
      if (res.data.success) {
        setVehicle(res.data.data);
        setNewOdometer(res.data.data.currentOdometer.toString());
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Vehicle not found or system error");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToInspection = () => {
    if (!newOdometer || isNaN(Number(newOdometer))) {
      alert("Please enter a valid odometer reading.");
      return;
    }
    setConfirming(true);
  };

  const handleConfirmInspection = async () => {
    if (!vehicle) return;
    
    setUpdating(true);
    try {
      const res = await axios.post(`/api/vehicles/${vehicle.vehicleId}/surrender`, {
        odometer: Number(newOdometer)
      });
      if (res.data.success) {
        setSuccess(true);
        // Redirect to inspection page after a short delay
        setTimeout(() => {
          router.push(`/admin/inspection/${vehicle.vehicleId}`);
          onClose();
        }, 1500);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert("Failed to surrender vehicle: " + (err.response?.data?.error || "Unknown error"));
      } else {
        alert("An unexpected error occurred");
      }
      setConfirming(false);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-lg rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        style={{ border: `1px solid ${themeColors.border}` }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: themeColors.border }}>
          <h2 className="text-lg font-bold" style={{ color: themeColors.textPrimary }}>
            Surrender Vehicle
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4">
          {!confirming ? (
            <div className="space-y-4">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text"
                  placeholder="Enter Vehicle ID..."
                  className="w-full pl-10 pr-20 py-2 rounded-lg border-2 text-sm transition focus:outline-none"
                  style={{ 
                    borderColor: themeColors.border,
                    backgroundColor: "#FAFAFA"
                  }}
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  autoFocus
                />
                <button 
                  type="submit"
                  disabled={loading || !searchId.trim()}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-md text-[11px] font-bold text-white transition disabled:opacity-50"
                  style={{ backgroundColor: themeColors.primary }}
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : "Search"}
                </button>
              </form>

              {/* Error/Success Messages */}
              {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl border" style={{ backgroundColor: themeColors.error + "10", borderColor: themeColors.error + "30", color: themeColors.error }}>
                  <AlertCircle size={20} />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}
              {success && (
                <div className="flex items-center gap-3 p-4 rounded-xl border" style={{ backgroundColor: themeColors.success + "10", borderColor: themeColors.success + "30", color: themeColors.success }}>
                  <CheckCircle2 size={20} />
                  <span className="text-sm font-medium">Processing... Redirecting to inspection.</span>
                </div>
              )}

              {/* Vehicle Details & Odometer Input */}
              {vehicle && (
                <div 
                  className="p-5 rounded-2xl border-2 space-y-5"
                  style={{ borderColor: themeColors.border, backgroundColor: "#F9FAFB" }}
                >
                  {/* Header Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-white border" style={{ borderColor: themeColors.border }}>
                        <Bike size={24} className="text-red-500" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Vehicle ID</p>
                        <h3 className="text-lg font-black" style={{ color: themeColors.textPrimary }}>{vehicle.vehicleId}</h3>
                      </div>
                    </div>
                    <span 
                      className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
                      style={{ 
                        color: vehicle.status === "UNDER_INSPECTION" ? "#0EA5A4" : "#2563EB",
                        borderColor: (vehicle.status === "UNDER_INSPECTION" ? "#0EA5A4" : "#2563EB") + "40",
                        backgroundColor: (vehicle.status === "UNDER_INSPECTION" ? "#0EA5A4" : "#2563EB") + "10"
                      }}
                    >
                      {vehicle.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Model & Last Odometer */}
                  <div className="grid grid-cols-2 gap-4 py-3 border-y" style={{ borderColor: themeColors.border }}>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Model</p>
                      <p className="font-bold text-sm" style={{ color: themeColors.textPrimary }}>{vehicle.modelName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">System Odometer</p>
                      <p className="font-bold text-sm" style={{ color: themeColors.textPrimary }}>{vehicle.currentOdometer.toLocaleString()} KM</p>
                    </div>
                  </div>

                  {/* NEW ODOMETER INPUT */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <Gauge size={14} />
                      Current Odometer Reading (Required)
                    </label>
                    <input 
                      type="number"
                      placeholder="Enter current KM reading..."
                      className="w-full px-4 py-3 rounded-xl border-2 transition focus:outline-none focus:border-red-400"
                      style={{ borderColor: themeColors.border }}
                      value={newOdometer}
                      onChange={(e) => setNewOdometer(e.target.value)}
                    />
                  </div>

                  {/* Proceed Button */}
                  <div className="pt-2">
                    {vehicle.status === "UNDER_INSPECTION" ? (
                      <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-200">
                        <AlertTriangle size={18} />
                        <span className="text-sm font-bold">Already under inspection.</span>
                      </div>
                    ) : (
                      <button 
                        onClick={handleProceedToInspection}
                        disabled={!newOdometer || isNaN(Number(newOdometer))}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold transition hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
                        style={{ backgroundColor: themeColors.primary }}
                      >
                        Proceed to Inspection
                        <ChevronRight size={18} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Confirmation Dialog */
            <div className="py-4 space-y-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-4 rounded-full bg-red-50 text-red-500">
                  <AlertTriangle size={48} />
                </div>
                <h3 className="text-xl font-bold" style={{ color: themeColors.textPrimary }}>Confirm Surrender?</h3>
                <p className="text-sm text-gray-500 max-w-xs">
                  Confirm odometer as <span className="font-bold text-gray-800">{newOdometer} KM</span> and move <span className="font-bold text-gray-800">{vehicle?.vehicleId}</span> to inspection?
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button 
                  onClick={() => setConfirming(false)}
                  disabled={updating}
                  className="flex-1 py-3 rounded-xl border-2 font-bold text-gray-500 hover:bg-gray-50 transition"
                  style={{ borderColor: themeColors.border }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmInspection}
                  disabled={updating}
                  className="flex-1 py-3 rounded-xl text-white font-bold transition hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
                  style={{ backgroundColor: themeColors.primary }}
                >
                  {updating ? <Loader2 size={20} className="animate-spin" /> : "Yes, Confirm"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurrenderModal;
