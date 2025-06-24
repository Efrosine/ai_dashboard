const express = require("express");
const router = express.Router();
const db = require("../db");

// GET /api/cctv - Get all CCTV cameras
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM cctv ORDER BY name ASC");

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching CCTV cameras:", error);
    res.status(500).json({
      error: "Failed to fetch CCTV cameras",
      message: error.message,
    });
  }
});

// POST /api/cctv - Add new CCTV camera
router.post("/", async (req, res) => {
  try {
    const { name, origin_url, stream_url, location } = req.body;

    if (!name || !stream_url) {
      return res.status(400).json({
        error: "Missing required fields: name and stream_url",
      });
    }

    const [result] = await db.execute(
      "INSERT INTO cctv (name, origin_url, stream_url, location) VALUES (?, ?, ?, ?)",
      [name, origin_url || null, stream_url, location || null]
    );

    // Broadcast real-time update via WebSocket
    if (global.broadcastMessage) {
      global.broadcastMessage({
        type: "cctv_added",
        data: {
          id: result.insertId,
          name,
          origin_url,
          stream_url,
          location,
        },
        timestamp: new Date().toISOString(),
      });
    }

    res.status(201).json({
      success: true,
      id: result.insertId,
      message: "CCTV camera added successfully",
    });
  } catch (error) {
    console.error("Error adding CCTV camera:", error);
    res.status(500).json({
      error: "Failed to add CCTV camera",
      message: error.message,
    });
  }
});

// GET /api/cctv/:id - Get single CCTV camera
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute("SELECT * FROM cctv WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: "CCTV camera not found",
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Error fetching CCTV camera:", error);
    res.status(500).json({
      error: "Failed to fetch CCTV camera",
      message: error.message,
    });
  }
});

// GET /api/cctv/:id/detections - Get detection results for a CCTV camera
router.get("/:id/detections", async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // First verify CCTV exists
    const [cctvRows] = await db.execute(
      "SELECT id, name FROM cctv WHERE id = ?",
      [id]
    );

    if (cctvRows.length === 0) {
      return res.status(404).json({
        error: "CCTV camera not found",
      });
    }

    // Get detection results
    const limitNum = Math.max(1, Math.min(100, parseInt(limit))); // Limit between 1-100
    const offsetNum = Math.max(0, parseInt(offset));

    const [detectionRows] = await db.execute(
      `SELECT * FROM cctv_detection_results 
       WHERE cctv_id = ? 
       ORDER BY timestamp DESC 
       LIMIT ${limitNum} OFFSET ${offsetNum}`,
      [id]
    );

    // Parse JSON data
    const detections = detectionRows.map((row) => ({
      ...row,
      data: JSON.parse(row.data),
    }));

    res.json({
      success: true,
      cctv: cctvRows[0],
      data: detections,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: detections.length,
      },
    });
  } catch (error) {
    console.error("Error fetching CCTV detections:", error);
    res.status(500).json({
      error: "Failed to fetch CCTV detections",
      message: error.message,
    });
  }
});

// POST /api/cctv/:id/detections - Add detection result for a CCTV camera
router.post("/:id/detections", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, snapshoot_url } = req.body;

    if (!data) {
      return res.status(400).json({
        error: "Missing required field: data",
      });
    }

    // Verify CCTV exists
    const [cctvRows] = await db.execute(
      "SELECT id, name FROM cctv WHERE id = ?",
      [id]
    );

    if (cctvRows.length === 0) {
      return res.status(404).json({
        error: "CCTV camera not found",
      });
    }

    const [result] = await db.execute(
      "INSERT INTO cctv_detection_results (cctv_id, data, timestamp, snapshoot_url) VALUES (?, ?, NOW(), ?)",
      [id, JSON.stringify(data), snapshoot_url || null]
    );

    const detectionResult = {
      id: result.insertId,
      cctv_id: parseInt(id),
      cctv_name: cctvRows[0].name,
      data,
      snapshoot_url,
      timestamp: new Date().toISOString(),
    };

    // Broadcast real-time update via WebSocket
    if (global.broadcastMessage) {
      global.broadcastMessage({
        type: "cctv_detection",
        data: detectionResult,
        timestamp: new Date().toISOString(),
      });
    }

    res.status(201).json({
      success: true,
      id: result.insertId,
      message: "Detection result added successfully",
      data: detectionResult,
    });
  } catch (error) {
    console.error("Error adding detection result:", error);
    res.status(500).json({
      error: "Failed to add detection result",
      message: error.message,
    });
  }
});

// POST /api/cctv/mock-detection - Generate mock detection for testing
router.post("/mock-detection", async (req, res) => {
  try {
    const { cctv_id } = req.body;

    // If no cctv_id provided, get a random one
    let targetCctvId = cctv_id;
    if (!targetCctvId) {
      const [cctvRows] = await db.execute(
        "SELECT id FROM cctv ORDER BY RAND() LIMIT 1"
      );
      if (cctvRows.length === 0) {
        return res.status(404).json({
          error: "No CCTV cameras found",
        });
      }
      targetCctvId = cctvRows[0].id;
    }

    // Generate mock detection data
    const mockDetection = {
      objects_detected: [
        {
          type: "person",
          confidence: Math.random() * 0.3 + 0.7, // 70-100%
          bbox: {
            x: Math.floor(Math.random() * 800),
            y: Math.floor(Math.random() * 600),
            width: Math.floor(Math.random() * 200) + 50,
            height: Math.floor(Math.random() * 300) + 100,
          },
        },
        {
          type: "vehicle",
          confidence: Math.random() * 0.4 + 0.6, // 60-100%
          bbox: {
            x: Math.floor(Math.random() * 600),
            y: Math.floor(Math.random() * 400),
            width: Math.floor(Math.random() * 300) + 100,
            height: Math.floor(Math.random() * 200) + 80,
          },
        },
      ],
      alert_level: Math.floor(Math.random() * 5) + 1,
      processing_time_ms: Math.floor(Math.random() * 500) + 100,
    };

    const mockSnapshotUrl = `https://picsum.photos/800/600?random=${Date.now()}`;

    const [result] = await db.execute(
      "INSERT INTO cctv_detection_results (cctv_id, data, timestamp, snapshoot_url) VALUES (?, ?, NOW(), ?)",
      [targetCctvId, JSON.stringify(mockDetection), mockSnapshotUrl]
    );

    // Get CCTV info for broadcast
    const [cctvInfo] = await db.execute("SELECT name FROM cctv WHERE id = ?", [
      targetCctvId,
    ]);

    const detectionResult = {
      id: result.insertId,
      cctv_id: targetCctvId,
      cctv_name: cctvInfo[0]?.name || "Unknown",
      data: mockDetection,
      snapshoot_url: mockSnapshotUrl,
      timestamp: new Date().toISOString(),
    };

    // Broadcast real-time update via WebSocket
    if (global.broadcastMessage) {
      global.broadcastMessage({
        type: "cctv_detection",
        data: detectionResult,
        timestamp: new Date().toISOString(),
      });
    }

    res.status(201).json({
      success: true,
      id: result.insertId,
      message: "Mock detection generated successfully",
      data: detectionResult,
    });
  } catch (error) {
    console.error("Error generating mock detection:", error);
    res.status(500).json({
      error: "Failed to generate mock detection",
      message: error.message,
    });
  }
});

module.exports = router;
