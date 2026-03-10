const supabase = require('../config/db');
const spoonacularService = require('../services/spoonacularService');

exports.addFoodItem = async (req, res) => {
    try {
        const vendor_id = req.user.id;
        const { name, description, price, weight } = req.body;

        // 1. Verify that the Vendor's restaurant is approved
        const { data: restaurant, error: restError } = await supabase
            .from('restaurants')
            .select('id, status')
            .eq('vendor_id', vendor_id)
            .single();

        if (restError || !restaurant) {
            return res.status(404).json({ error: 'Restaurant not found for this vendor.' });
        }

        if (restaurant.status !== 'approved') {
            return res.status(403).json({ error: 'You cannot add food until your restaurant is approved.' });
        }

        // 2. Query Spoonacular API for Weight-based Nutrition Calculation
        const nutrients = await spoonacularService.estimateNutrition(name, weight);

        // 3. Insert Food Item into Database
        const { data: foodItem, error: foodError } = await supabase
            .from('food_items')
            .insert([{
                restaurant_id: restaurant.id,
                name,
                description,
                price,
                weight,
                nutrients
            }])
            .select();

        if (foodError) throw foodError;

        res.status(201).json({
            message: 'Food item added successfully.',
            food_item: foodItem[0]
        });

    } catch (error) {
        console.error('Food Addition Error:', error.message);
        res.status(500).json({ error: error.message || 'Failed to add food item.' });
    }
};

exports.getFoodItemsByRestaurant = async (req, res) => {
    try {
        const { restaurant_id } = req.params;

        const { data, error } = await supabase
            .from('food_items')
            .select('*')
            .eq('restaurant_id', restaurant_id);

        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve food items.' });
    }
};
