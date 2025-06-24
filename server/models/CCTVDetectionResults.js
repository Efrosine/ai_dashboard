// Model for cctv_detection_results table
module.exports = {
  name: "cctv_detection_results",
  schema: `
    id INT AUTO_INCREMENT PRIMARY KEY,
    cctv_id INT NOT NULL,
    data TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    snapshoot_url VARCHAR(500),
    INDEX idx_cctv_id (cctv_id),
    INDEX idx_timestamp (timestamp),
    FOREIGN KEY (cctv_id) REFERENCES cctv(id) ON DELETE CASCADE
  `,
  seed: [
    {
      cctv_id: 1,
      data: JSON.stringify({
        detection_type: "person_detection",
        confidence: 0.92,
        objects: [
          { type: "person", bbox: [100, 150, 200, 350], confidence: 0.92 },
          { type: "vehicle", bbox: [300, 200, 500, 400], confidence: 0.78 },
        ],
        alert_level: "normal",
        description: "Normal foot traffic at entrance",
      }),
      snapshoot_url: "https://picsum.photos/640/360?random=101",
    },
    {
      cctv_id: 2,
      data: JSON.stringify({
        detection_type: "suspicious_activity",
        confidence: 0.75,
        objects: [
          { type: "person", bbox: [50, 100, 150, 300], confidence: 0.88 },
        ],
        alert_level: "medium",
        description: "Loitering detected in parking area",
      }),
      snapshoot_url: "https://picsum.photos/640/360?random=102",
    },
    {
      cctv_id: 1,
      data: JSON.stringify({
        detection_type: "crowd_detection",
        confidence: 0.89,
        objects: [
          { type: "person", bbox: [80, 120, 180, 320], confidence: 0.91 },
          { type: "person", bbox: [200, 140, 300, 340], confidence: 0.87 },
          { type: "person", bbox: [320, 160, 420, 360], confidence: 0.84 },
        ],
        alert_level: "high",
        description: "Crowd gathering detected at main entrance",
      }),
      snapshoot_url: "https://picsum.photos/640/360?random=103",
    },
    {
      cctv_id: 3,
      data: JSON.stringify({
        detection_type: "no_detection",
        confidence: 0.95,
        objects: [],
        alert_level: "normal",
        description: "Area clear, no activity detected",
      }),
      snapshoot_url: "https://picsum.photos/640/360?random=104",
    },
  ],
};
