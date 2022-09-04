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
    const resp = await axios.get('https://rappel.conso.gouv.fr/rss')
      console.log(resp.data);

      return {
        statusCode: 200,
        body: JSON.stringify({ message: resp.data }),
      };
};