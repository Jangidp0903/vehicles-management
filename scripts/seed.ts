import "dotenv/config";
import mongoose from "mongoose";
import Vehicle from "../models/Vehicle";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env",
  );
}

// 🔥 vehicleId generator
const generateVehicleId = (num: number) => {
  return `ZOM-EV-${String(num).padStart(3, "0")}`;
};

const seedVehicles = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully.");

    await Vehicle.deleteMany({});
    console.log("Cleared existing vehicles.");

    // 🔥 generate 100 vehicles
    const vehicles = Array.from({ length: 100 }, (_, i) => ({
      vehicleId: generateVehicleId(i + 1),
      modelName: "Ride EV",
      status: "RENTED",
    }));

    await Vehicle.insertMany(vehicles);

    console.log("100 Vehicles seeded ✅");
  } catch (error) {
    console.error("Error seeding vehicles:", error);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
};

seedVehicles();
