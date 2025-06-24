// Model for locations table
module.exports = {
  name: "locations",
  schema: `
    id INT AUTO_INCREMENT PRIMARY KEY,
    data VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_data (data)
  `,
  seed: [
    { data: "New York City, Times Square" },
    { data: "Los Angeles, Hollywood Boulevard" },
    { data: "Chicago, Millennium Park" },
    { data: "London, UK, Trafalgar Square" },
    { data: "Tokyo, Japan, Shibuya Crossing" },
    { data: "Washington DC, Capitol Building" },
  ],
};
