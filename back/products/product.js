const express = require('express');
const router = express.Router();
const connection = require('../db');
require('dotenv').config();
const jwt = require('jsonwebtoken');

// Voir tous les produits disponibles
router.get('/all', (req, res) => {
    connection.query('SELECT * FROM product', (err, results) => {
        if (err) {
            res.status(500).send('Erreur de recuperation de donnees');
            return;
        }
        res.json(results);
    });
});

module.exports = router;