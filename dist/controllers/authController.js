"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/sequelize/User"));
const constants_1 = require("../utils/constants");
const register = async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields required' });
    }
    try {
        const existing = await User_1.default.findOne({ where: { email } });
        if (existing) {
            return res.status(409).json({ message: 'Email already in use' });
        }
        const hash = await bcryptjs_1.default.hash(password, 10);
        const user = await User_1.default.create({ username, email, password_hash: hash, role: 'author' });
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, constants_1.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
    }
    try {
        const user = await User_1.default.findOne({ where: { email } });
        if (!user)
            return res.status(401).json({ message: 'Invalid credentials' });
        const match = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!match)
            return res.status(401).json({ message: 'Invalid credentials' });
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, constants_1.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    // @ts-ignore - user injected by auth middleware
    const userId = req.userId;
    const user = await User_1.default.findByPk(userId);
    if (!user)
        return res.status(404).json({ message: 'User not found' });
    res.json({ id: user.id, username: user.username, email: user.email, role: user.role });
};
exports.getMe = getMe;
//# sourceMappingURL=authController.js.map