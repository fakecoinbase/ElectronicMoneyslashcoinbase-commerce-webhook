const Express = require('express');
require('dotenv').config()
const Webhook = require('coinbase-commerce-node').Webhook;
const axios = require('axios')

/**
 * Past your webhook secret from Settings/Webhook section
 */
const webhookSecret =  process.env.COINBASE_COMMERCE_SECRET;
const router = Express.Router();
const app = Express();

function rawBody(req, res, next) {
	req.setEncoding('utf8');

	let data = '';

	req.on('data', function (chunk) {
		data += chunk;
	});

	req.on('end', function () {
		req.rawBody = data;

		next();
	});
}

router.post('/payment_webhook', function (request, response) {
	let event;

	console.log(request.headers);

	try {
		event = Webhook.verifyEventBody(
			request.rawBody,
			request.headers['x-cc-webhook-signature'],
			webhookSecret
		);
	} catch (error) {
		console.log('Error occured', error.message);

		return response.status(400).send('Webhook Error:' + error.message);
	}

    //1. Log the webhook event to the consle
    console.log('Success', event);

    // The Payment Payload Object
    const paymentPayload = {
        payment_reference_number: event.id,
        payment_code:event.data.code,
        event_type: event.type,
        hosted_url: event.data.hosted_url,
        currency: event.data.pricing.local.currency,
        amount: event.data.pricing.local.amount
    }

    console.log(paymentPayload);

    //2. Make Network call to the backeend to send the webhook event paylod...
    //The base uri
    const CRYPTO_PAYMENT_URL = process.env.CRYPTO_PAYMENT_BASE_URI;

    // Post Data function
   const postPaymentPayload =  async () => {
        // Make an API Call
        try {
            // Make an API Call
            const response =  await axios.post(CRYPTO_PAYMENT_URL, paymentPayload);
            console.log(response.data);
        } catch(error) {
            console.log(error);
        }
    }

    // Make the acutal network call
    postPaymentPayload();

	response.status(200).send('Signed Webhook Received: ' + event.id);
});

app.use(rawBody);
app.use(router);

app.listen(process.env.PORT, function () {
	console.log(`Crypto Payment Webhook Service listening on port ${process.env.PORT}!`);
});