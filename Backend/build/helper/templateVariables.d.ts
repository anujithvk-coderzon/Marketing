interface RecipientData {
    email: string;
    name?: string | null;
    phone?: string | null;
    district?: string | null;
    state?: string | null;
}
export declare function replaceVariables(text: string, recipient: RecipientData): string;
export {};
//# sourceMappingURL=templateVariables.d.ts.map