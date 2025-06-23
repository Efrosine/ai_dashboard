// Model for users table
module.exports = {
  name: "users",
  schema: `
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user'
  `,
  seed: [
    {
      username: "admin",
      email: "admin@aidashboard.com",
      password: "hashed_admin_password",
      role: "admin",
    },
    {
      username: "user1",
      email: "user1@aidashboard.com",
      password: "hashed_user_password_1",
      role: "user",
    },
    {
      username: "analyst",
      email: "analyst@aidashboard.com",
      password: "hashed_analyst_password",
      role: "user",
    },
  ],
};
