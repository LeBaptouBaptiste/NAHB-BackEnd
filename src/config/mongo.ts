import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const mongoURI = process.env.MONGO_URI || 'mongodb://mongo:27017/nahb';

export const connectMongo = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log('MongoDB Connected:', mongoose.connection.host);
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};
