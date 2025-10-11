'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { SystemSettings, settingsQueries, classQueries } from '@/lib/database-queries';
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
  UserCheck,
  GraduationCap,
  Building,
  CreditCard,
  TrendingUp,
  Search,
  Bell,
  Save,
  User as UserIcon,
  Shield,
  Database,
  Palette,
  Globe,
  Lock,
  Package,
  Eye,
  EyeOff,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  Clock,
  Activity,
  Server,
  Key,
  Mail,
  Smartphone,
  Monitor,
  Zap,
  Archive,
  FileText,
  BarChart3,
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick,
  Trash2,
  Copy,
  Edit3,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  Heart
} from 'lucide-react';

function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [systemStats, setSystemStats] = useState({
    uptime: '7d 14h 32m',
    memory: { used: 245, total: 512, percentage: 48 },
    cpu: { usage: 23, cores: 4 },
    storage: { used: 156, total: 500, percentage: 31 },
    activeUsers: 1247,
    totalRequests: 45632
  });

  // Form state for controlled components - all fields initialized with proper values
  const [formData, setFormData] = useState({
    // General settings
    schoolName: 'ইকরা ইসলামিক স্কুল',
    schoolCode: 'IQRA-2025',
    schoolAddress: 'ঢাকা, বাংলাদেশ',
    schoolPhone: '+8801712345678',
    schoolEmail: 'info@iqraschool.edu.bd',
    principalName: 'ড. মোহাম্মদ আলী',
    schoolType: 'মাদ্রাসা',
    academicYear: new Date().getFullYear().toString(),
    systemLanguage: 'bn',
    schoolDescription: 'একটি আধুনিক ইসলামিক শিক্ষা প্রতিষ্ঠান যা ধর্মীয় এবং আধুনিক শিক্ষার সমন্বয়ে শিক্ষার্থীদের বিকাশে কাজ করে।',

    // Security settings
    minPasswordLength: 8,
    maxPasswordAge: 90,
    sessionTimeout: 30,
    maxActiveSessions: 5,

    // Database settings
    backupFrequency: 'daily',
    backupRetention: 30,

    // System settings
    cacheExpiry: 24,
    maxUploadSize: 10,
    apiRateLimit: 100,
    apiTimeout: 30,

    // Appearance settings
    theme: 'light',
    primaryColor: 'blue',
    compactMode: false,
    sidebarCollapsed: false,
    darkMode: false,
    rtlSupport: false,

    // Notification settings
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

    // Advanced settings
    debugMode: false,
    apiDocumentation: true,
    enableCSP: true,
    enableXFrameOptions: true,
    enableXContentTypeOptions: true,
    enableHSTS: false,
    enableReferrerPolicy: true,
    customCSS: '',
    customJS: ''
  });
  const [showAddYearModal, setShowAddYearModal] = useState(false);
  const [newAcademicYear, setNewAcademicYear] = useState('');
  const [customAcademicYears, setCustomAcademicYears] = useState<string[]>([]);

  // Fee Management State
  const [fees, setFees] = useState<any[]>([]);
  const [loadingFees, setLoadingFees] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [editingFee, setEditingFee] = useState<any>(null);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [feeFormData, setFeeFormData] = useState({
    name: '',
    type: '',
    amount: '',
    description: '',
    applicableClasses: 'all',
    collectionDeadline: '',
    lateFee: '0',
    isActive: true,
    isMandatory: false,
    autoReminder: false
  });

  // Fee amounts state for all fee types
  const [feeAmounts, setFeeAmounts] = useState({
    monthlyFee: '600',
    sessionFee: '1000',
    admissionFee: '1200',
    firstTermExamFee: '200',
    secondTermExamFee: '250',
    annualExamFee: '400',
    monthlyExamFee: '100'
  });

  // Individual class amounts state
  const [classAmounts, setClassAmounts] = useState<{[classId: string]: string}>({});

  // Class-specific fee management
  const [classSpecificFees, setClassSpecificFees] = useState<any[]>([]);
  const [showClassFeeModal, setShowClassFeeModal] = useState(false);
  const [selectedClassForFee, setSelectedClassForFee] = useState<any>(null);
  const [classFeeFormData, setClassFeeFormData] = useState({
    classId: '',
    className: '',
    feeName: '',
    amount: '',
    description: '',
    collectionDeadline: '',
    lateFee: '0',
    isActive: true,
    isMandatory: false,
    autoReminder: false
  });

  // Classes State for Dropdown
  const [classes, setClasses] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  const router = useRouter();

  // Load classes from Firebase for dropdown with real-time updates
  const loadClasses = async () => {
    setLoadingClasses(true);
    console.log('🔄 Starting class loading process...');

    try {
      // Try to load from localStorage first for immediate display
      const savedClasses = localStorage.getItem('iqra_classes');
      if (savedClasses) {
        const parsedClasses = JSON.parse(savedClasses);
        console.log('💾 Loaded from localStorage:', parsedClasses);
        setClasses(parsedClasses);
      }

      // Then try to load from Firebase
      try {
        console.log('📡 Connecting to Firebase to load ALL classes...');

        // Direct Firebase query to see what's actually in the database
        const { collection, getDocs, onSnapshot, query } = await import('firebase/firestore');
        const classesSnapshot = await getDocs(collection(db, 'classes'));

        console.log('🔍 Raw classes collection size:', classesSnapshot.size);
        console.log('🔍 Classes documents:');

        const firebaseClasses: any[] = [];
        classesSnapshot.forEach((doc) => {
          console.log(`📄 Document:`, {
            id: doc.id,
            data: doc.data(),
            allFields: Object.keys(doc.data())
          });
          firebaseClasses.push({
            id: doc.id,
            ...doc.data()
          });
        });

        if (firebaseClasses.length > 0) {
          // Show ALL classes from Firebase with proper formatting
          const allClasses = firebaseClasses.map((cls, index) => {
            console.log(`🔢 Processing Firebase class ${index + 1}:`, cls);

            return {
              classId: cls.classId || cls.id || `class_${index}_${Date.now()}`,
              className: cls.className || cls.name || cls.title || cls.class || `Class ${index + 1}`,
              section: cls.section || 'এ',
              teacherName: cls.teacherName || cls.teacher || 'নির্ধারিত নয়',
              academicYear: cls.academicYear || '২০২৫',
              totalStudents: cls.totalStudents || 0,
              isActive: cls.isActive !== false
            };
          });

          console.log('🎯 Final formatted classes:', allClasses);
          console.log('📋 Class names:', allClasses.map(cls => cls.className));

          setClasses(allClasses);
          localStorage.setItem('iqra_classes', JSON.stringify(allClasses));

          // Set up real-time listener for automatic updates
          console.log('🔄 Setting up real-time listener for classes...');
          const classesQuery = query(collection(db, 'classes'));
          const unsubscribe = onSnapshot(classesQuery, (snapshot) => {
            console.log('🔥 Real-time class update detected:', snapshot.size);

            const updatedClasses: any[] = [];
            snapshot.forEach((doc) => {
              updatedClasses.push({
                id: doc.id,
                ...doc.data()
              });
            });

            if (updatedClasses.length > 0) {
              const formattedClasses = updatedClasses.map((cls, index) => ({
                classId: cls.classId || cls.id || `class_${index}_${Date.now()}`,
                className: cls.className || cls.name || cls.title || cls.class || `Class ${index + 1}`,
                section: cls.section || 'এ',
                teacherName: cls.teacherName || cls.teacher || 'নির্ধারিত নয়',
                academicYear: cls.academicYear || '২০২৫',
                totalStudents: cls.totalStudents || 0,
                isActive: cls.isActive !== false
              }));

              console.log('🔄 Auto-updating classes:', formattedClasses);
              setClasses(formattedClasses);
              localStorage.setItem('iqra_classes', JSON.stringify(formattedClasses));

              // Show success message for new class additions
              if (formattedClasses.length > allClasses.length) {
                setSaveMessage(`নতুন ক্লাস যোগ করা হয়েছে! মোট ${formattedClasses.length} টি ক্লাস উপলব্ধ`);
                setTimeout(() => setSaveMessage(''), 3000);
              }
            }
          });

          // Store unsubscribe function for cleanup
          return unsubscribe;
        } else {
          console.log('⚠️ No classes found in Firebase, using fallback...');
          // Fallback classes if Firebase is empty
          const fallbackClasses = [
            { classId: 'play-class', className: 'প্লে', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true },
            { classId: 'nursery-class', className: 'নার্সারি', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true },
            { classId: 'one-class', className: 'প্রথম', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true },
            { classId: 'two-class', className: 'দ্বিতীয়', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true },
            { classId: 'three-class', className: 'তৃতীয়', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true },
            { classId: 'four-class', className: 'চতুর্থ', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true },
            { classId: 'five-class', className: 'পঞ্চম', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true }
          ];

          console.log('📝 Setting fallback classes:', fallbackClasses);
          setClasses(fallbackClasses);
          localStorage.setItem('iqra_classes', JSON.stringify(fallbackClasses));
        }
      } catch (firebaseError) {
        console.error('❌ Firebase error:', firebaseError);

        // Use localStorage as backup or set fallback
        if (!savedClasses) {
          const fallbackClasses = [
            { classId: 'play-class', className: 'প্লে', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true },
            { classId: 'nursery-class', className: 'নার্সারি', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true },
            { classId: 'one-class', className: 'প্রথম', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true },
            { classId: 'two-class', className: 'দ্বিতীয়', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true },
            { classId: 'three-class', className: 'তৃতীয়', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true },
            { classId: 'four-class', className: 'চতুর্থ', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true },
            { classId: 'five-class', className: 'পঞ্চম', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true }
          ];

          console.log('🚨 Setting fallback classes:', fallbackClasses);
          setClasses(fallbackClasses);
        }
      }
    } catch (error) {
      console.error('💥 Critical error loading classes:', error);
      setSaveMessage('ক্লাস লোড করতে ত্রুটি হয়েছে');
      setTimeout(() => setSaveMessage(''), 3000);

      // Emergency fallback
      const emergencyClasses = [
        { classId: 'play-class', className: 'প্লে', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true },
        { classId: 'nursery-class', className: 'নার্সারি', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true },
        { classId: 'one-class', className: 'প্রথম', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true },
        { classId: 'two-class', className: 'দ্বিতীয়', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true },
        { classId: 'three-class', className: 'তৃতীয়', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true },
        { classId: 'four-class', className: 'চতুর্থ', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true },
        { classId: 'five-class', className: 'পঞ্চম', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true }
      ];
      setClasses(emergencyClasses);
    } finally {
      setLoadingClasses(false);
      console.log('🏁 Class loading process completed');
    }
  };

  // Load fees from Firebase (both simple and comprehensive fees)
  const loadFees = async () => {
    if (!user) return;

    setLoadingFees(true);
    try {
      console.log('🔄 Loading fees from Firebase...');

      const { collection, getDocs, query, orderBy } = await import('firebase/firestore');

      // Load comprehensive fees (where new fees are saved)
      const comprehensiveFeesSnapshot = await getDocs(query(collection(db, 'comprehensive_fees'), orderBy('createdAt', 'desc')));

      console.log('🔍 Comprehensive fees collection size:', comprehensiveFeesSnapshot.size);

      if (!comprehensiveFeesSnapshot.empty) {
        const comprehensiveFees: any[] = [];
        comprehensiveFeesSnapshot.forEach((doc) => {
          console.log(`📄 Comprehensive fee document:`, {
            id: doc.id,
            data: doc.data()
          });
          comprehensiveFees.push({
            id: doc.id,
            ...doc.data()
          });
        });

        // Transform comprehensive fees for display
        const formattedFees = comprehensiveFees.map((fee) => ({
          id: fee.id,
          name: `কমপ্রিহেনসিভ ফি - ${fee.selectedClassName}`,
          type: 'comprehensive',
          amount: fee.grandTotal,
          description: `টিউশন: ৳${fee.totalTuitionAmount}, পরীক্ষা: ৳${fee.totalExamAmount}`,
          applicableClasses: fee.selectedClass,
          collectionDeadline: fee.collectionDeadline,
          lateFee: fee.lateFee,
          isActive: fee.isActive,
          isMandatory: fee.isMandatory,
          autoReminder: fee.autoReminder,
          students: 0,
          status: fee.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়',
          icon: '🎓',
          color: 'blue',
          createdAt: fee.createdAt,
          createdBy: fee.createdBy,
          tuitionFees: fee.tuitionFees,
          examFees: fee.examFees,
          totalTuitionAmount: fee.totalTuitionAmount,
          totalExamAmount: fee.totalExamAmount,
          grandTotal: fee.grandTotal,
          selectedClassName: fee.selectedClassName
        }));

        console.log('✅ Loaded comprehensive fees from Firebase:', formattedFees);
        setFees(formattedFees);

        // Also save to localStorage for offline access
        localStorage.setItem('iqra_comprehensive_fees', JSON.stringify(formattedFees));
      } else {
        console.log('⚠️ No comprehensive fees found in Firebase, checking localStorage...');
        // Fallback to localStorage if Firebase is empty
        const savedFees = localStorage.getItem('iqra_comprehensive_fees') || localStorage.getItem('iqra_fees');
        if (savedFees) {
          const parsedFees = JSON.parse(savedFees);
          console.log('💾 Loaded fees from localStorage:', parsedFees);
          setFees(parsedFees);
        } else {
          console.log('📝 No fees found anywhere, setting empty array');
          setFees([]);
        }
      }
    } catch (error) {
      console.error('💥 Critical error loading fees:', error);
      setSaveMessage('ফি লোড করতে ত্রুটি হয়েছে');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setLoadingFees(false);
    }
  };

  // Helper function to get fee icon based on type
  const getFeeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      'monthly': '💰',
      'yearly': '📚',
      'one-time': '🎓',
      'per-exam': '📝',
      'per-semester': '📖'
    };
    return icons[type] || '💰';
  };

  // Helper function to get fee color based on type
  const getFeeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'monthly': 'green',
      'yearly': 'orange',
      'one-time': 'purple',
      'per-exam': 'blue',
      'per-semester': 'indigo'
    };
    return colors[type] || 'green';
  };

  // Create default fees in Firebase
  const createDefaultFees = async () => {
    if (!user) return;

    console.log('📝 Creating default fees in Firebase...');

    const defaultFees = [
      {
        id: '1',
        name: 'বেতন ফি',
        type: 'monthly',
        amount: 1500,
        description: 'মাসিক বেতন ফি',
        applicableClasses: 'all',
        collectionDeadline: '5',
        lateFee: 10,
        isActive: true,
        isMandatory: true,
        autoReminder: true,
        students: 1247,
        status: 'সক্রিয়',
        icon: '💰',
        color: 'green',
        createdAt: new Date().toISOString(),
        createdBy: user?.email
      },
      {
        id: '2',
        name: 'পরীক্ষার ফি',
        type: 'per-exam',
        amount: 500,
        description: 'প্রতি পরীক্ষার ফি',
        applicableClasses: 'all',
        collectionDeadline: '1',
        lateFee: 5,
        isActive: true,
        isMandatory: true,
        autoReminder: true,
        students: 1247,
        status: 'সক্রিয়',
        icon: '📝',
        color: 'blue',
        createdAt: new Date().toISOString(),
        createdBy: user?.email
      },
      {
        id: '3',
        name: 'ভর্তি ফি',
        type: 'one-time',
        amount: 2000,
        description: 'নতুন শিক্ষার্থী ভর্তি ফি',
        applicableClasses: 'all',
        collectionDeadline: '1',
        lateFee: 0,
        isActive: true,
        isMandatory: true,
        autoReminder: false,
        students: 156,
        status: 'সক্রিয়',
        icon: '🎓',
        color: 'purple',
        createdAt: new Date().toISOString(),
        createdBy: user?.email
      },
      {
        id: '4',
        name: 'সেশন ফি',
        type: 'yearly',
        amount: 1000,
        description: 'বার্ষিক সেশন ফি',
        applicableClasses: 'all',
        collectionDeadline: '15',
        lateFee: 20,
        isActive: true,
        isMandatory: true,
        autoReminder: true,
        students: 1247,
        status: 'সক্রিয়',
        icon: '📚',
        color: 'orange',
        createdAt: new Date().toISOString(),
        createdBy: user?.email
      },
      {
        id: '5',
        name: 'ল্যাব ফি',
        type: 'monthly',
        amount: 300,
        description: 'কম্পিউটার ল্যাব ব্যবহার ফি',
        applicableClasses: '6-12',
        collectionDeadline: '10',
        lateFee: 15,
        isActive: true,
        isMandatory: false,
        autoReminder: true,
        students: 234,
        status: 'সক্রিয়',
        icon: '🔬',
        color: 'indigo',
        createdAt: new Date().toISOString(),
        createdBy: user?.email
      },
      {
        id: '6',
        name: 'স্পোর্টস ফি',
        type: 'yearly',
        amount: 200,
        description: 'ক্রীড়া এবং খেলাধুলা ফি',
        applicableClasses: 'all',
        collectionDeadline: '30',
        lateFee: 0,
        isActive: true,
        isMandatory: false,
        autoReminder: false,
        students: 1247,
        status: 'সক্রিয়',
        icon: '⚽',
        color: 'red',
        createdAt: new Date().toISOString(),
        createdBy: user?.email
      }
    ];

    try {
      const { collection, addDoc } = await import('firebase/firestore');

      for (const fee of defaultFees) {
        await addDoc(collection(db, 'fees'), {
          ...fee,
          createdAt: new Date().toISOString(),
          createdBy: user?.email
        });
      }

      console.log('✅ Default fees created in Firebase');
      setFees(defaultFees);
      localStorage.setItem('iqra_fees', JSON.stringify(defaultFees));
    } catch (error) {
      console.error('❌ Error creating default fees:', error);
      setFees(defaultFees);
      localStorage.setItem('iqra_fees', JSON.stringify(defaultFees));
    }
  };

  // Save fee to Firebase
  const saveFee = async (feeData: any) => {
    if (!user) return;

    setSaving(true);
    try {
      console.log('💾 Saving fee to Firebase:', feeData);

      const { collection, addDoc, updateDoc, doc } = await import('firebase/firestore');

      if (editingFee) {
        // Update existing fee in Firebase
        const feeRef = doc(db, 'fees', editingFee.id);
        await updateDoc(feeRef, {
          ...feeData,
          updatedAt: new Date().toISOString(),
          updatedBy: user?.email
        });

        console.log('✅ Fee updated in Firebase:', editingFee.id);

        // Update local state
        const updatedFees = fees.map((fee: any) =>
          fee.id === editingFee.id ? { ...feeData, updatedAt: new Date().toISOString(), updatedBy: user?.email } : fee
        );
        setFees(updatedFees);
        localStorage.setItem('iqra_fees', JSON.stringify(updatedFees));

        setSaveMessage('ফি সফলভাবে আপডেট করা হয়েছে!');
      } else {
        // Add new fee to Firebase
        const docRef = await addDoc(collection(db, 'fees'), {
          ...feeData,
          createdAt: new Date().toISOString(),
          createdBy: user?.email
        });

        console.log('✅ New fee added to Firebase:', docRef.id);

        // Update local state
        const newFee = { ...feeData, id: docRef.id };
        const updatedFees = [...fees, newFee];
        setFees(updatedFees);
        localStorage.setItem('iqra_fees', JSON.stringify(updatedFees));

        setSaveMessage('ফি সফলভাবে সংরক্ষণ করা হয়েছে!');
      }

      setTimeout(() => setSaveMessage(''), 3000);

      // Close modal and reset form
      setShowFeeModal(false);
      resetFeeForm();
    } catch (error) {
      console.error('❌ Error saving fee to Firebase:', error);
      setSaveMessage('ফি সংরক্ষণ করতে ত্রুটি হয়েছে');
      setTimeout(() => setSaveMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  // Reset fee form
  const resetFeeForm = () => {
    setFeeFormData({
      name: '',
      type: '',
      amount: '',
      description: '',
      applicableClasses: 'all',
      collectionDeadline: '',
      lateFee: '0',
      isActive: true,
      isMandatory: false,
      autoReminder: false
    });
    setEditingFee(null);
  };

  // Open fee modal for new fee
  const openNewFeeModal = () => {
    resetFeeForm();
    setShowFeeModal(true);
  };

  // Open fee modal for editing
  const openEditFeeModal = (fee: any) => {
    setEditingFee(fee);
    setFeeFormData({
      name: fee.name,
      type: fee.type,
      amount: fee.amount.toString(),
      description: fee.description,
      applicableClasses: fee.applicableClasses,
      collectionDeadline: fee.collectionDeadline,
      lateFee: fee.lateFee.toString(),
      isActive: fee.isActive,
      isMandatory: fee.isMandatory,
      autoReminder: fee.autoReminder
    });
    setShowFeeModal(true);
  };

  // Handle fee form submission
  const handleFeeSubmit = async () => {
    if (!user) {
      setSaveMessage('ব্যবহারকারী লগইন করুন');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    // Validation for class selection
    if (!selectedClass) {
      setSaveMessage('একটি ক্লাস নির্বাচন করুন');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    // Collect all fee amounts from input fields
    const tuitionFees = {
      monthlyFee: parseFloat(feeAmounts.monthlyFee) || 0,
      sessionFee: parseFloat(feeAmounts.sessionFee) || 0,
      admissionFee: parseFloat(feeAmounts.admissionFee) || 0
    };

    const examFees = {
      firstTermExamFee: parseFloat(feeAmounts.firstTermExamFee) || 0,
      secondTermExamFee: parseFloat(feeAmounts.secondTermExamFee) || 0,
      annualExamFee: parseFloat(feeAmounts.annualExamFee) || 0,
      monthlyExamFee: parseFloat(feeAmounts.monthlyExamFee) || 0
    };

    // Check if at least one fee amount is provided
    const hasValidTuitionFee = Object.values(tuitionFees).some(amount => amount > 0);
    const hasValidExamFee = Object.values(examFees).some(amount => amount > 0);

    if (!hasValidTuitionFee && !hasValidExamFee) {
      setSaveMessage('অন্তত একটি ফি এর পরিমাণ নির্ধারণ করুন');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    // Prepare fee data for Firebase
    const feeData = {
      selectedClass: selectedClass,
      selectedClassName: selectedClass === 'all' ? 'সকল ক্লাস' : classes.find(cls => cls.classId === selectedClass)?.className + ' - সেকশন ' + classes.find(cls => cls.classId === selectedClass)?.section,
      tuitionFees: tuitionFees,
      examFees: examFees,
      totalTuitionAmount: Object.values(tuitionFees).reduce((sum, amount) => sum + amount, 0),
      totalExamAmount: Object.values(examFees).reduce((sum, amount) => sum + amount, 0),
      grandTotal: Object.values(tuitionFees).reduce((sum, amount) => sum + amount, 0) + Object.values(examFees).reduce((sum, amount) => sum + amount, 0),
      collectionDeadline: '15', // Default deadline
      lateFee: 10, // Default late fee
      isActive: true,
      isMandatory: true,
      autoReminder: true,
      createdBy: user?.email,
      createdAt: new Date().toISOString(),
      academicYear: new Date().getFullYear().toString()
    };

    console.log('💾 Saving comprehensive fee data:', feeData);

    try {
      setSaving(true);

      // Save to Firebase
      const { collection, addDoc } = await import('firebase/firestore');
      const docRef = await addDoc(collection(db, 'comprehensive_fees'), feeData);

      console.log('✅ Comprehensive fee data saved to Firebase:', docRef.id);

      // Update localStorage for offline access
      const existingFees = JSON.parse(localStorage.getItem('iqra_comprehensive_fees') || '[]');
      const newFee = { ...feeData, id: docRef.id };
      const updatedFees = [...existingFees, newFee];
      localStorage.setItem('iqra_comprehensive_fees', JSON.stringify(updatedFees));

      setSaveMessage('ফি সফলভাবে সংরক্ষণ করা হয়েছে!');
      setTimeout(() => setSaveMessage(''), 3000);

      // Reset form after successful save
      setSelectedClass('');
      setFeeAmounts({
        monthlyFee: '600',
        sessionFee: '1000',
        admissionFee: '1200',
        firstTermExamFee: '200',
        secondTermExamFee: '250',
        annualExamFee: '400',
        monthlyExamFee: '100'
      });

      // Close modal
      setShowFeeModal(false);

      // Reload fees to show the newly saved fee
      console.log('🔄 Reloading fees after save...');
      await loadFees();

    } catch (error) {
      console.error('❌ Error saving comprehensive fee data:', error);
      setSaveMessage('ফি সংরক্ষণ করতে ত্রুটি হয়েছে');
      setTimeout(() => setSaveMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        console.log('🔐 User authenticated:', user.email);

        // Load settings from Firebase
        await loadSettings();
        // Load system statistics
        await loadSystemStats();

        // Load fees from Firebase - ensure this runs
        console.log('🔄 Starting fee loading...');
        await loadFees();
        console.log('✅ Fee loading completed');

        // Load classes from Firebase for dropdown
        await loadClasses();
      } else {
        router.push('/auth/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const loadSettings = async () => {
    setSettingsLoading(true);
    try {
      const settingsData = await settingsQueries.getSettings();
      if (settingsData) {
        setSettings(settingsData);

        // Update form data with loaded settings
        setFormData({
          // General settings
          schoolName: settingsData.schoolName || '',
          schoolCode: settingsData.schoolCode || '',
          schoolAddress: settingsData.schoolAddress || '',
          schoolPhone: settingsData.schoolPhone || '',
          schoolEmail: settingsData.schoolEmail || '',
          principalName: settingsData.principalName || '',
          schoolType: settingsData.schoolType || '',
          academicYear: settingsData.academicYear || '',
          systemLanguage: settingsData.systemLanguage || '',
          schoolDescription: settingsData.schoolDescription || '',

          // Security settings
          minPasswordLength: settingsData.minPasswordLength || 8,
          maxPasswordAge: settingsData.maxPasswordAge || 90,
          sessionTimeout: settingsData.sessionTimeout || 30,
          maxActiveSessions: settingsData.maxActiveSessions || 5,

          // Database settings
          backupFrequency: settingsData.backupFrequency || 'daily',
          backupRetention: settingsData.backupRetention || 30,

          // System settings
          cacheExpiry: settingsData.cacheExpiry || 24,
          maxUploadSize: settingsData.maxUploadSize || 10,
          apiRateLimit: settingsData.apiRateLimit || 100,
          apiTimeout: settingsData.apiTimeout || 30,

          // Appearance settings
          theme: settingsData.theme || 'light',
          primaryColor: settingsData.primaryColor || 'blue',
          compactMode: settingsData.compactMode || false,
          sidebarCollapsed: settingsData.sidebarCollapsed || false,
          darkMode: settingsData.darkMode || false,
          rtlSupport: settingsData.rtlSupport || false,

          // Notification settings
          smtpServer: settingsData.smtpServer || 'smtp.gmail.com',
          smtpPort: settingsData.smtpPort || 587,
          smtpEmail: settingsData.smtpEmail || '',
          smtpPassword: settingsData.smtpPassword || '',
          studentRegistrationEmail: settingsData.studentRegistrationEmail || true,
          studentRegistrationPush: settingsData.studentRegistrationPush || false,
          paymentReminderEmail: settingsData.paymentReminderEmail || true,
          paymentReminderPush: settingsData.paymentReminderPush || true,
          attendanceReportEmail: settingsData.attendanceReportEmail || false,
          attendanceReportPush: settingsData.attendanceReportPush || true,
          systemAlertEmail: settingsData.systemAlertEmail || true,
          systemAlertPush: settingsData.systemAlertPush || true,
          examScheduleEmail: settingsData.examScheduleEmail || true,
          examSchedulePush: settingsData.examSchedulePush || false,

          // Advanced settings
          debugMode: settingsData.debugMode || false,
          apiDocumentation: settingsData.apiDocumentation || true,
          enableCSP: settingsData.enableCSP || true,
          enableXFrameOptions: settingsData.enableXFrameOptions || true,
          enableXContentTypeOptions: settingsData.enableXContentTypeOptions || true,
          enableHSTS: settingsData.enableHSTS || false,
          enableReferrerPolicy: settingsData.enableReferrerPolicy || true,
          customCSS: settingsData.customCSS || '',
          customJS: settingsData.customJS || ''
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setSaveMessage('সেটিংস লোড করতে ত্রুটি হয়েছে');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setSettingsLoading(false);
    }
  };

  const loadSystemStats = async () => {
    try {
      const stats = await settingsQueries.getSystemStats();
      setSystemStats(prev => ({
        ...prev,
        activeUsers: stats.activeUsers || 1247,
        storage: {
          ...prev.storage,
          used: stats.storageUsed || 156,
          total: stats.storageTotal || 500
        }
      }));
    } catch (error) {
      console.error('Error loading system stats:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;

    setSaving(true);
    setSaveMessage('');

    try {
      // Get form data from controlled components
      const schoolName = formData.schoolName || 'ইকরা ইসলামিক স্কুল';
      const schoolCode = formData.schoolCode || 'IQRA-2025';
      const schoolAddress = formData.schoolAddress || 'ঢাকা, বাংলাদেশ';
      const schoolPhone = formData.schoolPhone || '+8801712345678';
      const schoolEmail = formData.schoolEmail || 'info@iqraschool.edu.bd';
      const principalName = formData.principalName || 'ড. মোহাম্মদ আলী';
      const schoolType = formData.schoolType || 'মাদ্রাসা';
      const academicYear = formData.academicYear || new Date().getFullYear().toString();
      const systemLanguage = formData.systemLanguage || 'bn';
      const schoolDescription = formData.schoolDescription || 'একটি আধুনিক ইসলামিক শিক্ষা প্রতিষ্ঠান যা ধর্মীয় এবং আধুনিক শিক্ষার সমন্বয়ে শিক্ষার্থীদের বিকাশে কাজ করে।';

      // Security settings
      const minPasswordLength = formData.minPasswordLength || 8;
      const maxPasswordAge = formData.maxPasswordAge || 90;
      const sessionTimeout = formData.sessionTimeout || 30;
      const maxActiveSessions = formData.maxActiveSessions || 5;

      // Database settings
      const backupFrequency = formData.backupFrequency || 'daily';
      const backupRetention = formData.backupRetention || 30;

      // System settings
      const cacheExpiry = formData.cacheExpiry || 24;
      const maxUploadSize = formData.maxUploadSize || 10;
      const apiRateLimit = formData.apiRateLimit || 100;
      const apiTimeout = formData.apiTimeout || 30;

      // Appearance settings
      const theme = formData.theme || 'light';
      const primaryColor = formData.primaryColor || 'blue';
      const compactMode = formData.compactMode || false;
      const sidebarCollapsed = formData.sidebarCollapsed || false;
      const darkMode = formData.darkMode || false;
      const rtlSupport = formData.rtlSupport || false;

      // Notification settings
      const smtpServer = formData.smtpServer || 'smtp.gmail.com';
      const smtpPort = formData.smtpPort || 587;
      const smtpEmail = formData.smtpEmail || 'noreply@iqraschool.edu.bd';
      const smtpPassword = formData.smtpPassword || '';
      const studentRegistrationEmail = formData.studentRegistrationEmail || true;
      const studentRegistrationPush = formData.studentRegistrationPush || false;
      const paymentReminderEmail = formData.paymentReminderEmail || true;
      const paymentReminderPush = formData.paymentReminderPush || true;
      const attendanceReportEmail = formData.attendanceReportEmail || false;
      const attendanceReportPush = formData.attendanceReportPush || true;
      const systemAlertEmail = formData.systemAlertEmail || true;
      const systemAlertPush = formData.systemAlertPush || true;
      const examScheduleEmail = formData.examScheduleEmail || true;
      const examSchedulePush = formData.examSchedulePush || false;

      // Advanced settings
      const debugMode = formData.debugMode || false;
      const apiDocumentation = formData.apiDocumentation || true;
      const enableCSP = formData.enableCSP || true;
      const enableXFrameOptions = formData.enableXFrameOptions || true;
      const enableXContentTypeOptions = formData.enableXContentTypeOptions || true;
      const enableHSTS = formData.enableHSTS || false;
      const enableReferrerPolicy = formData.enableReferrerPolicy || true;
      const customCSS = formData.customCSS || '';
      const customJS = formData.customJS || '';

      const settingsToSave: Partial<SystemSettings> = {
        // General settings
        schoolName,
        schoolCode,
        schoolAddress,
        schoolPhone,
        schoolEmail,
        principalName,
        schoolType,
        academicYear,
        systemLanguage,
        schoolDescription,

        // Security settings
        minPasswordLength,
        maxPasswordAge,
        sessionTimeout,
        maxActiveSessions,

        // Database settings
        backupFrequency,
        backupRetention,

        // System settings
        cacheExpiry,
        maxUploadSize,
        apiRateLimit,
        apiTimeout,

        // Appearance settings
        theme,
        primaryColor,
        compactMode,
        sidebarCollapsed,
        darkMode,
        rtlSupport,

        // Notification settings
        smtpServer,
        smtpPort,
        smtpEmail,
        smtpPassword,
        studentRegistrationEmail,
        studentRegistrationPush,
        paymentReminderEmail,
        paymentReminderPush,
        attendanceReportEmail,
        attendanceReportPush,
        systemAlertEmail,
        systemAlertPush,
        examScheduleEmail,
        examSchedulePush,

        // Advanced settings
        debugMode,
        apiDocumentation,
        enableCSP,
        enableXFrameOptions,
        enableXContentTypeOptions,
        enableHSTS,
        enableReferrerPolicy,
        customCSS,
        customJS,

        updatedBy: user.email || 'admin'
      };

      console.log('Saving settings:', settingsToSave);
      await settingsQueries.saveSettings(settingsToSave, user.email || 'admin');

      setSaveMessage('সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে!');
      setTimeout(() => setSaveMessage(''), 3000);

      // Reload settings to reflect changes
      await loadSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage('সেটিংস সংরক্ষণ করতে ত্রুটি হয়েছে');
      setTimeout(() => setSaveMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleBackup = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const result = await settingsQueries.createBackup();
      setSaveMessage(result);
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error creating backup:', error);
      setSaveMessage('ব্যাকআপ তৈরি করতে ত্রুটি হয়েছে');
      setTimeout(() => setSaveMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const data = await settingsQueries.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSaveMessage('ডেটা সফলভাবে এক্সপোর্ট করা হয়েছে');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error exporting data:', error);
      setSaveMessage('ডেটা এক্সপোর্ট করতে ত্রুটি হয়েছে');
      setTimeout(() => setSaveMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleClearCache = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await settingsQueries.clearCache();
      setSaveMessage('ক্যাশে সফলভাবে পরিষ্কার করা হয়েছে');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error clearing cache:', error);
      setSaveMessage('ক্যাশে পরিষ্কার করতে ত্রুটি হয়েছে');
      setTimeout(() => setSaveMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleAddAcademicYear = () => {
    if (!newAcademicYear.trim()) {
      setSaveMessage('একাডেমিক বর্ষ লিখুন');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    // Check if year already exists
    if (customAcademicYears.includes(newAcademicYear)) {
      setSaveMessage('এই একাডেমিক বর্ষটি ইতিমধ্যে যোগ করা হয়েছে');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    // Add to custom years list
    setCustomAcademicYears([...customAcademicYears, newAcademicYear]);
    setNewAcademicYear('');
    setShowAddYearModal(false);
    setSaveMessage('একাডেমিক বর্ষ সফলভাবে যোগ করা হয়েছে');
    setTimeout(() => setSaveMessage(''), 3000);
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
    { icon: GraduationCap, label: 'শিক্ষক', href: '/admin/teachers', active: false },
    { icon: Building, label: 'অভিভাবক', href: '/admin/parents', active: false },
    { icon: BookOpen, label: 'ক্লাস', href: '/admin/classes', active: false },
    { icon: ClipboardList, label: 'উপস্থিতি', href: '/admin/attendance', active: false },
    { icon: Calendar, label: 'ইভেন্ট', href: '/admin/events', active: false },
    { icon: CreditCard, label: 'হিসাব', href: '/admin/accounting', active: false },
    { icon: Heart, label: 'Donation', href: '/admin/donation', active: false },
    { icon: Home, label: 'পরীক্ষা', href: '/admin/exams', active: false },
    { icon: BookOpen, label: 'বিষয়', href: '/admin/subjects', active: false },
    { icon: Users, label: 'সাপোর্ট', href: '/admin/support', active: false },
    { icon: Calendar, label: 'বার্তা', href: '/admin/accounts', active: false },
    { icon: Settings, label: 'Generate', href: '/admin/generate', active: false },
    { icon: Package, label: 'ইনভেন্টরি', href: '/admin/inventory', active: false },
    { icon: Users, label: 'অভিযোগ', href: '/admin/misc', active: false },
    { icon: Settings, label: 'সেটিংস', href: '/admin/settings', active: true },
  ];

  const settingsTabs = [
    { id: 'general', label: 'সাধারণ', icon: Settings, description: 'বেসিক সিস্টেম কনফিগারেশন' },
    { id: 'fees', label: 'ফি সেটআপ', icon: CreditCard, description: 'সকল ধরনের ফি কনফিগারেশন' },
    { id: 'users', label: 'ব্যবহারকারী', icon: UserIcon, description: 'ব্যবহারকারী ম্যানেজমেন্ট এবং রোল' },
    { id: 'security', label: 'নিরাপত্তা', icon: Shield, description: 'পাসওয়ার্ড এবং অ্যাক্সেস কন্ট্রোল' },
    { id: 'database', label: 'ডেটাবেস', icon: Database, description: 'ডেটাবেস ম্যানেজমেন্ট এবং ব্যাকআপ' },
    { id: 'appearance', label: 'চেহারা', icon: Palette, description: 'থিম এবং ইন্টারফেস কাস্টমাইজেশন' },
    { id: 'system', label: 'সিস্টেম', icon: Server, description: 'সিস্টেম মনিটরিং এবং পারফরম্যান্স' },
    { id: 'notifications', label: 'নোটিফিকেশন', icon: Bell, description: 'ইমেইল এবং পুশ নোটিফিকেশন' },
    { id: 'integrations', label: 'ইন্টিগ্রেশন', icon: Wifi, description: 'তৃতীয় পক্ষের সার্ভিস ইন্টিগ্রেশন' },
    { id: 'audit', label: 'অডিট লগ', icon: FileText, description: 'সিস্টেম অ্যাক্টিভিটি লগ' },
    { id: 'advanced', label: 'অ্যাডভান্সড', icon: Zap, description: 'অ্যাডভান্সড সিস্টেম সেটিংস' },
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
            onClick={handleLogout}
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
                  <h1 className="text-xl font-semibold text-gray-900 leading-tight">সেটিংস</h1>
                  <p className="text-sm text-gray-600 leading-tight">সিস্টেম সেটিংস পরিচালনা করুন</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 h-full">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="সেটিংস খুঁজুন..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
                  />
                </div>
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
        <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
          <div className="max-w-6xl mx-auto">
            {/* Save Message */}
            {saveMessage && (
              <div className={`mb-4 p-4 rounded-lg flex items-center space-x-2 ${
                saveMessage.includes('সফলভাবে') || saveMessage.includes('successfully')
                  ? 'bg-green-100 border border-green-400 text-green-700'
                  : 'bg-red-100 border border-red-400 text-red-700'
              }`}>
                {saveMessage.includes('সফলভাবে') || saveMessage.includes('successfully') ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
                <span>{saveMessage}</span>
              </div>
            )}

            {/* Loading Overlay */}
            {saving && (
              <div className="fixed inset-0 bg-gray-900 bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
                <div className="bg-white rounded-lg p-6 flex items-center space-x-3 shadow-xl border border-gray-200">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-gray-700 font-medium">সংরক্ষণ হচ্ছে...</span>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Settings Navigation */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">সেটিংস মেনু</h3>
                  <nav className="space-y-1">
                    {settingsTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <tab.icon className="w-4 h-4 mr-3" />
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Settings Content */}
              <div className="lg:col-span-3 space-y-6">

                {/* Main Settings Content */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  {activeTab === 'fees' && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">ফি সেটআপ এবং কনফিগারেশন</h3>
                          <p className="text-sm text-gray-600 mt-1">সকল ধরনের ফি এবং চার্জ কনফিগার করুন</p>
                        </div>
                        <button
                          onClick={openNewFeeModal}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>নতুন ফি যোগ করুন</span>
                        </button>
                      </div>

                      <div className="space-y-6">
                        {/* Fee Categories */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {fees.length > 0 ? fees.map((fee, index) => (
                            <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                            <div className="text-2xl">{fee.icon || '💰'}</div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900">{fee.name}</h4>
                                    <p className="text-sm text-gray-600">{fee.students} জন শিক্ষার্থী</p>
                                  </div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  fee.status === 'সক্রিয়'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {fee.status}
                                </span>
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">পরিমাণ:</span>
                                  <span className="font-bold text-lg text-gray-900">৳{fee.amount}</span>
                                </div>

                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => openEditFeeModal(fee)}
                                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center space-x-1"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                    <span>সম্পাদনা</span>
                                  </button>
                                  <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 text-sm flex items-center justify-center space-x-1">
                                    <Eye className="w-3 h-3" />
                                    <span>দেখুন</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )) : (
                            <div className="col-span-full text-center py-8 text-gray-500">
                              কোনো ফি কনফিগার করা হয়নি
                            </div>
                          )}
                        </div>

                        {/* Quick Fee Type Selection */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                          <h4 className="font-semibold text-gray-900 mb-6">নতুন ফি যোগ করুন</h4>

                          {/* Fee Type Cards */}
                          <div className="mb-8">
                            <h5 className="text-sm font-medium text-gray-700 mb-4">ফি এর ধরন নির্বাচন করুন</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div
                                onClick={() => setFeeFormData({...feeFormData, name: 'মাসিক ফি', type: 'monthly', amount: '500'})}
                                className={`p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                                  feeFormData.name === 'মাসিক ফি' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="text-center">
                                  <h6 className="font-medium text-gray-900">মাসিক ফি</h6>
                                  <p className="text-2xl font-bold text-blue-600 mt-2">৫০০</p>
                                </div>
                              </div>

                              <div
                                onClick={() => setFeeFormData({...feeFormData, name: 'সেশন ফি', type: 'yearly', amount: '1000'})}
                                className={`p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                                  feeFormData.name === 'সেশন ফি' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="text-center">
                                  <h6 className="font-medium text-gray-900">সেশন ফি</h6>
                                  <p className="text-2xl font-bold text-green-600 mt-2">১০০০</p>
                                </div>
                              </div>

                              <div
                                onClick={() => setFeeFormData({...feeFormData, name: 'ভর্তি ফি', type: 'one-time', amount: '1200'})}
                                className={`p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                                  feeFormData.name === 'ভর্তি ফি' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="text-center">
                                  <h6 className="font-medium text-gray-900">ভর্তি ফি</h6>
                                  <p className="text-2xl font-bold text-purple-600 mt-2">১২০০</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Class Selection Cards */}
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-4">প্রযোজ্য ক্লাস নির্বাচন করুন</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div
                                onClick={() => setFeeFormData({...feeFormData, applicableClasses: 'all'})}
                                className={`p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                                  feeFormData.applicableClasses === 'all' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="text-center">
                                  <h6 className="font-medium text-gray-900">সকল ক্লাস</h6>
                                  <p className="text-sm text-gray-600 mt-1">সমস্ত ক্লাসের জন্য</p>
                                </div>
                              </div>

                              <div
                                onClick={() => setFeeFormData({...feeFormData, applicableClasses: 'term-1'})}
                                className={`p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                                  feeFormData.applicableClasses === 'term-1' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="text-center">
                                  <h6 className="font-medium text-gray-900">১ম টার্ম</h6>
                                  <p className="text-sm text-gray-600 mt-1">প্রথম টার্মের জন্য</p>
                                </div>
                              </div>

                              <div
                                onClick={() => setFeeFormData({...feeFormData, applicableClasses: 'annual'})}
                                className={`p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                                  feeFormData.applicableClasses === 'annual' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="text-center">
                                  <h6 className="font-medium text-gray-900">বার্ষিক</h6>
                                  <p className="text-sm text-gray-600 mt-1">সম্পূর্ণ বছরের জন্য</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Custom Amount Input */}
                          <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  কাস্টম পরিমাণ (টাকা)
                                </label>
                                <input
                                  type="number"
                                  value={feeFormData.amount}
                                  onChange={(e) => setFeeFormData({...feeFormData, amount: e.target.value})}
                                  placeholder="যেমন: 1500"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  বর্ণনা
                                </label>
                                <input
                                  type="text"
                                  value={feeFormData.description}
                                  onChange={(e) => setFeeFormData({...feeFormData, description: e.target.value})}
                                  placeholder="এই ফি কি জন্য নেওয়া হয়..."
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end space-x-3">
                            <button
                              onClick={resetFeeForm}
                              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                              রিসেট
                            </button>
                            <button
                              onClick={handleFeeSubmit}
                              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                            >
                              <Save className="w-4 h-4" />
                              <span>ফি সংরক্ষণ করুন</span>
                            </button>
                          </div>
                        </div>


                      </div>
                    </div>
                  )}

                  {activeTab === 'general' && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">সাধারণ সেটিংস</h3>
                          <p className="text-sm text-gray-600 mt-1">বেসিক সিস্টেম কনফিগারেশন</p>
                        </div>
                        <button
                          onClick={handleSaveSettings}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>সংরক্ষণ</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              স্কুলের নাম *
                            </label>
                            <input
                              type="text"
                              value={formData.schoolName}
                              onChange={(e) => setFormData({...formData, schoolName: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="স্কুলের পুরো নাম"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              স্কুলের কোড
                            </label>
                            <input
                              type="text"
                              value={formData.schoolCode}
                              onChange={(e) => setFormData({...formData, schoolCode: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="যেমন: IQRA-2025"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-sm font-medium text-gray-700">
                                একাডেমিক বর্ষ
                              </label>
                              <button
                                onClick={() => setShowAddYearModal(true)}
                                className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
                              >
                                <Plus className="w-4 h-4" />
                                <span>নতুন যোগ করুন</span>
                              </button>
                            </div>
                            <select
                              value={formData.academicYear}
                              onChange={(e) => setFormData({...formData, academicYear: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">একাডেমিক বর্ষ নির্বাচন করুন</option>
                              <option value="2031">২০৩১</option>
                              <option value="2030">২০৩০</option>
                              <option value="2029">২০২৯</option>
                              <option value="2028">২০২৮</option>
                              <option value="2027">২০২৭</option>
                              <option value="2026">২০২৬</option>
                              <option value="2025">২০২৫</option>
                              <option value="2024">২০২৪</option>
                              <option value="2023">২০২৩</option>
                              <option value="2022">২০২২</option>
                              <option value="2021">২০২১</option>
                              <option value="2020">২০২০</option>
                              <option value="2019">২০১৯</option>
                              <option value="2018">২০১৮</option>
                              <option value="2017">২০১৭</option>
                              <option value="2016">২০১৬</option>
                              {/* Custom academic years */}
                              {customAcademicYears.map((year) => (
                                <option key={year} value={year}>{year}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              প্রিন্সিপালের নাম
                            </label>
                            <input
                              type="text"
                              value={formData.principalName}
                              onChange={(e) => setFormData({...formData, principalName: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="প্রিন্সিপালের পুরো নাম"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              স্কুলের ধরন
                            </label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                              <option value="মাদ্রাসা">মাদ্রাসা</option>
                              <option value="স্কুল">স্কুল</option>
                              <option value="কলেজ">কলেজ</option>
                              <option value="বিশ্ববিদ্যালয়">বিশ্ববিদ্যালয়</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              সিস্টেম ল্যাংগুয়েজ
                            </label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                              <option value="bn">বাংলা</option>
                              <option value="en">English</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          স্কুলের বর্ণনা
                        </label>
                        <textarea
                          rows={4}
                          defaultValue="একটি আধুনিক ইসলামিক শিক্ষা প্রতিষ্ঠান যা ধর্মীয় এবং আধুনিক শিক্ষার সমন্বয়ে শিক্ষার্থীদের বিকাশে কাজ করে।"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="স্কুলের বর্ণনা লিখুন..."
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'users' && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">ব্যবহারকারী ম্যানেজমেন্ট</h3>
                          <p className="text-sm text-gray-600 mt-1">ব্যবহারকারী রোল এবং অনুমতি সেটিংস</p>
                        </div>
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
                          <Plus className="w-4 h-4" />
                          <span>নতুন রোল যোগ করুন</span>
                        </button>
                      </div>

                      <div className="space-y-4">
                        {/* User Role Cards */}
                        {[
                          { role: 'super_admin', name: 'সুপার অ্যাডমিন', count: 2, color: 'red' },
                          { role: 'admin', name: 'অ্যাডমিন', count: 5, color: 'blue' },
                          { role: 'teacher', name: 'শিক্ষক', count: 45, color: 'green' },
                          { role: 'parent', name: 'অভিভাবক', count: 234, color: 'purple' },
                          { role: 'student', name: 'শিক্ষার্থী', count: 1247, color: 'orange' }
                        ].map((role) => (
                          <div key={role.role} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className={`w-3 h-3 bg-${role.color}-500 rounded-full`}></div>
                              <div>
                                <h4 className="font-medium text-gray-900">{role.name}</h4>
                                <p className="text-sm text-gray-600">মোট {role.count} জন ব্যবহারকারী</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button className="text-blue-600 hover:text-blue-800">
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-800">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Permission Settings */}
                        <div className="mt-8">
                          <h4 className="font-medium text-gray-900 mb-4">ডিফল্ট অনুমতি সেটিংস</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                              { label: 'নতুন ব্যবহারকারী নিবন্ধন', defaultChecked: true },
                              { label: 'ইমেইল যাচাইকরণ প্রয়োজন', defaultChecked: true },
                              { label: 'অ্যাডমিন অনুমোদন প্রয়োজন', defaultChecked: false },
                              { label: 'পাসওয়ার্ড রিসেট অনুমতি', defaultChecked: true },
                              { label: 'প্রোফাইল সম্পাদনা অনুমতি', defaultChecked: true },
                              { label: 'ডেটা এক্সপোর্ট অনুমতি', defaultChecked: false }
                            ].map((setting, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-700">{setting.label}</span>
                                <input
                                  type="checkbox"
                                  defaultChecked={setting.defaultChecked}
                                  className="h-4 w-4 text-blue-600"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'security' && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">নিরাপত্তা সেটিংস</h3>
                          <p className="text-sm text-gray-600 mt-1">পাসওয়ার্ড এবং অ্যাক্সেস কন্ট্রোল</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Shield className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-green-600">সুরক্ষিত</span>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {/* Password Policy */}
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-3">পাসওয়ার্ড নীতি</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                ন্যূনতম দৈর্ঘ্য
                              </label>
                              <input
                                type="number"
                                defaultValue="8"
                                min="6"
                                max="20"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                সর্বোচ্চ বয়স (দিন)
                              </label>
                              <input
                                type="number"
                                defaultValue="90"
                                min="30"
                                max="365"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          <div className="mt-4 space-y-2">
                            {[
                              { label: 'বড় হাতের অক্ষর প্রয়োজন', checked: true },
                              { label: 'ছোট হাতের অক্ষর প্রয়োজন', checked: true },
                              { label: 'সংখ্যা প্রয়োজন', checked: true },
                              { label: 'বিশেষ অক্ষর প্রয়োজন', checked: false },
                              { label: 'পুনরাবৃত্তি পাসওয়ার্ড প্রতিরোধ', checked: true }
                            ].map((rule, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  defaultChecked={rule.checked}
                                  className="h-4 w-4 text-blue-600"
                                />
                                <span className="text-sm text-gray-700">{rule.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Two-Factor Authentication */}
                        <div className="p-4 bg-green-50 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-3">টু-ফ্যাক্টর অথেন্টিকেশন</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">অ্যাডমিন অ্যাকাউন্টের জন্য 2FA</p>
                                <p className="text-sm text-gray-600">অ্যাডমিন এবং সুপার অ্যাডমিনদের জন্য বাধ্যতামূলক</p>
                              </div>
                              <input type="checkbox" defaultChecked className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">সকল ব্যবহারকারীর জন্য 2FA</p>
                                <p className="text-sm text-gray-600">সমস্ত ব্যবহারকারীর জন্য ঐচ্ছিক</p>
                              </div>
                              <input type="checkbox" className="h-4 w-4 text-green-600" />
                            </div>
                          </div>
                        </div>

                        {/* Session Management */}
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <h4 className="font-medium text-purple-900 mb-3">সেশন ম্যানেজমেন্ট</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                সেশন টাইমআউট (মিনিট)
                              </label>
                              <input
                                type="number"
                                defaultValue="30"
                                min="5"
                                max="480"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                সর্বোচ্চ সক্রিয় সেশন
                              </label>
                              <input
                                type="number"
                                defaultValue="5"
                                min="1"
                                max="10"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'database' && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">ডেটাবেস ম্যানেজমেন্ট</h3>
                          <p className="text-sm text-gray-600 mt-1">ডেটাবেস ব্যাকআপ এবং মেইনটেন্যান্স</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Database className="w-5 h-5 text-blue-600" />
                          <span className="text-sm text-blue-600">সংযুক্ত</span>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {/* Database Status */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 bg-green-50 rounded-lg text-center">
                            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                            <div className="font-medium text-green-900">ডেটাবেস স্বাস্থ্য</div>
                            <div className="text-sm text-green-600">স্বাভাবিক</div>
                          </div>
                          <div className="p-4 bg-blue-50 rounded-lg text-center">
                            <HardDrive className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                            <div className="font-medium text-blue-900">স্টোরেজ ব্যবহার</div>
                            <div className="text-sm text-blue-600">{systemStats.storage.used}GB / {systemStats.storage.total}GB</div>
                          </div>
                          <div className="p-4 bg-purple-50 rounded-lg text-center">
                            <Clock className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                            <div className="font-medium text-purple-900">লাস্ট ব্যাকআপ</div>
                            <div className="text-sm text-purple-600">২ ঘন্টা আগে</div>
                          </div>
                        </div>

                        {/* Backup Settings */}
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-3">ব্যাকআপ সেটিংস</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                ব্যাকআপ ফ্রিকোয়েন্সি
                              </label>
                              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="daily">দৈনিক</option>
                                <option value="weekly">সাপ্তাহিক</option>
                                <option value="monthly">মাসিক</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                ব্যাকআপ রিটেনশন (দিন)
                              </label>
                              <input
                                type="number"
                                defaultValue="30"
                                min="7"
                                max="365"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          <div className="mt-4 flex space-x-3">
                            <button
                              onClick={handleBackup}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                            >
                              <Archive className="w-4 h-4" />
                              <span>ম্যানুয়াল ব্যাকআপ</span>
                            </button>
                            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
                              <RefreshCw className="w-4 h-4" />
                              <span>সিঙ্ক্রোনাইজ</span>
                            </button>
                          </div>
                        </div>

                        {/* Data Management */}
                        <div className="p-4 bg-yellow-50 rounded-lg">
                          <h4 className="font-medium text-yellow-900 mb-3">ডেটা ম্যানেজমেন্ট</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900">সমস্ত ডেটা এক্সপোর্ট</p>
                                <p className="text-sm text-gray-600">সম্পূর্ণ ডেটাবেস এক্সপোর্ট করুন</p>
                              </div>
                              <button
                                onClick={handleExportData}
                                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center space-x-2"
                              >
                                <Download className="w-4 h-4" />
                                <span>এক্সপোর্ট</span>
                              </button>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900">ক্যাশে পরিষ্কার করুন</p>
                                <p className="text-sm text-gray-600">সিস্টেম ক্যাশে পরিষ্কার করুন</p>
                              </div>
                              <button
                                onClick={handleClearCache}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>পরিষ্কার</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'appearance' && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">চেহারা কাস্টমাইজেশন</h3>
                          <p className="text-sm text-gray-600 mt-1">থিম এবং ইন্টারফেস সেটিংস</p>
                        </div>
                        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2">
                          <Palette className="w-4 h-4" />
                          <span>প্রিভিউ</span>
                        </button>
                      </div>

                      <div className="space-y-6">
                        {/* Theme Selection */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">থিম সিলেকশন</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                              { name: 'লাইট', color: 'white', preview: 'bg-white border-2 border-gray-200' },
                              { name: 'ডার্ক', color: 'gray-900', preview: 'bg-gray-900 border-2 border-gray-700' },
                              { name: 'ব্লু', color: 'blue-600', preview: 'bg-blue-600 border-2 border-blue-700' }
                            ].map((theme) => (
                              <div key={theme.name} className="text-center p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                                <div className={`w-16 h-16 mx-auto mb-3 rounded-lg ${theme.preview}`}></div>
                                <div className="font-medium text-gray-900">{theme.name}</div>
                                <input type="radio" name="theme" className="mt-2" />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Color Customization */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">প্রাইমারি কালার</h4>
                          <div className="flex space-x-3">
                            {[
                              { color: 'blue', class: 'bg-blue-600' },
                              { color: 'green', class: 'bg-green-600' },
                              { color: 'purple', class: 'bg-purple-600' },
                              { color: 'red', class: 'bg-red-600' },
                              { color: 'indigo', class: 'bg-indigo-600' },
                              { color: 'pink', class: 'bg-pink-600' }
                            ].map((color) => (
                              <div key={color.color} className={`w-8 h-8 rounded-full ${color.class} cursor-pointer hover:scale-110 transition-transform`}></div>
                            ))}
                          </div>
                        </div>

                        {/* Layout Options */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">লেআউট অপশনস</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                              { label: 'কমপ্যাক্ট মোড', description: 'কম জায়গা নেয়' },
                              { label: 'সাইডবার কোল্যাপ্স', description: 'সাইডবার লুকান' },
                              { label: 'ডার্ক মোড', description: 'চোখের জন্য আরামদায়ক' },
                              { label: 'আরটিএল সাপোর্ট', description: 'ডান থেকে বামে' }
                            ].map((option, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <p className="font-medium text-gray-900">{option.label}</p>
                                  <p className="text-sm text-gray-600">{option.description}</p>
                                </div>
                                <input type="checkbox" className="h-4 w-4 text-purple-600" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'system' && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">সিস্টেম মনিটরিং</h3>
                          <p className="text-sm text-gray-600 mt-1">সিস্টেম পারফরম্যান্স এবং হেলথ</p>
                        </div>
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
                          <RefreshCw className="w-4 h-4" />
                          <span>রিফ্রেশ</span>
                        </button>
                      </div>

                      <div className="space-y-6">
                        {/* System Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {[
                            { label: 'CPU Usage', value: `${systemStats.cpu.usage}%`, icon: Cpu, color: 'blue' },
                            { label: 'Memory Usage', value: `${systemStats.memory.percentage}%`, icon: MemoryStick, color: 'green' },
                            { label: 'Storage Usage', value: `${systemStats.storage.percentage}%`, icon: HardDrive, color: 'purple' },
                            { label: 'Active Users', value: systemStats.activeUsers.toString(), icon: Users, color: 'orange' }
                          ].map((metric) => (
                            <div key={metric.label} className="p-4 bg-gray-50 rounded-lg text-center">
                              <metric.icon className={`w-8 h-8 mx-auto mb-2 text-${metric.color}-600`} />
                              <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                              <div className="text-sm text-gray-600">{metric.label}</div>
                            </div>
                          ))}
                        </div>

                        {/* Performance Settings */}
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-3">পারফরম্যান্স সেটিংস</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                ক্যাশে এক্সপায়ারি (ঘন্টা)
                              </label>
                              <input
                                type="number"
                                defaultValue="24"
                                min="1"
                                max="168"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                ম্যাক্সিমাম আপলোড সাইজ (MB)
                              </label>
                              <input
                                type="number"
                                defaultValue="10"
                                min="1"
                                max="100"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* System Logs */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-3">সিস্টেম লগস</h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {[
                              { time: '14:32:15', level: 'INFO', message: 'User login successful' },
                              { time: '14:30:22', level: 'WARN', message: 'High memory usage detected' },
                              { time: '14:28:45', level: 'ERROR', message: 'Database connection timeout' },
                              { time: '14:25:10', level: 'INFO', message: 'Backup completed successfully' }
                            ].map((log, index) => (
                              <div key={index} className="flex items-center space-x-4 p-2 bg-white rounded text-sm">
                                <span className="text-gray-500 w-20">{log.time}</span>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  log.level === 'ERROR' ? 'bg-red-100 text-red-800' :
                                  log.level === 'WARN' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {log.level}
                                </span>
                                <span className="flex-1 text-gray-700">{log.message}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'notifications' && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">নোটিফিকেশন সেটিংস</h3>
                          <p className="text-sm text-gray-600 mt-1">ইমেইল এবং পুশ নোটিফিকেশন কনফিগারেশন</p>
                        </div>
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
                          <Mail className="w-4 h-4" />
                          <span>টেস্ট নোটিফিকেশন</span>
                        </button>
                      </div>

                      <div className="space-y-6">
                        {/* Email Settings */}
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-3">ইমেইল কনফিগারেশন</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                SMTP সার্ভার
                              </label>
                              <input
                                type="text"
                                defaultValue="smtp.gmail.com"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                SMTP পোর্ট
                              </label>
                              <input
                                type="number"
                                defaultValue="587"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                ইমেইল ঠিকানা
                              </label>
                              <input
                                type="email"
                                defaultValue="noreply@iqraschool.edu.bd"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                পাসওয়ার্ড
                              </label>
                              <div className="relative">
                                <input
                                  type={showPassword ? 'text' : 'password'}
                                  defaultValue="••••••••"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                >
                                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Notification Types */}
                        <div className="p-4 bg-green-50 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-3">নোটিফিকেশন টাইপস</h4>
                          <div className="space-y-3">
                            {[
                              { type: 'student_registration', label: 'নতুন শিক্ষার্থী নিবন্ধন', email: true, push: false },
                              { type: 'payment_reminder', label: 'পেমেন্ট অনুস্মারক', email: true, push: true },
                              { type: 'attendance_report', label: 'উপস্থিতি রিপোর্ট', email: false, push: true },
                              { type: 'system_alert', label: 'সিস্টেম অ্যালার্ট', email: true, push: true },
                              { type: 'exam_schedule', label: 'পরীক্ষার সময়সূচী', email: true, push: false }
                            ].map((notification) => (
                              <div key={notification.type} className="flex items-center justify-between p-3 bg-white rounded-lg">
                                <div>
                                  <p className="font-medium text-gray-900">{notification.label}</p>
                                  <p className="text-sm text-gray-600">ব্যবহারকারীদের জন্য নোটিফিকেশন পাঠান</p>
                                </div>
                                <div className="flex space-x-4">
                                  <div className="flex items-center space-x-2">
                                    <input type="checkbox" defaultChecked={notification.email} className="h-4 w-4 text-blue-600" />
                                    <Mail className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <input type="checkbox" defaultChecked={notification.push} className="h-4 w-4 text-green-600" />
                                    <Smartphone className="w-4 h-4 text-green-600" />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'integrations' && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">তৃতীয় পক্ষের ইন্টিগ্রেশন</h3>
                          <p className="text-sm text-gray-600 mt-1">বাহ্যিক সার্ভিস এবং API কনফিগারেশন</p>
                        </div>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                          <Plus className="w-4 h-4" />
                          <span>নতুন ইন্টিগ্রেশন</span>
                        </button>
                      </div>

                      <div className="space-y-4">
                        {/* Integration Cards */}
                        {[
                          {
                            name: 'Google Classroom',
                            status: 'সংযুক্ত',
                            icon: '📚',
                            description: 'ক্লাসরুম এবং অ্যাসাইনমেন্ট সিঙ্ক্রোনাইজেশন'
                          },
                          {
                            name: 'SMS Gateway',
                            status: 'সংযুক্ত',
                            icon: '📱',
                            description: 'এসএমএস নোটিফিকেশন এবং অ্যালার্ট'
                          },
                          {
                            name: 'Payment Gateway',
                            status: 'সংযুক্ত নেই',
                            icon: '💳',
                            description: 'অনলাইন পেমেন্ট প্রসেসিং'
                          },
                          {
                            name: 'Cloud Storage',
                            status: 'সংযুক্ত',
                            icon: '☁️',
                            description: 'ফাইল স্টোরেজ এবং ব্যাকআপ'
                          }
                        ].map((integration, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="text-2xl">{integration.icon}</div>
                              <div>
                                <h4 className="font-medium text-gray-900">{integration.name}</h4>
                                <p className="text-sm text-gray-600">{integration.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`px-2 py-1 rounded text-xs ${
                                integration.status === 'সংযুক্ত'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {integration.status}
                              </span>
                              <button className="text-blue-600 hover:text-blue-800">
                                <Edit3 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* API Settings */}
                        <div className="mt-8 p-4 bg-purple-50 rounded-lg">
                          <h4 className="font-medium text-purple-900 mb-3">API কনফিগারেশন</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                API Rate Limit (per minute)
                              </label>
                              <input
                                type="number"
                                defaultValue="100"
                                min="10"
                                max="1000"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                API Timeout (seconds)
                              </label>
                              <input
                                type="number"
                                defaultValue="30"
                                min="5"
                                max="300"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'audit' && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">অডিট লগস</h3>
                          <p className="text-sm text-gray-600 mt-1">সিস্টেম অ্যাক্টিভিটি এবং ইভেন্ট লগস</p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                            <Download className="w-4 h-4" />
                            <span>এক্সপোর্ট লগস</span>
                          </button>
                          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2">
                            <Trash2 className="w-4 h-4" />
                            <span>পুরানো লগস মুছুন</span>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Log Filters */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-3">লগ ফিল্টার</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                লগ লেভেল
                              </label>
                              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="all">সবগুলো</option>
                                <option value="info">INFO</option>
                                <option value="warn">WARNING</option>
                                <option value="error">ERROR</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                তারিখ থেকে
                              </label>
                              <input
                                type="date"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                তারিখ পর্যন্ত
                              </label>
                              <input
                                type="date"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Log Entries */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">সাম্প্রতিক লগ এন্ট্রি</h4>
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {[
                              {
                                time: '2025-01-26 14:32:15',
                                level: 'INFO',
                                user: 'admin@iqra.edu.bd',
                                action: 'User login successful',
                                ip: '192.168.1.100'
                              },
                              {
                                time: '2025-01-26 14:30:22',
                                level: 'WARN',
                                user: 'system',
                                action: 'High memory usage detected (85%)',
                                ip: 'localhost'
                              },
                              {
                                time: '2025-01-26 14:28:45',
                                level: 'ERROR',
                                user: 'api',
                                action: 'Database connection timeout',
                                ip: '192.168.1.101'
                              },
                              {
                                time: '2025-01-26 14:25:10',
                                level: 'INFO',
                                user: 'backup',
                                action: 'Automated backup completed successfully',
                                ip: 'localhost'
                              },
                              {
                                time: '2025-01-26 14:20:33',
                                level: 'INFO',
                                user: 'teacher@iqra.edu.bd',
                                action: 'Student attendance marked',
                                ip: '192.168.1.102'
                              }
                            ].map((log, index) => (
                              <div key={index} className="flex items-center space-x-4 p-3 bg-white rounded-lg text-sm">
                                <span className="text-gray-500 w-40">{log.time}</span>
                                <span className={`px-2 py-1 rounded text-xs w-16 text-center ${
                                  log.level === 'ERROR' ? 'bg-red-100 text-red-800' :
                                  log.level === 'WARN' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {log.level}
                                </span>
                                <span className="text-gray-700 w-48">{log.user}</span>
                                <span className="flex-1 text-gray-900">{log.action}</span>
                                <span className="text-gray-500 w-32">{log.ip}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'advanced' && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">অ্যাডভান্সড সেটিংস</h3>
                          <p className="text-sm text-gray-600 mt-1">উন্নত সিস্টেম কনফিগারেশন</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Zap className="w-5 h-5 text-yellow-600" />
                          <span className="text-sm text-yellow-600">অ্যাডভান্সড মোড</span>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {/* Development Settings */}
                        <div className="p-4 bg-yellow-50 rounded-lg">
                          <h4 className="font-medium text-yellow-900 mb-3">ডেভেলপমেন্ট সেটিংস</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">ডিবাগ মোড</p>
                                <p className="text-sm text-gray-600">বিস্তারিত লগিং এবং এরর রিপোর্টিং</p>
                              </div>
                              <input type="checkbox" className="h-4 w-4 text-yellow-600" />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">API ডকুমেন্টেশন</p>
                                <p className="text-sm text-gray-600">স্বয়ংক্রিয় API ডকুমেন্টেশন জেনারেশন</p>
                              </div>
                              <input type="checkbox" defaultChecked className="h-4 w-4 text-yellow-600" />
                            </div>
                          </div>
                        </div>

                        {/* Security Headers */}
                        <div className="p-4 bg-red-50 rounded-lg">
                          <h4 className="font-medium text-red-900 mb-3">সিকিউরিটি হেডারস</h4>
                          <div className="space-y-3">
                            {[
                              { name: 'Content Security Policy', enabled: true },
                              { name: 'X-Frame-Options', enabled: true },
                              { name: 'X-Content-Type-Options', enabled: true },
                              { name: 'Strict-Transport-Security', enabled: false },
                              { name: 'Referrer-Policy', enabled: true }
                            ].map((header, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">{header.name}</span>
                                <input
                                  type="checkbox"
                                  defaultChecked={header.enabled}
                                  className="h-4 w-4 text-red-600"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Custom Configuration */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-3">কাস্টম কনফিগারেশন</h4>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              কাস্টম CSS
                            </label>
                            <textarea
                              rows={4}
                              placeholder="/* কাস্টম CSS লিখুন */"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                            />
                          </div>
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              কাস্টম JavaScript
                            </label>
                            <textarea
                              rows={4}
                              placeholder="// কাস্টম JavaScript লিখুন"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                            />
                          </div>
                        </div>

                        {/* System Reset */}
                        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                          <h4 className="font-medium text-red-900 mb-3">সিস্টেম রিসেট</h4>
                          <p className="text-sm text-red-700 mb-4">
                            ⚠️ এই অপশনটি সমস্ত সেটিংস এবং ডেটা রিসেট করবে। এটি শুধুমাত্র জরুরী পরিস্থিতিতে ব্যবহার করুন।
                          </p>
                          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4" />
                            <span>ফ্যাক্টরি রিসেট</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Save Button */}
                  <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                    <button
                      onClick={handleSaveSettings}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>সমস্ত পরিবর্তন সংরক্ষণ করুন</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Academic Year Modal */}
      {showAddYearModal && (
        <div className="fixed inset-0 z-50">
          {/* Blur Background using CSS */}
          <div
            className="absolute inset-0 bg-black bg-opacity-30"
            style={{
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              background: 'rgba(0, 0, 0, 0.3)'
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">নতুন একাডেমিক বর্ষ যোগ করুন</h3>
                <button
                  onClick={() => setShowAddYearModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    একাডেমিক বর্ষ
                  </label>
                  <input
                    type="text"
                    value={newAcademicYear}
                    onChange={(e) => setNewAcademicYear(e.target.value)}
                    placeholder="যেমন: ২০২৫"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    বাংলায় লিখুন, যেমন: ২০২৫, ২০২৬, ২০২৭
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowAddYearModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    বাতিল
                  </button>
                  <button
                    onClick={handleAddAcademicYear}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>যোগ করুন</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fee Management Modal */}
      {showFeeModal && (
        <div className="fixed inset-0 z-50">
          {/* Blur Background using CSS */}
          <div
            className="absolute inset-0 bg-black bg-opacity-30"
            style={{
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              background: 'rgba(0, 0, 0, 0.3)'
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">

              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    নতুন ফি যোগ করুন
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    ফি এর বিস্তারিত তথ্য কনফিগার করুন
                  </p>
                </div>
                <button
                  onClick={() => setShowFeeModal(false)}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8">
                {/* Tuition Fee Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                    টিউশন
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Monthly Fee */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 hover:shadow-lg transition-all cursor-pointer">
                      <div className="text-center">
                        <h4 className="font-semibold text-gray-900 mb-2">মাসিক ফি</h4>
                        <div className="relative mb-4">
                          <input
                            type="number"
                            defaultValue="600"
                            className="w-full text-center text-2xl font-bold text-blue-700 bg-white border-2 border-blue-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="পরিমাণ লিখুন"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 font-bold">৳</span>
                        </div>
                        <p className="text-sm text-blue-600">প্রতি মাসে</p>
                      </div>
                    </div>

                    {/* Session Fee */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 hover:shadow-lg transition-all cursor-pointer">
                      <div className="text-center">
                        <h4 className="font-semibold text-gray-900 mb-2">সেশন ফি</h4>
                        <div className="relative mb-4">
                          <input
                            type="number"
                            defaultValue="1000"
                            className="w-full text-center text-2xl font-bold text-green-700 bg-white border-2 border-green-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="পরিমাণ লিখুন"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 font-bold">৳</span>
                        </div>
                        <p className="text-sm text-green-600">প্রতি সেশনে</p>
                      </div>
                    </div>

                    {/* Admission Fee */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 hover:shadow-lg transition-all cursor-pointer">
                      <div className="text-center">
                        <h4 className="font-semibold text-gray-900 mb-2">ভর্তি ফি</h4>
                        <div className="relative mb-4">
                          <input
                            type="number"
                            defaultValue="1200"
                            className="w-full text-center text-2xl font-bold text-purple-700 bg-white border-2 border-purple-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="পরিমাণ লিখুন"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-600 font-bold">৳</span>
                        </div>
                        <p className="text-sm text-purple-600">এককালীন</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exam Fee Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <span className="w-3 h-3 bg-orange-500 rounded-full mr-3"></span>
                    পরীক্ষার ফি
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* First Term Exam Fee */}
                    <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-xl border border-cyan-200 hover:shadow-lg transition-all cursor-pointer">
                      <div className="text-center">
                        <h4 className="font-semibold text-gray-900 mb-2">প্রথম সাময়িক</h4>
                        <div className="relative mb-4">
                          <input
                            type="number"
                            defaultValue="200"
                            className="w-full text-center text-2xl font-bold text-cyan-700 bg-white border-2 border-cyan-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder="পরিমাণ লিখুন"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-600 font-bold">৳</span>
                        </div>
                        <p className="text-sm text-cyan-600">প্রথম সাময়িক পরীক্ষা</p>
                      </div>
                    </div>

                    {/* Second Term Exam Fee */}
                    <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-xl border border-teal-200 hover:shadow-lg transition-all cursor-pointer">
                      <div className="text-center">
                        <h4 className="font-semibold text-gray-900 mb-2">দ্বিতীয় সাময়িক</h4>
                        <div className="relative mb-4">
                          <input
                            type="number"
                            defaultValue="250"
                            className="w-full text-center text-2xl font-bold text-teal-700 bg-white border-2 border-teal-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="পরিমাণ লিখুন"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-teal-600 font-bold">৳</span>
                        </div>
                        <p className="text-sm text-teal-600">দ্বিতীয় সাময়িক পরীক্ষা</p>
                      </div>
                    </div>

                    {/* Annual Exam Fee */}
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl border border-indigo-200 hover:shadow-lg transition-all cursor-pointer">
                      <div className="text-center">
                        <h4 className="font-semibold text-gray-900 mb-2">বার্ষিক</h4>
                        <div className="relative mb-4">
                          <input
                            type="number"
                            defaultValue="400"
                            className="w-full text-center text-2xl font-bold text-indigo-700 bg-white border-2 border-indigo-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="পরিমাণ লিখুন"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-600 font-bold">৳</span>
                        </div>
                        <p className="text-sm text-indigo-600">বার্ষিক পরীক্ষা</p>
                      </div>
                    </div>

                    {/* Monthly Exam Fee */}
                    <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-xl border border-pink-200 hover:shadow-lg transition-all cursor-pointer">
                      <div className="text-center">
                        <h4 className="font-semibold text-gray-900 mb-2">মাসিক</h4>
                        <div className="relative mb-4">
                          <input
                            type="number"
                            defaultValue="100"
                            className="w-full text-center text-2xl font-bold text-pink-700 bg-white border-2 border-pink-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                            placeholder="পরিমাণ লিখুন"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-pink-600 font-bold">৳</span>
                        </div>
                        <p className="text-sm text-pink-600">মাসিক পরীক্ষা</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Class Selection Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <span className="w-3 h-3 bg-purple-500 rounded-full mr-3"></span>
                    প্রযোজ্য ক্লাস নির্বাচন করুন
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {/* All Classes Option */}
                    <div
                      onClick={() => setSelectedClass('all')}
                      className={`bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-2 transition-all cursor-pointer text-center ${
                        selectedClass === 'all'
                          ? 'border-blue-500 bg-blue-100 shadow-lg'
                          : 'border-gray-200 hover:border-blue-400 hover:shadow-md'
                      }`}
                    >
                      <div className="font-semibold text-gray-900">সকল ক্লাস</div>
                      <div className="text-sm text-blue-600">সমস্ত ক্লাসের জন্য</div>
                    </div>

                    {/* Individual Class Options */}
                    {classes.slice(0, 6).map((cls) => (
                      <div
                        key={cls.classId}
                        onClick={() => setSelectedClass(cls.classId)}
                        className={`bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border-2 transition-all cursor-pointer text-center ${
                          selectedClass === cls.classId
                            ? 'border-green-500 bg-green-100 shadow-lg'
                            : 'border-gray-200 hover:border-green-400 hover:shadow-md'
                        }`}
                      >
                        <div className="font-semibold text-gray-900">{cls.className}</div>
                        <div className="text-sm text-gray-600">সেকশন {cls.section}</div>
                      </div>
                    ))}
                  </div>

                  {/* Selected Class Display */}
                  {selectedClass && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700">
                        নির্বাচিত ক্লাস: <span className="font-semibold">
                          {selectedClass === 'all' ? 'সকল ক্লাস' : classes.find(cls => cls.classId === selectedClass)?.className + ' - সেকশন ' + classes.find(cls => cls.classId === selectedClass)?.section}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Additional Settings */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">অতিরিক্ত সেটিংস</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ফি সংগ্রহের সময়সীমা
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                        <option value="">সময়সীমা নির্বাচন করুন</option>
                        <option value="1">মাসের ১ তারিখ</option>
                        <option value="5">মাসের ৫ তারিখ</option>
                        <option value="10">মাসের ১০ তারিখ</option>
                        <option value="15">মাসের ১৫ তারিখ</option>
                        <option value="30">মাসের শেষ তারিখ</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        লেট ফি (প্রতি দিন)
                      </label>
                      <input
                        type="number"
                        placeholder="যেমন: 10"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="feeIsActive"
                        defaultChecked
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <label htmlFor="feeIsActive" className="ml-2 text-sm text-gray-700">
                        ফি সক্রিয় করুন
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="feeIsMandatory"
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <label htmlFor="feeIsMandatory" className="ml-2 text-sm text-gray-700">
                        বাধ্যতামূলক ফি
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="feeAutoReminder"
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <label htmlFor="feeAutoReminder" className="ml-2 text-sm text-gray-700">
                        স্বয়ংক্রিয় অনুস্মারক পাঠান
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setShowFeeModal(false)}
                  className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleFeeSubmit}
                  className="px-8 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 flex items-center gap-2 transition-all transform hover:scale-105"
                >
                  <Save className="w-4 h-4" />
                  <span>ফি সংরক্ষণ করুন</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsPageWrapper() {
  return (
    <ProtectedRoute requireAuth={true}>
      <SettingsPage />
    </ProtectedRoute>
  );
}
