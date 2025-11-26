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
app.use('/api/auth', authRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiStoryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/user', userRoutes);

// Root endpoint
app.get('/', (req, res) => {
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
