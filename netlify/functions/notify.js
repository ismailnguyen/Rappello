const req = require('express/lib/request');
const controller = require('../../controller')

exports.handler = async function (event, context) {
    let body = '';

    const request = {
        query: {
            email: event.queryStringParameters.email
        }
    };

    const response = {
        send: (result) => {
            body = result;
        }
    };
    
    controller.notify(request, response);

    return {
        statusCode: 200,
        body: body
    }
};