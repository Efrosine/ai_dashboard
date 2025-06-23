const db = require("../db");
const models = require("../models");

class Migrator {
  constructor() {
    this.db = db;
    this.models = models;
  }

  async createTable(model) {
    try {
      const createSQL = `CREATE TABLE IF NOT EXISTS \`${model.name}\` (${model.schema})`;
      console.log(`Creating table: ${model.name}`);
      await this.db.execute(createSQL);
      console.log(`✅ Table ${model.name} created successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Error creating table ${model.name}:`, error.message);
      throw error;
    }
  }

  async dropTable(model) {
    try {
      const dropSQL = `DROP TABLE IF EXISTS \`${model.name}\``;
      console.log(`Dropping table: ${model.name}`);
      await this.db.execute(dropSQL);
      console.log(`✅ Table ${model.name} dropped successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Error dropping table ${model.name}:`, error.message);
      throw error;
    }
  }

  async migrateUp() {
    console.log("🚀 Starting database migration...");
    const modelsInOrder = this.models.getCreationOrder();

    try {
      for (const model of modelsInOrder) {
        await this.createTable(model);
      }
      console.log("✅ All tables created successfully!");
      return true;
    } catch (error) {
      console.error("❌ Migration failed:", error.message);
      throw error;
    }
  }

  async migrateDown() {
    console.log("🗑️ Starting database rollback...");
    const modelsInOrder = this.models.getDropOrder();

    try {
      for (const model of modelsInOrder) {
        await this.dropTable(model);
      }
      console.log("✅ All tables dropped successfully!");
      return true;
    } catch (error) {
      console.error("❌ Rollback failed:", error.message);
      throw error;
    }
  }

  async flush() {
    console.log("🔄 Flushing database (drop and recreate)...");
    try {
      await this.migrateDown();
      await this.migrateUp();
      console.log("✅ Database flushed successfully!");
      return true;
    } catch (error) {
      console.error("❌ Flush failed:", error.message);
      throw error;
    }
  }

  async checkTableExists(tableName) {
    try {
      const [rows] = await this.db.execute(
        "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?",
        [tableName]
      );
      return rows[0].count > 0;
    } catch (error) {
      console.error(
        `Error checking if table ${tableName} exists:`,
        error.message
      );
      return false;
    }
  }

  async getTableStatus() {
    const modelsInOrder = this.models.getCreationOrder();
    const status = {};

    for (const model of modelsInOrder) {
      status[model.name] = await this.checkTableExists(model.name);
    }

    return status;
  }
}

module.exports = Migrator;
