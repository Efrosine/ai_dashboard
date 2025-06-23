// Model for social_detention_results table
module.exports = {
  name: "social_detention_results",
  schema: `
    id INT AUTO_INCREMENT PRIMARY KEY,
    scraped_id INT NOT NULL,
    data JSON NOT NULL,
    FOREIGN KEY (scraped_id) REFERENCES scraped_data(id) ON DELETE CASCADE
  `,
  seed: [
    {
      scraped_id: 1,
      data: JSON.stringify({
        analysis_type: "violence_detection",
        confidence: 0.85,
        flags: ["potential_violence", "hate_speech"],
        detected_content: "Aggressive language detected",
        risk_level: "high",
      }),
    },
    {
      scraped_id: 2,
      data: JSON.stringify({
        analysis_type: "content_analysis",
        confidence: 0.65,
        flags: ["suspicious_activity"],
        detected_content: "Unusual posting pattern",
        risk_level: "medium",
      }),
    },
  ],
};
