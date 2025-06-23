# 🧭 Use Case Overview: Monitoring & Configuration Web Dashboard

## 🎯 Objective

To build a **monitoring and configuration web dashboard** using **Vanilla HTML, CSS, JavaScript** in a **Dockerized environment** (no API Gateway), focused on two main functionalities:

1. **Social Media Scraper**
2. **AI CCTV Detection**

---

## 🌟 Project Technologies

- **Frontend**: Vanilla HTML, JavaScript, Tailwind CSS (utility-first CSS framework)
- **Backend/Integration**: n8n (workflow automation), Gemini (AI analysis via API)
- **Database**: MySQL
- **ORM**: Lightweight custom ORM (using `mysql2/promise`)
- **WebSocket**: Node.js `http` and `ws` modules for real-time updates
- **Containerization**: Docker, Docker Compose
- **Package Manager**: npm (for frontend tooling, ORM scripts, and WebSocket server)
- **Testing**: Mocha and Chai for unit and integration tests

---

## 📁 File Structure (1 File = 1 Main Function)

```
project-root/
├── docker-compose.yml
├── Dockerfile
├── .env
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   ├── components/
│   │   ├── liveCCTV.js
│   │   ├── analysisResult.js
│   │   ├── dummyAccountForm.js
│   │   └── locationList.js
│   └── utils/
│       ├── api.js
│       └── helper.js
├── server/
│   ├── models/
│   │   ├── ScrapedData.js
│   │   ├── ScrapedResult.js
│   │   ├── SuspectedAccounts.js
│   │   ├── Locations.js
│   │   ├── SocialDetentionResults.js
│   │   ├── CCTV.js
│   │   ├── CCTVDetectionResults.js
│   │   ├── DummyAccounts.js
│   │   ├── Users.js
│   │   └── index.js
│   ├── orm/
│   │   ├── migrator.js
│   │   └── seeder.js
│   ├── controllers/
│   │   ├── channel.js
│   │   ├── message.js
│   │   └── scrapedResult.js
│   ├── db.js
│   ├── migrate.js
│   ├── seed.js
│   ├── server.js
│   └── .env
├── test/
│   ├── phase1/
│   │   ├── environment.test.js
│   │   └── results.json
│   ├── phase2/
│   │   ├── database.test.js
│   │   └── results.json
│   ├── phase3/
│   │   ├── frontend.test.js
│   │   └── results.json
│   ├── phase4/
│   │   ├── integration.test.js
│   │   └── results.json
│   ├── phase5/
│   │   ├── workflow.test.js
│   │   └── results.json
│   ├── phase6/
│   │   ├── finalization.test.js
│   │   └── results.json
│   └── docs/
│       ├── phase1.md
│       ├── phase2.md
│       ├── phase3.md
│       ├── phase4.md
│       ├── phase5.md
│       └── phase6.md
├── sql/
│   └── schema.sql
└── README.md
```

---

## 🧩 Main Features

### 1️⃣ Social Media Scraper

**Purpose**: To monitor and analyze scraped social media data for detecting problematic content (e.g., violence).

**Functions**:

- Admin can select scraping modes:
  - Single account
  - Single location
  - List of accounts (`suspected_accounts`)
  - List of locations (`locations`)
- Results are saved in `scraped_result` via an API endpoint
- Analyze button triggers n8n → Gemini → stores JSON result in `social_detention_results`
- Users view analyzed posts flagged with violent indicators + metadata

**Related Tables**:

- `scraped_data`
- `scraped_result`
- `suspected_accounts`
- `locations`
- `social_detention_results`

### 2️⃣ AI CCTV Detection

**Purpose**: To show live CCTV streams and AI-based historical detection results, with real-time updates via WebSocket.

**Functions**:

- Admin can add new CCTV (`cctv`)
- Each camera displays:
  - Live stream (MJPEG) via `stream_url`
  - History table from `cctv_detection_results`:
    - Timestamp
    - Detection data
    - Snapshoot URL
- Real-time detection updates pushed to the dashboard via WebSocket

**Related Tables**:

- `cctv`
- `cctv_detection_results`

---

## 🧱 Access Privileges

| Role  | Permissions                                                                |
| ----- | -------------------------------------------------------------------------- |
| Admin | - Add & manage: dummy accounts, CCTV cameras, target locations & accounts  |
|       | - Trigger scraping & analysis                                              |
| User  | - View social media analysis results                                       |
|       | - View CCTV live streams & AI detection history (real-time and historical) |

---

## 📌 User Flow Summary

### Admin Flow:

- Add dummy accounts, suspected accounts, locations, CCTV cameras
- Initiate scraping based on accounts/locations/list
- Click Analyze → triggers n8n → Gemini analysis saved to DB
- Monitor CCTV live feeds and detection logs (real-time via WebSocket)

### User Flow:

- View flagged social media content
- Watch CCTV live streams
- Check historical and real-time detections per camera

---

## ⚙️ Technical Architecture

- **Frontend**: Vanilla HTML / CSS / JS
- **Backend/Integration**: n8n, Gemini API, lightweight ORM for database interactions, WebSocket server for real-time updates, HTTP API for data submission
- **Direct API Access** (no API Gateway)
- **Dockerized**:
  - Frontend dashboard
  - Server (ORM, WebSocket, and API endpoints)
  - External scraping & analysis service
  - MySQL database
