/**
 * Extracts the initials from a full name.
 * @param name - The full name from which to extract initials.
 * @returns The initials of the provided name. If the name contains only one word,
 *          it returns the first character of that word. If the name contains two or more words,
 *          it returns the first character of the first two words.
 */
export const getInitials = (name: string): string => {
    const [firstName, lastName] = name.split(" ");
    return (firstName?.charAt(0) ?? "") + (lastName ? lastName.charAt(0) : "");
};

export function wrapText(text: string, maxLength: number) {
    if (text.length <= maxLength) return text;
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        if (currentLine.length + 1 + words[i].length <= maxLength) {
            currentLine += " " + words[i];
        } else {
            lines.push(currentLine);
            currentLine = words[i];
        }
    }
    lines.push(currentLine);
    return lines;
}

/**
 * Sanitizes a string by removing HTML tags.
 * @param text - The string to sanitize.
 * @returns The sanitized string.
 */
export const sanitizeHtml = (text: string): string => {
    return text.replace(/<[^>]*>?/gm, "");
};
