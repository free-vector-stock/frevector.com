/**
 * Thumbnail Generation Utility
 * Generates thumbnails from JPEG images using sharp
 * Thumbnails are stored as separate files with -thumb.jpg suffix
 */

let sharp;

async function initSharp() {
    if (!sharp) {
        try {
            sharp = await import('sharp');
            sharp = sharp.default;
        } catch (e) {
            console.warn('Sharp not available, using original image as thumbnail');
            return null;
        }
    }
    return sharp;
}

export async function generateThumbnail(jpegBuffer, maxWidth = 512) {
    try {
        const sharpLib = await initSharp();
        if (!sharpLib) return jpegBuffer;
        
        // Resize to max width, maintaining aspect ratio
        const thumbnail = await sharpLib(jpegBuffer)
            .resize(maxWidth, null, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: 80, progressive: true })
            .toBuffer();
        
        return thumbnail;
    } catch (e) {
        console.error('Thumbnail generation failed:', e);
        // Fallback: return original
        return jpegBuffer;
    }
}

export function getThumbnailKey(category, id) {
    return `${category}/${id}/${id}-thumb.jpg`;
}

export function getOriginalKey(category, id) {
    return `${category}/${id}/${id}.jpg`;
}
