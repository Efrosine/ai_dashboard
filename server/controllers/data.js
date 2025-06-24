const express = require("express");
const router = express.Router();
const db = require("../db");

// === DUMMY ACCOUNTS ===

// GET /api/data/dummy-accounts - Get all dummy accounts
router.get("/dummy-accounts", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM dummy_accounts ORDER BY id ASC"
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching dummy accounts:", error);
    res.status(500).json({
      error: "Failed to fetch dummy accounts",
      message: error.message,
    });
  }
});

// POST /api/data/dummy-accounts - Add new dummy account
router.post("/dummy-accounts", async (req, res) => {
  try {
    const { username, password, platform } = req.body;

    if (!username || !password || !platform) {
      return res.status(400).json({
        error: "Missing required fields: username, password, platform",
      });
    }

    const [result] = await db.execute(
      "INSERT INTO dummy_accounts (username, password, platform) VALUES (?, ?, ?)",
      [username, password, platform]
    );

    res.status(201).json({
      success: true,
      id: result.insertId,
      message: "Dummy account added successfully",
    });
  } catch (error) {
    console.error("Error adding dummy account:", error);
    res
      .status(500)
      .json({ error: "Failed to add dummy account", message: error.message });
  }
});

// === SUSPECTED ACCOUNTS ===

// GET /api/data/suspected-accounts - Get all suspected accounts
router.get("/suspected-accounts", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM suspected_accounts ORDER BY id ASC"
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching suspected accounts:", error);
    res.status(500).json({
      error: "Failed to fetch suspected accounts",
      message: error.message,
    });
  }
});

// POST /api/data/suspected-accounts - Add new suspected account
router.post("/suspected-accounts", async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        error: "Missing required field: data",
      });
    }

    const [result] = await db.execute(
      "INSERT INTO suspected_accounts (data) VALUES (?)",
      [data]
    );

    res.status(201).json({
      success: true,
      id: result.insertId,
      message: "Suspected account added successfully",
    });
  } catch (error) {
    console.error("Error adding suspected account:", error);
    res.status(500).json({
      error: "Failed to add suspected account",
      message: error.message,
    });
  }
});

// === LOCATIONS ===

// GET /api/data/locations - Get all locations
router.get("/locations", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM locations ORDER BY id ASC");
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching locations:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch locations", message: error.message });
  }
});

// POST /api/data/locations - Add new location
router.post("/locations", async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        error: "Missing required field: data",
      });
    }

    const [result] = await db.execute(
      "INSERT INTO locations (data) VALUES (?)",
      [data]
    );

    res.status(201).json({
      success: true,
      id: result.insertId,
      message: "Location added successfully",
    });
  } catch (error) {
    console.error("Error adding location:", error);
    res
      .status(500)
      .json({ error: "Failed to add location", message: error.message });
  }
});

// === MOCK DATA GENERATION ===

// POST /api/data/generate-mock - Generate mock data for testing
router.post("/generate-mock", async (req, res) => {
  try {
    const { type, count = 5 } = req.body;

    if (!type) {
      return res.status(400).json({
        error:
          "Missing required field: type (scraped-results, dummy-accounts, suspected-accounts, locations, cctv)",
      });
    }

    let results = [];

    switch (type) {
      case "scraped-results":
        results = await generateMockScrapedResults(count);
        break;
      case "dummy-accounts":
        results = await generateMockDummyAccounts(count);
        break;
      case "suspected-accounts":
        results = await generateMockSuspectedAccounts(count);
        break;
      case "locations":
        results = await generateMockLocations(count);
        break;
      case "cctv":
        results = await generateMockCCTV(count);
        break;
      default:
        return res.status(400).json({
          error:
            "Invalid type. Must be one of: scraped-results, dummy-accounts, suspected-accounts, locations, cctv",
        });
    }

    res.json({
      success: true,
      type,
      count: results.length,
      message: `Generated ${results.length} mock ${type}`,
      data: results,
    });
  } catch (error) {
    console.error("Error generating mock data:", error);
    res
      .status(500)
      .json({ error: "Failed to generate mock data", message: error.message });
  }
});

// Helper functions for mock data generation

