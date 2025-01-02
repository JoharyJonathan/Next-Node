const express = require('express');
const router = express.Router();
const connection = require('../db');
require('dotenv').config();
const jwt = require('jsonwebtoken');

// Ajouter un produit à une commande
router.post('/add-to-order', (req, res) => {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || !quantity) {
        return res.status(400).json({ error: 'userId, productId et quantity sont obligatoires.' });
    }

    // Étape 1 : Vérifier si l'utilisateur a déjà une commande en cours
    connection.query(
        'SELECT id FROM Orders WHERE userId = ? AND status = "pending"',
        [userId],
        (err, results) => {
            if (err) {
                console.error('Erreur SQL :', err.message);
                return res.status(500).json({ error: 'Erreur lors de la vérification de la commande.' });
            }

            let orderId;

            if (results.length > 0) {
                // Une commande existe déjà pour cet utilisateur
                orderId = results[0].id;
                addProductToOrder(orderId, productId, quantity, res);
            } else {
                // Pas de commande existante : Créer une nouvelle commande
                connection.query(
                    'INSERT INTO Orders (userId, total, status) VALUES (?, ?, ?)',
                    [userId, 0, 'pending'], // Le total sera mis à jour plus tard
                    (err, result) => {
                        if (err) {
                            console.error('Erreur SQL lors de la création de la commande :', err.message);
                            return res.status(500).json({ error: 'Erreur lors de la création de la commande.' });
                        }

                        orderId = result.insertId; // ID de la nouvelle commande
                        addProductToOrder(orderId, productId, quantity, res);
                    }
                );
            }
        }
    );
});

// Fonction pour ajouter un produit à une commande existante
function addProductToOrder(orderId, productId, quantity, res) {
    // Étape 2 : Ajouter le produit dans ProductOrder
    connection.query(
        'INSERT INTO ProductOrder (orderId, productId, quantity) VALUES (?, ?, ?)',
        [orderId, productId, quantity],
        (err) => {
            if (err) {
                console.error('Erreur SQL lors de l\'ajout du produit :', err.message);
                return res.status(500).json({ error: 'Erreur lors de l\'ajout du produit à la commande.' });
            }

            // Mettre à jour le total dans la table Orders
            updateOrderTotal(orderId, res);
        }
    );
}

// Fonction pour mettre à jour le total d'une commande
function updateOrderTotal(orderId, res) {
    // Étape 3 : Calculer le nouveau total de la commande
    const query = `
        SELECT SUM(po.quantity * p.price) AS total
        FROM ProductOrder po
        JOIN product p ON po.productId = p.id
        WHERE po.orderId = ?
    `;

    connection.query(query, [orderId], (err, results) => {
        if (err) {
            console.error('Erreur SQL lors de la mise à jour du total :', err.message);
            return res.status(500).json({ error: 'Erreur lors du calcul du total de la commande.' });
        }

        const total = results[0].total;

        // Mise à jour du total dans la commande
        connection.query(
            'UPDATE Orders SET total = ? WHERE id = ?',
            [total, orderId],
            (err) => {
                if (err) {
                    console.error('Erreur SQL lors de la mise à jour du total :', err.message);
                    return res.status(500).json({ error: 'Erreur lors de la mise à jour du total.' });
                }

                res.status(200).json({ message: 'Produit ajouté à la commande avec succès.', orderId, total });
            }
        );
    });
}

// Récupérer les commandes d'un utilisateur
router.get('/orders/:userId', (req, res) => {
    const userId = req.params.userId;

    if (!userId) {
        return res.status(400).json({ error: 'userId est obligatoire.' });
    }

    // Étape 1 : Récupérer les commandes de l'utilisateur
    const query = `
        SELECT o.id AS orderId, o.total, o.status
        FROM Orders o
        WHERE o.userId = ?
        ORDER BY o.id DESC
    `;

    connection.query(query, [userId], (err, orders) => {
        if (err) {
            console.error('Erreur SQL lors de la récupération des commandes :', err.message);
            return res.status(500).json({ error: 'Erreur lors de la récupération des commandes.' });
        }

        if (orders.length === 0) {
            return res.status(404).json({ message: 'Aucune commande trouvée pour cet utilisateur.' });
        }

        // Étape 2 : Récupérer les produits pour chaque commande avec leurs noms et leurs prix
        const orderIds = orders.map(order => order.orderId);
        const productQuery = `
            SELECT po.orderId, po.productId, po.quantity, p.name AS productName, p.price AS productPrice
            FROM ProductOrder po
            JOIN Product p ON po.productId = p.id
            WHERE po.orderId IN (?)
        `;

        connection.query(productQuery, [orderIds], (err, products) => {
            if (err) {
                console.error('Erreur SQL lors de la récupération des produits :', err.message);
                return res.status(500).json({ error: 'Erreur lors de la récupération des produits.' });
            }

            // Organiser les produits par commande
            const productsByOrder = {};
            products.forEach(product => {
                if (!productsByOrder[product.orderId]) {
                    productsByOrder[product.orderId] = [];
                }
                productsByOrder[product.orderId].push({
                    productId: product.productId,
                    productName: product.productName,
                    quantity: product.quantity,
                    price: product.productPrice,
                });
            });

            // Associer les produits aux commandes
            const result = orders.map(order => ({
                orderId: order.orderId,
                total: order.total,
                status: order.status,
                products: productsByOrder[order.orderId] || [],
            }));

            res.status(200).json(result);
        });
    });
});

