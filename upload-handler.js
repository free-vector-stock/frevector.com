/**
 * Advanced Smart Vector Upload Handler
 * Handles bulk uploads with automatic analysis, metadata generation, and preview normalization
 */

class VectorUploadHandler {
  constructor() {
    this.SUPPORTED_FORMATS = ['.json', '.jpg', '.jpeg', '.zip'];
    this.ZIP_CONTENT_TYPES = ['eps', 'svg', 'ai', 'jpeg', 'jpg'];
    this.MAX_PREVIEW_SIZE = 800; // pixels
    this.PREVIEW_SIZES = [300, 800];
    this.CATEGORIES = [
      'Abstract', 'Animals', 'The Arts', 'Backgrounds', 'Fashion', 'Buildings', 'Business', 'Celebrities',
      'Education', 'Food', 'Drink', 'Medical', 'Holidays', 'Industrial', 'Interiors', 'Miscellaneous',
      'Nature', 'Objects', 'Outdoor', 'People', 'Religion', 'Science', 'Symbols', 'Sports',
      'Technology', 'Transportation', 'Vintage', 'Logo', 'Font', 'Icon'
    ];
  }

  /**
   * Parse uploaded files and group them by base name
   */
  groupFilesByName(files) {
    const groups = {};
    
    for (const file of files) {
      const baseName = this.getBaseName(file.name);
      if (!groups[baseName]) {
        groups[baseName] = { json: null, jpeg: null, zip: null };
      }
      
      const ext = this.getFileExtension(file.name).toLowerCase();
      if (ext === '.json') groups[baseName].json = file;
      else if (['.jpg', '.jpeg'].includes(ext)) groups[baseName].jpeg = file;
      else if (ext === '.zip') groups[baseName].zip = file;
    }
    
    return groups;
  }

  /**
   * Get base filename without extension
   */
  getBaseName(filename) {
    return filename.replace(/\.[^/.]+$/, '');
  }

  /**
   * Get file extension
   */
  getFileExtension(filename) {
    const match = filename.match(/\.[^/.]+$/);
    return match ? match[0] : '';
  }

  /**
   * Analyze ZIP file contents
   */
  async analyzeZipContents(zipFile) {
    try {
      const JSZip = window.JSZip || await this.loadJSZip();
      const zip = new JSZip();
      const zipData = await zipFile.arrayBuffer();
      await zip.loadAsync(zipData);
      
      const contents = {
        files: [],
        hasEps: false,
        hasSvg: false,
        hasAi: false,
        hasJpeg: false,
        jpegFiles: []
      };
      
      zip.forEach((relativePath, file) => {
        const ext = this.getFileExtension(relativePath).toLowerCase();
        contents.files.push({ name: relativePath, ext });
        
        if (ext === '.eps') contents.hasEps = true;
        if (ext === '.svg') contents.hasSvg = true;
        if (ext === '.ai') contents.hasAi = true;
        if (['.jpg', '.jpeg'].includes(ext)) {
          contents.hasJpeg = true;
          contents.jpegFiles.push(relativePath);
        }
      });
      
      return contents;
    } catch (e) {
      return { error: `ZIP analysis failed: ${e.message}`, files: [] };
    }
  }

  /**
   * Validate metadata JSON
   */
  validateMetadata(metadata) {
    const required = ['title', 'category', 'description', 'keywords'];
    const missing = [];
    const issues = [];
    
    for (const field of required) {
      if (!metadata[field]) {
        missing.push(field);
      } else if (Array.isArray(metadata[field]) && metadata[field].length === 0) {
        missing.push(field);
      }
    }
    
    if (!this.CATEGORIES.includes(metadata.category)) {
      issues.push(`Invalid category: ${metadata.category}`);
    }
    
    if (Array.isArray(metadata.keywords) && metadata.keywords.length < 3) {
      issues.push(`Insufficient keywords (${metadata.keywords.length}/3 minimum)`);
    }
    
    return {
      isValid: missing.length === 0 && issues.length === 0,
      missing,
      issues,
      hasAllFields: missing.length === 0
    };
  }

  /**
   * Generate metadata from file info and content
   */
  async generateMetadata(baseName, zipContents, jpegFile = null) {
    const title = this.titleFromFileName(baseName);
    const category = await this.guessCategory(baseName, jpegFile);
    const keywords = this.generateKeywords(baseName, title);
    const description = this.generateDescription(title, baseName);
    
    return {
      title,
      category,
      description,
      keywords,
      generated: true
    };
  }

