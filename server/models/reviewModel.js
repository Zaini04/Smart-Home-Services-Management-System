import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },

    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceProvider",
      required: true,
    },

    // ⭐ Star Rating (1-5)
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // 📝 Review Text (Optional)
    review: {
      type: String,
      maxlength: 500,
      default: "",
    },

    // Admin can hide inappropriate reviews
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Update provider rating after review
reviewSchema.post("save", async function () {
  try {
    const Review = mongoose.model("Review");
    const ServiceProvider = mongoose.model("ServiceProvider");

    const stats = await Review.aggregate([
      { $match: { provider: this.provider, isVisible: true } },
      {
        $group: {
          _id: "$provider",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await ServiceProvider.findByIdAndUpdate(this.provider, {
        rating: Math.round(stats[0].avgRating * 10) / 10,
        ratingCount: stats[0].count,
      });
    }
  } catch (err) {
    console.error("Error updating provider rating:", err);
  }
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;