import multer from "multer";
import fs from "fs";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.body.userId;

    if (!userId) {
      return cb(new Error("User ID is required"), null);
    }

    const uploadPath = path.join("uploads", "users", userId);

    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const map = {
      cnicFront: "cnic-front",
      cnicBack: "cnic-back",
      profileImage: "profile",
    };

    const name = map[file.fieldname] || file.fieldname;
    const ext = path.extname(file.originalname);

    cb(null, `${name}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files allowed"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
});
