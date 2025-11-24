import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectMongo } from './config/mongo';
import { testMySQLConnection, sequelize } from './config/mysql';
import authRoutes from './routes/authRoutes';
import storyRoutes from './routes/storyRoutes';
import pageRoutes from './routes/pageRoutes';
import gameRoutes from './routes/gameRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
}));
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/game', gameRoutes);

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