// Supprimer une commande
router.delete('/orders/:orderId', (req, res) => {
    const orderId = req.params.orderId;

    if (!orderId) {
        return res.status(400).json({ error: 'orderId est obligatoire.' });
    }

    // Étape 1 : Supprimer les produits liés à la commande
    const deleteProductsQuery = `
        DELETE FROM ProductOrder
        WHERE orderId = ?
    `;

    connection.query(deleteProductsQuery, [orderId], (err) => {
        if (err) {
            console.error('Erreur SQL lors de la suppression des produits :', err.message);
            return res.status(500).json({ error: 'Erreur lors de la suppression des produits.' });
        }

        // Étape 2 : Supprimer la commande elle-même
        const deleteOrderQuery = `
            DELETE FROM Orders
            WHERE id = ?
        `;

        connection.query(deleteOrderQuery, [orderId], (err, result) => {
            if (err) {
                console.error('Erreur SQL lors de la suppression de la commande :', err.message);
                return res.status(500).json({ error: 'Erreur lors de la suppression de la commande.' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Commande non trouvée.' });
            }

            res.status(200).json({ message: 'Commande supprimée avec succès.' });
        });
    });
});

// Modifier une commande
router.put('/orders/:orderId', (req, res) => {
    const orderId = req.params.orderId;
    const { total, status, products } = req.body;

    if (!orderId) {
        return res.status(400).json({ error: 'orderId est obligatoire.' });
    }

    if (!products || !Array.isArray(products)) {
        return res.status(400).json({ error: 'La liste des produits est obligatoire et doit être un tableau.' });
    }

    // Étape 1 : Vérifier les stocks disponibles
    const checkStockQuery = `
        SELECT id, stock
        FROM Product
        WHERE id IN (?)
    `;

    const productIds = products.map(product => product.productId);

    connection.query(checkStockQuery, [productIds], (err, results) => {
        if (err) {
            console.error('Erreur SQL lors de la vérification des stocks :', err.message);
            return res.status(500).json({ error: 'Erreur lors de la vérification des stocks.' });
        }

        // Vérifier que chaque produit a suffisamment de stock
        const stockIssues = products.filter(product => {
            const productInDb = results.find(p => p.id === product.productId);
            return !productInDb || product.quantity > productInDb.stock;
        });

        if (stockIssues.length > 0) {
            return res.status(400).json({
                error: 'Quantité demandée supérieure au stock disponible pour certains produits.',
                details: stockIssues.map(product => ({
                    productId: product.productId,
                    requested: product.quantity,
                    available: results.find(p => p.id === product.productId)?.stock || 0,
                })),
            });
        }

        // Étape 2 : Mettre à jour les détails de la commande
        const updateOrderQuery = `
            UPDATE Orders
            SET total = ?, status = ?
            WHERE id = ?
        `;

        connection.query(updateOrderQuery, [total, status, orderId], (err, result) => {
            if (err) {
                console.error('Erreur SQL lors de la mise à jour de la commande :', err.message);
                return res.status(500).json({ error: 'Erreur lors de la mise à jour de la commande.' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Commande non trouvée.' });
            }

            // Étape 3 : Supprimer les produits existants pour cette commande
            const deleteProductsQuery = `
                DELETE FROM ProductOrder
                WHERE orderId = ?
            `;

            connection.query(deleteProductsQuery, [orderId], (err) => {
                if (err) {
                    console.error('Erreur SQL lors de la suppression des anciens produits :', err.message);
                    return res.status(500).json({ error: 'Erreur lors de la suppression des anciens produits.' });
                }

                // Étape 4 : Ajouter les nouveaux produits
                const insertProductQuery = `
                    INSERT INTO ProductOrder (orderId, productId, quantity)
                    VALUES ?
                `;

                const productValues = products.map(product => [orderId, product.productId, product.quantity]);

                connection.query(insertProductQuery, [productValues], (err) => {
                    if (err) {
                        console.error('Erreur SQL lors de l’ajout des nouveaux produits :', err.message);
                        return res.status(500).json({ error: 'Erreur lors de l’ajout des nouveaux produits.' });
                    }

                    res.status(200).json({ message: 'Commande mise à jour avec succès.' });
                });
            });
        });
    });
});

module.exports = router;