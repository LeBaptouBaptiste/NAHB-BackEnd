import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as userRepository from "../repositories/userRepository";
import { JWT_SECRET } from "../utils/constants";

export const register = async (userData: any) => {
	const { username, email, password } = userData;
	const existing = await userRepository.findByEmail(email);
	if (existing) {
		throw new Error("Email already in use");
	}
	const hash = await bcrypt.hash(password, 10);
	const user = await userRepository.create({
		username,
		email,
		password_hash: hash,
		role: "author",
	});
	const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
		expiresIn: "7d",
	});
	return {
		token,
		user: {
			id: user.id,
			username: user.username,
			email: user.email,
			role: user.role,
		},
	};
};

export const login = async (credentials: any) => {
	const { email, password } = credentials;
	const user = await userRepository.findByEmail(email);
	if (!user) {
		throw new Error("Invalid credentials");
	}
	const match = await bcrypt.compare(password, user.password_hash);
	if (!match) {
		throw new Error("Invalid credentials");
	}
	const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
		expiresIn: "7d",
	});
	return {
		token,
		user: {
			id: user.id,
			username: user.username,
			email: user.email,
			role: user.role,
		},
	};
};

export const getUserById = async (userId: number) => {
	const user = await userRepository.findById(userId);
	if (!user) {
		throw new Error("User not found");
	}
	return {
		id: user.id,
		username: user.username,
		email: user.email,
		role: user.role,
	};
};
