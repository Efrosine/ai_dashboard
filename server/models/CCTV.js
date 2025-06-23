// Model for cctv table
module.exports = {
  name: "cctv",
  schema: `
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    origin_url VARCHAR(255),
    stream_url VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL
  `,
  seed: [
    {
      name: "Main Entrance Camera",
      origin_url: "http://192.168.1.100:8080",
      stream_url: "http://192.168.1.100:8080/mjpeg",
      location: "Building Main Entrance",
    },
    {
      name: "Parking Lot Camera 1",
      origin_url: "http://192.168.1.101:8080",
      stream_url: "http://192.168.1.101:8080/mjpeg",
      location: "Parking Lot North",
    },
    {
      name: "Office Lobby Camera",
      origin_url: "http://192.168.1.102:8080",
      stream_url: "http://192.168.1.102:8080/mjpeg",
      location: "Office Building Lobby",
    },
  ],
};
