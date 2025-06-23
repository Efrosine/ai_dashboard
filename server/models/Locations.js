// Model for locations table
module.exports = {
  name: "locations",
  schema: `
    id INT AUTO_INCREMENT PRIMARY KEY,
    data VARCHAR(255) NOT NULL
  `,
  seed: [
    { data: "New York City" },
    { data: "Los Angeles" },
    { data: "London, UK" },
    { data: "Tokyo, Japan" },
    { data: "protest_location_downtown" },
  ],
};
