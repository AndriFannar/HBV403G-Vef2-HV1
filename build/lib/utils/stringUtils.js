/**
 * @file stringUtils.js
 * @description Utility functions for working with strings.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date Febuary 6, 2025
 */
/**
 * Escape HTML special characters.
 * @param {String} string - The string to escape.
 * @returns {String} - The escaped string.
 */
export function escapeHtml(string) {
    return string
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
