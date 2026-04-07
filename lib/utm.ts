export type UtmParams = {
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    utmTerm: string | null;
    utmContent: string | null;
}

export function parseUtmParams(searchParams: URLSearchParams): UtmParams {
    const clean= (raw: string | null): string | null => {
        const t = raw?.trim();
        return t && t.length > 0 ? t : null;
    }
    return {
        utmSource: clean(searchParams.get('utm_source')),
        utmMedium: clean(searchParams.get('utm_medium')),
        utmCampaign: clean(searchParams.get('utm_campaign')),
        utmTerm: clean(searchParams.get('utm_term')),
        utmContent: clean(searchParams.get('utm_content'))
    };
}