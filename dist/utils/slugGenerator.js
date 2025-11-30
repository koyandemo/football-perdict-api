"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateLeagueSlug = exports.generateSlug = void 0;
/**
 * Generate a URL-friendly slug from a string
 * @param text - The text to convert to a slug
 * @returns A URL-friendly slug
 */
const generateSlug = (text) => {
    return text
        .toLowerCase() // Convert to lowercase
        .trim() // Remove leading/trailing whitespace
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};
exports.generateSlug = generateSlug;
/**
 * Generate a league slug from name and country
 * @param name - The league name
 * @param country - The league country
 * @returns A URL-friendly slug combining name and country
 */
const generateLeagueSlug = (name, country) => {
    return `${(0, exports.generateSlug)(name)}-${(0, exports.generateSlug)(country)}`;
};
exports.generateLeagueSlug = generateLeagueSlug;
//# sourceMappingURL=slugGenerator.js.map