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

// Voir un produit specifique
router.get('/:id', (req, res) => {
    const productId = req.params.id;

    connection.query('SELECT * FROM product WHERE id = ?', [productId], (err, results) => {
        if (err) {
            res.status(500).send('Erreur de recuperation de donnees');
            return;
        }

        if (results.length === 0) {
            return res.status(400).send('Produit non trouve');
        }

        res.json(results[0]);
    });
});

module.exports = router;