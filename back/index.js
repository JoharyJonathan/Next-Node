const express = require('express');
const cors = require('cors');
require('dotenv').config();

// PORT
const PORT = process.env.PORT;

// Authentifications endpoints
const authRoutes = require('./auth/auth');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);

// Test message
app.get('/api/message', (req, res) => {
    res.json({ message: 'Hello from Node.js!' });
});

// About
app.get('/api/about', (req, res) => {
    res.json({ message: 'About page!' });
});

app.listen(PORT, () => {
    console.log('Backend running on http://localhost:5000');
});