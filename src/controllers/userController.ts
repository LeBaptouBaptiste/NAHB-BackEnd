import { Request, Response } from 'express';
import User from '../models/sequelize/User';

export const getUsername = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { id } = req.params;
    try {
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user.username);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};