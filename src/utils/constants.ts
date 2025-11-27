const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is not set. Set a strong secret before starting the server.');
}

export const JWT_SECRET = jwtSecret;