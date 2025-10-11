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
  Timestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';

// Types
export interface User {
  uid: string;
  name?: string;
  displayName?: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  role: 'super_admin' | 'admin' | 'teacher' | 'parent' | 'student';
  schoolId: string;
  schoolName?: string;
  address?: string;
  isActive: boolean;
  isApproved?: boolean;
  profileImage?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  associatedStudents?: Array<{
    name?: string;
    class?: string;
    studentId?: string;
    uid: string;
  }>;
  // Student specific fields
  guardianName?: string;
  guardianPhone?: string;
  studentId?: string;
  class?: string;
  section?: string;
  group?: string;
  rollNumber?: string;
  // Teacher specific fields
  subject?: string;
  experience?: string;
  qualification?: string;
  joinDate?: string;
  salary?: number;
  department?: string;
  designation?: string;
  employeeId?: string;
  employmentType?: string;
  specialization?: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  nationality?: string;
  religion?: string;
  bloodGroup?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  languages?: string;
  skills?: string;
  achievements?: string;
  publications?: string;
  researchInterests?: string;
  // Additional personal fields
  fatherName?: string;
  motherName?: string;
  nationalId?: string;
  nidNumber?: string;
  permanentAddress?: string;
}

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
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
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

export interface AttendanceRecord {
  id?: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  schoolId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  timestamp: Timestamp;
  firstScanTime?: Timestamp; // Original scan time (never updated)
  teacherId: string;
  method: 'manual' | 'qr_scan';
}

