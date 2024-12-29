const vehicles = [
  { id: "bus1", type: "bus", lat: 40.73061, lng: -73.935242 },
  { id: "bus2", type: "bus", lat: 40.73261, lng: -73.935242 },
  { id: "train1", type: "train", lat: 40.75061, lng: -73.945242 },
];

function updateVehicleLocations() {
  vehicles.forEach((vehicle) => {
    vehicle.lat += (Math.random() - 0.5) * 0.001; // Simulate movement
    vehicle.lng += (Math.random() - 0.5) * 0.001;
  });
}

module.exports = { vehicles, updateVehicleLocations };
