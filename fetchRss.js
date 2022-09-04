const axios = require('axios')
const { XMLParser } = require('fast-xml-parser');
const xmlParser = new XMLParser();

exports.fetchRss = async function () {
    try {
        const res = await axios.get('https://rappel.conso.gouv.fr/rss')

        if (!res || !res.data) {
            throw 'Error: Unable to fetch the RSS feed or empty data'
        }

        const data = xmlParser.parse(res.data)

        if (!data || !data.rss || !data.rss.channel || !data.rss.channel.item) {
            throw 'Error: Unable to parse the RSS feed'
        }

        const { title, item } = data.rss.channel

        if (!title || !item || !item.length) {
            throw 'Error: RSS feed is empty'
        }

        return {
            title: title,
            content: item.map(item => `
                <a href="${ item.link }"><b>${ item.title }</b></a>:
                <br>
                <small>${ item.description }</small>
            `).join('<br><br>')
        }
    } catch (error) {
        throw error
    }
}
