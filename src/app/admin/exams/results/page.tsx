'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import AdminLayout from '@/components/AdminLayout';
import { examResultQueries, studentQueries, classQueries, examQueries } from '@/lib/database-queries';
import { SCHOOL_ID } from '@/lib/constants';
import {
  Plus, Edit, Trash2, Eye, FileText, Upload, ArrowLeft, Download, RefreshCw, 
  Search, Filter, Calculator, Trophy, Award, Users, BookOpen, Target
} from 'lucide-react';

interface MarkEntry {
  id?: string;
  studentId: string;
  studentName: string;
  class: string;
  subject: string;
  examName: string;
  obtainedMarks: number;
  fullMarks: number;
  percentage: number;
  grade: string;
  gpa: number;
  status: 'পাস' | 'ফেল';
  remarks: string;
}

interface Student {
  id: string;
  studentId: string;
  name: string;
  class: string;
  className: string;
}

interface Class {
  id: string;
  className: string;
  section: string;
}

interface Exam {
  id: string;
  name: string;
  type: string;
}

interface StudentResult {
  student: Student;
  subjectMarks: { [key: string]: MarkEntry };
  totalMarks: number;
  totalObtainedMarks: number;
  averagePercentage: number;
  overallGrade: { grade: string; color: string };
  subjectCount: number;
  rank: number;
  status: 'পাস' | 'ফেল';
}

function ExamResultsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [markEntries, setMarkEntries] = useState<MarkEntry[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'id' | 'rank'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showRawData, setShowRawData] = useState(false);
  const [calculatedResults, setCalculatedResults] = useState<StudentResult[]>([]);
  const [isCalculated, setIsCalculated] = useState(false);
  
  const router = useRouter();
  const schoolId = SCHOOL_ID;

  // Convert English numbers to Bengali numerals
  const toBengaliNumerals = (num: number): string => {
    const englishToBengali: { [key: string]: string } = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
    };
    
    return num.toString().replace(/[0-9]/g, (digit) => englishToBengali[digit]);
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

  // Load initial data
  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  // Load all data
  const loadAllData = async () => {
    try {
      setLoading(true);
      console.log('🚀 Loading all data for results page...');
      
      await Promise.all([
        loadMarkEntries(),
        loadStudents(),
        loadClasses(),
        loadExams()
      ]);
      
      console.log('✅ All data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load mark entries from Firebase
  const loadMarkEntries = async () => {
    try {
      console.log('📊 Loading mark entries from Firebase...');
      console.log('🔍 School ID:', schoolId);
      
      const results = await examResultQueries.getAllExamResults(schoolId);
      console.log('📊 Raw Firebase results:', results);
      
      if (results && results.length > 0) {
        const convertedResults = results.map(result => ({
          id: result.id || '',
          studentId: result.studentId || '',
          studentName: result.studentName || '',
          class: result.className || result.classId || '',
          subject: result.subject || '',
          examName: result.examName || '',
          obtainedMarks: result.obtainedMarks || 0,
          fullMarks: result.totalMarks || 100,
          percentage: result.percentage || 0,
          grade: result.grade || 'F',
          gpa: result.gpa || 0,
          status: (result.percentage >= 40 ? 'পাস' : 'ফেল') as 'পাস' | 'ফেল',
          remarks: result.remarks || ''
        }));
        
        setMarkEntries(convertedResults);
        console.log('✅ Mark entries loaded:', convertedResults.length);
      } else {
        console.log('⚠️ No mark entries found in Firebase');
        setMarkEntries([]);
      }
    } catch (error) {
      console.error('❌ Error loading mark entries:', error);
      setMarkEntries([]);
    }
  };

  // Load students
  const loadStudents = async () => {
    try {
      console.log('👥 Loading students...');
      const studentsData = await studentQueries.getStudentsBySchool(schoolId);
      
      if (studentsData && studentsData.length > 0) {
        const convertedStudents = studentsData.map(student => ({
          id: (student as any).id || student.uid || '',
          studentId: (student as any).studentId || student.uid || '',
          name: student.name || student.displayName || (student as any).fullName || '',
          class: (student as any).class || (student as any).className || '',
          className: (student as any).className || (student as any).class || ''
        }));
        
        setStudents(convertedStudents);
        console.log('✅ Students loaded:', convertedStudents.length);
      } else {
        console.log('⚠️ No students found, creating sample data...');
        const sampleStudents = createSampleStudents();
        setStudents(sampleStudents);
      }
    } catch (error) {
      console.error('❌ Error loading students:', error);
      const sampleStudents = createSampleStudents();
      setStudents(sampleStudents);
    }
  };

  // Load classes
  const loadClasses = async () => {
    try {
      console.log('🏫 Loading classes...');
      const classesData = await classQueries.getClassesBySchool(schoolId);
      
      if (classesData && classesData.length > 0) {
        const convertedClasses = classesData.map(cls => ({
          id: cls.id || '',
          className: cls.className || '',
          section: cls.section || 'A'
        }));
        setClasses(convertedClasses);
        console.log('✅ Classes loaded:', convertedClasses.length);
      } else {
        console.log('⚠️ No classes found, creating sample data...');
        const sampleClasses = createSampleClasses();
        setClasses(sampleClasses);
      }
    } catch (error) {
      console.error('❌ Error loading classes:', error);
      const sampleClasses = createSampleClasses();
      setClasses(sampleClasses);
    }
  };

  // Load exams
  const loadExams = async () => {
    try {
      console.log('📝 Loading exams...');
      const examsData = await examQueries.getAllExams(schoolId);
      
      if (examsData && examsData.length > 0) {
        const convertedExams = examsData.map(exam => ({
          id: exam.id || '',
          name: exam.name || '',
          type: (exam as any).type || 'monthly'
        }));
        setExams(convertedExams);
        console.log('✅ Exams loaded:', convertedExams.length);
      } else {
        console.log('⚠️ No exams found, creating sample data...');
        const sampleExams = createSampleExams();
        setExams(sampleExams);
      }
    } catch (error) {
      console.error('❌ Error loading exams:', error);
      const sampleExams = createSampleExams();
      setExams(sampleExams);
    }
  };

  // Create sample students
  const createSampleStudents = (): Student[] => {
    return [
      { id: 'STD001', studentId: 'STD001', name: 'সালমা বেগম', class: 'প্লে', className: 'প্লে' },
      { id: 'STD002', studentId: 'STD002', name: 'রাহিম হোসেন', class: 'প্লে', className: 'প্লে' },
      { id: 'STD003', studentId: 'STD003', name: 'ফাতেমা আক্তার', class: 'প্লে', className: 'প্লে' },
      { id: 'STD004', studentId: 'STD004', name: 'আব্দুল্লাহ আল মামুন', class: 'প্লে', className: 'প্লে' },
      { id: 'STD005', studentId: 'STD005', name: 'নাজমা খাতুন', class: 'প্লে', className: 'প্লে' },
      { id: 'STD006', studentId: 'STD006', name: 'মরুশিদা খাতুন', class: 'প্লে', className: 'প্লে' },
      { id: 'STD007', studentId: 'STD007', name: 'সাথী বেগম', class: 'প্লে', className: 'প্লে' },
      { id: 'STD008', studentId: 'STD008', name: 'ইতি খাতুন', class: 'প্লে', className: 'প্লে' }
    ];
  };

  // Create sample classes
  const createSampleClasses = (): Class[] => {
    return [
      { id: 'class1', className: 'প্লে', section: 'A' },
      { id: 'class2', className: 'প্রথম', section: 'A' },
      { id: 'class3', className: 'দ্বিতীয়', section: 'A' },
      { id: 'class4', className: 'তৃতীয়', section: 'A' }
    ];
  };

  // Create sample exams
  const createSampleExams = (): Exam[] => {
    return [
      { id: 'exam1', name: 'প্রথম', type: 'monthly' },
      { id: 'exam2', name: 'দ্বিতীয়', type: 'monthly' },
      { id: 'exam3', name: 'বার্ষিক', type: 'annual' }
    ];
  };

  // Create sample mark entries
  const createSampleMarkEntries = (): MarkEntry[] => {
    return [
      { id: '1', studentId: 'STD001', studentName: 'সালমা বেগম', class: 'প্লে', subject: 'ইংরেজি', examName: 'বার্ষিক', obtainedMarks: 100, fullMarks: 100, percentage: 100, grade: 'A+', gpa: 4.0, status: 'পাস', remarks: 'সফল' },
      { id: '2', studentId: 'STD002', studentName: 'রাহিম হোসেন', class: 'প্লে', subject: 'ইংরেজি', examName: 'বার্ষিক', obtainedMarks: 9, fullMarks: 100, percentage: 9, grade: 'F', gpa: 0.0, status: 'ফেল', remarks: 'অনুত্তীর্ণ' },
      { id: '3', studentId: 'STD003', studentName: 'ফাতেমা আক্তার', class: 'প্লে', subject: 'ইংরেজি', examName: 'বার্ষিক', obtainedMarks: 99, fullMarks: 100, percentage: 99, grade: 'A+', gpa: 4.0, status: 'পাস', remarks: 'সফল' },
      { id: '4', studentId: 'STD004', studentName: 'আব্দুল্লাহ আল মামুন', class: 'প্লে', subject: 'ইংরেজি', examName: 'বার্ষিক', obtainedMarks: 95, fullMarks: 100, percentage: 95, grade: 'A+', gpa: 4.0, status: 'পাস', remarks: 'সফল' },
      { id: '5', studentId: 'STD005', studentName: 'নাজমা খাতুন', class: 'প্লে', subject: 'ইংরেজি', examName: 'বার্ষিক', obtainedMarks: 58, fullMarks: 100, percentage: 58, grade: 'C+', gpa: 2.3, status: 'পাস', remarks: 'সফল' },
      { id: '6', studentId: 'STD006', studentName: 'মরুশিদা খাতুন', class: 'প্লে', subject: 'ইংরেজি', examName: 'বার্ষিক', obtainedMarks: 85, fullMarks: 100, percentage: 85, grade: 'A', gpa: 3.7, status: 'পাস', remarks: 'সফল' },
      { id: '7', studentId: 'STD007', studentName: 'সাথী বেগম', class: 'প্লে', subject: 'ইংরেজি', examName: 'বার্ষিক', obtainedMarks: 25, fullMarks: 100, percentage: 25, grade: 'F', gpa: 0.0, status: 'ফেল', remarks: 'অনুত্তীর্ণ' },
      { id: '8', studentId: 'STD008', studentName: 'ইতি খাতুন', class: 'প্লে', subject: 'ইংরেজি', examName: 'বার্ষিক', obtainedMarks: 7, fullMarks: 100, percentage: 7, grade: 'F', gpa: 0.0, status: 'ফেল', remarks: 'অনুত্তীর্ণ' }
    ];
  };

  // Get all unique subjects from mark entries
  const getAllSubjects = (): string[] => {
    const subjects = new Set<string>();
    markEntries.forEach(entry => {
      if (entry.subject) {
        subjects.add(entry.subject);
      }
    });
    return Array.from(subjects).sort();
  };

  // Filter students based on selected class
  const getFilteredStudents = (): Student[] => {
    let filtered = students;
    
    // Filter by class
    if (selectedClass) {
      filtered = filtered.filter(student => {
        const studentClass = student.class || student.className || '';
        return studentClass === selectedClass || 
               studentClass.includes(selectedClass) || 
               selectedClass.includes(studentClass);
      });
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  // Calculate student results with marks
  const calculateStudentResults = (student: Student): StudentResult => {
    const studentMarks = markEntries.filter(entry => 
      entry.studentId === student.studentId &&
      (!selectedExam || entry.examName === selectedExam)
    );

    const subjects = getAllSubjects();
    const subjectMarks: { [key: string]: MarkEntry } = {};
    let totalMarks = 0;
    let totalObtainedMarks = 0;
    let subjectCount = 0;

    subjects.forEach(subject => {
      const subjectEntry = studentMarks.find(entry => 
        entry.subject === subject &&
        (!selectedSubject || entry.subject === selectedSubject)
      );
      
      if (subjectEntry) {
        subjectMarks[subject] = subjectEntry;
        totalMarks += subjectEntry.fullMarks;
        totalObtainedMarks += subjectEntry.obtainedMarks;
        subjectCount++;
      }
    });

    const averagePercentage = subjectCount > 0 ? Math.round((totalObtainedMarks / totalMarks) * 100) : 0;
    const overallGrade = calculateOverallGrade(averagePercentage);
    const status = averagePercentage >= 40 ? 'পাস' : 'ফেল';

    return {
      student,
      subjectMarks,
      totalMarks,
      totalObtainedMarks,
      averagePercentage,
      overallGrade,
      subjectCount,
      rank: 0, // Will be calculated later
      status
    };
  };

  // Calculate overall grade
  const calculateOverallGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A+', color: 'bg-green-100 text-green-800' };
    if (percentage >= 80) return { grade: 'A', color: 'bg-green-100 text-green-800' };
    if (percentage >= 70) return { grade: 'B+', color: 'bg-blue-100 text-blue-800' };
    if (percentage >= 60) return { grade: 'B', color: 'bg-blue-100 text-blue-800' };
    if (percentage >= 50) return { grade: 'C+', color: 'bg-yellow-100 text-yellow-800' };
    if (percentage >= 40) return { grade: 'C', color: 'bg-yellow-100 text-yellow-800' };
    if (percentage >= 33) return { grade: 'D', color: 'bg-orange-100 text-orange-800' };
    return { grade: 'F', color: 'bg-red-100 text-red-800' };
  };

  // Calculate results for selected class
  const calculateResults = () => {
    console.log('🧮 Calculating results...');
    console.log('🔍 Selected class:', selectedClass);
    console.log('🔍 Selected exam:', selectedExam);
    console.log('🔍 Selected subject:', selectedSubject);
    
    const filteredStudents = getFilteredStudents();
    console.log('🔍 Filtered students:', filteredStudents.length);
    
    const subjects = getAllSubjects();
    console.log('🔍 Available subjects:', subjects);
    
    // Calculate results for each student
    let studentResults = filteredStudents.map(student => calculateStudentResults(student));
    
    // Sort by total obtained marks (descending) for ranking
    studentResults.sort((a, b) => b.totalObtainedMarks - a.totalObtainedMarks);
    
    // Assign ranks
    studentResults.forEach((result, index) => {
      result.rank = index + 1;
    });
    
    // Apply final sorting based on user selection
    if (sortBy === 'name') {
      studentResults.sort((a, b) => {
        const aValue = a.student.name;
        const bValue = b.student.name;
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      });
    } else if (sortBy === 'id') {
      studentResults.sort((a, b) => {
        const aValue = a.student.studentId;
        const bValue = b.student.studentId;
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      });
    } else if (sortBy === 'rank') {
      studentResults.sort((a, b) => {
        return sortOrder === 'asc' ? a.rank - b.rank : b.rank - a.rank;
      });
    }
    
    setCalculatedResults(studentResults);
    setIsCalculated(true);
    
    console.log('✅ Results calculated:', studentResults.length);
    console.log('📊 Sample calculated results:', studentResults.slice(0, 3));
  };

  // Get display data
  const getDisplayData = () => {
    const filteredStudents = getFilteredStudents();
    const subjects = getAllSubjects();
    
    return { 
      studentsWithResults: isCalculated ? calculatedResults : [], 
      subjects,
      filteredStudents 
    };
  };

  const { studentsWithResults, subjects, filteredStudents } = getDisplayData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">লোড হচ্ছে...</span>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <button
                  onClick={() => router.push('/admin/exams')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>পিছনে যান</span>
                </button>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">পরীক্ষার ফলাফল</h1>
              <p className="text-gray-600">শিক্ষার্থীদের পরীক্ষার ফলাফল দেখুন এবং র্যাঙ্কিং করুন</p>
            </div>

            <div className="flex items-center space-x-3">
              <button 
                onClick={loadAllData}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>ডেটা রিফ্রেশ করুন</span>
              </button>
              <button 
                onClick={() => {
                  console.log('🧪 Loading sample data for testing...');
                  const sampleStudents = createSampleStudents();
                  const sampleClasses = createSampleClasses();
                  const sampleExams = createSampleExams();
                  const sampleMarkEntries = createSampleMarkEntries();
                  
                  setStudents(sampleStudents);
                  setClasses(sampleClasses);
                  setExams(sampleExams);
                  setMarkEntries(sampleMarkEntries);
                  
                  console.log('✅ Sample data loaded');
                }}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>স্যাম্পল ডেটা লোড করুন</span>
              </button>
              <button 
                onClick={() => router.push('/admin/exams/mark-entry')}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন মার্ক যোগ করুন</span>
              </button>
            </div>
          </div>
        </div>

        {/* Data Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">ডেটা লোডিং তথ্য</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">মার্ক এন্ট্রি:</span>
              <span className={`font-medium ${markEntries.length > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {markEntries.length} {markEntries.length > 0 ? '✅' : '❌'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">শিক্ষার্থী:</span>
              <span className={`font-medium ${students.length > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {students.length} {students.length > 0 ? '✅' : '❌'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">ক্লাস:</span>
              <span className={`font-medium ${classes.length > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {classes.length} {classes.length > 0 ? '✅' : '❌'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">পরীক্ষা:</span>
              <span className={`font-medium ${exams.length > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {exams.length} {exams.length > 0 ? '✅' : '❌'}
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">ফিল্টার</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ক্লাস নির্বাচন করুন</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">সকল ক্লাস</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.className}>
                    {cls.className}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">পরীক্ষা নির্বাচন করুন</label>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">সকল পরীক্ষা</option>
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.name}>
                    {exam.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">বিষয় নির্বাচন করুন</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">সকল বিষয়</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Calculate Button */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">ফলাফল গণনা</h3>
              <p className="text-gray-600">নির্বাচিত ক্লাসের ফলাফল গণনা করুন এবং র্যাঙ্কিং দেখুন</p>
            </div>
            <button
              onClick={calculateResults}
              disabled={!selectedClass}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Calculator className="w-5 h-5" />
              <span>ফলাফল গণনা করুন</span>
            </button>
          </div>
        </div>

        {/* Search and Sort */}
        {isCalculated && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="শিক্ষার্থী খুঁজুন..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">সাজান:</label>
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const value = e.target.value;
                      const [newSortBy, newSortOrder] = value.split('-');
                      setSortBy(newSortBy as 'name' | 'id' | 'rank');
                      setSortOrder(newSortOrder as 'asc' | 'desc');
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="rank-asc">র্যাঙ্ক (১-১০)</option>
                    <option value="rank-desc">র্যাঙ্ক (১০-১)</option>
                    <option value="name-asc">নাম (A-Z)</option>
                    <option value="name-desc">নাম (Z-A)</option>
                    <option value="id-asc">আইডি (A-Z)</option>
                    <option value="id-desc">আইডি (Z-A)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Table */}
        {isCalculated && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">ফলাফল তালিকা</h3>
              <p className="text-sm text-gray-600 mt-1">
                {studentsWithResults.length} জন শিক্ষার্থীর ফলাফল
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      র্যাঙ্ক
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      আইডি
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      শিক্ষার্থী
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ক্লাস
                    </th>
                    {subjects.map((subject) => (
                      <th key={subject} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {subject}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      মোট নম্বর
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      শতাংশ
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      গ্রেড
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      অবস্থা
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {studentsWithResults.length === 0 ? (
                    <tr>
                      <td colSpan={8 + subjects.length} className="px-6 py-12 text-center">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">কোনো ফলাফল পাওয়া যায়নি</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          অনুগ্রহ করে ক্লাস নির্বাচন করে "ফলাফল গণনা করুন" বাটন ক্লিক করুন
                        </p>
                      </td>
                    </tr>
                  ) : (
                    studentsWithResults.map((result, index) => (
                      <tr key={result.student.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center">
                            {result.rank <= 3 ? (
                              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                result.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                                result.rank === 2 ? 'bg-gray-100 text-gray-800' :
                                'bg-orange-100 text-orange-800'
                              }`}>
                                <Trophy className="w-4 h-4" />
                              </div>
                            ) : (
                              <span className="text-sm font-medium text-gray-900">
                                {toBengaliNumerals(result.rank)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {result.student.studentId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{result.student.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.student.class}
                        </td>
                        {subjects.map((subject) => {
                          const subjectEntry = result.subjectMarks[subject];
                          return (
                            <td key={subject} className="px-4 py-4 whitespace-nowrap text-center text-sm">
                              {subjectEntry ? (
                                <div className="text-gray-900 font-medium">
                                  {toBengaliNumerals(subjectEntry.obtainedMarks)}
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                          {result.subjectCount > 0 ? (
                            <div>
                              <div className="font-medium">
                                {toBengaliNumerals(result.totalObtainedMarks)}/{toBengaliNumerals(result.totalMarks)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                          {result.subjectCount > 0 ? (
                            <div className="font-medium">
                              {toBengaliNumerals(result.averagePercentage)}%
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          {result.subjectCount > 0 ? (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${result.overallGrade.color}`}>
                              {result.overallGrade.grade}
                            </span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          {result.subjectCount > 0 ? (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              result.status === 'পাস' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {result.status}
                            </span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!isCalculated && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-blue-900">ফলাফল গণনা করুন</h3>
                <p className="mt-1 text-blue-700">
                  ফলাফল দেখতে অনুগ্রহ করে একটি ক্লাস নির্বাচন করুন এবং "ফলাফল গণনা করুন" বাটন ক্লিক করুন।
                </p>
                <div className="mt-3 space-y-2 text-sm text-blue-600">
                  <div className="flex items-center space-x-2">
                    <span>1.</span>
                    <span>ক্লাস নির্বাচন করুন</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>2.</span>
                    <span>"ফলাফল গণনা করুন" বাটন ক্লিক করুন</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>3.</span>
                    <span>র্যাঙ্কিং এবং ফলাফল দেখুন</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default ExamResultsPage;
