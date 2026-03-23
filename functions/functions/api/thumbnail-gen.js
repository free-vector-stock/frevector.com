/**
 * Thumbnail Generation Utility - DEACTIVATED
 * Cloudflare Workers compatible - no external dependencies
 * Returns original JPEG buffer as thumbnail (resizing disabled as per requirements)
 */

export async function generateThumbnail(jpegBuffer, maxWidth = 400) {
    // Thumbnail generation is disabled. Returning original buffer.
    return jpegBuffer;
}

export function getThumbnailKey(category, id) {
    return `${category}/${id}/${id}-thumb.jpg`;
}

export function getOriginalKey(category, id) {
    return `${category}/${id}/${id}.jpg`;
}
