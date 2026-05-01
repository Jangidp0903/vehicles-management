import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Vehicle from "@/models/Vehicle";

export async function GET() {
  try {
    await dbConnect();

    const stats = await Vehicle.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const totalVehicles = await Vehicle.countDocuments();

    // Initialize all counts to 0
    const counts: Record<string, number> = {
      RENTED: 0,
      UNDER_INSPECTION: 0,
      DAMAGED: 0,
      UNDER_REPAIR: 0,
      RFD: 0,
      AVAILABLE_FOR_REDEPLOYMENT: 0,
      PENDING_PARTS: 0,
      TOTAL: totalVehicles
    };

    // Fill with actual data
    stats.forEach(item => {
      if (item._id) {
        counts[item._id] = item.count;
      }
    });

    return NextResponse.json({ success: true, data: counts });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch stats" }, { status: 500 });
  }
}
