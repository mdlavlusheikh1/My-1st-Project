'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { userQueries, emailUtils, settingsQueries, studentQueries, classQueries } from '@/lib/database-queries';
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
  Info
} from 'lucide-react';

function AddStudentPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [classes, setClasses] = useState<string[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    class: '',
    studentId: '',
    guardianName: '',
    guardianPhone: '',
    address: '',
    section: '',
    group: '',
    profileImage: null as File | null,
    dateOfBirth: '',
    // Parents Information
    fatherName: '',
    fatherPhone: '',
    fatherOccupation: '',
    motherName: '',
    motherPhone: '',
    motherOccupation: '',
    emergencyContact: '',
    emergencyRelation: '',
    // Full Address
    presentAddress: '',
    permanentAddress: '',
    city: '',
    district: '',
    postalCode: '',
    // Previous School Info
    previousSchool: '',
    previousClass: '',
    previousSchoolAddress: '',
    reasonForLeaving: '',
    previousGPA: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const router = useRouter();

  // Generate sequential student ID
  const generateStudentId = async () => {
    try {
      console.log('🔢 Generating new student ID...');
      const students = await studentQueries.getAllStudents();
      console.log('📊 Total students found:', students.length);

      // Log all students with their IDs for debugging
      students.forEach((student, index) => {
        console.log(`📝 Student ${index + 1}:`, {
          name: student.name,
          studentId: student.studentId,
          isApproved: student.isApproved
        });
      });

      // Get all valid sequential student IDs (STD001, STD002, etc.)
      const sequentialStudentIds = students
        .map(s => s.studentId)
        .filter((id): id is string => {
          if (!id || !id.startsWith('STD')) return false;
          const numPart = id.replace('STD', '');
          const num = parseInt(numPart);
          return !isNaN(num) && num > 0 && num < 1000; // Only valid sequential IDs
        })
        .map(id => {
          const numPart = id.replace('STD', '');
          const num = parseInt(numPart);
          console.log('🔍 Processing CHECKED ID:', id, '-> Number:', num);
          return num;
        })
        .sort((a, b) => a - b); // Sort ascending

      console.log('📋 Valid sequential student IDs:', sequentialStudentIds);

      // Find the next sequential number
      let nextNumber = 1;
      if (sequentialStudentIds.length > 0) {
        const maxNumber = Math.max(...sequentialStudentIds);
        nextNumber = maxNumber + 1;
      }

      // Double-check to ensure the ID doesn't already exist
      let newId = `STD${nextNumber.toString().padStart(3, '0')}`;
      let attempts = 0;
      const maxAttempts = 1000;

      while (students.some(s => s.studentId === newId) && attempts < maxAttempts) {
        nextNumber++;
        newId = `STD${nextNumber.toString().padStart(3, '0')}`;
        attempts++;
      }

      if (attempts >= maxAttempts) {
        console.error('❌ Could not generate unique ID after maximum attempts');
        newId = `STD${Date.now().toString().slice(-6)}`; // Fallback to timestamp
      }

      console.log('🔢 Next sequential number:', nextNumber);
      console.log('✅ Generated new student ID:', newId);
      console.log('🔍 Verification - ID exists in database:', students.some(s => s.studentId === newId));

      return newId;
    } catch (error) {
      console.error('❌ Error generating student ID:', error);
      // Use simple sequential ID as fallback
      const fallbackId = `STD001`;
      console.log('🔄 Using fallback ID:', fallbackId);
      return fallbackId;
    }
  };

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

  // Load classes, sections, and groups from Firebase
  useEffect(() => {
    const loadClassData = async () => {
      try {
        // Load all classes from Firebase
        const allClasses = await classQueries.getAllClasses();
        console.log('Loaded classes:', allClasses);

        // Extract unique class names
        const classNames = [...new Set(allClasses.map(cls => cls.className).filter((name): name is string => Boolean(name)))];
        setClasses(classNames.length > 0 ? classNames : ['ক্লাস ১', 'ক্লাস ২', 'ক্লাস ৩', 'ক্লাস ৪', 'ক্লাস ৫', 'ক্লাস ৬', 'ক্লাস ৭', 'ক্লাস ৮', 'ক্লাস ৯', 'ক্লাস ১০']);

        // Extract unique sections from classes
        const sectionNames = [...new Set(allClasses.map(cls => cls.section).filter((section): section is string => Boolean(section)))];
        setSections(sectionNames.length > 0 ? sectionNames : ['ক', 'খ', 'গ', 'ঘ']);

        // Extract unique groups from classes (if available)
        const groupNames = [...new Set(allClasses
          .map(cls => cls.group)
          .filter((group): group is string => Boolean(group && group.trim() !== ''))
        )];
        setGroups(groupNames.length > 0 ? groupNames : ['বিজ্ঞান', 'মানবিক', 'বাণিজ্য']);

        console.log('Class names:', classNames);
        console.log('Section names:', sectionNames);
        console.log('Group names:', groupNames);

      } catch (error) {
        console.error('Error loading class data:', error);
        // Fallback to default values
        setClasses(['ক্লাস ১', 'ক্লাস ২', 'ক্লাস ৩', 'ক্লাস ৪', 'ক্লাস ৫', 'ক্লাস ৬', 'ক্লাস ৭', 'ক্লাস ৮', 'ক্লাস ৯', 'ক্লাস ১০']);
        setSections(['ক', 'খ', 'গ', 'ঘ']);
        setGroups(['বিজ্ঞান', 'মানবিক', 'বাণিজ্য']);
      }
    };

    loadClassData();
  }, []);

  // Auto-generate student ID when component loads
  useEffect(() => {
    const generateId = async () => {
      if (!newStudent.studentId) {
        const newId = await generateStudentId();
        setNewStudent(prev => ({ ...prev, studentId: newId }));
      }
    };
    generateId();
  }, []);

  // Auto-generate email when name is typed
  useEffect(() => {
    if (newStudent.name.trim()) {
      // Auto-generate email when name is typed
      const generatedEmail = emailUtils.generateStudentEmail(
        newStudent.name,
        newStudent.studentId || '001',
        'iqra'
      );
      setNewStudent(prev => ({ ...prev, email: generatedEmail }));
    } else {
      // Clear email when name is cleared
      setNewStudent(prev => ({ ...prev, email: '' }));
    }
  }, [newStudent.name, newStudent.studentId]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setNewStudent({ ...newStudent, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ ...errors, profileImage: 'ফাইলের আকার ১০MB এর বেশি হতে পারবে না' });
        return;
      }

      // Validate file type (images and videos)
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        setErrors({ ...errors, profileImage: 'শুধুমাত্র ছবি বা ভিডিও ফাইল আপলোড করুন' });
        return;
      }

      try {
        setErrors({ ...errors, profileImage: '' });

        // Show preview immediately
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Store file for later upload
        setNewStudent({ ...newStudent, profileImage: file });

      } catch (error) {
        console.error('Error handling file:', error);
        setErrors({ ...errors, profileImage: 'ফাইল প্রসেস করতে সমস্যা হয়েছে' });
      }
    }
  };

  const removeImage = () => {
    setNewStudent({ ...newStudent, profileImage: null });
    setImagePreview(null);
  };

  // Generate email address automatically
  const generateEmail = () => {
    if (!newStudent.name.trim() || !newStudent.studentId.trim()) {
      alert('নাম এবং রোল নম্বর দিয়ে ইমেইল তৈরি করুন');
      return;
    }

    const generatedEmail = emailUtils.generateStudentEmail(newStudent.name, newStudent.studentId);
    setNewStudent({ ...newStudent, email: generatedEmail });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!newStudent.name.trim()) {
      newErrors.name = 'নাম প্রয়োজনীয়';
    }

    // Email is now optional, but if provided, validate format
    if (newStudent.email.trim() && !/\S+@\S+\.\S+/.test(newStudent.email)) {
      newErrors.email = 'সঠিক ইমেইল ফরম্যাট দিন';
    }

    if (newStudent.phoneNumber && !/^01[3-9]\d{8}$/.test(newStudent.phoneNumber)) {
      newErrors.phoneNumber = 'সঠিক ফোন নম্বর দিন';
    }

    if (newStudent.guardianPhone && !/^01[3-9]\d{8}$/.test(newStudent.guardianPhone)) {
      newErrors.guardianPhone = 'সঠিক ফোন নম্বর দিন';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveStudent = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      // Get settings to use school information
      const settings = await settingsQueries.getSettings();

      // Preserve the student ID as entered by the user
      const finalStudentId = newStudent.studentId || `STD${Date.now().toString().slice(-3)}`;

      const studentData = {
        name: newStudent.name,
        displayName: newStudent.name,
        email: newStudent.email,
        phoneNumber: newStudent.phoneNumber,
        class: newStudent.class,
        studentId: finalStudentId, // Use the provided or default student ID
        guardianName: newStudent.guardianName,
        guardianPhone: newStudent.guardianPhone,
        address: newStudent.address,
        dateOfBirth: newStudent.dateOfBirth,
        section: newStudent.section,
        group: newStudent.group,
        role: 'student' as const,
        schoolId: settings?.schoolCode || 'IQRA-2025',
        schoolName: settings?.schoolName || 'আমার স্কুল',
        isActive: true,
        isApproved: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Use the student-specific creation method with auto-email
      const studentId = await studentQueries.createStudentWithAutoEmail(studentData as any);

      setShowSuccess(true);
      setTimeout(() => {
        router.push('/admin/students');
      }, 2000);
    } catch (error) {
      console.error('Error saving student:', error);
      alert('শিক্ষার্থী যোগ করতে ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
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
    { icon: Users, label: 'শিক্ষার্থী', href: '/admin/students', active: true },
    { icon: GraduationCap, label: 'শিক্ষক', href: '/admin/teachers', active: false },
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
          <div className="flex items-center space-x-2 flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-gray-600 hover:text-gray-800 p-1"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">ই</span>
            </div>
            <span className={`text-lg font-bold text-gray-900 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100'}`}>
              সুপার অ্যাডমিন
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className={`text-gray-500 hover:text-gray-700 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
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
                <div className="flex flex-col justify-center h-full">
                  <h1 className="text-xl font-semibold text-gray-900 leading-tight">শিক্ষার্থী যোগ করুন</h1>
                  <p className="text-sm text-gray-600 leading-tight">নতুন শিক্ষার্থীর তথ্য যোগ করুন</p>
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
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/admin/students')}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>শিক্ষার্থী তালিকায় ফিরে যান</span>
            </button>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">নতুন শিক্ষার্থী যোগ করুন</h2>
            <p className="text-gray-600">শিক্ষার্থীর সমস্ত তথ্য পূরণ করুন</p>
          </div>

          {/* Form Sections */}
          <div className="space-y-8">
            {/* Profile Image Upload */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">প্রোফাইল ছবি</h3>
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">ছবি আপলোড করুন</label>
                  <div className="flex space-x-3">
                    <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                      <Upload className="w-4 h-4" />
                      <span>ছবি নির্বাচন করুন</span>
                      <input
                        type="file"
                        accept="image/*,video/*"
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
                  <p className="text-gray-500 text-sm mt-2">সর্বোচ্চ ১০MB, JPG, PNG, GIF, MP4, AVI ফরম্যাট</p>
                </div>
              </div>
            </div>

            {/* Student Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">শিক্ষার্থীর তথ্য</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">নাম *</label>
                  <input
                    type="text"
                    value={newStudent.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="শিক্ষার্থীর পুরো নাম"
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ইমেইল
                    <span className="text-gray-500 text-xs ml-1">(ঐচ্ছিক)</span>
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="email"
                      value={newStudent.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      } ${newStudent.email && newStudent.name ? 'bg-green-50 border-green-200' : ''}`}
                      placeholder="নাম লিখলে স্বয়ংক্রিয়ভাবে তৈরি হবে..."
                    />
                    <button
                      type="button"
                      onClick={generateEmail}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm whitespace-nowrap"
                      title="ইমেইল তৈরি করুন"
                    >
                      তৈরি করুন
                    </button>
                  </div>
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                  {newStudent.email && newStudent.name && (
                    <p className="text-green-600 text-xs mt-1 flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      স্বয়ংক্রিয়ভাবে তৈরি হয়েছে
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    ফরম্যাট: studentname-roll@school.bd.edu
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ফোন নম্বর</label>
                  <input
                    type="tel"
                    value={newStudent.phoneNumber}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">ক্লাস</label>
                  <select
                    value={newStudent.class}
                    onChange={(e) => handleInputChange('class', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">ক্লাস নির্বাচন করুন</option>
                    {classes.map((className) => (
                      <option key={className} value={className}>
                        {className}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">রোল নম্বর</label>
                  <input
                    type="text"
                    value={newStudent.studentId}
                    onChange={(e) => handleInputChange('studentId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="০১"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">বিভাগ</label>
                  <select
                    value={newStudent.section}
                    onChange={(e) => handleInputChange('section', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">বিভাগ নির্বাচন করুন</option>
                    {sections.map((section) => (
                      <option key={section} value={section}>
                        {section}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">জন্ম তারিখ</label>
                  <input
                    type="date"
                    value={newStudent.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">ঠিকানা</label>
                  <textarea
                    value={newStudent.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="পুরো ঠিকানা"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Parents Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">অভিভাবকের তথ্য</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">পিতার নাম</label>
                  <input
                    type="text"
                    value={newStudent.fatherName}
                    onChange={(e) => handleInputChange('fatherName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="পিতার পুরো নাম"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">পিতার ফোন</label>
                  <input
                    type="tel"
                    value={newStudent.fatherPhone}
                    onChange={(e) => handleInputChange('fatherPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="01712345678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">পিতার পেশা</label>
                  <input
                    type="text"
                    value={newStudent.fatherOccupation}
                    onChange={(e) => handleInputChange('fatherOccupation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="পেশা বা চাকরির ধরন"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">মাতার নাম</label>
                  <input
                    type="text"
                    value={newStudent.motherName}
                    onChange={(e) => handleInputChange('motherName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="মাতার পুরো নাম"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">মাতার ফোন</label>
                  <input
                    type="tel"
                    value={newStudent.motherPhone}
                    onChange={(e) => handleInputChange('motherPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="01712345678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">মাতার পেশা</label>
                  <input
                    type="text"
                    value={newStudent.motherOccupation}
                    onChange={(e) => handleInputChange('motherOccupation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="পেশা বা চাকরির ধরন"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">জরুরী যোগাযোগ</label>
                  <input
                    type="tel"
                    value={newStudent.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="01712345678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">জরুরী যোগাযোগের সম্পর্ক</label>
                  <input
                    type="text"
                    value={newStudent.emergencyRelation}
                    onChange={(e) => handleInputChange('emergencyRelation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="যেমন: চাচা, মামা, আত্মীয়"
                  />
                </div>
              </div>
            </div>

            {/* Full Address Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">পুরো ঠিকানা</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">বর্তমান ঠিকানা</label>
                  <textarea
                    value={newStudent.presentAddress}
                    onChange={(e) => handleInputChange('presentAddress', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="বর্তমান ঠিকানা"
                    rows={3}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">স্থায়ী ঠিকানা</label>
                  <textarea
                    value={newStudent.permanentAddress}
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
                    value={newStudent.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="শহরের নাম"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">জেলা</label>
                  <input
                    type="text"
                    value={newStudent.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="জেলার নাম"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">পোস্টাল কোড</label>
                  <input
                    type="text"
                    value={newStudent.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="১২০০"
                  />
                </div>
              </div>
            </div>

            {/* Previous School Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">পূর্ববর্তী স্কুলের তথ্য</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">পূর্ববর্তী স্কুলের নাম</label>
                  <input
                    type="text"
                    value={newStudent.previousSchool}
                    onChange={(e) => handleInputChange('previousSchool', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="পূর্ববর্তী স্কুলের নাম"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">পূর্ববর্তী ক্লাস</label>
                  <input
                    type="text"
                    value={newStudent.previousClass}
                    onChange={(e) => handleInputChange('previousClass', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="যেমন: ক্লাস ৯, দশম শ্রেণী"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">পূর্ববর্তী GPA/Grade</label>
                  <input
                    type="text"
                    value={newStudent.previousGPA}
                    onChange={(e) => handleInputChange('previousGPA', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="যেমন: 4.50, A+, 85%"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">পূর্ববর্তী স্কুলের ঠিকানা</label>
                  <textarea
                    value={newStudent.previousSchoolAddress}
                    onChange={(e) => handleInputChange('previousSchoolAddress', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="পূর্ববর্তী স্কুলের ঠিকানা"
                    rows={2}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">স্কুল পরিবর্তনের কারণ</label>
                  <textarea
                    value={newStudent.reasonForLeaving}
                    onChange={(e) => handleInputChange('reasonForLeaving', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="পূর্ববর্তী স্কুল থেকে চলে আসার কারণ"
                    rows={2}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Success Notification */}
          {showSuccess && (
            <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>শিক্ষার্থী সফলভাবে যোগ করা হয়েছে!</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => router.push('/admin/students')}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={isSaving}
            >
              বাতিল
            </button>
            <button
              onClick={handleSaveStudent}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSaving}
            >
              {isSaving ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>সংরক্ষণ হচ্ছে...</span>
                </div>
              ) : (
                'সংরক্ষণ করুন'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AddStudentPageWrapper() {
  return (
    <ProtectedRoute requireAuth={true}>
      <AddStudentPage />
    </ProtectedRoute>
  );
}
