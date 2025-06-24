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

// POST /api/scraped-results/analyze - Send data to n8n for analysis
router.post("/analyze", async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        error: "Missing required field: ids (array of scraped_result IDs)",
      });
    }

    // Get scraped results data
    const placeholders = ids.map(() => "?").join(",");
    const [rows] = await db.execute(
      `SELECT id, account, data, url, timestamp FROM scraped_result WHERE id IN (${placeholders})`,
      ids
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "No scraped results found for provided IDs",
      });
    }

    // Prepare data for n8n
    const analysisData = rows.map((row) => ({
      id: row.id,
      account: row.account,
      data: JSON.parse(row.data),
      url: row.url,
      timestamp: row.timestamp,
    }));

    // TODO: Replace with actual n8n endpoint when available
    // For now, create mock analysis results
    const mockAnalysisResults = analysisData.map((item) => ({
      scraped_id: item.id,
      analysis: {
        violence_detected: Math.random() > 0.7,
        threat_level: Math.floor(Math.random() * 5) + 1,
        keywords: ["mock", "analysis", "data"],
        confidence: Math.random(),
        detected_entities: [
          { type: "person", confidence: Math.random() },
          { type: "location", confidence: Math.random() },
        ],
      },
      analyzed_at: new Date().toISOString(),
    }));

    // Create a scraped_data entry for this analysis request
    const [scrapedDataResult] = await db.execute(
      "INSERT INTO scraped_data (input_query, timestamp) VALUES (?, NOW())",
      [`Analysis request for IDs: ${ids.join(",")}`]
    );
    const scrapedDataId = scrapedDataResult.insertId;

    // Link the scraped_results to this scraped_data
    for (const id of ids) {
      await db.execute(
        "INSERT INTO scraped_data_result (id_data, id_result) VALUES (?, ?)",
        [scrapedDataId, id]
      );
    }

    // Save analysis results to social_detection_results (referencing scraped_data.id)
    for (const result of mockAnalysisResults) {
      await db.execute(
        "INSERT INTO social_detection_results (scraped_id, data) VALUES (?, ?)",
        [scrapedDataId, JSON.stringify(result.analysis)]
      );
    }

    // Broadcast real-time update via WebSocket
    if (global.broadcastMessage) {
      global.broadcastMessage({
        type: "analysis_complete",
        data: {
          analyzed_count: mockAnalysisResults.length,
          results: mockAnalysisResults,
        },
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      message: "Analysis completed successfully",
      analyzed_count: mockAnalysisResults.length,
      results: mockAnalysisResults,
    });
  } catch (error) {
    console.error("Error analyzing scraped results:", error);
    res.status(500).json({
      error: "Failed to analyze scraped results",
      message: error.message,
    });
  }
});

// GET /api/scraped-results/analysis/:id - Get analysis results for a scraped result
router.get("/analysis/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Get the scraped result
    const [scrapedRows] = await db.execute(
      "SELECT * FROM scraped_result WHERE id = ?",
      [id]
    );

    if (scrapedRows.length === 0) {
      return res.status(404).json({
        error: "Scraped result not found",
      });
    }

    // Get analysis results through the relationship chain
    // scraped_result -> scraped_data_result -> scraped_data -> social_detection_results
    const [analysisRows] = await db.execute(
      `
      SELECT sdr.*, sd.input_query, sd.timestamp as analysis_request_time
      FROM scraped_data_result sdr_rel
      JOIN scraped_data sd ON sdr_rel.id_data = sd.id
      JOIN social_detection_results sdr ON sd.id = sdr.scraped_id
      WHERE sdr_rel.id_result = ?
      ORDER BY sdr.analysis_timestamp DESC
    `,
      [id]
    );

    const scrapedResult = scrapedRows[0];
    const analysisResults = analysisRows.map((row) => ({
      id: row.id,
      data: typeof row.data === "string" ? JSON.parse(row.data) : row.data,
      analysis_timestamp: row.analysis_timestamp,
      analysis_request_time: row.analysis_request_time,
      input_query: row.input_query,
    }));

    res.json({
      success: true,
      data: {
        ...scrapedResult,
        data:
          typeof scrapedResult.data === "string"
            ? JSON.parse(scrapedResult.data)
            : scrapedResult.data,
        analysis_results: analysisResults,
      },
    });
  } catch (error) {
    console.error("Error fetching analysis result:", error);
    res.status(500).json({
      error: "Failed to fetch analysis result",
      message: error.message,
    });
  }
});

module.exports = router;
