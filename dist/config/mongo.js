"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMongo = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoURI = process.env.MONGO_URI || 'mongodb://mongo:27017/nahb';
const connectMongo = async () => {
    try {
        await mongoose_1.default.connect(mongoURI);
        console.log('MongoDB Connected:', mongoose_1.default.connection.host);
    }
    catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};
exports.connectMongo = connectMongo;
//# sourceMappingURL=mongo.js.map