  /**
   * Convert filename to title
   */
  titleFromFileName(filename) {
    return filename
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
      .trim();
  }

  /**
   * Guess category from filename
   */
  async guessCategory(filename, jpegFile = null) {
    const lower = filename.toLowerCase();
    
    // Simple keyword-based guessing
    const categoryMap = {
      'abstract': 'Abstract',
      'animal': 'Animals',
      'nature': 'Nature',
      'background': 'Backgrounds',
      'icon': 'Icon',
      'logo': 'Logo',
      'food': 'Food',
      'tech': 'Technology',
      'business': 'Business',
      'people': 'People',
      'building': 'Buildings',
      'fashion': 'Fashion',
      'medical': 'Medical',
      'holiday': 'Holidays',
      'sport': 'Sports',
      'transport': 'Transportation',
      'vintage': 'Vintage'
    };
    
    for (const [key, cat] of Object.entries(categoryMap)) {
      if (lower.includes(key)) return cat;
    }
    
    return 'Miscellaneous';
  }

  /**
   * Generate keywords from filename
   */
  generateKeywords(filename, title) {
    const words = filename
      .toLowerCase()
      .replace(/[-_]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2);
    
    const keywords = [...new Set(words)].slice(0, 10);
    
    if (keywords.length < 3) {
      keywords.push(title.toLowerCase());
    }
    
    return keywords.slice(0, 10);
  }

  /**
   * Generate description
   */
  generateDescription(title, filename) {
    return `Professional vector graphic: ${title}. High-quality design asset suitable for various projects.`;
  }

  /**
   * Normalize preview image
   */
  async normalizePreviewImage(jpegFile) {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          // Set canvas to max size
          canvas.width = this.MAX_PREVIEW_SIZE;
          canvas.height = this.MAX_PREVIEW_SIZE;
          
          // Calculate scaling to fit
          const scale = Math.min(
            canvas.width / img.width,
            canvas.height / img.height
          );
          
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const x = (canvas.width - scaledWidth) / 2;
          const y = (canvas.height - scaledHeight) / 2;
          
          // Fill white background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw image centered
          ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
          
          // Convert to blob
          canvas.toBlob(blob => {
            resolve(blob);
          }, 'image/jpeg', 0.85);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(jpegFile);
      });
    } catch (e) {
      return jpegFile; // Return original if normalization fails
    }
  }

  /**
   * Check for duplicate content
   */
  async checkDuplicate(metadata, zipFile, existingVectors = []) {
    const title = metadata.title || '';
    
    // Check if title already exists
    const titleMatch = existingVectors.find(v => 
      v.title && v.title.toLowerCase() === title.toLowerCase()
    );
    
    if (titleMatch) {
      return {
        isDuplicate: true,
        reason: 'Title already exists',
        existingVector: titleMatch
      };
    }
    
    return { isDuplicate: false };
  }

  /**
   * Generate upload report
   */
  generateReport(results) {
    const report = {
      timestamp: new Date().toISOString(),
      totalFiles: results.length,
      successful: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'error').length,
      warnings: results.filter(r => r.status === 'warning').length,
      details: results,
      summary: {
        missingMetadata: results.filter(r => r.missingMetadata).length,
        missingPreview: results.filter(r => r.missingPreview).length,
        duplicates: results.filter(r => r.duplicate).length,
        missingZip: results.filter(r => r.missingZip).length,
        errors: results.filter(r => r.error).length
      }
    };
    
    return report;
  }

  /**
   * Load JSZip library if not available
   */
  async loadJSZip() {
    if (window.JSZip) return window.JSZip;
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      script.onload = () => resolve(window.JSZip);
      script.onerror = () => reject(new Error('Failed to load JSZip'));
      document.head.appendChild(script);
    });
  }

  /**
   * Get status badge for vector package
   */
  getStatusBadge(validation) {
    if (validation.error) return 'Hata';
    if (validation.duplicate) return 'Duplicate';
    if (!validation.hasJson) return 'Eksik Metadata';
    if (!validation.hasJpeg) return 'Eksik Preview';
    if (!validation.hasZip) return 'Eksik ZIP';
    return 'Hazır';
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VectorUploadHandler;
}
