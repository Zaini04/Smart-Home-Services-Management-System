import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceProvider",
      required: true,
    },

    laborEstimate: {
      type: Number,
      required: true,
    },

    message: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

/* One offer per provider per booking */
offerSchema.index(
  { booking: 1, provider: 1 },
  { unique: true }
);

const Offer = mongoose.model("Offer", offerSchema);

export default Offer;