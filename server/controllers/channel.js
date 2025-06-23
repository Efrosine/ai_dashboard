const express = require("express");
const router = express.Router();

// GET /api/channels - Get channel information
router.get("/", async (req, res) => {
  try {
    res.json({
      success: true,
      channels: [
        {
          id: "cctv_detection",
          name: "CCTV Detection Updates",
          description: "Real-time CCTV detection results",
        },
        {
          id: "social_analysis",
          name: "Social Media Analysis",
          description: "Social media analysis results",
        },
        {
          id: "system_status",
          name: "System Status",
          description: "System health and status updates",
        },
      ],
    });
  } catch (error) {
    console.error("Error fetching channels:", error);
    res.status(500).json({
      error: "Failed to fetch channels",
      message: error.message,
    });
  }
});

module.exports = router;
