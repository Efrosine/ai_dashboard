#!/usr/bin/env node
require("dotenv").config();
const Seeder = require("./orm/seeder");

async function runSeeding() {
  const seeder = new Seeder();
  const args = process.argv.slice(2);

  try {
    console.log("🌱 AI Dashboard Database Seeder");
    console.log("===============================");

    if (args.includes("--clear")) {
      await seeder.clearAll();
    } else if (args.includes("--counts")) {
      const counts = await seeder.getTableCounts();
      console.log("\n📊 Table Record Counts:");
      console.log("=======================");
      for (const [table, count] of Object.entries(counts)) {
        console.log(`📋 ${table}: ${count}`);
      }
    } else {
      // Default: seed all tables
      await seeder.seedAll();

      // Show final counts
      console.log("\n📊 Final Record Counts:");
      console.log("=======================");
      const counts = await seeder.getTableCounts();
      for (const [table, count] of Object.entries(counts)) {
        console.log(`📋 ${table}: ${count}`);
      }
    }

    console.log("\n🎉 Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Seeding failed:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Handle process termination
process.on("SIGINT", () => {
  console.log("\n⚠️ Seeding interrupted by user");
  process.exit(1);
});

process.on("SIGTERM", () => {
  console.log("\n⚠️ Seeding terminated");
  process.exit(1);
});

// Run seeding
runSeeding();
