import mongoose from "mongoose";

const sliderSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    ctaText: {
      type: String,
      default: "Book Now",
    },
    ctaLink: {
      type: String,
      default: "/post-job",
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Slider = mongoose.model("Slider", sliderSchema);
export default Slider;
