'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { User as AuthUser, onAuthStateChanged } from 'firebase/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { studentQueries, accountingQueries, feeQueries, examQueries } from '@/lib/database-queries';
import {
  Home,
  Users,
  BookOpen,
  ClipboardList,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  Plus,
  UserPlus,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Eye,
  MoreVertical,
  Phone,
  MapPin,
  DollarSign,
  AlertCircle
} from 'lucide-react';

function CollectExamFeePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Search and filter states
  const [studentNameSearch, setStudentNameSearch] = useState<string>('');
  const [rollNumberSearch, setRollNumberSearch] = useState<string>('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('সকল ক্লাস');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('সকল সেকশন');

  // Student data states
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<any[]>([]);

  // Form states
  const [selectedExamType, setSelectedExamType] = useState<'monthly' | 'quarterly' | 'halfYearly' | 'annual' | ''>('monthly');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fee structure states
  const [feeStructure, setFeeStructure] = useState<any>({});
  const [loadingFees, setLoadingFees] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Dialog states
  const [showFeeDialog, setShowFeeDialog] = useState(false);
  const [selectedStudentForFee, setSelectedStudentForFee] = useState<any>(null);
  const [dialogExamId, setDialogExamId] = useState<string>('');

  // Exam selection dialog states
  const [showExamSelectionDialog, setShowExamSelectionDialog] = useState(false);
  const [examFeesData, setExamFeesData] = useState<{[examId: string]: {[className: string]: number}}>({});
  const [existingExams, setExistingExams] = useState<any[]>([]);
  const [loadingExamFeesData, setLoadingExamFeesData] = useState(false);
  const [selectedExamTypeForDialog, setSelectedExamTypeForDialog] = useState<string>('');

  // Dialog form states
  const [totalFee, setTotalFee] = useState('0');
  const [paidAmount, setPaidAmount] = useState('0');
  const [collectionDate, setCollectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  // Exam types for dialog
  const examTypes = [
    { value: 'monthly', label: 'মাসিক পরীক্ষা', disabled: false },
    { value: 'quarterly', label: 'ত্রৈমাসিক পরীক্ষা', disabled: false },
    { value: 'halfYearly', label: 'অর্ধবার্ষিক পরীক্ষা', disabled: false },
    { value: 'annual', label: 'বার্ষিক পরীক্ষা', disabled: false }
  ];

  // Month options for monthly exams
  const monthOptions = [
    { value: '1', label: 'জানুয়ারি' },
    { value: '2', label: 'ফেব্রুয়ারি' },
    { value: '3', label: 'মার্চ' },
    { value: '4', label: 'এপ্রিল' },
    { value: '5', label: 'মে' },
    { value: '6', label: 'জুন' },
    { value: '7', label: 'জুলাই' },
    { value: '8', label: 'আগস্ট' },
    { value: '9', label: 'সেপ্টেম্বর' },
    { value: '10', label: 'অক্টোবর' },
    { value: '11', label: 'নভেম্বর' },
    { value: '12', label: 'ডিসেম্বর' }
  ];

  // Exam fee states
  const [examFees, setExamFees] = useState<{
    monthly: { [className: string]: number };
    quarterly: { [className: string]: number };
    halfYearly: { [className: string]: number };
    annual: { [className: string]: number };
  }>({
    monthly: {},
    quarterly: {},
    halfYearly: {},
    annual: {}
  });

  // Fee collection status
  const [feeCollections, setFeeCollections] = useState<any[]>([]);
  const [loadingFeeCollections, setLoadingFeeCollections] = useState(false);

  // Exam fees from exam fee management
  const [examFeesFromManagement, setExamFeesFromManagement] = useState<{
    monthly: { [className: string]: number };
    quarterly: { [className: string]: number };
    halfYearly: { [className: string]: number };
    annual: { [className: string]: number };
  }>({
    monthly: {},
    quarterly: {},
    halfYearly: {},
    annual: {}
  });

  const router = useRouter();

  // Class name mapping utility
  const getClassKey = (className: string): string => {
    const classMap: { [key: string]: string } = {
      'প্লে': 'Play',
      'নার্সারি': 'Nursery',
      'প্রথম': '1',
      'দ্বিতীয়': '2',
      'তৃতীয়': '3',
      'চতুর্থ': '4',
      'পঞ্চম': '5',
      'ষষ্ঠ': '6',
      'সপ্তম': '7',
      'অষ্টম': '8',
      'নবম': '9',
      'দশম': '10'
    };

    // If it's already an English number, return as is
    if (!isNaN(Number(className))) {
      return className;
    }

    // Otherwise, map from Bengali to English
    return classMap[className] || className;
  };

  // Available classes and sections - will be loaded from Firebase
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<string[]>(['সকল সেকশন']);
  const [loadingClasses, setLoadingClasses] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('🔐 User authenticated, loading data...');
        setUser(user);

        // Clear any sample data first, then load fresh data
        clearSampleExamFees();

        loadStudents();
        loadClasses();
        loadFeeStructure();
        loadExamFees();
        loadExamFeesFromManagement();
        loadExamFeesData();
        loadFeeCollections();
      } else {
        router.push('/auth/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);


  const loadStudents = async () => {
    try {
      const studentsData = await studentQueries.getAllStudents();
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  // Load fee structure from Firebase - Class-wise fee management
  const loadFeeStructure = async () => {
    setLoadingFees(true);
    try {
      // Try to load from localStorage first
      const savedFees = localStorage.getItem('iqra_class_wise_fees');
      if (savedFees) {
        const parsedFees = JSON.parse(savedFees);
        setFeeStructure(parsedFees);
      }

      // Load from Firebase - Class-wise fee management collection
      const { doc, getDoc, collection, getDocs } = await import('firebase/firestore');
      const schoolId = 'iqra-school-2025';

      // Try to load from classWiseFees collection first
      const classWiseFeesRef = doc(db, 'classWiseFees', schoolId);
      const classWiseFeesSnap = await getDoc(classWiseFeesRef);

      if (classWiseFeesSnap.exists()) {
        const feesData = classWiseFeesSnap.data();
        setFeeStructure(feesData);
        localStorage.setItem('iqra_class_wise_fees', JSON.stringify(feesData));
        console.log('✅ Class-wise fee structure loaded from Firebase:', feesData);
      } else {
        // Try alternative collection name
        const feeManagementRef = doc(db, 'feeManagement', schoolId);
        const feeManagementSnap = await getDoc(feeManagementRef);

        if (feeManagementSnap.exists()) {
          const feesData = feeManagementSnap.data();
          setFeeStructure(feesData);
          localStorage.setItem('iqra_class_wise_fees', JSON.stringify(feesData));
          console.log('✅ Fee management loaded from Firebase:', feesData);
        } else {
          // Try to load from allClasses collection for class-specific fees
          const allClassesRef = collection(db, 'allClasses');
          const allClassesSnap = await getDocs(allClassesRef);

          if (!allClassesSnap.empty) {
            const classFeesData: any = { examFees: {} };

            allClassesSnap.forEach((doc: any) => {
              const classData = doc.data();
              if (classData.className && classData.examFee) {
                classFeesData.examFees[classData.className] = classData.examFee;
              }
            });

            if (Object.keys(classFeesData.examFees).length > 0) {
              setFeeStructure(classFeesData);
              localStorage.setItem('iqra_class_wise_fees', JSON.stringify(classFeesData));
              console.log('✅ Class fees loaded from allClasses:', classFeesData);
            } else {
              useDefaultFees();
            }
          } else {
            useDefaultFees();
          }
        }
      }
    } catch (error) {
      console.error('❌ Error loading class-wise fee structure:', error);
      useDefaultFees();
    } finally {
      setLoadingFees(false);
    }
  };

  // Use default class-wise fees
  const useDefaultFees = () => {
    const defaultFees = {
      examFees: {
        'প্লে': 100,
        'নার্সারি': 150,
        'প্রথম': 200,
        'দ্বিতীয়': 250,
        'তৃতীয়': 300,
        'চতুর্থ': 350,
        'পঞ্চম': 400,
        'ষষ্ঠ': 450,
        'সপ্তম': 500,
        'অষ্টম': 550,
        'নবম': 600,
        'দশম': 700
      }
    };
    setFeeStructure(defaultFees);
    localStorage.setItem('iqra_class_wise_fees', JSON.stringify(defaultFees));
    console.log('📝 Using default class-wise fee structure:', defaultFees);
  };

  // Load exam fees from Firebase using queries (legacy - keeping for compatibility)
  const loadExamFees = async () => {
    try {
      const schoolId = 'iqra-school-2025';
      const examFeesData = await accountingQueries.getExamFees(schoolId);

      console.log('Loaded legacy exam fees from Firebase:', examFeesData);

      setExamFees(examFeesData);
      console.log('📊 Legacy exam fees loaded:', examFeesData);
    } catch (error) {
      console.error('Error loading legacy exam fees from Firebase:', error);
      // Keep default empty state
    }
  };

  // Load exam fees from exam fee management system
  const loadExamFeesFromManagement = async () => {
    try {
      const schoolId = 'iqra-school-2025';
      const examFeesData = await accountingQueries.getExamFees(schoolId);

      console.log('📋 Loaded exam fees from management system:', examFeesData);

      // Filter out empty entries (only keep fees > 0)
      const filteredFees = {
        monthly: {},
        quarterly: {},
        halfYearly: {},
        annual: {}
      };

      Object.entries(examFeesData).forEach(([examType, classFees]) => {
        const validFees = Object.fromEntries(
          Object.entries(classFees).filter(([_, fee]) => {
            const feeValue = typeof fee === 'string' ? parseFloat(fee) : fee;
            return feeValue && feeValue > 0;
          })
        );

        if (examType === 'monthly') filteredFees.monthly = validFees;
        else if (examType === 'quarterly') filteredFees.quarterly = validFees;
        else if (examType === 'halfYearly') filteredFees.halfYearly = validFees;
        else if (examType === 'annual') filteredFees.annual = validFees;
      });

      setExamFeesFromManagement(filteredFees);
      console.log('✅ Filtered exam fees from management:', filteredFees);
    } catch (error) {
      console.error('❌ Error loading exam fees from management:', error);
    }
  };

  // Clear sample data from exam fees (one-time cleanup)
  const clearSampleExamFees = async () => {
    try {
      console.log('🧹 Clearing sample exam fees data...');
      const schoolId = 'iqra-school-2025';

      // Get current exam fees
      const currentFees = await accountingQueries.getExamFees(schoolId);

      // Check if this looks like sample data (has all the default classes with specific values)
      const hasSampleData = Object.values(currentFees).some(examTypeFees => {
        const feeValues = Object.values(examTypeFees);
        // Sample data has many classes with specific fee amounts
        return feeValues.length > 5 && feeValues.some(fee => fee === 1800 || fee === 2400 || fee === 3000);
      });

      if (hasSampleData) {
        console.log('🔍 Found sample data, clearing it...');

        // Clear all exam fees by saving empty object
        await accountingQueries.saveExamFees(schoolId, {
          monthly: {},
          quarterly: {},
          halfYearly: {},
          annual: {}
        }, 'system-cleanup');

        console.log('✅ Sample exam fees data cleared');
      } else {
        console.log('ℹ️ No sample data found to clear');
      }
    } catch (error) {
      console.error('❌ Error clearing sample exam fees:', error);
    }
  };

  // Load fee collections from Firebase
  const loadFeeCollections = async () => {
    setLoadingFeeCollections(true);
    try {
      const schoolId = 'iqra-school-2025';
      const collections = await feeQueries.getAllFeeCollections(schoolId);
      setFeeCollections(collections);
      console.log('📋 Fee collections loaded:', collections.length);
    } catch (error) {
      console.error('Error loading fee collections:', error);
    } finally {
      setLoadingFeeCollections(false);
    }
  };

  const loadExamFeesData = async () => {
    setLoadingExamFeesData(true);
    try {
      const schoolId = 'iqra-school-2025';

      // Load exam-specific fees from Firebase
      const examSpecificFeesRef = doc(db, 'examSpecificFees', schoolId);
      const examSpecificFeesSnap = await getDoc(examSpecificFeesRef);

      if (examSpecificFeesSnap.exists()) {
        const examSpecificFeesData = examSpecificFeesSnap.data();
        console.log('Loaded exam-specific fees from Firebase:', examSpecificFeesData);

        if (examSpecificFeesData.fees) {
          setExamFeesData(examSpecificFeesData.fees);
        }
      } else {
        console.log('No exam-specific fees found in Firebase');
        setExamFeesData({});
      }

      // Load existing exams from exam management
      const examsData = await examQueries.getAllExams(schoolId);
      setExistingExams(examsData);
      console.log('Loaded existing exams:', examsData);

    } catch (error) {
      console.error('Error loading exam fees data:', error);
      setExamFeesData({});
      setExistingExams([]);
    } finally {
      setLoadingExamFeesData(false);
    }
  };

  // Load classes from Firebase - Simplified version
  const loadClasses = async () => {
    setLoadingClasses(true);
    console.log('🔄 Loading classes...');

    try {
      // Try to load from localStorage first for immediate display
      const savedClasses = localStorage.getItem('iqra_classes');
      if (savedClasses) {
        const parsedClasses = JSON.parse(savedClasses);
        console.log('💾 Loaded from localStorage:', parsedClasses.length, 'classes');
        setClasses(parsedClasses);
      }

      // Load from Firebase with error handling
      try {
        const { classQueries } = await import('@/lib/queries/class-queries');

        // Try to get classes by school ID first
        const schoolClasses = await classQueries.getClassesBySchool('IQRA-202531');
        console.log('📋 Classes found by school ID:', schoolClasses.length);

        if (schoolClasses.length > 0) {
          setClasses(schoolClasses);
          localStorage.setItem('iqra_classes', JSON.stringify(schoolClasses));
          console.log('✅ Classes loaded from Firebase');
        } else {
          // Fallback to all classes if no school-specific classes found
          const allClasses = await classQueries.getAllClasses();
          console.log('📋 All classes in database:', allClasses.length);

          if (allClasses.length > 0) {
            setClasses(allClasses);
            localStorage.setItem('iqra_classes', JSON.stringify(allClasses));
          } else {
            // Use fallback classes if database is empty
            useFallbackClasses();
          }
        }
      } catch (firebaseError) {
        console.error('❌ Firebase error:', firebaseError);
        useFallbackClasses();
      }
    } catch (error) {
      console.error('💥 Critical error loading classes:', error);
      useFallbackClasses();
    } finally {
      setLoadingClasses(false);
    }
  };

  // Use fallback classes
  const useFallbackClasses = () => {
    const fallbackClasses = [
      { classId: 'play-class', className: 'প্লে', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true },
      { classId: 'nursery-class', className: 'নার্সারি', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true },
      { classId: 'one-class', className: 'প্রথম', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true },
      { classId: 'two-class', className: 'দ্বিতীয়', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true },
      { classId: 'three-class', className: 'তৃতীয়', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true },
      { classId: 'four-class', className: 'চতুর্থ', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true },
      { classId: 'five-class', className: 'পঞ্চম', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true }
    ];

    console.log('📝 Using fallback classes:', fallbackClasses.length);
    setClasses(fallbackClasses);
    localStorage.setItem('iqra_classes', JSON.stringify(fallbackClasses));
  };

  // Filter students based on search and filter criteria
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Student name search
      const nameMatch = studentNameSearch === '' ||
        student.name?.toLowerCase().includes(studentNameSearch.toLowerCase()) ||
        student.displayName?.toLowerCase().includes(studentNameSearch.toLowerCase());

      // Roll number search
      const rollMatch = rollNumberSearch === '' ||
        student.studentId?.toLowerCase().includes(rollNumberSearch.toLowerCase()) ||
        student.rollNumber?.toLowerCase().includes(rollNumberSearch.toLowerCase());

      // Class filter
      const classMatch = selectedClassFilter === 'সকল ক্লাস' ||
        student.classId === selectedClassFilter ||
        student.class === selectedClassFilter ||
        classes.find(c => c.classId === selectedClassFilter)?.className === student.class;

      // Section filter
      const sectionMatch = selectedSectionFilter === 'সকল সেকশন' ||
        student.section === selectedSectionFilter;

      return nameMatch && rollMatch && classMatch && sectionMatch;
    });
  }, [students, studentNameSearch, rollNumberSearch, selectedClassFilter, selectedSectionFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, 5);
      } else if (currentPage >= totalPages - 2) {
        pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2);
      }
    }

    return pages;
  };

  // Handle student selection
  const handleStudentToggle = (student: any) => {
    setSelectedStudents(prev =>
      prev.find(s => s.uid === student.uid)
        ? prev.filter(s => s.uid !== student.uid)
        : [...prev, student]
    );
  };

  // Handle select all students
  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents);
    }
  };

  // Handle fee collection for selected students
  const handleFeeCollection = async () => {
    if (selectedStudents.length === 0) {
      alert('অনুগ্রহ করে কোনো শিক্ষার্থী নির্বাচন করুন।');
      return;
    }

    if (!selectedExamType) {
      alert('অনুগ্রহ করে পরীক্ষার ধরন নির্বাচন করুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      const transactionPromises = selectedStudents.map(student => {
        // Get the exam fee amount for this student's class
        const examFeeAmount = calculateExamFee(selectedExamType, student);

        const transactionData: any = {
          type: 'income' as const,
          category: 'exam_fee',
          amount: examFeeAmount,
          description: `${selectedExamType === 'monthly' ? 'মাসিক' :
                        selectedExamType === 'quarterly' ? 'ত্রৈমাসিক' :
                        selectedExamType === 'halfYearly' ? 'অর্ধবার্ষিক' : 'বার্ষিক'} পরীক্ষার ফি - ${student.name || student.displayName}`,
          date: new Date().toISOString().split('T')[0],
          status: 'completed' as const,
          schoolId: 'iqra-school-2025',
          recordedBy: user?.email || 'admin',
          paymentMethod: 'cash' as const,
          studentId: student.uid,
          studentName: student.name || student.displayName,
          className: student.class || 'N/A',
          voucherNumber: `EX-${Date.now()}-${Math.random().toString(36).substr(2, 3)}`,
          notes: `${selectedExamType === 'monthly' ? 'মাসিক' :
                  selectedExamType === 'quarterly' ? 'ত্রৈমাসিক' :
                  selectedExamType === 'halfYearly' ? 'অর্ধবার্ষিক' : 'বার্ষিক'} পরীক্ষার ফি সংগ্রহ`,
          paymentDate: new Date().toISOString().split('T')[0],
          collectionDate: new Date().toISOString(),
          collectedBy: user?.email?.split('@')[0] || 'admin'
        };

        // Only add month fields for monthly exams
        if (selectedExamType === 'monthly') {
          transactionData.month = selectedMonth;
          transactionData.monthIndex = parseInt(selectedMonth) - 1;
        }

        return accountingQueries.createTransaction(transactionData);
      });

      const transactionIds = await Promise.all(transactionPromises);

      // Create fee collection records for each student
      const feeCollectionPromises = selectedStudents.map((student, index) => {
        const examFeeAmount = calculateExamFee(selectedExamType, student);

        return feeQueries.createFeeCollection({
          feeId: `exam-${selectedExamType}-${student.class}`,
          feeName: `${selectedExamType === 'monthly' ? 'মাসিক' :
                    selectedExamType === 'quarterly' ? 'ত্রৈমাসিক' :
                    selectedExamType === 'halfYearly' ? 'অর্ধবার্ষিক' : 'বার্ষিক'} পরীক্ষার ফি`,
          studentId: student.uid,
          studentName: student.name || student.displayName,
          classId: student.classId || student.class || 'unknown',
          className: student.class || 'N/A',
          amount: examFeeAmount,
          lateFee: 0,
          totalAmount: examFeeAmount,
          paymentDate: new Date().toISOString().split('T')[0],
          dueDate: new Date().toISOString().split('T')[0],
          status: 'paid',
          paymentMethod: 'cash',
          transactionId: transactionIds[index],
          collectedBy: user?.email?.split('@')[0] || 'admin',
          schoolId: 'iqra-school-2025'
        });
      });

      await Promise.all(feeCollectionPromises);

      // Clear selections
      setSelectedStudents([]);
      // Reload fee collections to update status
      loadFeeCollections();

      alert(`সফলভাবে ${selectedStudents.length} জন শিক্ষার্থীর পরীক্ষার ফি সংগ্রহ করা হয়েছে!`);
    } catch (error) {
      console.error('Error saving exam fees:', error);
      alert('ফি সংগ্রহ করতে ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dialog handlers
  const closeDialog = () => {
    setShowFeeDialog(false);
    setSelectedStudentForFee(null);
    setDialogExamId('');
    setSelectedMonth('');
    setTotalFee('0');
    setPaidAmount('0');
    setCollectionDate(new Date().toISOString().split('T')[0]);
  };

  // Calculate exam fee based on exam type and student class
  const calculateExamFee = (examType: 'monthly' | 'quarterly' | 'halfYearly' | 'annual' | '', student: any) => {
    if (!examType || !student) return 0;

    const studentClass = student.class || 'প্রথম';

    // First try to get fee from exam fee management system
    const examTypeFeesFromManagement = examFeesFromManagement[examType];
    if (examTypeFeesFromManagement && Object.keys(examTypeFeesFromManagement).length > 0) {
      const fee = examTypeFeesFromManagement[studentClass] || 0;

      if (fee > 0) {
        console.log('✅ Found fee from exam management:', {
          examType,
          studentClass,
          fee,
          source: 'exam_fee_management'
        });
        return fee;
      }
    }

    // Fallback to old exam fees system
    const examTypeFees = examFees[examType];
    if (examTypeFees && Object.keys(examTypeFees).length > 0) {
      const fee = examTypeFees[studentClass] || 0;

      if (fee > 0) {
        console.log('📋 Using fee from old system:', {
          examType,
          studentClass,
          fee,
          source: 'old_exam_fees'
        });
        return fee;
      }
    }

    // Final fallback to class-wise fee structure
    const classWiseFee = feeStructure?.examFees?.[studentClass] || 0;

    console.log('🔍 calculateExamFee result:', {
      examType,
      studentClass,
      fee: classWiseFee,
      source: 'class_wise_fallback',
      managementFees: examTypeFeesFromManagement,
      oldFees: examTypeFees
    });

    return classWiseFee;
  };

  // Check if student has paid exam fees
  const hasStudentPaidFees = (studentId: string) => {
    return feeCollections.some(collection =>
      collection.studentId === studentId &&
      collection.status === 'paid' &&
      collection.feeName.includes('পরীক্ষার ফি')
    );
  };

  const handleDialogFormSubmit = async () => {
    if (!selectedStudentForFee || !dialogExamId || !paidAmount) {
      alert('অনুগ্রহ করে সকল তথ্য পূরণ করুন।');
      return;
    }

    const selectedExam = existingExams.find(ex => ex.id === dialogExamId);
    if (!selectedExam) {
      alert('অনুগ্রহ করে একটি পরীক্ষা নির্বাচন করুন।');
      return;
    }

    // Check if month is selected for monthly exams
    if (selectedExam.examType === 'মাসিক' && !selectedMonth) {
      alert('অনুগ্রহ করে মাস নির্বাচন করুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      const examFeeAmount = examFeesData[dialogExamId]?.[selectedStudentForFee.class] || 0;

      // Get month name for monthly exams
      const getMonthName = (monthValue: string) => {
        const month = monthOptions.find(m => m.value === monthValue);
        return month ? month.label : '';
      };

      // Create transaction record
      const transactionData: any = {
        type: 'income' as const,
        category: 'exam_fee',
        amount: examFeeAmount,
        description: `${selectedExam.name}${selectedExam.examType === 'মাসিক' && selectedMonth ? ` (${getMonthName(selectedMonth)})` : ''} পরীক্ষার ফি - ${selectedStudentForFee.name || selectedStudentForFee.displayName}`,
        date: collectionDate,
        status: 'completed' as const,
        schoolId: 'iqra-school-2025',
        recordedBy: user?.email || 'admin',
        paymentMethod: 'cash' as const,
        studentId: selectedStudentForFee.uid,
        studentName: selectedStudentForFee.name || selectedStudentForFee.displayName,
        className: selectedStudentForFee.class || 'N/A',
        voucherNumber: `EX-${Date.now()}-${Math.random().toString(36).substr(2, 3)}`,
        notes: `${selectedExam.name}${selectedExam.examType === 'মাসিক' && selectedMonth ? ` (${getMonthName(selectedMonth)})` : ''} পরীক্ষার ফি সংগ্রহ`,
        paymentDate: collectionDate,
        collectionDate: new Date().toISOString(),
        collectedBy: user?.email?.split('@')[0] || 'admin'
      };

      // Only add month fields for monthly exams
      if (selectedExam.examType === 'মাসিক') {
        transactionData.month = selectedMonth;
        transactionData.monthIndex = parseInt(selectedMonth) - 1;
      }

      const transactionId = await accountingQueries.createTransaction(transactionData);

      // Create fee collection record
      await feeQueries.createFeeCollection({
        feeId: `exam-${selectedExam.id}-${selectedStudentForFee.class}${selectedExam.examType === 'মাসিক' && selectedMonth ? `-${selectedMonth}` : ''}`, // Include month for monthly exams
        feeName: `${selectedExam.name}${selectedExam.examType === 'মাসিক' && selectedMonth ? ` (${getMonthName(selectedMonth)})` : ''} পরীক্ষার ফি`,
        studentId: selectedStudentForFee.uid,
        studentName: selectedStudentForFee.name || selectedStudentForFee.displayName,
        classId: selectedStudentForFee.classId || selectedStudentForFee.class || 'unknown',
        className: selectedStudentForFee.class || 'N/A',
        amount: examFeeAmount,
        lateFee: 0,
        totalAmount: examFeeAmount,
        paymentDate: collectionDate,
        dueDate: collectionDate, // Same as payment date for collected fees
        status: 'paid',
        paymentMethod: 'cash',
        transactionId: transactionId,
        collectedBy: user?.email?.split('@')[0] || 'admin',
        schoolId: 'iqra-school-2025'
      });

      closeDialog();
      // Reload fee collections to update status
      loadFeeCollections();
      alert('সফলভাবে পরীক্ষার ফি সংগ্রহ করা হয়েছে!');
    } catch (error) {
      console.error('Error saving exam fee:', error);
      alert('ফি সংগ্রহ করতে ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };





  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const menuItems = [
    { icon: Home, label: 'ড্যাশবোর্ড', href: '/admin/dashboard', active: false },
    { icon: Users, label: 'শিক্ষার্থী', href: '/admin/students', active: false },
    { icon: BookOpen, label: 'শিক্ষক', href: '/admin/teachers', active: false },
    { icon: Users, label: 'অভিভাবক', href: '/admin/parents', active: false },
    { icon: BookOpen, label: 'ক্লাস', href: '/admin/classes', active: false },
    { icon: ClipboardList, label: 'উপস্থিতি', href: '/admin/attendance', active: false },
    { icon: Calendar, label: 'ইভেন্ট', href: '/admin/events', active: false },
    { icon: Settings, label: 'হিসাব', href: '/admin/accounting', active: true },
    { icon: Settings, label: 'Donation', href: '/admin/donation', active: false },
    { icon: Home, label: 'পরীক্ষা', href: '/admin/exams', active: false },
    { icon: BookOpen, label: 'বিষয়', href: '/admin/subjects', active: false },
    { icon: Users, label: 'সাপোর্ট', href: '/admin/support', active: false },
    { icon: Calendar, label: 'বার্তা', href: '/admin/accounts', active: false },
    { icon: Settings, label: 'Generate', href: '/admin/generate', active: false },
    { icon: Users, label: 'ইনভেন্টরি', href: '/admin/inventory', active: false },
    { icon: Users, label: 'অভিযোগ', href: '/admin/misc', active: false },
    { icon: Settings, label: 'সেটিংস', href: '/admin/settings', active: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center h-16 px-6 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">ই</span>
            </div>
            <span className="text-lg font-bold text-gray-900">সুপার অ্যাডমিন</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 mt-2 overflow-y-auto pb-4">
          {menuItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`flex items-center px-6 py-2 text-sm font-medium transition-colors ${
                item.active
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-4 h-4 mr-3" />
              {item.label}
            </a>
          ))}

          <button
            onClick={() => auth.signOut()}
            className="flex items-center w-full px-6 py-2 mt-4 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3" />
            লগআউট
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Top Navigation */}
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200 h-16">
          <div className="h-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center h-full">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div className="flex flex-col justify-center h-full">
                  <h1 className="text-xl font-semibold text-gray-900 leading-tight">পরীক্ষার ফি আদায়</h1>
                  <p className="text-sm text-gray-600 leading-tight">শিক্ষার্থীদের পরীক্ষার ফি সংগ্রহ করুন</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 h-full">
                <Bell className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-800" />
                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {/* Back Button */}
            <div className="mb-6">
              <button
                onClick={() => router.push('/admin/accounting/fee-collection-center')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>ফি আদায় কেন্দ্রে ফিরে যান</span>
              </button>
            </div>

            {/* Header Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">সকল শিক্ষার্থী</h2>
                  <p className="text-gray-600">আপনার সকল শ্রেণির ছাত্র-ছাত্রীদের তালিকা দেখুন এবং পরীক্ষার ফি সংগ্রহ করুন।</p>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setShowExamSelectionDialog(true);
                      loadExamFeesData();
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>পরীক্ষা নির্বাচন করুন</span>
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                    <UserPlus className="w-4 h-4" />
                    <span>শিক্ষার্থী যোগ করুন</span>
                  </button>
                </div>
              </div>
            </div>


            {/* Search and Filter Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Student Name Search */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="ছাত্রের নাম দিয়ে খুঁজুন"
                    value={studentNameSearch}
                    onChange={(e) => setStudentNameSearch(e.target.value)}
                    className="pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />
                </div>

                {/* Roll Number Search */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="রোল দিয়ে খুঁজুন"
                    value={rollNumberSearch}
                    onChange={(e) => setRollNumberSearch(e.target.value)}
                    className="pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />
                </div>

                {/* Class Filter */}
                <select
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loadingClasses}
                >
                  <option value="সকল ক্লাস">সকল ক্লাস</option>
                  {loadingClasses ? (
                    <option value="" disabled>ক্লাস লোড হচ্ছে...</option>
                  ) : (
                    classes.map((classItem) => (
                      <option key={classItem.classId} value={classItem.classId}>
                        {classItem.className} {classItem.section ? `(${classItem.section})` : ''}
                      </option>
                    ))
                  )}
                </select>

                {/* Section Filter */}
                <select
                  value={selectedSectionFilter}
                  onChange={(e) => setSelectedSectionFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sections.map((section) => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Table Header */}
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      সকল নির্বাচন করুন ({filteredStudents.length} জন শিক্ষার্থী)
                    </span>
                  </div>

                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-blue-600">পরীক্ষার ফি সংগ্রহ</span>
                  </div>
                </div>

                {selectedStudents.length > 0 && (
                  <div className="flex items-center space-x-3 mt-4">
                    <span className="text-sm text-gray-600">
                      {selectedStudents.length} জন নির্বাচিত
                    </span>
                    <div className="flex items-center space-x-2">
                      <select
                        value={selectedExamType}
                        onChange={(e) => setSelectedExamType(e.target.value as 'monthly' | 'quarterly' | 'halfYearly' | 'annual' | '')}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">পরীক্ষার ধরন নির্বাচন করুন</option>
                        <option value="monthly">মাসিক পরীক্ষা</option>
                        <option value="quarterly">ত্রৈমাসিক পরীক্ষা</option>
                        <option value="halfYearly">অর্ধবার্ষিক পরীক্ষা</option>
                        <option value="annual">বার্ষিক পরীক্ষা</option>
                      </select>
                      <button
                        onClick={handleFeeCollection}
                        disabled={isSubmitting || !selectedExamType}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>সংগ্রহ করছে...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>ফি সংগ্রহ করুন</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Table Content */}
              <div className="divide-y divide-gray-200">
                {paginatedStudents.map((student) => (
                  <div key={student.uid} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedStudents.some(s => s.uid === student.uid)}
                        onChange={() => handleStudentToggle(student)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />

                      {/* Profile Image */}
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex items-center justify-center overflow-hidden">
                        {student.profileImage ? (
                          <img
                            src={student.profileImage}
                            alt={student.displayName || student.name || 'Student'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold text-lg">
                            {student.displayName?.split(' ')[0]?.charAt(0) || student.name?.split(' ')[0]?.charAt(0) || '?'}
                          </span>
                        )}
                      </div>

                      {/* Student Info */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                        {/* Admission No */}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {student.studentId || 'ADMS-2025-8751'}
                          </p>
                          <p className="text-xs text-gray-500">রোল</p>
                        </div>

                        {/* Student Name */}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {student.displayName || student.name || 'Unknown Student'}
                          </p>
                          <p className="text-xs text-gray-500">শিক্ষার্থীর নাম</p>
                        </div>

                        {/* Class */}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {student.class || 'প্রথম'}
                          </p>
                          <p className="text-xs text-gray-500">ক্লাস</p>
                        </div>

                        {/* Fee Collection Status */}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              hasStudentPaidFees(student.uid) ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {hasStudentPaidFees(student.uid) ? 'সংগৃহীত' : 'অপেক্ষমান'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">ফি স্ট্যাটাস</p>
                        </div>

                        {/* Guardian Name */}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {student.guardianName || 'মোহাম্মদ আলী'}
                          </p>
                          <p className="text-xs text-gray-500">অভিভাবকের নাম</p>
                        </div>

                        {/* Current Location */}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {student.address || 'চান্দাইকোনা'}
                          </p>
                          <p className="text-xs text-gray-500">বর্তমান ঠিকানা</p>
                        </div>

                        {/* Fee Collection Button */}
                        <div className="flex items-center">
                          <button
                            onClick={() => {
                              console.log('👤 Opening dialog for student:', student);
                              setSelectedStudentForFee(student);
                              setDialogExamId(''); // Start with no exam selected
                              setShowFeeDialog(true);
                              setTotalFee('0');
                              setPaidAmount('0');
                            }}
                            className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm font-medium flex items-center space-x-1"
                          >
                            <DollarSign className="w-3 h-3" />
                            <span>ফি সংগ্রহ করুন</span>
                          </button>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {filteredStudents.length === 0 && (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">কোন শিক্ষার্থী পাওয়া যায়নি</h3>
                  <p className="mt-1 text-sm text-gray-500">অনুসন্ধান ফিল্টার পরিবর্তন করুন</p>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center text-sm text-gray-700">
                  <span className="mr-2">দেখানো হচ্ছে</span>
                  <span className="font-medium">{startIndex + 1}</span>
                  <span className="mx-1">থেকে</span>
                  <span className="font-medium">{Math.min(endIndex, filteredStudents.length)}</span>
                  <span className="mx-1">পর্যন্ত</span>
                  <span className="font-medium">{filteredStudents.length}</span>
                  <span className="ml-1">জন শিক্ষার্থী</span>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:hover:bg-gray-100"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    আগের
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {getPageNumbers().map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          page === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:hover:bg-gray-100"
                  >
                    পরের
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fee Collection Dialog */}
      {showFeeDialog && selectedStudentForFee && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Dialog Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  ফি সংগ্রহ করুন: {selectedStudentForFee.displayName || selectedStudentForFee.name || 'Unknown Student'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  রোল: {selectedStudentForFee.studentId || 'N/A'} | শ্রেণি: {selectedStudentForFee.class || 'প্রথম'} - A
                </p>
              </div>
              <button
                onClick={closeDialog}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Dialog Body */}
            <div className="p-6 space-y-6">
              {/* Exam Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  পরীক্ষা
                </label>
                <select
                  value={dialogExamId}
                  onChange={(e) => {
                    const examId = e.target.value;
                    setDialogExamId(examId);
                    const exam = existingExams.find(ex => ex.id === examId);
                    if (exam && selectedStudentForFee) {
                      const fee = examFeesData[examId]?.[selectedStudentForFee.class] || 0;
                      setTotalFee(fee.toString());
                      setPaidAmount(fee.toString());
                    } else {
                      setTotalFee('0');
                      setPaidAmount('0');
                    }
                    // Reset month if not monthly
                    if (exam?.examType !== 'মাসিক') {
                      setSelectedMonth('');
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">পরীক্ষা নির্বাচন করুন</option>
                  {existingExams.map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Month Selection - Only show for monthly exams */}
              {(() => {
                const selectedExam = existingExams.find(ex => ex.id === dialogExamId);
                return selectedExam?.examType === 'মাসিক' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      মাস <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">মাস নির্বাচন করুন</option>
                      {monthOptions.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })()}



              {/* Total Fee and Paid Amount Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Total Fee */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    মোট ফি
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">৳</span>
                    <input
                      type="number"
                      value={totalFee}
                      readOnly
                      className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Paid Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    প্রদত্ত পরিমাণ <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                      placeholder="120"
                    />
                  </div>
                </div>
              </div>

              {/* Logged User and Date Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Logged User */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    আদায়কারী
                  </label>
                  <input
                    type="text"
                    value={user?.email?.split('@')[0] || 'admin'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    তারিখ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={collectionDate}
                    onChange={(e) => setCollectionDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Dialog Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={closeDialog}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                বাতিল করুন
              </button>
              <button
                onClick={handleDialogFormSubmit}
                disabled={isSubmitting || !dialogExamId || !paidAmount || paidAmount === '0' || (() => {
                  const selectedExam = existingExams.find(ex => ex.id === dialogExamId);
                  return selectedExam?.examType === 'মাসিক' && !selectedMonth;
                })()}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-semibold text-base shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>সংরক্ষণ করছে...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>সংরক্ষণ করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exam Selection Dialog */}
      {showExamSelectionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            {/* Dialog Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  পরীক্ষা নির্বাচন করুন
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  ফি ম্যানেজমেন্ট থেকে পরীক্ষা এবং তাদের ফি দেখুন
                </p>
              </div>
              <button
                onClick={() => setShowExamSelectionDialog(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Dialog Body */}
            <div className="p-6">
              {loadingExamFeesData ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-600" />
                  <p className="text-gray-600">পরীক্ষার তথ্য লোড হচ্ছে...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Exam Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      পরীক্ষার ধরন নির্বাচন করুন
                    </label>
                    <select
                      value={selectedExamTypeForDialog}
                      onChange={(e) => setSelectedExamTypeForDialog(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">পরীক্ষার ধরন নির্বাচন করুন</option>
                      <option value="প্রথম সাময়িক">প্রথম সাময়িক পরীক্ষা</option>
                      <option value="দ্বিতীয় সাময়িক">দ্বিতীয় সাময়িক পরীক্ষা</option>
                      <option value="তৃতীয় সাময়িক">তৃতীয় সাময়িক পরীক্ষা</option>
                      <option value="সাময়িক">সাময়িক পরীক্ষা</option>
                      <option value="বার্ষিক">বার্ষিক পরীক্ষা</option>
                      <option value="মাসিক">মাসিক পরীক্ষা</option>
                      <option value="নির্বাচনী">নির্বাচনী পরীক্ষা</option>
                      <option value="পরীক্ষামূলক">পরীক্ষামূলক পরীক্ষা</option>
                      <option value="অন্যান্য">অন্যান্য পরীক্ষা</option>
                    </select>
                  </div>

                  {/* Show exams of selected type */}
                  {selectedExamTypeForDialog && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selectedExamTypeForDialog === 'প্রথম সাময়িক' && 'প্রথম সাময়িক পরীক্ষা'}
                        {selectedExamTypeForDialog === 'দ্বিতীয় সাময়িক' && 'দ্বিতীয় সাময়িক পরীক্ষা'}
                        {selectedExamTypeForDialog === 'তৃতীয় সাময়িক' && 'তৃতীয় সাময়িক পরীক্ষা'}
                        {selectedExamTypeForDialog === 'সাময়িক' && 'সাময়িক পরীক্ষা'}
                        {selectedExamTypeForDialog === 'বার্ষিক' && 'বার্ষিক পরীক্ষা'}
                        {selectedExamTypeForDialog === 'মাসিক' && 'মাসিক পরীক্ষা'}
                        {selectedExamTypeForDialog === 'নির্বাচনী' && 'নির্বাচনী পরীক্ষা'}
                        {selectedExamTypeForDialog === 'পরীক্ষামূলক' && 'পরীক্ষামূলক পরীক্ষা'}
                        {selectedExamTypeForDialog === 'অন্যান্য' && 'অন্যান্য পরীক্ষা'}
                      </h3>

                      {(() => {
                        let examsOfType = [];

                        if (selectedExamTypeForDialog === 'অন্যান্য') {
                          // For "অন্যান্য", show exams that don't match other types
                          examsOfType = existingExams.filter(exam =>
                            !exam.examType ||
                            ![
                              'প্রথম সাময়িক', 'দ্বিতীয় সাময়িক', 'তৃতীয় সাময়িক', 'সাময়িক',
                              'বার্ষিক', 'মাসিক', 'নির্বাচনী', 'পরীক্ষামূলক'
                            ].includes(exam.examType)
                          );
                        } else {
                          // For specific types, filter by exact match
                          examsOfType = existingExams.filter(exam => exam.examType === selectedExamTypeForDialog);
                        }

                        if (examsOfType.length === 0) {
                          return (
                            <div className="text-center py-8 text-gray-500">
                              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                              <p className="text-lg font-medium">এই ধরনের কোনো পরীক্ষা পাওয়া যায়নি</p>
                              <p className="text-sm">প্রথমে পরীক্ষা ম্যানেজমেন্টে এই ধরনের পরীক্ষা যোগ করুন</p>
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-3">
                            {examsOfType.map((exam) => {
                              const examFees = examFeesData[exam.id] || {};
                              const hasFeesForThisExam = Object.values(examFees).some(fee => fee > 0);

                              return (
                                <div key={exam.id} className="bg-white border border-gray-200 rounded-lg p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <h5 className="text-lg font-medium text-gray-900">{exam.name}</h5>
                                      <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                        <div>
                                          <span className="font-medium">ক্লাস:</span> {exam.class || 'সাধারণ'}
                                        </div>
                                        <div>
                                          <span className="font-medium">তারিখ:</span> {new Date(exam.startDate).toLocaleDateString('bn-BD')} - {new Date(exam.endDate).toLocaleDateString('bn-BD')}
                                        </div>
                                        <div>
                                          <span className="font-medium">স্ট্যাটাস:</span>
                                          <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                                            exam.status === 'সক্রিয়' ? 'bg-green-100 text-green-800' :
                                            exam.status === 'সম্পন্ন' ? 'bg-blue-100 text-blue-800' :
                                            'bg-yellow-100 text-yellow-800'
                                          }`}>
                                            {exam.status}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Show current fees for this exam */}
                                      {hasFeesForThisExam && (
                                        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                          <h6 className="text-sm font-medium text-gray-700 mb-2">নির্ধারিত ফি:</h6>
                                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                            {Object.entries(examFees)
                                              .filter(([_, fee]) => fee > 0)
                                              .map(([className, fee]) => (
                                                <div key={className} className="flex justify-between items-center bg-white px-2 py-1 rounded border">
                                                  <span className="text-gray-700 text-sm">{className}:</span>
                                                  <span className="font-semibold text-blue-600 text-sm">৳{fee}</span>
                                                </div>
                                              ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex items-center space-x-2 ml-4">
                                      <button
                                        onClick={() => {
                                          setShowExamSelectionDialog(false);
                                          alert(`ফি সংগ্রহ শুরু করুন: ${exam.name}`);
                                        }}
                                        className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                        disabled={!hasFeesForThisExam}
                                      >
                                        {hasFeesForThisExam ? 'ফি সংগ্রহ করুন' : 'ফি নির্ধারণ করা হয়নি'}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Show message if no exam type selected */}
                  {!selectedExamTypeForDialog && (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-lg font-medium">পরীক্ষার ধরন নির্বাচন করুন</p>
                      <p className="text-sm">উপরের ড্রপডাউন থেকে পরীক্ষার ধরন বেছে নিন</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dialog Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setShowExamSelectionDialog(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                বাতিল করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CollectExamFeePageWrapper() {
  return (
    <ProtectedRoute requireAuth={true}>
      <CollectExamFeePage />
    </ProtectedRoute>
  );
}
