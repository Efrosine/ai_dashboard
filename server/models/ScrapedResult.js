// Model for scraped_result table
module.exports = {
  name: "scraped_result",
  schema: `
    id INT AUTO_INCREMENT PRIMARY KEY,
    account VARCHAR(255) NOT NULL,
    data LONGTEXT NOT NULL,
    url VARCHAR(500),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_account (account),
    INDEX idx_timestamp (timestamp)
  `,
  seed: [
    {
      account: "@test_user_01",
      data: JSON.stringify({
        post_id: "123456789",
        content: "This is a test post about current events in the city",
        likes: 45,
        shares: 12,
        comments: 8,
        hashtags: ["#news", "#city", "#update"],
        location: "New York, NY",
      }),
      url: "https://twitter.com/test_user_01/status/123456789",
    },
    {
      account: "@news_source_official",
      data: JSON.stringify({
        post_id: "987654321",
        content: "Breaking: Major development in downtown area",
        likes: 120,
        shares: 34,
        comments: 28,
        hashtags: ["#breaking", "#news", "#downtown"],
        location: "Times Square, NY",
      }),
      url: "https://twitter.com/news_source_official/status/987654321",
    },
    {
      account: "@local_reporter",
      data: JSON.stringify({
        post_id: "456789123",
        content: "Peaceful gathering at the park today, good community spirit",
        likes: 78,
        shares: 15,
        comments: 12,
        hashtags: ["#community", "#peace", "#gathering"],
        location: "Central Park, NY",
      }),
      url: "https://instagram.com/local_reporter/post/456789123",
    },
  ],
};
