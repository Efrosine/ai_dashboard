// Model for cctv table
module.exports = {
  name: "cctv",
  schema: `
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
  `,
  seed: [
    {
      name: "Front Entrance",
      origin_url: "https://picsum.photos/640/360?random=1",
      stream_url: "https://picsum.photos/640/360?random=1",
      location: "Building A - Main Door",
      status: "online",
    },
    {
      name: "Parking Area",
      origin_url: "https://picsum.photos/640/360?random=2",
      stream_url: "https://picsum.photos/640/360?random=2",
      location: "Building A - Parking Lot",
      status: "online",
    },
    {
      name: "Reception Area",
      origin_url: "https://picsum.photos/640/360?random=3",
      stream_url: "https://picsum.photos/640/360?random=3",
      location: "Building B - Reception",
      status: "offline",
    },
    {
      name: "Emergency Exit",
      origin_url: "https://picsum.photos/640/360?random=4",
      stream_url: "https://picsum.photos/640/360?random=4",
      location: "Building A - Emergency Exit",
      status: "maintenance",
    },
  ],
};
