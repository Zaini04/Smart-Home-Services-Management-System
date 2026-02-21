import mongoose from "mongoose";

const providerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    age: {
      type: Number,
      required: true,
      min: 18,
    },

    description: {
      type: String,
      required: true,
      maxlength: 500,
    },

    cnic: {
      type: String,
      required: true,
    },

   serviceCategories: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  }
],

skills: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubCategory"
  }
],


    experience: {
      type: Number,
      required: true,
    },

    visitPrice: Number,
    hourlyRate: Number,

    cnicFrontImage: {
      type: String,
      required: true,
    },

    cnicBackImage: {
      type: String,
      required: true,
    },

    profileImage: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["online", "offline", "busy"],
      default: "offline",
    },

    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    kycStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    kycMessage: {
      type: String,
      default: "",
    },

    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
providerSchema.index({ serviceCategories: 1 });
const ServiceProvider = mongoose.model("ServiceProvider", providerSchema);

export default ServiceProvider;
