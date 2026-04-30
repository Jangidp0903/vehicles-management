import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Technician from "@/models/Technician";

export async function GET() {
  try {
    await connectToDatabase();
    const technicians = await Technician.find({ isAvailable: true }).sort({ name: 1 });
    return NextResponse.json({
      success: true,
      data: technicians,
    });
  } catch (error) {
    console.error("Error fetching technicians:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
