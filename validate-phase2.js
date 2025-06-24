#!/usr/bin/env node
// Phase 2 Validation Script
const mysql = require("mysql2/promise");
const fs = require("fs").promises;
const path = require("path");

async function validatePhase2() {
  const results = {
    timestamp: new Date().toISOString(),
    phase: "Phase 2 - Database Design",
    status: "success",
    tests: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
    },
  };

  const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "dashboard_user",
    password: process.env.DB_PASSWORD || "dashboard_pass123",
    database: process.env.DB_NAME || "ai_dashboard",
  };

  let connection;

  try {
    console.log("🔍 Phase 2: Database Design Validation");
    console.log("=====================================");

    // Test 1: Database Connection
    console.log("1. Testing database connection...");
    const startTime = Date.now();
    connection = await mysql.createConnection(dbConfig);
    await connection.ping();

    results.tests.push({
      name: "Database Connection",
      status: "passed",
      duration: Date.now() - startTime,
      message: "Successfully connected to MySQL database",
    });
    results.summary.passed++;
    console.log("✅ Database connection successful");

    // Test 2: Table Existence
    console.log("\n2. Checking table creation...");
    const [tables] = await connection.execute("SHOW TABLES");
    const tableNames = tables.map((t) => Object.values(t)[0]);

    const expectedTables = [
      "users",
      "scraped_data",
      "scraped_result",
      "suspected_accounts",
      "locations",
      "cctv",
      "dummy_accounts",
      "social_detention_results",
      "cctv_detection_results",
      "scraped_data_result",
    ];

    const missingTables = expectedTables.filter(
      (table) => !tableNames.includes(table)
    );

    if (missingTables.length === 0) {
      results.tests.push({
        name: "Table Creation",
        status: "passed",
        duration: 0,
        message: `All ${expectedTables.length} tables created successfully`,
        data: { tables: tableNames },
      });
      results.summary.passed++;
      console.log(`✅ All ${expectedTables.length} tables exist`);
    } else {
      results.tests.push({
        name: "Table Creation",
        status: "failed",
        duration: 0,
        error: `Missing tables: ${missingTables.join(", ")}`,
      });
      results.summary.failed++;
      console.log(`❌ Missing tables: ${missingTables.join(", ")}`);
    }

    // Test 3: Data Seeding
    console.log("\n3. Checking seeded data...");
    const totalRecords = {};
    let allTablesSeeded = true;

    for (const tableName of expectedTables) {
      try {
        const [rows] = await connection.execute(
          `SELECT COUNT(*) as count FROM \`${tableName}\``
        );
        const count = rows[0].count;
        totalRecords[tableName] = count;
        console.log(`📊 ${tableName}: ${count} records`);

        if (count === 0) {
          allTablesSeeded = false;
        }
      } catch (error) {
        totalRecords[tableName] = `Error: ${error.message}`;
        allTablesSeeded = false;
      }
    }

    if (allTablesSeeded) {
      results.tests.push({
        name: "Data Seeding",
        status: "passed",
        duration: 0,
        message: "All tables successfully seeded with test data",
        data: totalRecords,
      });
      results.summary.passed++;
      console.log("✅ All tables have seeded data");
    } else {
      results.tests.push({
        name: "Data Seeding",
        status: "failed",
        duration: 0,
        error: "Some tables have no data or errors",
        data: totalRecords,
      });
      results.summary.failed++;
      console.log("❌ Some tables missing data");
    }

    // Test 4: Foreign Key Relationships
    console.log("\n4. Testing foreign key relationships...");
    let foreignKeysWorking = true;

    try {
      // Test CCTV foreign key
      const [cctvResults] = await connection.execute(`
        SELECT cdr.id, cdr.cctv_id, c.name 
        FROM cctv_detection_results cdr 
        JOIN cctv c ON cdr.cctv_id = c.id 
        LIMIT 1
      `);

      if (cctvResults.length > 0) {
        console.log("✅ CCTV foreign key relationship working");
      }

      // Test Social detention foreign key
      const [socialResults] = await connection.execute(`
        SELECT sdr.id, sdr.scraped_id, sd.input_query 
        FROM social_detention_results sdr 
        JOIN scraped_data sd ON sdr.scraped_id = sd.id 
        LIMIT 1
      `);

      if (socialResults.length > 0) {
        console.log("✅ Social detention foreign key relationship working");
      }

      // Test junction table
      const [junctionResults] = await connection.execute(`
        SELECT sdr.id, sd.input_query, sr.account 
        FROM scraped_data_result sdr
        JOIN scraped_data sd ON sdr.id_data = sd.id
        JOIN scraped_result sr ON sdr.id_result = sr.id
        LIMIT 1
      `);

      if (junctionResults.length > 0) {
        console.log("✅ Junction table relationships working");
      }
    } catch (error) {
      foreignKeysWorking = false;
      console.log(`❌ Foreign key relationship error: ${error.message}`);
    }

    if (foreignKeysWorking) {
      results.tests.push({
        name: "Foreign Key Relationships",
        status: "passed",
        duration: 0,
        message: "All foreign key relationships working correctly",
      });
      results.summary.passed++;
    } else {
      results.tests.push({
        name: "Foreign Key Relationships",
        status: "failed",
        duration: 0,
        error: "Foreign key relationship errors detected",
      });
      results.summary.failed++;
    }

    // Test 5: JSON Data Integrity
    console.log("\n5. Testing JSON data integrity...");
    try {
      const [jsonTest] = await connection.execute(`
        SELECT data FROM social_detention_results 
        WHERE JSON_VALID(data) = 1 
        LIMIT 1
      `);

      if (jsonTest.length > 0) {
        results.tests.push({
          name: "JSON Data Integrity",
          status: "passed",
          duration: 0,
          message: "JSON data properly stored and validated",
        });
        results.summary.passed++;
        console.log("✅ JSON data integrity verified");
      } else {
        throw new Error("No valid JSON data found");
      }
    } catch (error) {
      results.tests.push({
        name: "JSON Data Integrity",
        status: "failed",
        duration: 0,
        error: error.message,
      });
      results.summary.failed++;
      console.log(`❌ JSON data integrity issue: ${error.message}`);
    }

    results.summary.total = results.tests.length;

    if (results.summary.failed === 0) {
      results.status = "success";
      console.log("\n🎉 Phase 2 Database Implementation Complete!");
      console.log(`✅ All ${results.summary.total} tests passed`);
    } else {
      results.status = "partial";
      console.log(
        `\n⚠️ Phase 2 completed with issues: ${results.summary.failed}/${results.summary.total} tests failed`
      );
    }
  } catch (error) {
    results.status = "failed";
    results.tests.push({
      name: "Critical Error",
      status: "failed",
      duration: 0,
      error: error.message,
    });
    results.summary.failed++;
    results.summary.total++;
    console.error("❌ Critical error:", error.message);
  } finally {
    if (connection) {
      await connection.end();
    }

    // Save results
    try {
      const resultsPath = path.join(
        __dirname,
        "test",
        "phase2",
        "results.json"
      );
      await fs.writeFile(resultsPath, JSON.stringify(results, null, 2));
      console.log(`\n📊 Results saved to ${resultsPath}`);
    } catch (error) {
      console.error("Failed to save results:", error.message);
    }
  }
}

validatePhase2();
