import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Vehicle from "@/models/Vehicle";

// GET vehicle by vehicleId
export async function GET(
  request: Request,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  try {
    await connectToDatabase();
    const { vehicleId } = await params;
    
    const vehicle = await Vehicle.findOne({ vehicleId: vehicleId });
    
    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: "Vehicle not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PATCH vehicle status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  try {
    await connectToDatabase();
    const { vehicleId } = await params;
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Status is required" },
        { status: 400 }
      );
    }

    const vehicle = await Vehicle.findOneAndUpdate(
      { vehicleId: vehicleId },
      { status: status },
      { new: true }
    );

    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: "Vehicle not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    console.error("Error updating vehicle status:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
