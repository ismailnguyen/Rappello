const express = require('express')
const app = express()
const controller = require('./controller')
const { PORT } = require('./config');

/*
 * This endpoint will send a mail to the recipient with detail of latest RSS feed from rappel.conso.gouv.fr
*/
app.get('/notify', (request, response) => {
  const result = controller.notify(request.query.email);

  response.status(200).json(result);
})

app.listen(PORT, () => {
  console.log(`App now running on port ${PORT}`)
})
