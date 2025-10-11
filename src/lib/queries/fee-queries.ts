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
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

// Types
export interface Fee {
  id?: string;
  feeName: string;
  feeNameEn: string;
  amount: number;
  description: string;
  applicableClasses: string[]; // Array of class IDs
  feeType: 'monthly' | 'quarterly' | 'yearly' | 'one-time' | 'exam' | 'admission';
  dueDate?: string;
  lateFee?: number;
  isActive: boolean;
  schoolId: string;
  createdBy: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface FeeCollection {
  id?: string;
  feeId: string;
  feeName: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  amount: number;
  lateFee?: number;
  totalAmount: number;
  paymentDate: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod?: 'cash' | 'bank_transfer' | 'check' | 'online' | 'other';
  transactionId?: string;
  notes?: string;
  collectedBy: string;
  schoolId: string;
  createdAt?: any;
  updatedAt?: any;
}

// Fee Management Functions
export const feeQueries = {
  // Get all fees
  async getAllFees(schoolId?: string): Promise<Fee[]> {
    let q = query(collection(db, 'fees'), orderBy('createdAt', 'desc'));

    if (schoolId) {
      q = query(q, where('schoolId', '==', schoolId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Fee));
  },

  // Get active fees
  async getActiveFees(schoolId?: string): Promise<Fee[]> {
    let q = query(
      collection(db, 'fees'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    if (schoolId) {
      q = query(q, where('schoolId', '==', schoolId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Fee));
  },

  // Get fees by class
  async getFeesByClass(classId: string): Promise<Fee[]> {
    const q = query(
      collection(db, 'fees'),
      where('applicableClasses', 'array-contains', classId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Fee));
  },

  // Get fee by ID
  async getFeeById(id: string): Promise<Fee | null> {
    const docRef = doc(db, 'fees', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Fee : null;
  },

  // Create fee
  async createFee(feeData: Omit<Fee, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const feeDoc = {
      ...feeData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'fees'), feeDoc);
    return docRef.id;
  },

  // Update fee
  async updateFee(id: string, updates: Partial<Fee>): Promise<void> {
    // Filter out undefined values before updating Firebase
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    const docRef = doc(db, 'fees', id);
    await updateDoc(docRef, {
      ...cleanUpdates,
      updatedAt: serverTimestamp()
    });
  },

  // Delete fee
  async deleteFee(id: string): Promise<void> {
    await deleteDoc(doc(db, 'fees', id));
  },

  // Delete all fees for a school
  async deleteAllFees(schoolId: string): Promise<number> {
    try {
      const fees = await this.getAllFees(schoolId);
      let deletedCount = 0;

      for (const fee of fees) {
        if (fee.id) {
          await this.deleteFee(fee.id);
          deletedCount++;
        }
      }

      console.log(`✅ Deleted ${deletedCount} fees for school ${schoolId}`);
      return deletedCount;
    } catch (error) {
      console.error('❌ Error deleting all fees:', error);
      throw error;
    }
  },

  // Fee Collection Functions
  async getAllFeeCollections(schoolId?: string): Promise<FeeCollection[]> {
    let q = query(collection(db, 'feeCollections'), orderBy('createdAt', 'desc'));

    if (schoolId) {
      q = query(q, where('schoolId', '==', schoolId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeeCollection));
  },

  async getFeeCollectionsByStudent(studentId: string): Promise<FeeCollection[]> {
    const q = query(
      collection(db, 'feeCollections'),
      where('studentId', '==', studentId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeeCollection));
  },

  async getFeeCollectionsByFee(feeId: string): Promise<FeeCollection[]> {
    const q = query(
      collection(db, 'feeCollections'),
      where('feeId', '==', feeId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeeCollection));
  },

  async getPendingFeeCollections(schoolId?: string): Promise<FeeCollection[]> {
    let q = query(
      collection(db, 'feeCollections'),
      where('status', '==', 'pending'),
      orderBy('dueDate', 'asc')
    );

    if (schoolId) {
      q = query(q, where('schoolId', '==', schoolId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeeCollection));
  },

  async getOverdueFeeCollections(schoolId?: string): Promise<FeeCollection[]> {
    const today = new Date().toISOString().split('T')[0];

    let q = query(
      collection(db, 'feeCollections'),
      where('status', '==', 'pending'),
      where('dueDate', '<', today),
      orderBy('dueDate', 'asc')
    );

    if (schoolId) {
      q = query(q, where('schoolId', '==', schoolId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeeCollection));
  },

  async createFeeCollection(collectionData: Omit<FeeCollection, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const collectionDoc = {
      ...collectionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'feeCollections'), collectionDoc);
    return docRef.id;
  },

  async updateFeeCollection(id: string, updates: Partial<FeeCollection>): Promise<void> {
    const docRef = doc(db, 'feeCollections', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async markFeeAsPaid(
    collectionId: string,
    paymentMethod: 'cash' | 'bank_transfer' | 'check' | 'online' | 'other',
    transactionId?: string,
    notes?: string,
    collectedBy: string = 'current-user'
  ): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    await this.updateFeeCollection(collectionId, {
      status: 'paid',
      paymentDate: today,
      paymentMethod,
      transactionId,
      notes,
      collectedBy
    });
  },

  // Generate fee collections for all students in applicable classes
  async generateFeeCollectionsForFee(feeId: string, dueDate?: string): Promise<number> {
    try {
      const fee = await this.getFeeById(feeId);
      if (!fee || !fee.isActive) {
        throw new Error('Fee not found or inactive');
      }

      // Import student queries dynamically to avoid circular dependencies
      const { studentQueries } = await import('./student-queries');
      const students = await studentQueries.getActiveStudents();
      const applicableStudents = students.filter(student =>
        fee.applicableClasses.includes(student.class || '')
      );

      let collectionCount = 0;

      for (const student of applicableStudents) {
        const existingCollection = await this.getStudentFeeCollection(student.uid, feeId);

        if (!existingCollection) {
          const classInfo = await (await import('./class-queries')).classQueries.getClassesBySchool(fee.schoolId)
            .then(classes => classes.find(c => c.className === student.class));

          const collectionData: Omit<FeeCollection, 'id' | 'createdAt' | 'updatedAt'> = {
            feeId: fee.id!,
            feeName: fee.feeName,
            studentId: student.uid,
            studentName: student.name || student.displayName || '',
            classId: classInfo?.classId || '',
            className: student.class || '',
            amount: fee.amount,
            lateFee: 0,
            totalAmount: fee.amount,
            paymentDate: '',
            dueDate: dueDate || fee.dueDate || '',
            status: 'pending',
            collectedBy: '',
            schoolId: fee.schoolId
          };

          await this.createFeeCollection(collectionData);
          collectionCount++;
        }
      }

      return collectionCount;
    } catch (error) {
      console.error('Error generating fee collections:', error);
      throw error;
    }
  },

  // Get existing fee collection for a student and fee
  async getStudentFeeCollection(studentId: string, feeId: string): Promise<FeeCollection | null> {
    const q = query(
      collection(db, 'feeCollections'),
      where('studentId', '==', studentId),
      where('feeId', '==', feeId),
      limit(1)
    );

    const snapshot = await getDocs(q);
    return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as FeeCollection;
  },

  // Get fee collection statistics
  async getFeeCollectionStats(schoolId?: string): Promise<{
    totalCollections: number;
    pendingAmount: number;
    paidAmount: number;
    overdueAmount: number;
    pendingCount: number;
    paidCount: number;
    overdueCount: number;
  }> {
    const collections = await this.getAllFeeCollections(schoolId);

    const stats = {
      totalCollections: collections.length,
      pendingAmount: 0,
      paidAmount: 0,
      overdueAmount: 0,
      pendingCount: 0,
      paidCount: 0,
      overdueCount: 0
    };

    collections.forEach(collection => {
      switch (collection.status) {
        case 'pending':
          stats.pendingAmount += collection.totalAmount;
          stats.pendingCount++;
          break;
        case 'paid':
          stats.paidAmount += collection.totalAmount;
          stats.paidCount++;
          break;
        case 'overdue':
          stats.overdueAmount += collection.totalAmount;
          stats.overdueCount++;
          break;
      }
    });

    return stats;
  }
};