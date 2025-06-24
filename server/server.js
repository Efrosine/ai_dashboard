require("dotenv").config();
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const path = require("path");

// Import database connection
const db = require("./db");

// Import controllers
const scrapedResultController = require("./controllers/scrapedResult");
const messageController = require("./controllers/message");
const channelController = require("./controllers/channel");
const cctvController = require("./controllers/cctv");
const dataController = require("./controllers/data");

const app = express();
const server = http.createServer(app);

// WebSocket server
const wss = new WebSocket.Server({
  server: server,
  path: "/ws",
});

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// API Routes
app.use("/api/scraped-results", scrapedResultController);
app.use("/api/messages", messageController);
app.use("/api/channels", channelController);
app.use("/api/cctv", cctvController);
app.use("/api/data", dataController);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "AI Dashboard Server",
  });
});

// WebSocket connection handling
wss.on("connection", (ws, req) => {
  console.log("New WebSocket connection established");

  // Send welcome message
  ws.send(
    JSON.stringify({
      type: "connection",
      message: "Connected to AI Dashboard WebSocket",
      timestamp: new Date().toISOString(),
    })
  );

  // Handle incoming messages
  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data);
      console.log("Received WebSocket message:", message);

      // Handle different message types
      switch (message.type) {
        case "subscribe":
          handleSubscription(ws, message);
          break;
        case "unsubscribe":
          handleUnsubscription(ws, message);
          break;
        case "ping":
          ws.send(
            JSON.stringify({
              type: "pong",
              timestamp: new Date().toISOString(),
            })
          );
          break;
        case "request_status":
          sendStatusUpdate(ws);
          break;
        default:
          // Echo message back to all clients (for testing)
          broadcastMessage({
            type: "echo",
            originalMessage: message,
            timestamp: new Date().toISOString(),
          });
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Invalid message format",
          timestamp: new Date().toISOString(),
        })
      );
    }
  });

  // Handle connection close
  ws.on("close", () => {
    console.log("WebSocket connection closed");
  });

  // Handle errors
  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

// Function to broadcast message to all connected clients
function broadcastMessage(message) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// Handle WebSocket subscriptions
function handleSubscription(ws, message) {
  const { channel } = message;
  if (!ws.subscriptions) {
    ws.subscriptions = new Set();
  }
  ws.subscriptions.add(channel);

  ws.send(
    JSON.stringify({
      type: "subscription_confirmed",
      channel,
      timestamp: new Date().toISOString(),
    })
  );

  console.log(`Client subscribed to channel: ${channel}`);
}

// Handle WebSocket unsubscriptions
function handleUnsubscription(ws, message) {
  const { channel } = message;
  if (ws.subscriptions) {
    ws.subscriptions.delete(channel);
  }

  ws.send(
    JSON.stringify({
      type: "unsubscription_confirmed",
      channel,
      timestamp: new Date().toISOString(),
    })
  );

  console.log(`Client unsubscribed from channel: ${channel}`);
}

// Send status update to a specific client
async function sendStatusUpdate(ws) {
  try {
    // Get system status
    const [cctvCount] = await db.execute("SELECT COUNT(*) as count FROM cctv");
    const [scrapedCount] = await db.execute(
      "SELECT COUNT(*) as count FROM scraped_result"
    );
    const [detectionCount] = await db.execute(
      "SELECT COUNT(*) as count FROM cctv_detection_results WHERE DATE(timestamp) = CURDATE()"
    );
    const [analysisCount] = await db.execute(
      "SELECT COUNT(*) as count FROM social_detection_results"
    );

    const status = {
      type: "status_update",
      data: {
        cctv_cameras: cctvCount[0].count,
        scraped_results: scrapedCount[0].count,
        today_detections: detectionCount[0].count,
        analysis_results: analysisCount[0].count,
        server_uptime: process.uptime(),
        connected_clients: wss.clients.size,
      },
      timestamp: new Date().toISOString(),
    };

    ws.send(JSON.stringify(status));
  } catch (error) {
    console.error("Error sending status update:", error);
    ws.send(
      JSON.stringify({
        type: "error",
        message: "Failed to get status update",
        timestamp: new Date().toISOString(),
      })
    );
  }
}

// Function to broadcast to specific channel subscribers
function broadcastToChannel(channel, message) {
  wss.clients.forEach((client) => {
    if (
      client.readyState === WebSocket.OPEN &&
      client.subscriptions &&
      client.subscriptions.has(channel)
    ) {
      client.send(
        JSON.stringify({
          ...message,
          channel,
          timestamp: new Date().toISOString(),
        })
      );
    }
  });
}

// Make broadcast functions available globally
global.broadcastMessage = broadcastMessage;
global.broadcastToChannel = broadcastToChannel;

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Server error:", error);
  res.status(500).json({
    error: "Internal server error",
    message: error.message,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.originalUrl,
  });
});

const PORT = process.env.API_PORT || 3000;
const WS_PORT = process.env.WEBSOCKET_PORT || 8080;

// Start server
server.listen(PORT, () => {
  console.log(`🚀 AI Dashboard Server running on port ${PORT}`);
  console.log(`🔗 WebSocket server running on port ${WS_PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);

  // Test database connection on startup
  testDatabaseConnection();
});

async function testDatabaseConnection() {
  try {
    await db.execute("SELECT 1 as test");
    console.log("✅ Database connection successful");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
}
