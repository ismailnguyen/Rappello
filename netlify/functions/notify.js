const controller = require('../../controller')

/*
 * This endpoint will send a mail to the recipient with detail of latest RSS feed from rappel.conso.gouv.fr
*/
exports.handler = async function (event, context) {
    return {
        statusCode: 200,
        body: await controller.notify(event.queryStringParameters.email)
    }
};