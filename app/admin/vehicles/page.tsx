"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Loader2, Bike } from "lucide-react";
import { themeColors } from "@/lib/themeColors";
import { useRole } from "@/lib/RoleContext";

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
  const [activeTab, setActiveTab] = useState("ALL");
  const { role } = useRole();

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/vehicles");
        if (res.data.success) {
          const sortedVehicles = res.data.data.sort((a: Vehicle, b: Vehicle) =>
            a.vehicleId.localeCompare(b.vehicleId, undefined, {
              numeric: true,
              sensitivity: "base",
            }),
          );
          setVehicles(sortedVehicles);
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const filteredVehicles = vehicles
    .filter((v) => {
      // Role-based filtering: Technicians only see vehicles under repair
      if (role === "TECHNICIAN") {
        return v.status === "UNDER_REPAIR";
      }

      // Tab-based filtering
      if (activeTab === "ALL") return true;
      return v.status === activeTab;
    })
    .filter(
      (v) =>
        v.vehicleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.modelName.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE_FOR_REDEPLOYMENT":
        return themeColors.success;
      case "RFD":
        return "#6366F1"; // Indigo for initial stock
      case "RENTED":
        return "#F59E0B"; // Amber
      case "UNDER_INSPECTION":
        return "#10B981"; // Emerald
      case "PENDING_PARTS":
        return "#F97316"; // Orange
      case "UNDER_REPAIR":
        return "#EF4444"; // Red
      case "DAMAGED":
        return "#B91C1C"; // Dark Red
      default:
        return themeColors.textSecondary;
    }
  };

  return (
    <div className="w-full p-1">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
        <div>
          <h1
            className="text-xl font-bold"
            style={{ color: themeColors.textPrimary }}
          >
            {role === "TECHNICIAN" ? "Repair Queue" : "Vehicles Inventory"}
          </h1>
          <p className="text-xs" style={{ color: themeColors.textSecondary }}>
            {role === "TECHNICIAN"
              ? "Showing all vehicles currently assigned for repair."
              : "Manage and track all vehicles from here."}
          </p>
        </div>
      </div>

      {/* Tabs Filter */}
      {role !== "TECHNICIAN" && (
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 mb-6 sm:overflow-x-auto pb-3 pt-1 scrollbar-hide">
          {[
            { id: "ALL", label: "All Vehicles" },
            { id: "RFD", label: "RFD" },
            { id: "AVAILABLE_FOR_REDEPLOYMENT", label: "Available" },
            { id: "RENTED", label: "Rented" },
            { id: "UNDER_INSPECTION", label: "In Inspection" },
            { id: "UNDER_REPAIR", label: "In Repair" },
            { id: "PENDING_PARTS", label: "Pending Parts" },
            { id: "DAMAGED", label: "Damaged" },
          ].map((tab) => {
            const count =
              tab.id === "ALL"
                ? vehicles.length
                : vehicles.filter((v) => v.status === tab.id).length;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-between gap-2 px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all border-2 cursor-pointer shadow-sm`}
                style={{
                  backgroundColor:
                    activeTab === tab.id
                      ? themeColors.primary
                      : themeColors.cardBackground,
                  color:
                    activeTab === tab.id
                      ? "#FFFFFF"
                      : themeColors.textSecondary,
                  borderColor:
                    activeTab === tab.id
                      ? themeColors.primary
                      : themeColors.border,
                }}
              >
                {tab.label}
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px]`}
                  style={{
                    backgroundColor:
                      activeTab === tab.id
                        ? "rgba(255,255,255,0.2)"
                        : themeColors.background,
                    color:
                      activeTab === tab.id
                        ? "#FFFFFF"
                        : themeColors.textSecondary,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Search Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search by Vehicle ID..."
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border-2 text-sm transition focus:outline-none"
            style={{
              borderColor: themeColors.border,
              backgroundColor: themeColors.cardBackground,
              color: themeColors.textPrimary,
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = themeColors.primary)
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = themeColors.border)
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Vehicles View */}
      <div
        className="w-full overflow-hidden rounded-2xl border-2"
        style={{
          borderColor: themeColors.border,
          backgroundColor: themeColors.cardBackground,
        }}
      >
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                style={{
                  backgroundColor: "#FAFAFA",
                  borderBottom: `1px solid ${themeColors.border}`,
                }}
              >
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Vehicle ID
                </th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Model Name
                </th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Mileage
                </th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">
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
                      <span
                        className="text-sm font-medium"
                        style={{ color: themeColors.textSecondary }}
                      >
                        Loading Vehicle data...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle) => (
                  <tr
                    key={vehicle._id}
                    className="transition-colors group cursor-pointer"
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        themeColors.background)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="p-1.5 rounded-lg"
                          style={{
                            backgroundColor:
                              themeColors.sidebarActiveBackground,
                            color: themeColors.primary,
                          }}
                        >
                          <Bike size={14} />
                        </div>
                        <span
                          className="font-semibold text-xs"
                          style={{ color: themeColors.textPrimary }}
                        >
                          {vehicle.vehicleId}
                        </span>
                      </div>
                    </td>
                    <td
                      className="px-4 py-2.5 text-xs font-medium"
                      style={{ color: themeColors.textSecondary }}
                    >
                      {vehicle.modelName}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide border"
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
                      className="px-4 py-2.5 text-xs font-bold"
                      style={{ color: themeColors.textPrimary }}
                    >
                      {vehicle.currentOdometer?.toLocaleString()}{" "}
                      <span className="text-[9px] text-gray-400 font-medium">
                        KM
                      </span>
                    </td>
                    <td
                      className="px-4 py-2.5 text-[11px]"
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
                    No vehicles found in{" "}
                    {role === "TECHNICIAN" ? "repair queue" : "inventory"}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div
          className="md:hidden divide-y"
          style={{ borderColor: themeColors.border }}
        >
          {loading ? (
            <div className="p-10 text-center flex flex-col items-center gap-3">
              <Loader2
                className="animate-spin"
                size={32}
                style={{ color: themeColors.primary }}
              />
              <span className="text-sm font-medium text-gray-500">
                Loading...
              </span>
            </div>
          ) : filteredVehicles.length > 0 ? (
            filteredVehicles.map((vehicle) => (
              <div key={vehicle._id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-red-50 text-red-500 border">
                      <Bike size={18} />
                    </div>
                    <div>
                      <p
                        className="text-sm font-bold"
                        style={{ color: themeColors.textPrimary }}
                      >
                        {vehicle.vehicleId}
                      </p>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                        {vehicle.modelName}
                      </p>
                    </div>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border"
                    style={{
                      color: getStatusColor(vehicle.status),
                      borderColor: getStatusColor(vehicle.status) + "40",
                      backgroundColor: getStatusColor(vehicle.status) + "10",
                    }}
                  >
                    {vehicle.status.replace("_", " ")}
                  </span>
                </div>

                <div
                  className="flex items-center justify-between pt-2 border-t"
                  style={{ borderColor: themeColors.border }}
                >
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-gray-400 uppercase">
                      Mileage
                    </span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: themeColors.textPrimary }}
                    >
                      {vehicle.currentOdometer?.toLocaleString()} KM
                    </span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                      Added On
                    </span>
                    <span className="text-xs font-medium text-gray-500">
                      {new Date(vehicle.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
              No vehicles found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
