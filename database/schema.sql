CREATE DATABASE IF NOT EXISTS reviewguard_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE reviewguard_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_verified TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_otps (
  user_id INT PRIMARY KEY,
  otp_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  attempts TINYINT NOT NULL DEFAULT 0,
  last_sent_at DATETIME NOT NULL,
  CONSTRAINT fk_otps_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS analyses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  review_text TEXT NOT NULL,
  rating TINYINT NULL,
  predicted_label VARCHAR(20) NOT NULL,
  confidence_score DECIMAL(5,4) NOT NULL,
  signals_json TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_created (user_id, created_at),
  CONSTRAINT fk_analyses_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);