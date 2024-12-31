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

// Fonction pour nettoyer les entrées utilisateur
const sanitizeInput = (input) => {
    if (typeof input === 'string') {
        return input.trim();  // Si input est une chaîne, on utilise trim
    }
    return '';  // Si ce n'est pas une chaîne, on retourne une chaîne vide
};

// Ajouter un nouveau produit
router.post('/add', (req, res) => {
    const name = sanitizeInput(req.body.name);
    const price = sanitizeInput(req.body.price);

    if (!name || !price) {
        return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
    }

    // Vérifier si le produit existe déjà dans la base de données
    connection.query('SELECT id, stock FROM product WHERE name = ?', [name], (err, results) => {
        if (err) {
            console.error('Erreur SQL : ', err.message);
            return res.status(500).json({ error: 'Erreur lors de la vérification du produit' });
        }

        if (results.length > 0) {
            // Le produit existe déjà, on incrémente son stock
            let productId = results[0].id;
            let newStock = results[0].stock + 1;

            // Mettre à jour le stock du produit existant
            connection.query('UPDATE product SET stock = ? WHERE id = ?', [newStock, productId], (err) => {
                if (err) {
                    console.error('Erreur SQL lors de la mise à jour du stock : ', err.message);
                    return res.status(500).json({ error: 'Erreur lors de la mise à jour du stock du produit' });
                }

                res.status(200).json({ message: `Produit ${name} existant mis à jour, stock = ${newStock}.` });
            });
        } else {
            // Le produit n'existe pas, on l'ajoute avec un stock de 1
            connection.query(
                'INSERT INTO product (name, price, stock) VALUES (?, ?, ?)',
                [name, price, 1],
                (err) => {
                    if (err) {
                        console.error('Erreur SQL lors de l\'ajout du produit : ', err.message);
                        return res.status(500).json({ error: 'Erreur lors de l\'ajout du produit' });
                    }

                    res.status(201).json({ message: `Produit ${name} ajouté avec succès, stock = 1.` });
                }
            );
        }
    });
});

module.exports = router;