// User Management Functions
export const userQueries = {
  // Get all users
  async getAllUsers(): Promise<User[]> {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
  },

  // Get users by role
  async getUsersByRole(role: string): Promise<User[]> {
    const q = query(
      collection(db, 'users'),
      where('role', '==', role),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
  },

  // Get users by school
  async getUsersBySchool(schoolId: string): Promise<User[]> {
    const q = query(
      collection(db, 'users'),
      where('schoolId', '==', schoolId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
  },

  // Get pending users (inactive)
  async getPendingUsers(): Promise<User[]> {
    const q = query(
      collection(db, 'users'),
      where('isActive', '==', false),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
  },

  // Get active users
  async getActiveUsers(): Promise<User[]> {
    const q = query(
      collection(db, 'users'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
  },

  // Get user by ID
  async getUserById(uid: string): Promise<User | null> {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { uid: docSnap.id, ...docSnap.data() } as User : null;
  },

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    const q = query(collection(db, 'users'), where('email', '==', email), limit(1));
    const snapshot = await getDocs(q);
    return snapshot.empty ? null : { uid: snapshot.docs[0].id, ...snapshot.docs[0].data() } as User;
  },

  // Create user
  async createUser(userData: Omit<User, 'createdAt' | 'updatedAt'> & { uid?: string }): Promise<string> {
    const userDoc = {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Use a custom UID if provided, otherwise let Firestore generate one
    if (userData.uid) {
      await setDoc(doc(db, 'users', userData.uid), userDoc);
      return userData.uid;
    } else {
      const docRef = await addDoc(collection(db, 'users'), userDoc);
      return docRef.id;
    }
  },

  // Update user
  async updateUser(uid: string, updates: Partial<User>): Promise<void> {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  // Activate/Deactivate user
  async setUserActive(uid: string, isActive: boolean): Promise<void> {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, {
      isActive,
      updatedAt: serverTimestamp()
    });
  },

  // Delete user
  async deleteUser(uid: string): Promise<void> {
    await deleteDoc(doc(db, 'users', uid));
  }
};

// Financial/Accounting Management Functions
export const accountingQueries = {
  // Transaction Management
  async getAllTransactions(schoolId?: string): Promise<FinancialTransaction[]> {
    let q = query(
      collection(db, 'financialTransactions'),
      orderBy('date', 'desc')
    );

    if (schoolId) {
      q = query(q, where('schoolId', '==', schoolId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FinancialTransaction));
  },

  async getTransactionsByDateRange(startDate: string, endDate: string, schoolId?: string): Promise<FinancialTransaction[]> {
    let q = query(
      collection(db, 'financialTransactions'),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );

    if (schoolId) {
      q = query(q, where('schoolId', '==', schoolId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FinancialTransaction));
  },

  async getTransactionsByType(type: 'income' | 'expense', schoolId?: string): Promise<FinancialTransaction[]> {
    let q = query(
      collection(db, 'financialTransactions'),
      where('type', '==', type),
      orderBy('date', 'desc')
    );

    if (schoolId) {
      q = query(q, where('schoolId', '==', schoolId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FinancialTransaction));
  },

  async getTransactionById(id: string): Promise<FinancialTransaction | null> {
    const docRef = doc(db, 'financialTransactions', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as FinancialTransaction : null;
  },

  async createTransaction(transactionData: Omit<FinancialTransaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const transactionDoc = {
      ...transactionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'financialTransactions'), transactionDoc);
    return docRef.id;
  },

  async updateTransaction(id: string, updates: Partial<FinancialTransaction>): Promise<void> {
    const docRef = doc(db, 'financialTransactions', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async deleteTransaction(id: string): Promise<void> {
    await deleteDoc(doc(db, 'financialTransactions', id));
  },

  // Financial Categories
  async getAllCategories(schoolId?: string): Promise<FinancialCategory[]> {
    let q = query(
      collection(db, 'financialCategories'),
      orderBy('name')
    );

    if (schoolId) {
      q = query(q, where('schoolId', '==', schoolId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FinancialCategory));
  },

  async getCategoriesByType(type: 'income' | 'expense', schoolId?: string): Promise<FinancialCategory[]> {
    let q = query(
      collection(db, 'financialCategories'),
      where('type', '==', type),
      orderBy('name')
    );

    if (schoolId) {
      q = query(q, where('schoolId', '==', schoolId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FinancialCategory));
  },

  async createCategory(categoryData: Omit<FinancialCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const categoryDoc = {
      ...categoryData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'financialCategories'), categoryDoc);
    return docRef.id;
  },

  async updateCategory(id: string, updates: Partial<FinancialCategory>): Promise<void> {
    const docRef = doc(db, 'financialCategories', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async deleteCategory(id: string): Promise<void> {
    await deleteDoc(doc(db, 'financialCategories', id));
  },

  // Financial Reports
  async generateMonthlyReport(year: number, month: number, schoolId: string): Promise<FinancialReport> {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Last day of month

    const transactions = await this.getTransactionsByDateRange(startDate, endDate, schoolId);

    const totalIncome = transactions
      .filter(t => t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter(t => t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const reportData = {
      title: `মাসিক রিপোর্ট - ${year}-${month.toString().padStart(2, '0')}`,
      type: 'monthly' as const,
      startDate,
      endDate,
      totalIncome,
      totalExpense,
      netAmount: totalIncome - totalExpense,
      transactionCount: transactions.length,
      schoolId,
      generatedBy: 'current-user', // Should be actual user ID
      generatedAt: serverTimestamp() as Timestamp,
      data: {
        transactions,
        incomeByCategory: this.getIncomeByCategory(transactions),
        expenseByCategory: this.getExpenseByCategory(transactions)
      }
    };

    // Save report to database
    const docRef = await addDoc(collection(db, 'financialReports'), reportData);
    return { id: docRef.id, ...reportData };
  },

  async getFinancialSummary(schoolId: string, startDate?: string, endDate?: string): Promise<{
    totalIncome: number;
    totalExpense: number;
    netAmount: number;
    pendingIncome: number;
    pendingExpense: number;
    transactionCount: number;
  }> {
    let transactions: FinancialTransaction[];

    if (startDate && endDate) {
      transactions = await this.getTransactionsByDateRange(startDate, endDate, schoolId);
    } else {
      transactions = await this.getAllTransactions(schoolId);
    }

    const summary = {
      totalIncome: transactions
        .filter(t => t.type === 'income' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0),
      totalExpense: transactions
        .filter(t => t.type === 'expense' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0),
      netAmount: 0,
      pendingIncome: transactions
        .filter(t => t.type === 'income' && t.status === 'pending')
        .reduce((sum, t) => sum + t.amount, 0),
      pendingExpense: transactions
        .filter(t => t.type === 'expense' && t.status === 'pending')
        .reduce((sum, t) => sum + t.amount, 0),
      transactionCount: transactions.length
    };

    summary.netAmount = summary.totalIncome - summary.totalExpense;
    return summary;
  },

  // Helper methods for report generation
  getIncomeByCategory(transactions: FinancialTransaction[]): Record<string, number> {
    return transactions
      .filter(t => t.type === 'income' && t.status === 'completed')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
  },

  getExpenseByCategory(transactions: FinancialTransaction[]): Record<string, number> {
    return transactions
      .filter(t => t.type === 'expense' && t.status === 'completed')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
  },

  // Budget Management
  async getAllBudgets(schoolId?: string): Promise<Budget[]> {
    let q = query(
      collection(db, 'budgets'),
      orderBy('year', 'desc')
    );

    if (schoolId) {
      q = query(q, where('schoolId', '==', schoolId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget));
  },

  async createBudget(budgetData: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const budgetDoc = {
      ...budgetData,
      spentAmount: 0,
      remainingAmount: budgetData.budgetedAmount,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'budgets'), budgetDoc);
    return docRef.id;
  },

  async updateBudgetSpentAmount(budgetId: string, spentAmount: number): Promise<void> {
    const budget = await this.getBudgetById(budgetId);
    if (budget) {
      const remainingAmount = budget.budgetedAmount - spentAmount;
      await this.updateBudget(budgetId, { spentAmount, remainingAmount });
    }
  },

  async updateBudget(budgetId: string, updates: Partial<Budget>): Promise<void> {
    const docRef = doc(db, 'budgets', budgetId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async getBudgetById(id: string): Promise<Budget | null> {
    const docRef = doc(db, 'budgets', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Budget : null;
  },

  // Sample data creation for testing
  async createSampleFinancialData(schoolId: string): Promise<void> {
    try {
      // Create sample categories
      const incomeCategories = [
        { name: 'মাসিক ফি', type: 'income' as const, description: 'শিক্ষার্থীদের মাসিক টিউশন ফি' },
        { name: 'ভর্তি ফি', type: 'income' as const, description: 'নতুন শিক্ষার্থীদের ভর্তি ফি' },
        { name: 'বই বিক্রয়', type: 'income' as const, description: 'পাঠ্যবই বিক্রয়' },
        { name: 'অনুদান', type: 'income' as const, description: 'বিভিন্ন সূত্র থেকে অনুদান' }
      ];

      const expenseCategories = [
        { name: 'শিক্ষক বেতন', type: 'expense' as const, description: 'শিক্ষকদের মাসিক বেতন' },
        { name: 'বিদ্যুৎ বিল', type: 'expense' as const, description: 'বিদ্যুৎ ও পানির বিল' },
        { name: 'রক্ষণাবেক্ষণ', type: 'expense' as const, description: 'স্কুলের রক্ষণাবেক্ষণ খরচ' },
        { name: 'সরঞ্জাম', type: 'expense' as const, description: 'শিক্ষা সরঞ্জাম ক্রয়' },
        { name: 'অন্যান্য', type: 'expense' as const, description: 'অন্যান্য খরচ' }
      ];

      // Create categories
      for (const category of [...incomeCategories, ...expenseCategories]) {
        await this.createCategory({
          ...category,
          isActive: true,
          schoolId,
          createdBy: 'system'
        });
      }

      // Create sample transactions for the last 3 months
      const currentDate = new Date();
      const sampleTransactions = [
        // Income transactions
        {
          type: 'income' as const,
          category: 'মাসিক ফি',
          amount: 150000,
          description: 'জানুয়ারি মাসের টিউশন ফি',
          date: '2024-01-15',
          status: 'completed' as const,
          schoolId,
          recordedBy: 'admin',
          paymentMethod: 'bank_transfer' as const
        },
        {
          type: 'income' as const,
          category: 'ভর্তি ফি',
          amount: 50000,
          description: 'নতুন শিক্ষার্থী ভর্তি ফি',
          date: '2024-01-20',
          status: 'completed' as const,
          schoolId,
          recordedBy: 'admin',
          paymentMethod: 'cash' as const
        },
        {
          type: 'income' as const,
          category: 'মাসিক ফি',
          amount: 145000,
          description: 'ফেব্রুয়ারি মাসের টিউশন ফি',
          date: '2024-02-15',
          status: 'completed' as const,
          schoolId,
          recordedBy: 'admin',
          paymentMethod: 'bank_transfer' as const
        },
        {
          type: 'income' as const,
          category: 'বই বিক্রয়',
          amount: 25000,
          description: 'পাঠ্যবই বিক্রয়',
          date: '2024-02-25',
          status: 'completed' as const,
          schoolId,
          recordedBy: 'admin',
          paymentMethod: 'cash' as const
        },

        // Expense transactions
        {
          type: 'expense' as const,
          category: 'শিক্ষক বেতন',
          amount: 120000,
          description: 'জানুয়ারি মাসের শিক্ষক বেতন',
          date: '2024-01-30',
          status: 'completed' as const,
          schoolId,
          recordedBy: 'admin',
          paymentMethod: 'bank_transfer' as const
        },
        {
          type: 'expense' as const,
          category: 'বিদ্যুৎ বিল',
          amount: 15000,
          description: 'জানুয়ারি মাসের বিদ্যুৎ বিল',
          date: '2024-01-25',
          status: 'completed' as const,
          schoolId,
          recordedBy: 'admin',
          paymentMethod: 'bank_transfer' as const
        },
        {
          type: 'expense' as const,
          category: 'শিক্ষক বেতন',
          amount: 125000,
          description: 'ফেব্রুয়ারি মাসের শিক্ষক বেতন',
          date: '2024-02-28',
          status: 'completed' as const,
          schoolId,
          recordedBy: 'admin',
          paymentMethod: 'bank_transfer' as const
        },
        {
          type: 'expense' as const,
          category: 'রক্ষণাবেক্ষণ',
          amount: 8000,
          description: 'ক্লাসরুম রক্ষণাবেক্ষণ',
          date: '2024-02-20',
          status: 'completed' as const,
          schoolId,
          recordedBy: 'admin',
          paymentMethod: 'cash' as const
        }
      ];

      // Create transactions
      for (const transaction of sampleTransactions) {
        await this.createTransaction(transaction);
      }

      console.log('Sample financial data created successfully');
    } catch (error) {
      console.error('Error creating sample financial data:', error);
    }
  },

  // Real-time listeners for transactions
  subscribeToTransactions(
    schoolId: string,
    callback: (transactions: FinancialTransaction[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, 'financialTransactions'),
      where('schoolId', '==', schoolId),
      orderBy('date', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const transactions = snapshot.docs.map(doc =>
        ({ id: doc.id, ...doc.data() } as FinancialTransaction)
      );
      callback(transactions);
    }, (error) => {
      console.error('Error listening to transactions:', error);
    });
  },

  // Real-time listener for financial summary
  subscribeToFinancialSummary(
    schoolId: string,
    callback: (summary: {
      totalIncome: number;
      totalExpense: number;
      netAmount: number;
      pendingIncome: number;
      pendingExpense: number;
      transactionCount: number;
    }) => void
  ): Unsubscribe {
    const q = query(
      collection(db, 'financialTransactions'),
      where('schoolId', '==', schoolId)
    );

    return onSnapshot(q, (snapshot) => {
      const transactions = snapshot.docs.map(doc =>
        ({ id: doc.id, ...doc.data() } as FinancialTransaction)
      );

      const summary = {
        totalIncome: transactions
          .filter(t => t.type === 'income' && t.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0),
        totalExpense: transactions
          .filter(t => t.type === 'expense' && t.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0),
        netAmount: 0,
        pendingIncome: transactions
          .filter(t => t.type === 'income' && t.status === 'pending')
          .reduce((sum, t) => sum + t.amount, 0),
        pendingExpense: transactions
          .filter(t => t.type === 'expense' && t.status === 'pending')
          .reduce((sum, t) => sum + t.amount, 0),
        transactionCount: transactions.length
      };

      summary.netAmount = summary.totalIncome - summary.totalExpense;
      callback(summary);
    }, (error) => {
      console.error('Error listening to financial summary:', error);
    });
  },

  // Real-time listener for students
  subscribeToStudents(
    schoolId: string,
    callback: (students: User[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'student'),
      where('schoolId', '==', schoolId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const students = snapshot.docs.map(doc =>
        ({ uid: doc.id, ...doc.data() } as User)
      );
      callback(students);
    }, (error) => {
      console.error('Error listening to students:', error);
    });
  },

  // Real-time listener for fee collections
  subscribeToFeeCollections(
    schoolId: string,
    callback: (feeCollections: FeeCollection[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, 'feeCollections'),
      where('schoolId', '==', schoolId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const feeCollections = snapshot.docs.map(doc =>
        ({ id: doc.id, ...doc.data() } as FeeCollection)
      );
      callback(feeCollections);
    }, (error) => {
      console.error('Error listening to fee collections:', error);
    });
  },

  // Real-time listener for class-wise fee summary
  subscribeToClassWiseFeeSummary(
    schoolId: string,
    callback: (classSummary: Record<string, {
      totalStudents: number;
      totalPaid: number;
      totalDue: number;
      paidStudents: number;
    }>) => void
  ): Unsubscribe {
    return onSnapshot(
      query(collection(db, 'feeCollections'), where('schoolId', '==', schoolId)),
      (snapshot) => {
        const feeCollections = snapshot.docs.map(doc =>
          ({ id: doc.id, ...doc.data() } as FeeCollection)
        );

        // Group by class and calculate summary
        const classSummary: Record<string, {
          totalStudents: number;
          totalPaid: number;
          totalDue: number;
          paidStudents: number;
        }> = {};

        feeCollections.forEach(collection => {
          const className = collection.className;
          if (!classSummary[className]) {
            classSummary[className] = {
              totalStudents: 0,
              totalPaid: 0,
              totalDue: 0,
              paidStudents: 0
            };
          }

          if (collection.status === 'paid') {
            classSummary[className].totalPaid += collection.totalAmount;
            classSummary[className].paidStudents += 1;
          } else {
            classSummary[className].totalDue += collection.totalAmount;
          }
        });

        callback(classSummary);
      },
      (error) => {
        console.error('Error listening to class-wise fee summary:', error);
      }
    );
  },

  // Get next voucher number for session year
  async getNextVoucherNumber(sessionYear: string): Promise<string> {
    try {
      const schoolId = 'iqra-school-2025';
      const currentYear = new Date().getFullYear().toString();

      // Get all transactions for current session year
      const startOfYear = `${currentYear}-01-01`;
      const endOfYear = `${currentYear}-12-31`;

      const transactions = await this.getTransactionsByDateRange(startOfYear, endOfYear, schoolId);

      // Find the highest voucher number for this year
      let maxVoucherNumber = 0;

      transactions.forEach(transaction => {
        if (transaction.reference && transaction.reference.startsWith(`${currentYear}-`)) {
          const voucherNum = parseInt(transaction.reference.substring(5)); // Remove year prefix (2025-)
          if (!isNaN(voucherNum) && voucherNum > maxVoucherNumber) {
            maxVoucherNumber = voucherNum;
          }
        }
      });

      // Next voucher number
      const nextNumber = (maxVoucherNumber + 1).toString().padStart(3, '0');
      return `${currentYear}-${nextNumber}`;

    } catch (error) {
      console.error('Error getting next voucher number:', error);
      // Fallback to timestamp-based voucher
      return `V${Date.now()}`;
    }
  },

  // Get fee structure for a specific class - READ FROM DATABASE
  async getClassFeeStructure(className: string, schoolId: string): Promise<{
    tuitionFee: number;
    feeName: string;
    feeType: string;
  } | null> {
    try {
      console.log('🔍=== DATABASE FEE LOOKUP ===');
      console.log('🎯 Class requested:', className);
      console.log('🏫 School ID:', schoolId);

      // Get all active fees for this school using feeQueries
      const fees = await feeQueries.getActiveFees(schoolId);
      console.log('📋 Available fees:', fees.length);

      // First, let's try to find fees that match the class name exactly
      let applicableFee = fees.find((fee: Fee) => {
        return fee.applicableClasses.includes(className);
      });

      // If no exact match, try pattern matching
      if (!applicableFee) {
        applicableFee = fees.find((fee: Fee) => {
          return fee.applicableClasses.some((classPattern: string) => {
            // Simple pattern matching for Bengali class names
            if (classPattern === className) return true;

            // Check if classPattern is contained in className or vice versa
            if (className.includes(classPattern) || classPattern.includes(className)) {
              return true;
            }

            // Handle common variations
            if (className === 'প্লে' && classPattern === 'প্লে') return true;
            if (className === 'নার্সারি' && classPattern === 'নার্সারি') return true;

            return false;
          });
        });
      }

      if (applicableFee) {
        console.log('✅ Found database fee for', className, ': ৳' + applicableFee.amount);
        return {
          tuitionFee: applicableFee.amount,
          feeName: applicableFee.feeName,
          feeType: applicableFee.feeType
        };
      }

      // If no specific fee found, look for general tuition fees
      const generalTuitionFee = fees.find((fee: Fee) =>
        fee.feeName.includes('টিউশন') &&
        fee.feeType === 'monthly' &&
        fee.isActive
      );

      if (generalTuitionFee) {
        console.log('✅ Using general tuition fee for', className, ': ৳' + generalTuitionFee.amount);
        return {
          tuitionFee: generalTuitionFee.amount,
          feeName: generalTuitionFee.feeName,
          feeType: generalTuitionFee.feeType
        };
      }

      // If no fee found in database, use default fallback
      console.log('⚠️ No fee found in database for', className, ', using default: ৳500');
      return {
        tuitionFee: 500,
        feeName: 'টিউশন ফি',
        feeType: 'monthly'
      };

    } catch (error) {
      console.error('❌ Error getting class fee structure from database:', error);
      return {
        tuitionFee: 500,
        feeName: 'টিউশন ফি',
        feeType: 'monthly'
      };
    }
  },

  // Create class-specific fee structure
  async createClassSpecificFee(
    className: string,
    tuitionFee: number,
    schoolId: string,
    createdBy: string
  ): Promise<string> {
    try {
      const feeData = {
        feeName: `টিউশন ফি - ${className}`,
        feeNameEn: `Tuition Fee - ${className}`,
        amount: tuitionFee,
        description: `${className} ক্লাসের মাসিক টিউশন ফি`,
        applicableClasses: [className],
        feeType: 'monthly' as const,
        isActive: true,
        schoolId,
        createdBy
      };

      const feeId = await feeQueries.createFee(feeData);
      console.log(`✅ Created class-specific fee for ${className}: ৳${tuitionFee}`);
      return feeId;

    } catch (error) {
      console.error(`❌ Error creating class-specific fee for ${className}:`, error);
      throw error;
    }
  },

  // Update class-specific fee
  async updateClassSpecificFee(
    className: string,
    newAmount: number,
    schoolId: string
  ): Promise<void> {
    try {
      // Find existing fee for this class
      const fees = await feeQueries.getActiveFees(schoolId);
      const existingFee = fees.find((fee: Fee) =>
        fee.applicableClasses.includes(className) &&
        fee.feeName.includes('টিউশন ফি')
      );

      if (existingFee && existingFee.id) {
        await feeQueries.updateFee(existingFee.id, { amount: newAmount });
        console.log(`✅ Updated fee for ${className} to ৳${newAmount}`);
      } else {
        console.log(`⚠️ No existing fee found for ${className}, creating new one`);
        await this.createClassSpecificFee(className, newAmount, schoolId, 'system');
      }

    } catch (error) {
      console.error(`❌ Error updating class-specific fee for ${className}:`, error);
      throw error;
    }
  },

  // Get all class-specific fees for a school
  async getClassSpecificFees(schoolId: string): Promise<Record<string, number>> {
    try {
      const fees = await feeQueries.getActiveFees(schoolId);
      const classFees: Record<string, number> = {};

      fees.forEach((fee: Fee) => {
        if (fee.feeName.includes('টিউশন ফি') && fee.feeType === 'monthly') {
          fee.applicableClasses.forEach((className: string) => {
            classFees[className] = fee.amount;
          });
        }
      });

      console.log('📊 Class-specific fees:', classFees);
      return classFees;

    } catch (error) {
      console.error('❌ Error getting class-specific fees:', error);
      return {};
    }
  },

  // Bulk create/update fees for multiple classes
  async bulkUpdateClassFees(
    classFees: Record<string, number>,
    schoolId: string,
    updatedBy: string
  ): Promise<void> {
    try {
      console.log('🔄 Starting bulk fee update for classes:', Object.keys(classFees));

      for (const [className, feeAmount] of Object.entries(classFees)) {
        await this.updateClassSpecificFee(className, feeAmount, schoolId);
      }

      console.log('✅ Bulk fee update completed successfully');

    } catch (error) {
      console.error('❌ Error in bulk fee update:', error);
      throw error;
    }
  },

  // Helper method for Bengali class name variations
  getBengaliClassVariations(className: string): string[] {
    const variations: string[] = [className];

    // Add common variations for Bengali class names
    if (className.includes('পঞ্চম')) {
      variations.push('পঞ্চম শ্রেণি', 'পঞ্চম শ্রেণী', '৫ম', '৫ম শ্রেণি', '৫ম শ্রেণী', 'পঞ্চম');
    }
    if (className.includes('চতুর্থ')) {
      variations.push('চতুর্থ শ্রেণি', 'চতুর্থ শ্রেণী', '৪র্থ', '৪র্থ শ্রেণি', 'চতুর্থ');
    }
    if (className.includes('তৃতীয়')) {
      variations.push('তৃতীয় শ্রেণি', 'তৃতীয় শ্রেণি', '৩য়', '৩য় শ্রেণি', 'তৃতীয়');
    }
    if (className.includes('দ্বিতীয়')) {
      variations.push('দ্বিতীয় শ্রেণি', 'দ্বিতীয় শ্রেণি', '২য়', '২য় শ্রেণি', 'দ্বিতীয়');
    }
    if (className.includes('প্রথম')) {
      variations.push('প্রথম শ্রেণি', 'প্রথম শ্রেণী', '১ম', '১ম শ্রেণি', 'প্রথম');
    }
    if (className.includes('ষষ্ঠ')) {
      variations.push('ষষ্ঠ শ্রেণি', 'ষষ্ঠ শ্রেণী', '৬ষ্ঠ', '৬ষ্ঠ শ্রেণি', 'ষষ্ঠ');
    }
    if (className.includes('সপ্তম')) {
      variations.push('সপ্তম শ্রেণি', 'সপ্তম শ্রেণী', '৭ম', '৭ম শ্রেণি', 'সপ্তম');
    }
    if (className.includes('অষ্টম')) {
      variations.push('অষ্টম শ্রেণি', 'অষ্টম শ্রেণী', '৮ম', '৮ম শ্রেণি', 'অষ্টম');
    }
    if (className.includes('নার্সারি')) {
      variations.push('নার্সারি', 'নার্সারি ক্লাস', 'নার্সারি শ্রেণি');
    }
    if (className.includes('প্লে')) {
      variations.push('প্লে', 'প্লে ক্লাস', 'প্লে শ্রেণি', 'প্লে গ্রুপ');
    }

    return [...new Set(variations)]; // Remove duplicates
  },

  // Create sample fees for testing - UPDATED FOR USER'S CLASSES
  async createSampleFees(): Promise<void> {
    try {
      const schoolId = 'iqra-school-2025';

      // Create fees specifically for the user's classes
      const userFees = [
        {
          feeName: 'টিউশন ফি - প্লে',
          feeNameEn: 'Tuition Fee - Play',
          amount: 600, // প্লে class fee
          description: 'প্লে ক্লাসের মাসিক টিউশন ফি',
          applicableClasses: ['প্লে'],
          feeType: 'monthly' as const,
          isActive: true,
          schoolId,
          createdBy: 'system'
        },
        {
          feeName: 'টিউশন ফি - নার্সারি',
          feeNameEn: 'Tuition Fee - Nursery',
          amount: 800, // নার্সারি class fee
          description: 'নার্সারি ক্লাসের মাসিক টিউশন ফি',
          applicableClasses: ['নার্সারি'],
          feeType: 'monthly' as const,
          isActive: true,
          schoolId,
          createdBy: 'system'
        }
      ];

      // Delete existing fees first to avoid duplicates
      await feeQueries.deleteAllFees(schoolId);
      console.log('🗑️ Deleted existing fees');

      // Create new fees
      for (const feeData of userFees) {
        await feeQueries.createFee(feeData);
        console.log(`✅ Created fee: ${feeData.feeName} - ৳${feeData.amount} for classes: ${feeData.applicableClasses.join(', ')}`);
      }

      console.log('✅ User-specific fees created successfully');
    } catch (error) {
      console.error('❌ Error creating user fees:', error);
    }
  },

  // Exam Fee Management Functions
  async getExamFees(schoolId: string): Promise<{
    monthly: Record<string, number>;
    quarterly: Record<string, number>;
    halfYearly: Record<string, number>;
    annual: Record<string, number>;
  }> {
    try {
      const examFeesRef = doc(db, 'examFees', schoolId);
      const examFeesSnap = await getDoc(examFeesRef);

      if (examFeesSnap.exists()) {
        const data = examFeesSnap.data();
        return {
          monthly: data.monthly || {},
          quarterly: data.quarterly || {},
          halfYearly: data.halfYearly || {},
          annual: data.annual || {}
        };
      }

      return {
        monthly: {},
        quarterly: {},
        halfYearly: {},
        annual: {}
      };
    } catch (error) {
      console.error('Error getting exam fees:', error);
      return {
        monthly: {},
        quarterly: {},
        halfYearly: {},
        annual: {}
      };
    }
  },

  async saveExamFees(schoolId: string, examFees: {
    monthly: Record<string, number>;
    quarterly: Record<string, number>;
    halfYearly: Record<string, number>;
    annual: Record<string, number>;
  }, updatedBy: string): Promise<void> {
    try {
      const examFeesRef = doc(db, 'examFees', schoolId);
      await setDoc(examFeesRef, {
        ...examFees,
        updatedBy,
        updatedAt: serverTimestamp()
      }, { merge: true });
      console.log('✅ Exam fees saved successfully');
    } catch (error) {
      console.error('❌ Error saving exam fees:', error);
      throw error;
    }
  },

  async updateExamFee(
    schoolId: string,
    examType: 'monthly' | 'quarterly' | 'halfYearly' | 'annual',
    className: string,
    amount: number,
    updatedBy: string
  ): Promise<void> {
    try {
      const examFeesRef = doc(db, 'examFees', schoolId);

      // Get current exam fees
      const currentFees = await this.getExamFees(schoolId);

      // Update the specific exam type and class
      currentFees[examType][className] = amount;

      // Save updated fees
      await this.saveExamFees(schoolId, currentFees, updatedBy);
      console.log(`✅ Updated ${examType} exam fee for ${className}: ৳${amount}`);
    } catch (error) {
      console.error('❌ Error updating exam fee:', error);
      throw error;
    }
  },

  async deleteExamFee(
    schoolId: string,
    examType: 'monthly' | 'quarterly' | 'halfYearly' | 'annual',
    className: string,
    updatedBy: string
  ): Promise<void> {
    try {
      const examFeesRef = doc(db, 'examFees', schoolId);

      // Get current exam fees
      const currentFees = await this.getExamFees(schoolId);

      // Delete the specific exam fee
      if (currentFees[examType][className]) {
        delete currentFees[examType][className];
      }

      // Save updated fees
      await this.saveExamFees(schoolId, currentFees, updatedBy);
      console.log(`✅ Deleted ${examType} exam fee for ${className}`);
    } catch (error) {
      console.error('❌ Error deleting exam fee:', error);
      throw error;
    }
  },

  async getExamFeeByClassAndType(
    schoolId: string,
    className: string,
    examType: 'monthly' | 'quarterly' | 'halfYearly' | 'annual'
  ): Promise<number | null> {
    try {
      const examFees = await this.getExamFees(schoolId);
      return examFees[examType][className] || null;
    } catch (error) {
      console.error('Error getting exam fee by class and type:', error);
      return null;
    }
  },

  // Bulk update exam fees for multiple classes
  async bulkUpdateExamFees(
    schoolId: string,
    updates: {
      examType: 'monthly' | 'quarterly' | 'halfYearly' | 'annual';
      className: string;
      amount: number;
    }[],
    updatedBy: string
  ): Promise<void> {
    try {
      const currentFees = await this.getExamFees(schoolId);

      // Apply all updates
      updates.forEach(update => {
        currentFees[update.examType][update.className] = update.amount;
      });

      // Save updated fees
      await this.saveExamFees(schoolId, currentFees, updatedBy);
      console.log(`✅ Bulk updated ${updates.length} exam fees`);
    } catch (error) {
      console.error('❌ Error bulk updating exam fees:', error);
      throw error;
    }
  },

  // Create sample exam fees for testing
  async createSampleExamFees(schoolId?: string): Promise<void> {
    try {
      const defaultSchoolId = schoolId || 'IQRA-202531';

      const sampleExamFees = {
        monthly: {
          'প্লে': 200,
          'নার্সারি': 250,
          'প্রথম': 300,
          'দ্বিতীয়': 350,
          'তৃতীয়': 400,
          'চতুর্থ': 450,
          'পঞ্চম': 500,
          'ষষ্ঠ': 550,
          'সপ্তম': 600,
          'অষ্টম': 650,
          'নবম': 700,
          'দশম': 750
        },
        quarterly: {
          'প্লে': 500,
          'নার্সারি': 650,
          'প্রথম': 800,
          'দ্বিতীয়': 900,
          'তৃতীয়': 1000,
          'চতুর্থ': 1100,
          'পঞ্চম': 1200,
          'ষষ্ঠ': 1300,
          'সপ্তম': 1400,
          'অষ্টম': 1500,
          'নবম': 1600,
          'দশম': 1700
        },
        halfYearly: {
          'প্লে': 900,
          'নার্সারি': 1200,
          'প্রথম': 1500,
          'দ্বিতীয়': 1700,
          'তৃতীয়': 1900,
          'চতুর্থ': 2100,
          'পঞ্চম': 2300,
          'ষষ্ঠ': 2500,
          'সপ্তম': 2700,
          'অষ্টম': 2900,
          'নবম': 3100,
          'দশম': 3300
        },
        annual: {
          'প্লে': 1800,
          'নার্সারি': 2400,
          'প্রথম': 3000,
          'দ্বিতীয়': 3400,
          'তৃতীয়': 3800,
          'চতুর্থ': 4200,
          'পঞ্চম': 4600,
          'ষষ্ঠ': 5000,
          'সপ্তম': 5400,
          'অষ্টম': 5800,
          'নবম': 6200,
          'দশম': 6600
        }
      };

      await this.saveExamFees(defaultSchoolId, sampleExamFees, 'system');
      console.log('✅ Sample exam fees created successfully');
    } catch (error) {
      console.error('❌ Error creating sample exam fees:', error);
    }
  }
};

// Exam Management Functions
export const examQueries = {
 // Get all exams
 async getAllExams(schoolId?: string): Promise<Exam[]> {
   let q = query(collection(db, 'exams'), orderBy('createdAt', 'desc'));

   if (schoolId) {
     q = query(q, where('schoolId', '==', schoolId));
   }

   const snapshot = await getDocs(q);
   return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exam));
 },

 // Get exams by status
 async getExamsByStatus(status: 'সক্রিয়' | 'সম্পন্ন' | 'পরিকল্পনা', schoolId?: string): Promise<Exam[]> {
   let q = query(
     collection(db, 'exams'),
     where('status', '==', status),
     orderBy('createdAt', 'desc')
   );

   if (schoolId) {
     q = query(q, where('schoolId', '==', schoolId));
   }

   const snapshot = await getDocs(q);
   return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exam));
 },

 // Get exam by ID
 async getExamById(id: string): Promise<Exam | null> {
   const docRef = doc(db, 'exams', id);
   const docSnap = await getDoc(docRef);
   return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Exam : null;
 },

 // Create exam
 async createExam(examData: Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
   const examDoc = {
     ...examData,
     createdAt: serverTimestamp(),
     updatedAt: serverTimestamp()
   };

   const docRef = await addDoc(collection(db, 'exams'), examDoc);
   return docRef.id;
 },

 // Update exam
 async updateExam(id: string, updates: Partial<Exam>): Promise<void> {
   const docRef = doc(db, 'exams', id);
   await updateDoc(docRef, {
     ...updates,
     updatedAt: serverTimestamp()
   });
 },

 // Delete exam
 async deleteExam(id: string): Promise<void> {
   await deleteDoc(doc(db, 'exams', id));
 },

 // Create sample exams for testing
 async createSampleExams(): Promise<void> {
   try {
     const schoolId = 'iqra-school-2025';

     const sampleExams = [
       {
         name: 'প্রথম সাময়িক পরীক্ষা',
         nameEn: 'First Term Exam',
         class: 'প্রথম',
         subject: 'সকল বিষয়',
         date: '২০২৪-০২-১৫',
         startDate: '2024-02-15',
         endDate: '2024-02-20',
         time: '১০:০০',
         duration: '২ ঘণ্টা',
         totalMarks: 100,
         students: 25,
         status: 'সক্রিয়' as const,
         schoolId,
         createdBy: 'admin',
         resultsPublished: false,
         allowResultView: false,
         examType: 'সাময়িক' as const,
         passingMarks: 40,
         gradingSystem: 'percentage' as const,
         instructions: 'সকল প্রশ্নের উত্তর দিতে হবে। সময় ২ ঘণ্টা।',
         venue: 'মূল ভবন'
       },
       {
         name: 'মাসিক পরীক্ষা',
         nameEn: 'Monthly Exam',
         class: 'দ্বিতীয়',
         subject: 'গণিত',
         date: '২০২৪-০১-২০',
         startDate: '2024-01-20',
         endDate: '2024-01-20',
         time: '১১:০০',
         duration: '১.৫ ঘণ্টা',
         totalMarks: 50,
         students: 22,
         status: 'সম্পন্ন' as const,
         schoolId,
         createdBy: 'admin',
         resultsPublished: true,
         allowResultView: true,
         examType: 'মাসিক' as const,
         passingMarks: 20,
         gradingSystem: 'percentage' as const,
         instructions: 'গণিত বিষয়ের মাসিক পরীক্ষা।',
         venue: 'ক্লাসরুম ১'
       },
       {
         name: 'বার্ষিক পরীক্ষা',
         nameEn: 'Annual Exam',
         class: 'তৃতীয়',
         subject: 'সকল বিষয়',
         date: '২০২৪-০৩-১০',
         startDate: '2024-03-10',
         endDate: '2024-03-25',
         time: '০৯:০০',
         duration: '৩ ঘণ্টা',
         totalMarks: 200,
         students: 28,
         status: 'পরিকল্পনা' as const,
         schoolId,
         createdBy: 'admin',
         resultsPublished: false,
         allowResultView: false,
         examType: 'বার্ষিক' as const,
         passingMarks: 80,
         gradingSystem: 'gpa' as const,
         instructions: 'বার্ষিক পরীক্ষার সকল নিয়মকানুন মেনে চলুন।',
         venue: 'পরীক্ষা হল',
         gradeDistribution: {
           'A+': { min: 80, max: 100 },
           'A': { min: 70, max: 79 },
           'A-': { min: 60, max: 69 },
           'B': { min: 50, max: 59 },
           'C': { min: 40, max: 49 },
           'D': { min: 33, max: 39 },
           'F': { min: 0, max: 32 }
         }
       }
     ];

     for (const examData of sampleExams) {
       await this.createExam(examData);
     }

     console.log('✅ Sample exams created successfully');
   } catch (error) {
     console.error('❌ Error creating sample exams:', error);
   }
 },

 // Toggle result publication status
 async toggleResultPublication(examId: string, publish: boolean, publishedBy: string): Promise<void> {
   const updates: Partial<Exam> = {
     resultsPublished: publish,
     allowResultView: publish
   };

   if (publish) {
     updates.resultsPublishedAt = serverTimestamp() as Timestamp;
     updates.resultsPublishedBy = publishedBy;
   }
   // When unpublishing, don't set the timestamp fields at all (let them keep existing values or remain undefined)

   await this.updateExam(examId, updates);
 },

 // Get published exams
 async getPublishedExams(schoolId?: string): Promise<Exam[]> {
   let q = query(
     collection(db, 'exams'),
     where('resultsPublished', '==', true),
     orderBy('resultsPublishedAt', 'desc')
   );

   if (schoolId) {
     q = query(q, where('schoolId', '==', schoolId));
   }

   const snapshot = await getDocs(q);
   return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exam));
 },

 // Get unpublished exams
 async getUnpublishedExams(schoolId?: string): Promise<Exam[]> {
   let q = query(
     collection(db, 'exams'),
     where('resultsPublished', '==', false),
     orderBy('createdAt', 'desc')
   );

   if (schoolId) {
     q = query(q, where('schoolId', '==', schoolId));
   }

   const snapshot = await getDocs(q);
   return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exam));
 },

 // Get exams by type
 async getExamsByType(examType: 'মাসিক' | 'সাময়িক' | 'বার্ষিক' | 'নির্বাচনী' | 'অন্যান্য', schoolId?: string): Promise<Exam[]> {
   let q = query(
     collection(db, 'exams'),
     where('examType', '==', examType),
     orderBy('createdAt', 'desc')
   );

   if (schoolId) {
     q = query(q, where('schoolId', '==', schoolId));
   }

   const snapshot = await getDocs(q);
   return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exam));
 },

 // Real-time listener for exams
 subscribeToExams(
   schoolId: string,
   callback: (exams: Exam[]) => void,
   errorCallback?: (error: any) => void
 ): Unsubscribe {
   const q = query(
     collection(db, 'exams'),
     where('schoolId', '==', schoolId),
     orderBy('createdAt', 'desc')
   );

   return onSnapshot(q, (snapshot) => {
     const exams = snapshot.docs.map(doc =>
       ({ id: doc.id, ...doc.data() } as Exam)
     );
     callback(exams);
   }, (error) => {
     console.error('❌ Error listening to exams:', error);
     if (errorCallback) {
       errorCallback(error);
     }
   });
 }
};

// Exam Results Management Functions
export const examResultQueries = {
 // Get all results for an exam
 async getExamResults(examId: string): Promise<ExamResult[]> {
   const q = query(
     collection(db, 'examResults'),
     where('examId', '==', examId),
     orderBy('studentRoll', 'asc')
   );

   const snapshot = await getDocs(q);
   return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamResult));
 },

 // Get results for a student
 async getStudentResults(studentId: string, schoolId?: string): Promise<ExamResult[]> {
   let q = query(
     collection(db, 'examResults'),
     where('studentId', '==', studentId),
     orderBy('enteredAt', 'desc')
   );

   if (schoolId) {
     q = query(q, where('schoolId', '==', schoolId));
   }

   const snapshot = await getDocs(q);
   return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamResult));
 },

 // Create or update exam result
 async saveExamResult(resultData: Omit<ExamResult, 'id' | 'enteredAt' | 'updatedAt'>): Promise<string> {
   // Check if result already exists
   const existingResult = await this.getStudentExamResult(resultData.studentId, resultData.examId, resultData.subject);
   
   if (existingResult) {
     // Update existing result
     await this.updateExamResult(existingResult.id!, {
       obtainedMarks: resultData.obtainedMarks,
       percentage: resultData.percentage,
       grade: resultData.grade,
       gpa: resultData.gpa,
       remarks: resultData.remarks,
       isAbsent: resultData.isAbsent,
       updatedAt: serverTimestamp() as Timestamp
     });
     return existingResult.id!;
   } else {
     // Create new result
     const resultDoc = {
       ...resultData,
       enteredAt: serverTimestamp(),
       updatedAt: serverTimestamp()
     };

     const docRef = await addDoc(collection(db, 'examResults'), resultDoc);
     return docRef.id;
   }
 },

 // Get specific student exam result
 async getStudentExamResult(studentId: string, examId: string, subject: string): Promise<ExamResult | null> {
   const q = query(
     collection(db, 'examResults'),
     where('studentId', '==', studentId),
     where('examId', '==', examId),
     where('subject', '==', subject),
     limit(1)
   );

   const snapshot = await getDocs(q);
   return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as ExamResult;
 },

 // Update exam result
 async updateExamResult(resultId: string, updates: Partial<ExamResult>): Promise<void> {
   const docRef = doc(db, 'examResults', resultId);
   await updateDoc(docRef, {
     ...updates,
     updatedAt: serverTimestamp()
   });
 },

 // Delete exam result
 async deleteExamResult(resultId: string): Promise<void> {
   await deleteDoc(doc(db, 'examResults', resultId));
 },

 // Calculate exam statistics
 async getExamStatistics(examId: string): Promise<{
   totalStudents: number;
   presentStudents: number;
   absentStudents: number;
   passedStudents: number;
   failedStudents: number;
   averageMarks: number;
   highestMarks: number;
   lowestMarks: number;
   averagePercentage: number;
 }> {
   const results = await this.getExamResults(examId);
   
   const presentResults = results.filter(r => !r.isAbsent);
   const passedResults = presentResults.filter(r => r.percentage >= 40); // Assuming 40% is passing
   
   const statistics = {
     totalStudents: results.length,
     presentStudents: presentResults.length,
     absentStudents: results.filter(r => r.isAbsent).length,
     passedStudents: passedResults.length,
     failedStudents: presentResults.length - passedResults.length,
     averageMarks: 0,
     highestMarks: 0,
     lowestMarks: 0,
     averagePercentage: 0
   };

   if (presentResults.length > 0) {
     const marks = presentResults.map(r => r.obtainedMarks);
     const percentages = presentResults.map(r => r.percentage);
     
     statistics.averageMarks = marks.reduce((sum, mark) => sum + mark, 0) / marks.length;
     statistics.highestMarks = Math.max(...marks);
     statistics.lowestMarks = Math.min(...marks);
     statistics.averagePercentage = percentages.reduce((sum, pct) => sum + pct, 0) / percentages.length;
   }

   return statistics;
 },

 // Generate merit list
 async generateMeritList(examId: string): Promise<ExamResult[]> {
   const results = await this.getExamResults(examId);
   
   // Sort by percentage in descending order
   const sortedResults = results
     .filter(r => !r.isAbsent)
     .sort((a, b) => b.percentage - a.percentage);

   // Assign positions
   let currentPosition = 1;
   for (let i = 0; i < sortedResults.length; i++) {
     if (i > 0 && sortedResults[i].percentage < sortedResults[i - 1].percentage) {
       currentPosition = i + 1;
     }
     sortedResults[i].position = currentPosition;
     
     // Update in database
     if (sortedResults[i].id) {
       await this.updateExamResult(sortedResults[i].id!, { position: currentPosition });
     }
   }

   return sortedResults;
 },

 // Bulk import results
 async bulkImportResults(results: Omit<ExamResult, 'id' | 'enteredAt' | 'updatedAt'>[]): Promise<number> {
   let importedCount = 0;
   
   for (const resultData of results) {
     try {
       await this.saveExamResult(resultData);
       importedCount++;
     } catch (error) {
       console.error('Error importing result for student:', resultData.studentName, error);
     }
   }

   return importedCount;
 }
};

// Exam Subjects Management Functions
export const examSubjectQueries = {
 // Get all subjects for an exam
 async getExamSubjects(examId: string): Promise<ExamSubject[]> {
   const q = query(
     collection(db, 'examSubjects'),
     where('examId', '==', examId),
     orderBy('createdAt', 'asc')
   );

   const snapshot = await getDocs(q);
   return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamSubject));
 },

 // Create exam subject
 async createExamSubject(subjectData: Omit<ExamSubject, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
   const subjectDoc = {
     ...subjectData,
     createdAt: serverTimestamp(),
     updatedAt: serverTimestamp()
   };

   const docRef = await addDoc(collection(db, 'examSubjects'), subjectDoc);
   return docRef.id;
 },

 // Update exam subject
 async updateExamSubject(subjectId: string, updates: Partial<ExamSubject>): Promise<void> {
   const docRef = doc(db, 'examSubjects', subjectId);
   await updateDoc(docRef, {
     ...updates,
     updatedAt: serverTimestamp()
   });
 },

 // Delete exam subject
 async deleteExamSubject(subjectId: string): Promise<void> {
   await deleteDoc(doc(db, 'examSubjects', subjectId));
 }
};

// Exam Schedule Management Functions
export const examScheduleQueries = {
 // Get exam schedule
 async getExamSchedule(examId: string): Promise<ExamSchedule | null> {
   const q = query(
     collection(db, 'examSchedules'),
     where('examId', '==', examId),
     limit(1)
   );

   const snapshot = await getDocs(q);
   return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as ExamSchedule;
 },

 // Create or update exam schedule
 async saveExamSchedule(scheduleData: Omit<ExamSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
   const existingSchedule = await this.getExamSchedule(scheduleData.examId);
   
   if (existingSchedule) {
     // Update existing schedule
     await this.updateExamSchedule(existingSchedule.id!, {
       subjects: scheduleData.subjects,
       updatedAt: serverTimestamp() as Timestamp
     });
     return existingSchedule.id!;
   } else {
     // Create new schedule
     const scheduleDoc = {
       ...scheduleData,
       createdAt: serverTimestamp(),
       updatedAt: serverTimestamp()
     };

     const docRef = await addDoc(collection(db, 'examSchedules'), scheduleDoc);
     return docRef.id;
   }
 },

 // Update exam schedule
 async updateExamSchedule(scheduleId: string, updates: Partial<ExamSchedule>): Promise<void> {
   const docRef = doc(db, 'examSchedules', scheduleId);
   await updateDoc(docRef, {
     ...updates,
     updatedAt: serverTimestamp()
   });
 },

 // Delete exam schedule
 async deleteExamSchedule(scheduleId: string): Promise<void> {
   await deleteDoc(doc(db, 'examSchedules', scheduleId));
 },

 // Get all schedules for a school
 async getSchoolExamSchedules(schoolId: string): Promise<ExamSchedule[]> {
   const q = query(
     collection(db, 'examSchedules'),
     where('schoolId', '==', schoolId),
     orderBy('createdAt', 'desc')
   );

   const snapshot = await getDocs(q);
   return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamSchedule));
 }
};

// Subject Management Functions
export const subjectQueries = {
 // Get all subjects
 async getAllSubjects(schoolId?: string): Promise<Subject[]> {
   let q = query(collection(db, 'subjects'), orderBy('createdAt', 'desc'));

   if (schoolId) {
     q = query(q, where('schoolId', '==', schoolId));
   }

   const snapshot = await getDocs(q);
   return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
 },

 // Get active subjects
 async getActiveSubjects(schoolId?: string): Promise<Subject[]> {
   let q = query(
     collection(db, 'subjects'),
     where('isActive', '==', true),
     orderBy('createdAt', 'desc')
   );

   if (schoolId) {
     q = query(q, where('schoolId', '==', schoolId));
   }

   const snapshot = await getDocs(q);
   return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
 },

 // Get subjects by type
 async getSubjectsByType(type: 'মূল' | 'ধর্মীয়' | 'ঐচ্ছিক', schoolId?: string): Promise<Subject[]> {
   let q = query(
     collection(db, 'subjects'),
     where('type', '==', type),
     where('isActive', '==', true),
     orderBy('createdAt', 'desc')
   );

   if (schoolId) {
     q = query(q, where('schoolId', '==', schoolId));
   }

   const snapshot = await getDocs(q);
   return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
 },

 // Get subject by ID
 async getSubjectById(id: string): Promise<Subject | null> {
   const docRef = doc(db, 'subjects', id);
   const docSnap = await getDoc(docRef);
   return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Subject : null;
 },

 // Create subject
 async createSubject(subjectData: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
   const subjectDoc = {
     ...subjectData,
     createdAt: serverTimestamp(),
     updatedAt: serverTimestamp()
   };

   const docRef = await addDoc(collection(db, 'subjects'), subjectDoc);
   return docRef.id;
 },

 // Update subject
 async updateSubject(id: string, updates: Partial<Subject>): Promise<void> {
   const docRef = doc(db, 'subjects', id);
   await updateDoc(docRef, {
     ...updates,
     updatedAt: serverTimestamp()
   });
 },

 // Delete subject
 async deleteSubject(id: string): Promise<void> {
   await deleteDoc(doc(db, 'subjects', id));
 },

 // Create sample subjects for testing
 async createSampleSubjects(): Promise<void> {
   try {
     const schoolId = 'iqra-school-2025';

     const sampleSubjects = [
       {
         name: 'গণিত',
         nameEn: 'Mathematics',
         code: 'MATH101',
         teacherName: 'মোহাম্মদ লাভলু শেখ',
         classes: ['ক্লাস ৮', 'ক্লাস ৯', 'ক্লাস ১০'],
         students: 75,
         credits: 4,
         type: 'মূল' as const,
         description: 'সাধারণ গণিত ও উচ্চতর গণিতের মৌলিক বিষয়সমূহ',
         schoolId,
         createdBy: 'admin',
         isActive: true
       },
       {
         name: 'বাংলা',
         nameEn: 'Bangla',
         code: 'BAN101',
         teacherName: 'ড. সালমা খাতুন',
         classes: ['ক্লাস ৭', 'ক্লাস ৮', 'ক্লাস ৯'],
         students: 82,
         credits: 5,
         type: 'মূল' as const,
         description: 'বাংলা ভাষা ও সাহিত্যের মৌলিক বিষয়সমূহ',
         schoolId,
         createdBy: 'admin',
         isActive: true
       },
       {
         name: 'ইংরেজি',
         nameEn: 'English',
         code: 'ENG101',
         teacherName: 'ফারিয়া আহমেদ',
         classes: ['ক্লাস ৮', 'ক্লাস ৯'],
         students: 47,
         credits: 4,
         type: 'মূল' as const,
         description: 'ইংরেজি ভাষার ব্যাকরণ ও সাহিত্য',
         schoolId,
         createdBy: 'admin',
         isActive: true
       },
       {
         name: 'বিজ্ঞান',
         nameEn: 'Science',
         code: 'SCI101',
         teacherName: 'মাহবুব রহমান',
         classes: ['ক্লাস ৭', 'ক্লাস ৮'],
         students: 50,
         credits: 6,
         type: 'মূল' as const,
         description: 'পদার্থবিজ্ঞান, রসায়ন ও জীববিজ্ঞানের প্রাথমিক ধারণা',
         schoolId,
         createdBy: 'admin',
         isActive: true
       },
       {
         name: 'ইসলামিক স্টাডিজ',
         nameEn: 'Islamic Studies',
         code: 'ISL101',
         teacherName: 'আবু বকর সিদ্দিক',
         classes: ['ক্লাস ৭', 'ক্লাস ৮', 'ক্লাস ৯', 'ক্লাস ১০'],
         students: 95,
         credits: 3,
         type: 'ধর্মীয়' as const,
         description: 'ইসলামি শিক্ষা ও নৈতিকতার মৌলিক বিষয়সমূহ',
         schoolId,
         createdBy: 'admin',
         isActive: true
       },
       {
         name: 'কম্পিউটার সায়েন্স',
         nameEn: 'Computer Science',
         code: 'CS101',
         teacherName: 'তানভীর আহমেদ',
         classes: ['ক্লাস ৯', 'ক্লাস ১০'],
         students: 35,
         credits: 3,
         type: 'ঐচ্ছিক' as const,
         description: 'কম্পিউটারের মৌলিক ধারণা ও প্রোগ্রামিং',
         schoolId,
         createdBy: 'admin',
         isActive: true
       }
     ];

     for (const subjectData of sampleSubjects) {
       await this.createSubject(subjectData);
     }

     console.log('✅ Sample subjects created successfully');
   } catch (error) {
     console.error('❌ Error creating sample subjects:', error);
   }
 },

 // Real-time listener for subjects
 subscribeToSubjects(
   schoolId: string,
   callback: (subjects: Subject[]) => void,
   errorCallback?: (error: any) => void
 ): Unsubscribe {
   const q = query(
     collection(db, 'subjects'),
     where('schoolId', '==', schoolId),
     orderBy('createdAt', 'desc')
   );

   return onSnapshot(q, (snapshot) => {
     const subjects = snapshot.docs.map(doc =>
       ({ id: doc.id, ...doc.data() } as Subject)
     );
     callback(subjects);
   }, (error) => {
     console.error('❌ Error listening to subjects:', error);
     if (errorCallback) {
       errorCallback(error);
     }
   });
 }
};

// Class Management Functions
export const classQueries = {
  // Get all classes
  async getAllClasses(): Promise<Class[]> {
    const q = query(collection(db, 'classes'), orderBy('className'));
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
      const schoolId = 'iqra-school-2025';
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

// Attendance Management Functions
export const attendanceQueries = {
  // Get attendance by date and class
  async getAttendanceByDateAndClass(date: string, classId: string): Promise<AttendanceRecord[]> {
    let q;

    if (classId === 'all' || !classId) {
      // Get all attendance records for the selected date
      q = query(
        collection(db, 'attendanceRecords'),
        where('date', '==', date),
        orderBy('timestamp', 'desc')
      );
    } else {
      // Get attendance records for specific class and date
      q = query(
        collection(db, 'attendanceRecords'),
        where('date', '==', date),
        where('classId', '==', classId),
        orderBy('timestamp', 'desc')
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
  },

  // Get student attendance history
  async getStudentAttendance(studentId: string, limitCount?: number): Promise<AttendanceRecord[]> {
    let q = query(
      collection(db, 'attendanceRecords'),
      where('studentId', '==', studentId),
      orderBy('date', 'desc')
    );

    if (limitCount) {
      q = query(q, limit(limitCount));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
  },

  // Get attendance by school and date range
  async getSchoolAttendance(schoolId: string, startDate: string, endDate?: string): Promise<AttendanceRecord[]> {
    let q = query(
      collection(db, 'attendanceRecords'),
      where('schoolId', '==', schoolId),
      where('date', '>=', startDate)
    );

    if (endDate) {
      q = query(q, where('date', '<=', endDate));
    }

    q = query(q, orderBy('date', 'desc'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
  },

  // Record attendance
  async recordAttendance(attendanceData: Omit<AttendanceRecord, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'attendanceRecords'), attendanceData);
    return docRef.id;
  },

  // Update attendance
  async updateAttendance(id: string, updates: Partial<AttendanceRecord>): Promise<void> {
    const docRef = doc(db, 'attendanceRecords', id);
    await updateDoc(docRef, updates);
  }
};

// School Statistics Functions
export const statsQueries = {
  // Get user count by role for a school
  async getUserStatsBySchool(schoolId: string): Promise<Record<string, number>> {
    const users = await userQueries.getUsersBySchool(schoolId);
    const stats: Record<string, number> = {};
    
    users.forEach(user => {
      stats[user.role] = (stats[user.role] || 0) + 1;
    });
    
    return stats;
  },

  // Get attendance statistics for a date range
  async getAttendanceStats(schoolId: string, startDate: string, endDate: string): Promise<{
    totalRecords: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    attendanceRate: number;
  }> {
    const records = await attendanceQueries.getSchoolAttendance(schoolId, startDate, endDate);
    
    const stats = {
      totalRecords: records.length,
      presentCount: records.filter(r => r.status === 'present').length,
      absentCount: records.filter(r => r.status === 'absent').length,
      lateCount: records.filter(r => r.status === 'late').length,
      attendanceRate: 0
    };

    if (stats.totalRecords > 0) {
      stats.attendanceRate = (stats.presentCount / stats.totalRecords) * 100;
    }

    return stats;
  }
};

// Bengali to English Transliteration Map - Improved
const bengaliToEnglishMap: Record<string, string> = {
  // Compound characters (consonant + vowel combinations) - Most common first
  'মো': 'mo', 'মা': 'ma', 'মি': 'mi', 'মু': 'mu', 'মে': 'me', 'মৈ': 'moi', 'মং': 'mong',
  'লা': 'la', 'লি': 'li', 'লু': 'lu', 'লে': 'le', 'লো': 'lo', 'লৌ': 'lau', 'লং': 'lang',
  'শে': 'she', 'শা': 'sha', 'শি': 'shi', 'শু': 'shu', 'শো': 'sho', 'শৈ': 'shoi', 'শং': 'shong',
  'বা': 'ba', 'বি': 'bi', 'বু': 'bu', 'বে': 'be', 'বো': 'bo', 'বৈ': 'boi', 'বং': 'bong',
  'রা': 'ra', 'রি': 'ri', 'রু': 'ru', 'রে': 're', 'রো': 'ro', 'রৈ': 'roi', 'রং': 'rong',
  'না': 'na', 'নি': 'ni', 'নু': 'nu', 'নে': 'ne', 'নো': 'no', 'নৈ': 'noi', 'নং': 'nong',
  'কা': 'ka', 'কি': 'ki', 'কু': 'ku', 'কে': 'ke', 'কো': 'ko', 'কৈ': 'koi', 'কং': 'kong',
  'খা': 'kha', 'খি': 'khi', 'খু': 'khu', 'খে': 'khe', 'খো': 'kho', 'খৈ': 'khoi', 'খং': 'khong',
  'গা': 'ga', 'গি': 'gi', 'গু': 'gu', 'গে': 'ge', 'গো': 'go', 'গৈ': 'goi', 'গং': 'gong',
  'চা': 'cha', 'চি': 'chi', 'চু': 'chu', 'চে': 'che', 'চো': 'cho', 'চৈ': 'choi', 'চং': 'chong',
  'ছা': 'chha', 'ছি': 'chhi', 'ছু': 'chhu', 'ছে': 'chhe', 'ছো': 'chho', 'ছৈ': 'chhoi', 'ছং': 'chhong',
  'জা': 'ja', 'জি': 'ji', 'জু': 'ju', 'জে': 'je', 'জো': 'jo', 'জৈ': 'joi', 'জং': 'jong',
  'ঝা': 'jha', 'ঝি': 'jhi', 'ঝু': 'jhu', 'ঝে': 'jhe', 'ঝো': 'jho', 'ঝৈ': 'jhoi', 'ঝং': 'jhong',
  'টা': 'ta', 'টি': 'ti', 'টু': 'tu', 'টে': 'te', 'টো': 'to', 'টৈ': 'toi', 'টং': 'tong',
  'ঠা': 'tha', 'ঠি': 'thi', 'ঠু': 'thu', 'ঠে': 'the', 'ঠো': 'tho', 'ঠৈ': 'thoi', 'ঠং': 'thong',
  'ডা': 'da', 'ডি': 'di', 'ডু': 'du', 'ডে': 'de', 'ডো': 'do', 'ডৈ': 'doi', 'ডং': 'dong',
  'ঢা': 'dha', 'ঢি': 'dhi', 'ঢু': 'dhu', 'ঢে': 'dhe', 'ঢো': 'dho', 'ঢৈ': 'dhoi', 'ঢং': 'dhong',
  'তা': 'ta', 'তি': 'ti', 'তু': 'tu', 'তে': 'te', 'তো': 'to', 'তৈ': 'toi', 'তং': 'tong',
  'থা': 'tha', 'থি': 'thi', 'থু': 'thu', 'থে': 'the', 'থো': 'tho', 'থৈ': 'thoi', 'থং': 'thong',
  'দা': 'da', 'দি': 'di', 'দু': 'du', 'দে': 'de', 'দো': 'do', 'দৈ': 'doi', 'দং': 'dong',
  'ধা': 'dha', 'ধি': 'dhi', 'ধু': 'dhu', 'ধে': 'dhe', 'ধো': 'dho', 'ধৈ': 'dhoi', 'ধং': 'dhong',
  'পা': 'pa', 'পি': 'pi', 'পু': 'pu', 'পে': 'pe', 'পো': 'po', 'পৈ': 'poi', 'পং': 'pong',
  'ফা': 'pha', 'ফি': 'phi', 'ফু': 'phu', 'ফে': 'phe', 'ফো': 'pho', 'ফৈ': 'phoi', 'ফং': 'phong',
  'ভা': 'bha', 'ভি': 'bhi', 'ভু': 'bhu', 'ভে': 'bhe', 'ভো': 'bho', 'ভৈ': 'bhoi', 'ভং': 'bhong',
  'যা': 'ja', 'যি': 'ji', 'যু': 'ju', 'যে': 'je', 'যো': 'jo', 'যৈ': 'joi', 'যং': 'jong',
  'সা': 'sa', 'সি': 'si', 'সু': 'su', 'সে': 'se', 'সো': 'so', 'সৈ': 'soi', 'সং': 'song',
  'হা': 'ha', 'হি': 'hi', 'হু': 'hu', 'হে': 'he', 'হো': 'ho', 'হৈ': 'hoi', 'হং': 'hong',

  // Individual characters
  // Vowels
  'অ': 'o', 'আ': 'a', 'ই': 'i', 'ঈ': 'ee', 'উ': 'u', 'ঊ': 'oo', 'ঋ': 'ri', 'এ': 'e', 'ঐ': 'oi', 'ও': 'o', 'ঔ': 'ou',
  // Consonants
  'ক': 'k', 'খ': 'kh', 'গ': 'g', 'ঘ': 'gh', 'ঙ': 'ng',
  'চ': 'ch', 'ছ': 'chh', 'জ': 'j', 'ঝ': 'jh', 'ঞ': 'n',
  'ট': 't', 'ঠ': 'th', 'ড': 'd', 'ঢ': 'dh', 'ণ': 'n',
  'ত': 't', 'থ': 'th', 'দ': 'd', 'ধ': 'dh', 'ন': 'n',
  'প': 'p', 'ফ': 'ph', 'ব': 'b', 'ভ': 'bh', 'ম': 'm',
  'য': 'j', 'র': 'r', 'ল': 'l', 'শ': 'sh', 'ষ': 'sh', 'স': 's', 'হ': 'h',
  'ড়': 'r', 'ঢ়': 'rh', 'য়': 'y', 'ৎ': 't', 'ং': 'ng', 'ঃ': 'h', 'ঁ': 'n',
  // Numbers
  '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
};

// Utility Functions for Email Generation
export const emailUtils = {
  // Bengali to English transliteration
  transliterateBengaliToEnglish(bengaliText: string): string {
    let englishText = '';

    for (let i = 0; i < bengaliText.length; i++) {
      const char = bengaliText[i];
      const nextChar = bengaliText[i + 1];

      // Check for compound characters (consonant + vowel combinations)
      if (char in bengaliToEnglishMap && nextChar) {
        const compound = char + nextChar;
        // Add compound character if it exists, otherwise add individual character
        englishText += bengaliToEnglishMap[compound] || bengaliToEnglishMap[char] || char;
        if (bengaliToEnglishMap[compound]) {
          i++; // Skip next character if compound was found
        }
      } else {
        englishText += bengaliToEnglishMap[char] || char;
      }
    }

    return englishText;
  },

  // Clean text for email (remove spaces and special characters, convert to lowercase)
  cleanForEmail(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') // Remove all non-alphanumeric characters
      .substring(0, 10); // Limit to 10 characters
  },

  // Generate email address automatically with Bengali support
  generateStudentEmail(name: string, studentId: string, schoolName: string = 'iqra'): string {
    // Check if name contains Bengali characters
    const hasBengali = /[\u0980-\u09FF]/.test(name);

    let cleanName: string;
    if (hasBengali) {
      // Transliterate Bengali to English first
      const transliterated = this.transliterateBengaliToEnglish(name);
      cleanName = this.cleanForEmail(transliterated);
    } else {
      // Direct English name
      cleanName = this.cleanForEmail(name);
    }

    const rollNumber = studentId.padStart(3, '0');

    return `${cleanName}${rollNumber}@${schoolName}.bd.edu`;
  },

  // Generate random email for bulk import
  generateRandomEmail(name: string, schoolName: string = 'iqra'): string {
    // Check if name contains Bengali characters
    const hasBengali = /[\u0980-\u09FF]/.test(name);

    let cleanName: string;
    if (hasBengali) {
      // Transliterate Bengali to English first
      const transliterated = this.transliterateBengaliToEnglish(name);
      cleanName = this.cleanForEmail(transliterated).substring(0, 8);
    } else {
      // Direct English name
      cleanName = this.cleanForEmail(name).substring(0, 8);
    }

    const randomNumber = Math.floor(Math.random() * 999) + 1;
    const paddedNumber = randomNumber.toString().padStart(3, '0');

    return `${cleanName}${paddedNumber}@${schoolName}.bd.edu`;
  }
};

// Teacher Management Functions
export const teacherQueries = {
  // Get all teachers
  async getAllTeachers(): Promise<User[]> {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'teacher'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
  },

  // Get teachers by school
  async getTeachersBySchool(schoolId: string): Promise<User[]> {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'teacher'),
      where('schoolId', '==', schoolId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
  },

  // Get active teachers
  async getActiveTeachers(): Promise<User[]> {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'teacher'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
  },

  // Get inactive teachers
  async getInactiveTeachers(): Promise<User[]> {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'teacher'),
      where('isActive', '==', false),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
  },

  // Get teacher by ID
  async getTeacherById(uid: string): Promise<User | null> {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { uid: docSnap.id, ...docSnap.data() } as User : null;
  },

  // Get teachers by subject
  async getTeachersBySubject(subject: string): Promise<User[]> {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'teacher'),
      where('subject', '==', subject),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
  },

  // Create teacher
  async createTeacher(teacherData: Omit<User, 'createdAt' | 'updatedAt'> & { uid?: string }): Promise<string> {
    const teacherDoc = {
      ...teacherData,
      role: 'teacher' as const,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    if (teacherData.uid) {
      await setDoc(doc(db, 'users', teacherData.uid), teacherDoc);
      return teacherData.uid;
    } else {
      const docRef = await addDoc(collection(db, 'users'), teacherDoc);
      return docRef.id;
    }
  },

  // Update teacher
  async updateTeacher(uid: string, updates: Partial<User>): Promise<void> {
    try {
      const docRef = doc(db, 'users', uid);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      console.log('Updating teacher document:', uid, 'with data:', updateData);
      await updateDoc(docRef, updateData);
      console.log('Teacher updated successfully');
    } catch (error) {
      console.error('Error updating teacher:', error);
      throw new Error(`Failed to update teacher: ${error}`);
    }
  },

  // Activate/Deactivate teacher
  async setTeacherActive(uid: string, isActive: boolean): Promise<void> {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, {
      isActive,
      updatedAt: serverTimestamp()
    });
  },

  // Delete teacher
  async deleteTeacher(uid: string): Promise<void> {
    try {
      console.log('Attempting to delete teacher:', uid);
      await deleteDoc(doc(db, 'users', uid));
      console.log('Teacher deleted successfully:', uid);
    } catch (error) {
      console.error('Error deleting teacher:', error);
      throw error;
    }
  },

  // Get teacher statistics
  async getTeacherStats(schoolId?: string): Promise<{
    totalTeachers: number;
    activeTeachers: number;
    inactiveTeachers: number;
    teachersBySubject: Record<string, number>;
    experiencedTeachers: number;
  }> {
    let q = query(collection(db, 'users'), where('role', '==', 'teacher'));

    if (schoolId) {
      q = query(q, where('schoolId', '==', schoolId));
    }

    const snapshot = await getDocs(q);
    const teachers = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));

    const stats = {
      totalTeachers: teachers.length,
      activeTeachers: teachers.filter(t => t.isActive).length,
      inactiveTeachers: teachers.filter(t => !t.isActive).length,
      teachersBySubject: {} as Record<string, number>,
      experiencedTeachers: teachers.filter(t => {
        // Consider teachers with 5+ years experience as experienced
        const experience = t.experience || '0 বছর';
        const years = parseInt(experience.split(' ')[0]) || 0;
        return years >= 5;
      }).length
    };

    teachers.forEach(teacher => {
      // Count by subject
      if (teacher.subject) {
        stats.teachersBySubject[teacher.subject] = (stats.teachersBySubject[teacher.subject] || 0) + 1;
      }
    });

    return stats;
  }
};

// Student Management Functions
export const studentQueries = {
  // Get all students
  async getAllStudents(): Promise<User[]> {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'student'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
  },

  // Get students by school
  async getStudentsBySchool(schoolId: string): Promise<User[]> {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'student'),
      where('schoolId', '==', schoolId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
  },

  // Get students by class
  async getStudentsByClass(className: string): Promise<User[]> {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'student'),
      where('class', '==', className),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
  },

  // Get active students
  async getActiveStudents(): Promise<User[]> {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'student'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
  },

  // Get inactive students
  async getInactiveStudents(): Promise<User[]> {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'student'),
      where('isActive', '==', false),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
  },

  // Get student by ID
  async getStudentById(uid: string): Promise<User | null> {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { uid: docSnap.id, ...docSnap.data() } as User : null;
  },

  // Get student by student ID
  async getStudentByStudentId(studentId: string): Promise<User | null> {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'student'),
      where('studentId', '==', studentId),
      limit(1)
    );
    const snapshot = await getDocs(q);
    return snapshot.empty ? null : { uid: snapshot.docs[0].id, ...snapshot.docs[0].data() } as User;
  },

  // Create student
  async createStudent(studentData: Omit<User, 'createdAt' | 'updatedAt'> & { uid?: string }): Promise<string> {
    const studentDoc = {
      ...studentData,
      role: 'student' as const,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    if (studentData.uid) {
      await setDoc(doc(db, 'users', studentData.uid), studentDoc);
      return studentData.uid;
    } else {
      const docRef = await addDoc(collection(db, 'users'), studentDoc);
      return docRef.id;
    }
  },

  // Update student
  async updateStudent(uid: string, updates: Partial<User>): Promise<void> {
    try {
      const docRef = doc(db, 'users', uid);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      console.log('Updating student document:', uid, 'with data:', updateData);
      await updateDoc(docRef, updateData);
      console.log('Student updated successfully');
    } catch (error) {
      console.error('Error updating student:', error);
      throw new Error(`Failed to update student: ${error}`);
    }
  },

  // Activate/Deactivate student
  async setStudentActive(uid: string, isActive: boolean): Promise<void> {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, {
      isActive,
      updatedAt: serverTimestamp()
    });
  },

  // Delete student
  async deleteStudent(uid: string): Promise<void> {
    try {
      console.log('Attempting to delete student:', uid);
      await deleteDoc(doc(db, 'users', uid));
      console.log('Student deleted successfully:', uid);
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  },

  // Get student statistics
  async getStudentStats(schoolId?: string): Promise<{
    totalStudents: number;
    activeStudents: number;
    inactiveStudents: number;
    studentsByClass: Record<string, number>;
    studentsByGender: Record<string, number>;
  }> {
    let q = query(collection(db, 'users'), where('role', '==', 'student'));

    if (schoolId) {
      q = query(q, where('schoolId', '==', schoolId));
    }

    const snapshot = await getDocs(q);
    const students = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));

    const stats = {
      totalStudents: students.length,
      activeStudents: students.filter(s => s.isActive).length,
      inactiveStudents: students.filter(s => !s.isActive).length,
      studentsByClass: {} as Record<string, number>,
      studentsByGender: {} as Record<string, number>
    };

    students.forEach(student => {
      // Count by class
      if (student.class) {
        stats.studentsByClass[student.class] = (stats.studentsByClass[student.class] || 0) + 1;
      }

      // Count by gender (assuming gender is stored in displayName or other field)
      // This is a simplified approach - you might want to add a gender field
      const gender = student.displayName?.includes('Female') || student.displayName?.includes('মহিলা') ? 'female' : 'male';
      stats.studentsByGender[gender] = (stats.studentsByGender[gender] || 0) + 1;
    });

    return stats;
  },

  // Bulk import students with auto-generated emails
  async bulkImportStudents(studentsData: Array<Omit<User, 'createdAt' | 'updatedAt' | 'email'> & { email?: string }>): Promise<string[]> {
    const importedIds: string[] = [];

    for (const studentData of studentsData) {
      // Auto-generate email if not provided
      const email = studentData.email || emailUtils.generateRandomEmail(studentData.name || 'student', 'iqra');

      const studentDoc = {
        ...studentData,
        email,
        role: 'student' as const,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'users'), studentDoc);
      importedIds.push(docRef.id);
    }

    return importedIds;
  },

  // Create student with auto-generated email
  async createStudentWithAutoEmail(studentData: Omit<User, 'createdAt' | 'updatedAt' | 'email'> & { email?: string }): Promise<string> {
    // Auto-generate email if not provided
    const email = studentData.email || emailUtils.generateStudentEmail(
      studentData.name || 'student',
      studentData.studentId || '001',
      'iqra'
    );

    const studentDoc = {
      ...studentData,
      email,
      role: 'student' as const,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    if (studentData.uid) {
      await setDoc(doc(db, 'users', studentData.uid), studentDoc);
      return studentData.uid;
    } else {
      const docRef = await addDoc(collection(db, 'users'), studentDoc);
      return docRef.id;
    }
  }
};

