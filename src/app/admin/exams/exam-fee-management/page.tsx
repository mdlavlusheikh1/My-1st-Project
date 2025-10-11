'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import AdminLayout from '@/components/AdminLayout';
import Modal from '@/components/ui/modal';
import { accountingQueries } from '@/lib/database-queries';
import {
  ArrowLeft, Save, Edit, DollarSign,
  BookOpen, Loader2, CheckCircle, Calculator
} from 'lucide-react';

function ExamFeeManagementPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [actualExams, setActualExams] = useState<any[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [examFees, setExamFees] = useState<{[examType: string]: { [className: string]: number }}>({});


  const [editingType, setEditingType] = useState<string | null>(null);
  const [tempFees, setTempFees] = useState<{[className: string]: number}>({});
  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const router = useRouter();
  const schoolId = 'IQRA-202531'; // Match the actual school ID from your classes

  // Load data on component mount
  useEffect(() => {
    if (user) {
      loadClasses();
      loadActualExams();
      loadExamFees();
    }
  }, [user]);

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

  // Use actual exams from exam management page, with fallback to default types
  const examTypes = useMemo(() => {
    console.log('📋 Creating exam types from actual exams:', actualExams.length);

    if (actualExams.length > 0) {
      // Create exam types based on actual exams found
      const examTypeMap: {[key: string]: { key: string; label: string; exams: any[] }} = {};

      actualExams.forEach((exam) => {
        // Use the exam's examType as the key, or create one from the name
        let examKey = exam.examType || exam.name || 'unknown';

        // Normalize the key
        if (examKey.includes('প্রথম সাময়িক')) examKey = 'monthly';
        else if (examKey.includes('দ্বিতীয় সাময়িক')) examKey = 'quarterly';
        else if (examKey.includes('তৃতীয় সাময়িক')) examKey = 'halfYearly';
        else if (examKey.includes('বার্ষিক')) examKey = 'annual';
        else if (examKey.includes('মাসিক')) examKey = 'monthly';
        else examKey = 'monthly'; // default

        if (!examTypeMap[examKey]) {
          examTypeMap[examKey] = {
            key: examKey,
            label: exam.name || exam.examType || 'অন্যান্য পরীক্ষা',
            exams: []
          };
        }
        examTypeMap[examKey].exams.push(exam);
      });

      const mappedTypes = Object.values(examTypeMap);
      console.log('📋 Mapped exam types:', mappedTypes.map(t => ({ key: t.key, label: t.label, count: t.exams.length })));

      return mappedTypes;
    } else {
      console.log('📋 Using fallback exam types');
      return [
        { key: 'monthly', label: 'মাসিক পরীক্ষা', exams: [] },
        { key: 'quarterly', label: 'ত্রৈমাসিক পরীক্ষা', exams: [] },
        { key: 'halfYearly', label: 'অর্ধবার্ষিক পরীক্ষা', exams: [] },
        { key: 'annual', label: 'বার্ষিক পরীক্ষা', exams: [] }
      ];
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

      // Simple filtering - just check for our school ID
      const schoolExams = allExams.filter((exam: any) => exam.schoolId === schoolId);
      console.log('📋 Found', schoolExams.length, 'exams for school', schoolId);

      // If no exams for our school, try to get any exams (for debugging)
      let finalExamsData = schoolExams;
      if (schoolExams.length === 0) {
        console.log('⚠️ No exams found for school, using any available exams for testing');
        finalExamsData = allExams.slice(0, 5); // Take first 5 for testing
      }

      setActualExams(finalExamsData);
      console.log('✅ Loaded', finalExamsData.length, 'exams for fee management');

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

        // Create comprehensive sample classes for IQRA-202531 (1-12 classes)
        const sampleClasses = [
          {
            className: 'প্লে',
            section: 'এ',
            teacherName: 'শিক্ষক ১',
            academicYear: '২০২৫',
            totalStudents: 20,
            isActive: true,
            schoolId: schoolId,
            schoolName: 'ইকরা ইসলামিক স্কুল',
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
            schoolName: 'ইকরা ইসলামিক স্কুল',
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
            schoolName: 'ইকরা ইসলামিক স্কুল',
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
            schoolName: 'ইকরা ইসলামিক স্কুল',
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
            schoolName: 'ইকরা ইসলামিক স্কুল',
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
            schoolName: 'ইকরা ইসলামিক স্কুল',
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
            schoolName: 'ইকরা ইসলামিক স্কুল',
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
            schoolName: 'ইকরা ইসলামিক স্কুল',
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
            schoolName: 'ইকরা ইসলামিক স্কুল',
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
            schoolName: 'ইকরা ইসলামিক স্কুল',
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
            schoolName: 'ইকরা ইসলামিক স্কুল',
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
            schoolName: 'ইকরা ইসলামিক স্কুল',
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
            schoolName: 'ইকরা ইসলামিক স্কুল',
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
            schoolName: 'ইকরা ইসলামিক স্কুল',
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

  // Load exam fees from Firebase (only user-set fees, no sample data)
  const loadExamFees = async () => {
    try {
      const examFeesData = await accountingQueries.getExamFees(schoolId);

      // Only load existing fees, don't create sample data
      console.log('Loaded existing exam fees from Firebase:', examFeesData);

      // Filter out empty exam types (only keep types that have actual fees set)
      const filteredFees: {[examType: string]: {[className: string]: number}} = {};

      Object.entries(examFeesData).forEach(([examType, classFees]) => {
        const feesWithValues = Object.fromEntries(
          Object.entries(classFees).filter(([_, fee]) => {
            // More robust check for positive fees
            const feeValue = typeof fee === 'string' ? parseFloat(fee) : fee;
            return feeValue && feeValue > 0;
          })
        );

        // Only include exam types that have at least one fee set
        if (Object.keys(feesWithValues).length > 0) {
          filteredFees[examType] = feesWithValues;
        }
      });

      setExamFees(filteredFees);
      console.log('📊 Filtered exam fees (only user-set fees):', filteredFees);
    } catch (error) {
      console.error('Error loading exam fees from Firebase:', error);
      // Set empty fees if error
      setExamFees({});
    }
  };

  // Start editing fees for an exam type
  const startEditingFees = (examType: string) => {
    const currentFees = examFees[examType as keyof typeof examFees] || {};
    setTempFees({ ...currentFees });
    setEditingType(examType);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingType(null);
    setTempFees({});
  };

  // Update temp fee for a class
  const updateTempFee = (className: string, amount: number) => {
    setTempFees(prev => ({
      ...prev,
      [className]: amount
    }));
  };

  // Save fees for an exam type
  const saveFees = async (examType: string) => {
    setSaving(true);
    try {
      console.log('💾 Saving fees for exam type:', examType);
      console.log('📝 Temp fees to save:', tempFees);

      // Get current exam fees
      const currentExamFees = await accountingQueries.getExamFees(schoolId);
      console.log('📋 Current exam fees before save:', currentExamFees);

      // Filter out zero values before saving
      const feesToSave = Object.fromEntries(
        Object.entries(tempFees).filter(([_, fee]) => fee && fee > 0)
      );

      // Update the specific exam type with new fees (only non-zero values)
      const updatedExamFees = {
        ...currentExamFees,
        [examType]: feesToSave
      };

      console.log('📋 Updated exam fees to save:', updatedExamFees);

      // Save updated fees to Firebase
      await accountingQueries.saveExamFees(schoolId, updatedExamFees, user?.email || 'admin');
      console.log('✅ Fees saved to Firebase successfully');

      // Update local state immediately for instant UI feedback (with filtered fees)
      const localFilteredFees = {
        ...currentExamFees,
        [examType]: feesToSave
      };
      setExamFees(localFilteredFees);
      console.log('✅ Local state updated immediately with filtered fees');

      // Also reload from database to ensure consistency
      await loadExamFees();
      console.log('✅ Reloaded fees from database');

      setEditingType(null);
      setTempFees({});

      console.log('🎉 Fees saved and UI updated successfully!');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('❌ Error saving fees:', error);
      alert('ফি সংরক্ষণ করতে ত্রুটি হয়েছে।');
    } finally {
      setSaving(false);
    }
  };

  // Get exam fees for display
  const getExamFeesForDisplay = (examType: string) => {
    return examFees[examType as keyof typeof examFees] || {};
  };

  // Calculate total fees for an exam type
  const calculateTotalFees = (examType: string) => {
    const fees = getExamFeesForDisplay(examType);
    return Object.values(fees).reduce((total: number, fee) => total + (fee || 0), 0);
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">পরীক্ষার ফি ম্যানেজমেন্ট</h1>
          <p className="text-gray-600 mt-1">পরীক্ষার ফি নির্ধারণ করুন এবং ক্লাস অনুযায়ী ফি ম্যানেজ করুন</p>
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
                        <button
                          onClick={() => startEditingFees(examType.key)}
                          className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-1"
                        >
                          <Edit className="w-4 h-4" />
                          <span>ফি সম্পাদনা</span>
                        </button>
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
          <p>• প্রত্যেক পরীক্ষার ধরনের (প্রথম সাময়িক, দ্বিতীয় সাময়িক, মাসিক, বার্ষিক) জন্য আলাদাভাবে ফি নির্ধারণ করুন</p>
          <p>• প্রত্যেক ক্লাসের জন্য আলাদা ফি নির্ধারণ করতে পারবেন</p>
          <p>• ফি সংগ্রহের সময় এই নির্ধারিত ফি স্বয়ংক্রিয়ভাবে প্রযোজ্য হবে</p>
          <p>• শিক্ষার্থীদের ফি সংগ্রহ পেজে এই ফি দেখতে এবং সংগ্রহ করতে পারবেন</p>
        </div>
      </div>

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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">ফি সফলভাবে সংরক্ষণ করা হয়েছে!</h3>
            <p className="text-gray-600">আপনার পরীক্ষার ফি সেটিংস সফলভাবে আপডেট করা হয়েছে।</p>
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
