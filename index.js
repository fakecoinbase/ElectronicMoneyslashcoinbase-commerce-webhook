const express = require('express')
require('dotenv').config()

const app = express()
const port = 3000

//Coinbase Commerce Seceret from environment varible
COINBASE_COMMERCE_SECRET = process.env.COINBASE_COMMERCE_SECRET

app.get('/', (req, res) => res.send('Webhook App!'))

app.listen(port, () => console.log(`Webhook app listening at http://localhost:${port} with secrete code of ${COINBASE_COMMERCE_SECRET}`))