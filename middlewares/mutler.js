import multer from "multer";
import path from "path";
import fs from "fs";

// CONFIGURING MULTER STORAGE
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // ENSURE THE 'UPLOADS' DIRECTORY EXISTS
    const uploadDir = path.join(__dirname, "uploads");

    // CHECK IF THE 'UPLOADS' DIRECTORY EXISTS, CREATE IT IF IT DOESN'T
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // SET THE DESTINATION TO THE 'UPLOADS' DIRECTORY
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // GENERATE A UNIQUE SUFFIX BASED ON CURRENT TIME AND RANDOM NUMBER
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

    // GENERATE THE FINAL FILENAME WITH THE UNIQUE SUFFIX AND ORIGINAL FILE EXTENSION
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname) // ADD FILE EXTENSION
    );
  },
});

// CREATING THE MULTER UPLOAD INSTANCE WITH STORAGE CONFIGURATION
const upload = multer({ storage: storage });

export { upload };