// Parent Management Functions
export const parentQueries = {
  // Get all parents
  async getAllParents(): Promise<User[]> {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'parent'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
  },

  // Get parents by school
  async getParentsBySchool(schoolId: string): Promise<User[]> {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'parent'),
      where('schoolId', '==', schoolId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
  },

  // Get parents who have associated students
  async getParentsWithStudents(): Promise<User[]> {
    try {
      // Get all parents
      const allParents = await this.getAllParents();
      console.log('Total parents found:', allParents.length);

      // Get all students to find which parents have students
      const allStudents = await studentQueries.getAllStudents();
      console.log('Total students found:', allStudents.length);

      // Create a map of parent information from students
      const parentStudentMap = new Map<string, any[]>();

      allStudents.forEach(student => {
        console.log('Student guardian info:', {
          name: student.name || student.displayName,
          guardianName: student.guardianName,
          guardianPhone: student.guardianPhone,
          phoneNumber: student.phoneNumber,
          phone: student.phone
        });

        if (student.guardianName && student.guardianPhone) {
          const parentKey = `${student.guardianName}-${student.guardianPhone}`;
          if (!parentStudentMap.has(parentKey)) {
            parentStudentMap.set(parentKey, []);
          }
          parentStudentMap.get(parentKey)!.push({
            name: student.name || student.displayName,
            class: student.class,
            studentId: student.studentId,
            uid: student.uid
          });
        }
      });

      console.log('Parent-student mapping:', Array.from(parentStudentMap.entries()));

      // Filter parents to only include those who have students
      const parentsWithStudents = allParents.filter(parent => {
        const parentKey = `${parent.name}-${parent.phoneNumber || parent.phone}`;
        const hasMatch = parentStudentMap.has(parentKey);
        console.log('Checking parent:', parent.name, 'Key:', parentKey, 'Has match:', hasMatch);
        return hasMatch;
      });

      console.log('Parents with students:', parentsWithStudents.length);

      // Add student information to parent objects
      return parentsWithStudents.map(parent => {
        const parentKey = `${parent.name}-${parent.phoneNumber || parent.phone}`;
        const associatedStudents = parentStudentMap.get(parentKey) || [];

        return {
          ...parent,
          associatedStudents: associatedStudents
        };
      });
    } catch (error) {
      console.error('Error getting parents with students:', error);
      return [];
    }
  },

  // Get all parents (for debugging - shows all parents regardless of student association)
  async getAllParentsUnfiltered(): Promise<User[]> {
    try {
      const allParents = await this.getAllParents();
      console.log('All parents (unfiltered):', allParents.length);
      return allParents;
    } catch (error) {
      console.error('Error getting all parents:', error);
      return [];
    }
  },

  // Create sample parents with student associations
  async createSampleParentsWithStudents(): Promise<void> {
    try {
      // First get all students to create matching parents
      const students = await studentQueries.getAllStudents();
      console.log('Found students for parent creation:', students.length);

      if (students.length === 0) {
        console.log('No students found, cannot create sample parents');
        return;
      }

      // Create parents for the first few students
      const sampleParents = [
        {
          name: 'মোহাম্মদ রহিম উদ্দিন',
          email: 'rahim.uddin@gmail.com',
          phoneNumber: '০১৭১২৩৪৫৬৭৮',
          address: 'ধানমন্ডি, ঢাকা',
          role: 'parent' as const,
          schoolId: 'iqra-school-2025',
          schoolName: 'ইকরা ইসলামিক স্কুল',
          isActive: true,
          employmentType: 'ব্যবসায়ী'
        },
        {
          name: 'সালেহা বেগম',
          email: 'saleha.begum@gmail.com',
          phoneNumber: '০১৭১২৩৪৫৬৭৯',
          address: 'উত্তরা, ঢাকা',
          role: 'parent' as const,
          schoolId: 'iqra-school-2025',
          schoolName: 'ইকরা ইসলামিক স্কুল',
          isActive: true,
          employmentType: 'গৃহিণী'
        },
        {
          name: 'আবদুল করিম',
          email: 'abdul.karim@gmail.com',
          phoneNumber: '০১৭১২৩৪৫৬৮০',
          address: 'গুলশান, ঢাকা',
          role: 'parent' as const,
          schoolId: 'iqra-school-2025',
          schoolName: 'ইকরা ইসলামিক স্কুল',
          isActive: true,
          employmentType: 'ইঞ্জিনিয়ার'
        }
      ];

      // Create parents and update corresponding students with guardian info
      for (let i = 0; i < Math.min(3, students.length); i++) {
        const parentData = sampleParents[i];
        const student = students[i];

        // Create parent
        const parentId = await this.createParent(parentData);
        console.log(`Created parent ${parentData.name} with ID: ${parentId}`);

        // Update student with guardian information
        await studentQueries.updateStudent(student.uid, {
          guardianName: parentData.name,
          guardianPhone: parentData.phoneNumber
        });
        console.log(`Updated student ${student.name || student.displayName} with guardian info`);
      }

      console.log('Sample parents and student guardian info created successfully');
    } catch (error) {
      console.error('Error creating sample parents:', error);
    }
  },

  // Get parent by ID
  async getParentById(uid: string): Promise<User | null> {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { uid: docSnap.id, ...docSnap.data() } as User : null;
  },

  // Create parent
  async createParent(parentData: Omit<User, 'createdAt' | 'updatedAt' | 'uid'> & { uid?: string }): Promise<string> {
    const parentDoc = {
      ...parentData,
      role: 'parent' as const,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    if (parentData.uid) {
      await setDoc(doc(db, 'users', parentData.uid), parentDoc);
      return parentData.uid;
    } else {
      const docRef = await addDoc(collection(db, 'users'), parentDoc);
      return docRef.id;
    }
  },

  // Update parent
  async updateParent(uid: string, updates: Partial<User>): Promise<void> {
    try {
      const docRef = doc(db, 'users', uid);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      console.log('Updating parent document:', uid, 'with data:', updateData);
      await updateDoc(docRef, updateData);
      console.log('Parent updated successfully');
    } catch (error) {
      console.error('Error updating parent:', error);
      throw new Error(`Failed to update parent: ${error}`);
    }
  },

  // Delete parent
  async deleteParent(uid: string): Promise<void> {
    try {
      console.log('Attempting to delete parent:', uid);
      await deleteDoc(doc(db, 'users', uid));
      console.log('Parent deleted successfully:', uid);
    } catch (error) {
      console.error('Error deleting parent:', error);
      throw error;
    }
  },

  // Get parent statistics
  async getParentStats(schoolId?: string): Promise<{
    totalParents: number;
    parentsWithStudents: number;
    parentsWithoutStudents: number;
    studentsPerParent: Record<string, number>;
  }> {
    let q = query(collection(db, 'users'), where('role', '==', 'parent'));

    if (schoolId) {
      q = query(q, where('schoolId', '==', schoolId));
    }

    const snapshot = await getDocs(q);
    const parents = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));

    const parentsWithStudents = await this.getParentsWithStudents();
    const parentsWithoutStudents = parents.filter(parent =>
      !parentsWithStudents.some(pws => pws.uid === parent.uid)
    );

    const stats = {
      totalParents: parents.length,
      parentsWithStudents: parentsWithStudents.length,
      parentsWithoutStudents: parentsWithoutStudents.length,
      studentsPerParent: {} as Record<string, number>
    };

    // Count students per parent
    parentsWithStudents.forEach(parent => {
      const studentCount = parent.associatedStudents?.length || 0;
      stats.studentsPerParent[studentCount.toString()] =
        (stats.studentsPerParent[studentCount.toString()] || 0) + 1;
    });

    return stats;
  }
};

