'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { User, onAuthStateChanged } from 'firebase/auth';
import AdminLayout from '@/components/AdminLayout';
import Modal from '@/components/ui/modal';
import { accountingQueries, Exam, Class } from '@/lib/database-queries';
import { SCHOOL_ID } from '@/lib/constants';
import { useGlobalAlert } from '@/contexts/AlertContext';
import { ClassData } from '@/types';
import {
  ArrowLeft, Save, Edit, DollarSign,
  BookOpen, Loader2, CheckCircle, Calculator, Trash2
} from 'lucide-react';

function ExamFeeManagementPage() {
  const { showSuccess, showError, showWarning, showConfirm } = useGlobalAlert();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [actualExams, setActualExams] = useState<Exam[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [examFees, setExamFees] = useState<{[examType: string]: { [className: string]: number }}>({});


  const [editingType, setEditingType] = useState<string | null>(null);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [tempFees, setTempFees] = useState<{[className: string]: number}>({});
  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // New exam creation states
  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [newExamName, setNewExamName] = useState('');
  const [newExamType, setNewExamType] = useState('');
  const [newExamFees, setNewExamFees] = useState<{[className: string]: number}>({});

  const router = useRouter();
  const schoolId = SCHOOL_ID; // Match the actual school ID from your classes

  // Load data on component mount
  useEffect(() => {
    if (user) {
      loadClasses();
      loadActualExams();
      loadExamFees();

      // Set up real-time listener for exam changes
      let unsubscribe: (() => void) | undefined;

      setupExamListener().then((unsub) => {
        unsubscribe = unsub;
      });

      // Cleanup function to unsubscribe from listener
      return () => {
        if (unsubscribe) {
          unsubscribe();
          console.log('🔌 Unsubscribed from exam listener');
        }
      };
    }
  }, [user]);

  // Set up real-time listener for exam changes
  const setupExamListener = async () => {
    try {
      const { examQueries } = await import('@/lib/database-queries');

      // Subscribe to exam changes for the school
      const unsubscribe = examQueries.subscribeToExams(
        schoolId,
        (updatedExams) => {
          console.log('🔄 Exams updated in real-time:', updatedExams.length);
          // Filter out deleted exams
          const activeExams = updatedExams.filter((exam) => {
            const isDeleted = (exam as any).deleted === true || (exam as any).deleted === 'true';
            return !isDeleted;
          });
          console.log('🔄 Active exams after filtering:', activeExams.length);
          setActualExams(activeExams);
        },
        (error) => {
          console.error('❌ Error listening to exam updates:', error);
        }
      );

      // Store unsubscribe function to clean up on unmount
      return unsubscribe;
    } catch (error) {
      console.error('❌ Error setting up exam listener:', error);
    }
  };

  // Auto-close success modal after 3 seconds
  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessModal]);

  // Get available classes from database (memoized to prevent infinite loops)
  const availableClasses = useMemo(() =>
    classes.map(cls => cls.className).filter(Boolean),
    [classes]
  );

  // Helper function to get appropriate label for exam type
  const getExamTypeLabel = (standardKey: string, exam: any) => {
    // Try to find a representative exam name for this type
    if (exam && exam.name) {
      return exam.name;
    }

    // Fallback to standard labels
    const labelMap: {[key: string]: string} = {
      'monthly': 'মাসিক পরীক্ষা',
      'quarterly': 'ত্রৈমাসিক পরীক্ষা',
      'halfYearly': 'অর্ধবার্ষিক পরীক্ষা',
      'annual': 'বার্ষিক পরীক্ষা'
    };

    return labelMap[standardKey] || 'অন্যান্য পরীক্ষা';
  };

  // Load actual exam types from exam management system
  const examTypes = useMemo(() => {
    console.log('📋 Creating exam cards from actual exams:', actualExams.length);

    if (actualExams.length > 0) {
      // Create a card for each individual exam
      const examCards = actualExams.map((exam) => ({
        key: exam.id,
        label: exam.name || exam.examType || 'পরীক্ষা',
        exams: [exam],
        examId: exam.id
      }));

      console.log('📋 Created exam cards:', examCards.map(c => ({
        key: c.key,
        label: c.label
      })));

      return examCards;
    } else {
      console.log('📋 No actual exams found, showing empty state');
      return [];
    }
  }, [actualExams]);

  // Load actual exams from exam management page
  const loadActualExams = async () => {
    setLoadingExams(true);
    try {
      console.log('🔍 Loading actual exams from exam management...');
      console.log('🏫 Using school ID:', schoolId);

      // Import exam queries
      const { examQueries } = await import('@/lib/database-queries');

      // Get all exams first
      const allExams = await examQueries.getAllExams();
      console.log('📋 Found', allExams.length, 'exams in database');

      // Filter for our school ID and exclude deleted exams
      const schoolExams = allExams.filter((exam) => {
        const isDeleted = (exam as any).deleted === true || (exam as any).deleted === 'true';
        const isCorrectSchool = exam.schoolId === schoolId;

        console.log('📋 Checking exam:', exam.id, 'deleted:', (exam as any).deleted, 'isDeleted:', isDeleted, 'school:', exam.schoolId);

        return isCorrectSchool && !isDeleted;
      });
      console.log('📋 Found', schoolExams.length, 'active exams for school', schoolId);

      // Always use only filtered exams (no fallback to show deleted exams)
      setActualExams(schoolExams);
      console.log('✅ Loaded', schoolExams.length, 'active exams for fee management');

    } catch (error) {
      console.error('❌ Error loading actual exams:', error);
      // Create a simple test exam
      const testExam = {
        id: 'test-exam-1',
        name: 'প্রথম সাময়িক পরীক্ষা',
        schoolId: schoolId,
        examType: 'প্রথম সাময়িক'
      };
      setActualExams([testExam]);
      console.log('🔄 Using test exam:', testExam);
    } finally {
      setLoadingExams(false);
    }
  };

  // Load classes from database
  const loadClasses = async () => {
    setLoadingClasses(true);
    try {
      console.log('🔍 Loading classes for school ID:', schoolId);

      // Try multiple approaches to get classes
      const { classQueries } = await import('@/lib/queries/class-queries');

      // First try: Get all classes (including inactive) to see what's in the database
      const allClasses = await classQueries.getAllClasses(false);
      console.log('📋 All classes in database:', allClasses.length, allClasses.map(c => ({
        className: c.className,
        schoolId: c.schoolId,
        isActive: c.isActive,
        classId: c.classId
      })));

      // Filter by school ID manually
      let classesData = allClasses.filter(cls => cls.schoolId === schoolId);
      console.log('📋 Classes found by school ID:', classesData.length, classesData.map(c => ({
        className: c.className,
        schoolId: c.schoolId,
        isActive: c.isActive,
        classId: c.classId
      })));

      // If no classes found, try getting all classes (for debugging)
      if (classesData.length === 0) {
        console.log('⚠️ No classes found by school ID, trying all classes...');
        const allClasses = await classQueries.getAllClasses(false); // Get all including inactive
        console.log('📋 All classes in database:', allClasses.length, allClasses);

        // Filter by school ID manually if needed
        classesData = allClasses.filter(cls => cls.schoolId === schoolId);
        console.log('📋 Filtered classes for school:', classesData.length, classesData);
      }

      // If no classes found, delete all existing and create fresh sample classes
      if (classesData.length === 0) {
        console.log('🚀 No classes found, creating fresh sample classes...');

        // First delete all existing classes to start fresh
        const deletedCount = await classQueries.deleteAllClasses(schoolId);
        console.log(`🗑️ Deleted ${deletedCount} existing classes`);

        // Create comprehensive sample classes for SCHOOL_ID (1-12 classes)
        const sampleClasses = [
          {
            className: 'প্লে',
            section: 'এ',
            teacherName: 'শিক্ষক ১',
            academicYear: '২০২৫',
            totalStudents: 20,
            isActive: true,
            schoolId: schoolId,
            schoolName: 'আমার স্কুল',
            teacherId: 'teacher-play'
          },
          {
            className: 'নার্সারি',
            section: 'এ',
            teacherName: 'শিক্ষক ২',
            academicYear: '২০২৫',
            totalStudents: 25,
            isActive: true,
            schoolId: schoolId,
            schoolName: 'আমার স্কুল',
            teacherId: 'teacher-nursery'
          },
          {
            className: 'প্রথম',
            section: 'এ',
            teacherName: 'শিক্ষক ৩',
            academicYear: '২০২৫',
            totalStudents: 30,
            isActive: true,
            schoolId: schoolId,
            schoolName: 'আমার স্কুল',
            teacherId: 'teacher-1'
          },
          {
            className: 'দ্বিতীয়',
            section: 'এ',
            teacherName: 'শিক্ষক ৪',
            academicYear: '২০২৫',
            totalStudents: 28,
            isActive: true,
            schoolId: schoolId,
            schoolName: 'আমার স্কুল',
            teacherId: 'teacher-2'
          },
          {
            className: 'তৃতীয়',
            section: 'এ',
            teacherName: 'শিক্ষক ৫',
            academicYear: '২০২৫',
            totalStudents: 32,
            isActive: true,
            schoolId: schoolId,
            schoolName: 'আমার স্কুল',
            teacherId: 'teacher-3'
          },
          {
            className: 'চতুর্থ',
            section: 'এ',
            teacherName: 'শিক্ষক ৬',
            academicYear: '২০২৫',
            totalStudents: 29,
            isActive: true,
            schoolId: schoolId,
            schoolName: 'আমার স্কুল',
            teacherId: 'teacher-4'
          },
          {
            className: 'পঞ্চম',
            section: 'এ',
            teacherName: 'শিক্ষক ৭',
            academicYear: '২০২৫',
            totalStudents: 31,
            isActive: true,
            schoolId: schoolId,
            schoolName: 'আমার স্কুল',
            teacherId: 'teacher-5'
          },
          {
            className: 'ষষ্ঠ',
            section: 'এ',
            teacherName: 'শিক্ষক ৮',
            academicYear: '২০২৫',
            totalStudents: 27,
            isActive: true,
            schoolId: schoolId,
            schoolName: 'আমার স্কুল',
            teacherId: 'teacher-6'
          },
          {
            className: 'সপ্তম',
            section: 'এ',
            teacherName: 'শিক্ষক ৯',
            academicYear: '২০২৫',
            totalStudents: 26,
            isActive: true,
            schoolId: schoolId,
            schoolName: 'আমার স্কুল',
            teacherId: 'teacher-7'
          },
          {
            className: 'অষ্টম',
            section: 'এ',
            teacherName: 'শিক্ষক ১০',
            academicYear: '২০২৫',
            totalStudents: 24,
            isActive: true,
            schoolId: schoolId,
            schoolName: 'আমার স্কুল',
            teacherId: 'teacher-8'
          },
          {
            className: 'নবম',
            section: 'এ',
            teacherName: 'শিক্ষক ১১',
            academicYear: '২০২৫',
            totalStudents: 22,
            isActive: true,
            schoolId: schoolId,
            schoolName: 'আমার স্কুল',
            teacherId: 'teacher-9'
          },
          {
            className: 'দশম',
            section: 'এ',
            teacherName: 'শিক্ষক ১২',
            academicYear: '২০২৫',
            totalStudents: 20,
            isActive: true,
            schoolId: schoolId,
            schoolName: 'আমার স্কুল',
            teacherId: 'teacher-10'
          },
          {
            className: 'একাদশ',
            section: 'এ',
            teacherName: 'শিক্ষক ১৩',
            academicYear: '২০২৫',
            totalStudents: 18,
            isActive: true,
            schoolId: schoolId,
            schoolName: 'আমার স্কুল',
            teacherId: 'teacher-11'
          },
          {
            className: 'দ্বাদশ',
            section: 'এ',
            teacherName: 'শিক্ষক ১৪',
            academicYear: '২০২৫',
            totalStudents: 16,
            isActive: true,
            schoolId: schoolId,
            schoolName: 'আমার স্কুল',
            teacherId: 'teacher-12'
          }
        ];

        // Create all sample classes
        for (const classData of sampleClasses) {
          await classQueries.createClass(classData);
          console.log(`✅ Created class: ${classData.className}`);
        }

        // Try loading again after creating all classes
        classesData = await classQueries.getClassesBySchool(schoolId);
        console.log('📋 Classes after creating samples:', classesData.length, classesData.map(c => ({
          className: c.className,
          schoolId: c.schoolId,
          isActive: c.isActive,
          classId: c.classId
        })));
      }

      setClasses(classesData);
      console.log('✅ Final classes loaded for fee management:', classesData.map(c => ({
        className: c.className,
        schoolId: c.schoolId,
        id: c.classId || c.id
      })));

      // Also log available class names
      const availableClassNames = classesData.map(c => c.className).filter(Boolean);
      console.log('📝 Available class names:', availableClassNames);

    } catch (error) {
      console.error('❌ Error loading classes:', error);
      // Fallback to basic classes if database query fails (classes 1-12)
      const fallbackClasses = [
        { id: 'play', className: 'প্লে' },
        { id: 'nursery', className: 'নার্সারি' },
        { id: 'one', className: 'প্রথম' },
        { id: 'two', className: 'দ্বিতীয়' },
        { id: 'three', className: 'তৃতীয়' },
        { id: 'four', className: 'চতুর্থ' },
        { id: 'five', className: 'পঞ্চম' },
        { id: 'six', className: 'ষষ্ঠ' },
        { id: 'seven', className: 'সপ্তম' },
        { id: 'eight', className: 'অষ্টম' },
        { id: 'nine', className: 'নবম' },
        { id: 'ten', className: 'দশম' },
        { id: 'eleven', className: 'একাদশ' },
        { id: 'twelve', className: 'দ্বাদশ' }
      ];
      setClasses(fallbackClasses);
      console.log('🔄 Using fallback classes:', fallbackClasses.map(c => c.className));
    } finally {
      setLoadingClasses(false);
    }
  };

  // Authentication check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.push('/auth/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  // Load exam fees from Firebase - now loads exam-specific fees by exam ID
  const loadExamFees = async () => {
    try {
      // Load exam-specific fees from /examSpecificFees/{schoolId}
      const examFeesRef = doc(db, 'examSpecificFees', schoolId);
      const examFeesSnap = await getDoc(examFeesRef);

      if (examFeesSnap.exists()) {
        const examSpecificData = examFeesSnap.data();
        const examSpecificFees = examSpecificData.fees || {};
        
        console.log('✅ Loaded exam-specific fees:', examSpecificFees);
        setExamFees(examSpecificFees);
      } else {
        console.log('📋 No exam-specific fees found');
        setExamFees({});
      }
    } catch (error) {
      console.error('❌ Error loading exam fees:', error);
      setExamFees({});
    }
  };

  // Start editing fees for an exam type
  const startEditingFees = (examType: string, examId: string) => {
    const currentFees = getExamFeesForDisplay(examType);
    setTempFees({ ...currentFees });
    setEditingType(examType);
    setEditingExamId(examId);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingType(null);
    setEditingExamId(null);
    setTempFees({});
  };

  // Update temp fee for a class
  const updateTempFee = (className: string, amount: number) => {
    setTempFees(prev => ({
      ...prev,
      [className]: amount
    }));
  };

  // Set up comprehensive fee structure for all classes
  const setupComprehensiveFees = async () => {
    try {
      console.log('🚀 Setting up comprehensive fee structure for all classes...');

      // Get current exam fees
      const currentExamFees = await accountingQueries.getExamFees(schoolId);

      // Define comprehensive fee structure for all classes
      const comprehensiveFees = {
        'First Term Examination Fee': {
          'প্লে': 180,
          'নার্সারি': 200,
          'প্রথম': 250,
          'দ্বিতীয়': 300,
          'তৃতীয়': 350,
          'চতুর্থ': 400,
          'পঞ্চম': 450,
          'ষষ্ঠ': 500,
          'সপ্তম': 550,
          'অষ্টম': 600,
          'নবম': 650,
          'দশম': 700,
          'একাদশ': 750,
          'দ্বাদশ': 800
        },
        'Second Term Examination Fee': {
          'প্লে': 180,
          'নার্সারি': 200,
          'প্রথম': 250,
          'দ্বিতীয়': 300,
          'তৃতীয়': 350,
          'চতুর্থ': 400,
          'পঞ্চম': 450,
          'ষষ্ঠ': 500,
          'সপ্তম': 550,
          'অষ্টম': 600,
          'নবম': 650,
          'দশম': 700,
          'একাদশ': 750,
          'দ্বাদশ': 800
        },
        'Annual Examination Fee': {
          'প্লে': 300,
          'নার্সারি': 350,
          'প্রথম': 400,
          'দ্বিতীয়': 450,
          'তৃতীয়': 500,
          'চতুর্থ': 550,
          'পঞ্চম': 600,
          'ষষ্ঠ': 650,
          'সপ্তম': 700,
          'অষ্টম': 750,
          'নবম': 800,
          'দশম': 850,
          'একাদশ': 900,
          'দ্বাদশ': 950
        },
        'Monthly Examination Fee': {
          'প্লে': 100,
          'নার্সারি': 120,
          'প্রথম': 150,
          'দ্বিতীয়': 180,
          'তৃতীয়': 200,
          'চতুর্থ': 220,
          'পঞ্চম': 250,
          'ষষ্ঠ': 280,
          'সপ্তম': 300,
          'অষ্টম': 320,
          'নবম': 350,
          'দশম': 380,
          'একাদশ': 400,
          'দ্বাদশ': 420
        }
      };

      console.log('📋 Comprehensive fee structure to save:', comprehensiveFees);

      // Save comprehensive fees to Firebase
      await accountingQueries.saveExamFees(schoolId, comprehensiveFees, user?.email || 'admin');
      console.log('✅ Comprehensive fees saved to Firebase successfully');

      // Update local state immediately for instant UI feedback
      setExamFees(comprehensiveFees);
      console.log('✅ Local state updated immediately');

      // Also reload from database to ensure consistency
      await loadExamFees();
      console.log('✅ Reloaded fees from database');

      console.log('🎉 Comprehensive fee structure saved and UI updated successfully!');
      setShowSuccessModal(true);

      // Show the saved fees in console for verification
      console.log('📋 Complete comprehensive fee structure saved:', comprehensiveFees);
    } catch (error) {
      console.error('❌ Error setting up comprehensive fees:', error);
      showError('সম্পূর্ণ ফি স্ট্রাকচার সেটআপ করতে ত্রুটি হয়েছে।');
    }
  };

  // Save fees for an exam type
  const saveFees = async (examType: string) => {
    setSaving(true);
    try {
      console.log('💾 Saving fees for exam type:', examType);
      console.log('📝 Editing exam ID:', editingExamId);
      console.log('📝 Temp fees to save:', tempFees);

      // Filter out zero values before saving
      const feesToSave = Object.fromEntries(
        Object.entries(tempFees).filter(([_, fee]) => fee && fee > 0)
      );

      // Use the existing exam ID that we're editing
      const examId = editingExamId || examType;
      
      // 1. Update exam record in /exams collection with fees
      const examRef = doc(db, 'exams', examId);
      const examSnap = await getDoc(examRef);
      
      if (examSnap.exists()) {
        // Update existing exam with new fees
        await setDoc(examRef, {
          fees: feesToSave,
          updatedAt: new Date().toISOString(),
          updatedBy: user?.email || 'admin'
        }, { merge: true });
        console.log('✅ Exam fees updated in /exams:', examId);
      } else {
        console.error('❌ Exam not found:', examId);
        showError('পরীক্ষা খুঁজে পাওয়া যায়নি।');
        return;
      }

      // 2. Save exam-specific fees to /examSpecificFees
      const examFeesRef = doc(db, 'examSpecificFees', schoolId);
      await setDoc(examFeesRef, {
        fees: {
          [examId]: feesToSave
        },
        lastUpdated: new Date().toISOString(),
        updatedBy: user?.email || 'admin'
      }, { merge: true });
      console.log('✅ Exam fees saved to /examSpecificFees:', examId);

      // Update local state
      setExamFees(prev => ({
        ...prev,
        [examId]: feesToSave
      }));
      await loadExamFees();
      await loadActualExams();

      setEditingType(null);
      setEditingExamId(null);
      setTempFees({});

      console.log('🎉 Exam fees updated successfully!');
      showSuccess('পরীক্ষার ফি সফলভাবে আপডেট করা হয়েছে!');
    } catch (error) {
      console.error('❌ Error saving fees:', error);
      showError('ফি সংরক্ষণ করতে ত্রুটি হয়েছে।');
    } finally {
      setSaving(false);
    }
  };

  // Get exam fees for display - now works with exam IDs
  const getExamFeesForDisplay = (examKey: string) => {
    // First try to get fees from examFeesData (exam-specific fees by exam ID)
    const examSpecificFeesRef = doc(db, 'examSpecificFees', schoolId);
    
    // For now, return from examFees state which should have exam ID as key
    return examFees[examKey] || {};
  };

  // Calculate total fees for an exam type
  const calculateTotalFees = (examType: string) => {
    const fees = getExamFeesForDisplay(examType);
    return Object.values(fees).reduce((total: number, fee) => total + (fee || 0), 0);
  };

  // Delete exam
  const deleteExam = async (examId: string, examName: string) => {
    showConfirm(
      `আপনি কি "${examName}" পরীক্ষাটি মুছে ফেলতে চান?`,
      async () => {
        setSaving(true);
    try {
      // 1. Delete exam record
      const examRef = doc(db, 'exams', examId);
      await setDoc(examRef, { deleted: true, deletedAt: new Date().toISOString() }, { merge: true });
      console.log('✅ Exam marked as deleted:', examId);

      // 2. Remove fees
      const examFeesRef = doc(db, 'examSpecificFees', schoolId);
      const examFeesSnap = await getDoc(examFeesRef);
      
      if (examFeesSnap.exists()) {
        const currentFees = examFeesSnap.data().fees || {};
        delete currentFees[examId];
        
        await setDoc(examFeesRef, {
          fees: currentFees,
          lastUpdated: new Date().toISOString()
        });
        console.log('✅ Exam fees removed:', examId);
      }

      // 3. Reload data
      await loadActualExams();
      await loadExamFees();

      showSuccess('পরীক্ষা সফলভাবে মুছে ফেলা হয়েছে!');
    } catch (error) {
      console.error('❌ Error deleting exam:', error);
      showError('পরীক্ষা মুছে ফেলতে ত্রুটি হয়েছে।');
    } finally {
      setSaving(false);
    }
      }
    );
  };

  // Create new exam with fees
  const createNewExam = async () => {
    if (!newExamName.trim() || !newExamType.trim()) {
      showWarning('অনুগ্রহ করে পরীক্ষার নাম এবং ধরন প্রদান করুন।');
      return;
    }

    // Check if fees are set
    const hasAnyFee = Object.values(newExamFees).some(fee => fee > 0);
    if (!hasAnyFee) {
      showWarning('অনুগ্রহ করে অন্তত একটি ক্লাসের জন্য ফি নির্ধারণ করুন।');
      return;
    }

    setSaving(true);
    try {
      // Create exam ID
      const examId = `${schoolId}-${newExamType}-${Date.now()}`;
      
      // 1. Create exam record WITH fees in unified structure
      const examData = {
        id: examId,
        name: newExamName,
        examType: newExamType,
        schoolId: schoolId,
        academicYear: '2025',
        status: 'upcoming',
        fees: newExamFees, // ← Fees stored directly in exam document
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user?.email || 'admin'
      };

      const examRef = doc(db, 'exams', examId);
      await setDoc(examRef, examData);
      console.log('✅ New exam created with fees:', examId, newExamFees);

      // 2. Also save to examSpecificFees for backward compatibility
      const examFeesRef = doc(db, 'examSpecificFees', schoolId);
      await setDoc(examFeesRef, {
        fees: {
          [examId]: newExamFees
        },
        lastUpdated: new Date().toISOString(),
        updatedBy: user?.email || 'admin'
      }, { merge: true });
      console.log('✅ Exam fees also saved to examSpecificFees for backward compatibility');

      // 3. Reload data
      await loadActualExams();
      await loadExamFees();

      // 4. Reset form and close modal
      setNewExamName('');
      setNewExamType('');
      setNewExamFees({});
      setShowAddExamModal(false);
      setShowSuccessModal(true);

      console.log('🎉 New exam created successfully!');
    } catch (error) {
      console.error('❌ Error creating exam:', error);
      showError('পরীক্ষা তৈরি করতে ত্রুটি হয়েছে।');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">লোড হচ্ছে...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push('/admin/exams')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>পরীক্ষায় ফিরে যান</span>
          </button>
        </div>
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">পরীক্ষার ফি ম্যানেজমেন্ট</h1>
            <p className="text-gray-600 mt-1">পরীক্ষার ফি নির্ধারণ করুন এবং ক্লাস অনুযায়ী ফি ম্যানেজ করুন</p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAddExamModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>নতুন পরীক্ষা যোগ করুন</span>
            </button>
            <button
              onClick={setupComprehensiveFees}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Calculator className="w-4 h-4" />
              <span>সম্পূর্ণ ফি স্ট্রাকচার সেটআপ করুন</span>
            </button>
          </div>
        </div>
      </div>


      {/* Loading State for Classes */}
      {loadingClasses && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-600" />
          <p className="text-gray-600">ক্লাস লোড হচ্ছে...</p>
        </div>
      )}

      {/* Empty State for Classes */}
      {!loadingClasses && availableClasses.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">কোনো ক্লাস পাওয়া যায়নি</h3>
          <p className="text-gray-600 mb-4">প্রথমে ক্লাস তৈরি করুন, তারপর ফি নির্ধারণ করুন।</p>
          <button
            onClick={() => router.push('/admin/classes')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            ক্লাস তৈরি করুন
          </button>
        </div>
      )}

      {/* Exam Types with Fee Management */}
      {!loadingClasses && availableClasses.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {examTypes.map((examType) => {
            const examFeeData = getExamFeesForDisplay(examType.key);
            const isEditing = editingType === examType.key;
            const totalFees = calculateTotalFees(examType.key);
            const hasFees = Object.values(examFeeData).some(fee => fee > 0);

            return (
              <div key={examType.key} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Exam Type Header */}
                <div className="bg-gray-50 border-b border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{examType.label}</h3>
                    </div>

                    <div className="flex items-center space-x-3">

                      {isEditing ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => saveFees(examType.key)}
                            disabled={saving}
                            className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-1"
                          >
                            {saving ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            <span>সংরক্ষণ</span>
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700"
                          >
                            বাতিল
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => startEditingFees(examType.key, examType.examId)}
                            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-1"
                          >
                            <Edit className="w-4 h-4" />
                            <span>ফি সম্পাদনা</span>
                          </button>
                          {examType.exams && examType.exams.length > 0 && (
                            <button
                              onClick={() => {
                                const exam = examType.exams[0];
                                deleteExam(exam.id, exam.name);
                              }}
                              className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-1"
                              title="পরীক্ষা মুছে ফেলুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Fee Structure */}
                <div className="p-6">
                  {isEditing ? (
                    /* Edit Mode */
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-gray-900">ক্লাস অনুযায়ী ফি নির্ধারণ করুন</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {availableClasses.map((className, index) => (
                          <div key={`${className}-${index}`} className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              {className}
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">৳</span>
                              <input
                                type="number"
                                value={tempFees[className] || ''}
                                onChange={(e) => updateTempFee(className, parseInt(e.target.value) || 0)}
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="ফি পরিমাণ"
                                min="0"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Display Mode */
                    <div className="space-y-4">
                      {hasFees ? (
                        <>
                          <h4 className="text-md font-medium text-gray-900">নির্ধারিত ফি স্ট্রাকচার</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {availableClasses.map((className, index) => {
                              const fee = examFeeData[className];
                              return (
                                <div key={`${className}-${index}`} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">{className}</span>
                                    <span className={`text-sm font-bold ${fee && fee > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                      {fee && fee > 0 ? `৳${fee}` : 'নির্ধারিত নয়'}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <DollarSign className="w-6 h-6 text-gray-400" />
                          </div>
                          <h4 className="text-lg font-medium text-gray-900 mb-2">কোনো ফি নির্ধারিত নেই</h4>
                          <p className="text-gray-600">এই পরীক্ষার ধরনের জন্য এখনও কোনো ফি নির্ধারণ করা হয়নি।</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">কীভাবে কাজ করে:</h3>
        <div className="space-y-2 text-blue-800">
          <p>• প্রত্যেক পরীক্ষার ধরনের (প্রথম সাময়িক, দ্বিতীয় সাময়িক, মাসিক, বার্ষিক) জন্য আলাদাভাবে ফি নির্ধারণ করুন</p>
          <p>• প্রত্যেক ক্লাসের জন্য আলাদা ফি নির্ধারণ করতে পারবেন</p>
          <p>• ফি সংগ্রহের সময় এই নির্ধারিত ফি স্বয়ংক্রিয়ভাবে প্রযোজ্য হবে</p>
          <p>• শিক্ষার্থীদের ফি সংগ্রহ পেজে এই ফি দেখতে এবং সংগ্রহ করতে পারবেন</p>
        </div>
      </div>

      {/* Add Exam Modal */}
      <Modal
        isOpen={showAddExamModal}
        onClose={() => {
          setShowAddExamModal(false);
          setNewExamName('');
          setNewExamType('');
          setNewExamFees({});
        }}
        size="lg"
        title="নতুন পরীক্ষা যোগ করুন"
        closeOnOverlayClick={false}
      >
        <div className="space-y-6">
          {/* Exam Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              পরীক্ষার নাম *
            </label>
            <input
              type="text"
              value={newExamName}
              onChange={(e) => setNewExamName(e.target.value)}
              placeholder="যেমন: প্রথম সাময়িক পরীক্ষা ২০২৫"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Exam Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              পরীক্ষার ধরন *
            </label>
            <input
              type="text"
              value={newExamType}
              onChange={(e) => setNewExamType(e.target.value)}
              placeholder="যেমন: firstTerm, secondTerm, monthly"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              ইংরেজিতে লিখুন (firstTerm, secondTerm, thirdTerm, annual, monthly, quarterly, halfYearly)
            </p>
          </div>

          {/* Fees for Each Class */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              প্রতিটি ক্লাসের জন্য ফি নির্ধারণ করুন *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {availableClasses.map((className) => (
                <div key={className} className="space-y-1">
                  <label className="text-sm text-gray-600">{className}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">৳</span>
                    <input
                      type="number"
                      value={newExamFees[className] || ''}
                      onChange={(e) => setNewExamFees({
                        ...newExamFees,
                        [className]: parseFloat(e.target.value) || 0
                      })}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              onClick={() => {
                setShowAddExamModal(false);
                setNewExamName('');
                setNewExamType('');
                setNewExamFees({});
              }}
              disabled={saving}
              className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              বাতিল করুন
            </button>
            <button
              onClick={createNewExam}
              disabled={saving || !newExamName.trim() || !newExamType.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>পরীক্ষা তৈরি করুন</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        size="sm"
        title="সফল!"
        closeOnOverlayClick={true}
        className="text-center"
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">সফলভাবে সংরক্ষণ করা হয়েছে!</h3>
            <p className="text-gray-600">পরীক্ষা এবং ফি সফলভাবে তৈরি করা হয়েছে।</p>
          </div>
          <button
            onClick={() => setShowSuccessModal(false)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            ঠিক আছে
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default function ExamFeeManagementPageWrapper() {
  return (
    <AdminLayout title="পরীক্ষার ফি ম্যানেজমেন্ট" subtitle="পরীক্ষার ফি নির্ধারণ করুন এবং ক্লাস অনুযায়ী ফি ম্যানেজ করুন।">
      <ExamFeeManagementPage />
    </AdminLayout>
  );
}
