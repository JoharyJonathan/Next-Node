const paypal = require('@paypal/checkout-server-sdk');
require('dotenv').config();

// Configuration de l'environnement PayPal
const environment = new paypal.core.SandboxEnvironment(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET
);

const client = new paypal.core.PayPalHttpClient(environment);

// Exportez le client ainsi que les classes nécessaires
module.exports = {
    client,
    OrdersCreateRequest: paypal.orders.OrdersCreateRequest,
    OrdersCaptureRequest: paypal.orders.OrdersCaptureRequest,
};