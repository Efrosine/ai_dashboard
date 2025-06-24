# Phase 2: Database Design - Documentation

## Overview

Phase 2 focuses on implementing a comprehensive database design for the AI Dashboard monitoring system. This phase includes designing and implementing database schemas, ORM models, migration tools, and testing infrastructure.

## Objectives

- ✅ Design complete database schema based on ERD requirements
- ✅ Implement enhanced ORM models with proper relationships
- ✅ Create migration and seeding tools for database management
- ✅ Establish comprehensive testing framework for database operations
- ✅ Validate data integrity and performance optimization

## Database Schema Design

### Core Tables

#### 1. **users** - User Authentication and Authorization

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
);
```

#### 2. **scraped_data** - Scraping Operation Tracking

```sql
CREATE TABLE scraped_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    input_query VARCHAR(255) NOT NULL,
    query_type ENUM('account', 'location', 'account_list', 'location_list') NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_query_type (query_type),
    INDEX idx_status (status),
    INDEX idx_timestamp (timestamp)
);
```

#### 3. **scraped_result** - Raw Scraped Social Media Data

```sql
CREATE TABLE scraped_result (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account VARCHAR(255) NOT NULL,
    data LONGTEXT NOT NULL,
    url VARCHAR(500),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_account (account),
    INDEX idx_timestamp (timestamp)
);
```

#### 4. **social_detection_results** - AI Analysis Results

```sql
CREATE TABLE social_detection_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scraped_id INT NOT NULL,
    data JSON NOT NULL,
    analysis_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_scraped_id (scraped_id),
    FOREIGN KEY (scraped_id) REFERENCES scraped_data(id) ON DELETE CASCADE
);
```

#### 5. **cctv** - CCTV Camera Management

```sql
CREATE TABLE cctv (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    origin_url VARCHAR(500),
    stream_url VARCHAR(500) NOT NULL,
    location VARCHAR(255) NOT NULL,
    status ENUM('online', 'offline', 'maintenance') DEFAULT 'online',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_location (location),
    INDEX idx_status (status)
);
```

#### 6. **cctv_detection_results** - AI CCTV Detection Data

```sql
CREATE TABLE cctv_detection_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cctv_id INT NOT NULL,
    data TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    snapshoot_url VARCHAR(500),
    INDEX idx_cctv_id (cctv_id),
    INDEX idx_timestamp (timestamp),
    FOREIGN KEY (cctv_id) REFERENCES cctv(id) ON DELETE CASCADE
);
```

### Configuration Tables

#### 7. **locations** - Target Monitoring Locations

```sql
CREATE TABLE locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    data VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_data (data)
);
```

#### 8. **suspected_accounts** - Monitored Social Media Accounts

```sql
CREATE TABLE suspected_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    data VARCHAR(255) NOT NULL,
    platform ENUM('instagram', 'x', 'tiktok') DEFAULT 'instagram',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_data (data),
    INDEX idx_platform (platform)
);
```

#### 9. **dummy_accounts** - Scraping Operation Accounts

```sql
CREATE TABLE dummy_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    platform ENUM('instagram', 'x', 'tiktok') NOT NULL,
    notes TEXT,
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_account (username, platform),
    INDEX idx_platform (platform),
    INDEX idx_status (status)
);
```

### Junction Table

#### 10. **scraped_data_result** - Many-to-Many Relationship

```sql
CREATE TABLE scraped_data_result (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_data INT NOT NULL,
    id_result INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_data) REFERENCES scraped_data(id) ON DELETE CASCADE,
    FOREIGN KEY (id_result) REFERENCES scraped_result(id) ON DELETE CASCADE,
    UNIQUE KEY unique_mapping (id_data, id_result)
);
```

## Schema Updates and Corrections

During Phase 2 implementation, several schema corrections were made to optimize the database design:

### Key Schema Changes

1. **Table Name Correction**

   - Changed `social_detention_results` to `social_detection_results`
   - Fixed typo for better semantic clarity

2. **Removed Unnecessary Foreign Key**

   - Removed `scraped_data_id` from `scraped_result` table
   - Relationship managed through `scraped_data_result` junction table

3. **Platform Enum Optimization**

   - Updated `suspected_accounts` and `dummy_accounts` platform enum
   - Removed unused platforms (twitter, facebook, linkedin)
   - Kept only: `instagram`, `x`, `tiktok`

4. **Column Cleanup in Social Detection Results**

   - Removed `violence_detected` and `confidence` columns
   - Simplified to use JSON data field for analysis results

5. **Column Cleanup in CCTV Detection Results**
   - Removed `confidence` and `detection_type` columns
   - Moved these to JSON data field for consistency

### Benefits of Changes

- **Consistency**: All AI analysis data stored in JSON format
- **Flexibility**: JSON fields allow for evolving data structures
- **Simplicity**: Reduced redundant columns and relationships
- **Performance**: Optimized foreign key relationships
- **Maintainability**: Cleaner schema with focused responsibilities

## ORM Implementation

### Model Structure

Each model follows a consistent structure:

```javascript
module.exports = {
  name: "table_name",
  schema: `SQL_SCHEMA_DEFINITION`,
  seed: [
    /* SEED_DATA_ARRAY */
  ],
};
```

### Key Features

- **Foreign Key Support**: Proper relationship definitions with cascade options
- **Index Optimization**: Strategic indexes on frequently queried columns
- **Data Validation**: ENUM constraints for controlled values
- **JSON Support**: Native JSON data type for complex analysis results
- **Timestamp Tracking**: Automatic timestamp management for audit trails

## Migration System

### Migrator Class Features

- **Sequential Migration**: Respects foreign key dependencies
- **Rollback Support**: Clean database rollback functionality
- **Table Status Checking**: Validation of table existence
- **Error Handling**: Comprehensive error reporting and recovery

### Usage Examples

```javascript
const migrator = new Migrator();

