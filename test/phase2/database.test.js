// Phase 2: Database Design - Comprehensive Testing

const { expect } = require("chai");
const mysql = require("mysql2/promise");
const fs = require("fs").promises;
const path = require("path");

// Import our ORM components
const Migrator = require("../../server/orm/migrator");
const Seeder = require("../../server/orm/seeder");
const models = require("../../server/models");

describe("Phase 2: Database Design Tests", function () {
  this.timeout(30000); // 30 second timeout for database operations

  let testConnection;
  let migrator;
  let seeder;
  let testResults = {
    timestamp: new Date().toISOString(),
    phase: "Phase 2 - Database Design",
    tests: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
    },
  };

  // Database configuration for testing
  const testDbConfig = {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.MYSQL_USER || "dashboard_user",
    password: process.env.MYSQL_PASSWORD || "dashboard_pass123",
    database: process.env.MYSQL_DATABASE || "ai_dashboard",
    multipleStatements: true,
  };

  before(async function () {
    try {
      // Create database connection
      testConnection = await mysql.createConnection(testDbConfig);

      // Initialize ORM components
      migrator = new Migrator();
      seeder = new Seeder();

      console.log("🔗 Test database connection established");
    } catch (error) {
      console.error("Failed to establish test database connection:", error);
      throw error;
    }
  });

  after(async function () {
    // Close test connection
    if (testConnection) {
      await testConnection.end();
    }

    // Write test results to file
    try {
      const resultsPath = path.join(__dirname, "results.json");
      await fs.writeFile(resultsPath, JSON.stringify(testResults, null, 2));
      console.log(`📊 Test results saved to ${resultsPath}`);
    } catch (error) {
      console.error("Failed to save test results:", error);
    }
  });

  describe("1. Database Connection and Environment", function () {
    it("should connect to MySQL database successfully", async function () {
      const testName = "Database Connection";
      const startTime = Date.now();

      try {
        await testConnection.ping();

        testResults.tests.push({
          name: testName,
          status: "passed",
          duration: Date.now() - startTime,
          message: "Successfully connected to MySQL database",
        });
        testResults.summary.passed++;
      } catch (error) {
        testResults.tests.push({
          name: testName,
          status: "failed",
          duration: Date.now() - startTime,
          error: error.message,
        });
        testResults.summary.failed++;
        throw error;
      }
      testResults.summary.total++;
    });

    it("should verify database exists and is accessible", async function () {
      const testName = "Database Accessibility";
      const startTime = Date.now();

      try {
        const [rows] = await testConnection.execute(
          "SELECT DATABASE() as current_db"
        );
        expect(rows[0].current_db).to.equal(testDbConfig.database);

        testResults.tests.push({
          name: testName,
          status: "passed",
          duration: Date.now() - startTime,
          message: `Connected to database: ${rows[0].current_db}`,
        });
        testResults.summary.passed++;
      } catch (error) {
        testResults.tests.push({
          name: testName,
          status: "failed",
          duration: Date.now() - startTime,
          error: error.message,
        });
        testResults.summary.failed++;
        throw error;
      }
      testResults.summary.total++;
    });
  });

  describe("2. Model Schema Validation", function () {
    it("should validate all model schemas are properly defined", function () {
      const testName = "Model Schema Definition";
      const startTime = Date.now();

      try {
        const modelList = models.getCreationOrder();

        expect(modelList).to.be.an("array");
        expect(modelList.length).to.be.greaterThan(0);

        modelList.forEach((model) => {
          expect(model).to.have.property("name");
          expect(model).to.have.property("schema");
          expect(model.name).to.be.a("string");
          expect(model.schema).to.be.a("string");

          // Verify essential schema components
          expect(model.schema).to.include("PRIMARY KEY");
          if (
            model.name !== "locations" &&
            model.name !== "suspected_accounts" &&
            model.name !== "users" &&
            model.name !== "dummy_accounts" &&
            model.name !== "scraped_data" &&
            model.name !== "scraped_result" &&
            model.name !== "cctv"
          ) {
            // Tables with foreign keys should have FOREIGN KEY constraint
            expect(model.schema).to.include("FOREIGN KEY");
          }
        });

        testResults.tests.push({
          name: testName,
          status: "passed",
          duration: Date.now() - startTime,
          message: `Validated ${modelList.length} model schemas successfully`,
        });
        testResults.summary.passed++;
      } catch (error) {
        testResults.tests.push({
          name: testName,
          status: "failed",
          duration: Date.now() - startTime,
          error: error.message,
        });
        testResults.summary.failed++;
        throw error;
      }
      testResults.summary.total++;
    });

    it("should validate foreign key relationships are correctly defined", function () {
      const testName = "Foreign Key Relationships";
      const startTime = Date.now();

      try {
        // Check specific foreign key relationships
        const cctvResults = models.CCTVDetectionResults;
        expect(cctvResults.schema).to.include("REFERENCES cctv(id)");

        const socialResults = models.SocialDetectionResults;
        expect(socialResults.schema).to.include("REFERENCES scraped_data(id)");

        const dataResult = models.ScrapedDataResult;
        expect(dataResult.schema).to.include("REFERENCES scraped_data(id)");
        expect(dataResult.schema).to.include("REFERENCES scraped_result(id)");

        testResults.tests.push({
          name: testName,
          status: "passed",
          duration: Date.now() - startTime,
          message: "All foreign key relationships correctly defined",
        });
        testResults.summary.passed++;
      } catch (error) {
        testResults.tests.push({
          name: testName,
          status: "failed",
          duration: Date.now() - startTime,
          error: error.message,
        });
        testResults.summary.failed++;
        throw error;
      }
      testResults.summary.total++;
    });
  });

  describe("3. Database Migration", function () {
    it("should create all tables successfully using migrator", async function () {
      const testName = "Table Creation via Migrator";
      const startTime = Date.now();

      try {
        // First drop existing tables to ensure clean state
        await migrator.migrateDown().catch(() => {}); // Ignore errors if tables don't exist

        // Create tables
        await migrator.migrateUp();

        // Verify all tables were created
        const tableStatus = await migrator.getTableStatus();
        const modelList = models.getCreationOrder();

        modelList.forEach((model) => {
          expect(tableStatus[model.name]).to.be.true;
        });

        testResults.tests.push({
          name: testName,
          status: "passed",
          duration: Date.now() - startTime,
          message: `Successfully created ${modelList.length} tables`,
        });
        testResults.summary.passed++;
      } catch (error) {
        testResults.tests.push({
          name: testName,
          status: "failed",
          duration: Date.now() - startTime,
          error: error.message,
        });
        testResults.summary.failed++;
        throw error;
      }
      testResults.summary.total++;
    });

    it("should verify table structures match schema definitions", async function () {
      const testName = "Table Structure Verification";
      const startTime = Date.now();

      try {
        const modelList = models.getCreationOrder();

        for (const model of modelList) {
          // Get table structure
          const [columns] = await testConnection.execute(
            `DESCRIBE \`${model.name}\``
          );

          expect(columns).to.be.an("array");
          expect(columns.length).to.be.greaterThan(0);

          // Verify primary key exists
          const primaryKey = columns.find((col) => col.Key === "PRI");
          expect(primaryKey).to.exist;

          // Verify id column exists and is auto increment
          const idColumn = columns.find((col) => col.Field === "id");
          expect(idColumn).to.exist;
          expect(idColumn.Extra).to.include("auto_increment");
        }

        testResults.tests.push({
          name: testName,
          status: "passed",
          duration: Date.now() - startTime,
          message: `Verified structure for ${modelList.length} tables`,
        });
        testResults.summary.passed++;
      } catch (error) {
        testResults.tests.push({
          name: testName,
          status: "failed",
          duration: Date.now() - startTime,
          error: error.message,
        });
        testResults.summary.failed++;
        throw error;
      }
      testResults.summary.total++;
    });

    it("should verify foreign key constraints are properly created", async function () {
      const testName = "Foreign Key Constraints";
      const startTime = Date.now();

      try {
        // Check foreign key constraints in information_schema
        const [constraints] = await testConnection.execute(`
          SELECT 
            TABLE_NAME,
            COLUMN_NAME,
            REFERENCED_TABLE_NAME,
            REFERENCED_COLUMN_NAME
          FROM information_schema.KEY_COLUMN_USAGE 
          WHERE 
            TABLE_SCHEMA = DATABASE() 
            AND REFERENCED_TABLE_NAME IS NOT NULL
        `);

        expect(constraints).to.be.an("array");
        expect(constraints.length).to.be.greaterThan(0);

        // Verify specific constraints exist
        const constraintMap = {};
        constraints.forEach((constraint) => {
          const key = `${constraint.TABLE_NAME}.${constraint.COLUMN_NAME}`;
          constraintMap[
            key
          ] = `${constraint.REFERENCED_TABLE_NAME}.${constraint.REFERENCED_COLUMN_NAME}`;
        });

        // Check expected foreign keys
        expect(constraintMap["cctv_detection_results.cctv_id"]).to.equal(
          "cctv.id"
        );
        expect(constraintMap["social_detection_results.scraped_id"]).to.equal(
          "scraped_data.id"
        );
        expect(constraintMap["scraped_data_result.id_data"]).to.equal(
          "scraped_data.id"
        );
        expect(constraintMap["scraped_data_result.id_result"]).to.equal(
          "scraped_result.id"
        );

        testResults.tests.push({
          name: testName,
          status: "passed",
          duration: Date.now() - startTime,
          message: `Verified ${constraints.length} foreign key constraints`,
        });
        testResults.summary.passed++;
      } catch (error) {
        testResults.tests.push({
          name: testName,
          status: "failed",
          duration: Date.now() - startTime,
          error: error.message,
        });
        testResults.summary.failed++;
        throw error;
      }
      testResults.summary.total++;
    });
  });

  describe("4. Data Seeding", function () {
    it("should seed all tables with test data successfully", async function () {
      const testName = "Data Seeding";
      const startTime = Date.now();

      try {
        await seeder.seedAll();

        // Verify data was inserted
        const counts = await seeder.getTableCounts();

        Object.entries(counts).forEach(([tableName, count]) => {
          expect(count).to.be.a("number");
          expect(count).to.be.greaterThan(0);
        });

        testResults.tests.push({
          name: testName,
          status: "passed",
          duration: Date.now() - startTime,
          message: `Successfully seeded all tables with test data`,
          data: counts,
        });
        testResults.summary.passed++;
      } catch (error) {
        testResults.tests.push({
          name: testName,
          status: "failed",
          duration: Date.now() - startTime,
          error: error.message,
        });
        testResults.summary.failed++;
        throw error;
      }
      testResults.summary.total++;
    });

    it("should verify JSON data integrity in seeded records", async function () {
      const testName = "JSON Data Integrity";
      const startTime = Date.now();

      try {
        // Test JSON data in social_detection_results
        const [socialResults] = await testConnection.execute(
          "SELECT id, data FROM social_detection_results LIMIT 1"
        );

        if (socialResults.length > 0) {
          const jsonData = socialResults[0].data;
          expect(jsonData).to.be.an("object");
          expect(jsonData).to.have.property("analysis_type");
          expect(jsonData).to.have.property("confidence");
        }

        // Test JSON data in cctv_detection_results
        const [cctvResults] = await testConnection.execute(
          "SELECT id, data FROM cctv_detection_results LIMIT 1"
        );

        if (cctvResults.length > 0) {
          const jsonData =
            typeof cctvResults[0].data === "string"
              ? JSON.parse(cctvResults[0].data)
              : cctvResults[0].data;
          expect(jsonData).to.be.an("object");
          expect(jsonData).to.have.property("detection_type");
        }

        testResults.tests.push({
          name: testName,
          status: "passed",
          duration: Date.now() - startTime,
          message: "JSON data integrity verified in seeded records",
        });
        testResults.summary.passed++;
      } catch (error) {
        testResults.tests.push({
          name: testName,
          status: "failed",
          duration: Date.now() - startTime,
          error: error.message,
        });
        testResults.summary.failed++;
        throw error;
      }
      testResults.summary.total++;
    });
  });

  describe("5. Database Operations", function () {
    it("should perform basic CRUD operations successfully", async function () {
      const testName = "Basic CRUD Operations";
      const startTime = Date.now();

      try {
        // Create - Insert a test location
        const [insertResult] = await testConnection.execute(
          "INSERT INTO locations (data) VALUES (?)",
          ["Test Location for CRUD"]
        );
        expect(insertResult.insertId).to.be.a("number");
        const insertedId = insertResult.insertId;

        // Read - Select the inserted record
        const [selectResult] = await testConnection.execute(
          "SELECT * FROM locations WHERE id = ?",
          [insertedId]
        );
        expect(selectResult).to.have.length(1);
        expect(selectResult[0].data).to.equal("Test Location for CRUD");

        // Update - Modify the record
        await testConnection.execute(
          "UPDATE locations SET data = ? WHERE id = ?",
          ["Updated Test Location", insertedId]
        );

        const [updateResult] = await testConnection.execute(
          "SELECT data FROM locations WHERE id = ?",
          [insertedId]
        );
        expect(updateResult[0].data).to.equal("Updated Test Location");

        // Delete - Remove the record
        await testConnection.execute("DELETE FROM locations WHERE id = ?", [
          insertedId,
        ]);

        const [deleteResult] = await testConnection.execute(
          "SELECT * FROM locations WHERE id = ?",
          [insertedId]
        );
        expect(deleteResult).to.have.length(0);

        testResults.tests.push({
          name: testName,
          status: "passed",
          duration: Date.now() - startTime,
          message: "All CRUD operations completed successfully",
        });
        testResults.summary.passed++;
      } catch (error) {
        testResults.tests.push({
          name: testName,
          status: "failed",
          duration: Date.now() - startTime,
          error: error.message,
        });
        testResults.summary.failed++;
        throw error;
      }
      testResults.summary.total++;
    });

    it("should handle foreign key relationships correctly", async function () {
      const testName = "Foreign Key Relationship Handling";
      const startTime = Date.now();

      try {
        // Get existing CCTV record
        const [cctvRecords] = await testConnection.execute(
          "SELECT id FROM cctv LIMIT 1"
        );
        expect(cctvRecords).to.have.length.greaterThan(0);
        const cctvId = cctvRecords[0].id;

        // Insert detection result with valid foreign key
        const [insertResult] = await testConnection.execute(
          `
          INSERT INTO cctv_detection_results (cctv_id, data, snapshoot_url) 
          VALUES (?, ?, ?)
        `,
          [
            cctvId,
            JSON.stringify({ test: "data" }),
            "https://example.com/test.jpg",
          ]
        );

        expect(insertResult.insertId).to.be.a("number");

        // Verify the record was inserted
        const [selectResult] = await testConnection.execute(
          "SELECT * FROM cctv_detection_results WHERE id = ?",
          [insertResult.insertId]
        );
        expect(selectResult).to.have.length(1);
        expect(selectResult[0].cctv_id).to.equal(cctvId);

        // Clean up
        await testConnection.execute(
          "DELETE FROM cctv_detection_results WHERE id = ?",
          [insertResult.insertId]
        );

        testResults.tests.push({
          name: testName,
          status: "passed",
          duration: Date.now() - startTime,
          message: "Foreign key relationships handled correctly",
        });
        testResults.summary.passed++;
      } catch (error) {
        testResults.tests.push({
          name: testName,
          status: "failed",
          duration: Date.now() - startTime,
          error: error.message,
        });
        testResults.summary.failed++;
        throw error;
      }
      testResults.summary.total++;
    });
  });

  describe("6. Performance and Optimization", function () {
    it("should verify indexes are properly created", async function () {
      const testName = "Index Verification";
      const startTime = Date.now();

      try {
        // Check for indexes on key tables
        const [indexes] = await testConnection.execute(`
          SELECT 
            TABLE_NAME,
            INDEX_NAME,
            COLUMN_NAME
          FROM information_schema.STATISTICS 
          WHERE 
            TABLE_SCHEMA = DATABASE() 
            AND INDEX_NAME != 'PRIMARY'
          ORDER BY TABLE_NAME, INDEX_NAME
        `);

        expect(indexes).to.be.an("array");
        expect(indexes.length).to.be.greaterThan(0);

        // Verify specific indexes exist
        const indexMap = {};
        indexes.forEach((index) => {
          const key = `${index.TABLE_NAME}.${index.INDEX_NAME}`;
          indexMap[key] = index.COLUMN_NAME;
        });

        // Check for expected indexes
        const expectedIndexes = [
          "scraped_data.idx_query_type",
          "scraped_data.idx_status",
          "scraped_result.idx_account",
          "cctv.idx_name",
          "cctv_detection_results.idx_cctv_id",
          "social_detection_results.idx_scraped_id",
          "suspected_accounts.idx_data",
          "suspected_accounts.idx_platform",
        ];

        expectedIndexes.forEach((expectedIndex) => {
          expect(indexMap).to.have.property(expectedIndex);
        });

        testResults.tests.push({
          name: testName,
          status: "passed",
          duration: Date.now() - startTime,
          message: `Verified ${indexes.length} indexes across tables`,
        });
        testResults.summary.passed++;
      } catch (error) {
        testResults.tests.push({
          name: testName,
          status: "failed",
          duration: Date.now() - startTime,
          error: error.message,
        });
        testResults.summary.failed++;
        throw error;
      }
      testResults.summary.total++;
    });

    it("should test query performance on indexed columns", async function () {
      const testName = "Query Performance on Indexes";
      const startTime = Date.now();

      try {
        // Test query performance on indexed columns
        const queries = [
          'SELECT * FROM scraped_data WHERE query_type = "account"',
          'SELECT * FROM cctv WHERE status = "online"',
          'SELECT * FROM scraped_result WHERE account LIKE "@test%"',
          "SELECT * FROM cctv_detection_results WHERE cctv_id = 1",
          'SELECT * FROM suspected_accounts WHERE platform = "instagram"',
        ];

        for (const query of queries) {
          const queryStart = Date.now();
          const [results] = await testConnection.execute(query);
          const queryDuration = Date.now() - queryStart;

          // Query should complete in reasonable time (under 100ms for test data)
          expect(queryDuration).to.be.lessThan(100);
          expect(results).to.be.an("array");
        }

        testResults.tests.push({
          name: testName,
          status: "passed",
          duration: Date.now() - startTime,
          message:
            "All indexed queries performed within acceptable time limits",
        });
        testResults.summary.passed++;
      } catch (error) {
        testResults.tests.push({
          name: testName,
          status: "failed",
          duration: Date.now() - startTime,
          error: error.message,
        });
        testResults.summary.failed++;
        throw error;
      }
      testResults.summary.total++;
    });
  });

  describe("7. Schema Updates Validation", function () {
    it("should verify corrected table names and structures", async function () {
      const testName = "Schema Updates Verification";
      const startTime = Date.now();

      try {
        // Verify social_detection_results table exists (not social_detention_results)
        const [tables] = await testConnection.execute(`
          SELECT TABLE_NAME 
          FROM information_schema.tables 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'social_detection_results'
        `);
        expect(tables).to.have.length(1);

        // Verify social_detention_results table does NOT exist
        const [oldTables] = await testConnection.execute(`
          SELECT TABLE_NAME 
          FROM information_schema.tables 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'social_detention_results'
        `);
        expect(oldTables).to.have.length(0);

        // Verify scraped_result table does not have scraped_data_id column
        const [columns] = await testConnection.execute(`
          SELECT COLUMN_NAME 
          FROM information_schema.columns 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'scraped_result'
          AND COLUMN_NAME = 'scraped_data_id'
        `);
        expect(columns).to.have.length(0);

        // Verify suspected_accounts has correct platform enum
        const [platformEnum] = await testConnection.execute(`
          SELECT COLUMN_TYPE 
          FROM information_schema.columns 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'suspected_accounts'
          AND COLUMN_NAME = 'platform'
        `);
        expect(platformEnum[0].COLUMN_TYPE).to.include("instagram");
        expect(platformEnum[0].COLUMN_TYPE).to.include("x");
        expect(platformEnum[0].COLUMN_TYPE).to.include("tiktok");
        expect(platformEnum[0].COLUMN_TYPE).to.not.include("twitter");
        expect(platformEnum[0].COLUMN_TYPE).to.not.include("facebook");

        // Verify social_detection_results does not have violence_detected and confidence columns
        const [socialColumns] = await testConnection.execute(`
          SELECT COLUMN_NAME 
          FROM information_schema.columns 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'social_detection_results'
          AND COLUMN_NAME IN ('violence_detected', 'confidence')
        `);
        expect(socialColumns).to.have.length(0);

        // Verify cctv_detection_results does not have confidence and detection_type columns
        const [cctvColumns] = await testConnection.execute(`
          SELECT COLUMN_NAME 
          FROM information_schema.columns 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'cctv_detection_results'
          AND COLUMN_NAME IN ('confidence', 'detection_type')
        `);
        expect(cctvColumns).to.have.length(0);

        testResults.tests.push({
          name: testName,
          status: "passed",
          duration: Date.now() - startTime,
          message: "All schema updates verified successfully",
        });
        testResults.summary.passed++;
      } catch (error) {
        testResults.tests.push({
          name: testName,
          status: "failed",
          duration: Date.now() - startTime,
          error: error.message,
        });
        testResults.summary.failed++;
        throw error;
      }
      testResults.summary.total++;
    });

    it("should verify updated seed data matches new schema", async function () {
      const testName = "Updated Seed Data Verification";
      const startTime = Date.now();

      try {
        // Test suspected_accounts seed data with correct platforms
        const [suspectedAccounts] = await testConnection.execute(
          "SELECT data, platform FROM suspected_accounts"
        );
        expect(suspectedAccounts).to.have.length.greaterThan(0);

        suspectedAccounts.forEach((account) => {
          expect(["instagram", "x", "tiktok"]).to.include(account.platform);
        });

        // Test social_detection_results seed data
        const [socialResults] = await testConnection.execute(
          "SELECT id, data FROM social_detection_results"
        );
        expect(socialResults).to.have.length.greaterThan(0);

        socialResults.forEach((result) => {
          const data = result.data;
          expect(data).to.be.an("object");
          expect(data).to.have.property("analysis_type");
          expect(data).to.have.property("confidence");
          expect(data).to.have.property("risk_level");
        });

        // Test scraped_result data without scraped_data_id
        const [scrapedResults] = await testConnection.execute(
          "SELECT * FROM scraped_result LIMIT 1"
        );
        expect(scrapedResults).to.have.length.greaterThan(0);

        // Verify scraped_data_id column doesn't exist
        const scrapedResult = scrapedResults[0];
        expect(scrapedResult).to.not.have.property("scraped_data_id");

        testResults.tests.push({
          name: testName,
          status: "passed",
          duration: Date.now() - startTime,
          message: "Updated seed data verified successfully",
        });
        testResults.summary.passed++;
      } catch (error) {
        testResults.tests.push({
          name: testName,
          status: "failed",
          duration: Date.now() - startTime,
          error: error.message,
        });
        testResults.summary.failed++;
        throw error;
      }
      testResults.summary.total++;
    });
  });
});
