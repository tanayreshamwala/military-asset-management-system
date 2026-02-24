import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "./src/models/User.js";
import Base from "./src/models/Base.js";
import Asset from "./src/models/Asset.js";
import Inventory from "./src/models/Inventory.js";

const seedDatabase = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI ||
        "mongodb://localhost:27017/military-asset-management",
    );
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Base.deleteMany({});
    await Asset.deleteMany({});
    await Inventory.deleteMany({});

    // Create Bases
    const bases = await Base.insertMany([
      { name: "Fort Lewis", location: "Washington" },
      { name: "Fort Bragg", location: "North Carolina" },
      { name: "Camp Lejeune", location: "North Carolina" },
    ]);
    console.log("Bases created");

    // Create Assets
    const assets = await Asset.insertMany([
      { name: "M1 Abrams Tank", type: "Vehicle", serialNumber: "ABR-001" },
      { name: "Humvee", type: "Vehicle", serialNumber: "HUM-001" },
      { name: "M16 Rifle", type: "Weapon", serialNumber: "M16-001" },
      { name: ".223 Ammunition", type: "Ammunition", serialNumber: "AMM-001" },
      { name: "Helmet", type: "Equipment", serialNumber: "EQP-001" },
    ]);
    console.log("Assets created");

    // Create Inventories
    await Inventory.insertMany([
      {
        baseId: bases[0]._id,
        assetId: assets[0]._id,
        openingBalance: 50,
        currentQuantity: 50,
      },
      {
        baseId: bases[0]._id,
        assetId: assets[1]._id,
        openingBalance: 100,
        currentQuantity: 100,
      },
      {
        baseId: bases[0]._id,
        assetId: assets[2]._id,
        openingBalance: 500,
        currentQuantity: 500,
      },
      {
        baseId: bases[0]._id,
        assetId: assets[3]._id,
        openingBalance: 10000,
        currentQuantity: 10000,
      },
      {
        baseId: bases[0]._id,
        assetId: assets[4]._id,
        openingBalance: 1000,
        currentQuantity: 1000,
      },
      {
        baseId: bases[1]._id,
        assetId: assets[0]._id,
        openingBalance: 30,
        currentQuantity: 30,
      },
      {
        baseId: bases[1]._id,
        assetId: assets[1]._id,
        openingBalance: 80,
        currentQuantity: 80,
      },
      {
        baseId: bases[1]._id,
        assetId: assets[2]._id,
        openingBalance: 400,
        currentQuantity: 400,
      },
      {
        baseId: bases[1]._id,
        assetId: assets[3]._id,
        openingBalance: 8000,
        currentQuantity: 8000,
      },
      {
        baseId: bases[1]._id,
        assetId: assets[4]._id,
        openingBalance: 800,
        currentQuantity: 800,
      },
      {
        baseId: bases[2]._id,
        assetId: assets[0]._id,
        openingBalance: 40,
        currentQuantity: 40,
      },
      {
        baseId: bases[2]._id,
        assetId: assets[1]._id,
        openingBalance: 90,
        currentQuantity: 90,
      },
      {
        baseId: bases[2]._id,
        assetId: assets[2]._id,
        openingBalance: 450,
        currentQuantity: 450,
      },
      {
        baseId: bases[2]._id,
        assetId: assets[3]._id,
        openingBalance: 9000,
        currentQuantity: 9000,
      },
      {
        baseId: bases[2]._id,
        assetId: assets[4]._id,
        openingBalance: 900,
        currentQuantity: 900,
      },
    ]);
    console.log("Inventories created");

    // Create Users - Hash passwords before inserting
    const usersData = [
      {
        name: "Admin User",
        email: "admin@military.com",
        password: await bcrypt.hash("Admin@123", 10),
        role: "admin",
      },
      {
        name: "Commander Smith",
        email: "commander@military.com",
        password: await bcrypt.hash("Commander@123", 10),
        role: "base_commander",
        baseId: bases[0]._id,
      },
      {
        name: "Logistics Officer Johnson",
        email: "logistics@military.com",
        password: await bcrypt.hash("Logistics@123", 10),
        role: "logistics_officer",
        baseId: bases[0]._id,
      },
      {
        name: "Commander Davis",
        email: "commander2@military.com",
        password: await bcrypt.hash("Commander@123", 10),
        role: "base_commander",
        baseId: bases[1]._id,
      },
      {
        name: "Logistics Officer Wilson",
        email: "logistics2@military.com",
        password: await bcrypt.hash("Logistics@123", 10),
        role: "logistics_officer",
        baseId: bases[1]._id,
      },
    ];

    await User.insertMany(usersData);
    console.log("Users created");

    console.log("✅ Database seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error.message);
    process.exit(1);
  }
};

seedDatabase();
