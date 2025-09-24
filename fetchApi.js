const axios = require('axios')

const API_URL = 'https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/rappelconso-v2-gtin-espaces/records?where=date_publication%20%3E%20now(days%3D-1)'

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

function extractFirstImageUrl(value) {
    if (value === undefined || value === null) {
        return undefined;
    }

    const candidates = String(value)
        .split('|')
        .map(entry => sanitizeString(entry))
        .filter(Boolean);

    return candidates.length ? candidates[0] : undefined;
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
            const image = extractFirstImageUrl(record.liens_vers_les_images);
            const category = sanitizeString(record.categorie_produit);
            const subCategory = sanitizeString(record.sous_categorie_produit);
            const brand = sanitizeString(record.marque_produit);
            const reason = sanitizeString(record.motif_rappel);

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
                pubDate: pubDate ? pubDate.toISOString() : undefined,
                image,
                brand,
                category,
                subCategory,
                reason,
            };
        });

        const contentTitle = totalCount ? `Derniers rappels (${totalCount})` : 'Derniers rappels';

        return {
            title: contentTitle,
            items
        };
    } catch (error) {
        throw error;
    }
}
