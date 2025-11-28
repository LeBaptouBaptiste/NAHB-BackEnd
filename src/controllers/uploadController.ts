import { Request, Response } from "express";

export const uploadImage = (req: Request, res: Response) => {
	if (!req.file) {
		return res.status(400).json({ message: "No file uploaded" });
	}

	// Construct URL (adjust base URL as needed)
	const protocol = req.protocol;
	const host = req.get("host");
	const url = `${protocol}://${host}/uploads/${req.file.filename}`;

	res.status(201).json({ url });
};
