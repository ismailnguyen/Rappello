const axios = require('axios')
const { XMLParser } = require('fast-xml-parser');
const xmlParser = new XMLParser();

exports.fetchRss = function (success, failure) {
    axios
    .get('https://rappel.conso.gouv.fr/rss')
    .then(res => {
        if (!res || !res.data) {
            failure('Error: Unable to fetch the RSS feed or empty data');
            return;
        }

        const data = xmlParser.parse(res.data);

        if (!data || !data.rss || !data.rss.channel || !data.rss.channel.item) {
            failure('Error: Unable to parse the RSS feed');
            return;
        }

        const { title, item } = data.rss.channel;

        if (!title || !item || !item.length) {
            failure('Error: RSS feed is empty');
            return;
        }

        success({
            title: title,
            content: item.map(item => `
                <a href="${ item.link }"><b>${ item.title }</b></a>:
                <br>
                <small>${ item.description }</small>
            `).join('<br><br>')
        })
    })
    .catch((error) => failure(error))
}
