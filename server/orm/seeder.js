const db = require("../db");
const models = require("../models");

class Seeder {
  constructor() {
    this.db = db;
    this.models = models;
  }

  async seedTable(model) {
    if (!model.seed || model.seed.length === 0) {
      console.log(`⏭️ No seed data for table: ${model.name}`);
      return true;
    }

    try {
      console.log(`🌱 Seeding table: ${model.name}`);

      // Clear existing data first
      await this.db.execute(`DELETE FROM \`${model.name}\``);
      console.log(`🗑️ Cleared existing data from ${model.name}`);

      // Get column names from first seed object
      const columns = Object.keys(model.seed[0]);
      const placeholders = columns.map(() => "?").join(", ");
      const columnNames = columns.map((col) => `\`${col}\``).join(", ");

      const insertSQL = `INSERT INTO \`${model.name}\` (${columnNames}) VALUES (${placeholders})`;

      // Insert each seed record
      for (const seedData of model.seed) {
        const values = columns.map((col) => {
          let value = seedData[col];
          // Convert objects/arrays to JSON strings
          if (typeof value === "object" && value !== null) {
            value = JSON.stringify(value);
          }
          return value;
        });

        await this.db.execute(insertSQL, values);
      }

      console.log(`✅ Seeded ${model.seed.length} records into ${model.name}`);
      return true;
    } catch (error) {
      console.error(`❌ Error seeding table ${model.name}:`, error.message);
      throw error;
    }
  }

  async seedAll() {
    console.log("🌱 Starting database seeding...");
    const modelsInOrder = this.models.getCreationOrder();

    try {
      for (const model of modelsInOrder) {
        await this.seedTable(model);
      }
      console.log("✅ All tables seeded successfully!");
      return true;
    } catch (error) {
      console.error("❌ Seeding failed:", error.message);
      throw error;
    }
  }

  async clearTable(model) {
    try {
      console.log(`🗑️ Clearing table: ${model.name}`);
      await this.db.execute(`DELETE FROM \`${model.name}\``);
      console.log(`✅ Table ${model.name} cleared successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Error clearing table ${model.name}:`, error.message);
      throw error;
    }
  }

  async clearAll() {
    console.log("🗑️ Clearing all table data...");
    const modelsInOrder = this.models.getDropOrder(); // Use reverse order to respect foreign keys

    try {
      for (const model of modelsInOrder) {
        await this.clearTable(model);
      }
      console.log("✅ All tables cleared successfully!");
      return true;
    } catch (error) {
      console.error("❌ Clearing failed:", error.message);
      throw error;
    }
  }

  async getTableCounts() {
    const modelsInOrder = this.models.getCreationOrder();
    const counts = {};

    for (const model of modelsInOrder) {
      try {
        const [rows] = await this.db.execute(
          `SELECT COUNT(*) as count FROM \`${model.name}\``
        );
        counts[model.name] = rows[0].count;
      } catch (error) {
        counts[model.name] = "Error: " + error.message;
      }
    }

    return counts;
  }
}

module.exports = Seeder;
