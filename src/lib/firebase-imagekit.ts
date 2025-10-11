import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  DocumentData 
} from 'firebase/firestore';
import { uploadToImageKit, deleteFromImageKit, ImageKitFile } from './imagekit-utils';

// Types for Firebase media records
export interface MediaRecord {
  id?: string;
  fileId: string; // ImageKit file ID
  name: string;
  url: string; // ImageKit URL
  thumbnailUrl: string;
  type: 'image' | 'video' | 'document';
  category: 'student' | 'teacher' | 'school' | 'document' | 'gallery';
  userId?: string; // Student/Teacher ID
  schoolId: string;
  size: number;
  width?: number;
  height?: number;
  uploadedBy: string; // User email who uploaded
  createdAt: any;
  updatedAt: any;
  tags?: string[];
  metadata?: Record<string, any>;
}

// Upload file to ImageKit and save record to Firebase
export async function uploadMediaToImageKitAndFirebase(
  file: File,
  category: 'student' | 'teacher' | 'school' | 'document' | 'gallery',
  schoolId: string,
  uploadedBy: string,
  userId?: string,
  tags?: string[]
): Promise<MediaRecord> {
  try {
    // Upload to ImageKit first
    let imagekitFile: ImageKitFile;
    
    switch (category) {
      case 'student':
        if (!userId) throw new Error('Student ID is required for student uploads');
        const { uploadStudentPhoto } = await import('./imagekit-utils');
        imagekitFile = await uploadStudentPhoto(file, userId, schoolId);
        break;
      case 'teacher':
        if (!userId) throw new Error('Teacher ID is required for teacher uploads');
        const { uploadTeacherPhoto } = await import('./imagekit-utils');
        imagekitFile = await uploadTeacherPhoto(file, userId, schoolId);
        break;
      case 'school':
        const { uploadSchoolLogo } = await import('./imagekit-utils');
        imagekitFile = await uploadSchoolLogo(file, schoolId);
        break;
      case 'document':
        if (!userId) throw new Error('User ID is required for document uploads');
        const { uploadDocument } = await import('./imagekit-utils');
        imagekitFile = await uploadDocument(file, 'document', userId, schoolId);
        break;
      case 'gallery':
        imagekitFile = await uploadToImageKit({
          file,
          fileName: `gallery-${Date.now()}-${file.name}`,
          folder: `/school-management/gallery/${schoolId}`,
          tags: ['gallery', schoolId, ...(tags || [])]
        });
        break;
      default:
        throw new Error(`Unknown category: ${category}`);
    }

    // Create media record for Firebase
    const mediaRecord: Omit<MediaRecord, 'id'> = {
      fileId: imagekitFile.fileId,
      name: imagekitFile.name,
      url: imagekitFile.url,
      thumbnailUrl: imagekitFile.thumbnailUrl,
      type: imagekitFile.type.startsWith('image/') ? 'image' : 
            imagekitFile.type.startsWith('video/') ? 'video' : 'document',
      category,
      userId,
      schoolId,
      size: imagekitFile.size,
      width: imagekitFile.width,
      height: imagekitFile.height,
      uploadedBy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      tags: tags || [],
      metadata: {
        originalFileName: file.name,
        mimeType: file.type,
        imagekitTags: imagekitFile.AITags
      }
    };

    // Save to Firebase
    const docRef = await addDoc(collection(db, 'media'), mediaRecord);
    
    return {
      id: docRef.id,
      ...mediaRecord,
      createdAt: new Date(),
      updatedAt: new Date()
    } as MediaRecord;

  } catch (error) {
    console.error('Error uploading media:', error);
    throw new Error(`Failed to upload media: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get media records from Firebase
export async function getMediaFromFirebase(
  schoolId: string,
  category?: string,
  userId?: string
): Promise<MediaRecord[]> {
  try {
    let q = query(
      collection(db, 'media'),
      where('schoolId', '==', schoolId),
      orderBy('createdAt', 'desc')
    );

    if (category) {
      q = query(q, where('category', '==', category));
    }

    if (userId) {
      q = query(q, where('userId', '==', userId));
    }

    const querySnapshot = await getDocs(q);
    const media: MediaRecord[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as DocumentData;
      media.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as MediaRecord);
    });

    return media;
  } catch (error) {
    console.error('Error fetching media:', error);
    throw new Error(`Failed to fetch media: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Delete media from both ImageKit and Firebase
export async function deleteMediaFromImageKitAndFirebase(
  mediaId: string,
  fileId: string
): Promise<void> {
  try {
    // Delete from ImageKit first
    await deleteFromImageKit(fileId);

    // Delete from Firebase
    await deleteDoc(doc(db, 'media', mediaId));
  } catch (error) {
    console.error('Error deleting media:', error);
    throw new Error(`Failed to delete media: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Update media record in Firebase
export async function updateMediaInFirebase(
  mediaId: string,
  updates: Partial<MediaRecord>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'media', mediaId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating media:', error);
    throw new Error(`Failed to update media: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get media by category and user
export async function getUserMedia(
  schoolId: string,
  userId: string,
  category: 'student' | 'teacher'
): Promise<MediaRecord[]> {
  return getMediaFromFirebase(schoolId, category, userId);
}

// Get school gallery
export async function getSchoolGallery(schoolId: string): Promise<MediaRecord[]> {
  return getMediaFromFirebase(schoolId, 'gallery');
}

// Get school logos
export async function getSchoolLogos(schoolId: string): Promise<MediaRecord[]> {
  return getMediaFromFirebase(schoolId, 'school');
}