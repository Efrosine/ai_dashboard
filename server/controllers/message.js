const express = require("express");
const router = express.Router();

// POST /api/messages - Broadcast message via WebSocket
router.post("/", async (req, res) => {
  try {
    const { type, message, data } = req.body;

    if (!type || !message) {
      return res.status(400).json({
        error: "Missing required fields: type and message",
      });
    }

    // Broadcast message to all WebSocket clients
    const broadcastData = {
      type,
      message,
      data: data || null,
      timestamp: new Date().toISOString(),
    };

    if (global.broadcastMessage) {
      global.broadcastMessage(broadcastData);
    }

    res.json({
      success: true,
      message: "Message broadcasted successfully",
      data: broadcastData,
    });
  } catch (error) {
    console.error("Error broadcasting message:", error);
    res.status(500).json({
      error: "Failed to broadcast message",
      message: error.message,
    });
  }
});

module.exports = router;
