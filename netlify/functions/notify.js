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
            console.log('result', result);
        }
    };


        console.log('calling axios from start point')
    const axios = require('axios')
    axios
    .get('https://rappel.conso.gouv.fr/rss')
    .then((response) => { return console.log(response.data) })
  .catch((error) => { return console.log(error) })
    
    controller.notify(request, response);

    return {
        statusCode: 200,
        body: body
    }
};