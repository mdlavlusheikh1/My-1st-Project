import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  User, 
  School, 
  Student, 
  Class, 
  AttendanceRecord, 
  AttendanceSession,
  Subject,
  Notification,
  ApiResponse,
  PaginatedResponse 
} from '@/types';

// Generic CRUD operations
export class FirestoreService {
  static async create<T>(collectionName: string, data: Omit<T, 'id'>): Promise<ApiResponse<T>> {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      const newDoc = await getDoc(docRef);
      return {
        success: true,
        data: { id: docRef.id, ...newDoc.data() } as T
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  static async update<T>(collectionName: string, id: string, data: Partial<T>): Promise<ApiResponse<T>> {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
      
      const updatedDoc = await getDoc(docRef);
      return {
        success: true,
        data: { id, ...updatedDoc.data() } as T
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  static async delete(collectionName: string, id: string): Promise<ApiResponse<void>> {
    try {
      await deleteDoc(doc(db, collectionName, id));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  static async getById<T>(collectionName: string, id: string): Promise<ApiResponse<T>> {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          success: true,
          data: { id: docSnap.id, ...docSnap.data() } as T
        };
      } else {
        return {
          success: false,
          error: 'Document not found'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  static async getAll<T>(collectionName: string, pageSize = 20): Promise<ApiResponse<PaginatedResponse<T>>> {
    try {
      const q = query(
        collection(db, collectionName),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );
      
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];

      return {
        success: true,
        data: {
          data,
          currentPage: 1,
          totalPages: 1, // We'll implement proper pagination later
          totalItems: data.length,
          hasNext: false,
          hasPrevious: false
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  static async getByField<T>(
    collectionName: string, 
    field: string, 
    value: any
  ): Promise<ApiResponse<T[]>> {
    try {
      const q = query(
        collection(db, collectionName),
        where(field, '==', value),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];

      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

// Specific service classes
export class SchoolService extends FirestoreService {
  static async createSchool(schoolData: Omit<School, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<School>> {
    return this.create<School>('schools', schoolData);
  }

  static async updateSchool(id: string, schoolData: Partial<School>): Promise<ApiResponse<School>> {
    return this.update<School>('schools', id, schoolData);
  }

  static async getSchoolById(id: string): Promise<ApiResponse<School>> {
    return this.getById<School>('schools', id);
  }

  static async getAllSchools(): Promise<ApiResponse<PaginatedResponse<School>>> {
    return this.getAll<School>('schools');
  }

  static async getActiveSchools(): Promise<ApiResponse<School[]>> {
    return this.getByField<School>('schools', 'isActive', true);
  }
}

export class UserService extends FirestoreService {
  static async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<User>> {
    return this.create<User>('users', userData);
  }

  static async updateUser(id: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.update<User>('users', id, userData);
  }

  static async getUserById(id: string): Promise<ApiResponse<User>> {
    return this.getById<User>('users', id);
  }

  static async getUserByEmail(email: string): Promise<ApiResponse<User[]>> {
    return this.getByField<User>('users', 'email', email);
  }

  static async getUsersByRole(role: User['role']): Promise<ApiResponse<User[]>> {
    return this.getByField<User>('users', 'role', role);
  }

  static async getUsersBySchool(schoolId: string): Promise<ApiResponse<User[]>> {
    return this.getByField<User>('users', 'schoolId', schoolId);
  }
}

export class StudentService extends FirestoreService {
  static async createStudent(studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Student>> {
    return this.create<Student>('students', studentData);
  }

  static async updateStudent(id: string, studentData: Partial<Student>): Promise<ApiResponse<Student>> {
    return this.update<Student>('students', id, studentData);
  }

  static async getStudentById(id: string): Promise<ApiResponse<Student>> {
    return this.getById<Student>('students', id);
  }

  static async getStudentsByClass(classId: string): Promise<ApiResponse<Student[]>> {
    return this.getByField<Student>('students', 'classId', classId);
  }

  static async getStudentsBySchool(schoolId: string): Promise<ApiResponse<Student[]>> {
    return this.getByField<Student>('students', 'schoolId', schoolId);
  }

  static async getStudentByQRCode(qrCode: string): Promise<ApiResponse<Student[]>> {
    return this.getByField<Student>('students', 'qrCode', qrCode);
  }
}

export class ClassService extends FirestoreService {
  static async createClass(classData: Omit<Class, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Class>> {
    return this.create<Class>('classes', classData);
  }

  static async updateClass(id: string, classData: Partial<Class>): Promise<ApiResponse<Class>> {
    return this.update<Class>('classes', id, classData);
  }

  static async getClassById(id: string): Promise<ApiResponse<Class>> {
    return this.getById<Class>('classes', id);
  }

  static async getClassesBySchool(schoolId: string): Promise<ApiResponse<Class[]>> {
    return this.getByField<Class>('classes', 'schoolId', schoolId);
  }

  static async getClassesByTeacher(teacherId: string): Promise<ApiResponse<Class[]>> {
    return this.getByField<Class>('classes', 'teacherId', teacherId);
  }
}

export class AttendanceService extends FirestoreService {
  static async markAttendance(attendanceData: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<AttendanceRecord>> {
    return this.create<AttendanceRecord>('attendance', attendanceData);
  }

  static async updateAttendance(id: string, attendanceData: Partial<AttendanceRecord>): Promise<ApiResponse<AttendanceRecord>> {
    return this.update<AttendanceRecord>('attendance', id, attendanceData);
  }

  static async getAttendanceByStudent(studentId: string): Promise<ApiResponse<AttendanceRecord[]>> {
    return this.getByField<AttendanceRecord>('attendance', 'studentId', studentId);
  }

  static async getAttendanceByClass(classId: string): Promise<ApiResponse<AttendanceRecord[]>> {
    return this.getByField<AttendanceRecord>('attendance', 'classId', classId);
  }

  static async getAttendanceByDate(date: Date): Promise<ApiResponse<AttendanceRecord[]>> {
    try {
      // Create start and end of day timestamps
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, 'attendance'),
        where('date', '>=', Timestamp.fromDate(startOfDay)),
        where('date', '<=', Timestamp.fromDate(endOfDay)),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AttendanceRecord[];

      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  static async createAttendanceSession(sessionData: Omit<AttendanceSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<AttendanceSession>> {
    return this.create<AttendanceSession>('attendance_sessions', sessionData);
  }

  static async updateAttendanceSession(id: string, sessionData: Partial<AttendanceSession>): Promise<ApiResponse<AttendanceSession>> {
    return this.update<AttendanceSession>('attendance_sessions', id, sessionData);
  }

  static async getActiveSessionByClass(classId: string): Promise<ApiResponse<AttendanceSession[]>> {
    return this.getByField<AttendanceSession>('attendance_sessions', 'classId', classId);
  }
}

export class NotificationService extends FirestoreService {
  static async createNotification(notificationData: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Notification>> {
    return this.create<Notification>('notifications', notificationData);
  }

  static async markAsRead(id: string): Promise<ApiResponse<Notification>> {
    return this.update<Notification>('notifications', id, { isRead: true });
  }

  static async getNotificationsByUser(userId: string): Promise<ApiResponse<Notification[]>> {
    return this.getByField<Notification>('notifications', 'userId', userId);
  }

  static async getUnreadNotifications(userId: string): Promise<ApiResponse<Notification[]>> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('isRead', '==', false),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];

      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}