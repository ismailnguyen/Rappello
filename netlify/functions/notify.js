const controller = require('../../controller')
const { API_KEY } = require('../../config')

/*
 * This endpoint will send a mail to the recipient with detail of latest RSS feed from rappel.conso.gouv.fr
*/
exports.handler = async function (event, context) {
    try {
        const params = event.queryStringParameters || {};
        const headers = event.headers || {};
        const providedKey = params.api_key || headers['x-api-key'] || headers['X-API-Key'];

        if (!API_KEY || providedKey !== API_KEY) {
            return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
        }

        const result = await controller.notify(params.email);
        return { statusCode: 200, body: result };
    } catch (error) {
        return { statusCode: 500, body: (error && error.message) || String(error) };
    }
};
