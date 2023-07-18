const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

const app = express();
const port = 3000;

// Enable CORS
app.use(cors());

// Set storage engine for Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// Initialize Multer upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }

    cb("Error: Only PDF files are allowed!");
  },
});

// Handle POST request to upload a PDF file
app.post("/upload-file", upload.single("file"), function (req, res) {
  if (!req.file) {
    return res.status(400).json({
      message: "No PDF file uploaded!",
    });
  }

  const fileUrl =
    req.protocol + "://" + req.get("host") + "/uploads/" + req.file.filename;
  res.json({
    message: "PDF file uploaded successfully!",
    fileUrl: fileUrl,
  });
});

// Serve static files from the 'uploads' directory
const uploadsDirectory = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadsDirectory));

// Start the server
app.listen(port, function () {
  console.log(`Server running on port ${port}`);
});
