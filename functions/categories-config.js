/**
 * Shared Categories Configuration
 * This is the single source of truth for all category lists
 * Used by: main.js, admin.js, functions/api/admin.js, functions/api/categories.js
 */

const CATEGORIES_LIST = [
    'Abstract',
    'Animals',
    'The Arts',
    'Backgrounds',
    'Fashion',
    'Buildings',
    'Business',
    'Celebrities',
    'Education',
    'Food',
    'Drink',
    'Medical',
    'Holidays',
    'Industrial',
    'Interiors',
    'Miscellaneous',
    'Nature',
    'Objects',
    'Outdoor',
    'People',
    'Religion',
    'Science',
    'Symbols',
    'Sports',
    'Technology',
    'Transportation',
    'Vintage',
    'Logo',
    'Font',
    'Icon'
];

// Export for Node.js (backend)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CATEGORIES_LIST;
}
