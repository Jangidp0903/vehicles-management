import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Vehicle from "@/models/Vehicle";

export async function GET() {
  try {
    await connectToDatabase();
    const vehicles = await Vehicle.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: vehicles,
    });
  } catch (error: any) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch vehicles",
      },
      { status: 500 }
    );
  }
}
