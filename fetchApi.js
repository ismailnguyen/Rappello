const axios = require('axios')

const API_URL = 'https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/rappelconso-v2-gtin-trie/records?where=date_publication%20%3E%20now(days%3D-1)&order_by=date_publication%20desc&limit=20'

function sanitizeString(value) {
    if (value === undefined || value === null) {
        return undefined;
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed.length ? trimmed : undefined;
    }

    return String(value);
}

function normalizeInstructions(rawValue) {
    if (!rawValue) {
        return [];
    }

    return rawValue
        .split('|')
        .map(entry => sanitizeString(entry))
        .filter(Boolean);
}

function formatDescription(record) {
    const sections = [];

    const category = sanitizeString(record.categorie_produit);
    const subCategory = sanitizeString(record.sous_categorie_produit);
    const brand = sanitizeString(record.marque_produit);
    const distributors = sanitizeString(record.distributeurs);
    const risks = sanitizeString(record.risques_encourus);
    const reason = sanitizeString(record.motif_rappel);
    const instructions = normalizeInstructions(sanitizeString(record.conduites_a_tenir_par_le_consommateur));
    const compensation = sanitizeString(record.modalites_de_compensation);
    const contact = sanitizeString(record.numero_contact);
    const extra = sanitizeString(record.informations_complementaires_publiques);
    const pdfLink = sanitizeString(record.lien_vers_affichette_pdf);

    if (category || subCategory) {
        sections.push(`<b>Catégorie :</b> ${[category, subCategory].filter(Boolean).join(' / ')}`);
    }

    if (brand) {
        sections.push(`<b>Marque :</b> ${brand}`);
    }

    if (distributors) {
        sections.push(`<b>Distributeurs :</b> ${distributors}`);
    }

    if (reason) {
        sections.push(`<b>Motif :</b> ${reason}`);
    }

    if (risks) {
        sections.push(`<b>Risques :</b> ${risks}`);
    }

    if (instructions.length) {
        sections.push(`<b>Consignes :</b> ${instructions.join(', ')}`);
    }

    if (compensation) {
        sections.push(`<b>Compensation :</b> ${compensation}`);
    }

    if (contact) {
        sections.push(`<b>Contact :</b> ${contact}`);
    }

    if (extra) {
        sections.push(`<b>Informations complémentaires :</b> ${extra.replace(/¤/g, '<br>')}`);
    }

    if (pdfLink) {
        sections.push(`<a href="${pdfLink}">Affichette PDF</a>`);
    }

    return sections.join('<br>');
}

exports.fetchApi = async function () {
    try {
        const res = await axios.get(API_URL);

        if (!res || !res.data) {
            throw 'Error: Unable to fetch the API data or empty response';
        }

        const { results, total_count: totalCount } = res.data;

        if (!Array.isArray(results)) {
            throw 'Error: Unexpected API response format';
        }

        const items = results.map(record => {
            const publicationDate = sanitizeString(record.date_publication);
            const pubDate = publicationDate ? new Date(publicationDate) : undefined;
            const link = sanitizeString(record.lien_vers_la_fiche_rappel)
                || sanitizeString(record.lien_vers_affichette_pdf)
                || sanitizeString(record.lien_vers_la_liste_des_produits)
                || undefined;
            const image = sanitizeString(record.liens_vers_les_images);
            const category = sanitizeString(record.categorie_produit);
            const subCategory = sanitizeString(record.sous_categorie_produit);
            const brand = sanitizeString(record.marque_produit);
            const risks = sanitizeString(record.risques_encourus);
            const reason = sanitizeString(record.motif_rappel);
            const instructions = normalizeInstructions(sanitizeString(record.conduites_a_tenir_par_le_consommateur));
            const compensation = sanitizeString(record.modalites_de_compensation);
            const contact = sanitizeString(record.numero_contact);
            const extraInfo = sanitizeString(record.informations_complementaires_publiques);

            const title = sanitizeString(record.libelle)
                || sanitizeString(record.modeles_ou_references)
                || sanitizeString(record.marque_produit)
                || sanitizeString(record.numero_fiche)
                || 'Rappel conso';

            return {
                id: sanitizeString(record.rappel_guid)
                    || sanitizeString(record.numero_fiche)
                    || sanitizeString(record.id)
                    || title,
                title,
                link,
                description: formatDescription(record),
                pubDate: pubDate ? pubDate.toISOString() : undefined,
                image,
                brand,
                category,
                subCategory,
                risks,
                reason,
                instructions,
                compensation,
                contact,
                extraInfo,
                source: 'api'
            };
        });

        const contentTitle = totalCount ? `Derniers rappels (${totalCount})` : 'Derniers rappels';

        const content = items.map(it => `
                <a href="${ it.link || '#' }"><b>${ it.title }</b></a>:
                <br>
                ${ it.image ? `<img src="${ it.image }" alt="${ it.title }" style="max-width:100%;height:auto;" />
                <br>
                ` : '' }${ it.description }
            `).join('<br><br>')

        return { title: contentTitle, items, content };
    } catch (error) {
        throw error;
    }
}

