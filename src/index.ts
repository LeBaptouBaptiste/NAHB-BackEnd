import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectMongo } from './config/mongo';
import { testMySQLConnection, sequelize } from './config/mysql';
import './models/sequelize'; // Register models
import authRoutes from './routes/authRoutes';
import storyRoutes from './routes/storyRoutes';
import pageRoutes from './routes/pageRoutes';
import gameRoutes from './routes/gameRoutes';
import ratingRoutes from './routes/ratingRoutes';
import reportRoutes from './routes/reportRoutes';
import adminRoutes from './routes/adminRoutes';
import aiStoryRoutes from './routes/aiStoryRoutes';
import uploadRoutes from './routes/uploadRoutes';
import favoriteRoutes from './routes/favoriteRoutes';
import userRoutes from './routes/userRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use('/uploads', express.static('public/uploads'));

// Routes
app.use('/auth', authRoutes);
app.use('/stories', storyRoutes);
app.use('/pages', pageRoutes);
app.use('/game', gameRoutes);
app.use('/ratings', ratingRoutes);
app.use('/reports', reportRoutes);
app.use('/admin', adminRoutes);
app.use('/ai', aiStoryRoutes);
app.use('/upload', uploadRoutes);
app.use('/favorites', favoriteRoutes);
app.use('/user', userRoutes);

// Root endpoint
app.get('/api', (req, res) => {
    res.send('NAHB Backend API Running');
});

const startServer = async () => {
    try {
        await connectMongo();
        await testMySQLConnection();
        await sequelize.sync();
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

startServer();
