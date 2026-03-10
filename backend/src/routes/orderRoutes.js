const express = require('express');
const router = express.Router();
const supabase = require('../config/db');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/roleMiddleware');

// Customer Route: Place COD Order
router.post('/place', authenticateToken, authorizeRole('customer'), async (req, res) => {
    try {
        const customer_id = req.user.id;
        const { restaurant_id, items, total_amount } = req.body;

        // items = [{food_item_id, quantity, price}]

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert([{
                customer_id,
                restaurant_id,
                total_amount,
                payment_type: 'COD',
                status: 'placed'
            }])
            .select();

        if (orderError) throw orderError;

        const orderId = order[0].id;

        // Insert mapping items into order_items
        const orderItemsPayload = items.map(item => ({
            order_id: orderId,
            food_item_id: item.food_item_id,
            quantity: item.quantity,
            price: item.price
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItemsPayload);

        if (itemsError) {
            // In production, transaction rollback would be utilized
            throw itemsError;
        }

        res.status(201).json({
            message: 'Order placed successfully.',
            order_id: orderId,
            status: 'placed'
        });

    } catch (error) {
        console.error('Order Error:', error.message);
        res.status(500).json({ error: 'Failed to place order.' });
    }
});

// Delivery Route: Update Order Status
router.patch('/:id/status', authenticateToken, authorizeRole('delivery'), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // e.g. 'picked', 'delivered'

        const { data, error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id)
            .select();

        if (error) throw error;

        res.status(200).json({
            message: 'Order status updated successfully.',
            order_id: data[0].id,
            new_status: data[0].status
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update order status.' });
    }
});

module.exports = router;
