const express = require('express')
const app = express()
const controller = require('./controller')
const { PORT } = require('./config');

/*
 * This endpoint will send a mail to the recipient to ask to acknowledge if he is still alive
*/
app.get('/notify', controller.notify)

app.listen(PORT, () => {
  console.log(`App now running on port ${PORT}`)
})
