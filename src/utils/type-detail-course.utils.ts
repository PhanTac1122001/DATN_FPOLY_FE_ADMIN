export function getEmbeddableUrl(url: string): { embedUrl: string; canEmbed: boolean } {
    if (!url) return { embedUrl: "", canEmbed: false };

    // Google Drive file view
    const driveFileRegex = /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
    if (driveFileRegex.test(url)) {
        const match = url.match(driveFileRegex);
        if (match && match[1]) {
            return {
                embedUrl: `https://drive.google.com/file/d/${match[1]}/preview`,
                canEmbed: true,
            };
        }
    }

    // Google Docs view/edit
    const googleDocRegex = /https:\/\/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/;
    if (googleDocRegex.test(url)) {
        const match = url.match(googleDocRegex);
        if (match && match[1]) {
            return {
                embedUrl: `https://docs.google.com/document/d/${match[1]}/preview`,
                canEmbed: true,
            };
        }
    }

    // If it's a PDF link or S3 PDF link
    if (url.toLowerCase().endsWith(".pdf") || url.toLowerCase().includes(".pdf")) {
        return { embedUrl: url, canEmbed: true };
    }

    // Otherwise, normal websites (e.g. app.xmind.com, external drive folder links, v.v.) are likely not embeddable
    return { embedUrl: url, canEmbed: false };
}
