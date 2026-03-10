require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the NutriKart API' });
});

// Mounted App Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/vendor', require('./src/routes/vendorRoutes'));
app.use('/api/food', require('./src/routes/foodRoutes'));
app.use('/api/orders', require('./src/routes/orderRoutes'));

// 404 Route
app.use((req, res, next) => {
    res.status(404).json({ error: 'Endpoint not found.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// Trigger reload
console.log('Backend properly restarted');

// Hard restart trigger 2

// Trigger

// Restart after aadhaar_number removal
// Hard restart to pick up PORT=5000
