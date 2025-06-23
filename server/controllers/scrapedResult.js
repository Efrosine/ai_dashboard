const express = require("express");
const router = express.Router();
const db = require("../db");

// POST /api/scraped-results - Save scraped result
router.post("/", async (req, res) => {
  try {
    const { account, data, url } = req.body;

    if (!account || !data) {
      return res.status(400).json({
        error: "Missing required fields: account and data",
      });
    }

    const [result] = await db.execute(
      "INSERT INTO scraped_result (account, data, url, timestamp) VALUES (?, ?, ?, NOW())",
      [account, JSON.stringify(data), url || null]
    );

    res.status(201).json({
      success: true,
      id: result.insertId,
      message: "Scraped result saved successfully",
    });
  } catch (error) {
    console.error("Error saving scraped result:", error);
    res.status(500).json({
      error: "Failed to save scraped result",
      message: error.message,
    });
  }
});

// GET /api/scraped-results - Get all scraped results
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM scraped_result ORDER BY timestamp DESC"
    );

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching scraped results:", error);
    res.status(500).json({
      error: "Failed to fetch scraped results",
      message: error.message,
    });
  }
});

// GET /api/scraped-results/:id - Get single scraped result
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute(
      "SELECT * FROM scraped_result WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Scraped result not found",
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Error fetching scraped result:", error);
    res.status(500).json({
      error: "Failed to fetch scraped result",
      message: error.message,
    });
  }
});

module.exports = router;
