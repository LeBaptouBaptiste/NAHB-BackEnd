import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utils/constants";

export const authenticate = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ message: "Missing token" });
	}
	const token = authHeader.split(" ")[1];
	try {
		const payload = jwt.verify(token, JWT_SECRET) as {
			id: number;
			role: string;
		};
		// Attach to request for later use
		(req as any).userId = payload.id;
		(req as any).userRole = payload.role;
		next();
	} catch (err) {
		return res.status(401).json({ message: "Invalid token" });
	}
};

export const authorize = (roles: string[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const userRole = (req as any).userRole;
		if (!userRole || !roles.includes(userRole)) {
			return res.status(403).json({ message: "Forbidden: insufficient role" });
		}
		next();
	};
};
