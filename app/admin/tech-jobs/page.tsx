"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Wrench,
  Loader2,
  Calendar,
  Bike,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";
import { themeColors } from "@/lib/themeColors";
import { useRole } from "@/lib/RoleContext";
import Link from "next/link";

interface JobCard {
  _id: string;
  jobCardId: string;
  vehicleId: string;
  status: string;
  createdAt: string;
  repairDetails: {
    estimatedCost: number;
    parts: { partName: string; price: number }[];
  };
}

export default function TechJobsPage() {
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState(true);
  const { role, technicianId } = useRole();

  useEffect(() => {
    if (role === "TECHNICIAN" && technicianId) {
      fetchTechJobs();
    } else {
      setLoading(false);
    }
  }, [role, technicianId]);

  const fetchTechJobs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/job-cards/technician/${technicianId}`);
      if (res.data.success) {
        setJobCards(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching tech jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  if (role !== "TECHNICIAN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center space-y-4">
        <div className="p-4 rounded-full bg-red-50 text-red-500">
          <AlertCircle size={40} />
        </div>
        <h1 className="text-xl font-bold text-gray-800">Access Restricted</h1>
        <p className="text-sm text-gray-500 max-w-xs">This page is only available in Technician View. Please switch your view from the top header.</p>
      </div>
    );
  }

  return (
    <div className="w-full p-2 space-y-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold" style={{ color: themeColors.textPrimary }}>
            My Assigned Tasks
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Manage and update your active repair jobs.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 text-xs font-bold">
          <Wrench size={14} />
          Technician ID: {technicianId}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-emerald-500" size={32} />
          <span className="text-sm font-medium text-gray-500">Loading your tasks...</span>
        </div>
      ) : jobCards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobCards.map((job) => (
            <div 
              key={job._id}
              className="bg-white rounded-2xl border-2 p-4 space-y-4 hover:shadow-lg transition-all"
              style={{ borderColor: themeColors.border }}
            >
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: themeColors.border }}>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-gray-50 text-gray-400 border">
                    <Bike size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-800 leading-none">{job.vehicleId}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">#{job.jobCardId}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                  job.status === "CLOSED" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-amber-50 text-amber-600 border-amber-200"
                }`}>
                  {job.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Clock size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Estimated Parts</span>
                  </div>
                  <span className="text-xs font-black text-gray-700">{job.repairDetails.parts.length} Items</span>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 border border-dashed border-gray-200">
                  <ul className="space-y-1.5">
                    {job.repairDetails.parts.map((part, idx) => (
                      <li key={idx} className="flex justify-between text-[10px] font-bold text-gray-500 italic">
                        <span>• {part.partName}</span>
                        <span>₹ {part.price.toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: themeColors.border }}>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Calendar size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Assigned On</span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-600">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <Link 
                href={`/admin/tech-jobs/${job.jobCardId}`}
                className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-black transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 size={14} />
                View Details
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No assigned tasks found.</p>
        </div>
      )}
    </div>
  );
}
