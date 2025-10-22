'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { User as AuthUser, onAuthStateChanged } from 'firebase/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { teacherQueries, settingsQueries, User as TeacherUser } from '@/lib/database-queries';
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
  Plus,
  Edit,
  Trash2,
  Eye,
  Package,
  Upload,
  Camera,
  AlertCircle,
  CheckCircle,
  Info,
  MapPin,
  Briefcase,
  Award,
  Calendar as CalendarIcon,
  DollarSign,
  Phone,
  Mail,
  User,
  FileText,
  Save,
  ArrowLeft
} from 'lucide-react';

function AddTeacherPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  // Teacher form state
  const [newTeacher, setNewTeacher] = useState({
    // Personal Information
    name: '',
    displayName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    nationality: 'বাংলাদেশী',
    religion: '',
    bloodGroup: '',
    fatherName: '',
    motherName: '',
    nationalId: '',
    nidNumber: '',

    // Professional Information
    subject: '',
    qualification: '',
    experience: '',
    specialization: '',
    joinDate: '',
    employeeId: '',
    department: '',
    designation: '',
    salary: '',
    employmentType: 'full-time',

    // Address Information
    presentAddress: '',
    permanentAddress: '',
    city: '',
    district: '',
    postalCode: '',
    country: 'Bangladesh',

    // Emergency Contact
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',

    // Additional Information
    profileImage: null as File | null,
    resume: null as File | null,
    certificates: [] as File[],
    languages: '',
    skills: '',
    achievements: '',
    publications: '',
    researchInterests: '',

    // System Fields
    isActive: true,
    role: 'teacher' as const,
    schoolId: '',
    schoolName: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [resumePreview, setResumePreview] = useState<string | null>(null);
  const [certificatesPreview, setCertificatesPreview] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('personal');
  const router = useRouter();

  // Subject options
  const subjectOptions = [
    'বাংলা', 'ইংরেজি', 'গণিত', 'বিজ্ঞান', 'সামাজিক বিজ্ঞান', 'ধর্মীয় শিক্ষা',
    'আরবি', 'কুরআন', 'হাদিস', 'ফিকহ', 'আকাইদ', 'তাজবিদ', 'কম্পিউটার',
    'শারীরিক শিক্ষা', 'চারুকলা', 'সংগীত', 'নাচ', 'ভাষা শিক্ষা'
  ];

  const qualificationOptions = [
    'এসএসসি', 'এইচএসসি', 'স্নাতক', 'স্নাতকোত্তর', 'ডক্টরেট',
    'মাদ্রাসা শিক্ষা', 'দাওরা হাদিস', 'তাকমিল', 'আলিম', 'ফাজিল', 'কামিল'
  ];

  const experienceOptions = [
    '১ বছরের কম', '১-২ বছর', '২-৫ বছর', '৫-১০ বছর',
    '১০-১৫ বছর', '১৫-২০ বছর', '২০ বছরের বেশি'
  ];

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

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const systemSettings = await settingsQueries.getSettings();
        setSettings(systemSettings);
        setNewTeacher(prev => ({
          ...prev,
          schoolId: systemSettings?.schoolCode || 'IQRA-2025',
          schoolName: systemSettings?.schoolName || 'আমার স্কুল'
        }));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Auto-generate employee ID
  useEffect(() => {
    if (newTeacher.name && !newTeacher.employeeId) {
      const timestamp = Date.now().toString().slice(-6);
      const nameInitials = newTeacher.name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 3);
      const employeeId = `TCH${nameInitials}${timestamp}`;
      setNewTeacher(prev => ({ ...prev, employeeId }));
    }
  }, [newTeacher.name]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setNewTeacher({ ...newTeacher, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ ...errors, profileImage: 'ফাইলের আকার ১০MB এর বেশি হতে পারবে না' });
        return;
      }

      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, profileImage: 'শুধুমাত্র ছবি ফাইল আপলোড করুন' });
        return;
      }

      setErrors({ ...errors, profileImage: '' });
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setNewTeacher({ ...newTeacher, profileImage: file });
    }
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        setErrors({ ...errors, resume: 'রিজিউম ফাইলের আকার ২৫MB এর বেশি হতে পারবে না' });
        return;
      }

      if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
        setErrors({ ...errors, resume: 'শুধুমাত্র PDF বা Word ফাইল আপলোড করুন' });
        return;
      }

      setErrors({ ...errors, resume: '' });
      setNewTeacher({ ...newTeacher, resume: file });
    }
  };

  const handleCertificatesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const validFiles = files.filter(file => {
        if (file.size > 10 * 1024 * 1024) {
          setErrors({ ...errors, certificates: 'প্রত্যেক সার্টিফিকেট ফাইলের আকার ১০MB এর বেশি হতে পারবে না' });
          return false;
        }
        if (!file.type.startsWith('image/') && !file.type.includes('pdf')) {
          setErrors({ ...errors, certificates: 'শুধুমাত্র ছবি বা PDF ফাইল আপলোড করুন' });
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        setErrors({ ...errors, certificates: '' });
        setNewTeacher({ ...newTeacher, certificates: validFiles });

        // Create previews
        validFiles.forEach(file => {
          const reader = new FileReader();
          reader.onload = (e) => {
            setCertificatesPreview(prev => [...prev, e.target?.result as string]);
          };
          reader.readAsDataURL(file);
        });
      }
    }
  };

  const removeImage = () => {
    setNewTeacher({ ...newTeacher, profileImage: null });
    setImagePreview(null);
  };

  const removeResume = () => {
    setNewTeacher({ ...newTeacher, resume: null });
    setResumePreview(null);
  };

  const removeCertificate = (index: number) => {
    const newCertificates = newTeacher.certificates.filter((_, i) => i !== index);
    const newPreviews = certificatesPreview.filter((_, i) => i !== index);
    setNewTeacher({ ...newTeacher, certificates: newCertificates });
    setCertificatesPreview(newPreviews);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!newTeacher.name.trim()) {
      newErrors.name = 'নাম প্রয়োজনীয়';
    }

    if (!newTeacher.email.trim()) {
      newErrors.email = 'ইমেইল প্রয়োজনীয়';
    } else if (!/\S+@\S+\.\S+/.test(newTeacher.email)) {
      newErrors.email = 'সঠিক ইমেইল ফরম্যাট দিন';
    }

    if (!newTeacher.phoneNumber.trim()) {
      newErrors.phoneNumber = 'ফোন নম্বর প্রয়োজনীয়';
    } else if (!/^01[3-9]\d{8}$/.test(newTeacher.phoneNumber)) {
      newErrors.phoneNumber = 'সঠিক ফোন নম্বর দিন';
    }

    if (!newTeacher.subject.trim()) {
      newErrors.subject = 'বিষয় প্রয়োজনীয়';
    }

    if (!newTeacher.qualification.trim()) {
      newErrors.qualification = 'যোগ্যতা প্রয়োজনীয়';
    }

    if (!newTeacher.experience.trim()) {
      newErrors.experience = 'অভিজ্ঞতা প্রয়োজনীয়';
    }

    if (!newTeacher.joinDate.trim()) {
      newErrors.joinDate = 'যোগদানের তারিখ প্রয়োজনীয়';
    }

    if (!newTeacher.department.trim()) {
      newErrors.department = 'বিভাগ প্রয়োজনীয়';
    }

    if (!newTeacher.designation.trim()) {
      newErrors.designation = 'পদবী প্রয়োজনীয়';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveTeacher = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      const teacherData: Partial<TeacherUser> = {
        name: newTeacher.name,
        displayName: newTeacher.name,
        email: newTeacher.email,
        phoneNumber: newTeacher.phoneNumber,
        dateOfBirth: newTeacher.dateOfBirth,
        gender: newTeacher.gender,
        maritalStatus: newTeacher.maritalStatus,
        nationality: newTeacher.nationality,
        religion: newTeacher.religion,
        bloodGroup: newTeacher.bloodGroup,
        fatherName: newTeacher.fatherName,
        motherName: newTeacher.motherName,
        nationalId: newTeacher.nationalId,

        // Professional Information
        subject: newTeacher.subject,
        qualification: newTeacher.qualification,
        experience: newTeacher.experience,
        specialization: newTeacher.specialization,
        joinDate: newTeacher.joinDate,
        employeeId: newTeacher.employeeId,
        department: newTeacher.department,
        designation: newTeacher.designation,
        salary: parseFloat(newTeacher.salary) || 0,
        employmentType: newTeacher.employmentType,

        // Address Information
        address: newTeacher.presentAddress,
        city: newTeacher.city,
        district: newTeacher.district,
        postalCode: newTeacher.postalCode,
        country: newTeacher.country,

        // Emergency Contact
        emergencyContactName: newTeacher.emergencyContactName,
        emergencyContactPhone: newTeacher.emergencyContactPhone,
        emergencyContactRelation: newTeacher.emergencyContactRelation,

        // Additional Information
        languages: newTeacher.languages,
        skills: newTeacher.skills,
        achievements: newTeacher.achievements,
        publications: newTeacher.publications,
        researchInterests: newTeacher.researchInterests,

        // System Fields
        isActive: newTeacher.isActive,
        role: 'teacher',
        schoolId: newTeacher.schoolId,
        schoolName: newTeacher.schoolName
      };

      const teacherId = await teacherQueries.createTeacher(teacherData as TeacherUser);

      setShowSuccess(true);
      setTimeout(() => {
        router.push('/admin/teachers');
      }, 2000);
    } catch (error) {
      console.error('Error saving teacher:', error);
      alert('শিক্ষক যোগ করতে ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSaving(false);
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
    { icon: GraduationCap, label: 'শিক্ষক', href: '/admin/teachers', active: true },
    { icon: Building, label: 'অভিভাবক', href: '/admin/parents', active: false },
    { icon: BookOpen, label: 'ক্লাস', href: '/admin/classes', active: false },
    { icon: ClipboardList, label: 'উপস্থিতি', href: '/admin/attendance', active: false },
    { icon: Calendar, label: 'ইভেন্ট', href: '/admin/events', active: false },
    { icon: CreditCard, label: 'হিসাব', href: '/admin/accounting', active: false },
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
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:flex lg:flex-col ${
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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <div className="bg-white shadow-sm border-b border-gray-200 h-16">
          <div className="h-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center h-full">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <button
                  onClick={() => router.back()}
                  className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
                >
                  <ArrowLeft className="w-5 h-5 mr-1" />
                  ফিরে যান
                </button>
                <div className="flex flex-col justify-center h-full">
                  <h1 className="text-xl font-semibold text-gray-900 leading-tight">নতুন শিক্ষক যোগ করুন</h1>
                  <p className="text-sm text-gray-600 leading-tight">শিক্ষকের সম্পূর্ণ তথ্য যোগ করুন</p>
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
        <div className="flex-1 p-4 lg:p-6 bg-gray-50 overflow-y-auto">
          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">নতুন শিক্ষক যোগ করুন</h2>
            <p className="text-gray-600">শিক্ষকের সমস্ত তথ্য সঠিকভাবে পূরণ করুন</p>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'personal', label: 'ব্যক্তিগত তথ্য', icon: User },
                  { id: 'professional', label: 'পেশাগত তথ্য', icon: Briefcase },
                  { id: 'address', label: 'ঠিকানা', icon: MapPin },
                  { id: 'documents', label: 'ডকুমেন্টস', icon: FileText },
                  { id: 'additional', label: 'অতিরিক্ত তথ্য', icon: Info }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Form Sections */}
          <div className="space-y-6">
            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  ব্যক্তিগত তথ্য
                </h3>

                {/* Profile Image */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">প্রোফাইল ছবি</label>
                  <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Profile preview"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <Camera className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex space-x-3">
                        <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                          <Upload className="w-4 h-4" />
                          <span>ছবি নির্বাচন করুন</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        {imagePreview && (
                          <button
                            onClick={removeImage}
                            className="px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                          >
                            ছবি সরান
                          </button>
                        )}
                      </div>
                      {errors.profileImage && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.profileImage}
                        </p>
                      )}
                      <p className="text-gray-500 text-sm mt-2">সর্বোচ্চ ১০MB, JPG, PNG, GIF ফরম্যাট</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">পুরো নাম *</label>
                    <input
                      type="text"
                      value={newTeacher.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="শিক্ষকের পুরো নাম"
                    />
                    {errors.name && (
                      <p className="text-red-600 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ইমেইল *</label>
                    <input
                      type="email"
                      value={newTeacher.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="teacher@school.com"
                    />
                    {errors.email && (
                      <p className="text-red-600 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ফোন নম্বর *</label>
                    <input
                      type="tel"
                      value={newTeacher.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="01712345678"
                    />
                    {errors.phoneNumber && (
                      <p className="text-red-600 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">জন্ম তারিখ</label>
                    <input
                      type="date"
                      value={newTeacher.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">লিঙ্গ</label>
                    <select
                      value={newTeacher.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">লিঙ্গ নির্বাচন করুন</option>
                      <option value="male">পুরুষ</option>
                      <option value="female">মহিলা</option>
                      <option value="other">অন্যান্য</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">বৈবাহিক অবস্থা</label>
                    <select
                      value={newTeacher.maritalStatus}
                      onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">বৈবাহিক অবস্থা নির্বাচন করুন</option>
                      <option value="single">অবিবাহিত</option>
                      <option value="married">বিবাহিত</option>
                      <option value="divorced">তালাকপ্রাপ্ত</option>
                      <option value="widowed">বিধবা/বিপত্নীক</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">জাতীয়তা</label>
                    <input
                      type="text"
                      value={newTeacher.nationality}
                      onChange={(e) => handleInputChange('nationality', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="বাংলাদেশী"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ধর্ম</label>
                    <input
                      type="text"
                      value={newTeacher.religion}
                      onChange={(e) => handleInputChange('religion', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="ইসলাম"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">রক্তের গ্রুপ</label>
                    <select
                      value={newTeacher.bloodGroup}
                      onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">রক্তের গ্রুপ নির্বাচন করুন</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">পিতার নাম</label>
                    <input
                      type="text"
                      value={newTeacher.fatherName}
                      onChange={(e) => handleInputChange('fatherName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="পিতার পুরো নাম"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">মাতার নাম</label>
                    <input
                      type="text"
                      value={newTeacher.motherName}
                      onChange={(e) => handleInputChange('motherName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="মাতার পুরো নাম"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">জাতীয় পরিচয়পত্র নম্বর</label>
                    <input
                      type="text"
                      value={newTeacher.nationalId}
                      onChange={(e) => handleInputChange('nationalId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="১২৩৪৫৬৭৮৯০১২৩৪"
                      maxLength={17}
                    />
                    <p className="text-gray-500 text-xs mt-1">১৭ সংখ্যার NID নম্বর</p>
                  </div>
                </div>
              </div>
            )}

            {/* Professional Information Tab */}
            {activeTab === 'professional' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2" />
                  পেশাগত তথ্য
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">বিষয় *</label>
                    <select
                      value={newTeacher.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.subject ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">বিষয় নির্বাচন করুন</option>
                      {subjectOptions.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                    {errors.subject && (
                      <p className="text-red-600 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">যোগ্যতা *</label>
                    <select
                      value={newTeacher.qualification}
                      onChange={(e) => handleInputChange('qualification', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.qualification ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">যোগ্যতা নির্বাচন করুন</option>
                      {qualificationOptions.map((qual) => (
                        <option key={qual} value={qual}>
                          {qual}
                        </option>
                      ))}
                    </select>
                    {errors.qualification && (
                      <p className="text-red-600 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.qualification}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">অভিজ্ঞতা *</label>
                    <select
                      value={newTeacher.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.experience ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">অভিজ্ঞতা নির্বাচন করুন</option>
                      {experienceOptions.map((exp) => (
                        <option key={exp} value={exp}>
                          {exp}
                        </option>
                      ))}
                    </select>
                    {errors.experience && (
                      <p className="text-red-600 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.experience}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">বিশেষজ্ঞতা</label>
                    <input
                      type="text"
                      value={newTeacher.specialization}
                      onChange={(e) => handleInputChange('specialization', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="যেমন: উচ্চতর গণিত, ইংরেজি সাহিত্য"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">যোগদানের তারিখ *</label>
                    <input
                      type="date"
                      value={newTeacher.joinDate}
                      onChange={(e) => handleInputChange('joinDate', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.joinDate ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.joinDate && (
                      <p className="text-red-600 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.joinDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">কর্মচারী আইডি</label>
                    <input
                      type="text"
                      value={newTeacher.employeeId}
                      onChange={(e) => handleInputChange('employeeId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-green-50"
                      placeholder="স্বয়ংক্রিয়ভাবে তৈরি হবে"
                      readOnly
                    />
                    <p className="text-green-600 text-xs mt-1">স্বয়ংক্রিয়ভাবে তৈরি হয়েছে</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">বিভাগ *</label>
                    <input
                      type="text"
                      value={newTeacher.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.department ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="যেমন: বিজ্ঞান, মানবিক, বাণিজ্য"
                    />
                    {errors.department && (
                      <p className="text-red-600 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.department}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">পদবী *</label>
                    <input
                      type="text"
                      value={newTeacher.designation}
                      onChange={(e) => handleInputChange('designation', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.designation ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="যেমন: সহকারী শিক্ষক, সিনিয়র শিক্ষক"
                    />
                    {errors.designation && (
                      <p className="text-red-600 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.designation}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">বেতন</label>
                    <input
                      type="number"
                      value={newTeacher.salary}
                      onChange={(e) => handleInputChange('salary', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="৩৫০০০"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">কর্মসংস্থানের ধরন</label>
                    <select
                      value={newTeacher.employmentType}
                      onChange={(e) => handleInputChange('employmentType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="full-time">পূর্ণকালীন</option>
                      <option value="part-time">খণ্ডকালীন</option>
                      <option value="contract">চুক্তিভিত্তিক</option>
                      <option value="temporary">অস্থায়ী</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Address Information Tab */}
            {activeTab === 'address' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  ঠিকানা তথ্য
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">বর্তমান ঠিকানা</label>
                    <textarea
                      value={newTeacher.presentAddress}
                      onChange={(e) => handleInputChange('presentAddress', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="বর্তমান ঠিকানা"
                      rows={3}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">স্থায়ী ঠিকানা</label>
                    <textarea
                      value={newTeacher.permanentAddress}
                      onChange={(e) => handleInputChange('permanentAddress', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="স্থায়ী ঠিকানা"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">শহর</label>
                    <input
                      type="text"
                      value={newTeacher.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="শহরের নাম"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">জেলা</label>
                    <input
                      type="text"
                      value={newTeacher.district}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="জেলার নাম"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">পোস্টাল কোড</label>
                    <input
                      type="text"
                      value={newTeacher.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="১২০০"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">দেশ</label>
                    <input
                      type="text"
                      value={newTeacher.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Bangladesh"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">জরুরী যোগাযোগের নাম</label>
                    <input
                      type="text"
                      value={newTeacher.emergencyContactName}
                      onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="জরুরী যোগাযোগের ব্যক্তির নাম"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">জরুরী যোগাযোগের ফোন</label>
                    <input
                      type="tel"
                      value={newTeacher.emergencyContactPhone}
                      onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="01712345678"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">সম্পর্ক</label>
                    <input
                      type="text"
                      value={newTeacher.emergencyContactRelation}
                      onChange={(e) => handleInputChange('emergencyContactRelation', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="যেমন: ভাই, বোন, স্বামী"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  ডকুমেন্টস
                </h3>

                <div className="space-y-6">
                  {/* Resume Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">রিজিউম/CV</label>
                    <div className="flex items-center space-x-6">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                        {resumePreview ? (
                          <FileText className="w-8 h-8 text-blue-600" />
                        ) : (
                          <Upload className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex space-x-3">
                          <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                            <Upload className="w-4 h-4" />
                            <span>রিজিউম আপলোড করুন</span>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={handleResumeUpload}
                              className="hidden"
                            />
                          </label>
                          {resumePreview && (
                            <button
                              onClick={removeResume}
                              className="px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                            >
                              রিজিউম সরান
                            </button>
                          )}
                        </div>
                        {errors.resume && (
                          <p className="text-red-600 text-sm mt-2 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.resume}
                          </p>
                        )}
                        <p className="text-gray-500 text-sm mt-2">সর্বোচ্চ ২৫MB, PDF বা Word ফরম্যাট</p>
                      </div>
                    </div>
                  </div>

                  {/* Certificates Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">সার্টিফিকেটসমূহ</label>
                    <div className="flex items-center space-x-6">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                        <Award className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex space-x-3">
                          <label className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
                            <Upload className="w-4 h-4" />
                            <span>সার্টিফিকেট আপলোড করুন</span>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              multiple
                              onChange={handleCertificatesUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                        {errors.certificates && (
                          <p className="text-red-600 text-sm mt-2 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.certificates}
                          </p>
                        )}
                        <p className="text-gray-500 text-sm mt-2">সর্বোচ্চ ১০MB প্রতি ফাইল, ছবি বা PDF ফরম্যাট</p>

                        {/* Certificate Previews */}
                        {certificatesPreview.length > 0 && (
                          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                            {certificatesPreview.map((preview, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={preview}
                                  alt={`Certificate ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg border"
                                />
                                <button
                                  onClick={() => removeCertificate(index)}
                                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full hover:bg-red-700 flex items-center justify-center"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Information Tab */}
            {activeTab === 'additional' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  অতিরিক্ত তথ্য
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ভাষা জ্ঞান</label>
                    <input
                      type="text"
                      value={newTeacher.languages}
                      onChange={(e) => handleInputChange('languages', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="যেমন: বাংলা, ইংরেজি, আরবি"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">দক্ষতা</label>
                    <input
                      type="text"
                      value={newTeacher.skills}
                      onChange={(e) => handleInputChange('skills', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="যেমন: MS Office, Programming, Leadership"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">অর্জনসমূহ</label>
                    <textarea
                      value={newTeacher.achievements}
                      onChange={(e) => handleInputChange('achievements', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="শিক্ষকের বিশেষ অর্জন বা পুরস্কার"
                      rows={3}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">প্রকাশনা</label>
                    <textarea
                      value={newTeacher.publications}
                      onChange={(e) => handleInputChange('publications', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="গবেষণা পত্র বা প্রকাশিত বই"
                      rows={3}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">গবেষণা আগ্রহ</label>
                    <textarea
                      value={newTeacher.researchInterests}
                      onChange={(e) => handleInputChange('researchInterests', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="গবেষণা বা বিশেষ আগ্রহের ক্ষেত্র"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Success Notification */}
          {showSuccess && (
            <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>শিক্ষক সফলভাবে যোগ করা হয়েছে!</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => router.push('/admin/teachers')}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={isSaving}
            >
              বাতিল
            </button>
            <button
              onClick={handleSaveTeacher}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>সংরক্ষণ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>শিক্ষক যোগ করুন</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AddTeacherPageWrapper() {
  return (
    <ProtectedRoute requireAuth={true}>
      <AddTeacherPage />
    </ProtectedRoute>
  );
}
