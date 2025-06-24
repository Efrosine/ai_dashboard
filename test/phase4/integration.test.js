const { expect } = require("chai");
const axios = require("axios");
const WebSocket = require("ws");

const BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";
const WS_URL = process.env.WS_URL || "ws://localhost:3000";

describe("Phase 4: Integration Tests", () => {
  let ws;
  let wsMessages = [];

  // Setup WebSocket connection for real-time testing
  before((done) => {
    ws = new WebSocket(`${WS_URL}/ws`);

    ws.on("open", () => {
      console.log("WebSocket connected for testing");
      done();
    });

    ws.on("message", (data) => {
      const message = JSON.parse(data);
      wsMessages.push(message);
      console.log("WebSocket message received:", message.type);
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      done(error);
    });
  });

  after(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  });

  beforeEach(() => {
    wsMessages = []; // Clear messages before each test
  });

  describe("API Endpoints", () => {
    describe("Scraped Results API", () => {
      let scrapedResultId;

      it("should create a new scraped result", async () => {
        const testData = {
          account: "@test_account",
          data: {
            post_content: "Test post content",
            likes: 100,
            shares: 25,
            comments: 10,
          },
          url: "https://example.com/test-post",
        };

        const response = await axios.post(
          `${BASE_URL}/api/scraped-results`,
          testData
        );

        expect(response.status).to.equal(201);
        expect(response.data.success).to.be.true;
        expect(response.data.id).to.be.a("number");

        scrapedResultId = response.data.id;
      });

      it("should fetch all scraped results", async () => {
        const response = await axios.get(`${BASE_URL}/api/scraped-results`);

        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.data).to.be.an("array");
        expect(response.data.data.length).to.be.greaterThan(0);
      });

      it("should analyze scraped results and broadcast WebSocket message", async () => {
        // Use the scraped result ID we just created
        const analysisData = {
          ids: [scrapedResultId],
        };

        const response = await axios.post(
          `${BASE_URL}/api/scraped-results/analyze`,
          analysisData
        );

        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.analyzed_count).to.equal(1);
        expect(response.data.results).to.be.an("array");

        // Wait for WebSocket message
        await new Promise((resolve) => setTimeout(resolve, 200));

        const analysisMessage = wsMessages.find(
          (msg) => msg.type === "analysis_complete"
        );
        expect(analysisMessage).to.exist;
        expect(analysisMessage.data.analyzed_count).to.equal(1);
      });

      it("should fetch analysis results for a scraped result", async () => {
        const response = await axios.get(
          `${BASE_URL}/api/scraped-results/analysis/${scrapedResultId}`
        );

        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.data.analysis_results).to.exist;
        expect(response.data.data.analysis_results).to.be.an("array");
      });
    });

    describe("CCTV API", () => {
      let cctvId;

      it("should create a new CCTV camera", async () => {
        const testData = {
          name: "Test Camera",
          origin_url: "https://camera.example.com/cam1",
          stream_url: "rtmp://stream.example.com/cam1",
          location: "Test Location",
        };

        const response = await axios.post(`${BASE_URL}/api/cctv`, testData);

        expect(response.status).to.equal(201);
        expect(response.data.success).to.be.true;
        expect(response.data.id).to.be.a("number");

        cctvId = response.data.id;

        // Wait for WebSocket message
        await new Promise((resolve) => setTimeout(resolve, 100));

        const cctvMessage = wsMessages.find((msg) => msg.type === "cctv_added");
        expect(cctvMessage).to.exist;
        expect(cctvMessage.data.name).to.equal("Test Camera");
      });

      it("should fetch all CCTV cameras", async () => {
        const response = await axios.get(`${BASE_URL}/api/cctv`);

        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.data).to.be.an("array");
        expect(response.data.data.length).to.be.greaterThan(0);
      });

      it("should add detection result for CCTV camera", async () => {
        const detectionData = {
          data: {
            objects_detected: [
              {
                type: "person",
                confidence: 0.95,
                bbox: { x: 100, y: 100, width: 50, height: 150 },
              },
            ],
            alert_level: 2,
          },
          snapshoot_url: "https://example.com/snapshot.jpg",
        };

        const response = await axios.post(
          `${BASE_URL}/api/cctv/${cctvId}/detections`,
          detectionData
        );

        expect(response.status).to.equal(201);
        expect(response.data.success).to.be.true;
        expect(response.data.data.cctv_id).to.equal(cctvId);

        // Wait for WebSocket message
        await new Promise((resolve) => setTimeout(resolve, 100));

        const detectionMessage = wsMessages.find(
          (msg) => msg.type === "cctv_detection"
        );
        expect(detectionMessage).to.exist;
        expect(detectionMessage.data.cctv_id).to.equal(cctvId);
      });

      it("should fetch detection results for CCTV camera", async () => {
        const response = await axios.get(
          `${BASE_URL}/api/cctv/${cctvId}/detections`
        );

        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.data).to.be.an("array");
        expect(response.data.data.length).to.be.greaterThan(0);
      });

      it("should generate mock detection", async () => {
        const response = await axios.post(
          `${BASE_URL}/api/cctv/mock-detection`,
          {
            cctv_id: cctvId,
          }
        );

        expect(response.status).to.equal(201);
        expect(response.data.success).to.be.true;
        expect(response.data.data.cctv_id).to.equal(cctvId);
      });
    });

    describe("Data Management API", () => {
      it("should create dummy account", async () => {
        const testData = {
          username: `test_dummy_${Date.now()}`,
          password: "test_password",
          platform: "x", // Valid platform values: 'instagram', 'x', 'tiktok'
        };

        const response = await axios.post(
          `${BASE_URL}/api/data/dummy-accounts`,
          testData
        );

        expect(response.status).to.equal(201);
        expect(response.data.success).to.be.true;
        expect(response.data.id).to.be.a("number");
      });

      it("should fetch dummy accounts", async () => {
        const response = await axios.get(`${BASE_URL}/api/data/dummy-accounts`);

        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.data).to.be.an("array");
      });

      it("should create suspected account", async () => {
        const testData = {
          data: "suspected@example.com",
        };

        const response = await axios.post(
          `${BASE_URL}/api/data/suspected-accounts`,
          testData
        );

        expect(response.status).to.equal(201);
        expect(response.data.success).to.be.true;
      });

      it("should create location", async () => {
        const testData = {
          data: "Test City, 40.7128, -74.0060",
        };

        const response = await axios.post(
          `${BASE_URL}/api/data/locations`,
          testData
        );

        expect(response.status).to.equal(201);
        expect(response.data.success).to.be.true;
      });

      it("should generate mock scraped results", async () => {
        const response = await axios.post(
          `${BASE_URL}/api/data/generate-mock`,
          {
            type: "scraped-results",
            count: 3,
          }
        );

        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.count).to.equal(3);
        expect(response.data.data).to.be.an("array");
        expect(response.data.data.length).to.equal(3);
      });

      it("should generate mock CCTV cameras", async () => {
        const response = await axios.post(
          `${BASE_URL}/api/data/generate-mock`,
          {
            type: "cctv",
            count: 2,
          }
        );

        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.count).to.equal(2);
      });
    });
  });

  describe("WebSocket Integration", () => {
    it("should handle ping/pong messages", (done) => {
      ws.send(JSON.stringify({ type: "ping" }));

      setTimeout(() => {
        const pongMessage = wsMessages.find((msg) => msg.type === "pong");
        expect(pongMessage).to.exist;
        done();
      }, 100);
    });

    it("should handle subscription to channels", (done) => {
      ws.send(
        JSON.stringify({
          type: "subscribe",
          channel: "cctv_detections",
        })
      );

      setTimeout(() => {
        const confirmMessage = wsMessages.find(
          (msg) => msg.type === "subscription_confirmed"
        );
        expect(confirmMessage).to.exist;
        expect(confirmMessage.channel).to.equal("cctv_detections");
        done();
      }, 100);
    });

    it("should handle status requests", (done) => {
      ws.send(JSON.stringify({ type: "request_status" }));

      setTimeout(() => {
        const statusMessage = wsMessages.find(
          (msg) => msg.type === "status_update"
        );
        expect(statusMessage).to.exist;
        expect(statusMessage.data).to.have.property("cctv_cameras");
        expect(statusMessage.data).to.have.property("scraped_results");
        expect(statusMessage.data).to.have.property("connected_clients");
        done();
      }, 200);
    });
  });

  describe("Health Check", () => {
    it("should return server health status", async () => {
      const response = await axios.get(`${BASE_URL}/api/health`);

      expect(response.status).to.equal(200);
      expect(response.data.status).to.equal("OK");
      expect(response.data.service).to.equal("AI Dashboard Server");
      expect(response.data.timestamp).to.exist;
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid scraped result data", async () => {
      try {
        await axios.post(`${BASE_URL}/api/scraped-results`, {
          // Missing required fields
          url: "https://example.com",
        });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.response.status).to.equal(400);
        expect(error.response.data.error).to.include("Missing required fields");
      }
    });

    it("should handle invalid CCTV data", async () => {
      try {
        await axios.post(`${BASE_URL}/api/cctv`, {
          // Missing required fields
          location: "Test Location",
        });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.response.status).to.equal(400);
        expect(error.response.data.error).to.include("Missing required fields");
      }
    });

    it("should handle non-existent resource requests", async () => {
      try {
        await axios.get(`${BASE_URL}/api/scraped-results/99999`);
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.response.status).to.equal(404);
        expect(error.response.data.error).to.include("not found");
      }
    });
  });
});
