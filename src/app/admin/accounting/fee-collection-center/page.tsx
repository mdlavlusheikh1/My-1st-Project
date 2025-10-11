'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { User as AuthUser, onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import ProtectedRoute from '@/components/ProtectedRoute';
import { studentQueries, accountingQueries } from '@/lib/database-queries';
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
  CreditCard,
  Search,
  Bell,
  Plus,
  Save,
  ArrowLeft,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader2,
  Edit,
  Trash2,
  RefreshCw,
  GraduationCap,
  FileText,
  Award,
  Building,
  Package,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckSquare,
  Users as UsersIcon,
  Calculator,
  Receipt,
  Wallet,
  Target,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ArrowDownLeft,
  Calendar as CalendarIcon,
  Filter,
  Download,
  Eye,
  UserCheck,
  Coins,
  PiggyBank,
  CreditCard as CreditCardIcon,
  BookOpen as BookOpenIcon
} from 'lucide-react';

interface FeeCollectionSummary {
  totalStudents: number;
  totalCollected: number;
  totalPending: number;
  totalOverdue: number;
  collectionRate: number;
  recentCollections: number;
  thisMonthCollection: number;
  lastMonthCollection: number;
}

interface ClassWiseSummary {
  className: string;
  totalStudents: number;
  collectedAmount: number;
  pendingAmount: number;
  collectionRate: number;
  lastCollectionDate?: string;
  // Additional detailed breakdown
  tuitionCollected?: number;
  examCollected?: number;
  admissionCollected?: number;
  expectedTuitionAmount?: number;
  expectedExamAmount?: number;
  expectedAdmissionAmount?: number;
  classSpecificFee?: number;
}

