import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    category: {
      type: String,
      required: true
    },

    price: {
      type: Number,
      required: true
    },

    finalPrice: {
      type: Number
    },

    image: {
      url: {
        type: String,
        required: true
      },
      public_id: String   // useful for Cloudinary later
    },

    averageRating: {
      type: Number,
      default: 0
    },

    totalReviews: {
      type: Number,
      default: 0
    },

    totalBookings: {
      type: Number,
      default: 0
    },

    discount: {
      percentage: {
        type: Number,
        default: 0
      },
      validTill: Date
    },

    isPopular: {
      type: Boolean,
      default: false
    },

    isFeatured: {
      type: Boolean,
      default: false
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

const Service = mongoose.model("Service", serviceSchema);

export default Service