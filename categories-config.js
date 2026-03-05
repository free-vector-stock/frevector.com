/**
 * Shared Categories Configuration
 * This is the single source of truth for all category lists
 * Used by: main.js, admin.js, functions/api/admin.js, functions/api/categories.js
 */

const CATEGORIES_LIST = [
    'Abstract',
    'Animals/Wildlife',
    'The Arts',
    'Backgrounds/Textures',
    'Beauty/Fashion',
    'Buildings/Landmarks',
    'Business/Finance',
    'Celebrities',
    'Drink',
    'Education',
    'Font',
    'Food',
    'Healthcare/Medical',
    'Holidays',
    'Icon',
    'Industrial',
    'Interiors',
    'Logo',
    'Miscellaneous',
    'Nature',
    'Objects',
    'Parks/Outdoor',
    'People',
    'Religion',
    'Science',
    'Signs/Symbols',
    'Sports/Recreation',
    'Technology',
    'Transportation',
    'Vintage'
];

// Export for Node.js (backend)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CATEGORIES_LIST;
}
