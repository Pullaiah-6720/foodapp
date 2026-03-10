const supabase = require('../config/db');

exports.submitRestaurant = async (req, res) => {
    try {
        const vendor_id = req.user.id;

        const {
            restaurant_name,
            restaurant_type,
            cuisine_type,
            description,
            opening_time,
            closing_time,
            prep_time,
            address,
            city,
            state,
            pincode,
            service_radius,
            owner_name,
            owner_phone,
            owner_email,
            owner_address,
            fssai_number,
            fssai_type,
            fssai_expiry,
            fssai_doc_url,
            trade_license_number,
            trade_authority,
            trade_license_expiry,
            trade_doc_url,
            restaurant_logo,
            restaurant_cover,
            kitchen_photo,
            food_category,
            allergen_info,
            cooking_oil_type
        } = req.body;

        const insertPayload = {
            vendor_id,
            name: restaurant_name,
            cuisine_type,
            address,
            city,
            state,
            pincode,
            fssai_number,
            status: 'pending',
            opening_time,
            closing_time,
            owner_name,
            owner_phone,
            owner_email,
            fssai_doc_url,
            contact_number: owner_phone || 'N/A',
            shop_license_url: trade_doc_url || 'N/A',
            id_proof_url: 'N/A', // Removed from form as requested
            restaurant_img_url: restaurant_cover || 'N/A'
        };

        console.log('CURRENT RUNNING CONTROLLER: InsertKeys=', Object.keys(insertPayload));

        const { data, error } = await supabase
            .from('restaurants')
            .insert([insertPayload])
            .select();

        if (error) throw error;

        res.status(201).json({
            message: 'Restaurant submitted for approval successfully.',
            restaurant_id: data[0].id,
            status: data[0].status
        });

    } catch (error) {
        console.error('Restaurant Submission Error:', error);
        res.status(500).json({ error: error.message || 'Failed to submit restaurant details.' });
    }
};

exports.getVendorRestaurant = async (req, res) => {
    try {
        const vendor_id = req.user.id;

        const { data, error } = await supabase
            .from('restaurants')
            .select('*')
            .eq('vendor_id', vendor_id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        res.status(200).json(data || null);

    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch restaurant status.' });
    }
}
