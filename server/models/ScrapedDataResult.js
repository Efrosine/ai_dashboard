// Model for scraped_data_result junction table
module.exports = {
  name: "scraped_data_result",
  schema: `
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_data INT NOT NULL,
    id_result INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_data) REFERENCES scraped_data(id) ON DELETE CASCADE,
    FOREIGN KEY (id_result) REFERENCES scraped_result(id) ON DELETE CASCADE,
    UNIQUE KEY unique_mapping (id_data, id_result)
  `,
  seed: [
    { id_data: 1, id_result: 1 },
    { id_data: 2, id_result: 2 },
    { id_data: 1, id_result: 3 },
  ],
};
