/**
 * Shared Categories Configuration
 * This is the single source of truth for all category lists
 * Used by: main.js, admin.js, functions/api/admin.js, functions/api/categories.js
 */

const CATEGORIES_LIST = [
    'Icon',
    'Logo',
    'Abstract',
    'Animals',
    'The Arts',
    'Backgrounds',
    'Business',
    'Buildings',
    'Celebrities',
    'Drink',
    'Education',
    'Fashion',
    'Food',
    'Font',
    'Holidays',
    'Industrial',
    'Interiors',
    'Medical',
    'Miscellaneous',
    'Nature',
    'Objects',
    'Outdoor',
    'People',
    'Religion',
    'Science',
    'Sports',
    'Symbols',
    'Technology',
    'Transportation',
    'Vintage'
];

// Export for Node.js (backend)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CATEGORIES_LIST;
}
