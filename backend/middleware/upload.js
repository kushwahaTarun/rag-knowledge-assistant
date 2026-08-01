import multer from "multer";

// Store the file in memory (we don't need to save the file on disk)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "text/plain") {
    cb(null, true);
  } else {
    cb(new Error("Only .txt file is supported to upload", false));
  }
};

const upload = multer({ storage, fileFilter });

export default upload;
