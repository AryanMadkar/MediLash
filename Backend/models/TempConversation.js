const mongoose = require("mongoose");

const tempMessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant", "doctor", "specialist"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  agentName: String,
  agentSpecialty: String,
});

const tempConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    flaskSessionId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: function () {
        return `Consultation - ${new Date().toLocaleDateString()}`;
      },
    },
    messages: [tempMessageSchema],
    currentStage: {
      type: String,
      enum: [
        "history_taking",
        "specialist_handoff",
        "specialist_consultation",
        "consultation_complete",
      ],
      default: "history_taking",
    },
    specialistInfo: {
      name: String,
      specialty: String,
      clinicalSummary: String,
    },
    summary: {
      recommendations: [String],
      medications: [String],
      finalAssessment: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      default: Date.now,
      expires: 3600, // 1 hour expiry
    },
  },
  {
    timestamps: true,
  }
);

// Index for automatic cleanup
tempConversationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("TempConversation", tempConversationSchema);
