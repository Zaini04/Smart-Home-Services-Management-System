import multer from "multer";
import fs from "fs";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { bookingId } = req.params;

    if (!bookingId) {
      return cb(new Error("Booking ID is required"), null);
    }

    const uploadPath = path.join("uploads", "bookings", bookingId);
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `image-${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files allowed"), false);
};

export const uploadBookingImages = multer({
  storage,
  fileFilter,
  limits: { files: 5 },
});
