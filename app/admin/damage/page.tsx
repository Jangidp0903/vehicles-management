"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  AlertTriangle,
  Loader2,
  Bike,
  ChevronRight,
  Search,
} from "lucide-react";
import { themeColors } from "@/lib/themeColors";
import { useRouter } from "next/navigation";
import { useRole } from "@/lib/RoleContext";
import AccessDenied from "@/components/AccessDenied";

interface Vehicle {
  _id: string;
  vehicleId: string;
  modelName: string;
  status: string;
  currentOdometer: number;
}

export default function DamageQueuePage() {
  const router = useRouter();
  const { role } = useRole();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchVehicles = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/vehicles");
      if (res.data.success) {
        // Filter only DAMAGED vehicles
        const damageVehicles = res.data.data.filter(
          (v: Vehicle) => v.status === "DAMAGED",
        );
        setVehicles(damageVehicles);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (role === "OPERATOR") {
      queueMicrotask(() => {
        fetchVehicles();
      });
    }
  }, [role, fetchVehicles]);

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.vehicleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.modelName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (role !== "OPERATOR") {
    return <AccessDenied requiredRole="OPERATOR" />;
  }

  return (
    <div className="w-full p-1 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1
            className="text-xl font-bold"
            style={{ color: themeColors.textPrimary }}
          >
            Damage Inspection Queue
          </h1>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-1">
            Vehicles reported as damaged and awaiting inspection
          </p>
        </div>
        <div 
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest"
          style={{ 
            backgroundColor: themeColors.sidebarActiveBackground,
            borderColor: themeColors.border,
            color: themeColors.primary
          }}
        >
          <AlertTriangle size={14} />
          Reported Damage: {vehicles.length}
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={16}
        />
        <input
          type="text"
          placeholder="Search by Vehicle ID or Model..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 text-sm transition focus:outline-none"
          style={{ 
            borderColor: themeColors.border, 
            backgroundColor: themeColors.cardBackground,
            color: themeColors.textPrimary 
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = themeColors.primary}
          onBlur={(e) => e.currentTarget.style.borderColor = themeColors.border}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin" size={32} style={{ color: themeColors.primary }} />
          <span className="text-sm font-medium text-gray-500">Loading damage queue...</span>
        </div>
      ) : filteredVehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.map((vehicle) => (
            <div
              key={vehicle._id}
              onClick={() => router.push(`/admin/inspection/${vehicle.vehicleId}`)}
              className="group p-5 bg-white rounded-2xl border-2 transition-all hover:shadow-lg cursor-pointer"
              style={{ borderColor: themeColors.border }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = themeColors.primary}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = themeColors.border}
            >
              <div className="flex items-start justify-between mb-4">
                <div 
                  className="p-3 rounded-xl transition-colors"
                  style={{ backgroundColor: themeColors.sidebarActiveBackground, color: themeColors.primary }}
                  id={`icon-${vehicle._id}`}
                >
                  <Bike size={24} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</p>
                  <span 
                    className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border"
                    style={{ 
                      color: themeColors.error,
                      borderColor: themeColors.error + "40",
                      backgroundColor: themeColors.error + "10"
                    }}
                  >
                    {vehicle.status}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold" style={{ color: themeColors.textPrimary }}>{vehicle.vehicleId}</h3>
                <p className="text-xs font-medium text-gray-500">{vehicle.modelName}</p>
              </div>

              <div className="mt-6 pt-4 border-t flex items-center justify-between" style={{ borderColor: themeColors.border }}>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Ready for Inspection
                </span>
                <div 
                  className="flex items-center gap-1 text-xs font-bold transition-transform group-hover:translate-x-1"
                  style={{ color: themeColors.primary }}
                >
                  Open Report
                  <ChevronRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed" style={{ borderColor: themeColors.border }}>
          <p className="text-gray-500 font-medium">No vehicles in damage queue.</p>
        </div>
      )}
    </div>
  );
}
