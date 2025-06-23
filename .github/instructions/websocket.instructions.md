## 📡 WebSocket System and API Integration

### Definition

The project integrates a WebSocket system for real-time updates and an HTTP API endpoint for saving scraped social media data. The WebSocket system uses Node.js’s `http` and `ws` modules to enable live updates for CCTV detection results, while the API endpoint allows external services to submit `scraped_result` data.

### Key Components:

- **WebSocket Server**: Handles channel subscriptions and message broadcasting for real-time updates.
- **HTTP API Endpoint**: Accepts POST requests to save `scraped_result` data to the database.
- **Controllers**: Modular logic for WebSocket channels, message handling, and API data processing.
- **Client-Side Integration**: Updates the frontend to receive and display real-time CCTV detection updates.

### Implementation Details

#### WebSocket for CCTV Detection:

- **Server**: A WebSocket server (`server/server.js`) runs alongside the HTTP server, handling subscriptions to a `cctv_updates` channel.
- **Client**: The `frontend/components/liveCCTV.js` component connects to the WebSocket server, subscribes to `cctv_updates`, and dynamically updates the detection history table.
- **Functionality**: When a new detection is recorded in `cctv_detection_results` (via ORM), the server broadcasts the data (e.g., `cctv_id`, `data`, `timestamp`, `snapshoot_url`) to all subscribed clients.
- **Example Client Code** (in `liveCCTV.js`):

```javascript
const socket = new WebSocket("ws://websocket:8080");

socket.onopen = () => {
  socket.send(JSON.stringify({ type: "subscribe", channel: "cctv_updates" }));
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.channel === "cctv_updates") {
    updateDetectionTable(data.message); // Function to append new detection to UI
  }
};
```

#### API Endpoint for Scraped Results:

- **Endpoint**: `POST /api/scraped-result` in `server/server.js`, handled by `controllers/scrapedResult.js`.
- **Functionality**: Accepts JSON payloads with `account`, `data`, `url`, and `timestamp`, saving them to `scraped_result` via the ORM.
- **Example Controller** (`controllers/scrapedResult.js`):

```javascript
const db = require("../db");

async function saveScrapedResult(req, res) {
  const { account, data, url, timestamp } = req.body;
  try {
    await db.query(
      "INSERT INTO scraped_result (account, data, url, timestamp) VALUES (?, ?, ?, ?)",
      [account, data, url, timestamp || new Date()]
    );
    res.status(201).json({ message: "Scraped result saved" });
  } catch (error) {
    res.status(500).json({ error: "Failed to save scraped result" });
  }
}

module.exports = { saveScrapedResult };
```

**File Structure Additions**:

- `server/controllers/channel.js`: Manages WebSocket channel subscriptions and broadcasting.
- `server/controllers/message.js`: Handles WebSocket message processing.
- `server/controllers/scrapedResult.js`: Processes `scraped_result` API requests.
- `server/server.js`: Runs HTTP and WebSocket servers.

**Docker Integration**:

- A `websocket` service is added to `docker-compose.yml` to run `server.js`.
- The frontend connects to `ws://websocket:8080` for WebSocket updates.

**ORM Integration**:

- WebSocket broadcasts use ORM queries to fetch new `cctv_detection_results`.
- The API endpoint uses the ORM’s `db.js` for database operations.

**Package.json Scripts**:

- Added `"start:server": "node server/server.js"` for running the WebSocket and API server.
