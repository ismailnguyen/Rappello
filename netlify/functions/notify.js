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
    .then(function (response) {
        return JSON.stringify(response.data)
      })
      .catch(function (error) {
        return {
          statusCode: 422,
          body: `Error: ${error}`
        }
      }
};