// Model for scraped_result table
module.exports = {
  name: "scraped_result",
  schema: `
    id INT AUTO_INCREMENT PRIMARY KEY,
    account VARCHAR(255) NOT NULL,
    data LONGTEXT NOT NULL,
    url VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  `,
  seed: [
    {
      account: "test_user_1",
      data: JSON.stringify({
        posts: [
          { content: "Test post 1", likes: 10, shares: 2 },
          { content: "Test post 2", likes: 15, shares: 3 },
        ],
      }),
      url: "https://example.com/test_user_1",
    },
    {
      account: "test_user_2",
      data: JSON.stringify({
        posts: [{ content: "Sample content", likes: 25, shares: 5 }],
      }),
      url: "https://example.com/test_user_2",
    },
  ],
};
