const express = require('express');
const router = express.Router();
const connection = require('../db');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const secretKey = process.env.SECRET_KEY;

// Fonction pour nettoyer les entrées utilisateur
const sanitizeInput = (input) => input && input.trim();

// Enregistrement d'un utilisateur
router.post('/register', async (req, res) => {
    const name = sanitizeInput(req.body.name);
    const email = sanitizeInput(req.body.email);
    const password = req.body.password;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
    }

    try {
        connection.query('SELECT * FROM user WHERE email = ?', [email], async (err, results) => {
            if (err) {
                console.error('Erreur SQL : ', err.message);
                return res.status(500).json({ error: 'Erreur interne du serveur' });
            }

            if (results.length > 0) {
                return res.status(400).json({ error: 'Un utilisateur avec cet email existe déjà.' });
            }

            // Hashage du mot de passe
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insertion de l'utilisateur
            connection.query(
                'INSERT INTO user (name, email, password) VALUES (?, ?, ?)',
                [name, email, hashedPassword],
                (err) => {
                    if (err) {
                        console.error('Erreur SQL : ', err.message);
                        return res.status(500).json({ error: 'Erreur lors de l\'enregistrement de l\'utilisateur' });
                    }
                    res.status(201).json({ message: `Utilisateur ${name} enregistré avec succès.` });
                }
            );
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
});

// Connexion d'un utilisateur
router.post('/login', (req, res) => {
    const email = sanitizeInput(req.body.email);
    const password = req.body.password;

    if (!email || !password) {
        return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
    }

    try {
        connection.query('SELECT * FROM user WHERE email = ?', [email], async (err, results) => {
            if (err) {
                console.error('Erreur SQL : ', err.message);
                return res.status(500).json({ error: 'Erreur interne du serveur' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'Utilisateur non trouvé' });
            }

            const user = results[0];

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Mot de passe invalide' });
            }

            // Génération du token JWT
            const token = jwt.sign(
                { userId: user.id, name: user.name, email: user.email },
                secretKey,
                { expiresIn: '4h' }
            );

            res.status(200).json({ message: 'Connexion réussie', token });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
});

// Middleware pour vérifier le token JWT
const authenticateUser = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token non fourni ou invalide' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded; // Ajoute les infos utilisateur décodées à `req`
        next();
    } catch (err) {
        console.error('Erreur de vérification du token JWT :', err.message);
        return res.status(403).json({ error: 'Token invalide ou expiré' });
    }
};

// Profil utilisateur
router.get('/profile', authenticateUser, (req, res) => {
    const { userId, name, email } = req.user; // Infos extraites du token

    res.status(200).json({
        id: userId,
        name,
        email,
        message: 'Profil récupéré avec succès à partir du token.'
    });
});

// Modification informations utilisateurs
router.put('/edit', authenticateUser, async (req, res) => {
    const { userId } = req.user; // Récupérer l'id utilisateur du token
    const { name, email, password } = req.body;

    // Validation des entrées
    if (!name && !email && !password) {
        return res.status(400).json({ error: 'Aucune information à mettre à jour.' });
    }

    const updateFields = [];
    const updateValues = [];

    if (name) {
        updateFields.push('name = ?');
        updateValues.push(sanitizeInput(name));
    }

    if (email) {
        try {
            const [existingUser] = await connection.promise().query(
                'SELECT id FROM user WHERE email = ? AND id != ?',
                [sanitizeInput(email), userId]
            );

            if (existingUser.length > 0) {
                return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
            }

            updateFields.push('email = ?');
            updateValues.push(sanitizeInput(email));
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur lors de la vérification de l\'email.' });
        }
    }

    if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateFields.push('password = ?');
        updateValues.push(hashedPassword);
    }

    try {
        updateValues.push(userId); // Ajouter l'id de l'utilisateur
        const query = `UPDATE user SET ${updateFields.join(', ')} WHERE id = ?`;

        await connection.promise().query(query, updateValues);
        res.status(200).json({ message: 'Profil mis à jour avec succès.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
    }
});

module.exports = router;