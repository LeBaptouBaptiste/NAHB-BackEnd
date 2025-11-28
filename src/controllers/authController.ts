import { Request, Response } from 'express';
import * as authService from '../services/authService';

export const register = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields required' });
    }
    try {
        const result = await authService.register({ username, email, password });
        res.status(201).json(result);
    } catch (err: any) {
        if (err.message === 'Email already in use') {
            return res.status(409).json({ message: err.message });
        }
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
    }
    try {
        const result = await authService.login({ email, password });
        res.json(result);
    } catch (err: any) {
        if (err.message === 'Invalid credentials') {
            return res.status(401).json({ message: err.message });
        }
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getMe = async (req: Request, res: Response) => {
    // @ts-ignore - user injected by auth middleware
    const userId = (req as any).userId;
    try {
        const user = await authService.getUserById(userId);
        res.json(user);
    } catch (err: any) {
        if (err.message === 'User not found') {
            return res.status(404).json({ message: err.message });
        }
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
