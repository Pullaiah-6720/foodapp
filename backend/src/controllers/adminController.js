const supabase = require('../config/db');

exports.getAllRestaurants = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', status = 'all' } = req.query;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabase
            .from('restaurants')
            .select(`
                *,
                vendor:users(full_name, email, phone_number)
            `, { count: 'exact' });

        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        if (search) {
            query = query.ilike('name', `%${search}%`);
        }

        const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, to);

        if (error) throw error;

        res.status(200).json({
            data,
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch restaurants.' });
    }
};

exports.getPendingRestaurants = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('restaurants')
            .select(`
                *,
                vendor:users(full_name, email, phone_number)
            `)
            .eq('status', 'pending');

        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pending restaurants.' });
    }
};

exports.approveRestaurant = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('restaurants')
            .update({ status: 'approved' })
            .eq('id', id)
            .select();

        if (error) throw error;

        res.status(200).json({ message: 'Restaurant Approved Successfully.', restaurant: data[0] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to approve restaurant.' });
    }
};

exports.rejectRestaurant = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('restaurants')
            .update({ status: 'rejected' })
            .eq('id', id)
            .select();

        if (error) throw error;

        res.status(200).json({ message: 'Restaurant Rejected.', restaurant: data[0] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reject restaurant.' });
    }
};

exports.getAllCustomers = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, full_name, email, phone_number, created_at')
            .eq('role', 'customer');

        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch customers.' });
    }
};

exports.getAllVendors = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select(`
                id, full_name, email, phone_number, created_at,
                restaurants(*)
            `)
            .eq('role', 'vendor');

        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch vendors.' });
    }
};
