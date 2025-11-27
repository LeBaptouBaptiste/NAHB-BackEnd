import { Request, Response, NextFunction } from 'express';

type RateLimiterOptions = {
    windowMs: number;
    max: number;
    message?: string;
};

type ClientRecord = {
    count: number;
    firstRequest: number;
};

export const createRateLimiter = ({ windowMs, max, message = 'Too many requests' }: RateLimiterOptions) => {
    const clients: Map<string, ClientRecord> = new Map();

    // Periodically clean old entries to avoid unbounded memory growth
    const cleanup = setInterval(() => {
        const now = Date.now();
        for (const [key, record] of clients.entries()) {
            if (now - record.firstRequest > windowMs) {
                clients.delete(key);
            }
        }
    }, Math.max(windowMs, 60_000));

    const middleware = (req: Request, res: Response, next: NextFunction) => {
        const key = req.ip || req.socket.remoteAddress || 'unknown';
        const now = Date.now();
        const record = clients.get(key);

        if (!record || now - record.firstRequest > windowMs) {
            clients.set(key, { count: 1, firstRequest: now });
            return next();
        }

        if (record.count >= max) {
            return res.status(429).json({ message });
        }

        record.count += 1;
        clients.set(key, record);
        next();
    };

    // Prevent the interval from keeping the Node process alive unnecessarily
    cleanup.unref();

    return middleware;
};