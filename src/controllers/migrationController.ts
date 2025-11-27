import { Request, Response } from 'express';
import { Story } from '../models/mongoose/Story';
import { Page } from '../models/mongoose/Page';
import archiver from 'archiver';
import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export const exportStory = async (req: Request, res: Response) => {
    try {
        const { storyId } = req.params;
        const story = await Story.findById(storyId).lean();
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }

        const pages = await Page.find({ storyId }).lean();

        // Create a ZIP archive
        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });

        res.attachment(`${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.zip`);

        archive.pipe(res);

        // Add story and pages data as JSON
        const exportData = {
            story,
            pages,
            version: '1.0'
        };
        archive.append(JSON.stringify(exportData, null, 2), { name: 'story_data.json' });

        // Collect all image paths
        const imagePaths = new Set<string>();
        if (story.imageUrl) imagePaths.add(story.imageUrl);
        pages.forEach(page => {
            if (page.image) imagePaths.add(page.image);
            page.choices.forEach(choice => {
                choice.audio?.forEach(track => {
                    if (track.src) imagePaths.add(track.src);
                });
            });
        });

        // Add images/audio to ZIP
        // Assuming uploads are stored in 'uploads/' directory relative to project root or similar
        // We need to know where 'uploads' is mapped.
        // Usually it's served from 'uploads' directory.
        // If the URL is absolute (http...), we might need to download it or skip it if it's external.
        // If it's relative (/uploads/...), we can find it on disk.

        const uploadsDir = path.join(__dirname, '../../uploads'); // Adjust path as needed

        for (const url of imagePaths) {
            if (url.startsWith('/uploads/')) {
                const filename = url.replace('/uploads/', '');
                const filePath = path.join(uploadsDir, filename);
                if (fs.existsSync(filePath)) {
                    archive.file(filePath, { name: `uploads/${filename}` });
                }
            }
        }

        await archive.finalize();

    } catch (error) {
        console.error('Export failed:', error);
        res.status(500).json({ message: 'Export failed' });
    }
};

export const importStory = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const zip = new AdmZip(req.file.path);
        const zipEntries = zip.getEntries();

        // Find and parse story_data.json
        const dataEntry = zipEntries.find(entry => entry.entryName === 'story_data.json');
        if (!dataEntry) {
            return res.status(400).json({ message: 'Invalid export file: missing story_data.json' });
        }

        const importData = JSON.parse(dataEntry.getData().toString('utf8'));
        const { story: oldStory, pages: oldPages } = importData;

        // Create new Story
        // We should probably generate new IDs to avoid conflicts, or check if it exists.
        // For simplicity, let's create a NEW story (clone).

        // Map old IDs to new IDs
        const idMap = new Map<string, string>();
        const newStoryId = uuidv4(); // Actually Mongoose generates IDs, but let's see.

        // Create Story
        const { _id: oldStoryId, ...storyData } = oldStory;
        const newStory = new Story({
            ...storyData,
            title: `${storyData.title} (Imported)`,
            authorId: (req as any).userId ? (req as any).userId : storyData.authorId, // Assign to current user if logged in
            createdAt: new Date(),
            updatedAt: new Date()
        });
        await newStory.save();
        idMap.set(oldStoryId, newStory._id.toString());

        // Extract assets
        const uploadsDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        zipEntries.forEach(entry => {
            if (entry.entryName.startsWith('uploads/') && !entry.isDirectory) {
                zip.extractEntryTo(entry, uploadsDir, false, true);
            }
        });

        // Create Pages and map IDs
        // First pass: Create pages with new IDs but keep old references for now or just generate IDs.
        // Mongoose IDs are generated on instantiation.

        const newPages = [];
        for (const oldPage of oldPages) {
            const { _id: oldPageId, ...pageData } = oldPage;
            const newPage = new Page({
                ...pageData,
                storyId: newStory._id,
                choices: [], // We'll fill choices in second pass to resolve targetPageIds
                hotspots: []
            });
            await newPage.save();
            idMap.set(oldPageId, newPage._id.toString());
            newPages.push({ newPage, oldPage });
        }

        // Second pass: Update references (choices, hotspots, startPageId)

        // Update Story startPageId
        if (oldStory.startPageId && idMap.has(oldStory.startPageId)) {
            newStory.startPageId = idMap.get(oldStory.startPageId);
            await newStory.save();
        }

        // Update Pages
        for (const { newPage, oldPage } of newPages) {
            // Update Choices
            const newChoices = oldPage.choices.map((choice: any) => {
                const newChoice = { ...choice };
                if (choice.targetPageId && idMap.has(choice.targetPageId)) {
                    newChoice.targetPageId = idMap.get(choice.targetPageId);
                }
                if (choice.diceRoll) {
                    if (choice.diceRoll.failurePageId && idMap.has(choice.diceRoll.failurePageId)) {
                        newChoice.diceRoll.failurePageId = idMap.get(choice.diceRoll.failurePageId);
                    }
                    if (choice.diceRoll.successPageId && idMap.has(choice.diceRoll.successPageId)) {
                        newChoice.diceRoll.successPageId = idMap.get(choice.diceRoll.successPageId);
                    }
                }
                return newChoice;
            });

            // Update Hotspots
            const newHotspots = (oldPage.hotspots || []).map((hotspot: any) => {
                const newHotspot = { ...hotspot };
                if (hotspot.targetPageId && idMap.has(hotspot.targetPageId)) {
                    newHotspot.targetPageId = idMap.get(hotspot.targetPageId);
                }
                if (hotspot.diceRoll) {
                    if (hotspot.diceRoll.failurePageId && idMap.has(hotspot.diceRoll.failurePageId)) {
                        newHotspot.diceRoll.failurePageId = idMap.get(hotspot.diceRoll.failurePageId);
                    }
                    if (hotspot.diceRoll.successPageId && idMap.has(hotspot.diceRoll.successPageId)) {
                        newHotspot.diceRoll.successPageId = idMap.get(hotspot.diceRoll.successPageId);
                    }
                }
                return newHotspot;
            });

            newPage.choices = newChoices;
            newPage.hotspots = newHotspots;
            await newPage.save();
        }

        // Clean up uploaded zip
        fs.unlinkSync(req.file.path);

        res.status(200).json({ message: 'Import successful', storyId: newStory._id });

    } catch (error: any) {
        console.error('Import failed:', error);
        res.status(500).json({ message: 'Import failed: ' + (error.message || 'Unknown error') });
    }
};
