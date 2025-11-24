"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongo_1 = require("./config/mongo");
const mysql_1 = require("./config/mysql");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const storyRoutes_1 = __importDefault(require("./routes/storyRoutes"));
const pageRoutes_1 = __importDefault(require("./routes/pageRoutes"));
const gameRoutes_1 = __importDefault(require("./routes/gameRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
}));
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/stories', storyRoutes_1.default);
app.use('/api/pages', pageRoutes_1.default);
app.use('/api/game', gameRoutes_1.default);
// Root endpoint
app.get('/', (req, res) => {
    res.send('NAHB Backend API Running');
});
const startServer = async () => {
    try {
        await (0, mongo_1.connectMongo)();
        await (0, mysql_1.testMySQLConnection)();
        await mysql_1.sequelize.sync();
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    }
    catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=index.js.map