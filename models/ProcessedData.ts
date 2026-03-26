import mongoose from "mongoose";

const AlertSchema = new mongoose.Schema({
  type: String,
  level: String,
  message: String,
});

const ProcessedDataSchema = new mongoose.Schema({
  location: String,
  lat: Number,
  lon: Number,
  temp: Number,
  humidity: Number,
  cloud: Number,
  heatIndex: Number,
  riskScore: Number,
  cloudLabel: String,
  alerts: [AlertSchema],
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.ProcessedData || mongoose.model("ProcessedData", ProcessedDataSchema);
