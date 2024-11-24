const bodyParser = require("body-parser");
const mqtt = require("mqtt");
const express = require("express");
const app = express();

const mqttClient = mqtt.connect("mqtt://broker.hivemq.com"); // Replace with your MQTT broker URL
mqttClient.on("connect", () => {
  console.log("Connected to MQTT broker");
});
mqttClient.on("error", (err) => {
  console.error("MQTT connection error:", err);
});

app.get("/", (req, res) => res.send("Express server working"));

// Track the last generated value
let lastCO2Value = 5000; // Starting with a typical indoor value

function generateRandomCO2() {
  // Maximum change between readings (±100 ppm)
  const maxChange = 100;

  // Generate small random change
  const change = (Math.random() * 2 - 1) * maxChange;

  // Update the value
  lastCO2Value += change;

  // Keep within realistic bounds (1500-10000 ppm)
  lastCO2Value = Math.max(1500, Math.min(10000, lastCO2Value));

  // Round to 2 decimal places
  return parseFloat(lastCO2Value.toFixed(2));
}

// MQTT publish logic
setInterval(() => {
  let co2 = generateRandomCO2();
  mqttClient.publish("baltii/co2", co2 + "", (err) => {
    if (err) {
      console.error("Error publishing MQTT message:", err);
    } else {
      console.log("MQTT message sent:", co2);
    }
  });
}, 1000);

// Start the server
app.listen(3000, () => {
  console.log("Server ready on port 3000.");
});

module.exports = app;
