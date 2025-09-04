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

        const items = item.map(it => {
            const guid = it.guid && (typeof it.guid === 'string' ? it.guid : (it.guid['#text'] || it.guid.text));
            const pubDate = it.pubDate ? new Date(it.pubDate) : undefined;
            return {
                id: guid || it.link || it.title,
                title: it.title,
                link: it.link,
                description: it.description,
                pubDate: pubDate ? pubDate.toISOString() : undefined
            };
        });

        const content = items.map(it => `
                <a href="${ it.link }"><b>${ it.title }</b></a>:
                <br>
                <small>${ it.description }</small>
            `).join('<br><br>')

        return { title, items, content }
    } catch (error) {
        throw error
    }
}
