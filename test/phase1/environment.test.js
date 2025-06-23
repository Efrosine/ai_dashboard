const { expect } = require("chai");
const http = require("http");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

describe("Phase 1: Environment Setup Tests", function () {
  this.timeout(30000); // 30 second timeout for Docker operations

  let testResults = {
    timestamp: new Date().toISOString(),
    phase: "Phase 1 - Environment Setup",
    tests: [],
  };

  before(function () {
    console.log("🧪 Starting Phase 1 Environment Setup Tests...");
  });

  after(function () {
    // Save test results
    const resultsPath = path.join(__dirname, "results.json");
    fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));
    console.log(`📊 Test results saved to: ${resultsPath}`);
  });

  describe("Docker Environment", function () {
    it("should have docker-compose.yml file with correct services", function () {
      const testName = "Docker Compose Configuration";
      const dockerComposePath = path.join(
        __dirname,
        "../../docker-compose.yml"
      );

      try {
        expect(fs.existsSync(dockerComposePath)).to.be.true;

        const dockerComposeContent = fs.readFileSync(dockerComposePath, "utf8");
        expect(dockerComposeContent).to.include("mysql:");
        expect(dockerComposeContent).to.include("server:");
        expect(dockerComposeContent).to.include("frontend:");
        expect(dockerComposeContent).to.include("ai_dashboard_network");

        testResults.tests.push({
          name: testName,
          status: "passed",
          message: "Docker Compose file is properly configured",
        });
      } catch (error) {
        testResults.tests.push({
          name: testName,
          status: "failed",
          message: error.message,
        });
        throw error;
      }
    });

    it("should have .env file with required environment variables", function () {
      const testName = "Environment Variables Configuration";
      const envPath = path.join(__dirname, "../../.env");

      try {
        expect(fs.existsSync(envPath)).to.be.true;

        const envContent = fs.readFileSync(envPath, "utf8");
        expect(envContent).to.include("MYSQL_ROOT_PASSWORD");
        expect(envContent).to.include("MYSQL_DATABASE");
        expect(envContent).to.include("MYSQL_USER");
        expect(envContent).to.include("MYSQL_PASSWORD");
        expect(envContent).to.include("NODE_ENV");

        testResults.tests.push({
          name: testName,
          status: "passed",
          message: "Environment file contains required variables",
        });
      } catch (error) {
        testResults.tests.push({
          name: testName,
          status: "failed",
          message: error.message,
        });
        throw error;
      }
    });

    it("should have Dockerfile.server with correct configuration", function () {
      const testName = "Server Dockerfile Configuration";
      const dockerfilePath = path.join(__dirname, "../../Dockerfile.server");

      try {
        expect(fs.existsSync(dockerfilePath)).to.be.true;

        const dockerfileContent = fs.readFileSync(dockerfilePath, "utf8");
        expect(dockerfileContent).to.include("FROM node:");
        expect(dockerfileContent).to.include("EXPOSE 3000 8080");
        expect(dockerfileContent).to.include("npm start");

        testResults.tests.push({
          name: testName,
          status: "passed",
          message: "Server Dockerfile is properly configured",
        });
      } catch (error) {
        testResults.tests.push({
          name: testName,
          status: "failed",
          message: error.message,
        });
        throw error;
      }
    });

    it("should have Dockerfile.frontend with nginx configuration", function () {
      const testName = "Frontend Dockerfile Configuration";
      const dockerfilePath = path.join(__dirname, "../../Dockerfile.frontend");

      try {
        expect(fs.existsSync(dockerfilePath)).to.be.true;

        const dockerfileContent = fs.readFileSync(dockerfilePath, "utf8");
        expect(dockerfileContent).to.include("FROM nginx:");
        expect(dockerfileContent).to.include("EXPOSE 80");

        testResults.tests.push({
          name: testName,
          status: "passed",
          message: "Frontend Dockerfile is properly configured",
        });
      } catch (error) {
        testResults.tests.push({
          name: testName,
          status: "failed",
          message: error.message,
        });
        throw error;
      }
    });
  });

  describe("Project Structure", function () {
    it("should have correct project directory structure", function () {
      const testName = "Project Directory Structure";

      try {
        const requiredDirs = [
          "frontend",
          "server",
          "server/controllers",
          "frontend/components",
          "frontend/utils",
          "sql",
        ];

        for (const dir of requiredDirs) {
          const dirPath = path.join(__dirname, "../..", dir);
          expect(fs.existsSync(dirPath)).to.be.true;
        }

        testResults.tests.push({
          name: testName,
          status: "passed",
          message: "All required directories exist",
        });
      } catch (error) {
        testResults.tests.push({
          name: testName,
          status: "failed",
          message: error.message,
        });
        throw error;
      }
    });

    it("should have package.json with required dependencies", function () {
      const testName = "Package Dependencies";
      const packagePath = path.join(__dirname, "../../package.json");

      try {
        expect(fs.existsSync(packagePath)).to.be.true;

        const packageContent = JSON.parse(fs.readFileSync(packagePath, "utf8"));

        const requiredDeps = ["mysql2", "ws", "express", "cors", "dotenv"];
        const requiredDevDeps = ["mocha", "chai", "nodemon"];

        for (const dep of requiredDeps) {
          expect(packageContent.dependencies).to.have.property(dep);
        }

        for (const devDep of requiredDevDeps) {
          expect(packageContent.devDependencies).to.have.property(devDep);
        }

        testResults.tests.push({
          name: testName,
          status: "passed",
          message: "Package.json contains all required dependencies",
        });
      } catch (error) {
        testResults.tests.push({
          name: testName,
          status: "failed",
          message: error.message,
        });
        throw error;
      }
    });
  });

  describe("Server Components", function () {
    it("should have server.js with WebSocket and Express setup", function () {
      const testName = "Server Main File";
      const serverPath = path.join(__dirname, "../../server/server.js");

      try {
        expect(fs.existsSync(serverPath)).to.be.true;

        const serverContent = fs.readFileSync(serverPath, "utf8");
        expect(serverContent).to.include("express");
        expect(serverContent).to.include("WebSocket");
        expect(serverContent).to.include("cors");
        expect(serverContent).to.include("/api/health");

        testResults.tests.push({
          name: testName,
          status: "passed",
          message: "Server file properly configured with Express and WebSocket",
        });
      } catch (error) {
        testResults.tests.push({
          name: testName,
          status: "failed",
          message: error.message,
        });
        throw error;
      }
    });

    it("should have database connection module", function () {
      const testName = "Database Connection Module";
      const dbPath = path.join(__dirname, "../../server/db.js");

      try {
        expect(fs.existsSync(dbPath)).to.be.true;

        const dbContent = fs.readFileSync(dbPath, "utf8");
        expect(dbContent).to.include("mysql2");
        expect(dbContent).to.include("createPool");

        testResults.tests.push({
          name: testName,
          status: "passed",
          message: "Database connection module properly configured",
        });
      } catch (error) {
        testResults.tests.push({
          name: testName,
          status: "failed",
          message: error.message,
        });
        throw error;
      }
    });

    it("should have required controller files", function () {
      const testName = "Controller Files";

      try {
        const requiredControllers = [
          "scrapedResult.js",
          "message.js",
          "channel.js",
        ];

        for (const controller of requiredControllers) {
          const controllerPath = path.join(
            __dirname,
            "../../server/controllers",
            controller
          );
          expect(fs.existsSync(controllerPath)).to.be.true;

          const controllerContent = fs.readFileSync(controllerPath, "utf8");
          expect(controllerContent).to.include("express");
          expect(controllerContent).to.include("router");
        }

        testResults.tests.push({
          name: testName,
          status: "passed",
          message:
            "All required controller files exist and properly configured",
        });
      } catch (error) {
        testResults.tests.push({
          name: testName,
          status: "failed",
          message: error.message,
        });
        throw error;
      }
    });
  });

  describe("Frontend Components", function () {
    it("should have index.html with correct structure", function () {
      const testName = "Frontend HTML Structure";
      const htmlPath = path.join(__dirname, "../../frontend/index.html");

      try {
        expect(fs.existsSync(htmlPath)).to.be.true;

        const htmlContent = fs.readFileSync(htmlPath, "utf8");
        expect(htmlContent).to.include("daisyui");
        expect(htmlContent).to.include("tailwindcss");
        expect(htmlContent).to.include('id="social-media"');
        expect(htmlContent).to.include('id="cctv"');
        expect(htmlContent).to.include('id="admin"');

        testResults.tests.push({
          name: testName,
          status: "passed",
          message: "Frontend HTML structure is correct",
        });
      } catch (error) {
        testResults.tests.push({
          name: testName,
          status: "failed",
          message: error.message,
        });
        throw error;
      }
    });

    it("should have required JavaScript components", function () {
      const testName = "Frontend JavaScript Components";

      try {
        const requiredComponents = [
          "script.js",
          "utils/api.js",
          "utils/helper.js",
          "components/liveCCTV.js",
          "components/analysisResult.js",
          "components/dummyAccountForm.js",
          "components/locationList.js",
        ];

        for (const component of requiredComponents) {
          const componentPath = path.join(
            __dirname,
            "../../frontend",
            component
          );
          expect(fs.existsSync(componentPath)).to.be.true;

          const componentContent = fs.readFileSync(componentPath, "utf8");
          expect(componentContent.length).to.be.greaterThan(100); // Basic content check
        }

        testResults.tests.push({
          name: testName,
          status: "passed",
          message: "All required frontend components exist",
        });
      } catch (error) {
        testResults.tests.push({
          name: testName,
          status: "failed",
          message: error.message,
        });
        throw error;
      }
    });

    it("should have CSS styling file", function () {
      const testName = "Frontend CSS Styling";
      const cssPath = path.join(__dirname, "../../frontend/style.css");

      try {
        expect(fs.existsSync(cssPath)).to.be.true;

        const cssContent = fs.readFileSync(cssPath, "utf8");
        expect(cssContent).to.include("cctv-feed");
        expect(cssContent).to.include("connection-");

        testResults.tests.push({
          name: testName,
          status: "passed",
          message: "CSS styling file exists and contains custom styles",
        });
      } catch (error) {
        testResults.tests.push({
          name: testName,
          status: "failed",
          message: error.message,
        });
        throw error;
      }
    });
  });

  describe("Database Schema", function () {
    it("should have SQL schema file with required tables", function () {
      const testName = "Database Schema File";
      const schemaPath = path.join(__dirname, "../../sql/schema.sql");

      try {
        expect(fs.existsSync(schemaPath)).to.be.true;

        const schemaContent = fs.readFileSync(schemaPath, "utf8");

        const requiredTables = [
          "locations",
          "suspected_accounts",
          "dummy_accounts",
          "users",
          "scraped_data",
          "scraped_result",
          "scraped_data_result",
          "cctv",
          "cctv_detection_results",
          "social_detention_results",
        ];

        for (const table of requiredTables) {
          expect(schemaContent).to.include(
            `CREATE TABLE IF NOT EXISTS ${table}`
          );
        }

        testResults.tests.push({
          name: testName,
          status: "passed",
          message: "Database schema file contains all required tables",
        });
      } catch (error) {
        testResults.tests.push({
          name: testName,
          status: "failed",
          message: error.message,
        });
        throw error;
      }
    });
  });

  describe("Configuration Files", function () {
    it("should have nginx configuration for frontend", function () {
      const testName = "Nginx Configuration";
      const nginxPath = path.join(__dirname, "../../nginx.conf");

      try {
        expect(fs.existsSync(nginxPath)).to.be.true;

        const nginxContent = fs.readFileSync(nginxPath, "utf8");
        expect(nginxContent).to.include("server {");
        expect(nginxContent).to.include("location /api/");
        expect(nginxContent).to.include("location /ws");
        expect(nginxContent).to.include("proxy_pass http://server:");

        testResults.tests.push({
          name: testName,
          status: "passed",
          message:
            "Nginx configuration properly set up for API and WebSocket proxying",
        });
      } catch (error) {
        testResults.tests.push({
          name: testName,
          status: "failed",
          message: error.message,
        });
        throw error;
      }
    });
  });
});
