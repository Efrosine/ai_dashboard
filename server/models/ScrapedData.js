// Model for scraped_data table
module.exports = {
  name: "scraped_data",
  schema: `
    id INT AUTO_INCREMENT PRIMARY KEY,
    input_query VARCHAR(255) NOT NULL,
    query_type ENUM('account', 'location', 'account_list', 'location_list') NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_query_type (query_type),
    INDEX idx_status (status),
    INDEX idx_timestamp (timestamp)
  `,
  seed: [
    {
      input_query: "@test_user_01",
      query_type: "account",
      status: "completed",
    },
    {
      input_query: "New York City, Times Square",
      query_type: "location",
      status: "completed",
    },
    {
      input_query: "suspected_accounts_list",
      query_type: "account_list",
      status: "pending",
    },
    {
      input_query: "target_locations_list",
      query_type: "location_list",
      status: "processing",
    },
  ],
};