// Create all tables
await migrator.migrateUp();

// Drop all tables (reverse order)
await migrator.migrateDown();

// Full flush (drop and recreate)
await migrator.flush();

// Check table status
const status = await migrator.getTableStatus();
```

## Seeding System

### Seeder Class Features

- **Dependency-Aware Seeding**: Seeds tables in correct order
- **Data Validation**: JSON serialization for complex objects
- **Bulk Operations**: Efficient batch insertion
- **Clear and Reseed**: Full data reset capabilities

### Sample Seed Data

- **Users**: Admin and regular user accounts with hashed passwords
- **CCTV**: Multiple cameras with different statuses and locations
- **Social Media**: Realistic scraped post data with metadata
- **AI Results**: Sample detection and analysis results
- **Configuration**: Target locations and suspected accounts

## Testing Framework

### Test Categories

#### 1. **Environment Tests**

- Database connection validation
- Schema accessibility verification
- Configuration validation

#### 2. **Schema Validation**

- Model definition integrity
- Foreign key relationship validation
- Index verification

#### 3. **Migration Tests**

- Table creation success
- Structure verification
- Constraint validation

#### 4. **Data Operations**

- CRUD operation testing
- Foreign key relationship handling
- JSON data integrity

#### 5. **Performance Tests**

- Query performance on indexed columns
- Index utilization verification
- Response time validation

### Test Results Format

```json
{
  "timestamp": "2025-06-24T12:00:00.000Z",
  "phase": "Phase 2 - Database Design",
  "tests": [
    {
      "name": "Test Name",
      "status": "passed|failed",
      "duration": 123,
      "message": "Success/Error message"
    }
  ],
  "summary": {
    "total": 15,
    "passed": 14,
    "failed": 1
  }
}
```

## Performance Optimization

### Indexing Strategy

- **Primary Keys**: Auto-increment integers for optimal performance
- **Foreign Keys**: Indexed for join operation efficiency
- **Query Columns**: Strategic indexes on frequently filtered columns
- **Timestamp Indexes**: Optimized for time-based queries

### Data Types

- **VARCHAR Sizing**: Appropriate lengths based on usage patterns
- **JSON Fields**: Native JSON for complex nested data
- **DECIMAL Precision**: Accurate confidence score storage
- **ENUM Constraints**: Controlled vocabulary for status fields

## Database Relationships

### Entity Relationship Diagram

```
locations ──┐
           │
suspected_accounts ──┐
                    │
users              │
                   │
dummy_accounts     │
                   │
scraped_data ──────┴─── scraped_result
    │
    │
    └── social_detection_results
scraped_data_result ─────────┘

cctv ─── cctv_detection_results
```

### Key Relationships

- **One-to-Many**: scraped_data → social_detection_results
- **One-to-Many**: cctv → cctv_detection_results
- **Many-to-Many**: scraped_data ↔ scraped_result (via scraped_data_result)
- **Independent Tables**: locations, suspected_accounts, dummy_accounts, users

## Error Handling

### Migration Errors

- Foreign key constraint violations
- Duplicate table creation attempts
- Invalid schema definitions
- Connection failures

### Seeding Errors

- Foreign key reference failures
- Data type mismatches
- JSON serialization issues
- Duplicate key violations

### Recovery Strategies

- Automatic rollback on migration failures
- Transaction-based seeding operations
- Comprehensive error logging
- Status validation before operations

## Security Considerations

### Password Storage

- Hashed passwords using bcrypt
- No plain text password storage
- Salt-based hashing for enhanced security

### SQL Injection Prevention

- Parameterized queries throughout
- Input validation in ORM layer
- Escaped identifiers and values

### Data Access Control

- Role-based access control foundation
- User privilege separation
- Audit trail via timestamps

## Monitoring and Maintenance

### Health Checks

- Connection pool monitoring
- Table existence verification
- Foreign key constraint validation
- Index performance tracking

### Maintenance Operations

- Database cleanup procedures
- Performance optimization queries
- Index maintenance scripts
- Backup and restore procedures

## Next Steps (Phase 3)

1. Frontend implementation using enhanced database schema
2. API endpoints for data access and manipulation
3. Real-time WebSocket integration for live updates
4. User interface components for data visualization
5. Integration testing with complete data flow

## Conclusion

Phase 2 successfully establishes a robust, scalable, and well-tested database foundation for the AI Dashboard system. The implementation includes comprehensive schema design, efficient ORM tooling, and thorough testing coverage to ensure data integrity and performance optimization.
