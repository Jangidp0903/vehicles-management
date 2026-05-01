"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PackageX,
  Loader2,
  Bike,
  ChevronRight,
  Search,
  AlertCircle,
  Package,
  ArrowRight,
  Clock,
  Settings,
} from "lucide-react";
import { themeColors } from "@/lib/themeColors";
import { useRouter } from "next/navigation";
import { useRole } from "@/lib/RoleContext";
import AccessDenied from "@/components/AccessDenied";

interface JobCard {
  jobCardId: string;
  vehicleId: string;
  status: string;
  partsAvailability: {
    partName: string;
    isAvailable: boolean;
  }[];
  createdAt: string;
}

interface Vehicle {
  _id: string;
  vehicleId: string;
  modelName: string;
  status: string;
}

export default function PendingPartsQueuePage() {
  const router = useRouter();
  const { role } = useRole();
  const [data, setData] = useState<{ vehicle: Vehicle; jobCard: JobCard }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const vRes = await axios.get("/api/vehicles");
      if (vRes.data.success) {
        const pendingVehicles = vRes.data.data.filter(
          (v: Vehicle) => v.status === "PENDING_PARTS",
        );

        const results = await Promise.all(
          pendingVehicles.map(async (v: Vehicle) => {
            const jRes = await axios.get(`/api/job-cards/vehicle/${v.vehicleId}`);
            if (jRes.data.success) {
              const jobCard = jRes.data.data;
              // Check if the latest job card is ON_HOLD
              return jobCard.status === "ON_HOLD" ? { vehicle: v, jobCard } : null;
            }
            return null;
          }),
        );

        setData(results.filter(Boolean) as { vehicle: Vehicle; jobCard: JobCard }[]);
      }
    } catch (error) {
      console.error("Error fetching pending parts data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (role === "OPERATOR") {
      queueMicrotask(() => {
        fetchData();
      });
    }
  }, [role, fetchData]);

  const filteredData = data.filter(
    (item) =>
      item.vehicle.vehicleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vehicle.modelName.toLowerCase().includes(searchTerm.toLowerCase()),
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
            Parts Procurement Queue
          </h1>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-1">
            Vehicles grounded due to missing spare parts
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-xl border border-orange-100 text-[10px] font-bold uppercase tracking-widest">
          <PackageX size={14} />
          Procurement Items: {data.length}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={16}
        />
        <input
          type="text"
          placeholder="Search by Vehicle ID or Model..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 text-sm transition focus:outline-none focus:border-orange-400"
          style={{ borderColor: themeColors.border, backgroundColor: "white" }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* List Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-orange-500" size={32} />
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
            Syncing Inventory Needs...
          </p>
        </div>
      ) : filteredData.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredData.map((item) => (
            <div
              key={item.vehicle._id}
              className="bg-white rounded-2xl border-2 transition-all hover:bg-gray-50/50 group"
              style={{ borderColor: themeColors.border }}
            >
              <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Vehicle Info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 group-hover:scale-110 transition-transform">
                    <Bike size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">
                      {item.vehicle.vehicleId}
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                      {item.vehicle.modelName}
                    </p>
                  </div>
                </div>

                {/* Missing Parts Tags */}
                <div className="flex-1 flex flex-wrap gap-2">
                  <div className="w-full flex items-center gap-2 mb-1">
                    <Settings size={12} className="text-gray-400" />
                    <span className="text-[8px] font-black uppercase text-gray-400 tracking-[0.2em]">Required Parts</span>
                  </div>
                  {item.jobCard.partsAvailability.filter(p => !p.isAvailable).map((p, idx) => (
                    <div key={idx} className="px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-100 text-[10px] font-black text-orange-600 uppercase flex items-center gap-2">
                      <Package size={10} />
                      {p.partName}
                    </div>
                  ))}
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0">
                   <div className="text-right hidden sm:block">
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Waiting Since</p>
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-600 uppercase">
                      <Clock size={12} className="text-orange-400" />
                      {new Date(item.jobCard.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/admin/inspection/${item.vehicle.vehicleId}`)}
                    className="p-3 rounded-xl bg-gray-50 text-gray-400 hover:bg-orange-500 hover:text-white transition-all cursor-pointer border border-gray-100 hover:border-orange-600 group-hover:translate-x-1"
                  >
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <div className="p-4 rounded-full bg-emerald-50 text-emerald-500 mb-4">
            <Package size={32} />
          </div>
          <h3 className="text-sm font-bold text-gray-800">Inventory Full</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-[240px] text-center leading-relaxed">
            All required parts are currently in stock. No pending procurement tasks found.
          </p>
        </div>
      )}
    </div>
  );
}
