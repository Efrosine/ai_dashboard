// Model for scraped_data table
module.exports = {
  name: "scraped_data",
  schema: `
    id INT AUTO_INCREMENT PRIMARY KEY,
    input_query VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  `,
  seed: [
    { input_query: "test_query_1" },
    { input_query: "test_query_2" },
    { input_query: "social_media_scrape_location_nyc" },
    { input_query: "instagram_account_monitoring" },
  ],
};