// Utility Functions
export const dbUtils = {
  // Check if collection exists and has documents
  async collectionExists(collectionName: string): Promise<boolean> {
    try {
      const snapshot = await getDocs(query(collection(db, collectionName), limit(1)));
      return !snapshot.empty;
    } catch (error) {
      return false;
    }
  },

  // Get document count for a collection
  async getDocumentCount(collectionName: string): Promise<number> {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.size;
  },

  // Batch create users (for testing)
  async createBatchUsers(users: (Omit<User, 'createdAt' | 'updatedAt'> & { uid?: string })[]): Promise<string[]> {
    const userIds: string[] = [];

    for (const userData of users) {
      const userId = await userQueries.createUser(userData);
      userIds.push(userId);
    }

    return userIds;
  }
};

// Inventory Management Interfaces
export interface InventoryItem {
  id?: string;
  name: string;
  nameEn?: string;
  description?: string;
  category: string;
  subcategory?: string;
  quantity: number;
  minQuantity: number; // Minimum stock level for alerts
  maxQuantity?: number; // Maximum stock level
  unit: string; // পিস, বক্স, ডজন, সেট, প্যাকেট, etc.
  unitPrice: number; // Purchase price per unit
  sellingPrice?: number; // Selling price per unit
  // Removed totalValue field as requested
  location?: string; // Storage location
  supplier?: string;
  supplierContact?: string;
  expiryDate?: string;
  batchNumber?: string;
  barcode?: string;
  status: 'active' | 'inactive' | 'discontinued';
  condition: 'new' | 'good' | 'fair' | 'poor' | 'damaged';
  tags?: string[];
  notes?: string;
  schoolId: string;
  createdBy: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  lastUpdatedBy?: string;

