const express = require('express');
const connection = require('../db');
const { client: PayPalClient, OrdersCreateRequest, OrdersCaptureRequest } = require('../paypal');
const router = express.Router();

router.post('/process-payment', async (req, res) => {
    const { userId, paymentMethod } = req.body;

    if (!userId || !paymentMethod) {
        return res.status(400).json({ error: 'userId et paymentMethod sont obligatoires' });
    }

    try {
        // Récupérer la commande pending de l'utilisateur
        const order = await new Promise((resolve, reject) => {
            connection.query(
                'SELECT id, total FROM Orders WHERE userId = ? AND status = "pending"',
                [userId],
                (err, results) => {
                    if (err) return reject(err);
                    if (results.length === 0) return reject(new Error('Aucune commande en cours trouvée pour cet utilisateur'));
                    resolve(results[0]);
                }
            );
        });

        // Requête PayPal pour créer une commande
        const request = new OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: "USD",
                        value: order.total.toFixed(2),
                    },
                },
            ],
        });

        const createOrderResponse = await PayPalClient.execute(request);

        // Capturer le paiement
        const captureRequest = new OrdersCaptureRequest(createOrderResponse.result.id);
        captureRequest.requestBody({});

        const captureResponse = await PayPalClient.execute(captureRequest);

        // Vérifier le statut du paiement
        if (captureResponse.result.status !== "COMPLETED") {
            return res.status(500).json({ error: 'Échec du traitement du paiement PayPal' });
        }

        // Mettre à jour la commande
        await new Promise((resolve, reject) => {
            connection.query(
                'UPDATE Orders SET status = "completed" WHERE id = ?',
                [order.id],
                (err) => {
                    if (err) return reject(err);
                    resolve();
                }
            );
        });

        res.status(200).json({
            message: 'Paiement réussi et commande complétée',
            orderId: order.id,
            total: order.total,
            paypalOrderId: captureResponse.result.id,
        });

    } catch (error) {
        console.error('Erreur lors du traitement du paiement :', error.message);
        res.status(500).json({ error: error.message || 'Erreur serveur' });
    }
});

module.exports = router;