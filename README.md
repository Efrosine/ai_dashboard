# 🤖 AI Dashboard - Monitoring & Configuration System

A comprehensive web dashboard for monitoring social media content and AI-powered CCTV detection, built with vanilla HTML/CSS/JavaScript and containerized with Docker.

## 🎯 Overview

The AI Dashboard provides two main functionalities:

1. **Social Media Scraper** - Monitor and analyze social media content for problematic material
2. **AI CCTV Detection** - Real-time CCTV monitoring with AI-powered detection alerts

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for development)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ai_dashboard
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the application**

   ```bash
   docker-compose up -d
   ```

4. **Access the dashboard**

   - Frontend: http://localhost
   - API: http://localhost:3000
   - WebSocket: ws://localhost:8080
   - phpMyAdmin: http://localhost:8081

5. **Database Access (phpMyAdmin)**
   - Server: mysql
   - Username: dashboard_user
   - Password: dashboard_pass123
   - Database: ai_dashboard

## 🏗️ Architecture

### Technology Stack

- **Frontend**: Vanilla HTML/CSS/JavaScript with daisyUI and Tailwind CSS
- **Backend**: Node.js with Express and WebSocket
- **Database**: MySQL 8.0
- **Containerization**: Docker and Docker Compose
- **Testing**: Mocha and Chai

### Project Structure

```
├── docker-compose.yml          # Multi-service orchestration
├── Dockerfile.server           # Backend container
├── Dockerfile.frontend         # Frontend container
├── nginx.conf                  # Reverse proxy configuration
├── package.json                # Node.js dependencies
├── frontend/                   # Frontend application
│   ├── index.html             # Main dashboard interface
│   ├── style.css              # Custom styling
│   ├── script.js              # Main application logic
│   ├── components/            # Modular components
│   │   ├── liveCCTV.js        # CCTV feed management
│   │   ├── analysisResult.js  # Analysis results display
│   │   ├── dummyAccountForm.js # Account management
│   │   └── locationList.js    # Location management
│   └── utils/                 # Utility functions
│       ├── api.js             # API communication
│       └── helper.js          # Common utilities
├── server/                     # Backend application
│   ├── server.js              # Main server file
│   ├── db.js                  # Database connection
│   ├── controllers/           # API controllers
│   │   ├── scrapedResult.js   # Scraped data management
│   │   ├── message.js         # WebSocket messaging
│   │   └── channel.js         # Channel management
├── sql/                       # Database schema
│   └── schema.sql             # Table definitions
└── test/                      # Testing framework
    ├── phase1/                # Phase 1 tests
    └── docs/                  # Test documentation
```

## 🔧 Development

### Running Tests

```bash
# Run all tests
npm test

# Run specific phase tests
npm run test:phase1
npm run test:phase2
# ... etc
```

### Development Mode

```bash
# Start in development mode with hot reload
npm run dev
```

### Environment Variables

```env
# Database Configuration
MYSQL_ROOT_PASSWORD=rootpassword123
MYSQL_DATABASE=ai_dashboard
MYSQL_USER=dashboard_user
MYSQL_PASSWORD=dashboard_pass123

# Server Configuration
NODE_ENV=development
API_PORT=3000
WEBSOCKET_PORT=8080

# External APIs (to be configured)
GEMINI_API_KEY=your_gemini_api_key_here
N8N_WEBHOOK_URL=your_n8n_webhook_url_here
```

## 📊 Features

### Social Media Monitoring

- **Scraping Control**: Configure target accounts and locations
- **Analysis Results**: View AI-analyzed content with violence detection
- **Account Management**: Manage dummy accounts for scraping operations
- **Real-time Updates**: Live notifications for new analysis results

### CCTV Monitoring

- **Live Feeds**: Display multiple camera streams
- **AI Detection**: Real-time detection alerts with confidence scores
- **History Tracking**: View historical detection events
- **Camera Management**: Add and configure CCTV cameras

### Admin Panel

- **User Management**: Control access and permissions
- **System Configuration**: Manage global settings
- **Target Management**: Configure monitoring locations and accounts
- **Real-time Status**: Monitor system health and activity

## 🔌 API Reference

### Health Check

```http
GET /api/health
```

### Scraped Results

```http
GET /api/scraped-results          # Get all results
GET /api/scraped-results/:id      # Get specific result
POST /api/scraped-results         # Save new result
```

### WebSocket Messaging

```http
POST /api/messages               # Broadcast WebSocket message
```

### Channels

```http
GET /api/channels                # Get available channels
```

## 🔄 WebSocket Events

### Connection Events

- `connection` - Client connected
- `echo` - Message echo for testing

### Detection Events

- `cctv_detection` - New CCTV detection alert
- `social_analysis` - Social media analysis result
- `system_status` - System status update

## 🗄️ Database Schema

### Core Tables

- **users** - Dashboard user accounts
- **locations** - Target monitoring locations
- **suspected_accounts** - Accounts under surveillance
- **dummy_accounts** - Scraping account credentials

### Data Tables

- **scraped_data** - Scraping operation tracking
- **scraped_result** - Raw scraped content
- **social_detention_results** - AI analysis results

### CCTV Tables

- **cctv** - Camera configuration
- **cctv_detection_results** - Detection events

## 🧪 Testing

The project includes a comprehensive testing framework organized by development phases:

- **Phase 1**: Environment setup validation
- **Phase 2**: Database and ORM testing
- **Phase 3**: Frontend component testing
- **Phase 4**: Integration testing
- **Phase 5**: Workflow validation
- **Phase 6**: Final system testing

## 🚦 Development Phases

### ✅ Phase 1: Environment Setup

- Docker containerization
- Basic server and frontend structure
- WebSocket communication
- Testing framework

### 🔄 Phase 2: Database Design (Next)

- ORM implementation
- Database migrations
- Seed data
- Model definitions

### 📅 Future Phases

- Frontend implementation
- API integration
- Testing & validation
- Production deployment

## 🔐 Security Considerations

- Environment variable management
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Secure WebSocket connections

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📞 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation in `/test/docs/`

---

**Current Status**: Phase 1 Complete ✅
**Next Milestone**: Phase 2 - Database Implementation
