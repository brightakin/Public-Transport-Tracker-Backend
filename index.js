const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(require("cors")());

// Lagos geographical boundaries
const LAGOS_LAT_MIN = 6.4;
const LAGOS_LAT_MAX = 6.7;
const LAGOS_LNG_MIN = 3.1;
const LAGOS_LNG_MAX = 3.5;

// Vehicles data initialized within Lagos bounds
let vehicles = [
  { id: "bus1", type: "bus", lat: 6.5244, lng: 3.3792 }, // Lagos central
  { id: "bus2", type: "bus", lat: 6.5294, lng: 3.3892 },
  { id: "train1", type: "train", lat: 6.5144, lng: 3.3512 },
  { id: "train2", type: "train", lat: 6.5344, lng: 3.4192 },
];

// Helper function to constrain latitude and longitude within Lagos bounds
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Simulate vehicle movement within Lagos
function updateVehicleLocations() {
  vehicles = vehicles.map((v) => ({
    ...v,
    lat: clamp(
      v.lat + (Math.random() - 0.5) * 0.01,
      LAGOS_LAT_MIN,
      LAGOS_LAT_MAX
    ),
    lng: clamp(
      v.lng + (Math.random() - 0.5) * 0.01,
      LAGOS_LNG_MIN,
      LAGOS_LNG_MAX
    ),
  }));
}

// Generate random notifications
function generateNotification() {
  const notifications = [
    { type: "delay", message: "Bus 1 is delayed by 10 minutes." },
    {
      type: "cancellation",
      message: "Train 2 is cancelled due to maintenance.",
    },
    { type: "nearbyStop", message: "Bus 2 is near your location." },
  ];
  const randomIndex = Math.floor(Math.random() * notifications.length);
  return notifications[randomIndex];
}

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Send initial vehicle data
  socket.emit("vehicleUpdate", vehicles);
  console.log("Initial vehicle data sent");

  // Periodically broadcast vehicle updates
  const vehicleInterval = setInterval(() => {
    updateVehicleLocations();
    socket.emit("vehicleUpdate", vehicles);
    console.log("Vehicle updates sent:", vehicles);
  }, 5000);

  // Periodically send notifications
  const notificationInterval = setInterval(() => {
    const notification = generateNotification();
    socket.emit("notification", notification);
    console.log("Notification sent:", notification);
  }, 10000);

  // Clean up on disconnect
  socket.on("disconnect", () => {
    clearInterval(vehicleInterval);
    clearInterval(notificationInterval);
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
