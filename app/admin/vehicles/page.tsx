"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  Loader2,
  Plus,
  Filter,
  MoreVertical,
  ChevronRight,
  Bike,
} from "lucide-react";
import { themeColors } from "@/lib/themeColors";

interface Vehicle {
  _id: string;
  vehicleId: string;
  modelName: string;
  status: string;
  currentOdometer: number;
  createdAt: string;
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/vehicles");
      if (res.data.success) {
        setVehicles(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.vehicleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.modelName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "#2ECC71";
      case "RENTED":
        return "#3498DB";
      case "DAMAGED":
        return "#E74C3C";
      case "UNDER_REPAIR":
        return "#F39C12";
      case "UNDER_INSPECTION":
        return "#9B59B6";
      default:
        return themeColors.textSecondary;
    }
  };

  return (
    <div className="w-full p-2">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: themeColors.textPrimary }}
          >
            Vehicles Inventory
          </h1>
          <p className="text-sm" style={{ color: themeColors.textSecondary }}>
            Manage and track all fleet vehicles from here.
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by Vehicle ID or Model..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 transition focus:outline-none"
            style={{
              borderColor: themeColors.border,
              backgroundColor: themeColors.cardBackground,
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Container */}
      <div
        className="w-full overflow-hidden rounded-2xl border-2"
        style={{
          borderColor: themeColors.border,
          backgroundColor: themeColors.cardBackground,
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                style={{
                  backgroundColor: "#FAFAFA",
                  borderBottom: `2px solid ${themeColors.border}`,
                }}
              >
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Vehicle ID
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Model Name
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Odometer
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Added On
                </th>
              </tr>
            </thead>
            <tbody
              className="divide-y"
              style={{ borderColor: themeColors.border }}
            >
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2
                        className="animate-spin"
                        size={32}
                        style={{ color: themeColors.primary }}
                      />
                      <span className="text-sm font-medium text-gray-500">
                        Loading fleet data...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle) => (
                  <tr
                    key={vehicle._id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-50 text-red-500">
                          <Bike size={18} />
                        </div>
                        <span
                          className="font-bold text-sm"
                          style={{ color: themeColors.textPrimary }}
                        >
                          {vehicle.vehicleId}
                        </span>
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 text-sm font-medium"
                      style={{ color: themeColors.textSecondary }}
                    >
                      {vehicle.modelName}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border"
                        style={{
                          color: getStatusColor(vehicle.status),
                          borderColor: getStatusColor(vehicle.status) + "40",
                          backgroundColor:
                            getStatusColor(vehicle.status) + "10",
                        }}
                      >
                        {vehicle.status.replace("_", " ")}
                      </span>
                    </td>
                    <td
                      className="px-6 py-4 text-sm font-bold"
                      style={{ color: themeColors.textPrimary }}
                    >
                      {vehicle.currentOdometer?.toLocaleString()}{" "}
                      <span className="text-[10px] text-gray-400">KM</span>
                    </td>
                    <td
                      className="px-6 py-4 text-sm"
                      style={{ color: themeColors.textSecondary }}
                    >
                      {new Date(vehicle.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-20 text-center text-gray-500"
                  >
                    No vehicles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
