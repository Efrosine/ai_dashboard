-- AI Dashboard Database Schema
-- This file serves as a reference for the database structure
-- The actual tables will be created by the ORM migrator in Phase 2

-- Create database (handled by Docker)
-- CREATE DATABASE IF NOT EXISTS ai_dashboard;
-- USE ai_dashboard;

-- Locations table for monitoring target locations
CREATE TABLE IF NOT EXISTS locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    data VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_data (data)
);

-- Suspected accounts table for monitoring specific social media accounts
CREATE TABLE IF NOT EXISTS suspected_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    data VARCHAR(255) NOT NULL,
    platform ENUM('twitter', 'instagram', 'facebook', 'tiktok', 'linkedin') DEFAULT 'twitter',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_data (data),
    INDEX idx_platform (platform)
);

-- Dummy accounts table for scraping operations
CREATE TABLE IF NOT EXISTS dummy_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    platform ENUM('twitter', 'instagram', 'facebook', 'tiktok', 'linkedin') NOT NULL,
    notes TEXT,
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_account (username, platform),
    INDEX idx_platform (platform),
    INDEX idx_status (status)
);

-- Users table for dashboard authentication
CREATE TABLE IF NOT EXISTS users (
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

-- Scraped data tracking table
CREATE TABLE IF NOT EXISTS scraped_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    input_query VARCHAR(255) NOT NULL,
    query_type ENUM('account', 'location', 'account_list', 'location_list') NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_query_type (query_type),
    INDEX idx_status (status),
    INDEX idx_timestamp (timestamp)
);

-- Scraped results table for storing raw scraped social media data
CREATE TABLE IF NOT EXISTS scraped_result (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account VARCHAR(255) NOT NULL,
    data LONGTEXT NOT NULL,
    url VARCHAR(500),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    scraped_data_id INT,
    INDEX idx_account (account),
    INDEX idx_timestamp (timestamp),
    FOREIGN KEY (scraped_data_id) REFERENCES scraped_data(id) ON DELETE SET NULL
);

-- Junction table for many-to-many relationship between scraped_data and scraped_result
CREATE TABLE IF NOT EXISTS scraped_data_result (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_data INT NOT NULL,
    id_result INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_data) REFERENCES scraped_data(id) ON DELETE CASCADE,
    FOREIGN KEY (id_result) REFERENCES scraped_result(id) ON DELETE CASCADE,
    UNIQUE KEY unique_mapping (id_data, id_result)
);

-- CCTV cameras table for managing camera feeds
CREATE TABLE IF NOT EXISTS cctv (
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

-- CCTV detection results table for AI detection data
CREATE TABLE IF NOT EXISTS cctv_detection_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cctv_id INT NOT NULL,
    data TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    snapshoot_url VARCHAR(500),
    confidence DECIMAL(3,2),
    detection_type VARCHAR(100),
    INDEX idx_cctv_id (cctv_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_detection_type (detection_type),
    FOREIGN KEY (cctv_id) REFERENCES cctv(id) ON DELETE CASCADE
);

-- Social media analysis results table for Gemini AI analysis
CREATE TABLE IF NOT EXISTS social_detention_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scraped_id INT NOT NULL,
    data JSON NOT NULL,
    analysis_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    violence_detected BOOLEAN DEFAULT FALSE,
    confidence DECIMAL(3,2),
    INDEX idx_scraped_id (scraped_id),
    INDEX idx_violence_detected (violence_detected),
    INDEX idx_confidence (confidence),
    FOREIGN KEY (scraped_id) REFERENCES scraped_data(id) ON DELETE CASCADE
);

-- Insert default admin user (password should be hashed in production)
INSERT IGNORE INTO users (username, email, password, role) VALUES 
('admin', 'admin@aidashboard.local', '$2b$10$example_hashed_password', 'admin'),
('user', 'user@aidashboard.local', '$2b$10$example_hashed_password', 'user');

-- Insert sample CCTV cameras for testing
INSERT IGNORE INTO cctv (name, stream_url, location, status) VALUES 
('Front Entrance', 'https://picsum.photos/640/360?random=1', 'Building A - Main Door', 'online'),
('Parking Area', 'https://picsum.photos/640/360?random=2', 'Building A - Parking Lot', 'online'),
('Reception Area', 'https://picsum.photos/640/360?random=3', 'Building B - Reception', 'offline');

-- Insert sample locations for testing
INSERT IGNORE INTO locations (data) VALUES 
('New York City, Times Square'),
('Los Angeles, Hollywood Boulevard'),
('Chicago, Millennium Park');

-- Insert sample suspected accounts for testing
INSERT IGNORE INTO suspected_accounts (data, platform) VALUES 
('@suspicious_user_01', 'twitter'),
('@potential_threat_ig', 'instagram'),
('@watch_this_account', 'facebook');
