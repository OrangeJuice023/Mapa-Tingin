import mongoose from "mongoose";

const RawDataSchema = new mongoose.Schema({
  location: String,
  lat: Number,
  lon: Number,
  raw: Object,
  fetchedAt: { type: Date, default: Date.now },
});

export default mongoose.models.RawData || mongoose.model("RawData", RawDataSchema);
