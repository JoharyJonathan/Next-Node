const paypal = require('@paypal/checkout-server-sdk');
require('dotenv').config();

// Paypal configuration
const environment = new paypal.core.SandboxEnvironment(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET
);

const client = new paypal.core.PayPalHttpClient(environment);

module.exports = client;