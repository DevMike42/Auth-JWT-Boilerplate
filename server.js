const express = require('express');

// Initialized express
const app = express();

// Root route
app.get('/', (req, res) => res.json({ msg: 'Welcome to the User Auth API...' }));

// Looks for PORT in env (for production mode) or uses 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port: ${PORT}`));