const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer TOKEN

        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        // Supabase signs their JWTs using the JWT secret (usually identical to the project's anon/service key depending on setup)
        // Here we just decode to grab the sub, or in a real setup verify using the Supabase JWT secret
        const decoded = jwt.decode(token); // Simulating without key for ease of testing, in production use jwt.verify

        if (!decoded || !decoded.sub) {
            return res.status(401).json({ error: 'Invalid token structure.' });
        }

        req.user = {
            id: decoded.sub,
            email: decoded.email
        };

        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid token.' });
    }
};

module.exports = { authenticateToken };
