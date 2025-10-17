'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { subjectQueries, Subject, examQueries, examSubjectQueries, examResultQueries, studentQueries } from '@/lib/database-queries';
import { SCHOOL_ID } from '@/lib/constants';
import {
  Plus, Edit, Trash2, Eye, FileText, Upload, ArrowLeft, Download
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
  status: 'পাস' | 'ফেল';
  entryDate: string;
  enteredBy: string;
}

function MarkEntryPage() {
  const [markEntries, setMarkEntries] = useState<MarkEntry[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [availableExams, setAvailableExams] = useState<any[]>([]);
  const [examSubjects, setExamSubjects] = useState<any[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'id'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [newEntry, setNewEntry] = useState({
    studentId: '',
    studentName: '',
    class: '',
    subject: '',
    examName: '',
    obtainedMarks: 0,
    fullMarks: 100
  });
  const router = useRouter();
  const schoolId = SCHOOL_ID;

  // Real-time data will be loaded from Firebase

  // Load real-time data from Firebase
  useEffect(() => {
    loadSubjects();
    loadExams();
    loadStudents();
    loadClasses();
    loadAllExamResults();
  }, []);

  // Auto-load exam subjects when exam is selected
  useEffect(() => {
    if (selectedExam && availableExams.length > 0) {
      const selectedExamData = availableExams.find(exam => exam.name === selectedExam);
      if (selectedExamData) {
        console.log('🔄 Auto-loading exam subjects for:', selectedExam, 'Exam ID:', selectedExamData.id || selectedExamData.examId);
        loadExamSubjects(selectedExamData.id || selectedExamData.examId);
      }
    }
  }, [selectedExam, availableExams]);

  // Debug: Log exam subjects when they change
  useEffect(() => {
    console.log('📋 Exam subjects updated:', examSubjects.length, 'subjects');
    examSubjects.forEach((subject, index) => {
      console.log(`  ${index + 1}. ${subject.subjectName || subject.subject} (${subject.subjectCode || 'no code'}) - Class: ${subject.className || subject.class || 'no class'}`);
    });
  }, [examSubjects]);

  // Reset subject selection when class or exam changes
  useEffect(() => {
    if (selectedClass || selectedExam) {
      setSelectedSubject('');
      console.log('🔄 Reset subject selection due to class/exam change');
    }
  }, [selectedClass, selectedExam]);

  // Focus on obtained marks input when modal opens
  useEffect(() => {
    if (showAddModal) {
      setTimeout(() => {
        const input = document.getElementById('obtained-marks-input') as HTMLInputElement;
        if (input) {
          input.focus();
          input.select();
          console.log('🎯 Initial focus on obtained marks input');
        }
      }, 200);
    }
  }, [showAddModal]);

  // Get filtered subjects based on selected class
  const getFilteredSubjects = () => {
    if (!selectedClass) {
      return allSubjects;
    }

    // Filter subjects that are assigned to the selected class
    return allSubjects.filter(subject => {
      return subject.classes?.includes(selectedClass);
    });
  };

  // Load subjects from Firebase
  const loadSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const subjectsData = await subjectQueries.getActiveSubjects(schoolId);
      setAllSubjects(subjectsData);
    } catch (error) {
      console.error('Error loading subjects:', error);
    } finally {
      setLoadingSubjects(false);
    }
  };

  // Load classes from Firebase
  const loadClasses = async () => {
    try {
      setLoadingClasses(true);
      const { collection, getDocs, addDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');

      const classesSnapshot = await getDocs(collection(db, 'classes'));
      const classesData: any[] = [];

      classesSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('📚 Raw class document:', doc.id, data);
        
        // Try multiple possible field names for class name
        const possibleClassNames = [
          data.className, 
          data.name, 
          data.class, 
          data.title, 
          data.label,
          data.displayName,
          data.class_name
        ].filter(name => name && name.trim());
        
        const className = possibleClassNames[0] || `Class ${doc.id}`;
        
        console.log('🎯 Class name options:', possibleClassNames, 'Selected:', className);
        
        classesData.push({
          id: doc.id,
          classId: data.classId || data.id || doc.id,
          className: className,
          section: data.section || data.division || 'এ',
          originalData: data // Keep original data for debugging
        });
      });

      // If no classes found, create sample classes
      if (classesData.length === 0) {
        console.log('No classes found, creating sample classes...');
        await createSampleClasses();
        // Reload classes after creating samples
        const newClassesSnapshot = await getDocs(collection(db, 'classes'));
        newClassesSnapshot.forEach((doc) => {
          const data = doc.data();
          const possibleClassNames = [
            data.className, 
            data.name, 
            data.class, 
            data.title, 
            data.label,
            data.displayName,
            data.class_name
          ].filter(name => name && name.trim());
          
          const className = possibleClassNames[0] || `Class ${doc.id}`;
          
          classesData.push({
            id: doc.id,
            classId: data.classId || data.id || doc.id,
            className: className,
            section: data.section || data.division || 'এ',
            originalData: data
          });
        });
      }

      console.log('✅ Processed classes data:', classesData);
      setAvailableClasses(classesData);
      console.log('✅ Loaded classes:', classesData);
    } catch (error) {
      console.error('Error loading classes:', error);
      setAvailableClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  // Create sample classes for testing
  const createSampleClasses = async () => {
    try {
      console.log('🔄 Creating sample classes...');
      const { collection, addDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');

      const sampleClasses = [
        {
          className: 'প্লে',
          section: 'এ',
          schoolId,
          createdBy: 'admin',
          isActive: true
        },
        {
          className: 'প্রথম',
          section: 'এ',
          schoolId,
          createdBy: 'admin',
          isActive: true
        },
        {
          className: 'দ্বিতীয়',
          section: 'এ',
          schoolId,
          createdBy: 'admin',
          isActive: true
        },
        {
          className: 'তৃতীয়',
          section: 'এ',
          schoolId,
          createdBy: 'admin',
          isActive: true
        }
      ];

      for (const classData of sampleClasses) {
        await addDoc(collection(db, 'classes'), classData);
      }

      console.log('✅ Sample classes created successfully');
    } catch (error) {
      console.error('❌ Error creating sample classes:', error);
    }
  };

  // Load exams from Firebase
  const loadExams = async () => {
    try {
      setLoadingExams(true);
      const examsData = await examQueries.getAllExams(schoolId);
      setAvailableExams(examsData);
      console.log('✅ Loaded exams for mark entry:', examsData);
    } catch (error) {
      console.error('Error loading exams:', error);
    } finally {
      setLoadingExams(false);
    }
  };

  // Load exam subjects when exam is selected
  const loadExamSubjects = async (examId: string) => {
    try {
      const examSubjectsData = await examSubjectQueries.getExamSubjects(examId);
      setExamSubjects(examSubjectsData);
      console.log('✅ Loaded exam subjects:', examSubjectsData);
    } catch (error) {
      console.error('Error loading exam subjects:', error);
      setExamSubjects([]);
    }
  };

  // Load students from Firebase
  const loadStudents = async () => {
    try {
      setLoadingStudents(true);
      const studentsData = await studentQueries.getAllStudents();
      console.log('📚 Raw students data:', studentsData);
      setStudents(studentsData);
      console.log('✅ Loaded students:', studentsData.length);
      
      // If no students found, create some sample students
      if (studentsData.length === 0) {
        console.log('No students found, creating sample students...');
        await createSampleStudents();
      }
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoadingStudents(false);
    }
  };


  // Create sample students for testing
  const createSampleStudents = async () => {
    try {
      console.log('🔄 Creating sample students...');

      const sampleStudents = [
        {
          uid: 'STD001',
          name: 'মোঃ রাহিম হোসেন',
          email: 'rahim@example.com',
          role: 'student' as const,
          class: 'প্রথম',
          studentId: 'STD001',
          roll: '001',
          schoolId,
          isActive: true
        },
        {
          uid: 'STD002',
          name: 'ফাতেমা আক্তার',
          email: 'fatema@example.com',
          role: 'student' as const,
          class: 'প্রথম',
          studentId: 'STD002',
          roll: '002',
          schoolId,
          isActive: true
        },
        {
          uid: 'STD003',
          name: 'আব্দুল্লাহ আল মামুন',
          email: 'abdullah@example.com',
          role: 'student' as const,
          class: 'দ্বিতীয়',
          studentId: 'STD003',
          roll: '003',
          schoolId,
          isActive: true
        },
        {
          uid: 'STD004',
          name: 'আয়েশা সিদ্দিকা',
          email: 'ayesha@example.com',
          role: 'student' as const,
          class: 'তৃতীয়',
          studentId: 'STD004',
          roll: '004',
          schoolId,
          isActive: true
        },
        // Add students for "প্লে" class
        {
          uid: 'STD005',
          name: 'আহমেদ হাসান',
          email: 'ahmed@example.com',
          role: 'student' as const,
          class: 'প্লে',
          studentId: 'STD005',
          roll: '005',
          schoolId,
          isActive: true
        },
        {
          uid: 'STD006',
          name: 'নাজমা খাতুন',
          email: 'nazma@example.com',
          role: 'student' as const,
          class: 'প্লে',
          studentId: 'STD006',
          roll: '006',
          schoolId,
          isActive: true
        },
        {
          uid: 'STD007',
          name: 'করিম উদ্দিন',
          email: 'karim@example.com',
          role: 'student' as const,
          class: 'প্লে',
          studentId: 'STD007',
          roll: '007',
          schoolId,
          isActive: true
        }
      ];

      // Create each sample student
      for (const student of sampleStudents) {
        await studentQueries.createStudent(student);
      }

      console.log('✅ Sample students created successfully');

      // Reload students
      const studentsData = await studentQueries.getAllStudents();
      setStudents(studentsData);
    } catch (error) {
      console.error('❌ Error creating sample students:', error);
    }
  };

  // Create sample exam for testing
  const createSampleExam = async () => {
    try {
      console.log('🔄 Creating sample exam...');

      const sampleExam = {
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
      };

      await examQueries.createExam(sampleExam);
      console.log('✅ Sample exam created successfully');

      // Reload exams
      const examsData = await examQueries.getAllExams(schoolId);
      setAvailableExams(examsData);
    } catch (error) {
      console.error('❌ Error creating sample exam:', error);
    }
  };

  // Create sample mark entries for testing
  const createSampleMarkEntries = async () => {
    try {
      console.log('🔄 Creating sample mark entries...');

      // First ensure we have students and exams
      if (students.length === 0) {
        await createSampleStudents();
      }

      if (availableExams.length === 0) {
        await createSampleExam();
      }

      // Get the first exam and students
      const exam = availableExams[0] || await examQueries.getAllExams(schoolId).then(exams => exams[0]);
      const examStudents = students.slice(0, 2); // Take first 2 students

      if (!exam || examStudents.length === 0) {
        console.log('⚠️ Cannot create sample mark entries: missing exam or students');
        return;
      }

      // Create sample mark entries
      const sampleEntries = [
        {
          studentId: examStudents[0]?.studentId || examStudents[0]?.uid || 'STD001',
          studentName: examStudents[0]?.name || examStudents[0]?.displayName || 'মোঃ রাহিম হোসেন',
          studentRoll: examStudents[0]?.studentId || examStudents[0]?.uid || 'STD001',
          classId: examStudents[0]?.class || 'প্রথম',
          className: examStudents[0]?.class || 'প্রথম',
          subject: 'গণিত',
          examId: exam.id || exam.examId,
          examName: exam.name || 'প্রথম সাময়িক পরীক্ষা',
          obtainedMarks: 85,
          totalMarks: 100,
          percentage: 85,
          grade: 'A',
          isAbsent: false,
          schoolId,
          enteredBy: 'admin'
        },
        {
          studentId: examStudents[1]?.studentId || examStudents[1]?.uid || 'STD002',
          studentName: examStudents[1]?.name || examStudents[1]?.displayName || 'ফাতেমা আক্তার',
          studentRoll: examStudents[1]?.studentId || examStudents[1]?.uid || 'STD002',
          classId: examStudents[1]?.class || 'প্রথম',
          className: examStudents[1]?.class || 'প্রথম',
          subject: 'গণিত',
          examId: exam.id || exam.examId,
          examName: exam.name || 'প্রথম সাময়িক পরীক্ষা',
          obtainedMarks: 72,
          totalMarks: 100,
          percentage: 72,
          grade: 'B+',
          isAbsent: false,
          schoolId,
          enteredBy: 'admin'
        }
      ];

      // Save sample entries
      for (const entry of sampleEntries) {
        await examResultQueries.saveExamResult(entry);
      }

      console.log('✅ Sample mark entries created successfully');

      // Reload all exam results to show the new entries
      await loadAllExamResults();
    } catch (error) {
      console.error('❌ Error creating sample mark entries:', error);
    }
  };

  // Load all exam results from Firebase
  const loadAllExamResults = async () => {
    try {
      setLoadingResults(true);

      // Get all exams for this school first
      const exams = await examQueries.getAllExams(schoolId);
      console.log('📚 Available exams:', exams.length);

      if (exams.length === 0) {
        console.log('⚠️ No exams found, creating sample exam for testing...');
        await createSampleExam();
        // Reload exams after creating sample
        const updatedExams = await examQueries.getAllExams(schoolId);
        exams.push(...updatedExams);
      }

      const results: MarkEntry[] = [];

      // Get results for each exam
      for (const exam of exams) {
        try {
          const examResults = await examResultQueries.getExamResults(exam.id!);
          console.log(`📊 Results for ${exam.name}:`, examResults.length);

          // Convert exam results to mark entries format
          examResults.forEach((result) => {
            results.push({
              id: result.id,
              studentId: result.studentId || '',
              studentName: result.studentName || '',
              class: result.className || result.classId || exam.class || '',
              subject: result.subject || '',
              examName: result.examName || exam.name || '',
              obtainedMarks: result.obtainedMarks || 0,
              fullMarks: result.totalMarks || 100,
              percentage: result.percentage || 0,
              grade: result.grade || '',
              status: result.percentage >= 40 ? 'পাস' : 'ফেল',
              entryDate: result.enteredAt?.toDate?.()?.toISOString() || new Date().toISOString(),
              enteredBy: result.enteredBy || 'admin'
            });
          });
        } catch (error) {
          console.error(`❌ Error loading results for exam ${exam.name}:`, error);
        }
      }

      // Also try to get results using direct Firebase query as backup
      try {
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');

        const q = query(
          collection(db, 'examResults'),
          where('schoolId', '==', schoolId)
        );

        const snapshot = await getDocs(q);

        snapshot.forEach((doc) => {
          const data = doc.data();
          console.log('📄 Direct Firebase result:', doc.id, data);

          // Check if this result is already in our results array
          const exists = results.some(r => r.id === doc.id);
          if (!exists) {
            results.push({
              id: doc.id,
              studentId: data.studentId || '',
              studentName: data.studentName || '',
              class: data.className || data.classId || data.class || '',
              subject: data.subject || '',
              examName: data.examName || '',
              obtainedMarks: data.obtainedMarks || 0,
              fullMarks: data.totalMarks || data.fullMarks || 100,
              percentage: data.percentage || 0,
              grade: data.grade || '',
              status: data.status || (data.percentage >= 40 ? 'পাস' : 'ফেল'),
              entryDate: data.enteredAt?.toDate?.()?.toISOString() || new Date().toISOString(),
              enteredBy: data.enteredBy || 'admin'
            });
          }
        });
      } catch (firebaseError) {
        console.error('❌ Error with direct Firebase query:', firebaseError);
      }

      setMarkEntries(results);
      console.log('✅ Total mark entries loaded:', results.length);

      // If no results found, create sample data for testing
      if (results.length === 0) {
        console.log('⚠️ No mark entries found, creating sample data...');
        await createSampleMarkEntries();
      }
    } catch (error) {
      console.error('❌ Error loading exam results:', error);
      setMarkEntries([]);
    } finally {
      setLoadingResults(false);
    }
  };

  // Handle exam selection
  const handleExamSelection = (examName: string) => {
    setSelectedExam(examName);
    const selectedExamData = availableExams.find(exam => exam.name === examName);
    if (selectedExamData) {
      console.log('🎯 Selected exam:', examName, 'ID:', selectedExamData.id || selectedExamData.examId);
      loadExamSubjects(selectedExamData.id || selectedExamData.examId);
    } else {
      console.log('⚠️ No exam data found for:', examName);
      setExamSubjects([]);
    }
  };

  // Convert English numbers to Bengali numerals
  const toBengaliNumerals = (num: number): string => {
    const englishToBengali: { [key: string]: string } = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
    };
    
    return num.toString().replace(/[0-9]/g, (digit) => englishToBengali[digit]);
  };

  // Calculate grade, percentage and GPA
  const calculateGrade = (marks: number, fullMarks: number) => {
    const percentage = (marks / fullMarks) * 100;
    const roundedPercentage = Math.round(percentage);
    
    if (percentage >= 90) return { grade: 'A+', percentage: roundedPercentage, gpa: 4.0 };
    if (percentage >= 80) return { grade: 'A', percentage: roundedPercentage, gpa: 3.7 };
    if (percentage >= 70) return { grade: 'B+', percentage: roundedPercentage, gpa: 3.3 };
    if (percentage >= 60) return { grade: 'B', percentage: roundedPercentage, gpa: 3.0 };
    if (percentage >= 50) return { grade: 'C+', percentage: roundedPercentage, gpa: 2.7 };
    if (percentage >= 40) return { grade: 'C', percentage: roundedPercentage, gpa: 2.3 };
    if (percentage >= 33) return { grade: 'D', percentage: roundedPercentage, gpa: 2.0 };
    return { grade: 'F', percentage: roundedPercentage, gpa: 0.0 };
  };

  // Save entry without showing success modal (for next student flow)
  const saveEntrySilently = async () => {
    if (!newEntry.studentId || !newEntry.studentName) {
      console.log('❌ Cannot save: Missing student info');
      return false;
    }

    if (newEntry.obtainedMarks > newEntry.fullMarks) {
      console.log('❌ Cannot save: Obtained marks exceed total marks');
      return false;
    }

    try {
      setSaving(true);
      console.log('💾 Saving marks for student:', newEntry.studentName, 'Marks:', newEntry.obtainedMarks);
      
      const { grade, percentage, gpa } = calculateGrade(newEntry.obtainedMarks, newEntry.fullMarks);
      const status = percentage >= 40 ? 'পাস' : 'ফেল';

      // Find the selected exam to get examId
      const selectedExamData = availableExams.find(exam => exam.name === newEntry.examName);
      if (!selectedExamData) {
        console.log('❌ Cannot save: Exam data not found');
        return false;
      }

      // Save to Firebase using examResultQueries
      const resultData = {
        studentId: newEntry.studentId,
        studentName: newEntry.studentName,
        studentRoll: newEntry.studentId,
        classId: newEntry.class,
        className: newEntry.class,
        subject: newEntry.subject,
        examId: selectedExamData.id || selectedExamData.examId,
        examName: newEntry.examName,
        obtainedMarks: newEntry.obtainedMarks,
        totalMarks: newEntry.fullMarks,
        percentage,
        grade,
        gpa,
        status,
        remarks: status === 'পাস' ? 'সফল' : 'অনুত্তীর্ণ',
        isAbsent: false,
        schoolId,
        enteredBy: 'admin'
      };

      await examResultQueries.saveExamResult(resultData);
      await loadAllExamResults();
      
      console.log('✅ Successfully saved to Firebase:', resultData);
      return true;
    } catch (error) {
      console.error('❌ Error saving mark entry:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Handle previous student
  const handlePreviousStudent = async () => {
    // First save current entry if there are obtained marks
    if (newEntry.obtainedMarks > 0) {
      await saveEntrySilently();
    }
    
    // Find current student index
    const currentStudentIndex = filteredStudents.findIndex(s => 
      (s.studentId || s.uid || s.id) === newEntry.studentId
    );
    
    // Get previous student
    const previousStudentIndex = currentStudentIndex - 1;
    
    if (previousStudentIndex >= 0) {
      const previousStudent = filteredStudents[previousStudentIndex];
      
      // Get total marks from exam subject configuration
      const examSubject = examSubjects.find(es => 
        es.subjectName === selectedSubject && 
        (es.className === previousStudent.class || es.class === previousStudent.class)
      );
      const totalMarks = examSubject?.totalMarks || examSubject?.fullMarks || 100;
      
      // Check for existing marks for this student, subject, and exam
      const existingEntry = markEntries.find(entry => 
        entry.studentId === (previousStudent.studentId || previousStudent.uid || previousStudent.id) &&
        entry.subject === selectedSubject &&
        entry.examName === selectedExam
      );
      
      const existingMarks = existingEntry ? existingEntry.obtainedMarks : 0;
      console.log(`🔍 Previous student ${previousStudent.name} with existing marks: ${existingMarks}`);
      
      // Update to previous student
      setNewEntry({
        studentId: previousStudent.studentId || previousStudent.uid || previousStudent.id || '',
        studentName: previousStudent.name || previousStudent.displayName || previousStudent.fullName || '',
        class: previousStudent.class || '',
        subject: selectedSubject,
        examName: selectedExam || '',
        obtainedMarks: existingMarks,
        fullMarks: totalMarks
      });
      
      // Focus on the obtained marks input
      setTimeout(() => {
        const input = document.getElementById('obtained-marks-input') as HTMLInputElement;
        if (input) {
          input.focus();
          input.select();
          console.log('🎯 Focused on obtained marks input for previous student');
        }
      }, 150);
    } else {
      console.log('❌ No previous student available');
    }
  };

  // Handle next student
  const handleNextStudent = async () => {
    // First save current entry if there are obtained marks
    if (newEntry.obtainedMarks > 0) {
      await saveEntrySilently();
    }
    
    // Find current student index
    const currentStudentIndex = filteredStudents.findIndex(s => 
      (s.studentId || s.uid || s.id) === newEntry.studentId
    );
    
    // Get next student
    const nextStudentIndex = currentStudentIndex + 1;
    
    if (nextStudentIndex < filteredStudents.length) {
      const nextStudent = filteredStudents[nextStudentIndex];
      
      // Get total marks from exam subject configuration
      const examSubject = examSubjects.find(es => 
        es.subjectName === selectedSubject && 
        (es.className === nextStudent.class || es.class === nextStudent.class)
      );
      const totalMarks = examSubject?.totalMarks || examSubject?.fullMarks || 100;
      
      // Check for existing marks for this student, subject, and exam
      const existingEntry = markEntries.find(entry => 
        entry.studentId === (nextStudent.studentId || nextStudent.uid || nextStudent.id) &&
        entry.subject === selectedSubject &&
        entry.examName === selectedExam
      );
      
      const existingMarks = existingEntry ? existingEntry.obtainedMarks : 0;
      console.log(`🔍 Existing marks for ${nextStudent.name}: ${existingMarks}`);
      
      // Update to next student
      setNewEntry({
        studentId: nextStudent.studentId || nextStudent.uid || nextStudent.id || '',
        studentName: nextStudent.name || nextStudent.displayName || nextStudent.fullName || '',
        class: nextStudent.class || '',
        subject: selectedSubject,
        examName: selectedExam || '',
        obtainedMarks: existingMarks,
        fullMarks: totalMarks
      });
      
      // Focus on the obtained marks input
      setTimeout(() => {
        const input = document.getElementById('obtained-marks-input') as HTMLInputElement;
        if (input) {
          input.focus();
          input.select(); // Select all text for easy replacement
          console.log('🎯 Focused on obtained marks input for next student');
        }
      }, 150);
    } else {
      // Last student - save current entry and show success message
      if (newEntry.obtainedMarks > 0) {
        await saveEntrySilently();
      }
      
      // Close modal and show success message
      setShowAddModal(false);
      setNewEntry({
        studentId: '',
        studentName: '',
        class: '',
        subject: '',
        examName: '',
        obtainedMarks: 0,
        fullMarks: 100
      });
      setShowSuccessModal(true);
    }
  };

  // Add new mark entry
  const handleAddEntry = async () => {
    if (!newEntry.studentId || !newEntry.studentName) {
      alert('অনুগ্রহ করে শিক্ষার্থী নির্বাচন করুন।');
      return;
    }

    if (newEntry.obtainedMarks > newEntry.fullMarks) {
      alert('প্রাপ্ত নম্বর পূর্ণ নম্বরের চেয়ে বেশি হতে পারে না।');
      return;
    }

    try {
      const { grade, percentage, gpa } = calculateGrade(newEntry.obtainedMarks, newEntry.fullMarks);
      const status = percentage >= 40 ? 'পাস' : 'ফেল';

      // Find the selected exam to get examId
      const selectedExamData = availableExams.find(exam => exam.name === newEntry.examName);
      if (!selectedExamData) {
        alert('পরীক্ষার তথ্য পাওয়া যায়নি।');
        return;
      }

      // Save to Firebase using examResultQueries
      const resultData = {
        studentId: newEntry.studentId,
        studentName: newEntry.studentName,
        studentRoll: newEntry.studentId, // Using studentId as roll for now
        classId: newEntry.class,
        className: newEntry.class,
        subject: newEntry.subject,
        examId: selectedExamData.id || selectedExamData.examId,
        examName: newEntry.examName,
        obtainedMarks: newEntry.obtainedMarks,
        totalMarks: newEntry.fullMarks,
        percentage,
        grade,
        gpa,
        status,
        remarks: status === 'পাস' ? 'সফল' : 'অনুত্তীর্ণ',
        isAbsent: false,
        schoolId,
        enteredBy: 'admin'
      };

      await examResultQueries.saveExamResult(resultData);
      
      // Reload all exam results to show the new entry
      await loadAllExamResults();
      
      setShowAddModal(false);
      setNewEntry({
        studentId: '',
        studentName: '',
        class: '',
        subject: '',
        examName: '',
        obtainedMarks: 0,
        fullMarks: 100
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error saving mark entry:', error);
      alert('মার্ক এন্ট্রি সংরক্ষণে ত্রুটি হয়েছে।');
    }
  };

  // Delete mark entry
  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই মার্ক এন্ট্রিটি মুছে ফেলতে চান?')) {
      return;
    }

    try {
      await examResultQueries.deleteExamResult(entryId);
      // Reload all exam results to reflect the deletion
      await loadAllExamResults();
      alert('মার্ক এন্ট্রি সফলভাবে মুছে ফেলা হয়েছে।');
    } catch (error) {
      console.error('Error deleting mark entry:', error);
      alert('মার্ক এন্ট্রি মুছে ফেলতে ত্রুটি হয়েছে।');
    }
  };

  // Group entries by student and exam for pivot table display
  const groupEntriesByStudent = (entries: MarkEntry[]) => {
    const grouped: { [key: string]: { student: MarkEntry; subjects: { [subject: string]: MarkEntry } } } = {};

    entries.forEach(entry => {
      const key = `${entry.studentId}-${entry.examName}-${entry.class}`;

      if (!grouped[key]) {
        grouped[key] = {
          student: {
            ...entry,
            subject: '',
            obtainedMarks: 0,
            fullMarks: 0,
            percentage: 0,
            grade: '',
            status: 'পাস' as 'পাস' | 'ফেল'
          },
          subjects: {}
        };
      }

      grouped[key].subjects[entry.subject] = entry;
    });

    return grouped;
  };

  // Get all subjects for column headers - prioritize exam subjects if exam is selected
  let allSubjectsList: string[] = [];

  if (selectedClass && selectedExam) {
    // When both class and exam are selected, show subjects configured for that specific exam and class
    console.log('🏫 Class and Exam selected:', selectedClass, selectedExam, 'Loading exam-specific subjects for class...');

    // Get subjects from exam subjects that are configured for this SPECIFIC exam and class
    const specificExamSubjects = examSubjects
      .filter(examSubject => {
        const subjectClass =
          examSubject.className ||
          examSubject.class ||
          examSubject.classId ||
          examSubject.class_name ||
          '';
        return subjectClass === selectedClass;
      })
      .map(examSubject => examSubject.subjectName || examSubject.subject);

    // Also get subjects from existing mark entries for this specific exam and class
    const examClassMarkEntrySubjects = [...new Set(
      markEntries
        .filter(entry => entry.class === selectedClass && entry.examName === selectedExam)
        .map(entry => entry.subject)
        .filter(subject => subject && subject.trim() !== '' && subject.length > 1)
    )];

    // Combine subjects for this specific exam and class
    allSubjectsList = [...new Set([...specificExamSubjects, ...examClassMarkEntrySubjects])];

    console.log('📚 Exam and Class-specific subjects:', {
      examSubjects: specificExamSubjects,
      markEntrySubjects: examClassMarkEntrySubjects,
      final: allSubjectsList,
      selectedExam: selectedExam,
      selectedClass: selectedClass
    });

  } else if (selectedClass) {
    // When only class is selected, show subjects configured for ANY exam in that class
    console.log('🏫 Only class selected:', selectedClass, 'Loading all exam subjects for class...');

    // Get subjects from exam subjects that are configured for this class (from any exam)
    const classExamSubjects = examSubjects
      .filter(examSubject => {
        const subjectClass =
          examSubject.className ||
          examSubject.class ||
          examSubject.classId ||
          examSubject.class_name ||
          '';
        return subjectClass === selectedClass;
      })
      .map(examSubject => examSubject.subjectName || examSubject.subject);

    // Also get subjects from existing mark entries for this class
    const classMarkEntrySubjects = [...new Set(
      markEntries
        .filter(entry => entry.class === selectedClass)
        .map(entry => entry.subject)
        .filter(subject => subject && subject.trim() !== '' && subject.length > 1)
    )];

    // Combine all subjects for this class
    allSubjectsList = [...new Set([...classExamSubjects, ...classMarkEntrySubjects])];

    console.log('📚 Class-specific subjects (all exams):', {
      examConfigured: classExamSubjects,
      withMarks: classMarkEntrySubjects,
      final: allSubjectsList
    });

  } else if (selectedExam && examSubjects.length > 0) {
    // If an exam is selected and has subjects, show exam subjects
    allSubjectsList = examSubjects.map((examSubject) => examSubject.subjectName || examSubject.subject);
    console.log('📚 Using exam subjects for columns:', allSubjectsList);

  } else if (selectedExam && availableExams.length > 0) {
    // If exam is selected but no exam subjects loaded yet, try to load them
    const selectedExamData = availableExams.find(exam => exam.name === selectedExam);
    if (selectedExamData) {
      console.log('🔄 Loading exam subjects for selected exam:', selectedExam);
      loadExamSubjects(selectedExamData.id || selectedExamData.examId);
    }
    // For now, fall back to existing logic
    allSubjectsList = [];

  } else if (selectedSubject) {
    // If only a subject filter is selected, show that subject
    allSubjectsList = [selectedSubject];
    console.log('🎯 Using filtered subject:', allSubjectsList);

  } else {
    // No class selected, show all subjects from mark entries (with validation)
    const allValidSubjects = [...new Set(
      markEntries
        .map(entry => entry.subject)
        .filter(subject =>
          subject &&
          subject.trim() !== '' &&
          subject.length > 1 &&
          !/^\d+$/.test(subject) &&
          !subject.includes('আইডি') &&
          !subject.includes('শিক্ষার্থী') &&
          !subject.includes('ক্লাস') &&
          !subject.includes('নাম') &&
          !subject.includes('যোগ করুন')
        )
    )];
    allSubjectsList = allValidSubjects;
    console.log('📊 Using all valid subjects from mark entries:', allSubjectsList);
  }

  // Remove duplicates and filter out empty values
  allSubjectsList = [...new Set(allSubjectsList.filter(subject => subject && subject.trim() !== ''))];
  console.log('✅ Final subjects list for table:', allSubjectsList);

  // Filter and sort students based on selected filters
  const filteredStudents = students.filter(student => {
    const studentClass = student.class || '';
    const studentClassName = student.className || studentClass;
    
    // More flexible class matching
    const matchesClass = !selectedClass || 
      studentClass === selectedClass || 
      studentClassName === selectedClass ||
      studentClass.includes(selectedClass) ||
      selectedClass.includes(studentClass);
    
    const matchesSearch = !searchQuery ||
      (student.name || student.displayName || student.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.studentId || student.uid || student.id || '').toLowerCase().includes(searchQuery.toLowerCase());

    // Debug logging
    if (selectedClass) {
      console.log('🔍 Student filtering:', {
        studentName: student.name || student.displayName,
        studentClass: studentClass,
        studentClassName: studentClassName,
        selectedClass: selectedClass,
        matchesClass: matchesClass
      });
    }

    return matchesClass && matchesSearch;
  }).sort((a, b) => {
    let comparison = 0;

    if (sortBy === 'name') {
      const nameA = (a.name || a.displayName || a.fullName || '').toLowerCase();
      const nameB = (b.name || b.displayName || b.fullName || '').toLowerCase();
      comparison = nameA.localeCompare(nameB, 'bn');
    } else if (sortBy === 'id') {
      const idA = (a.studentId || a.uid || a.id || '').toLowerCase();
      const idB = (b.studentId || b.uid || b.id || '').toLowerCase();
      comparison = idA.localeCompare(idB);
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Group students with their mark entries
  const groupedStudents = filteredStudents.map(student => {
    const studentMarks = markEntries.filter(entry =>
      (entry.studentId === student.studentId || entry.studentId === student.uid || entry.studentId === student.id) &&
      (!selectedExam || entry.examName === selectedExam) &&
      (!selectedSubject || entry.subject === selectedSubject)
    );

    return {
      student: {
        id: student.studentId || student.uid || student.id,
        studentId: student.studentId || student.uid || student.id,
        studentName: student.name || student.displayName || student.fullName || 'নাম নেই',
        class: student.class || '',
        subject: '',
        obtainedMarks: 0,
        fullMarks: 0,
        percentage: 0,
        grade: '',
        status: 'পাস' as 'পাস' | 'ফেল'
      },
      subjects: allSubjectsList.reduce((acc, subject) => {
        const markEntry = studentMarks.find(entry => entry.subject === subject);
        acc[subject] = markEntry || null;
        return acc;
      }, {} as { [key: string]: any })
    };
  });

  // Get unique values for filter dropdowns
  // Use classes loaded from Firebase, fallback to classes from mark entries
  const classesFromEntries = [...new Set(markEntries.map(entry => entry.class))];
  const classesFromDatabase = availableClasses.map(cls => cls.className);
  const classes = availableClasses.length > 0 ? classesFromDatabase : classesFromEntries;

  console.log('🔍 Available classes from database:', availableClasses);
  console.log('📊 Classes from entries:', classesFromEntries);
  console.log('🎯 Final classes for dropdown:', classes);
  console.log('👥 All students loaded:', students.length);
  console.log('📚 Student classes:', students.map(s => ({ name: s.name, class: s.class, className: s.className })));
  console.log('🎯 Selected class:', selectedClass);
  console.log('🎯 Selected exam:', selectedExam);
  console.log('📚 Available subjects for dropdown:', allSubjectsList);
  console.log('🔍 Filtered students count:', filteredStudents.length);
  
  const subjects = [...new Set(markEntries.map(entry => entry.subject))];
  // Note: Using availableExams from Firebase instead of this local array
  // const exams = [...new Set(markEntries.map(entry => entry.examName))];

  return (
    <div className="space-y-6">
      {/* Header Section */}
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
            <h2 className="text-2xl font-bold text-gray-900">মার্ক এন্ট্রি</h2>
            <p className="text-gray-600">শিক্ষার্থীদের পরীক্ষার নম্বর এন্ট্রি করুন, সম্পাদনা করুন এবং পরিচালনা করুন।</p>
            
            {/* Show available subjects info */}
            {selectedClass && selectedExam && allSubjectsList.length > 0 && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>পরীক্ষার বিষয়সমূহ:</strong> {allSubjectsList.join(', ')}
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ক্লাস</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">সকল ক্লাস</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">বিষয়</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={loadingSubjects}
            >
              <option value="">সকল বিষয়</option>
              {allSubjectsList.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">পরীক্ষা</label>
            <select
              value={selectedExam}
              onChange={(e) => handleExamSelection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">সকল পরীক্ষা</option>
              {availableExams.map(exam => (
                <option key={exam.id || exam.examId} value={exam.name}>
                  {exam.name} {exam.class ? `(${exam.class})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Subject Selection Warning */}
      {selectedClass && selectedExam && !selectedSubject && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <p className="text-sm text-yellow-800">
              <strong>নির্দেশনা:</strong> মার্ক এন্ট্রি করতে প্রথমে একটি বিষয় নির্বাচন করুন।
            </p>
          </div>
        </div>
      )}

      {/* Mark Entries Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">মার্ক এন্ট্রিসমূহ</h3>
            <div className="flex items-center space-x-4">
              {/* Sort Controls */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">সাজান:</span>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-');
                    setSortBy(newSortBy as 'name' | 'id');
                    setSortOrder(newSortOrder as 'asc' | 'desc');
                  }}
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="name-asc">নাম (A-Z)</option>
                  <option value="name-desc">নাম (Z-A)</option>
                  <option value="id-asc">আইডি (A-Z)</option>
                  <option value="id-desc">আইডি (Z-A)</option>
                </select>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="শিক্ষার্থী খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  আইডি
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  শিক্ষার্থী
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ক্লাস
                </th>
                {allSubjectsList.map((subject) => (
                  <th key={subject} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {subject}
                  </th>
                ))}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ক্রিয়াকলাপ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loadingResults ? (
                <tr>
                  <td colSpan={3 + allSubjectsList.length + 1} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mr-3"></div>
                      <span className="text-gray-600">মার্ক এন্ট্রি লোড হচ্ছে...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={3 + allSubjectsList.length + 1} className="px-6 py-12 text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">কোনো শিক্ষার্থী পাওয়া যায়নি</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {selectedClass || searchQuery ? 'ফিল্টার পরিবর্তন করুন' : 'কোনো শিক্ষার্থী নেই'}
                    </p>
                    {selectedClass && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md mx-auto">
                        <p className="text-xs text-yellow-800">
                          <strong>ডিবাগ তথ্য:</strong><br />
                          নির্বাচিত ক্লাস: {selectedClass}<br />
                          মোট শিক্ষার্থী: {students.length}<br />
                          শিক্ষার্থীদের ক্লাস: {students.map(s => s.class).join(', ')}
                        </p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                groupedStudents.map((group, index) => (
                  <tr key={group.student.studentId || index} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                      {group.student.studentId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{group.student.studentName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {group.student.class}
                    </td>
                    {allSubjectsList.map((subject) => {
                      const subjectEntry = group.subjects[subject];
                      return (
                        <td key={subject} className="px-4 py-4 whitespace-nowrap text-center text-sm">
                          {subjectEntry ? (
                            <div className="text-gray-900 font-medium text-sm">
                              {toBengaliNumerals(subjectEntry.obtainedMarks)}
                            </div>
                          ) : (
                            <span className="text-gray-300 text-sm">-</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => {
                            // Check if a subject is selected first
                            if (!selectedSubject) {
                              alert('প্রথমে বিষয় নির্বাচন করুন');
                              return;
                            }
                            
                            // Pre-fill the modal with this student's info
                            const student = filteredStudents[index];
                            
                            // Get total marks from exam subject configuration
                            const examSubject = examSubjects.find(es => 
                              es.subjectName === selectedSubject && 
                              (es.className === student.class || es.class === student.class)
                            );
                            const totalMarks = examSubject?.totalMarks || examSubject?.fullMarks || 100;
                            
                            // Check for existing marks for this student, subject, and exam
                            const existingEntry = markEntries.find(entry => 
                              entry.studentId === (student.studentId || student.uid || student.id) &&
                              entry.subject === selectedSubject &&
                              entry.examName === selectedExam
                            );
                            
                            const existingMarks = existingEntry ? existingEntry.obtainedMarks : 0;
                            console.log(`🔍 Opening modal for ${student.name} with existing marks: ${existingMarks}`);
                            
                            setNewEntry({
                              studentId: student.studentId || student.uid || student.id || '',
                              studentName: student.name || student.displayName || student.fullName || '',
                              class: student.class || '',
                              subject: selectedSubject,
                              examName: selectedExam || '',
                              obtainedMarks: existingMarks,
                              fullMarks: totalMarks
                            });
                            setShowAddModal(true);
                          }}
                          className={`px-3 py-1 rounded-md text-sm flex items-center space-x-1 ${
                            selectedSubject 
                              ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' 
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                          title={selectedSubject ? `Add marks for ${group.student.studentName}` : 'প্রথমে বিষয় নির্বাচন করুন'}
                        >
                          <Plus className="w-3 h-3" />
                          <span>যোগ করুন</span>
                        </button>
                        <button
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="সম্পাদনা করুন"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Mark Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">নতুন মার্ক এন্ট্রি যোগ করুন</h3>

              {/* Show selected filters */}
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>নির্বাচিত:</strong> ক্লাস: {selectedClass} | পরীক্ষা: {selectedExam} | বিষয়: {selectedSubject}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  শিক্ষার্থী: {filteredStudents.findIndex(s => (s.studentId || s.uid || s.id) === newEntry.studentId) + 1} / {filteredStudents.length}
                  {saving && (
                    <span className="ml-2 text-green-600">
                      <span className="animate-spin inline-block w-3 h-3 border border-green-600 border-t-transparent rounded-full mr-1"></span>
                      সংরক্ষণ হচ্ছে...
                    </span>
                  )}
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      নির্বাচিত শিক্ষার্থী
                    </label>
                    <input
                      type="text"
                      value={newEntry.studentName || 'নাম নেই'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                </div>


                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      পূর্ণ নম্বর
                    </label>
                    <input
                      type="number"
                      value={newEntry.fullMarks}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      প্রাপ্ত নম্বর *
                    </label>
                    <input
                      id="obtained-marks-input"
                      type="number"
                      value={newEntry.obtainedMarks}
                      onChange={(e) => setNewEntry({...newEntry, obtainedMarks: parseInt(e.target.value) || 0})}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleNextStudent();
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      min="0"
                      max={newEntry.fullMarks}
                      autoFocus
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  {/* Navigation Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handlePreviousStudent}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 flex items-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span>পূর্ববর্তী</span>
                    </button>
                    
                    <button
                      onClick={handleNextStudent}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 flex items-center space-x-1"
                    >
                      <span>পরবর্তী</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      বাতিল করুন
                    </button>
                    <button
                      onClick={handleAddEntry}
                      className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      সংরক্ষণ করুন
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-5 border w-[400px] shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">সফল!</h3>
              <p className="text-sm text-gray-600 mb-4">
                মার্ক এন্ট্রি সফলভাবে যুক্ত করা হয়েছে।
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MarkEntryPageWrapper() {
  return (
    <AdminLayout title="মার্ক এন্ট্রি" subtitle="পরীক্ষার মার্ক এন্ট্রি">
      <MarkEntryPage />
    </AdminLayout>
  );
}
