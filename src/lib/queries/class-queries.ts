import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../firebase';
import { SCHOOL_ID } from '../constants';

// Types
export interface Class {
  classId?: string;
  className: string;
  section: string;
  group?: string; // Academic group (Science, Humanities, Business)
  schoolId: string;
  schoolName: string;
  teacherId: string;
  teacherName: string;
  academicYear: string;
  totalStudents: number;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
  // UI display properties
  id?: string;
  name?: string;
  status?: string;
  teacher?: string;
  subject?: string;
  students?: number;
  time?: string;
  room?: string;
}

// Class Management Functions
export const classQueries = {
  // Get all classes (only active by default)
  async getAllClasses(onlyActive: boolean = true): Promise<Class[]> {
    let q;
    if (onlyActive) {
      q = query(
        collection(db, 'classes'),
        where('isActive', '==', true),
        orderBy('className')
      );
    } else {
      q = query(collection(db, 'classes'), orderBy('className'));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ classId: doc.id, ...doc.data() } as Class));
  },

  // Get classes by school
  async getClassesBySchool(schoolId: string): Promise<Class[]> {
    const q = query(
      collection(db, 'classes'),
      where('schoolId', '==', schoolId),
      orderBy('className')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ classId: doc.id, ...doc.data() } as Class));
  },

  // Get classes by teacher
  async getClassesByTeacher(teacherId: string): Promise<Class[]> {
    const q = query(
      collection(db, 'classes'),
      where('teacherId', '==', teacherId),
      orderBy('className')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ classId: doc.id, ...doc.data() } as Class));
  },

  // Create class
  async createClass(classData: Omit<Class, 'createdAt' | 'updatedAt'> & { classId?: string }): Promise<string> {
    const { classId, ...restData } = classData;
    const classDoc = {
      ...restData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    if (classId) {
      await setDoc(doc(db, 'classes', classId), classDoc);
      return classId;
    } else {
      const docRef = await addDoc(collection(db, 'classes'), classDoc);
      return docRef.id;
    }
  },

  // Update class
  async updateClass(classId: string, updates: Partial<Class>): Promise<void> {
    const docRef = doc(db, 'classes', classId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  // Create sample classes for testing
  async createSampleClasses(): Promise<void> {
    try {
      const schoolId = SCHOOL_ID;
      const schoolName = 'ইকরা ইসলামিক স্কুল';

      const sampleClasses = [
        {
          className: 'প্রথম',
          section: 'এ',
          teacherName: 'মোহাম্মদ আলী',
          academicYear: '২০২৫',
          totalStudents: 25,
          isActive: true,
          schoolId,
          schoolName,
          teacherId: 'teacher-1'
        },
        {
          className: 'দ্বিতীয়',
          section: 'এ',
          teacherName: 'ফাতেমা বেগম',
          academicYear: '২০২৫',
          totalStudents: 22,
          isActive: true,
          schoolId,
          schoolName,
          teacherId: 'teacher-2'
        },
        {
          className: 'তৃতীয়',
          section: 'এ',
          teacherName: 'আবদুল করিম',
          academicYear: '২০২৫',
          totalStudents: 28,
          isActive: true,
          schoolId,
          schoolName,
          teacherId: 'teacher-3'
        },
        {
          className: 'চতুর্থ',
          section: 'এ',
          teacherName: 'সালেহা আক্তার',
          academicYear: '২০২৫',
          totalStudents: 24,
          isActive: true,
          schoolId,
          schoolName,
          teacherId: 'teacher-4'
        },
        {
          className: 'পঞ্চম',
          section: 'এ',
          teacherName: 'রহিম উদ্দিন',
          academicYear: '২০২৫',
          totalStudents: 26,
          isActive: true,
          schoolId,
          schoolName,
          teacherId: 'teacher-5'
        },
        {
          className: 'ষষ্ঠ',
          section: 'এ',
          teacherName: 'নাসরিন সুলতানা',
          academicYear: '২০২৫',
          totalStudents: 30,
          isActive: true,
          schoolId,
          schoolName,
          teacherId: 'teacher-6'
        },
        {
          className: 'সপ্তম',
          section: 'এ',
          teacherName: 'কামরুল হাসান',
          academicYear: '২০২৫',
          totalStudents: 27,
          isActive: true,
          schoolId,
          schoolName,
          teacherId: 'teacher-7'
        },
        {
          className: 'অষ্টম',
          section: 'এ',
          teacherName: 'জাহিদুল ইসলাম',
          academicYear: '২০২৫',
          totalStudents: 23,
          isActive: true,
          schoolId,
          schoolName,
          teacherId: 'teacher-8'
        }
      ];

      for (const classData of sampleClasses) {
        await this.createClass(classData);
      }

      console.log('✅ Sample classes created successfully');
    } catch (error) {
      console.error('❌ Error creating sample classes:', error);
    }
  },

  // Delete all classes for a school
  async deleteAllClasses(schoolId?: string): Promise<number> {
    try {
      let q = query(collection(db, 'classes'));
      if (schoolId) {
        q = query(q, where('schoolId', '==', schoolId));
      }

      const snapshot = await getDocs(q);
      let deletedCount = 0;

      for (const doc of snapshot.docs) {
        await deleteDoc(doc.ref);
        deletedCount++;
      }

      console.log(`✅ Deleted ${deletedCount} classes`);
      return deletedCount;
    } catch (error) {
      console.error('❌ Error deleting classes:', error);
      throw error;
    }
  },

  // Real-time listener for classes by school
  subscribeToClassesBySchool(
    schoolId: string,
    callback: (classes: Class[]) => void,
    errorCallback?: (error: any) => void
  ): Unsubscribe {
    const q = query(
      collection(db, 'classes'),
      where('schoolId', '==', schoolId),
      orderBy('className')
    );

    return onSnapshot(q, (snapshot) => {
      const classes = snapshot.docs.map(doc =>
        ({ classId: doc.id, ...doc.data() } as Class)
      );
      callback(classes);
    }, (error) => {
      console.error('❌ Error listening to classes:', error);
      if (errorCallback) {
        errorCallback(error);
      }
    });
  }
};
