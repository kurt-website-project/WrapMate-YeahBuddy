import { Router } from "express";
import multer, { MulterError } from "multer";
import { uploadImage } from "../cloudinary.js";
import { requireAuth } from "../middleware.js";

const router = Router();

// multer 2.x keeps the same memoryStorage/single API as 1.4.x; the upgrade is a
// security/maintenance release (fixes DoS on malformed/empty-fieldname uploads).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Wrap upload.single so multer's own errors (file too large, malformed
// multipart, unexpected field) become clean 400s instead of a generic 500.
function singleFile(fieldName) {
  const handler = upload.single(fieldName);
  return (req, res, next) => {
    handler(req, res, (err) => {
      if (err instanceof MulterError) {
        return res.status(400).json({ error: `Upload failed: ${err.message}` });
      }
      if (err) {
        return res.status(400).json({ error: "Upload failed." });
      }
      next();
    });
  };
}

router.post("/", requireAuth, singleFile("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }
    const result = await uploadImage(req.file.buffer);
    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    next(err);
  }
});

export default router;
