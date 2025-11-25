import { Report } from '../../models/Report';
import { Story } from '../../models/Story';

describe('Report Model', () => {
    let testStory: any;

    beforeEach(async () => {
        testStory = await Story.create({
            title: 'Test Story',
            authorId: '1',
            status: 'published',
            stats: { views: 0, completions: 0, endings: {} },
        });
    });

    it('should create a report', async () => {
        const report = await Report.create({
            storyId: testStory._id.toString(),
            reporterId: '2',
            type: 'inappropriate_content',
            description: 'This story contains inappropriate content.',
        });

        expect(report.storyId).toBe(testStory._id.toString());
        expect(report.reporterId).toBe('2');
        expect(report.type).toBe('inappropriate_content');
        expect(report.status).toBe('pending');
    });

    it('should default status to pending', async () => {
        const report = await Report.create({
            storyId: testStory._id.toString(),
            reporterId: '2',
            type: 'spam',
        });

        expect(report.status).toBe('pending');
    });

    it('should only allow valid report types', async () => {
        const invalidReport = {
            storyId: testStory._id.toString(),
            reporterId: '2',
            type: 'invalid_type',
        };

        await expect(Report.create(invalidReport)).rejects.toThrow();
    });

    it('should only allow valid status values', async () => {
        const report = await Report.create({
            storyId: testStory._id.toString(),
            reporterId: '2',
            type: 'spam',
        });

        report.status = 'invalid_status' as any;
        await expect(report.save()).rejects.toThrow();
    });

    it('should update report status', async () => {
        const report = await Report.create({
            storyId: testStory._id.toString(),
            reporterId: '2',
            type: 'copyright',
        });

        report.status = 'resolved';
        report.adminNotes = 'Reviewed and resolved';
        report.resolvedBy = 'admin1';
        await report.save();

        const updatedReport = await Report.findById(report._id);
        expect(updatedReport?.status).toBe('resolved');
        expect(updatedReport?.adminNotes).toBe('Reviewed and resolved');
        expect(updatedReport?.resolvedBy).toBe('admin1');
    });

    it('should support all valid report types', async () => {
        const types = ['inappropriate_content', 'spam', 'copyright', 'harassment', 'other'];

        for (let i = 0; i < types.length; i++) {
            const report = await Report.create({
                storyId: testStory._id.toString(),
                reporterId: `user${i}`,
                type: types[i],
            });
            expect(report.type).toBe(types[i]);
        }
    });
});

