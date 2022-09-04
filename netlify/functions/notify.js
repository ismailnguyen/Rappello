const controller = require('../../controller')

exports.handler = async function (event, context) {
    return {
        statusCode: 200,
        body: await controller.notify(event.queryStringParameters.email)
    }
};