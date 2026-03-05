interface RecipientData {
    email: string;
    name?: string | null;
    phone?: string | null;
    district?: string | null;
    state?: string | null;
}

export function replaceVariables(text: string, recipient: RecipientData): string {
    return text
        .replace(/\$\{name\}/gi, recipient.name || '')
        .replace(/\$\{email\}/gi, recipient.email)
        .replace(/\$\{phone\}/gi, recipient.phone || '')
        .replace(/\$\{district\}/gi, recipient.district || '')
        .replace(/\$\{state\}/gi, recipient.state || '');
}
