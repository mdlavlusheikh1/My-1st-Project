'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { User as AuthUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { studentQueries, accountingQueries, feeQueries, inventoryQueries, InventoryItem } from '@/lib/database-queries';
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
  Download,
  ArrowUpRight,
  DollarSign,
  Receipt,
  Wallet,
  Loader2,
  Save,
  Calculator,
  User,
  GraduationCap,
  Building,
  CreditCard,
  Package,
  Filter,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  Clock,
  Award,
  FileText
} from 'lucide-react';

interface AdmissionStudent {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  className: string;
  section: string;
  studentType: 'new_admission' | 'promoted' | 'imported';
  admissionFee: number;
  sessionFee: number;
  registrationFee: number;
  totalAdmissionFees: number;
  paidAmount: number;
  dueAmount: number;
  status: 'paid' | 'partial' | 'due';
  paymentDate?: string;
}

function CollectAdmissionFeePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Search and filter state
  const [searchName, setSearchName] = useState<string>('');
  const [searchAdmissionNumber, setSearchAdmissionNumber] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('সকল শ্রেণি');

  // Data state
  const [students, setStudents] = useState<any[]>([]);
  const [admissionStudents, setAdmissionStudents] = useState<AdmissionStudent[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<AdmissionStudent[]>([]);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<AdmissionStudent | null>(null);

  // Notification state
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success'
  });

  // Form state for payment collection
  const [formData, setFormData] = useState({
    admissionFee: '0',
    sessionFee: '0',
    registrationFee: '0',
    paidAmount: '0',
    discount: '0',
    dueAmount: '0',
    paymentMethod: 'নগদ',
    date: new Date().toISOString().split('T')[0],
    voucherNumber: '',
    collectedBy: ''
  });

  // Inventory state
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [selectedInventoryItems, setSelectedInventoryItems] = useState<{[key: string]: number}>({});
  const [inventoryLoading, setInventoryLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);

  // Sales state
  const [totalSales, setTotalSales] = useState(0);

  const router = useRouter();
  const { userData } = useAuth();

  // Auto-calculation effect for due amount
  useEffect(() => {
    if (!selectedStudent) return;

    const currentPaidAmount = parseFloat(formData.paidAmount) || 0;
    const discount = parseFloat(formData.discount) || 0;

    // Calculate remaining amount correctly
    // Formula: Due Amount = Original Due - Current Payment - Discount
    const originalDue = selectedStudent.dueAmount;
    const remainingAmount = Math.max(0, originalDue - currentPaidAmount - discount);

    setFormData(prev => ({
      ...prev,
      dueAmount: remainingAmount.toString()
    }));
  }, [formData.paidAmount, formData.discount, selectedStudent]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        loadData();
      } else {
        router.push('/auth/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading admission fee data...');

      // Get all students
      const studentsData = await studentQueries.getAllStudents();
      console.log('📊 Students loaded:', studentsData.length);
      console.log('📋 Student details:', studentsData.map(s => ({
        uid: s.uid,
        name: s.name || s.displayName,
        class: s.class,
        role: s.role
      })));

      setStudents(studentsData);

      // Get existing admission fee transactions
      const schoolId = 'iqra-school-2025';
      const existingTransactions = await accountingQueries.getAllTransactions(schoolId);
      console.log('💰 Existing transactions:', existingTransactions.length);

      // Get admission fees structure
      const admissionFeesRef = await getDoc(doc(db, 'admissionFees', schoolId));
      console.log('📄 Admission fees document exists:', admissionFeesRef.exists());

      let admissionFees = [
        { feeName: 'ভর্তি ফি', amount: 2000, isActive: true },
        { feeName: 'সেশন ফি', amount: 1000, isActive: true },
        { feeName: 'রেজিস্ট্রেশন ফি', amount: 500, isActive: true }
      ];

      if (admissionFeesRef.exists()) {
        const data = admissionFeesRef.data();
        console.log('📋 Admission fees data:', data);
        if (data.fees && Array.isArray(data.fees)) {
          admissionFees = data.fees;
        }
      }

      console.log('💰 Final admission fees structure:', admissionFees);

      // Process students for admission fees
      const processedStudents: AdmissionStudent[] = studentsData
        .filter(student => student.role === 'student') // Only process students
        .map((student, index) => {
          console.log(`🔄 Processing student ${index + 1}:`, student.name || student.displayName);

          // Generate admission number if not exists
          const admissionNumber = (student as any).admissionNumber || `ADMS-2025-${Math.floor(Math.random() * 9000) + 1000}`;
          console.log(`🎫 Admission number: ${admissionNumber}`);

          // Find existing admission fee payments for this student
          const admissionTransactions = existingTransactions.filter(t =>
            t.studentId === student.uid &&
            (t.category === 'admission_fee' || t.category === 'session_fee' || t.category === 'registration_fee') &&
            t.status === 'completed'
          );
          console.log(`💳 Found ${admissionTransactions.length} existing transactions for student`);

          // Calculate fees based on active fee structure
          const admissionFee = admissionFees.find(f => f.feeName === 'ভর্তি ফি')?.amount || 2000;
          const sessionFee = admissionFees.find(f => f.feeName === 'সেশন ফি')?.amount || 1000;
          const registrationFee = admissionFees.find(f => f.feeName === 'রেজিস্ট্রেশন ফি')?.amount || 500;

          // Determine student type based on class or other criteria
          let studentType: 'new_admission' | 'promoted' | 'imported' = 'new_admission';

          // Simple logic to determine student type (can be enhanced based on business rules)
          if (student.class === 'প্লে' || student.class === 'নার্সারি') {
            studentType = 'new_admission'; // New students in play/nursery
          } else if (parseInt(student.class?.replace(/\D/g, '') || '1') > 5) {
            studentType = 'promoted'; // Higher class students are promoted
          } else {
            studentType = 'imported'; // Others are imported
          }

          // Calculate fees based on student type
          const paidAmount = admissionTransactions.reduce((sum, t) => sum + (t.paidAmount || 0), 0);

          // Calculate due amount based on student type
          let dueAmount = 0;
          if (studentType === 'new_admission') {
            dueAmount = Math.max(0, admissionFee - paidAmount);
          } else if (studentType === 'promoted' || studentType === 'imported') {
            dueAmount = Math.max(0, sessionFee - paidAmount);
          }

          // Calculate total for reference (not used for due calculation)
          const totalAdmissionFees = studentType === 'new_admission'
            ? admissionFee + sessionFee + registrationFee
            : sessionFee;

          let status: 'paid' | 'partial' | 'due' = 'due';
          if (paidAmount === 0) {
            status = 'due';
          } else if (paidAmount >= totalAdmissionFees) {
            status = 'paid';
          } else {
            status = 'partial';
          }

          console.log(`✅ Student processed: ${student.name || student.displayName} - Status: ${status}, Due: ৳${dueAmount}`);

          return {
            studentId: student.uid,
            studentName: student.name || student.displayName || 'Unknown Student',
            admissionNumber: admissionNumber,
            className: student.class || 'N/A',
            section: student.section || 'A',
            studentType,
            admissionFee,
            sessionFee,
            registrationFee,
            totalAdmissionFees,
            paidAmount,
            dueAmount,
            status,
            paymentDate: admissionTransactions.length > 0 ? admissionTransactions[0].date : undefined
          };
        });

      console.log('🎯 Final processed students count:', processedStudents.length);
      setAdmissionStudents(processedStudents);

      // Calculate total sales from inventory transactions
      const inventoryTransactions = existingTransactions.filter(t =>
        t.inventoryItems && t.inventoryItems.length > 0 && t.status === 'completed'
      );

      const totalInventorySales = inventoryTransactions.reduce((total, transaction) => {
        if (transaction.inventoryItems && Array.isArray(transaction.inventoryItems)) {
          const transactionTotal = transaction.inventoryItems.reduce((sum, item) => {
            return sum + ((item as any)?.totalValue || 0);
          }, 0);
          return total + transactionTotal;
        }
        return total;
      }, 0);

      console.log('💰 Total inventory sales calculated:', totalInventorySales);
      setTotalSales(totalInventorySales);

    } catch (error) {
      console.error('❌ Error loading admission fee data:', error);
      alert('ডেটা লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  // Filter students based on search criteria
  useEffect(() => {
    let filtered = admissionStudents;

    // Filter by student name
    if (searchName) {
      filtered = filtered.filter(student =>
        student.studentName.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    // Filter by admission number
    if (searchAdmissionNumber) {
      filtered = filtered.filter(student =>
        student.admissionNumber.toLowerCase().includes(searchAdmissionNumber.toLowerCase())
      );
    }

    // Filter by class
    if (selectedClass !== 'সকল শ্রেণি') {
      filtered = filtered.filter(student => student.className === selectedClass);
    }

    setFilteredStudents(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [admissionStudents, searchName, searchAdmissionNumber, selectedClass]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const openPaymentDialog = async (student: AdmissionStudent) => {
    // Check if student payment is already complete
    if (student.status === 'paid') {
      setNotification({
        show: true,
        message: `${student.studentName} এর পেমেন্ট ইতিমধ্যে সম্পূর্ণ হয়ে গেছে।`,
        type: 'success'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'success' });
      }, 3000);
      return;
    }

    setSelectedStudent(student);

    // Load inventory items
    try {
      setInventoryLoading(true);
      const schoolId = 'iqra-school-2025';
      const items = await inventoryQueries.getAllInventoryItems(schoolId);
      setInventoryItems(items);
    } catch (error) {
      console.error('Error loading inventory items:', error);
    } finally {
      setInventoryLoading(false);
    }

    // Generate voucher number
    const currentYear = new Date().getFullYear().toString();
    const voucherNumber = `ADM-${currentYear}-${Date.now().toString().slice(-4)}`;

    // Set form data based on student type - Show what to collect
    if (student.studentType === 'new_admission') {
      // For new admission, show the actual due amount that needs to be collected
      setFormData({
        admissionFee: student.admissionFee.toString(),
        sessionFee: student.sessionFee.toString(),
        registrationFee: student.registrationFee.toString(),
        paidAmount: '0', // Start with 0 for current payment
        discount: '0',
        dueAmount: student.dueAmount.toString(), // Show actual due amount
        paymentMethod: 'নগদ',
        date: new Date().toISOString().split('T')[0],
        voucherNumber,
        collectedBy: userData?.name || user?.email?.split('@')?.[0] || ''
      });
    } else {
      // For promoted/imported, show the actual due amount that needs to be collected
      setFormData({
        admissionFee: '0',
        sessionFee: student.sessionFee.toString(),
        registrationFee: '0',
        paidAmount: '0', // Start with 0 for current payment
        discount: '0',
        dueAmount: student.dueAmount.toString(), // Show actual due amount
        paymentMethod: 'নগদ',
        date: new Date().toISOString().split('T')[0],
        voucherNumber,
        collectedBy: userData?.name || user?.email?.split('@')[0] || ''
      });
    }

    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedStudent(null);
  };

  const handleSubmitPayment = async () => {
    if (!selectedStudent) return;

    try {
      const schoolId = 'iqra-school-2025';
      const paidAmount = parseFloat(formData.paidAmount) || 0;
      const discount = parseFloat(formData.discount) || 0;
      const admissionFee = parseFloat(formData.admissionFee) || 0;

      // Validate required fields
      if (paidAmount <= 0) {
        setNotification({
          show: true,
          message: 'অনুগ্রহ করে প্রদত্ত পরিমাণ লিখুন।',
          type: 'error'
        });
        setTimeout(() => {
          setNotification({ show: false, message: '', type: 'success' });
        }, 3000);
        return;
      }

      // Prepare inventory items data for the transaction
      const inventoryItemsData = Object.entries(selectedInventoryItems)
        .map(([itemId, quantity]) => {
          const item = inventoryItems.find(i => i.id === itemId);
          if (item && quantity > 0 && item.id) {
            return {
              itemId: item.id,
              itemName: item.name,
              quantity: quantity,
              unitPrice: item.sellingPrice || item.unitPrice,
              totalValue: quantity * (item.sellingPrice || item.unitPrice)
            };
          }
          return null;
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      // Create comprehensive payment record for Firebase
      const paymentRecord = {
        // Basic transaction info
        type: 'income' as const,
        category: selectedStudent.studentType === 'new_admission' ? 'admission_fee' : 'session_fee',
        amount: paidAmount,
        description: `${selectedStudent.studentType === 'new_admission' ? 'ভর্তি ফি' : 'সেশন ফি'} - ${selectedStudent.studentName}`,
        date: formData.date,
        status: 'completed' as const,

        // School and user info
        schoolId,
        recordedBy: user?.email || 'admin',
        collectionDate: new Date().toISOString(),
        collectedBy: formData.collectedBy,

        // Payment details
        paymentMethod: formData.paymentMethod as 'cash' | 'bank_transfer' | 'check' | 'online' | 'other',
        voucherNumber: formData.voucherNumber || `ADM-${Date.now()}`,

        // Student details
        studentId: selectedStudent.studentId,
        studentName: selectedStudent.studentName,
        className: selectedStudent.className,
        section: selectedStudent.section,
        admissionNumber: selectedStudent.admissionNumber,
        studentType: selectedStudent.studentType,

        // Fee details
        admissionFee: selectedStudent.admissionFee,
        sessionFee: selectedStudent.sessionFee,
        registrationFee: selectedStudent.registrationFee,

        // Payment breakdown
        paidAmount: paidAmount,
        discount: discount,
        originalDueAmount: selectedStudent.dueAmount,
        calculatedDueAmount: parseFloat(formData.dueAmount) || 0,

        // Inventory distribution data
        inventoryItems: inventoryItemsData,
        totalInventoryValue: inventoryItemsData.reduce((sum, item) => sum + (item?.totalValue || 0), 0),

        // Payment metadata
        paymentDate: formData.date,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),

        // Additional context
        academicYear: new Date().getFullYear().toString(),
        term: 'annual',
        month: new Date().toLocaleDateString('bn-BD', { month: 'long' })
      };

      console.log('🔥 Saving payment record to Firebase:', paymentRecord);

      // Save to Firebase using accounting queries
      await accountingQueries.createTransaction(paymentRecord);
      console.log('✅ Payment successfully saved to Firebase');

      // Update local state to reflect the payment
      setAdmissionStudents(prevStudents =>
        prevStudents.map(student => {
          if (student.studentId === selectedStudent.studentId) {
            const newPaidAmount = student.paidAmount + paidAmount;
            // Fix: Use student's current dueAmount instead of admissionFee for proper discount calculation
            const newDueAmount = Math.max(0, student.dueAmount - paidAmount - discount);

            let newStatus: 'paid' | 'partial' | 'due' = 'due';
            if (newPaidAmount === 0) {
              newStatus = 'due';
            } else if (newDueAmount === 0) {
              newStatus = 'paid';
            } else {
              newStatus = 'partial';
            }

            console.log(`📊 Updated student ${student.studentName}:`, {
              previousPaid: student.paidAmount,
              newPaid: newPaidAmount,
              previousDue: student.dueAmount,
              discount: discount,
              newDue: newDueAmount,
              newStatus
            });

            return {
              ...student,
              paidAmount: newPaidAmount,
              dueAmount: newDueAmount,
              status: newStatus,
              paymentDate: formData.date
            };
          }
          return student;
        })
      );

      // Close dialog and show success message
      closeDialog();

      // Show success notification
      setNotification({
        show: true,
        message: `ভর্তি ফি সফলভাবে সংগ্রহ করা হয়েছে! পরিমাণ: ৳${paidAmount.toLocaleString()}`,
        type: 'success'
      });

      // Auto-hide notification after 4 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'success' });
      }, 4000);

    } catch (error) {
      console.error('❌ Error saving payment to Firebase:', error);

      // Show detailed error notification
      setNotification({
        show: true,
        message: `পেমেন্ট সংরক্ষণ করতে ত্রুটি হয়েছে: ${error instanceof Error ? error.message : 'অজানা ত্রুটি'}`,
        type: 'error'
      });

      // Auto-hide notification after 5 seconds for errors
      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'success' });
      }, 5000);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { text: string; className: string } } = {
      'paid': { text: 'পরিশোধিত', className: 'bg-green-100 text-green-800' },
      'partial': { text: 'আংশিক', className: 'bg-yellow-100 text-yellow-800' },
      'due': { text: 'বাকেয়া', className: 'bg-red-100 text-red-800' }
    };

    const statusInfo = statusMap[status] || statusMap['due'];

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.className}`}>
        {statusInfo.text}
      </span>
    );
  };

  const uniqueClasses = Array.from(new Set(admissionStudents.map(s => s.className)));

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
                  <h1 className="text-xl font-semibold text-gray-900 leading-tight">ভর্তি ও সেশন ফি আদায়</h1>
                  <p className="text-sm text-gray-600 leading-tight">শিক্ষার্থীদের ভর্তি এবং সেশন ফি সংগ্রহ করুন</p>
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
        <div className={`p-6 lg:p-8 min-h-screen transition-all duration-300 ${
          dialogOpen ? 'bg-gradient-to-br from-blue-900 via-gray-900 to-purple-900 bg-opacity-60 backdrop-blur-sm' : 'bg-gray-50'
        }`}>
          <div className="max-w-7xl mx-auto">
            {/* Back Button */}
            <div className="mb-6">
              <button
                onClick={() => router.push('/admin/accounting')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>হিসাবে ফিরে যান</span>
              </button>
            </div>

            {/* Quick Access Cards for Fee Collection Center */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Tuition Fee Collection */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
                   onClick={() => router.push('/admin/accounting/collect-salary')}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-blue-600" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">টিউশন ফি আদায়</h3>
                <p className="text-gray-600 text-sm mb-3">মাসিক টিউশন ফি সংগ্রহ করুন</p>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-green-600">টিউশন ফি</div>
                  <div className="text-sm px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                    মাসিক ফি
                  </div>
                </div>
              </div>

              {/* Exam Fee Collection */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
                   onClick={() => router.push('/admin/accounting/collect-exam-fee')}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">পরীক্ষার ফি আদায়</h3>
                <p className="text-gray-600 text-sm mb-3">পরীক্ষার ফি সংগ্রহ করুন</p>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-green-600">পরীক্ষা ফি</div>
                  <div className="text-sm px-2 py-1 rounded-full bg-green-100 text-green-800">
                    বিভিন্ন পরীক্ষা
                  </div>
                </div>
              </div>

              {/* Admission & Session Fee Collection */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 bg-gradient-to-br from-purple-50 to-purple-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">ভর্তি ও সেশন ফি আদায়</h3>
                <p className="text-gray-600 text-sm mb-3">ভর্তি এবং সেশন ফি সংগ্রহ করুন</p>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-purple-600">ভর্তি ফি</div>
                  <div className="text-sm px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                    বর্তমান পেজ
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Cards - Top Position */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">মোট শিক্ষার্থী</h3>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-blue-600">{admissionStudents.length}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">মোট বাকেয়া</h3>
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-red-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-red-600">
                  ৳{admissionStudents.reduce((sum, student) => sum + student.dueAmount, 0).toLocaleString()}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">মোট আদায়</h3>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  ৳{admissionStudents.reduce((sum, student) => sum + student.paidAmount, 0).toLocaleString()}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">পরিশোধিত</h3>
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-medium text-sm">
                      {admissionStudents.filter(s => s.status === 'paid').length}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  {admissionStudents.filter(s => s.status === 'paid').length}/{admissionStudents.length} শিক্ষার্থী
                </p>
              </div>
            </div>

            {/* Search Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search by Name */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="শিক্ষার্থীর নাম দিয়ে খুঁজুন"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Search by Admission Number */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="ভর্তি নম্বর দিয়ে খুঁজুন"
                    value={searchAdmissionNumber}
                    onChange={(e) => setSearchAdmissionNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Class Filter */}
                <div className="relative">
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="সকল শ্রেণি">সকল শ্রেণি</option>
                    {uniqueClasses.map(className => (
                      <option key={className} value={className}>{className}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ভর্তি নং
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        নাম
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        শ্রেণি
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        শাখা
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ফির ধরন
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        স্ট্যাটাস
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        অ্যাকশন
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentStudents.map((student) => (
                      <tr key={student.studentId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.admissionNumber}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-blue-600 font-medium text-sm">
                                {student.studentName.charAt(0)}
                              </span>
                            </div>
                            <div className="text-sm font-medium text-gray-900">{student.studentName}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {student.className}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {student.section}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-900">
                          {student.studentType === 'new_admission' && 'ভর্তি ফি'}
                          {student.studentType === 'promoted' && 'সেশন ফি'}
                          {student.studentType === 'imported' && 'সেশন ফি'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          {getStatusBadge(student.status)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <button
                            onClick={() => openPaymentDialog(student)}
                            className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700"
                          >
                            সংগ্রহ করুন
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredStudents.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">কোনো শিক্ষার্থী পাওয়া যায়নি</h3>
                  <p className="text-gray-500">আপনার অনুসন্ধানের জন্য কোনো শিক্ষার্থী খুঁজে পাওয়া যায়নি</p>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {filteredStudents.length > 0 && (
              <div className="mt-6 flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                {/* Pagination Info */}
                <div className="text-sm text-gray-700">
                  <span>
                    দেখানো হচ্ছে {startIndex + 1}-{Math.min(endIndex, filteredStudents.length)} এর মধ্যে {filteredStudents.length} শিক্ষার্থী
                  </span>
                </div>

                {/* Pagination Buttons */}
                <div className="flex items-center space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={goToPrevious}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                    }`}
                  >
                    পূর্ববর্তী
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => goToPage(pageNumber)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                            currentPage === pageNumber
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={goToNext}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                    }`}
                  >
                    পরবর্তী
                  </button>
                </div>
              </div>
            )}


          </div>
        </div>

        {/* Payment Dialog */}
        {dialogOpen && selectedStudent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out scale-100 opacity-100 animate-in zoom-in-95 duration-300">
              {/* Dialog Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedStudent.studentType === 'new_admission' && 'ভর্তি ফি সংগ্রহ করুন'}
                    {selectedStudent.studentType === 'promoted' && 'সেশন ফি সংগ্রহ করুন'}
                    {selectedStudent.studentType === 'imported' && 'সেশন ফি সংগ্রহ করুন'}
                    : {selectedStudent.studentName}
                  </h2>
                  <p className="text-sm text-gray-600">
                    ভর্তি নং: {selectedStudent.admissionNumber} | শ্রেণি: {selectedStudent.className} |
                    ধরন: {selectedStudent.studentType === 'new_admission' ? 'নতুন ভর্তি' : selectedStudent.studentType === 'promoted' ? 'উন্নীত' : 'ইমপোর্টেড'}
                  </p>
                </div>
                <button
                  onClick={closeDialog}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Dialog Body */}
              <div className="p-6 space-y-4">
                {/* Fee Structure Display - Simplified */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">ভর্তি ফি</h3>
                  <div className="space-y-3">
                    {/* Show only admission fee for new admission students */}
                    {selectedStudent.studentType === 'new_admission' && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">ভর্তি ফি পরিমাণ:</span>
                          <span className="font-medium text-lg">৳{selectedStudent.admissionFee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">ভর্তি বাকি:</span>
                          <span className="font-medium text-lg text-red-600">৳{parseFloat(formData.dueAmount || '0').toLocaleString()}</span>
                        </div>
                      </>
                    )}

                    {/* Show only session fee for promoted/imported students */}
                    {(selectedStudent.studentType === 'promoted' || selectedStudent.studentType === 'imported') && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">সেশন ফি পরিমাণ:</span>
                          <span className="font-medium text-lg">৳{selectedStudent.sessionFee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">ভর্তি বাকি:</span>
                          <span className="font-medium text-lg text-red-600">৳{selectedStudent.dueAmount.toLocaleString()}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Payment Form - Enhanced Structure */}
                <div className="space-y-6">
                  {/* First Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ভর্তি ফি পরিমাণ</label>
                      <input
                        type="number"
                        value={formData.admissionFee}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">প্রদত্ত পরিমাণ*</label>
                      <input
                        type="number"
                        value={formData.paidAmount}
                        onChange={(e) => setFormData({...formData, paidAmount: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="পরিমাণ লিখুন"
                      />
                    </div>
                  </div>

                  {/* Second Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ছাড়</label>
                      <input
                        type="number"
                        value={formData.discount}
                        onChange={(e) => setFormData({...formData, discount: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="ছাড়ের পরিমাণ"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ভর্তি ফি বাকেয়া</label>
                      <input
                        type="number"
                        value={formData.dueAmount}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>
                  </div>

                  {/* Inventory Items Selection - After Due Amount */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <Package className="w-5 h-5 mr-2 text-blue-600" />
                      মজুদ থেকে সামগ্রী নির্বাচন করুন
                    </h3>

                    {inventoryLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                        <span className="text-gray-600">মজুদ লোড হচ্ছে...</span>
                      </div>
                    ) : inventoryItems.length === 0 ? (
                      <div className="text-center py-4">
                        <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">কোনো মজুদ পণ্য পাওয়া যায়নি</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-48 overflow-y-auto">
                        {inventoryItems
                          .filter(item => item.quantity > 0) // Only show items with available stock
                          .map((item) => {
                            const isSelected = selectedInventoryItems[item.id || ''] > 0;
                            const selectedQuantity = selectedInventoryItems[item.id || ''] || 0;
                            const itemTotal = selectedQuantity * (item.sellingPrice || item.unitPrice);

                            return (
                              <div key={item.id} className={`border rounded-lg p-3 ${isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'}`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedInventoryItems(prev => ({
                                            ...prev,
                                            [item.id || '']: 1 // Default to 1 when selected
                                          }));
                                        } else {
                                          setSelectedInventoryItems(prev => {
                                            const updated = {...prev};
                                            delete updated[item.id || ''];
                                            return updated;
                                          });
                                        }
                                      }}
                                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <div>
                                      <div className="font-medium text-gray-900">{item.name}</div>
                                      <div className="text-sm text-gray-600">
                                        স্টক: {item.quantity} {item.unit} | দাম: ৳{(item.sellingPrice || item.unitPrice).toLocaleString()}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-medium text-gray-900">
                                      ৳{itemTotal.toLocaleString()}
                                    </div>
                                  </div>
                                </div>

                                {isSelected && (
                                  <div className="mt-3 flex items-center space-x-2">
                                    <label className="text-sm text-gray-600">পরিমাণ:</label>
                                    <input
                                      type="number"
                                      min="1"
                                      max={item.quantity}
                                      value={selectedQuantity}
                                      onChange={(e) => {
                                        const quantity = parseInt(e.target.value) || 0;
                                        if (quantity <= item.quantity && quantity >= 0) {
                                          setSelectedInventoryItems(prev => ({
                                            ...prev,
                                            [item.id || '']: quantity
                                          }));
                                        }
                                      }}
                                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-600">{item.unit}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    )}

                    {/* Selected Items Summary */}
                    {Object.keys(selectedInventoryItems).length > 0 && (
                      <div className="mt-4 pt-3 border-t border-blue-200">
                        <div className="flex justify-between items-center font-semibold text-gray-900">
                          <span>মোট মজুদ মূল্য:</span>
                          <span className="text-blue-600">
                            ৳{Object.entries(selectedInventoryItems).reduce((total, [itemId, quantity]) => {
                              const item = inventoryItems.find(i => i.id === itemId);
                              if (item && quantity > 0) {
                                return total + (quantity * (item.sellingPrice || item.unitPrice));
                              }
                              return total;
                            }, 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Third Row - Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">পেমেন্ট পদ্ধতি</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="নগদ">নগদ</option>
                      <option value="ব্যাংক ট্রান্সফার">ব্যাংক ট্রান্সফার</option>
                      <option value="চেক">চেক</option>
                      <option value="অনলাইন">অনলাইন</option>
                      <option value="অন্যান্য">অন্যান্য</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ভাউচার নম্বর</label>
                    <input
                      type="text"
                      value={formData.voucherNumber}
                      onChange={(e) => setFormData({...formData, voucherNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">তারিখ</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">আদায়কারি</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 flex items-center">
                    <User className="w-4 h-4 mr-2 text-gray-500" />
                    {formData.collectedBy || 'লোড হচ্ছে...'}
                  </div>
                </div>
              </div>

              {/* Dialog Footer */}
              <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
                <div className="flex justify-end gap-4">
                  <button
                    onClick={closeDialog}
                    className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
                  >
                    বাতিল
                  </button>
                  <button
                    onClick={handleSubmitPayment}
                    className="px-8 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Save className="w-4 h-4" />
                    সংগ্রহ করুন
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Centered Notification Modal */}
        {notification.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <div className={`bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl ${
              notification.type === 'success' ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
            }`}>
              <div className="flex items-center">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  notification.type === 'success' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {notification.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <X className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {notification.type === 'success' ? 'সফল!' : 'ত্রুটি!'}
                  </p>
                  <p className={`text-sm ${
                    notification.type === 'success' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {notification.message}
                  </p>
                </div>
                <button
                  onClick={() => setNotification({ show: false, message: '', type: 'success' })}
                  className={`ml-3 flex-shrink-0 ${
                    notification.type === 'success' ? 'text-green-400 hover:text-green-600' : 'text-red-400 hover:text-red-600'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CollectAdmissionFeePageWrapper() {
  return (
    <ProtectedRoute requireAuth={true}>
      <CollectAdmissionFeePage />
    </ProtectedRoute>
  );
}