- **Testing**: Mocha and Chai for unit and integration tests, with results stored in JSON files

---

## 📊 Database Diagram

```mermaid
erDiagram
    scraped_data_result }o--|| scraped_data : references
    scraped_data_result }o--|| scraped_result : references
    cctv_detection_results }o--|| cctv : references
    social_detention_results ||--|| scraped_data : references

    locations {
        INTEGER id
        VARCHAR(255) data
    }

    suspected_accounts {
        INTEGER id
        VARCHAR(255) data
    }

    dummy_accounts {
        INTEGER id
        VARCHAR(255) username
        VARCHAR(255) password
        ENUM platform
    }

    users {
        INTEGER id
        VARCHAR(255) username
        VARCHAR(255) email
        VARCHAR(255) password
        ENUM role
    }

    scraped_result {
        INTEGER id
        VARCHAR(255) account
        LONGTEXT(65535) data
        VARCHAR(255) url
        TIMESTAMP timestamp
    }

    cctv {
        INTEGER id
        VARCHAR(255) name
        VARCHAR(255) origin_url
        VARCHAR(255) stream_url
        VARCHAR(255) location
    }

    scraped_data {
        INTEGER id
        VARCHAR(255) input_query
        TIMESTAMP timestamp
    }

    scraped_data_result {
        INTEGER id
        INTEGER id_data
        INTEGER id_result
    }

    cctv_detection_results {
        INTEGER id
        IN INTEGER cctv_id
        TEXT(65535) data
        TIMESTAMP timestamp
        VARCHAR(255) snapshoot_url
    }

    social_detention_results {
        INTEGER id
        INTEGER scraped_id
        JSON data
    }
```

---

## ✅ Development Phases

### Phase 1: Environment Setup

**Tasks**:

- Install Docker & Docker Compose
- Set up MySQL container
- Create Dockerfile for frontend and server (ORM, WebSocket, API)
- Configure `docker-compose.yml` to include frontend, server, and database services

**Testing**:

- **File**: `test/phase1/environment.test.js`
- **Tests**: Verify Docker containers start correctly, MySQL is accessible, and server runs without errors.
- **Results**: Stored in `test/phase1/results.json`

**Documentation**: `test/docs/phase1.md` describes test setup, execution, and outcomes.

### Phase 2: Database Design

**Tasks**:

- Define ORM models (e.g., `ScrapedData.js`, `CCTV.js`) based on ERD
- Write `schema.sql` as a fallback reference
- Run `npm run migrate` to create tables
- Prepare seed data using `npm run seed`

**Testing**:

- **File**: `test/phase2/database.test.js`
- **Tests**: Validate table creation, schema accuracy, and seed data insertion.
- **Results**: Stored in `test/phase2/results.json`

**Documentation**: `test/docs/phase2.md` details test cases and database validation results.

### Phase 3: Frontend Implementation

**Tasks**:

- Build HTML/CSS layout
- Implement modular JS components (1 file = 1 function)
- Create dynamic rendering for results, CCTV feeds, and real-time WebSocket updates
- Update `liveCCTV.js` to handle WebSocket messages for detection updates

**Testing**:

- **File**: `test/phase3/frontend.test.js`
- **Tests**: Verify UI rendering, component functionality, and WebSocket message handling.
- **Results**: Stored in `test/phase3/results.json`

**Documentation**: `test/docs/phase3.md` outlines frontend test scenarios and results.

### Phase 4: Integration

**Tasks**:

- Link frontend to n8n, Gemini, MySQL (via ORM), and WebSocket server
- Implement API endpoint in `server/controllers/scrapedResult.js` for saving `scraped_result`
- Test WebSocket connections and message broadcasting
- Test ORM queries and API endpoints for data retrieval and storage

**Testing**:

- **File**: `test/phase4/integration.test.js`
- **Tests**: Validate API endpoint responses, WebSocket broadcasts, and ORM query execution.
- **Results**: Stored in `test/phase4/results.json`

**Documentation**: `test/docs/phase4.md` describes integration test cases and outcomes.

### Phase 5: Testing & Validation

**Tasks**:

- Test full Admin & User workflows
- Validate accuracy of scraped & detected data
- Verify ORM migration, seeding, WebSocket updates, and API endpoint functionality

**Testing**:

- **File**: `test/phase5/workflow.test.js`
- **Tests**: Simulate Admin and User workflows, verify data accuracy, and test real-time updates.
- **Results**: Stored in `test/phase5/results.json`

**Documentation**: `test/docs/phase5.md` details end-to-end workflow tests and validation results.

### Phase 6: Finalization

**Tasks**:

- UI/UX polish
- Optimize Docker configurations for frontend and server
- Add documentation (README, setup guide, ORM, and WebSocket usage)

**Testing**:

- **File**: `test/phase6/finalization.test.js`
- **Tests**: Verify UI responsiveness, Docker performance, and documentation completeness.
- **Results**: Stored in `test/phase6/results.json`

**Documentation**: `test/docs/phase6.md` summarizes finalization tests and project completion status.
