const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const AWS = require("aws-sdk");
require("dotenv").config();

const app = express();
const port = 3000;

// Enable CORS
app.use(cors());

// Set up AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_S3_REGION,
});

const s3 = new AWS.S3();

// Set storage engine for Multer
const storage = multer.memoryStorage();

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

  const fileContent = req.file.buffer;
  const fileName = req.file.originalname;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileName,
    Body: fileContent,
  };

  s3.upload(params, function (err, data) {
    if (err) {
      console.error("Error uploading file:", err);
      return res.status(500).json({
        message: "Error uploading file to S3!",
        err: err,
      });
    }

    const fileUrl = data.Location;
    res.json({
      message: "PDF file uploaded successfully!",
      fileUrl: fileUrl,
    });
  });
});

// Start the server
app.listen(port, function () {
  console.log(`Server running on port ${port}`);
});
