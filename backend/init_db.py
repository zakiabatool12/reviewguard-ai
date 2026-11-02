from db import get_connection

SCHEMA = """
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
  CONSTRAINT fk_otps_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
  CONSTRAINT fk_analyses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
"""

conn = get_connection()
cur = conn.cursor()
for stmt in [s.strip() for s in SCHEMA.split(";") if s.strip()]:
    cur.execute(stmt)
conn.commit()
cur.execute("SHOW TABLES")
print("Tables:", [row[0] for row in cur.fetchall()])
conn.close()