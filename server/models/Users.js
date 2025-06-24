// Model for users table
module.exports = {
  name: "users",
  schema: `
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
  `,
  seed: [
    {
      username: "admin",
      email: "admin@aidashboard.local",
      password: "$2b$10$examplehashedpasswordadmin123456789",
      role: "admin",
    },
    {
      username: "user",
      email: "user@aidashboard.local",
      password: "$2b$10$examplehashedpassworduser1234567890",
      role: "user",
    },
    {
      username: "analyst",
      email: "analyst@aidashboard.local",
      password: "$2b$10$examplehashedpasswordanalyst123456",
      role: "user",
    },
  ],
};
