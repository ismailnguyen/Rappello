const { fetchApi } = require('./fetchApi')
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

function escapeHtml(value) {
    if (value === undefined || value === null) {
        return '';
    }

    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeHtmlAttribute(value) {
    if (value === undefined || value === null) {
        return '';
    }

    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/'/g, '&#39;');
}

function formatItemDate(value) {
    if (!value) {
        return '';
    }

    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) {
        return '';
    }

    return formatDateFR(d);
}

function toHtmlContent(value) {
    if (!value) {
        return '';
    }

    const asString = String(value);
    if (/<[a-z][\s\S]*>/i.test(asString)) {
        return asString;
    }

    return escapeHtml(asString);
}

function renderInfoLine(label, value, muted = false) {
    if (!value) {
        return '';
    }

    const color = muted ? '#8E8AA8' : '#2D2A44';
    return `<p style="margin:0;font-size:14px;line-height:20px;color:${color};"><span style="font-weight:600;">${escapeHtml(label)} :</span> ${toHtmlContent(value)}</p>`;
}

function renderItemCard(item) {
    const link = item.link ? escapeHtmlAttribute(item.link) : '#';
    const brandText = item.brand ? escapeHtml(item.brand.toUpperCase()) : '';
    const brandBadge = brandText
        ? `<span style="display:inline-block;background:#F7EAF3;color:#A14F9F;font-size:12px;font-weight:600;letter-spacing:0.4px;padding:4px 12px;border-radius:999px;text-transform:uppercase;">${brandText}</span>`
        : '';
    const dateText = formatItemDate(item.pubDate);
    const dateHtml = dateText
        ? `<span style="font-size:12px;color:#8E8AA8;">${escapeHtml(dateText)}</span>`
        : '';
    const titleText = escapeHtml(item.title || 'Rappel conso');
    const titleHtml = item.link
        ? `<a href="${link}" style="color:#1F1B5A;font-size:18px;line-height:24px;font-weight:700;text-decoration:none;">${titleText}</a>`
        : `<span style="color:#1F1B5A;font-size:18px;line-height:24px;font-weight:700;">${titleText}</span>`;
    const imageHtml = item.image
        ? `<img src="${escapeHtmlAttribute(item.image)}" alt="${escapeHtmlAttribute(item.title || 'Illustration du rappel')}" width="120" style="display:block;width:120px;max-width:120px;height:auto;border-radius:12px;">`
        : `<div style="width:120px;height:120px;border-radius:12px;background:#F1F2F8;"></div>`;

    const infoSections = [];
    if (item.reason) {
        infoSections.push(renderInfoLine('Motif', item.reason, true));
    }

    const infoHtml = infoSections.length
        ? `<div style="margin-top:12px;">${infoSections.join('<div style="height:6px;font-size:6px;line-height:6px;">&nbsp;</div>')}</div>`
        : '';

    const categoryLabel = [item.category, item.subCategory]
        .map(part => part ? escapeHtml(part) : '')
        .filter(Boolean)
        .join(' · ');
   

    const arrowHtml = item.link
        ? `<a href="${link}" style="color:#1F1B5A;font-size:20px;line-height:20px;text-decoration:none;">&#8594;</a>`
        : '';

    return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #ECEAF7;border-radius:16px;border-collapse:separate;background:#FFFFFF;">
    <tr>
        <td width="140" style="padding:16px;vertical-align:top;">
            ${imageHtml}
        </td>
        <td style="padding:16px;vertical-align:top;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
                <tr>
                    <td style="vertical-align:top;">${brandBadge}</td>
                </tr>
            </table>
            <div style="margin-top:12px;">${titleHtml}</div>
            ${infoHtml}
        </td>
        <td width="40" style="padding:16px 16px 16px 0;vertical-align:top;text-align:right;">${arrowHtml}</td>
    </tr>
</table>`;
}

function renderHtml(items) {
    if (!Array.isArray(items) || !items.length) {
        return '';
    }

    const rows = items.map((item, index) => {
        const spacer = index === items.length - 1
            ? ''
            : '<tr><td style="height:16px;font-size:16px;line-height:16px;">&nbsp;</td></tr>';

        return `<tr><td>${renderItemCard(item)}</td></tr>${spacer}`;
    }).join('');

    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-family:'Helvetica Neue',Arial,sans-serif;color:#2D2A44;">
        <tbody>${rows}</tbody>
    </table>`;
}

exports.notify = async function (email) {
    if (!email) {
        throw 'Please provide an email'
    }

    try {
        const data = await fetchApi();

        const items = Array.isArray(data.items) ? data.items : [];
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
        const subject = `Rappels consommateurs du ${todayStr}${data.title ? ` - ${data.title}` : ''}`;

        return await sendEmail({
            recipient: email,
            subject,
            content: html
        });
    }
    catch (error) {
        throw error
    }
}
