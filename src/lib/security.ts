/**
 * Security Utilities
 * Provides input validation, sanitization, and security helpers
 */

// ==================== INPUT VALIDATION ====================

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates phone number (international format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s-()]/g, ''));
}

/**
 * Validates strong password
 * - At least 8 characters
 * - Contains uppercase, lowercase, number, and special character
 */
export function isValidPassword(password: string): boolean {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumber &&
    hasSpecialChar
  );
}

/**
 * Validates user role
 */
export function isValidRole(role: string): boolean {
  const validRoles = ['super_admin', 'school_admin', 'teacher', 'student', 'parent'];
  return validRoles.includes(role);
}

/**
 * Validates that a role can be assigned by the current user
 */
export function canAssignRole(currentUserRole: string, targetRole: string): boolean {
  if (currentUserRole === 'super_admin') {
    return true; // Super admin can assign any role
  }
  
  if (currentUserRole === 'school_admin') {
    // School admin cannot create super_admin
    return targetRole !== 'super_admin';
  }
  
  return false; // Others cannot assign roles
}

// ==================== INPUT SANITIZATION ====================

/**
 * Sanitizes string input by removing dangerous characters
 */
export function sanitizeString(input: string): string {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

/**
 * Sanitizes HTML content (for rich text)
 */
export function sanitizeHTML(html: string): string {
  if (!html) return '';
  
  // Remove script tags and dangerous attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}

/**
 * Sanitizes file name
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName) return '';
  
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .substring(0, 255); // Limit length
}

// ==================== RATE LIMITING ====================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check if action is rate limited
 * @param key - Unique identifier (e.g., userId + action)
 * @param maxAttempts - Maximum attempts allowed
 * @param windowMs - Time window in milliseconds
 */
export function isRateLimited(
  key: string,
  maxAttempts: number = 10,
  windowMs: number = 60000 // 1 minute default
): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired entry
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    });
    return false;
  }
  
  if (entry.count >= maxAttempts) {
    return true; // Rate limited
  }
  
  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);
  return false;
}

/**
 * Clear rate limit for a key
 */
export function clearRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Clean up expired rate limit entries
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(cleanupRateLimits, 5 * 60 * 1000);
}

// ==================== XSS PROTECTION ====================

/**
 * Escapes HTML entities to prevent XSS
 */
export function escapeHTML(text: string): string {
  if (!text) return '';
  
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Unescapes HTML entities
 */
export function unescapeHTML(text: string): string {
  if (!text) return '';
  
  const map: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#x2F;': '/',
  };
  
  return text.replace(/&amp;|&lt;|&gt;|&quot;|&#x27;|&#x2F;/g, (entity) => map[entity]);
}

// ==================== CSRF PROTECTION ====================

/**
 * Generates a CSRF token
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validates CSRF token
 */
export function validateCSRFToken(token: string, storedToken: string): boolean {
  return token === storedToken && token.length === 64;
}

// ==================== DATA VALIDATION ====================

/**
 * Validates student data
 */
export function validateStudentData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.name || data.name.length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  
  if (!data.rollNumber || data.rollNumber.length < 1) {
    errors.push('Roll number is required');
  }
  
  if (!data.classId) {
    errors.push('Class is required');
  }
  
  if (!data.schoolId) {
    errors.push('School is required');
  }
  
  if (data.guardianPhone && !isValidPhone(data.guardianPhone)) {
    errors.push('Invalid guardian phone number');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates school data
 */
export function validateSchoolData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.name || data.name.length < 3) {
    errors.push('School name must be at least 3 characters');
  }
  
  if (!data.address || data.address.length < 5) {
    errors.push('Address must be at least 5 characters');
  }
  
  if (!data.phone || !isValidPhone(data.phone)) {
    errors.push('Invalid phone number');
  }
  
  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Invalid email address');
  }
  
  if (!data.principalName || data.principalName.length < 2) {
    errors.push('Principal name is required');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates user data
 */
export function validateUserData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Invalid email address');
  }
  
  if (!data.name || data.name.length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  
  if (!data.role || !isValidRole(data.role)) {
    errors.push('Invalid role');
  }
  
  if (data.phone && !isValidPhone(data.phone)) {
    errors.push('Invalid phone number');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// ==================== FILE UPLOAD SECURITY ====================

/**
 * Validates file type
 */
export function isValidFileType(fileName: string, allowedTypes: string[]): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension ? allowedTypes.includes(extension) : false;
}

/**
 * Validates file size
 */
export function isValidFileSize(fileSize: number, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return fileSize <= maxSizeBytes;
}

/**
 * Validates image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const maxSizeMB = 5;
  
  if (!isValidFileType(file.name, allowedTypes)) {
    return { valid: false, error: 'Invalid file type. Allowed: JPG, PNG, GIF, WebP' };
  }
  
  if (!isValidFileSize(file.size, maxSizeMB)) {
    return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }
  
  return { valid: true };
}

// ==================== SECURITY HEADERS ====================

/**
 * Security headers for API responses
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
};
