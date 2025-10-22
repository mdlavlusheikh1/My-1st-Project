'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import AdminLayout from '@/components/AdminLayout';
import { examResultQueries, studentQueries, classQueries, examQueries, examSubjectQueries, ExamResult } from '@/lib/database-queries';
import { SCHOOL_ID } from '@/lib/constants';
import { ArrowLeft, RefreshCw, Calculator, Trophy, Target, Zap } from 'lucide-react';


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

function ExamResultsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [searchStudentName, setSearchStudentName] = useState('');
  const [searchRollNumber, setSearchRollNumber] = useState('');
  const [dataLoading, setDataLoading] = useState(false);
  const [examSubjects, setExamSubjects] = useState<any[]>([]);
  const [calculating, setCalculating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({
    totalStudents: 0,
    passCount: 0,
    failCount: 0,
    passRate: '0',
    updatedCount: 0
  });
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<'studentId' | 'rank' | 'name'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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
    if (!auth) {
      console.error('Firebase auth not initialized');
      router.push('/auth/login');
      setLoading(false);
      return;
    }

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

  // Load students when class is selected
  useEffect(() => {
    if (selectedClass) {
      loadAllStudents();
    }
  }, [selectedClass]);

  // Load all students for the selected class
  const loadAllStudents = async () => {
    if (!selectedClass) {
      console.log('⚠️ No class selected for loading students');
      return;
    }

    try {
      console.log('📚 Loading all students for class:', selectedClass, 'from school:', schoolId);
      const studentsData = await studentQueries.getStudentsBySchool(schoolId);
      console.log('📊 Raw students data received:', studentsData?.length || 0, 'students');

      if (studentsData && studentsData.length > 0) {
        // Normalize text function to handle Unicode and case issues
        const normalizeText = (text: string) => text.trim().normalize('NFC').toLowerCase();

        // Filter students by selected class with robust matching
        const classStudents = studentsData.filter(student => {
          const studentClass = normalizeText(student.class || '');
          const selected = normalizeText(selectedClass);

          // More flexible matching - check for partial matches and common variations
          const matches = studentClass === selected || 
                         studentClass.includes(selected) || 
                         selected.includes(studentClass) ||
                         (selected === 'প্লে' && (studentClass === 'নার্সারি' || studentClass === 'নুরসারি'));

          if (matches) {
            console.log('✅ Student matches class:', student.name || student.displayName, 'Class:', student.class);
          } else {
            console.log('❌ Filtering out student:', student.name || student.displayName, 'Class:', student.class, 'Selected:', selectedClass);
          }
          return matches;
        });

        // Also include students from examResults that match the selected class
        const examResultsStudents = examResults
          .filter(result => {
            const resultClass = normalizeText(result.className || '');
            const selected = normalizeText(selectedClass);
            
            // More flexible matching - check for partial matches and common variations
            return resultClass === selected || 
                   resultClass.includes(selected) || 
                   selected.includes(resultClass) ||
                   (selected === 'প্লে' && (resultClass === 'নার্সারি' || resultClass === 'নুরসারি'));
          })
          .map(result => ({
            studentId: result.studentId,
            name: result.studentName,
            class: result.className,
            uid: result.studentId // Use studentId as uid for consistency
          }));

        // Combine both arrays and remove duplicates
        const allMatchingStudents = [...classStudents, ...examResultsStudents];
        const uniqueStudents = allMatchingStudents.filter((student, index, self) =>
          index === self.findIndex(s => s.studentId === student.studentId)
        );

        console.log(`✅ Found ${classStudents.length} students in class ${selectedClass}`);
        console.log('📋 Class students:', classStudents.map(s => ({ name: s.name || s.displayName, class: s.class, id: s.studentId })));
        console.log(`✅ Found ${examResultsStudents.length} students from exam results`);
        console.log(`✅ Total unique students: ${uniqueStudents.length}`);

        setAllStudents(uniqueStudents);
      } else {
        console.log('⚠️ No students found in database for school:', schoolId);
        setAllStudents([]);
      }
    } catch (error) {
      console.error('❌ Error loading students:', error);
      setAllStudents([]);
    }
  };

  // Load all data
  const loadAllData = async () => {
    try {
      setLoading(true);
      await loadExamResults();
      await loadClasses();
      await loadExams();
    } catch (error) {
      console.error('❌ Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load exam results from Firebase
  const loadExamResults = async () => {
    try {
      console.log('📊 Loading exam results from Firebase for school:', schoolId);
      const results = await examResultQueries.getAllExamResults(schoolId);
      console.log('📊 Exam results received:', results?.length || 0, 'records');

      if (results && results.length > 0) {
        console.log('📋 Sample exam result:', results[0]);
        console.log('📋 Unique class names:', [...new Set(results.map(r => r.className))]);
        console.log('📋 Unique exam names:', [...new Set(results.map(r => r.examName))]);
        console.log('📋 Unique subjects:', [...new Set(results.map(r => r.subject))]);

        // Show character codes for debugging Bengali text issues
        if (results.length > 0) {
          console.log('🔍 Character code analysis:');
          const firstResult = results[0];
          console.log('Class name char codes:', [...(firstResult.className || '')].map(c => `${c}(${c.charCodeAt(0)})`));
          console.log('Exam name char codes:', [...(firstResult.examName || '')].map(c => `${c}(${c.charCodeAt(0)})`));
        }

        // Show first few results for debugging
        console.log('📋 First 3 results:', results.slice(0, 3).map(r => ({
          className: r.className,
          examName: r.examName,
          studentName: r.studentName,
          subject: r.subject
        })));

        setExamResults(results);
      } else {
        console.log('⚠️ No exam results found in Firebase');
        setExamResults([]);
      }
    } catch (error) {
      console.error('❌ Error loading exam results:', error);
      setExamResults([]);
    }
  };

  // Load classes for filter dropdown
  const loadClasses = async () => {
    try {
      console.log('🏫 Loading classes from Firebase for school:', schoolId);
      const classesData = await classQueries.getClassesBySchool(schoolId);
      console.log('🏫 Classes data received:', classesData);

      if (classesData && classesData.length > 0) {
        const convertedClasses = classesData.map(cls => {
          console.log('📋 Processing class:', cls);
          return {
            id: cls.id || '',
            className: cls.className || '',
            section: cls.section || 'A'
          };
        });
        setClasses(convertedClasses);
        console.log('✅ Classes loaded for filter:', convertedClasses.length);
        console.log('📋 Available class options:', convertedClasses.map(c => c.className));
      } else {
        console.log('⚠️ No classes found in Firebase');
        setClasses([]);
      }
    } catch (error) {
      console.error('❌ Error loading classes:', error);
      setClasses([]);
    }
  };

  // Load exams for filter dropdown
  const loadExams = async (retryCount = 0) => {
    try {
      console.log('📝 Loading exams from Firebase for school:', schoolId);
      const examsData = await examQueries.getAllExams(schoolId);
      console.log('📝 Exams data received:', examsData);

      if (examsData && examsData.length > 0) {
        const convertedExams = examsData.map(exam => {
          console.log('📋 Processing exam:', exam);
          return {
            id: exam.id || '',
            name: exam.name || '',
            type: (exam as any).type || 'monthly'
          };
        });
        setExams(convertedExams);
        console.log('✅ Exams loaded for filter:', convertedExams.length);
        console.log('📋 Available exam options:', convertedExams.map(e => e.name));

        // Debug: Show exam data structure
        console.log('🔍 Exam data structure check:');
        examsData.forEach((exam, index) => {
          console.log(`  Exam ${index + 1}:`, {
            id: exam.id,
            name: exam.name,
            nameType: typeof exam.name,
            nameLength: exam.name?.length,
            charCodes: exam.name ? [...exam.name].map(c => `${c}(${c.charCodeAt(0)})`).slice(0, 10) : 'undefined'
          });
        });
      } else {
        console.log('⚠️ No exams found in Firebase');
        setExams([]);
      }
    } catch (error) {
      console.error('❌ Error loading exams:', error);
      console.error('❌ Error details:', error);

      // Retry mechanism for network issues
      if (retryCount < 2) {
        console.log(`🔄 Retrying exam load (attempt ${retryCount + 1}/3)...`);
        setTimeout(() => loadExams(retryCount + 1), 1000 * (retryCount + 1));
        return;
      }

      setExams([]);
    }
  };

  // Load exam subjects when exam is selected
  const loadExamSubjects = async (examId: string) => {
    try {
      console.log('📚 Loading exam subjects for exam:', examId);
      const subjectsData = await examSubjectQueries.getExamSubjects(examId);
      console.log('📚 Exam subjects received:', subjectsData);

      if (subjectsData && subjectsData.length > 0) {
        setExamSubjects(subjectsData);
        console.log('✅ Exam subjects loaded:', subjectsData.length);
      } else {
        console.log('⚠️ No exam subjects found');
        setExamSubjects([]);
      }
    } catch (error) {
      console.error('❌ Error loading exam subjects:', error);
      setExamSubjects([]);
    }
  };

  // Calculate grades and GPAs for filtered results
  const calculateGradesAndGPAs = async () => {
    if (filteredResults.length === 0) {
      alert('কোনো ফলাফল পাওয়া যায়নি গ্রেড ক্যালকুলেশনের জন্য।');
      return;
    }

    setCalculating(true);
    try {
      console.log('🧮 Starting grade and GPA calculation for', filteredResults.length, 'results');

      // Group results by student
      const studentGroups = new Map();

      filteredResults.forEach(result => {
        const studentKey = result.studentId;
        if (!studentGroups.has(studentKey)) {
          studentGroups.set(studentKey, {
            studentId: result.studentId,
            studentName: result.studentName,
            className: result.className,
            subjects: new Map()
          });
        }
        studentGroups.get(studentKey).subjects.set(result.subject, {
          obtainedMarks: result.obtainedMarks,
          totalMarks: result.totalMarks,
          percentage: result.percentage
        });
      });

      let updatedCount = 0;

      for (const studentData of studentGroups.values()) {
        const subjects = Array.from(studentData.subjects.values()) as Array<{
          obtainedMarks: number;
          totalMarks: number;
          percentage: number;
        }>;
        const subjectMarks = subjects.map(s => s.obtainedMarks);

        // Check if any subject has failing marks based on total marks
        const hasFailingSubject = subjects.some(subject => {
          const { obtainedMarks, totalMarks } = subject;
          
          // If marks are blank (0 or undefined), consider as fail
          if (!obtainedMarks || obtainedMarks === 0) {
            return true;
          }
          
          // Determine pass mark based on total marks
          if (totalMarks === 100) {
            return obtainedMarks < 33; // 100 marks: pass mark 33
          } else if (totalMarks === 50) {
            return obtainedMarks < 17; // 50 marks: pass mark 17
          } else {
            // For other total marks, use proportional calculation
            const passPercentage = 33; // 33% pass mark
            const requiredMarks = Math.ceil((totalMarks * passPercentage) / 100);
            return obtainedMarks < requiredMarks;
          }
        });

        if (hasFailingSubject) {
          // Assign F grade and 0.00 GPA
          const grade = 'F';
          const gpa = 0.00;
          const percentage = subjects.reduce((sum, s) => sum + s.percentage, 0) / subjects.length;

          console.log(`❌ Student ${studentData.studentName} failed - Grade: ${grade}, GPA: ${gpa}`);

          // Update all subjects for this student
          for (const [subject] of studentData.subjects) {
            // Find the result ID for this student, exam, and subject
            const result = filteredResults.find(r =>
              r.studentId === studentData.studentId &&
              r.examName === selectedExam &&
              r.subject === subject
            );

            if (result && result.id) {
              await examResultQueries.updateExamResult(result.id, {
                grade,
                gpa,
                percentage: Math.round(percentage * 100) / 100
              });
              updatedCount++;
            }
          }
        } else {
          // Calculate grade and GPA based on average percentage
          const totalPercentage = subjects.reduce((sum, s) => sum + s.percentage, 0) / subjects.length;

          let grade = 'F';
          let gpa = 0.00;

          if (totalPercentage >= 80) {
            grade = 'A+';
            gpa = 5.00;
          } else if (totalPercentage >= 70) {
            grade = 'A';
            gpa = 4.00;
          } else if (totalPercentage >= 60) {
            grade = 'A-';
            gpa = 3.50;
          } else if (totalPercentage >= 50) {
            grade = 'B';
            gpa = 3.00;
          } else if (totalPercentage >= 40) {
            grade = 'C';
            gpa = 2.00;
          } else if (totalPercentage >= 33) {
            grade = 'D';
            gpa = 1.00;
          }

          console.log(`✅ Student ${studentData.studentName} - Grade: ${grade}, GPA: ${gpa}, Percentage: ${totalPercentage.toFixed(2)}%`);

          // Update all subjects for this student
          for (const [subject] of studentData.subjects) {
            // Find the result ID for this student, exam, and subject
            const result = filteredResults.find(r =>
              r.studentId === studentData.studentId &&
              r.examName === selectedExam &&
              r.subject === subject
            );

            if (result && result.id) {
              await examResultQueries.updateExamResult(result.id, {
                grade,
                gpa,
                percentage: Math.round(totalPercentage * 100) / 100
              });
              updatedCount++;
            }
          }
        }
      }

      console.log(`✅ Grade and GPA calculation completed. Updated ${updatedCount} results.`);

      // Refresh the data
      await loadExamResults();

      // Calculate summary statistics
      const totalStudents = studentGroups.size;
      const passCount = Array.from(studentGroups.values()).filter((studentData: any) => {
        const subjects = Array.from(studentData.subjects.values());
        const averagePercentage = subjects.reduce((sum: number, s: any) => sum + (s.percentage || 0), 0) / subjects.length;
        return averagePercentage >= 40 && !subjects.some((sub: any) => (sub.obtainedMarks || 0) < 33);
      }).length;
      const failCount = totalStudents - passCount;
      const passRate = ((passCount / totalStudents) * 100).toFixed(1);

      // Show custom success modal instead of alert
      setShowSuccessModal(true);
      setSuccessData({
        totalStudents,
        passCount,
        failCount,
        passRate,
        updatedCount
      });

    } catch (error) {
      console.error('❌ Error calculating grades and GPAs:', error);
      alert('গ্রেড ক্যালকুলেশনে ত্রুটি হয়েছে।');
    } finally {
      setCalculating(false);
    }
  };

  // Get filtered exam results (real-time)
  const getFilteredResults = (): ExamResult[] => {
    console.log('🔍=== FILTER DEBUG ===');
    console.log('📋 Total results:', examResults.length);
    console.log('🏫 Selected class:', selectedClass);
    console.log('📝 Selected exam:', selectedExam);

    let filtered = examResults;

    // Filter by class
    if (selectedClass) {
      const beforeFilter = filtered.length;
      filtered = filtered.filter(result => {
        // Normalize text for better Bengali text comparison
        const normalizeText = (text: string) => text.trim().normalize('NFC').toLowerCase();

        const resultClass = normalizeText(result.className || '');
        const selectedClassTrimmed = normalizeText(selectedClass);

        // More flexible matching - check for partial matches and common variations
        const matches = resultClass === selectedClassTrimmed || 
                       resultClass.includes(selectedClassTrimmed) || 
                       selectedClassTrimmed.includes(resultClass) ||
                       (selectedClassTrimmed === 'প্লে' && (resultClass === 'নার্সারি' || resultClass === 'নুরসারি'));

        console.log(`🔍 Class filter: "${resultClass}" matches "${selectedClassTrimmed}" ? ${matches}`);
        console.log(`   Result class (length: ${resultClass.length}):`, resultClass);
        console.log(`   Selected class (length: ${selectedClassTrimmed.length}):`, selectedClassTrimmed);

        return matches;
      });
      console.log(`📋 After class filter: ${beforeFilter} → ${filtered.length}`);
    }

    // Filter by exam
    if (selectedExam) {
      const beforeFilter = filtered.length;
      filtered = filtered.filter(result => {
        // Normalize text for better Bengali text comparison
        const normalizeText = (text: string) => text.trim().normalize('NFC').toLowerCase();

        const resultExam = normalizeText(result.examName || '');
        const selectedExamTrimmed = normalizeText(selectedExam);

        const matches = resultExam === selectedExamTrimmed;

        console.log(`🔍 Exam filter: "${resultExam}" === "${selectedExamTrimmed}" ? ${matches}`);
        console.log(`   Result exam (length: ${resultExam.length}):`, resultExam);
        console.log(`   Selected exam (length: ${selectedExamTrimmed.length}):`, selectedExamTrimmed);

        return matches;
      });
      console.log(`📋 After exam filter: ${beforeFilter} → ${filtered.length}`);
    }

    console.log('✅ Final filtered results:', filtered.length);
    return filtered;
  };

  // Real-time filtered results - updates immediately when filters change
  const filteredResults = useMemo(() => {
    return getFilteredResults();
  }, [examResults, selectedClass, selectedExam]);

  // Get all unique subjects for pivot table columns
  const allSubjects = useMemo(() => {
    if (!selectedExam) return [];

    // Use exam subjects data if available, otherwise fall back to subjects from results
    if (examSubjects.length > 0) {
      return examSubjects.map(subject => subject.subjectName).sort();
    } else if (filteredResults.length > 0) {
      return [...new Set(filteredResults.map(r => r.subject))].sort();
    }

    return [];
  }, [filteredResults, selectedExam, examSubjects]);

  // Create pivot table data when exam is selected
  const pivotTableData = useMemo(() => {
    if (!selectedExam || !selectedClass) {
      return [];
    }

    // Start with all students from the selected class
    const studentGroups = new Map();

    // Add all students from the selected class first
    allStudents.forEach(student => {
      studentGroups.set(student.studentId || student.uid, {
        studentId: student.studentId || student.uid,
        studentName: student.name || student.displayName || '',
        className: student.class || '',
        subjects: new Map()
      });
    });

    // Add exam results for students who have them
    filteredResults.forEach(result => {
      const studentKey = result.studentId;
      if (studentGroups.has(studentKey)) {
        studentGroups.get(studentKey).subjects.set(result.subject, {
          obtainedMarks: result.obtainedMarks,
          totalMarks: result.totalMarks,
          percentage: result.percentage,
          grade: result.grade || 'N/A',
          gpa: result.gpa || 0
        });
      }
    });

    // Calculate comprehensive results for each student
    const studentsWithCalculations = Array.from(studentGroups.values()).map(student => {
      const subjects = Array.from(student.subjects.values());
      
      // Get all expected subjects for this exam
      const expectedSubjects = allSubjects.length > 0 ? allSubjects : 
        Array.from(new Set(filteredResults.map(r => r.subject)));
      
      // Check if student has results for all expected subjects
      const hasAllSubjects = expectedSubjects.every(subjectName => 
        student.subjects.has(subjectName)
      );
      
      // If student is missing any expected subject, they fail
      if (!hasAllSubjects) {
        return {
          ...student,
          totalObtainedMarks: subjects.reduce((sum, sub) => sum + (sub as any).obtainedMarks, 0),
          totalPossibleMarks: subjects.reduce((sum, sub) => sum + (sub as any).totalMarks, 0),
          averagePercentage: 0,
          averageGPA: 0,
          overallGrade: 'F',
          isPass: false,
          rank: 0
        };
      }

      // Calculate total marks
      const totalObtainedMarks = subjects.reduce((sum: number, sub: any) => sum + (sub.obtainedMarks || 0), 0);
      const totalPossibleMarks = subjects.reduce((sum: number, sub: any) => sum + (sub.totalMarks || 0), 0);

      // Calculate average percentage
      const averagePercentage = subjects.length > 0
        ? subjects.reduce((sum: number, sub: any) => sum + (sub.percentage || 0), 0) / subjects.length
        : 0;

      // Calculate GPA
      const averageGPA = subjects.length > 0
        ? subjects.reduce((sum: number, sub: any) => sum + (sub.gpa || 0), 0) / subjects.length
        : 0;
      
      // Determine overall grade
      let overallGrade = 'F';
      if (averagePercentage >= 80) overallGrade = 'A+';
      else if (averagePercentage >= 70) overallGrade = 'A';
      else if (averagePercentage >= 60) overallGrade = 'A-';
      else if (averagePercentage >= 50) overallGrade = 'B';
      else if (averagePercentage >= 40) overallGrade = 'C';
      else if (averagePercentage >= 33) overallGrade = 'D';
      
      // Determine pass/fail status based on individual subject marks
      const isPass = !subjects.some((subject: any) => {
        const { obtainedMarks, totalMarks } = subject;

        // If marks are blank (0 or undefined), consider as fail
        if (!obtainedMarks || obtainedMarks === 0) {
          return true;
        }

        // Determine pass mark based on total marks
        if (totalMarks === 100) {
          return obtainedMarks < 33; // 100 marks: pass mark 33
        } else if (totalMarks === 50) {
          return obtainedMarks < 17; // 50 marks: pass mark 17
        } else {
          // For other total marks, use proportional calculation
          const passPercentage = 33; // 33% pass mark
          const requiredMarks = Math.ceil((totalMarks * passPercentage) / 100);
          return obtainedMarks < requiredMarks;
        }
      });
      
      return {
        ...student,
        totalObtainedMarks,
        totalPossibleMarks,
        averagePercentage: Math.round(averagePercentage * 100) / 100,
        averageGPA: Math.round(averageGPA * 100) / 100,
        overallGrade,
        isPass,
        rank: 0 // Will be calculated after sorting
      };
    });

    // Sort by total marks (descending) and assign ranks
    studentsWithCalculations.sort((a, b) => b.totalObtainedMarks - a.totalObtainedMarks);

    // Assign ranks
    studentsWithCalculations.forEach((student, index) => {
      student.rank = index + 1;
    });

    // Apply search filters first
    let filteredStudents = studentsWithCalculations;

    if (searchStudentName) {
      const normalizeText = (text: string) => text.trim().normalize('NFC').toLowerCase();
      filteredStudents = filteredStudents.filter(student =>
        normalizeText(student.studentName || '').includes(normalizeText(searchStudentName))
      );
    }

    if (searchRollNumber) {
      filteredStudents = filteredStudents.filter(student =>
        (student.studentId || '').toLowerCase().includes(searchRollNumber.toLowerCase())
      );
    }

    // Apply user sorting
    filteredStudents.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'studentId':
          comparison = a.studentId.localeCompare(b.studentId);
          break;
        case 'rank':
          comparison = a.rank - b.rank;
          break;
        case 'name':
          comparison = (a.studentName || '').localeCompare(b.studentName || '');
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filteredStudents;
  }, [filteredResults, selectedExam, allSubjects, allStudents, selectedClass, sortBy, sortOrder, searchStudentName, searchRollNumber]);


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
              <p className="text-gray-600">শিক্ষার্থীদের পরীক্ষার ফলাফল দেখুন</p>
            </div>

            <div className="flex items-center space-x-3">
              {/* Navigation buttons can stay here */}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">ফিল্টার</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ক্লাস নির্বাচন করুন
                <span className="text-xs text-gray-500 ml-1">({classes.length} টি ক্লাস পাওয়া গেছে)</span>
              </label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  const value = e.target.value;
                  console.log('🏫 Class selection:', {
                    value,
                    length: value.length,
                    charCodes: [...value].map(c => c.charCodeAt(0))
                  });
                  setSelectedClass(value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">সকল ক্লাস</option>
                {classes.length > 0 ? (
                  classes.map((cls) => (
                    <option key={cls.id} value={cls.className}>
                      {cls.className} {cls.section !== 'A' ? `(সেকশন ${cls.section})` : ''}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>কোনো ক্লাস পাওয়া যায়নি</option>
                )}
              </select>
              {classes.length === 0 && (
                <p className="text-xs text-orange-600 mt-1">
                  কোনো ক্লাস পাওয়া যায়নি। প্রথমে ক্লাস তৈরি করুন।
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                পরীক্ষা নির্বাচন করুন
                <span className="text-xs text-gray-500 ml-1">({exams.length} টি পরীক্ষা পাওয়া গেছে)</span>
              </label>
              <select
                value={selectedExam}
                onChange={(e) => {
                  const value = e.target.value;
                  console.log('📝 Exam selection:', {
                    value,
                    length: value.length,
                    charCodes: [...value].map(c => c.charCodeAt(0))
                  });
                  setSelectedExam(value);

                  // Load exam subjects when exam is selected
                  if (value) {
                    const selectedExamData = exams.find(exam => exam.name === value);
                    if (selectedExamData && selectedExamData.id) {
                      loadExamSubjects(selectedExamData.id);
                    }
                  } else {
                    setExamSubjects([]);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">সকল পরীক্ষা</option>
                {exams.length > 0 ? (
                  exams.map((exam) => (
                    <option key={exam.id} value={exam.name}>
                      {exam.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>কোনো পরীক্ষা পাওয়া যায়নি</option>
                )}
              </select>
              {exams.length === 0 && (
                <p className="text-xs text-orange-600 mt-1">
                  কোনো পরীক্ষা পাওয়া যায়নি। প্রথমে পরীক্ষা তৈরি করুন।
                </p>
              )}
            </div>

            {/* Student Search Filters - Separate Section */}
            {(selectedClass || selectedExam) && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">শিক্ষার্থী অনুসন্ধান</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      শিক্ষার্থীর নাম দিয়ে অনুসন্ধান (ঐচ্ছিক)
                    </label>
                    <input
                      type="text"
                      value={searchStudentName}
                      onChange={(e) => setSearchStudentName(e.target.value)}
                      placeholder="শিক্ষার্থীর নাম লিখুন..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      রোল নম্বর দিয়ে অনুসন্ধান (ঐচ্ছিক)
                    </label>
                    <input
                      type="text"
                      value={searchRollNumber}
                      onChange={(e) => setSearchRollNumber(e.target.value)}
                      placeholder="রোল নম্বর লিখুন..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Filter Action Buttons */}
            <div className="mt-4 flex gap-2 justify-start">
              {/* Refresh Button */}
              <button
                onClick={async () => {
                  setDataLoading(true);
                  await loadAllData();
                  setDataLoading(false);
                }}
                disabled={dataLoading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} />
                {dataLoading ? 'লোড হচ্ছে...' : 'রিফ্রেশ করুন'}
              </button>

              {/* Clear Filters Button */}
              {(selectedClass || selectedExam) && (
                <button
                  onClick={() => {
                    setSelectedClass('');
                    setSelectedExam('');
                    setExamSubjects([]);
                    setSearchStudentName('');
                    setSearchRollNumber('');
                  }}
                  className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  সব ফিল্টার পরিষ্কার করুন
                </button>
              )}

              {/* Calculate Grades and GPAs Button */}
              {selectedExam && filteredResults.length > 0 && (
                <button
                  onClick={calculateGradesAndGPAs}
                  disabled={calculating}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Calculator className={`w-4 h-4 ${calculating ? 'animate-pulse' : ''}`} />
                  {calculating ? 'ক্যালকুলেট হচ্ছে...' : 'ফলাফল ক্যালকুলেট করুন'}
                </button>
              )}
            </div>
          </div>
        </div>


        {/* Summary Statistics */}
        {selectedExam && selectedClass && pivotTableData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ক্লাসের সারসংক্ষেপ</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{toBengaliNumerals(pivotTableData.length)}</div>
                <div className="text-sm text-blue-800">মোট শিক্ষার্থী</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">
                  {toBengaliNumerals(pivotTableData.filter(s => s.isPass).length)}
                </div>
                <div className="text-sm text-green-800">পাস</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600">
                  {toBengaliNumerals(pivotTableData.filter(s => !s.isPass).length)}
                </div>
                <div className="text-sm text-red-800">ফেল</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {(pivotTableData.reduce((sum, s) => sum + s.averagePercentage, 0) / pivotTableData.length).toFixed(1)}%
                </div>
                <div className="text-sm text-purple-800">গড় শতাংশ</div>
              </div>
            </div>
          </div>
        )}

        {/* Results Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedExam ? `${selectedExam} - ফলাফল` : 'ফলাফল তালিকা'}
            </h3>
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-gray-600">
                {selectedExam
                  ? `স্টুডেন্ট: ${pivotTableData.length} টি, সাবজেক্ট: ${allSubjects.length} টি${searchStudentName || searchRollNumber ? ` (ফিল্টার করা)` : ''}`
                  : `মোট: ${examResults.length} টি ফলাফল`
                }
              </p>
            </div>
          </div>

          {examResults.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Target className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">কোনো ফলাফল পাওয়া যায়নি</h3>
              <p className="mt-1 text-sm text-gray-500">
                ফলাফল যোগ করার জন্য মার্ক এন্ট্রি পেজে যান
              </p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Target className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">কোনো ফলাফল মিলে নাই</h3>
              <p className="mt-1 text-sm text-gray-500">
                আপনার নির্বাচিত ফিল্টারের জন্য কোনো ফলাফল নেই। ফিল্টার পরিষ্কার করে আবার চেষ্টা করুন।
              </p>
              <div className="mt-4 text-xs text-gray-500">
                উপলব্ধ ক্লাস: {[...new Set(examResults.map(r => r.className))].join(', ')}<br/>
                উপলব্ধ পরীক্ষা: {[...new Set(examResults.map(r => r.examName))].join(', ')}
              </div>
            </div>
          ) : selectedExam && selectedClass ? (
            /* Results View */
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      স্টুডেন্ট আইডি
                      <button
                        onClick={() => {
                          setSortBy('studentId');
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        }}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        {sortBy === 'studentId' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      নাম
                      <button
                        onClick={() => {
                          setSortBy('name');
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        }}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        {sortBy === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ক্লাস
                    </th>
                    {allSubjects.map((subject) => (
                      <th key={subject} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {subject}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      মোট নম্বর
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      গড় শতাংশ
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      জিপিএ
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      গ্রেড
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      অবস্থা
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      র‍্যাঙ্ক
                      <button
                        onClick={() => {
                          setSortBy('rank');
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        }}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        {sortBy === 'rank' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pivotTableData.map((student, index) => {
                    const subjects = student.subjects;

                    return (
                      <tr key={`pivot-student-${student.studentId}-${student.className}-${student.studentName}-${index}`} className="hover:bg-gray-50">
                        {/* Student ID */}
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.studentId}
                        </td>
                        
                        {/* Student Name */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.studentName}
                        </td>
                        
                        {/* Class */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.className}
                        </td>
                        
                        {/* Subject Columns */}
                        {allSubjects.map((subject) => {
                          const subjectData = subjects.get(subject);
                          return (
                            <td key={subject} className="px-4 py-4 whitespace-nowrap text-center text-sm">
                              {subjectData && subjectData.obtainedMarks > 0 ? (
                                <div className="text-gray-900">
                                  <div className="font-medium">{toBengaliNumerals(subjectData.obtainedMarks)}</div>
                                  <div className="text-xs text-gray-500 font-medium">{subjectData.grade}</div>
                                </div>
                              ) : (
                                <div className="text-gray-400">
                                  <div className="font-medium">-</div>
                                  <div className="text-xs text-gray-400">-</div>
                                </div>
                              )}
                            </td>
                          );
                        })}
                        
                        {/* Total Marks */}
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                          <div className="font-medium">
                            {toBengaliNumerals(student.totalObtainedMarks)}
                          </div>
                        </td>
                        
                        {/* Average Percentage */}
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                          <div className="font-medium">
                            {toBengaliNumerals(student.averagePercentage)}%
                          </div>
                        </td>
                        
                        {/* GPA */}
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                          <div className="font-medium">
                            {student.averageGPA.toFixed(2)}
                          </div>
                        </td>
                        
                        {/* Overall Grade */}
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex px-3 py-1 text-sm font-bold rounded-full ${
                            student.overallGrade === 'A+' ? 'bg-yellow-100 text-yellow-800' :
                            student.overallGrade === 'A' ? 'bg-green-100 text-green-800' :
                            student.overallGrade === 'A-' ? 'bg-blue-100 text-blue-800' :
                            student.overallGrade === 'B' ? 'bg-indigo-100 text-indigo-800' :
                            student.overallGrade === 'C' ? 'bg-purple-100 text-purple-800' :
                            student.overallGrade === 'D' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {student.overallGrade}
                          </span>
                        </td>
                        
                        {/* Status */}
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                            student.isPass
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {student.isPass ? 'পাস' : 'ফেল'}
                          </span>
                        </td>
                        
                        {/* Rank Column */}
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                          <div className="flex items-center justify-center">
                            {student.rank <= 3 ? (
                              <div className="flex items-center space-x-1">
                                <Trophy className={`w-4 h-4 ${
                                  student.rank === 1 ? 'text-yellow-500' :
                                  student.rank === 2 ? 'text-gray-400' :
                                  'text-orange-600'
                                }`} />
                                <span className={`font-medium ${
                                  student.rank === 1 ? 'text-yellow-600' :
                                  student.rank === 2 ? 'text-gray-600' :
                                  'text-orange-600'
                                }`}>
                                  {toBengaliNumerals(student.rank)}
                                </span>
                              </div>
                            ) : (
                              <span className="font-medium text-gray-600">{toBengaliNumerals(student.rank)}</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      স্টুডেন্ট আইডি
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      নাম
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ক্লাস
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      বিষয়
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      পরীক্ষা
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      প্রাপ্ত নম্বর
                    </th>
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
                  {filteredResults.map((result, index) => (
                    <tr key={`filtered-result-${result.id || `${result.studentId}-${result.subject}-${result.examName}`}-${result.studentName}-${index}`} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {result.studentId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.studentName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.className}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.examName}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {result.obtainedMarks}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {result.totalMarks}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {result.percentage}%
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          result.grade === 'A+' || result.grade === 'A' ? 'bg-green-100 text-green-800' :
                          result.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                          result.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                          result.grade === 'D' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {result.grade || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          result.percentage >= 40
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {result.percentage >= 40 ? 'পাস' : 'ফেল'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-t-2xl p-6 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">ফলাফল ক্যালকুলেশন সম্পন্ন!</h3>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">সারসংক্ষেপ</h4>
              </div>

              {/* Statistics */}
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 px-4 bg-blue-50 rounded-lg">
                  <span className="text-gray-700 font-medium">মোট শিক্ষার্থী</span>
                  <span className="text-2xl font-bold text-blue-600">{toBengaliNumerals(successData.totalStudents)} জন</span>
                </div>

                <div className="flex items-center justify-between py-3 px-4 bg-green-50 rounded-lg">
                  <span className="text-gray-700 font-medium">পাস</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-green-600">{toBengaliNumerals(successData.passCount)} জন</span>
                    <span className="text-sm text-green-600 ml-2">({successData.passRate}%)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 px-4 bg-red-50 rounded-lg">
                  <span className="text-gray-700 font-medium">ফেল</span>
                  <span className="text-2xl font-bold text-red-600">{toBengaliNumerals(successData.failCount)} জন</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 rounded-b-2xl px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
              >
                ঠিক আছে
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default ExamResultsPage;
