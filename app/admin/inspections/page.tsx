"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  ClipboardCheck, 
  Loader2, 
  Bike, 
  ChevronRight, 
  Search,
  AlertCircle,
} from "lucide-react";
import { themeColors } from "@/lib/themeColors";
import { useRouter } from "next/navigation";
import { useRole } from "@/lib/RoleContext";

interface Vehicle {
  _id: string;
  vehicleId: string;
  modelName: string;
  status: string;
  currentOdometer: number;
}

export default function OperatorInspectionsPage() {
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
        // Filter only UNDER_INSPECTION vehicles
        const inspectionVehicles = res.data.data.filter(
          (v: Vehicle) => v.status === "UNDER_INSPECTION"
        );
        setVehicles(inspectionVehicles);
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
      v.modelName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (role !== "OPERATOR") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center space-y-4">
        <div className="p-4 rounded-full bg-red-50 text-red-500">
          <AlertCircle size={40} />
        </div>
        <h1 className="text-xl font-bold text-gray-800">Access Restricted</h1>
        <p className="text-sm text-gray-500 max-w-xs">
          This page is only available in Operator View. Please switch your role from the top header.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full p-2 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: themeColors.textPrimary }}>
            Pending Inspections
          </h1>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-1">
            Vehicles awaiting formal inspection report
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 text-teal-600 rounded-xl border border-teal-100 text-[10px] font-bold uppercase tracking-widest">
          <ClipboardCheck size={14} />
          Active Queue: {vehicles.length}
        </div>
      </div>

      {/* Search & Filter */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search by Vehicle ID or Model..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 text-sm transition focus:outline-none focus:border-teal-400"
          style={{ borderColor: themeColors.border, backgroundColor: "white" }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-teal-500" size={32} />
          <span className="text-sm font-medium text-gray-500">Loading inspection queue...</span>
        </div>
      ) : filteredVehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.map((vehicle) => (
            <div
              key={vehicle._id}
              onClick={() => router.push(`/admin/inspection/${vehicle.vehicleId}`)}
              className="bg-white rounded-2xl border-2 p-5 space-y-4 hover:border-teal-400 transition-colors cursor-pointer group"
              style={{ borderColor: themeColors.border }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-teal-50 text-teal-500 border border-teal-100">
                    <Bike size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{vehicle.vehicleId}</h3>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                      {vehicle.modelName}
                    </p>
                  </div>
                </div>
                <div className="p-2 rounded-full bg-gray-50 text-gray-400 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                  <ChevronRight size={16} />
                </div>
              </div>

              <div className="pt-2 border-t flex items-center justify-between" style={{ borderColor: themeColors.border }}>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                  <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">Awaiting Report</span>
                </div>
                <div className="text-[10px] font-bold text-gray-500">
                  {vehicle.currentOdometer.toLocaleString()} KM
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <ClipboardCheck className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            Inspection Queue is Empty
          </p>
          <p className="text-[10px] text-gray-400 mt-1">No vehicles are currently marked as under inspection.</p>
        </div>
      )}
    </div>
  );
}
