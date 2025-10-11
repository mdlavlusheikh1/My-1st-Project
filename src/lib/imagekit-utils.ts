import imagekit from './imagekit';

// Types for ImageKit operations
export interface ImageKitUploadOptions {
  file: File | Buffer | string;
  fileName: string;
  folder?: string;
  tags?: string[];
  useUniqueFileName?: boolean;
  overwriteFile?: boolean;
}

export interface ImageKitFile {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  height: number;
  width: number;
  size: number;
  type: string;
  createdAt: string;
  updatedAt: string;
  AITags?: Array<{
    name: string;
    confidence: number;
    source: string;
  }>;
}

// School Management specific folders
export const IMAGEKIT_FOLDERS = {
  PROFILE_PICTURES: '/school-management/profile-pictures',
  STUDENT_PHOTOS: '/school-management/students',
  TEACHER_PHOTOS: '/school-management/teachers', 
  SCHOOL_LOGOS: '/school-management/school-logos',
  QR_CODES: '/school-management/qr-codes',
  DOCUMENTS: '/school-management/documents',
  CERTIFICATES: '/school-management/certificates',
  ID_CARDS: '/school-management/id-cards',
  BANNERS: '/school-management/banners',
  GALLERY: '/school-management/gallery'
} as const;

// Upload file to ImageKit
export async function uploadToImageKit(options: ImageKitUploadOptions): Promise<ImageKitFile> {
  try {
    // Convert File to Buffer if needed
    let fileData: string | Buffer = options.file as string | Buffer;
    if (options.file instanceof File) {
      const arrayBuffer = await options.file.arrayBuffer();
      fileData = Buffer.from(arrayBuffer);
    }

    const result = await imagekit.upload({
      file: fileData,
      fileName: options.fileName,
      folder: options.folder || IMAGEKIT_FOLDERS.DOCUMENTS,
      tags: options.tags || [],
      useUniqueFileName: options.useUniqueFileName ?? true,
      overwriteFile: options.overwriteFile ?? false,
    });

    return {
      fileId: result.fileId,
      name: result.name,
      url: result.url,
      thumbnailUrl: result.thumbnailUrl || result.url,
      height: result.height || 0,
      width: result.width || 0,
      size: result.size,
      type: result.fileType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      AITags: result.AITags || [],
    };
  } catch (error) {
    console.error('ImageKit upload error:', error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Generate authentication parameters for client-side uploads
export function getImageKitAuthParams() {
  const authenticationEndpoint = '/api/imagekit/auth';
  return {
    token: '', // Will be fetched from the endpoint
    expire: 0, // Will be fetched from the endpoint
    signature: '', // Will be fetched from the endpoint
    authenticationEndpoint,
  };
}

// Delete file from ImageKit
export async function deleteFromImageKit(fileId: string): Promise<void> {
  try {
    await imagekit.deleteFile(fileId);
  } catch (error) {
    console.error('ImageKit delete error:', error);
    throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get file details from ImageKit
export async function getImageKitFile(fileId: string): Promise<ImageKitFile> {
  try {
    const result = await imagekit.getFileDetails(fileId);
    return {
      fileId: result.fileId,
      name: result.name,
      url: result.url,
      thumbnailUrl: result.thumbnail || result.url,
      height: result.height || 0,
      width: result.width || 0,
      size: result.size,
      type: result.fileType,
      createdAt: result.createdAt || new Date().toISOString(),
      updatedAt: result.updatedAt || new Date().toISOString(),
      AITags: result.AITags || [],
    };
  } catch (error) {
    console.error('ImageKit get file error:', error);
    throw new Error(`Failed to get file details: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Transform image URL with ImageKit transformations
export function transformImageUrl(
  url: string, 
  transformations: {
    width?: number;
    height?: number;
    crop?: 'maintain_ratio' | 'force' | 'at_least' | 'at_max';
    cropMode?: 'resize' | 'extract' | 'pad_extract' | 'pad_resize';
    focus?: 'auto' | 'face' | 'center';
    format?: 'jpg' | 'jpeg' | 'png' | 'webp' | 'avif';
    quality?: number;
    blur?: number;
    sharpen?: number;
    contrast?: number;
    brightness?: number;
    saturation?: number;
    rotation?: number;
  } = {}
): string {
  const params = [];
  
  if (transformations.width) params.push(`w-${transformations.width}`);
  if (transformations.height) params.push(`h-${transformations.height}`);
  if (transformations.crop) params.push(`c-${transformations.crop}`);
  if (transformations.cropMode) params.push(`cm-${transformations.cropMode}`);
  if (transformations.focus) params.push(`fo-${transformations.focus}`);
  if (transformations.format) params.push(`f-${transformations.format}`);
  if (transformations.quality) params.push(`q-${transformations.quality}`);
  if (transformations.blur) params.push(`bl-${transformations.blur}`);
  if (transformations.sharpen) params.push(`e-sharpen-${transformations.sharpen}`);
  if (transformations.contrast) params.push(`e-contrast-${transformations.contrast}`);
  if (transformations.brightness) params.push(`e-brightness-${transformations.brightness}`);
  if (transformations.saturation) params.push(`e-saturation-${transformations.saturation}`);
  if (transformations.rotation) params.push(`rt-${transformations.rotation}`);

  if (params.length === 0) return url;

  // Insert transformations into ImageKit URL
  const transformationString = `tr:${params.join(',')}`;
  return url.replace(/(\/tr:.*?)?\/([^/]+)$/, `/${transformationString}/$2`);
}

// Helper functions for school management specific uploads

// Upload student profile picture
export async function uploadStudentPhoto(
  file: File,
  studentId: string,
  schoolId: string
): Promise<ImageKitFile> {
  return uploadToImageKit({
    file,
    fileName: `student-${studentId}-${Date.now()}`,
    folder: `${IMAGEKIT_FOLDERS.STUDENT_PHOTOS}/${schoolId}`,
    tags: ['student', 'profile', schoolId, studentId],
  });
}

// Upload teacher profile picture  
export async function uploadTeacherPhoto(
  file: File,
  teacherId: string,
  schoolId: string
): Promise<ImageKitFile> {
  return uploadToImageKit({
    file,
    fileName: `teacher-${teacherId}-${Date.now()}`,
    folder: `${IMAGEKIT_FOLDERS.TEACHER_PHOTOS}/${schoolId}`,
    tags: ['teacher', 'profile', schoolId, teacherId],
  });
}

// Upload school logo
export async function uploadSchoolLogo(
  file: File,
  schoolId: string
): Promise<ImageKitFile> {
  return uploadToImageKit({
    file,
    fileName: `school-logo-${schoolId}-${Date.now()}`,
    folder: IMAGEKIT_FOLDERS.SCHOOL_LOGOS,
    tags: ['school', 'logo', schoolId],
  });
}

// Upload QR code
export async function uploadQRCode(
  qrCodeBuffer: Buffer,
  studentId: string,
  schoolId: string
): Promise<ImageKitFile> {
  return uploadToImageKit({
    file: qrCodeBuffer,
    fileName: `qr-${studentId}-${Date.now()}.png`,
    folder: `${IMAGEKIT_FOLDERS.QR_CODES}/${schoolId}`,
    tags: ['qr-code', 'student', schoolId, studentId],
    overwriteFile: true // Allow overwriting old QR codes
  });
}

// Upload document/certificate
export async function uploadDocument(
  file: File,
  type: 'certificate' | 'id-card' | 'document',
  userId: string,
  schoolId: string
): Promise<ImageKitFile> {
  const folderMap = {
    certificate: IMAGEKIT_FOLDERS.CERTIFICATES,
    'id-card': IMAGEKIT_FOLDERS.ID_CARDS,
    document: IMAGEKIT_FOLDERS.DOCUMENTS
  };

  return uploadToImageKit({
    file,
    fileName: `${type}-${userId}-${Date.now()}`,
    folder: `${folderMap[type]}/${schoolId}`,
    tags: [type, schoolId, userId],
  });
}