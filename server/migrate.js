#!/usr/bin/env node
require("dotenv").config();
const Migrator = require("./orm/migrator");

async function runMigration() {
  const migrator = new Migrator();
  const args = process.argv.slice(2);

  try {
    console.log("🗄️ AI Dashboard Database Migrator");
    console.log("================================");

    if (args.includes("--flush")) {
      await migrator.flush();
    } else if (args.includes("--down")) {
      await migrator.migrateDown();
    } else if (args.includes("--status")) {
      const status = await migrator.getTableStatus();
      console.log("\n📊 Table Status:");
      console.log("================");
      for (const [table, exists] of Object.entries(status)) {
        console.log(`${exists ? "✅" : "❌"} ${table}`);
      }
    } else {
      // Default: migrate up
      await migrator.migrateUp();
    }

    console.log("\n🎉 Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Handle process termination
process.on("SIGINT", () => {
  console.log("\n⚠️ Migration interrupted by user");
  process.exit(1);
});

process.on("SIGTERM", () => {
  console.log("\n⚠️ Migration terminated");
  process.exit(1);
});

// Run migration
runMigration();
