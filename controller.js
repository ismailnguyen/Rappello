const { fetchRss } = require('./fetchRss')
const { sendEmail } = require('./email')

function startOfToday() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

function formatDateFR(date) {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}

function renderHtml(items) {
    return items.map(it => `
                <a href="${ it.link }"><b>${ it.title }</b></a>:
                <br>
                <small>${ it.description }</small>
            `).join('<br><br>');
}

exports.notify = async function (email) {
    if (!email) {
        throw 'Please provide an email'
    }

    try {
        const rss = await fetchRss()

        const items = Array.isArray(rss.items) ? rss.items : [];
        const since = startOfToday();
        const todaysItems = items.filter(it => {
            if (!it.pubDate) return true; // include when pubDate missing
            const d = new Date(it.pubDate);
            return d >= since;
        });

        if (!todaysItems.length) {
            return 'No new recalls for today';
        }

        const html = renderHtml(todaysItems);
        const todayStr = formatDateFR(new Date());
        const subject = `Rappels consommateurs du ${todayStr}`;

        try {
            return await sendEmail({
                recipient: email,
                subject,
                content: html
            })
        }
        catch (error) {
            throw error
        }
    }
    catch (error) {
        throw error
    }
}
