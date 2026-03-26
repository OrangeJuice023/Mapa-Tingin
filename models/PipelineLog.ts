import mongoose from "mongoose";

const PipelineLogSchema = new mongoose.Schema({
  location: String,
  status: { type: String, enum: ["success", "error"] },
  stage: String,
  message: String,
  duration_ms: Number,
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.PipelineLog || mongoose.model("PipelineLog", PipelineLogSchema);
