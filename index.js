const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(require("cors")());

// Vehicles data
let vehicles = [
  { id: "bus1", type: "bus", lat: 40.73061, lng: -73.935242 },
  { id: "bus2", type: "bus", lat: 40.73161, lng: -73.934242 },
  { id: "train1", type: "train", lat: 40.75061, lng: -73.945242 },
  { id: "train2", type: "train", lat: 40.75161, lng: -73.944242 },
];

// Simulate vehicle movement
function updateVehicleLocations() {
  vehicles = vehicles.map((v) => ({
    ...v,
    lat: v.lat + (Math.random() - 0.5) * 0.001,
    lng: v.lng + (Math.random() - 0.5) * 0.001,
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