  // Stock movement tracking
  lastStockIn?: Timestamp;
  lastStockOut?: Timestamp;
  stockInCount?: number;
  stockOutCount?: number;

  // New fields for enhanced inventory management
  imageUrl?: string; // Product image URL
  isSet?: boolean; // Whether this is a set item
  setItems?: string[]; // Items included in the set
  brand?: string; // Product brand
  model?: string; // Product model
  assignedClass?: string; // Class assignment for the item
}

export interface InventoryCategory {
  id?: string;
  name: string;
  nameEn?: string;
  description?: string;
  parentCategory?: string;
  isActive: boolean;
  schoolId: string;
  createdBy: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface StockMovement {
  id?: string;
  itemId: string;
  itemName: string;
  type: 'stock_in' | 'stock_out' | 'adjustment' | 'return' | 'damage' | 'expiry';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  unitPrice?: number;
  totalValue?: number;
  reason?: string;
  reference?: string; // Purchase order, sales order, etc.
  location?: string;
  performedBy: string;
  approvedBy?: string;
  notes?: string;
  schoolId: string;
  createdAt?: Timestamp;
}

export interface InventoryAlert {
  id?: string;
  type: 'low_stock' | 'out_of_stock' | 'expiry' | 'damage' | 'overstock';
  itemId: string;
  itemName: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Timestamp;
  schoolId: string;
  createdAt?: Timestamp;
}

export interface SystemSettings {
  id?: string;
  schoolName: string;
  schoolCode: string;
  schoolAddress: string;
  schoolPhone: string;
  schoolEmail: string;
  principalName: string;
  schoolType: string;
  academicYear: string;
  systemLanguage: string;
  schoolDescription: string;

