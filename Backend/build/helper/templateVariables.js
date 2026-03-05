"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceVariables = replaceVariables;
function replaceVariables(text, recipient) {
    return text
        .replace(/\$\{name\}/gi, recipient.name || '')
        .replace(/\$\{email\}/gi, recipient.email)
        .replace(/\$\{phone\}/gi, recipient.phone || '')
        .replace(/\$\{district\}/gi, recipient.district || '')
        .replace(/\$\{state\}/gi, recipient.state || '');
}
//# sourceMappingURL=templateVariables.js.map