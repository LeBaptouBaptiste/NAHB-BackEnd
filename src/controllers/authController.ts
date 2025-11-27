import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/sequelize/User";
import { JWT_SECRET } from "../utils/constants";

export const register = async (req: Request, res: Response) => {
	const { username, email, password } = req.body;
	if (!username || !email || !password) {
		return res.status(400).json({ message: "All fields required" });
	}
	try {
		const existingMail = await User.findOne({ where: { email } });
		if (existingMail) {
			return res.status(409).json({ message: "Email already in use" });
		}
		const existingUser = await User.findOne({ where: { username } });
		if (existingUser) {
			return res.status(409).json({ message: "Username already in use" });
		}
		const hash = await bcrypt.hash(password, 10);
		const user = await User.create({
			username,
			email,
			password_hash: hash,
			role: "author",
		});
		const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
			expiresIn: "7d",
		});
		res
			.status(201)
			.json({
				token,
				user: {
					id: user.id,
					username: user.username,
					email: user.email,
					role: user.role,
				},
			});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
};

export const login = async (req: Request, res: Response) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(400).json({ message: "Email and password required" });
	}
	try {
		const user = await User.findOne({ where: { email } });
		if (!user) return res.status(401).json({ message: "Invalid credentials" });
		const match = await bcrypt.compare(password, user.password_hash);
		if (!match) return res.status(401).json({ message: "Invalid credentials" });
		const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
			expiresIn: "7d",
		});
		res.json({
			token,
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
				role: user.role,
			},
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
};

export const getMe = async (req: Request, res: Response) => {
	// @ts-ignore - user injected by auth middleware
	const userId = (req as any).userId;
	const user = await User.findByPk(userId);
	if (!user) return res.status(404).json({ message: "User not found" });
	res.json({
		id: user.id,
		username: user.username,
		email: user.email,
		role: user.role,
	});
};
