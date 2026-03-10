const supabase = require('../config/db'); // Simulated Supabase Client instance

/**
 * Middleware to protect routes based on User Role (RBAC)
 * @param {Array|String} allowedRoles - Single role or array of allowed roles
 * @returns Express Middleware Function
 */
const authorizeRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            // 1. Verify Authentication Context exists
            const user = req.user; // Set previously by an auth middleware verifying JWT
            
            if (!user || !user.id) {
                return res.status(401).json({ error: 'Unauthorized: User authentication required.' });
            }

            // 2. Fetch User Profile from database for true Role Verification
            // (Assuming roles might be mapped inside public.users instead of JWT payload logic for flexibility)
            const { data: dbUser, error } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single();

            if (error || !dbUser) {
                return res.status(403).json({ error: 'Forbidden: User role mapping missing.' });
            }

            const currentRole = dbUser.role;

            // 3. Normalize parameters into an array and enforce strict equality
            const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

            if (!rolesArray.includes(currentRole)) {
                return res.status(403).json({ 
                    error: `Access Denied: You must be a ${rolesArray.join(' or ')} to access this dashboard.`,
                    your_role: currentRole
                });
            }

            // 4. Attach strict role context for deeper controller validation optionally inside `req`
            req.user.role = currentRole;
            next();
        } catch (err) {
            console.error('Role Auth Error:', err.message);
            res.status(500).json({ error: 'Internal Server Error during role validation.' });
        }
    };
};

/**
 * Validates the strict limit of 2 Admin roles for registration endpoints
 */
const enforceAdminRegistrationLimit = async (req, res, next) => {
    try {
        const { role } = req.body;
        
        // If they want to be an admin, enforce limits.
        if (role === 'admin') {
            const { count, error } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'admin');

            if (error) throw error;

            if (count >= 2) {
                return res.status(403).json({ 
                    error: 'Admin Limit Reached. Further admin registrations are blocked by the system.' 
                });
            }
        }
        next();
    } catch (err) {
        console.error('Admin Limit Validation Error:', err.message);
        res.status(500).json({ error: 'Failed to process admin validation limit.' });
    }
}

module.exports = {
    authorizeRole,
    enforceAdminRegistrationLimit
};
