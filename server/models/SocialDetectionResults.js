// filepath: /home/efrosine/Desktop/project/ai_dashboard/server/models/SocialDetectionResults.js
// Model for social_detection_results table
module.exports = {
  name: "social_detection_results",
  schema: `
    id INT AUTO_INCREMENT PRIMARY KEY,
    scraped_id INT NOT NULL,
    data JSON NOT NULL,
    analysis_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_scraped_id (scraped_id),
    FOREIGN KEY (scraped_id) REFERENCES scraped_data(id) ON DELETE CASCADE
  `,
  seed: [
    {
      scraped_id: 1,
      data: JSON.stringify({
        analysis_type: "violence_detection",
        confidence: 0.85,
        flags: ["potential_violence", "aggressive_language"],
        detected_content: "Aggressive language and potential threat indicators detected",
        risk_level: "high",
        keywords: ["fight", "attack", "violence"],
        sentiment: "negative",
        recommended_action: "immediate_review"
      })
    },
    {
      scraped_id: 2,
      data: JSON.stringify({
        analysis_type: "content_analysis",
        confidence: 0.65,
        flags: ["suspicious_activity", "unusual_posting"],
        detected_content: "Unusual posting pattern with location-specific content",
        risk_level: "medium", 
        keywords: ["protest", "gathering", "downtown"],
        sentiment: "neutral",
        recommended_action: "monitor"
      })
    }
  ],
};
