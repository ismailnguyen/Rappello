const express = require('express')
const app = express()
const controller = require('./controller')
const { PORT, API_KEY } = require('./config');

/*
 * This endpoint will send a mail to the recipient with detail of latest RSS feed from rappel.conso.gouv.fr
*/
app.get('/notify', async (request, response) => {
  try {
    const providedKey = request.query.api_key || request.headers['x-api-key'];
    if (!API_KEY || providedKey !== API_KEY) {
      return response.status(401).json({ error: 'Unauthorized' });
    }

    const email = request.query.email;
    const result = await controller.notify(email);
    return response.status(200).json({ message: result });
  } catch (error) {
    return response.status(500).json({ error: (error && error.message) || String(error) });
  }
})

app.listen(PORT, () => {
  console.log(`App now running on port ${PORT}`)
})
