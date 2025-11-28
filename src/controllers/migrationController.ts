import { Request, Response } from "express";
import * as migrationService from "../services/migrationService";
import path from "path";
import fs from "fs";

export const exportStory = async (req: Request, res: Response) => {
	try {
		const { storyId } = req.params;
		const { archive, filename, story, pages, imagePaths } =
			await migrationService.exportStory(storyId);

		res.attachment(filename);
		archive.pipe(res);

		const exportData = {
			story,
			pages,
			version: "1.0",
		};
		archive.append(JSON.stringify(exportData, null, 2), {
			name: "story_data.json",
		});

		const uploadsDir = path.join(__dirname, "../../uploads");

		for (const url of imagePaths) {
			if (url.startsWith("/uploads/")) {
				const filename = url.replace("/uploads/", "");
				const filePath = path.join(uploadsDir, filename);
				if (fs.existsSync(filePath)) {
					archive.file(filePath, { name: `uploads/${filename}` });
				}
			}
		}

		await archive.finalize();
	} catch (error: any) {
		if (error.message === "Story not found") {
			return res.status(404).json({ message: error.message });
		}
		console.error("Export failed:", error);
		res.status(500).json({ message: "Export failed" });
	}
};

export const importStory = async (req: Request, res: Response) => {
	try {
		if (!req.file) {
			return res.status(400).json({ message: "No file uploaded" });
		}

		// @ts-ignore
		const userId = (req as any).userId;

		const storyId = await migrationService.importStory(req.file.path, userId);

		// Clean up uploaded zip
		fs.unlinkSync(req.file.path);

		res.status(200).json({ message: "Import successful", storyId });
	} catch (error: any) {
		console.error("Import failed:", error);
		res
			.status(500)
			.json({
				message: "Import failed: " + (error.message || "Unknown error"),
			});
	}
};
