const express = require('express');
const connectDB = require('./config/db');

// Initialized express
const app = express();

// Connect MongoDB
connectDB();

// Root route
app.get('/', (req, res) => res.json({ msg: 'Welcome to the User Auth API...' }));

// Define routes
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));

// Looks for PORT in env (for production mode) or uses 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port: ${PORT}`));