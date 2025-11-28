import * as storyRepository from "../repositories/storyRepository";
import * as pageRepository from "../repositories/pageRepository";
import archiver from "archiver";
import AdmZip from "adm-zip";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

export const exportStory = async (storyId: string) => {
	const story = await storyRepository.findById(storyId);
	if (!story) {
		throw new Error("Story not found");
	}

	const pages = await pageRepository.findByStory(storyId);

	const archive = archiver("zip", {
		zlib: { level: 9 },
	});

	const filename = `${story.title
		.replace(/[^a-z0-9]/gi, "_")
		.toLowerCase()}_export.zip`;

	// Collect all image paths
	const imagePaths = new Set<string>();
	if (story.imageUrl) imagePaths.add(story.imageUrl);
	pages.forEach((page: any) => {
		if (page.image) imagePaths.add(page.image);
		page.choices.forEach((choice: any) => {
			choice.audio?.forEach((track: any) => {
				if (track.src) imagePaths.add(track.src);
			});
		});
	});

	return { archive, filename, story, pages, imagePaths };
};

export const importStory = async (filePath: string, userId: string) => {
	const zip = new AdmZip(filePath);
	const zipEntries = zip.getEntries();

	const dataEntry = zipEntries.find(
		(entry) => entry.entryName === "story_data.json"
	);
	if (!dataEntry) {
		throw new Error("Invalid export file: missing story_data.json");
	}

	const importData = JSON.parse(dataEntry.getData().toString("utf8"));
	const { story: oldStory, pages: oldPages } = importData;

	const idMap = new Map<string, string>();

	// Create Story
	const { _id: oldStoryId, ...storyData } = oldStory;
	const newStory = await storyRepository.create({
		...storyData,
		title: `${storyData.title} (Imported)`,
		authorId: userId ? userId : storyData.authorId,
		createdAt: new Date(),
		updatedAt: new Date(),
	});

	idMap.set(oldStoryId, newStory._id.toString());

	// Extract assets
	const uploadsDir = path.join(__dirname, "../../uploads");
	if (!fs.existsSync(uploadsDir)) {
		fs.mkdirSync(uploadsDir, { recursive: true });
	}

	zipEntries.forEach((entry) => {
		if (entry.entryName.startsWith("uploads/") && !entry.isDirectory) {
			zip.extractEntryTo(entry, uploadsDir, false, true);
		}
	});

	// Create Pages
	const newPages = [];
	for (const oldPage of oldPages) {
		const { _id: oldPageId, ...pageData } = oldPage;
		const newPage = await pageRepository.create({
			...pageData,
			storyId: newStory._id.toString(),
			choices: [],
			hotspots: [],
		});
		idMap.set(oldPageId, newPage._id.toString());
		newPages.push({ newPage, oldPage });
	}

	// Update references
	if (oldStory.startPageId && idMap.has(oldStory.startPageId)) {
		newStory.startPageId = idMap.get(oldStory.startPageId)!;
		await newStory.save();
	}

	for (const { newPage, oldPage } of newPages) {
		const newChoices = oldPage.choices.map((choice: any) => {
			const newChoice = { ...choice };
			if (choice.targetPageId && idMap.has(choice.targetPageId)) {
				newChoice.targetPageId = idMap.get(choice.targetPageId);
			}
			if (choice.diceRoll) {
				if (
					choice.diceRoll.failurePageId &&
					idMap.has(choice.diceRoll.failurePageId)
				) {
					newChoice.diceRoll.failurePageId = idMap.get(
						choice.diceRoll.failurePageId
					);
				}
				if (
					choice.diceRoll.successPageId &&
					idMap.has(choice.diceRoll.successPageId)
				) {
					newChoice.diceRoll.successPageId = idMap.get(
						choice.diceRoll.successPageId
					);
				}
			}
			return newChoice;
		});

		const newHotspots = (oldPage.hotspots || []).map((hotspot: any) => {
			const newHotspot = { ...hotspot };
			if (hotspot.targetPageId && idMap.has(hotspot.targetPageId)) {
				newHotspot.targetPageId = idMap.get(hotspot.targetPageId);
			}
			if (hotspot.diceRoll) {
				if (
					hotspot.diceRoll.failurePageId &&
					idMap.has(hotspot.diceRoll.failurePageId)
				) {
					newHotspot.diceRoll.failurePageId = idMap.get(
						hotspot.diceRoll.failurePageId
					);
				}
				if (
					hotspot.diceRoll.successPageId &&
					idMap.has(hotspot.diceRoll.successPageId)
				) {
					newHotspot.diceRoll.successPageId = idMap.get(
						hotspot.diceRoll.successPageId
					);
				}
			}
			return newHotspot;
		});

		newPage.choices = newChoices;
		newPage.hotspots = newHotspots;
		await newPage.save();
	}

	return newStory._id;
};
