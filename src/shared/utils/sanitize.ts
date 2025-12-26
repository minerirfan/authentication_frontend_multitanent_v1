import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html - HTML content to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'span'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'className'],
    KEEP_CONTENT: true,
  });
}

/**
 * Sanitizes text content (removes all HTML tags)
 * @param text - Text content to sanitize
 * @returns Plain text string with HTML removed
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true,
  });
}

/**
 * Sanitizes URL to prevent javascript: and data: attacks
 * @param url - URL to sanitize
 * @returns Sanitized URL
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  
  const lowerUrl = url.toLowerCase();
  
  // Block javascript: and data: protocols
  if (lowerUrl.startsWith('javascript:') || 
      lowerUrl.startsWith('data:') ||
      lowerUrl.startsWith('vbscript:')) {
    return '';
  }
  
  return url;
}

/**
 * Sanitizes object values recursively
 * @param obj - Object to sanitize
 * @returns Sanitized object
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeText(sanitized[key]) as T[Extract<keyof T, string>];
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key]) as T[Extract<keyof T, object>];
    }
  }
  
  return sanitized;
}
