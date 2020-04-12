const Express = require('express');
require('dotenv').config()
const Webhook = require('coinbase-commerce-node').Webhook;

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
    //2. Make Network call to the backeend to send the webhook event paylod...

	response.status(200).send('Signed Webhook Received: ' + event.id);
});

app.use(rawBody);
app.use(router);

app.listen(process.env.PORT, function () {
	console.log(`Crypto Payment Webhook Service listening on port ${process.env.PORT}!`);
});