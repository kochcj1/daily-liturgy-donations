const express = require('express');
const bodyParser = require('body-parser');
const Stripe = require('stripe');

const app = express();
const port = process.env.PORT;
const API_KEY = process.env.API_KEY;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;

// Middleware for making sure a valid API key is provided with every API request.
// See https://stackoverflow.com/a/46094495/3987765.
app.use((request, response, next) => {
  if (request.headers.authorization !== `Basic ${API_KEY}`) {
    return response.status(401).json({ error: "Invalid credentials sent as part of header 'Authorization: Basic <API key>'" });
  }
  next();
});

// So that we can parse requests that have JSON bodies:
app.use(bodyParser.json());

app.get('/publishable-key', (request, response) => {
  response.send({ publishableKey: STRIPE_PUBLISHABLE_KEY });
});

app.post('/payment-intents', async (request, response) => {
  // For most up-to-date version, see https://stripe.com/docs/api/versioning?lang=go
  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2020-08-27'
  });

  const { amount } = request.body;
  const params = {
    amount: 100 * amount, // dollars to cents
    currency: 'usd'
  };

  try {
    const paymentIntent = await stripe.paymentIntents.create(params);
    response.send({ clientSecret: paymentIntent.client_secret });
  }
  catch (error) {
    response.send({ error: error.raw.message });
  }
});

app.listen(port, () => {
  console.log(`App listening on port ${port}...`);
});
