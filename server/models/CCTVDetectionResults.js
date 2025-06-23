// Model for cctv_detection_results table
module.exports = {
  name: "cctv_detection_results",
  schema: `
    id INT AUTO_INCREMENT PRIMARY KEY,
    cctv_id INT NOT NULL,
    data TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    snapshoot_url VARCHAR(255),
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
      }),
      snapshoot_url:
        "http://storage.example.com/snapshots/cam1_20240624_120000.jpg",
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
        description: "Loitering detected",
      }),
      snapshoot_url:
        "http://storage.example.com/snapshots/cam2_20240624_120500.jpg",
    },
  ],
};