  // User Management
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  requireAdminApproval: boolean;
  allowPasswordReset: boolean;
  allowProfileEdit: boolean;
  allowDataExport: boolean;

  // Security
  minPasswordLength: number;
  maxPasswordAge: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventPasswordReuse: boolean;
  enable2FAForAdmins: boolean;
  enable2FAForAll: boolean;
  sessionTimeout: number;
  maxActiveSessions: number;

  // Database
  backupFrequency: string;
  backupRetention: number;
  lastBackup?: Timestamp;

  // Appearance
  theme: string;
  primaryColor: string;
  compactMode: boolean;
  sidebarCollapsed: boolean;
  darkMode: boolean;
  rtlSupport: boolean;

  // Notifications
  smtpServer: string;
  smtpPort: number;
  smtpEmail: string;
  smtpPassword: string;
  studentRegistrationEmail: boolean;
  studentRegistrationPush: boolean;
  paymentReminderEmail: boolean;
  paymentReminderPush: boolean;
  attendanceReportEmail: boolean;
  attendanceReportPush: boolean;
  systemAlertEmail: boolean;
  systemAlertPush: boolean;
  examScheduleEmail: boolean;
  examSchedulePush: boolean;

  // System
  debugMode: boolean;
  apiDocumentation: boolean;
  cacheExpiry: number;
  maxUploadSize: number;
  apiRateLimit: number;
  apiTimeout: number;

  // Security Headers
  enableCSP: boolean;
  enableXFrameOptions: boolean;
  enableXContentTypeOptions: boolean;
  enableHSTS: boolean;
  enableReferrerPolicy: boolean;

  // Custom Code
  customCSS: string;
  customJS: string;

  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  updatedBy: string;
}

// Financial/Accounting Interfaces
export interface FinancialTransaction {
  id?: string;
  type: 'income' | 'expense';
  category: string;
  subcategory?: string;
  amount: number;
  description: string;
  reference?: string; // Invoice number, receipt number, etc.
  paymentMethod?: 'cash' | 'bank_transfer' | 'check' | 'online' | 'other';
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  date: string; // YYYY-MM-DD format
  dueDate?: string;
  schoolId: string;
  recordedBy: string; // User ID who recorded the transaction
  approvedBy?: string; // User ID who approved (for large amounts)
  attachments?: string[]; // File URLs for receipts, invoices, etc.
  notes?: string;
  tags?: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;

  // Relations
  studentId?: string; // For student-related transactions
  teacherId?: string; // For teacher-related transactions
  parentId?: string; // For parent-related transactions
  classId?: string; // For class-related transactions

  // Tuition fee specific fields
  paidAmount?: number; // Actual amount paid by parent
  donation?: number; // Amount collected from donation
  tuitionFee?: number; // Standard monthly fee
  month?: string; // Month for tuition fees
  monthIndex?: number; // Month index (0-11)
  voucherNumber?: string; // Voucher number
  studentName?: string; // Student name for display
  className?: string; // Class name for display
  rollNumber?: string; // Student roll number
  paymentDate?: string; // When payment was made
  collectionDate?: string; // When fee was collected
  collectedBy?: string; // Who collected the fee

  // Inventory distribution tracking
  inventoryItems?: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalValue: number;
  }>; // Items distributed with this transaction
}

