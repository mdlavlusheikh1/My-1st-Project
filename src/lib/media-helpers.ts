import { MediaRecord, getUserMedia, getSchoolGallery } from './firebase-imagekit';
import { transformImageUrl } from './imagekit-utils';

// Helper hooks and utilities for using media in React components

/**
 * Get user's profile image URL with optimization
 */
export function getUserProfileImage(
  media: MediaRecord[], 
  userId: string,
  size: 'small' | 'medium' | 'large' = 'medium'
): string | null {
  const userMedia = media.find(m => m.userId === userId && m.type === 'image');
  if (!userMedia) return null;

  const sizeMap = {
    small: { width: 64, height: 64 },
    medium: { width: 200, height: 200 },
    large: { width: 400, height: 400 }
  };

  return transformImageUrl(userMedia.url, {
    ...sizeMap[size],
    crop: 'force',
    format: 'webp',
    quality: 85
  });
}

/**
 * Get school logo URL with optimization
 */
export function getSchoolLogo(
  media: MediaRecord[],
  size: 'small' | 'medium' | 'large' = 'medium'
): string | null {
  const logo = media.find(m => m.category === 'school' && m.type === 'image');
  if (!logo) return null;

  const sizeMap = {
    small: { width: 100, height: 100 },
    medium: { width: 200, height: 200 },
    large: { width: 400, height: 400 }
  };

  return transformImageUrl(logo.url, {
    ...sizeMap[size],
    crop: 'maintain_ratio',
    format: 'png',
    quality: 95
  });
}

/**
 * Get gallery images for slideshow
 */
export function getGalleryImages(
  media: MediaRecord[],
  limit?: number
): Array<{ url: string; thumbnail: string; title: string }> {
  const galleryMedia = media
    .filter(m => m.category === 'gallery' && m.type === 'image')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const limitedMedia = limit ? galleryMedia.slice(0, limit) : galleryMedia;

  return limitedMedia.map(m => ({
    url: transformImageUrl(m.url, {
      width: 1200,
      height: 800,
      crop: 'at_max',
      format: 'webp',
      quality: 90
    }),
    thumbnail: transformImageUrl(m.url, {
      width: 300,
      height: 200,
      crop: 'force',
      format: 'webp',
      quality: 80
    }),
    title: m.name
  }));
}

/**
 * Generate responsive image srcSet for better performance
 */
export function generateResponsiveImageSrcSet(url: string): {
  src: string;
  srcSet: string;
  sizes: string;
} {
  const sizes = [320, 640, 768, 1024, 1280, 1920];
  
  const srcSet = sizes
    .map(size => `${transformImageUrl(url, { 
      width: size, 
      crop: 'at_max', 
      format: 'webp', 
      quality: 85 
    })} ${size}w`)
    .join(', ');

  return {
    src: transformImageUrl(url, { 
      width: 800, 
      crop: 'at_max', 
      format: 'webp', 
      quality: 85 
    }),
    srcSet,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
  };
}

/**
 * Create video poster image from video URL
 */
export function getVideoPoster(videoUrl: string): string {
  // ImageKit can generate video thumbnails
  return transformImageUrl(videoUrl, {
    width: 640,
    height: 360,
    crop: 'force',
    format: 'jpg',
    quality: 80
  });
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Get media type icon name for Lucide React
 */
export function getMediaTypeIcon(type: string): string {
  switch (type) {
    case 'image':
      return 'Image';
    case 'video':
      return 'Video';
    case 'document':
      return 'FileText';
    default:
      return 'File';
  }
}

/**
 * Check if file type is supported
 */
export function isFileTypeSupported(file: File, category: string): boolean {
  const supportedTypes = {
    student: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    teacher: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    school: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'],
    gallery: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'],
    document: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  };

  return supportedTypes[category as keyof typeof supportedTypes]?.includes(file.type) || false;
}

/**
 * Create optimized image URL for different use cases
 */
export function createOptimizedImageUrl(
  originalUrl: string,
  useCase: 'avatar' | 'thumbnail' | 'card' | 'hero' | 'gallery'
): string {
  const optimizations = {
    avatar: { width: 128, height: 128, crop: 'force' as const, format: 'webp' as const, quality: 85 },
    thumbnail: { width: 300, height: 200, crop: 'force' as const, format: 'webp' as const, quality: 80 },
    card: { width: 400, height: 300, crop: 'maintain_ratio' as const, format: 'webp' as const, quality: 85 },
    hero: { width: 1200, height: 600, crop: 'force' as const, format: 'webp' as const, quality: 90 },
    gallery: { width: 800, height: 600, crop: 'at_max' as const, format: 'webp' as const, quality: 88 }
  };

  return transformImageUrl(originalUrl, optimizations[useCase]);
}

/**
 * Extract filename without extension
 */
export function getFileNameWithoutExtension(fileName: string): string {
  return fileName.replace(/\.[^/.]+$/, '');
}

/**
 * Generate unique filename for upload
 */
export function generateUniqueFileName(originalName: string, prefix?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const nameWithoutExt = getFileNameWithoutExtension(originalName);
  
  const cleanName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  const prefixPart = prefix ? `${prefix}-` : '';
  
  return `${prefixPart}${cleanName}-${timestamp}-${random}.${extension}`;
}