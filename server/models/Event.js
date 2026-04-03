const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
    },
    location: {
      type: String,
      required: [true, "Event location is required"],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Academic", "Cultural", "Sports", "Technical", "Social"],
      default: "Academic",
    },
    capacity: {
      type: Number,
      required: [true, "Event capacity is required"],
      min: [1, "Capacity must be at least 1"],
    },
    fees: {
      type: Number,
      default: 0,
      min: [0, "Fees cannot be negative"],
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    registeredUsers: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        registeredAt: { type: Date, default: Date.now },
        paymentStatus: {
          type: String,
          enum: ["pending", "completed", "failed"],
          default: "pending",
        },
        paymentId: String,
        amountPaid: { type: Number, default: 0 },
        checkedIn: { type: Boolean, default: false },
        checkInTime: { type: Date }
      },
    ],
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    poster: String,
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

eventSchema.virtual("registeredCount").get(function () {
  return this.registeredUsers.length;
});

eventSchema.virtual("availableSpots").get(function () {
  return this.capacity - this.registeredUsers.length;
});

eventSchema.index({ title: "text", description: "text" });
eventSchema.index({ date: 1, category: 1 });

module.exports = mongoose.model("Event", eventSchema);