async function generateMockScrapedResults(count) {
  const results = [];
  const mockAccounts = [
    "@user123",
    "@tester456",
    "@demo789",
    "@sample000",
    "@mock111",
  ];
  const mockPosts = [
    "Just had an amazing day at the park! 🌞 #beautiful #nature",
    "Working late again... but loving what I do! 💻 #developer #passion",
    "Coffee is life ☕ Can't start my day without it #coffee #morning",
    "Weekend vibes! Time to relax and recharge 🏖️ #weekend #relax",
    "New project coming soon! Stay tuned 🚀 #project #excited",
  ];

  for (let i = 0; i < count; i++) {
    const account =
      mockAccounts[Math.floor(Math.random() * mockAccounts.length)];
    const post = mockPosts[Math.floor(Math.random() * mockPosts.length)];

    const mockData = {
      post_content: post,
      likes: Math.floor(Math.random() * 1000),
      shares: Math.floor(Math.random() * 100),
      comments: Math.floor(Math.random() * 50),
      engagement_rate: Math.random(),
      hashtags: ["#mock", "#data", "#test"],
    };

    const [result] = await db.execute(
      "INSERT INTO scraped_result (account, data, url, timestamp) VALUES (?, ?, ?, NOW())",
      [
        account,
        JSON.stringify(mockData),
        `https://example.com/post/${Date.now() + i}`,
      ]
    );

    results.push({
      id: result.insertId,
      account,
      data: mockData,
      url: `https://example.com/post/${Date.now() + i}`,
    });
  }

  return results;
}

async function generateMockDummyAccounts(count) {
  const results = [];
  const platforms = ["instagram", "twitter", "facebook", "tiktok"];

  for (let i = 0; i < count; i++) {
    const username = `dummy_user_${Date.now()}_${i}`;
    const password = `pass${Math.floor(Math.random() * 10000)}`;
    const platform = platforms[Math.floor(Math.random() * platforms.length)];

    const [result] = await db.execute(
      "INSERT INTO dummy_accounts (username, password, platform) VALUES (?, ?, ?)",
      [username, password, platform]
    );

    results.push({
      id: result.insertId,
      username,
      password,
      platform,
    });
  }

  return results;
}

async function generateMockSuspectedAccounts(count) {
  const results = [];

  for (let i = 0; i < count; i++) {
    const accountData = `suspected_account_${Date.now()}_${i}@platform.com`;

    const [result] = await db.execute(
      "INSERT INTO suspected_accounts (data) VALUES (?)",
      [accountData]
    );

    results.push({
      id: result.insertId,
      data: accountData,
    });
  }

  return results;
}

async function generateMockLocations(count) {
  const results = [];
  const cities = [
    "New York",
    "London",
    "Tokyo",
    "Paris",
    "Sydney",
    "Toronto",
    "Berlin",
    "Mumbai",
  ];

  for (let i = 0; i < count; i++) {
    const city = cities[Math.floor(Math.random() * cities.length)];
    const locationData = `${city}, ${Math.random().toFixed(
      6
    )}, ${Math.random().toFixed(6)}`;

    const [result] = await db.execute(
      "INSERT INTO locations (data) VALUES (?)",
      [locationData]
    );

    results.push({
      id: result.insertId,
      data: locationData,
    });
  }

  return results;
}

async function generateMockCCTV(count) {
  const results = [];
  const locations = [
    "Building A Entrance",
    "Parking Lot B",
    "Main Hall",
    "Security Checkpoint",
    "Loading Dock",
  ];

  for (let i = 0; i < count; i++) {
    const name = `CCTV Camera ${Date.now()}_${i}`;
    const location = locations[Math.floor(Math.random() * locations.length)];
    const streamUrl = `rtmp://example.com/stream/${Date.now()}_${i}`;
    const originUrl = `https://camera-interface.com/camera/${Date.now()}_${i}`;

    const [result] = await db.execute(
      "INSERT INTO cctv (name, origin_url, stream_url, location) VALUES (?, ?, ?, ?)",
      [name, originUrl, streamUrl, location]
    );

    results.push({
      id: result.insertId,
      name,
      origin_url: originUrl,
      stream_url: streamUrl,
      location,
    });
  }

  return results;
}

module.exports = router;