export interface FinancialCategory {
  id?: string;
  name: string;
  type: 'income' | 'expense';
  description?: string;
  isActive: boolean;
  schoolId: string;
  createdBy: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface FinancialReport {
  id?: string;
  title: string;
  type: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  transactionCount: number;
  schoolId: string;
  generatedBy: string;
  generatedAt?: Timestamp;
  data?: any; // Detailed breakdown data
}

export interface Budget {
  id?: string;
  categoryId: string;
  categoryName: string;
  budgetedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  year: number;
  month?: number; // For monthly budgets
  quarter?: number; // For quarterly budgets
  schoolId: string;
  createdBy: string;
  isActive: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Fee Management Interfaces
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
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
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
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Exam {
  id?: string;
  name: string;
  nameEn?: string;
  class: string;
  subject: string;
  date: string;
  startDate: string;
  endDate: string;
  time: string;
  duration: string;
  totalMarks: number;
  students: number;
  status: 'সক্রিয়' | 'সম্পন্ন' | 'পরিকল্পনা';
  schoolId: string;
  createdBy: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  
  // Result publication controls
  resultsPublished: boolean;
  resultsPublishedAt?: Timestamp;
  resultsPublishedBy?: string;
  allowResultView: boolean;
  
  // Additional exam details
  examType: 'মাসিক' | 'সাময়িক' | 'বার্ষিক' | 'নির্বাচনী' | 'অন্যান্য';
  passingMarks: number;
  instructions?: string;
  venue?: string;
  invigilators?: string[];
  
  // Grading system
  gradingSystem: 'percentage' | 'gpa' | 'letter';
  gradeDistribution?: {
    'A+': { min: number; max: number };
    'A': { min: number; max: number };
    'A-': { min: number; max: number };
    'B': { min: number; max: number };
    'C': { min: number; max: number };
    'D': { min: number; max: number };
    'F': { min: number; max: number };
  };
}

export interface ExamResult {
  id?: string;
  examId: string;
  examName: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  classId: string;
  className: string;
  subject: string;
  obtainedMarks: number;
  totalMarks: number;
  percentage: number;
  grade?: string;
  gpa?: number;
  position?: number;
  remarks?: string;
  isAbsent: boolean;
  schoolId: string;
  enteredBy: string;
  enteredAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface ExamSubject {
  id?: string;
  examId: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  totalMarks: number;
  passingMarks: number;
  examDate: string;
  examTime: string;
  duration: string;
  venue?: string;
  invigilator?: string;
  instructions?: string;
  schoolId: string;
  createdBy: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface ExamSchedule {
  id?: string;
  examId: string;
  examName: string;
  className: string;
  subjects: Array<{
    subjectId: string;
    subjectName: string;
    date: string;
    time: string;
    duration: string;
    venue: string;
    totalMarks: number;
  }>;
  schoolId: string;
  createdBy: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Subject {
  id?: string;
  name: string;
  nameEn?: string;
  code: string;
  teacherId?: string;
  teacherName: string;
  classes: string[];
  students: number;
  credits: number;
  type: 'মূল' | 'ধর্মীয়' | 'ঐচ্ছিক';
  description: string;
  schoolId: string;
  createdBy: string;
  isActive: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
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

      const students = await studentQueries.getActiveStudents();
      const applicableStudents = students.filter(student =>
        fee.applicableClasses.includes(student.class || '')
      );

      let collectionCount = 0;

      for (const student of applicableStudents) {
        const existingCollection = await this.getStudentFeeCollection(student.uid, feeId);

        if (!existingCollection) {
          const classInfo = await classQueries.getClassesBySchool(fee.schoolId)
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

// Inventory Management Functions
export const inventoryQueries = {
  // Inventory Items Management
  async getAllInventoryItems(schoolId?: string): Promise<InventoryItem[]> {
    let q = query(collection(db, 'inventoryItems'), orderBy('createdAt', 'desc'));

    if (schoolId) {
      q = query(q, where('schoolId', '==', schoolId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
  },

  async getActiveInventoryItems(schoolId?: string): Promise<InventoryItem[]> {
    let q = query(
      collection(db, 'inventoryItems'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );

    if (schoolId) {
      q = query(q, where('schoolId', '==', schoolId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
  },

  async getInventoryItemsByCategory(category: string, schoolId?: string): Promise<InventoryItem[]> {
    let q = query(
      collection(db, 'inventoryItems'),
      where('category', '==', category),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );

    if (schoolId) {
      q = query(q, where('schoolId', '==', schoolId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
  },

  async getLowStockItems(schoolId?: string): Promise<InventoryItem[]> {
    let q = query(
      collection(db, 'inventoryItems'),
      where('status', '==', 'active'),
      orderBy('quantity', 'asc')
    );

    if (schoolId) {
      q = query(q, where('schoolId', '==', schoolId));
    }

    const snapshot = await getDocs(q);
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));

    // Filter items where quantity <= minQuantity
    return items.filter(item => item.quantity <= item.minQuantity);
  },

  async getOutOfStockItems(schoolId?: string): Promise<InventoryItem[]> {
    let q = query(
      collection(db, 'inventoryItems'),
      where('status', '==', 'active'),
      where('quantity', '==', 0),
      orderBy('createdAt', 'desc')
    );

    if (schoolId) {
      q = query(q, where('schoolId', '==', schoolId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
  },

  async getInventoryItemById(id: string): Promise<InventoryItem | null> {
    const docRef = doc(db, 'inventoryItems', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as InventoryItem : null;
  },

  async createInventoryItem(itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const itemDoc = {
      ...itemData,
      stockInCount: 0,
      stockOutCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'inventoryItems'), itemDoc);
    return docRef.id;
  },

  async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<void> {
    const docRef = doc(db, 'inventoryItems', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async deleteInventoryItem(id: string): Promise<void> {
    await deleteDoc(doc(db, 'inventoryItems', id));
  },

  // Stock Movement Management
  async addStockMovement(movementData: Omit<StockMovement, 'id' | 'createdAt'>): Promise<string> {
    const movementDoc = {
      ...movementData,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'stockMovements'), movementDoc);

    // Update inventory item quantity
    await this.updateInventoryQuantity(movementData.itemId, movementData.type, movementData.quantity);

    return docRef.id;
  },

  async updateInventoryQuantity(itemId: string, movementType: StockMovement['type'], quantity: number): Promise<void> {
    const item = await this.getInventoryItemById(itemId);
    if (!item) return;

    let newQuantity = item.quantity;

    switch (movementType) {
      case 'stock_in':
        newQuantity += quantity;
        break;
      case 'stock_out':
        newQuantity -= quantity;
        break;
      case 'adjustment':
        newQuantity = quantity; // Direct adjustment to specific quantity
        break;
      case 'return':
        newQuantity += quantity;
        break;
      case 'damage':
      case 'expiry':
        newQuantity -= quantity;
        break;
    }

    // Update item with new quantity
    await this.updateInventoryItem(itemId, {
      quantity: Math.max(0, newQuantity), // Ensure quantity doesn't go negative
      lastStockIn: movementType === 'stock_in' || movementType === 'return' ? serverTimestamp() as Timestamp : item.lastStockIn,
      lastStockOut: movementType === 'stock_out' || movementType === 'damage' || movementType === 'expiry' ? serverTimestamp() as Timestamp : item.lastStockOut,
      lastUpdatedBy: 'current-user' // Should be actual user ID
    });

    // Update stock movement counts
    if (movementType === 'stock_in' || movementType === 'return') {
      await this.updateInventoryItem(itemId, {
        stockInCount: (item.stockInCount || 0) + 1
      });
    } else if (movementType === 'stock_out' || movementType === 'damage' || movementType === 'expiry') {
      await this.updateInventoryItem(itemId, {
        stockOutCount: (item.stockOutCount || 0) + 1
      });
    }
  },

  async getStockMovements(itemId?: string, schoolId?: string): Promise<StockMovement[]> {
    let q = query(collection(db, 'stockMovements'), orderBy('createdAt', 'desc'));

    if (itemId) {
      q = query(q, where('itemId', '==', itemId));
    }

    if (schoolId) {
      q = query(q, where('schoolId', '==', schoolId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StockMovement));
  },

  // Inventory Categories Management
  async getAllInventoryCategories(schoolId?: string): Promise<InventoryCategory[]> {
    let q = query(collection(db, 'inventoryCategories'), orderBy('name'));

    if (schoolId) {
      q = query(q, where('schoolId', '==', schoolId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryCategory));
  },

  async getActiveInventoryCategories(schoolId?: string): Promise<InventoryCategory[]> {
    let q = query(
      collection(db, 'inventoryCategories'),
      where('isActive', '==', true),
      orderBy('name')
    );

    if (schoolId) {
      q = query(q, where('schoolId', '==', schoolId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryCategory));
  },

  async createInventoryCategory(categoryData: Omit<InventoryCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const categoryDoc = {
      ...categoryData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'inventoryCategories'), categoryDoc);
    return docRef.id;
  },

  async updateInventoryCategory(id: string, updates: Partial<InventoryCategory>): Promise<void> {
    const docRef = doc(db, 'inventoryCategories', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async deleteInventoryCategory(id: string): Promise<void> {
    await deleteDoc(doc(db, 'inventoryCategories', id));
  },

  // Inventory Alerts Management
  async getAllInventoryAlerts(schoolId?: string): Promise<InventoryAlert[]> {
    let q = query(collection(db, 'inventoryAlerts'), orderBy('createdAt', 'desc'));

    if (schoolId) {
      q = query(q, where('schoolId', '==', schoolId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryAlert));
  },

  async getUnreadInventoryAlerts(schoolId?: string): Promise<InventoryAlert[]> {
    let q = query(
      collection(db, 'inventoryAlerts'),
      where('isRead', '==', false),
      orderBy('createdAt', 'desc')
    );

    if (schoolId) {
      q = query(q, where('schoolId', '==', schoolId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryAlert));
  },

  async createInventoryAlert(alertData: Omit<InventoryAlert, 'id' | 'createdAt'>): Promise<string> {
    const alertDoc = {
      ...alertData,
      isRead: false,
      isResolved: false,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'inventoryAlerts'), alertDoc);
    return docRef.id;
  },

  async markAlertAsRead(alertId: string): Promise<void> {
    const docRef = doc(db, 'inventoryAlerts', alertId);
    await updateDoc(docRef, {
      isRead: true
    });
  },

  async resolveAlert(alertId: string, resolvedBy: string): Promise<void> {
    const docRef = doc(db, 'inventoryAlerts', alertId);
    await updateDoc(docRef, {
      isResolved: true,
      resolvedBy,
      resolvedAt: serverTimestamp()
    });
  },

  // Inventory Statistics
  async getInventoryStats(schoolId?: string): Promise<{
    totalItems: number;
    totalValue: number;
    activeItems: number;
    inactiveItems: number;
    lowStockItems: number;
    outOfStockItems: number;
    categoriesCount: number;
    recentMovements: number;
    alertsCount: number;
    topCategories: Array<{ category: string; count: number; value: number }>;
  }> {
    const [items, categories, movements, alerts] = await Promise.all([
      this.getAllInventoryItems(schoolId),
      this.getActiveInventoryCategories(schoolId),
      this.getStockMovements(undefined, schoolId),
      this.getAllInventoryAlerts(schoolId)
    ]);

    const lowStockItems = items.filter(item => item.quantity <= item.minQuantity && item.quantity > 0);
    const outOfStockItems = items.filter(item => item.quantity === 0);

    // Calculate category statistics
    const categoryStats: Record<string, { count: number; value: number }> = {};
    items.forEach(item => {
      if (!categoryStats[item.category]) {
        categoryStats[item.category] = { count: 0, value: 0 };
      }
      categoryStats[item.category].count += 1;
      categoryStats[item.category].value += (item.quantity * item.unitPrice) || 0;
    });

    const topCategories = Object.entries(categoryStats)
      .map(([category, stats]) => ({ category, ...stats }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return {
      totalItems: items.length,
      totalValue: items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
      activeItems: items.filter(item => item.status === 'active').length,
      inactiveItems: items.filter(item => item.status === 'inactive').length,
      lowStockItems: lowStockItems.length,
      outOfStockItems: outOfStockItems.length,
      categoriesCount: categories.length,
      recentMovements: movements.length,
      alertsCount: alerts.filter(alert => !alert.isResolved).length,
      topCategories
    };
  },

  // Auto-generate alerts for low stock and expiry
  async generateInventoryAlerts(schoolId: string): Promise<number> {
    try {
      const items = await this.getActiveInventoryItems(schoolId);
      let alertCount = 0;

      for (const item of items) {
        // Check for low stock
        if (item.quantity <= item.minQuantity && item.quantity > 0) {
          const existingAlert = await this.getExistingAlert(item.id!, 'low_stock');
          if (!existingAlert) {
            await this.createInventoryAlert({
              type: 'low_stock',
              itemId: item.id!,
              itemName: item.name,
              message: `${item.name} এর স্টক কম (${item.quantity} ${item.unit})। ন্যূনতম প্রয়োজন ${item.minQuantity} ${item.unit}।`,
              severity: item.quantity === 0 ? 'critical' : 'medium',
              isRead: false,
              isResolved: false,
              schoolId
            });
            alertCount++;
          }
        }

        // Check for out of stock
        if (item.quantity === 0) {
          const existingAlert = await this.getExistingAlert(item.id!, 'out_of_stock');
          if (!existingAlert) {
            await this.createInventoryAlert({
              type: 'out_of_stock',
              itemId: item.id!,
              itemName: item.name,
              message: `${item.name} স্টক শেষ হয়ে গেছে।`,
              severity: 'critical',
              isRead: false,
              isResolved: false,
              schoolId
            });
            alertCount++;
          }
        }

        // Check for expiry (if expiry date is set and within 30 days)
        if (item.expiryDate) {
          const expiryDate = new Date(item.expiryDate);
          const today = new Date();
          const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0) {
            const existingAlert = await this.getExistingAlert(item.id!, 'expiry');
            if (!existingAlert) {
              await this.createInventoryAlert({
                type: 'expiry',
                itemId: item.id!,
                itemName: item.name,
                message: `${item.name} ${daysUntilExpiry} দিনের মধ্যে মেয়াদ শেষ হবে।`,
                severity: daysUntilExpiry <= 7 ? 'critical' : 'high',
                isRead: false,
                isResolved: false,
                schoolId
              });
              alertCount++;
            }
          }
        }
      }

      return alertCount;
    } catch (error) {
      console.error('Error generating inventory alerts:', error);
      return 0;
    }
  },

  async getExistingAlert(itemId: string, type: InventoryAlert['type']): Promise<InventoryAlert | null> {
    const q = query(
      collection(db, 'inventoryAlerts'),
      where('itemId', '==', itemId),
      where('type', '==', type),
      where('isResolved', '==', false),
      limit(1)
    );

    const snapshot = await getDocs(q);
    return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as InventoryAlert;
  },

  // Real-time listeners
  subscribeToInventoryItems(
    schoolId: string,
    callback: (items: InventoryItem[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, 'inventoryItems'),
      where('schoolId', '==', schoolId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc =>
        ({ id: doc.id, ...doc.data() } as InventoryItem)
      );
      callback(items);
    }, (error) => {
      console.error('Error listening to inventory items:', error);
    });
  },

  subscribeToInventoryAlerts(
    schoolId: string,
    callback: (alerts: InventoryAlert[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, 'inventoryAlerts'),
      where('schoolId', '==', schoolId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const alerts = snapshot.docs.map(doc =>
        ({ id: doc.id, ...doc.data() } as InventoryAlert)
      );
      callback(alerts);
    }, (error) => {
      console.error('Error listening to inventory alerts:', error);
    });
  },

  subscribeToStockMovements(
    schoolId: string,
    callback: (movements: StockMovement[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, 'stockMovements'),
      where('schoolId', '==', schoolId),
      orderBy('createdAt', 'desc'),
      limit(50) // Limit to recent 50 movements
    );

    return onSnapshot(q, (snapshot) => {
      const movements = snapshot.docs.map(doc =>
        ({ id: doc.id, ...doc.data() } as StockMovement)
      );
      callback(movements);
    }, (error) => {
      console.error('Error listening to stock movements:', error);
    });
  },

  // Sample data creation for testing
  async createSampleInventoryData(schoolId: string): Promise<void> {
    try {
      // Create sample categories
      const categories = [
        { name: 'স্টেশনারি', nameEn: 'Stationery', description: 'Office and school supplies' },
        { name: 'পাঠ্যবই', nameEn: 'Textbooks', description: 'Educational books and materials' },
        { name: 'সেট', nameEn: 'Sets', description: 'School supply sets and packages' },
        { name: 'ইলেকট্রনিক্স', nameEn: 'Electronics', description: 'Electronic devices and accessories' },
        { name: 'সরঞ্জাম', nameEn: 'Equipment', description: 'School equipment and tools' },
        { name: 'খেলনা', nameEn: 'Sports', description: 'Sports and recreational items' }
      ];

      for (const categoryData of categories) {
        await this.createInventoryCategory({
          ...categoryData,
          isActive: true,
          schoolId,
          createdBy: 'system'
        });
      }

      // Create sample inventory items - Updated with user's requested items
      const sampleItems = [
        // বই (Books)
        {
          name: 'বই - গণিত (ক্লাস ৯)',
          nameEn: 'Mathematics Book (Class 9)',
          description: 'Mathematics textbook for class 9 students',
          category: 'পাঠ্যবই',
          quantity: 50,
          minQuantity: 20,
          unit: 'পিস',
          unitPrice: 120,
          location: 'লাইব্রেরি',
          supplier: 'Book Publishers Ltd',
          status: 'active' as const,
          condition: 'new' as const,
          schoolId,
          createdBy: 'admin'
        },
        {
          name: 'বই - বাংলা (ক্লাস ৮)',
          nameEn: 'Bangla Book (Class 8)',
          description: 'Bangla language textbook for class 8 students',
          category: 'পাঠ্যবই',
          quantity: 45,
          minQuantity: 15,
          unit: 'পিস',
          unitPrice: 100,
          location: 'লাইব্রেরি',
          supplier: 'Book Publishers Ltd',
          status: 'active' as const,
          condition: 'new' as const,
          schoolId,
          createdBy: 'admin'
        },

        // স্টেশনারি আইটেমসমূহ
        {
          name: 'খাতা - এক লাইন (১০০ পাতা)',
          nameEn: 'Single Line Notebook (100 pages)',
          description: 'Single line notebook for students',
          category: 'স্টেশনারি',
          quantity: 200,
          minQuantity: 50,
          unit: 'পিস',
          unitPrice: 25,
          location: 'স্টোর রুম',
          supplier: 'Stationery Suppliers',
          status: 'active' as const,
          condition: 'new' as const,
          schoolId,
          createdBy: 'admin'
        },
        {
          name: 'খাতা - দুই লাইন (১০০ পাতা)',
          nameEn: 'Double Line Notebook (100 pages)',
          description: 'Double line notebook for students',
          category: 'স্টেশনারি',
          quantity: 180,
          minQuantity: 40,
          unit: 'পিস',
          unitPrice: 25,
          location: 'স্টোর রুম',
          supplier: 'Stationery Suppliers',
          status: 'active' as const,
          condition: 'new' as const,
          schoolId,
          createdBy: 'admin'
        },
        {
          name: 'পেন্সিল (HB)',
          nameEn: 'Pencil (HB)',
          description: 'HB grade pencil for writing',
          category: 'স্টেশনারি',
          quantity: 500,
          minQuantity: 100,
          unit: 'পিস',
          unitPrice: 5,
          location: 'স্টোর রুম',
          supplier: 'Stationery Suppliers',
          status: 'active' as const,
          condition: 'new' as const,
          schoolId,
          createdBy: 'admin'
        },
        {
          name: 'চক (সাদা)',
          nameEn: 'White Chalk',
          description: 'White chalk for blackboards',
          category: 'স্টেশনারি',
          quantity: 20,
          minQuantity: 10,
          unit: 'বক্স',
          unitPrice: 30,
          location: 'ক্লাসরুম',
          supplier: 'Stationery Suppliers',
          status: 'active' as const,
          condition: 'new' as const,
          schoolId,
          createdBy: 'admin'
        },
        {
          name: 'চক (রঙিন)',
          nameEn: 'Colored Chalk',
          description: 'Colored chalk for blackboards',
          category: 'স্টেশনারি',
          quantity: 5,
          minQuantity: 5,
          unit: 'বক্স',
          unitPrice: 50,
          location: 'ক্লাসরুম',
          supplier: 'Stationery Suppliers',
          status: 'active' as const,
          condition: 'new' as const,
          schoolId,
          createdBy: 'admin'
        },
        {
          name: 'ইরেজার/রাবার',
          nameEn: 'Eraser/Rubber',
          description: 'Eraser for pencil writing',
          category: 'স্টেশনারি',
          quantity: 300,
          minQuantity: 50,
          unit: 'পিস',
          unitPrice: 3,
          location: 'স্টোর রুম',
          supplier: 'Stationery Suppliers',
          status: 'active' as const,
          condition: 'new' as const,
          schoolId,
          createdBy: 'admin'
        },
        {
          name: 'কাটার/সিজার্স',
          nameEn: 'Cutter/Scissors',
          description: 'Scissors for paper cutting',
          category: 'স্টেশনারি',
          quantity: 25,
          minQuantity: 10,
          unit: 'পিস',
          unitPrice: 15,
          location: 'স্টোর রুম',
          supplier: 'Stationery Suppliers',
          status: 'active' as const,
          condition: 'new' as const,
          schoolId,
          createdBy: 'admin'
        },
        {
          name: 'স্লেট (ছোট)',
          nameEn: 'Small Slate',
          description: 'Small slate for early learners',
          category: 'স্টেশনারি',
          quantity: 100,
          minQuantity: 20,
          unit: 'পিস',
          unitPrice: 20,
          location: 'প্রাথমিক শ্রেণি',
          supplier: 'Educational Supplies',
          status: 'active' as const,
          condition: 'new' as const,
          schoolId,
          createdBy: 'admin'
        },
        {
          name: 'স্লেট (বড়)',
          nameEn: 'Large Slate',
          description: 'Large slate for classroom use',
          category: 'স্টেশনারি',
          quantity: 30,
          minQuantity: 10,
          unit: 'পিস',
          unitPrice: 35,
          location: 'প্রাথমিক শ্রেণি',
          supplier: 'Educational Supplies',
          status: 'active' as const,
          condition: 'new' as const,
          schoolId,
          createdBy: 'admin'
        },
        {
          name: 'ব্রাশ/ডাস্টার',
          nameEn: 'Brush/Duster',
          description: 'Blackboard brush/duster for cleaning',
          category: 'স্টেশনারি',
          quantity: 15,
          minQuantity: 5,
          unit: 'পিস',
          unitPrice: 40,
          location: 'ক্লাসরুম',
          supplier: 'Educational Supplies',
          status: 'active' as const,
          condition: 'good' as const,
          schoolId,
          createdBy: 'admin'
        },

        // সেট আইটেমসমূহ
        {
          name: 'স্কুল ব্যাগ সেট (ছোট)',
          nameEn: 'School Bag Set (Small)',
          description: 'Complete school bag set with books, notebooks, and stationery',
          category: 'সেট',
          quantity: 25,
          minQuantity: 10,
          unit: 'সেট',
          unitPrice: 500,
          location: 'স্টোর রুম',
          supplier: 'Educational Supplies',
          status: 'active' as const,
          condition: 'new' as const,
          isSet: true,
          setItems: ['স্কুল ব্যাগ', 'খাতা (৫ পিস)', 'পেন্সিল (২ পিস)', 'ইরেজার (১ পিস)'],
          schoolId,
          createdBy: 'admin'
        },
        {
          name: 'স্কুল ব্যাগ সেট (বড়)',
          nameEn: 'School Bag Set (Large)',
          description: 'Large school bag set with complete stationery kit',
          category: 'সেট',
          quantity: 15,
          minQuantity: 5,
          unit: 'সেট',
          unitPrice: 750,
          location: 'স্টোর রুম',
          supplier: 'Educational Supplies',
          status: 'active' as const,
          condition: 'new' as const,
          isSet: true,
          setItems: ['স্কুল ব্যাগ', 'খাতা (১০ পিস)', 'পেন্সিল (৫ পিস)', 'ইরেজার (২ পিস)', 'কাটার (১ পিস)'],
          schoolId,
          createdBy: 'admin'
        },
        {
          name: 'ক্লাসরুম স্টেশনারি সেট',
          nameEn: 'Classroom Stationery Set',
          description: 'Complete stationery set for classroom use',
          category: 'সেট',
          quantity: 8,
          minQuantity: 3,
          unit: 'সেট',
          unitPrice: 200,
          location: 'ক্লাসরুম',
          supplier: 'Educational Supplies',
          status: 'active' as const,
          condition: 'new' as const,
          isSet: true,
          setItems: ['চক (২ বক্স)', 'ব্রাশ/ডাস্টার (২ পিস)', 'মার্কার (৫ পিস)'],
          schoolId,
          createdBy: 'admin'
        },

        // ইলেকট্রনিক্স আইটেমসমূহ
        {
          name: 'ল্যাপটপ Dell Inspiron',
          nameEn: 'Dell Inspiron Laptop',
          description: 'Dell Inspiron 15 laptop for teachers',
          category: 'ইলেকট্রনিক্স',
          quantity: 15,
          minQuantity: 5,
          unit: 'পিস',
          unitPrice: 45000,
          location: 'কম্পিউটার ল্যাব',
          supplier: 'Dell Bangladesh',
          status: 'active' as const,
          condition: 'new' as const,
          schoolId,
          createdBy: 'admin'
        },
        {
          name: 'প্রজেক্টর BenQ',
          nameEn: 'BenQ Projector',
          description: 'BenQ multimedia projector for presentations',
          category: 'ইলেকট্রনিক্স',
          quantity: 0,
          minQuantity: 2,
          unit: 'পিস',
          unitPrice: 35000,
          location: 'অডিটোরিয়াম',
          supplier: 'Tech Solutions',
          status: 'active' as const,
          condition: 'good' as const,
          schoolId,
          createdBy: 'admin'
        },

        // খেলনা/স্পোর্টস আইটেমসমূহ
        {
          name: 'ফুটবল',
          nameEn: 'Football',
          description: 'Standard size football for sports activities',
          category: 'খেলনা',
          quantity: 8,
          minQuantity: 5,
          unit: 'পিস',
          unitPrice: 800,
          location: 'স্পোর্টস রুম',
          supplier: 'Sports Equipment Co',
          status: 'active' as const,
          condition: 'good' as const,
          schoolId,
          createdBy: 'admin'
        },
        {
          name: 'ক্রিকেট বল',
          nameEn: 'Cricket Ball',
          description: 'Cricket ball for sports activities',
          category: 'খেলনা',
          quantity: 12,
          minQuantity: 6,
          unit: 'পিস',
          unitPrice: 150,
          location: 'স্পোর্টস রুম',
          supplier: 'Sports Equipment Co',
          status: 'active' as const,
          condition: 'good' as const,
          schoolId,
          createdBy: 'admin'
        }
      ];

      for (const itemData of sampleItems) {
        await this.createInventoryItem(itemData);
      }

      console.log('✅ Sample inventory data created successfully');
    } catch (error) {
      console.error('❌ Error creating sample inventory data:', error);
    }
  }
};

export const settingsQueries = {
  // Get system settings
  async getSettings(): Promise<SystemSettings | null> {
    try {
      const docRef = doc(db, 'system', 'settings');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as SystemSettings;
      }

      // Return default settings if none exist
      return this.getDefaultSettings();
    } catch (error) {
      console.error('Error getting settings:', error);
      return this.getDefaultSettings();
    }
  },

  // Get default settings
  getDefaultSettings(): SystemSettings {
    return {
      schoolName: 'ইকরা ইসলামিক স্কুল',
      schoolCode: 'IQRA-2025',
      schoolAddress: 'ঢাকা, বাংলাদেশ',
      schoolPhone: '+8801712345678',
      schoolEmail: 'info@iqraschool.edu.bd',
      principalName: 'ড. মোহাম্মদ আলী',
      schoolType: 'মাদ্রাসা',
      academicYear: '2025',
      systemLanguage: 'bn',
      schoolDescription: 'একটি আধুনিক ইসলামিক শিক্ষা প্রতিষ্ঠান যা ধর্মীয় এবং আধুনিক শিক্ষার সমন্বয়ে শিক্ষার্থীদের বিকাশে কাজ করে।',

      // User Management
      allowRegistration: true,
      requireEmailVerification: true,
      requireAdminApproval: false,
      allowPasswordReset: true,
      allowProfileEdit: true,
      allowDataExport: false,

      // Security
      minPasswordLength: 8,
      maxPasswordAge: 90,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
      preventPasswordReuse: true,
      enable2FAForAdmins: true,
      enable2FAForAll: false,
      sessionTimeout: 30,
      maxActiveSessions: 5,

      // Database
      backupFrequency: 'daily',
      backupRetention: 30,

      // Appearance
      theme: 'light',
      primaryColor: 'blue',
      compactMode: false,
      sidebarCollapsed: false,
      darkMode: false,
      rtlSupport: false,

      // Notifications
      smtpServer: 'smtp.gmail.com',
      smtpPort: 587,
      smtpEmail: 'noreply@iqraschool.edu.bd',
      smtpPassword: '',
      studentRegistrationEmail: true,
      studentRegistrationPush: false,
      paymentReminderEmail: true,
      paymentReminderPush: true,
      attendanceReportEmail: false,
      attendanceReportPush: true,
      systemAlertEmail: true,
      systemAlertPush: true,
      examScheduleEmail: true,
      examSchedulePush: false,

      // System
      debugMode: false,
      apiDocumentation: true,
      cacheExpiry: 24,
      maxUploadSize: 10,
      apiRateLimit: 100,
      apiTimeout: 30,

      // Security Headers
      enableCSP: true,
      enableXFrameOptions: true,
      enableXContentTypeOptions: true,
      enableHSTS: false,
      enableReferrerPolicy: true,

      // Custom Code
      customCSS: '',
      customJS: '',

      updatedBy: 'system'
    };
  },

  // Save system settings
  async saveSettings(settings: Partial<SystemSettings>, updatedBy: string): Promise<void> {
    try {
      const docRef = doc(db, 'system', 'settings');
      const settingsData = {
        ...settings,
        updatedAt: serverTimestamp(),
        updatedBy
      };

      await setDoc(docRef, settingsData, { merge: true });
    } catch (error) {
      console.error('Error saving settings:', error);
      throw new Error('সেটিংস সংরক্ষণ করতে ত্রুটি হয়েছে');
    }
  },

  // Backup database
  async createBackup(): Promise<string> {
    try {
      // In a real implementation, this would trigger a cloud function
      // For now, we'll just update the last backup timestamp
      const settings = await this.getSettings();
      if (settings) {
        await this.saveSettings({
          lastBackup: serverTimestamp() as any
        }, 'system');
      }

      return 'Backup created successfully';
    } catch (error) {
      console.error('Error creating backup:', error);
      throw new Error('ব্যাকআপ তৈরি করতে ত্রুটি হয়েছে');
    }
  },

  // Clear system cache
  async clearCache(): Promise<void> {
    try {
      // In a real implementation, this would clear various caches
      // For now, we'll just log the action
      console.log('System cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw new Error('ক্যাশে পরিষ্কার করতে ত্রুটি হয়েছে');
    }
  },

  // Export system data
  async exportData(): Promise<string> {
    try {
      // In a real implementation, this would export all system data
      // For now, we'll return a mock export
      const data = {
        settings: await this.getSettings(),
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error('ডেটা এক্সপোর্ট করতে ত্রুটি হয়েছে');
    }
  },

  // Get system statistics
  async getSystemStats(): Promise<any> {
    try {
      // Get user counts by role
      const [superAdmins, admins, teachers, parents, students] = await Promise.all([
        userQueries.getUsersByRole('super_admin'),
        userQueries.getUsersByRole('admin'),
        userQueries.getUsersByRole('teacher'),
        userQueries.getUsersByRole('parent'),
        userQueries.getUsersByRole('student')
      ]);

      // Get class count
      const classes = await classQueries.getAllClasses();

      return {
        users: {
          superAdmin: superAdmins.length,
          admin: admins.length,
          teacher: teachers.length,
          parent: parents.length,
          student: students.length,
          total: superAdmins.length + admins.length + teachers.length + parents.length + students.length
        },
        classes: classes.length,
        activeUsers: Math.floor(Math.random() * 100) + 50, // Mock data
        systemHealth: 'good',
        lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        storageUsed: 156, // GB
        storageTotal: 500 // GB
      };
    } catch (error) {
      console.error('Error getting system stats:', error);
      return {
        users: { total: 0 },
        classes: 0,
        activeUsers: 0,
        systemHealth: 'unknown'
      };
    }
  }
};