function FeeCollectionCenter() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Summary states
  const [tuitionSummary, setTuitionSummary] = useState<FeeCollectionSummary>({
    totalStudents: 0,
    totalCollected: 0,
    totalPending: 0,
    totalOverdue: 0,
    collectionRate: 0,
    recentCollections: 0,
    thisMonthCollection: 0,
    lastMonthCollection: 0
  });

  const [examSummary, setExamSummary] = useState<FeeCollectionSummary>({
    totalStudents: 0,
    totalCollected: 0,
    totalPending: 0,
    totalOverdue: 0,
    collectionRate: 0,
    recentCollections: 0,
    thisMonthCollection: 0,
    lastMonthCollection: 0
  });

  const [admissionSummary, setAdmissionSummary] = useState<FeeCollectionSummary>({
    totalStudents: 0,
    totalCollected: 0,
    totalPending: 0,
    totalOverdue: 0,
    collectionRate: 0,
    recentCollections: 0,
    thisMonthCollection: 0,
    lastMonthCollection: 0
  });

  const [classWiseSummaries, setClassWiseSummaries] = useState<ClassWiseSummary[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  // Exam student list states
  const [showExamStudentList, setShowExamStudentList] = useState(false);
  const [examSearchTerm, setExamSearchTerm] = useState('');
  const [examStatusFilter, setExamStatusFilter] = useState('all');
  const [examStudents, setExamStudents] = useState<any[]>([]);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        loadAllSummaries();
        setupRealTimeListeners();
      } else {
        router.push('/auth/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const loadAllSummaries = async () => {
    try {
      await Promise.all([
        loadTuitionSummary(),
        loadExamSummary(),
        loadAdmissionSummary(),
        loadClassWiseSummaries(),
        loadRecentActivities()
      ]);
    } catch (error) {
      console.error('Error loading summaries:', error);
    }
  };

  const loadTuitionSummary = async () => {
    try {
      const schoolId = 'iqra-school-2025';

      // Get all students
      const studentsData = await studentQueries.getAllStudents();
      const totalStudents = studentsData.length;

      // Get tuition fee transactions (salary collection is used for tuition fees)
      const allTransactions = await accountingQueries.getAllTransactions(schoolId);
      const tuitionTransactions = allTransactions.filter((transaction: any) =>
        transaction.category === 'salary' && transaction.status === 'completed'
      );

      // Calculate total collected amount for tuition fees
      const totalCollected = tuitionTransactions.reduce((sum: number, transaction: any) =>
        sum + (transaction.paidAmount || transaction.amount || 0), 0
      );

      // Get current month's transactions
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const thisMonthTransactions = tuitionTransactions.filter((transaction: any) => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getMonth() === currentMonth &&
               transactionDate.getFullYear() === currentYear;
      });

      const thisMonthCollection = thisMonthTransactions.reduce((sum: number, transaction: any) =>
        sum + (transaction.paidAmount || transaction.amount || 0), 0
      );

      // Get last month's transactions
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const lastMonthTransactions = tuitionTransactions.filter((transaction: any) => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getMonth() === lastMonth &&
               transactionDate.getFullYear() === lastMonthYear;
      });

      const lastMonthCollection = lastMonthTransactions.reduce((sum: number, transaction: any) =>
        sum + (transaction.paidAmount || transaction.amount || 0), 0
      );

      // Get donation transactions that might offset tuition fees
      const donationTransactions = allTransactions.filter((transaction: any) =>
        transaction.category === 'donation' && transaction.status === 'completed'
      );

      const totalDonations = donationTransactions.reduce((sum: number, transaction: any) =>
        sum + (transaction.paidAmount || transaction.amount || 0), 0
      );

      // Calculate collection rate (assuming average tuition fee per student is 3000)
      const averageTuitionFee = 3000;
      const expectedTotalAmount = totalStudents * averageTuitionFee;

      // Subtract donations from expected amount (donations reduce the pending amount)
      const effectiveExpectedAmount = Math.max(0, expectedTotalAmount - totalDonations);
      const collectionRate = effectiveExpectedAmount > 0
        ? Math.round((totalCollected / effectiveExpectedAmount) * 100)
        : 0;

      const totalPending = Math.max(0, effectiveExpectedAmount - totalCollected);

      // Count recent collections (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentTransactions = tuitionTransactions.filter((transaction: any) =>
        new Date(transaction.date) >= sevenDaysAgo
      );
      const recentCollections = recentTransactions.length;

      setTuitionSummary({
        totalStudents,
        totalCollected,
        totalPending,
        totalOverdue: Math.round(totalPending * 0.2), // Assume 20% of pending is overdue
        collectionRate,
        recentCollections,
        thisMonthCollection,
        lastMonthCollection
      });
    } catch (error) {
      console.error('Error loading tuition summary:', error);

      // Fallback to zero data if Firebase fails
      setTuitionSummary({
        totalStudents: 0,
        totalCollected: 0,
        totalPending: 0,
        totalOverdue: 0,
        collectionRate: 0,
        recentCollections: 0,
        thisMonthCollection: 0,
        lastMonthCollection: 0
      });
    }
  };

  const loadExamSummary = async () => {
    try {
      const schoolId = 'iqra-school-2025';

      // Get all students
      const studentsData = await studentQueries.getAllStudents();
      const totalStudents = studentsData.length;

      // Get exam fee transactions from financial transactions
      const allTransactions = await accountingQueries.getAllTransactions(schoolId);
      const examTransactions = allTransactions.filter((transaction: any) =>
        transaction.category === 'exam_fee' && transaction.status === 'completed'
      );

      // Calculate total collected amount for exam fees
      const totalCollected = examTransactions.reduce((sum: number, transaction: any) =>
        sum + (transaction.paidAmount || transaction.amount || 0), 0
      );

      // Get current month's transactions
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const thisMonthTransactions = examTransactions.filter((transaction: any) => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getMonth() === currentMonth &&
               transactionDate.getFullYear() === currentYear;
      });

      const thisMonthCollection = thisMonthTransactions.reduce((sum: number, transaction: any) =>
        sum + (transaction.paidAmount || transaction.amount || 0), 0
      );

      // Get last month's transactions
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const lastMonthTransactions = examTransactions.filter((transaction: any) => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getMonth() === lastMonth &&
               transactionDate.getFullYear() === lastMonthYear;
      });

      const lastMonthCollection = lastMonthTransactions.reduce((sum: number, transaction: any) =>
        sum + (transaction.paidAmount || transaction.amount || 0), 0
      );

      // Calculate collection rate (assuming average exam fee per student is 300)
      const averageExamFee = 300;
      const expectedTotalAmount = totalStudents * averageExamFee;
      const collectionRate = expectedTotalAmount > 0
        ? Math.round((totalCollected / expectedTotalAmount) * 100)
        : 0;

      const totalPending = Math.max(0, expectedTotalAmount - totalCollected);

      // Count recent collections (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentTransactions = examTransactions.filter((transaction: any) =>
        new Date(transaction.date) >= sevenDaysAgo
      );
      const recentCollections = recentTransactions.length;

      setExamSummary({
        totalStudents,
        totalCollected,
        totalPending,
        totalOverdue: Math.round(totalPending * 0.2), // Assume 20% of pending is overdue
        collectionRate,
        recentCollections,
        thisMonthCollection,
        lastMonthCollection
      });
    } catch (error) {
      console.error('Error loading exam summary:', error);

      // Fallback to zero data if Firebase fails
      setExamSummary({
        totalStudents: 0,
        totalCollected: 0,
        totalPending: 0,
        totalOverdue: 0,
        collectionRate: 0,
        recentCollections: 0,
        thisMonthCollection: 0,
        lastMonthCollection: 0
      });
    }
  };

  const loadAdmissionSummary = async () => {
    try {
      const schoolId = 'iqra-school-2025';

      // Get all students
      const studentsData = await studentQueries.getAllStudents();
      const totalStudents = studentsData.length;

      // Get admission fee transactions from financial transactions
      const allTransactions = await accountingQueries.getAllTransactions(schoolId);
      const admissionTransactions = allTransactions.filter((transaction: any) =>
        transaction.category === 'admission_fee' && transaction.status === 'completed'
      );

      // Calculate total collected amount for admission fees
      const totalCollected = admissionTransactions.reduce((sum: number, transaction: any) =>
        sum + (transaction.paidAmount || transaction.amount || 0), 0
      );

      // Get current month's transactions
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const thisMonthTransactions = admissionTransactions.filter((transaction: any) => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getMonth() === currentMonth &&
               transactionDate.getFullYear() === currentYear;
      });

      const thisMonthCollection = thisMonthTransactions.reduce((sum: number, transaction: any) =>
        sum + (transaction.paidAmount || transaction.amount || 0), 0
      );

      // Get last month's transactions
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const lastMonthTransactions = admissionTransactions.filter((transaction: any) => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getMonth() === lastMonth &&
               transactionDate.getFullYear() === lastMonthYear;
      });

      const lastMonthCollection = lastMonthTransactions.reduce((sum: number, transaction: any) =>
        sum + (transaction.paidAmount || transaction.amount || 0), 0
      );

      // Calculate collection rate (assuming average admission fee per student is 2000)
      const averageAdmissionFee = 2000;
      const expectedTotalAmount = totalStudents * averageAdmissionFee;
      const collectionRate = expectedTotalAmount > 0
        ? Math.round((totalCollected / expectedTotalAmount) * 100)
        : 0;

      const totalPending = Math.max(0, expectedTotalAmount - totalCollected);

      // Count recent collections (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentTransactions = admissionTransactions.filter((transaction: any) =>
        new Date(transaction.date) >= sevenDaysAgo
      );
      const recentCollections = recentTransactions.length;

      setAdmissionSummary({
        totalStudents,
        totalCollected,
        totalPending,
        totalOverdue: Math.round(totalPending * 0.2), // Assume 20% of pending is overdue
        collectionRate,
        recentCollections,
        thisMonthCollection,
        lastMonthCollection
      });
    } catch (error) {
      console.error('Error loading admission summary:', error);

      // Fallback to zero data if Firebase fails
      setAdmissionSummary({
        totalStudents: 0,
        totalCollected: 0,
        totalPending: 0,
        totalOverdue: 0,
        collectionRate: 0,
        recentCollections: 0,
        thisMonthCollection: 0,
        lastMonthCollection: 0
      });
    }
  };

  const loadClassWiseSummaries = async () => {
    try {
      const schoolId = 'iqra-school-2025';

      // Get all students to group by class
      const studentsData = await studentQueries.getAllStudents();

      // Get all transactions for this school
      const allTransactions = await accountingQueries.getAllTransactions(schoolId);

      // Get class-specific fee structures
      const classFees = await accountingQueries.getClassSpecificFees(schoolId);

      // Group students by class
      const classGroups = studentsData.reduce((acc: any, student: any) => {
        const className = student.class || 'No Class';
        if (!acc[className]) {
          acc[className] = [];
        }
        acc[className].push(student);
        return acc;
      }, {});

      // Calculate class-wise summaries with detailed breakdown
      const classWiseData: ClassWiseSummary[] = await Promise.all(
        Object.entries(classGroups).map(async ([className, students]: [string, any]) => {
          const classStudents = students as any[];
          const totalStudents = classStudents.length;

          // Get class-specific fee amount, fallback to default if not found
          const classSpecificFee = classFees[className] || 3000; // Default 3000 if not set

          // Get transactions for students in this class (all types of fees)
          const classTransactions = allTransactions.filter((transaction: any) =>
            classStudents.some((student: any) => student.uid === transaction.studentId) &&
            transaction.status === 'completed'
          );

          // Separate transactions by type for better analysis
          const tuitionTransactions = classTransactions.filter((t: any) => t.category === 'salary');
          const examTransactions = classTransactions.filter((t: any) => t.category === 'exam_fee');
          const admissionTransactions = classTransactions.filter((t: any) => t.category === 'admission_fee');

          // Calculate total collected amount for this class
          const collectedAmount = classTransactions.reduce((sum: number, transaction: any) =>
            sum + (transaction.paidAmount || transaction.amount || 0), 0
          );

          // Calculate expected amounts based on different fee types
          const expectedTuitionAmount = totalStudents * classSpecificFee;
          const expectedExamAmount = totalStudents * 300; // Average exam fee
          const expectedAdmissionAmount = totalStudents * 2000; // Average admission fee
          const expectedTotalAmount = expectedTuitionAmount + expectedExamAmount + expectedAdmissionAmount;

          // Calculate collection rate
          const collectionRate = expectedTotalAmount > 0
            ? Math.round((collectedAmount / expectedTotalAmount) * 100)
            : 0;

          const pendingAmount = Math.max(0, expectedTotalAmount - collectedAmount);

          // Get the latest collection date for this class
          const sortedTransactions = classTransactions.sort((a: any, b: any) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          const lastCollectionDate = sortedTransactions.length > 0
            ? sortedTransactions[0].date
            : undefined;

          // Calculate additional metrics
          const tuitionCollected = tuitionTransactions.reduce((sum: number, t: any) =>
            sum + (t.paidAmount || t.amount || 0), 0);
          const examCollected = examTransactions.reduce((sum: number, t: any) =>
            sum + (t.paidAmount || t.amount || 0), 0);
          const admissionCollected = admissionTransactions.reduce((sum: number, t: any) =>
            sum + (t.paidAmount || t.amount || 0), 0);

          return {
            className,
            totalStudents,
            collectedAmount,
            pendingAmount,
            collectionRate,
            lastCollectionDate,
            // Additional detailed breakdown
            tuitionCollected,
            examCollected,
            admissionCollected,
            expectedTuitionAmount,
            expectedExamAmount,
            expectedAdmissionAmount,
            classSpecificFee
          };
        })
      );

      // Sort by class name (Bengali alphabetical order)
      classWiseData.sort((a, b) => a.className.localeCompare(b.className, 'bn'));

      setClassWiseSummaries(classWiseData);
    } catch (error) {
      console.error('Error loading class-wise summaries:', error);

      // Fallback to mock data if Firebase fails
      const fallbackData: ClassWiseSummary[] = [
        {
          className: 'প্রথম',
          totalStudents: 0,
          collectedAmount: 0,
          pendingAmount: 0,
          collectionRate: 0,
          lastCollectionDate: undefined,
          tuitionCollected: 0,
          examCollected: 0,
          admissionCollected: 0,
          expectedTuitionAmount: 0,
          expectedExamAmount: 0,
          expectedAdmissionAmount: 0,
          classSpecificFee: 3000
        },
        {
          className: 'দ্বিতীয়',
          totalStudents: 0,
          collectedAmount: 0,
          pendingAmount: 0,
          collectionRate: 0,
          lastCollectionDate: undefined,
          tuitionCollected: 0,
          examCollected: 0,
          admissionCollected: 0,
          expectedTuitionAmount: 0,
          expectedExamAmount: 0,
          expectedAdmissionAmount: 0,
          classSpecificFee: 3000
        }
      ];
      setClassWiseSummaries(fallbackData);
    }
  };

  const loadRecentActivities = async () => {
    try {
      // Mock recent activities - in real implementation, fetch from API
      const mockActivities = [
        {
          id: 1,
          type: 'tuition',
          studentName: 'মোহাম্মদ রহিম',
          className: 'প্রথম',
          amount: 1500,
          date: '২০২৫-০১-১৫',
          status: 'collected',
          collectedBy: 'আবদুল করিম'
        },
        {
          id: 2,
          type: 'exam',
          studentName: 'ফাতেমা আক্তার',
          className: 'দ্বিতীয়',
          amount: 300,
          date: '২০২৫-০১-১৫',
          status: 'collected',
          collectedBy: 'সালেহা বেগম'
        },
        {
          id: 3,
          type: 'admission',
          studentName: 'আহমেদ হোসেন',
          className: 'নতুন ভর্তি',
          amount: 2000,
          date: '২০২৫-০১-১৪',
          status: 'collected',
          collectedBy: 'আবদুল করিম'
        }
      ];

      setRecentActivities(mockActivities);
    } catch (error) {
      console.error('Error loading recent activities:', error);
    }
  };

  const setupRealTimeListeners = () => {
    // Set up real-time listeners for different collections
    // This would listen to tuition, exam, and admission fee collections
  };

  // Computed filtered exam students
  const filteredExamStudents = useMemo(() => {
    let filtered = examStudents;

    // Apply search filter
    if (examSearchTerm) {
      filtered = filtered.filter(student =>
        student.displayName?.toLowerCase().includes(examSearchTerm.toLowerCase()) ||
        student.name?.toLowerCase().includes(examSearchTerm.toLowerCase()) ||
        student.studentId?.toLowerCase().includes(examSearchTerm.toLowerCase()) ||
        student.class?.toLowerCase().includes(examSearchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (examStatusFilter !== 'all') {
      filtered = filtered.filter(student => student.examFeeStatus === examStatusFilter);
    }

    return filtered;
  }, [examStudents, examSearchTerm, examStatusFilter]);

  // Load exam students data
  const loadExamStudents = async () => {
    try {
      const schoolId = 'iqra-school-2025';
      const studentsData = await studentQueries.getAllStudents();
      const allTransactions = await accountingQueries.getAllTransactions(schoolId);

      // Process each student to determine their exam fee status
      const processedStudents = studentsData.map((student: any) => {
        // Get exam fee transactions for this student
        const studentExamTransactions = allTransactions.filter((transaction: any) =>
          transaction.studentId === student.uid &&
          transaction.category === 'exam_fee' &&
          transaction.status === 'completed'
        );

        // Determine exam fee status
        let examFeeStatus = 'pending';
        let lastPaymentDate = null;
        let overdueDays = 0;

        if (studentExamTransactions.length > 0) {
          examFeeStatus = 'paid';
          // Get the most recent payment
          const sortedTransactions = studentExamTransactions.sort((a: any, b: any) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          lastPaymentDate = sortedTransactions[0].date;

          // Check if payment is overdue (more than 30 days)
          const paymentDate = new Date(sortedTransactions[0].date);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          if (paymentDate < thirtyDaysAgo) {
            examFeeStatus = 'overdue';
            overdueDays = Math.floor((thirtyDaysAgo.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));
          }
        } else {
          // Check if student has any pending exam fees (no transactions means pending)
          examFeeStatus = 'pending';
        }

        return {
          ...student,
          examFeeStatus,
          lastPaymentDate,
          overdueDays
        };
      });

      setExamStudents(processedStudents);
    } catch (error) {
      console.error('Error loading exam students:', error);
      setExamStudents([]);
    }
  };

  // Handle exam fee payment
  const handleExamFeePayment = (student: any) => {
    // Navigate to exam fee collection page with student data
    router.push(`/admin/accounting/collect-exam-fee?studentId=${student.uid}&studentName=${encodeURIComponent(student.displayName || student.name || '')}`);
  };

  // Handle view exam fee details
  const handleViewExamFeeDetails = (student: any) => {
    // Navigate to student details page or show modal with exam fee history
    router.push(`/admin/students/view?id=${student.uid}`);
  };

  const menuItems = [
    { icon: Home, label: 'ড্যাশবোর্ড', href: '/admin/dashboard', active: false },
    { icon: Users, label: 'শিক্ষার্থী', href: '/admin/students', active: false },
    { icon: GraduationCap, label: 'শিক্ষক', href: '/admin/teachers', active: false },
    { icon: Building, label: 'অভিভাবক', href: '/admin/parents', active: false },
    { icon: BookOpen, label: 'ক্লাস', href: '/admin/classes', active: false },
    { icon: ClipboardList, label: 'উপস্থিতি', href: '/admin/attendance', active: false },
    { icon: Calendar, label: 'ইভেন্ট', href: '/admin/events', active: false },
    { icon: CreditCard, label: 'হিসাব', href: '/admin/accounting', active: true },
    { icon: Settings, label: 'Donation', href: '/admin/donation', active: false },
    { icon: Home, label: 'পরীক্ষা', href: '/admin/exams', active: false },
    { icon: BookOpen, label: 'বিষয়', href: '/admin/subjects', active: false },
    { icon: Users, label: 'সাপোর্ট', href: '/admin/support', active: false },
    { icon: Calendar, label: 'বার্তা', href: '/admin/accounts', active: false },
    { icon: Settings, label: 'Generate', href: '/admin/generate', active: false },
    { icon: Package, label: 'ইনভেন্টরি', href: '/admin/inventory', active: false },
    { icon: Users, label: 'অভিযোগ', href: '/admin/misc', active: false },
    { icon: Settings, label: 'সেটিংস', href: '/admin/settings', active: false },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
                  <h1 className="text-xl font-semibold text-gray-900 leading-tight">ফি আদায় কেন্দ্র</h1>
                  <p className="text-sm text-gray-600 leading-tight">সকল ধরনের ফি সংগ্রহের সমন্বিত ব্যবস্থাপনা</p>
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
                onClick={() => router.push('/admin/accounting')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>হিসাবে ফিরে যান</span>
              </button>
            </div>



            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Tuition Fee Collection */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-blue-600" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">টিউশন ফি আদায়</h3>
                <p className="text-gray-600 text-sm mb-3">মাসিক টিউশন ফি সংগ্রহ করুন</p>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl font-bold text-green-600">৳{tuitionSummary.totalCollected.toLocaleString()}</div>
                  <div className={`text-sm px-2 py-1 rounded-full ${
                    tuitionSummary.collectionRate >= 70 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {tuitionSummary.collectionRate}% আদায়
                  </div>
                </div>
                <button
                  onClick={() => router.push('/admin/accounting/collect-salary')}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  টিউশন ফি আদায় করুন
                </button>
              </div>

              {/* Exam Fee Collection */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">পরীক্ষার ফি আদায়</h3>
                <p className="text-gray-600 text-sm mb-3">পরীক্ষার ফি সংগ্রহ করুন</p>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl font-bold text-green-600">৳{examSummary.totalCollected.toLocaleString()}</div>
                  <div className={`text-sm px-2 py-1 rounded-full ${
                    examSummary.collectionRate >= 70 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {examSummary.collectionRate}% আদায়
                  </div>
                </div>
                <button
                  onClick={() => router.push('/admin/accounting/collect-exam-fee')}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  পরীক্ষার ফি আদায় করুন
                </button>
              </div>

              {/* Admission & Session Fee Collection */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">ভর্তি ও সেশন ফি আদায়</h3>
                <p className="text-gray-600 text-sm mb-3">ভর্তি এবং সেশন ফি সংগ্রহ করুন</p>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl font-bold text-green-600">৳{admissionSummary.totalCollected.toLocaleString()}</div>
                  <div className={`text-sm px-2 py-1 rounded-full ${
                    admissionSummary.collectionRate >= 70 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {admissionSummary.collectionRate}% আদায়
                  </div>
                </div>
                <button
                  onClick={() => router.push('/admin/accounting/collect-admission-fee')}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  ভর্তি ফি আদায় করুন
                </button>
              </div>
            </div>



            {/* Exam Fee Student List Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">পরীক্ষার ফি আদায় - শিক্ষার্থী তালিকা</h3>
                  <button
                    onClick={() => setShowExamStudentList(!showExamStudentList)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  >
                    <Users className="w-4 h-4" />
                    <span>{showExamStudentList ? 'লুকান' : 'দেখান'}</span>
                  </button>
                </div>
              </div>

              {showExamStudentList && (
                <div className="p-6">
                  {/* Search and Filter Controls */}
                  <div className="mb-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
                        <div className="relative flex-1 max-w-md">
                          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            placeholder="শিক্ষার্থী খুঁজুন..."
                            value={examSearchTerm}
                            onChange={(e) => setExamSearchTerm(e.target.value)}
                            className="pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
                          />
                        </div>
                        <select
                          value={examStatusFilter}
                          onChange={(e) => setExamStatusFilter(e.target.value)}
                          className="px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="all">সব স্ট্যাটাস</option>
                          <option value="paid">পরিশোধিত</option>
                          <option value="pending">বকেয়া</option>
                          <option value="overdue">বিলম্বিত</option>
                        </select>
                      </div>

                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => router.push('/admin/accounting/collect-exam-fee')}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>নতুন আদায়</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Student List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredExamStudents.map((student) => (
                      <div key={student.uid} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center overflow-hidden">
                            {student.profileImage ? (
                              <img
                                src={student.profileImage}
                                alt={student.displayName || student.name || 'Student'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-bold text-lg">
                                {student.displayName?.split(' ')[0].charAt(0) || student.email?.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{student.displayName || student.name || 'Unknown Student'}</h3>
                            <p className="text-sm text-gray-600">ID: {student.studentId || 'N/A'}</p>
                            <p className="text-sm text-gray-600">{student.class || 'No Class'}</p>
                          </div>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">পরীক্ষার ফি:</span>
                            <span className="text-sm font-medium">৳300</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">স্ট্যাটাস:</span>
                            <span className={`text-sm px-2 py-1 rounded-full ${
                              student.examFeeStatus === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : student.examFeeStatus === 'overdue'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {student.examFeeStatus === 'paid' ? 'পরিশোধিত' :
                               student.examFeeStatus === 'overdue' ? 'বিলম্বিত' : 'বকেয়া'}
                            </span>
                          </div>
                          {student.examFeeStatus === 'paid' && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">পরিশোধের তারিখ:</span>
                              <span className="text-sm text-green-600">{student.lastPaymentDate || 'N/A'}</span>
                            </div>
                          )}
                          {student.examFeeStatus === 'overdue' && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">বিলম্বের দিন:</span>
                              <span className="text-sm text-red-600">{student.overdueDays || 0} দিন</span>
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          {student.examFeeStatus !== 'paid' ? (
                            <button
                              onClick={() => handleExamFeePayment(student)}
                              className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 flex items-center justify-center space-x-1"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>ফি আদায় করুন</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleViewExamFeeDetails(student)}
                              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 flex items-center justify-center space-x-1"
                            >
                              <Eye className="w-4 h-4" />
                              <span>বিস্তারিত দেখুন</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredExamStudents.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">কোন শিক্ষার্থী পাওয়া যায়নি</h3>
                      <p className="mt-1 text-sm text-gray-500">অনুসন্ধান ফিল্টার পরিবর্তন করুন</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Class-wise Performance Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">ক্লাসভিত্তিক ফি আদায়ের অবস্থা</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ক্লাস
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        মোট শিক্ষার্থী
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        আদায়কৃত
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        বকেয়া
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        আদায় হার
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        শেষ আদায়
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {classWiseSummaries.map((classData) => (
                      <tr key={classData.className} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{classData.className}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm text-gray-900">{classData.totalStudents}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm font-medium text-green-600">৳{classData.collectedAmount.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm font-medium text-orange-600">৳{classData.pendingAmount.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center">
                            <div className={`w-16 h-2 rounded-full mr-2 ${
                              classData.collectionRate >= 80 ? 'bg-green-500' :
                              classData.collectionRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}>
                              <div
                                className="h-2 bg-current rounded-full"
                                style={{ width: `${classData.collectionRate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-900">{classData.collectionRate}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm text-gray-600">{classData.lastCollectionDate || 'N/A'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeeCollectionCenterWrapper() {
  return (
    <ProtectedRoute requireAuth={true}>
      <FeeCollectionCenter />
    </ProtectedRoute>
  );
}
