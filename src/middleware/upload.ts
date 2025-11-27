import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

// Ensure uploads directory exists
const uploadDir = "public/uploads";
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = uuidv4();
		cb(null, uniqueSuffix + path.extname(file.originalname));
	},
});

export const upload = multer({
	storage: storage,
	limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit (increased for audio)
	fileFilter: (req, file, cb) => {
		if (
			file.mimetype.startsWith("image/") ||
			file.mimetype.startsWith("audio/")
		) {
			cb(null, true);
		} else {
			cb(new Error("Only images and audio files are allowed"));
		}
	},
});
