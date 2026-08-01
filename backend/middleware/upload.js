import multer from "multer";

// Store the file in memory (we don't need to save the file on disk)
const storage = multer.memoryStorage();
const allowedTypes = [
  "text/plain",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only .txt, .pdf, and .docx files are supported to upload",
        false,
      ),
    );
  }
};

const upload = multer({ storage, fileFilter });

export default upload;
