'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { User as AuthUser, onAuthStateChanged } from 'firebase/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { studentQueries, User as StudentUser, settingsQueries, classQueries } from '@/lib/database-queries';
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
  Mail,
  Phone,
  Package,
  Heart,
  ArrowLeft,
  Camera,
  Upload,
  AlertCircle,
  CheckCircle,
  Save,
  X as XIcon
} from 'lucide-react';

function StudentEditPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [student, setStudent] = useState<StudentUser | null>(null);
  const [studentLoading, setStudentLoading] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState<any>(null);
  const [classes, setClasses] = useState<string[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get('id');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        if (studentId) {
          await loadStudent(studentId);
        }
        await loadSettings();
        await loadClassData();
      } else {
        router.push('/auth/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, studentId]);

  const loadStudent = async (id: string) => {
    setStudentLoading(true);
    setError('');

    try {
      const studentData = await studentQueries.getStudentById(id);
      if (studentData) {
        setStudent(studentData);
        if (studentData.profileImage) {
          setImagePreview(studentData.profileImage);
        }
      } else {
        setError('শিক্ষার্থী পাওয়া যায়নি');
      }
    } catch (error) {
      console.error('Error loading student:', error);
      setError('শিক্ষার্থী লোড করতে সমস্যা হয়েছে');
    } finally {
      setStudentLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const settingsData = await settingsQueries.getSettings();
      setSettings(settingsData);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadClassData = async () => {
    try {
      const allClasses = await classQueries.getAllClasses();
      const classNames = [...new Set(allClasses.map(cls => cls.className).filter((name): name is string => Boolean(name)))];
      const sectionNames = [...new Set(allClasses.map(cls => cls.section).filter((section): section is string => Boolean(section)))];
      const groupNames = [...new Set(allClasses.map(cls => cls.group).filter((group): group is string => Boolean(group && group.trim() !== '')))];

      setClasses(classNames.length > 0 ? classNames : ['ক্লাস ১', 'ক্লাস ২', 'ক্লাস ৩', 'ক্লাস ৪', 'ক্লাস ৫', 'ক্লাস ৬', 'ক্লাস ৭', 'ক্লাস ৮', 'ক্লাস ৯', 'ক্লাস ১০']);
      setSections(sectionNames.length > 0 ? sectionNames : ['ক', 'খ', 'গ', 'ঘ']);
      setGroups(groupNames.length > 0 ? groupNames : ['বিজ্ঞান', 'মানবিক', 'বাণিজ্য']);
    } catch (error) {
      console.error('Error loading class data:', error);
      setClasses(['ক্লাস ১', 'ক্লাস ২', 'ক্লাস ৩', 'ক্লাস ৪', 'ক্লাস ৫', 'ক্লাস ৬', 'ক্লাস ৭', 'ক্লাস ৮', 'ক্লাস ৯', 'ক্লাস ১০']);
      setSections(['ক', 'খ', 'গ', 'ঘ']);
      setGroups(['বিজ্ঞান', 'মানবিক', 'বাণিজ্য']);
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

  const handleInputChange = (field: string, value: string) => {
    if (student) {
      setStudent({ ...student, [field]: value });
      if (errors[field]) {
        setErrors({ ...errors, [field]: '' });
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && student) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, profileImage: 'ছবির আকার ৫MB এর বেশি হতে পারবে না' });
        return;
      }

      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, profileImage: 'শুধুমাত্র ছবি ফাইল আপলোড করুন' });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
        setStudent({ ...student, profileImage: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    if (student) {
      setStudent({ ...student, profileImage: '' });
      setImagePreview(null);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!student?.name?.trim()) {
      newErrors.name = 'নাম প্রয়োজনীয়';
    }

    if (student?.email && !/\S+@\S+\.\S+/.test(student.email)) {
      newErrors.email = 'সঠিক ইমেইল ফরম্যাট দিন';
    }

    if (student?.phoneNumber && !/^01[3-9]\d{8}$/.test(student.phoneNumber)) {
      newErrors.phoneNumber = 'সঠিক ফোন নম্বর দিন';
    }

    if (student?.guardianPhone && !/^01[3-9]\d{8}$/.test(student.guardianPhone)) {
      newErrors.guardianPhone = 'সঠিক ফোন নম্বর দিন';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveStudent = async () => {
    if (!student || !validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      // Prepare update data with only the fields that should be updated
      const updateData: any = {
        name: student.name,
        displayName: student.displayName || student.name,
        email: student.email,
        phoneNumber: student.phoneNumber,
        phone: student.phoneNumber,
        guardianName: student.guardianName,
        guardianPhone: student.guardianPhone,
        address: student.address,
        class: student.class,
        section: student.section,
        group: student.group,
        studentId: student.studentId,
        isActive: student.isActive,
        updatedAt: new Date()
      };

      // Only include profileImage if it exists and is not empty
      if (student.profileImage && student.profileImage.trim() !== '') {
        updateData.profileImage = student.profileImage;
      }

      console.log('Updating student with data:', updateData);

      await studentQueries.updateStudent(student.uid, updateData);

      // Show success message
      alert('শিক্ষার্থীর তথ্য সফলভাবে সংরক্ষণ করা হয়েছে!');

      router.push(`/admin/students/view?id=${student.uid}`);
    } catch (error) {
      console.error('Error saving student:', error);
      setError('শিক্ষার্থী সংরক্ষণ করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
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
    { icon: Heart, label: 'Donation', href: '/admin/donation', active: false },
    { icon: Home, label: 'পরীক্ষা', href: '/admin/exams', active: false },
    { icon: BookOpen, label: 'বিষয়', href: '/admin/subjects', active: false },
    { icon: Users, label: 'সাপোর্ট', href: '/admin/support', active: false },
    { icon: Calendar, label: 'বার্তা', href: '/admin/accounts', active: false },
    { icon: Settings, label: 'Generate', href: '/admin/generate', active: false },
    { icon: Package, label: 'ইনভেন্টরি', href: '/admin/inventory', active: false },
    { icon: Users, label: 'অভিযোগ', href: '/admin/misc', active: false },
    { icon: Settings, label: 'সেটিংস', href: '/admin/settings', active: false },
  ];

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
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
                  <h1 className="text-xl font-semibold text-gray-900 leading-tight">শিক্ষার্থী সম্পাদনা</h1>
                  <p className="text-sm text-gray-600 leading-tight">শিক্ষার্থীর তথ্য সম্পাদনা করুন</p>
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
              onClick={() => router.push(`/admin/students/view?id=${studentId}`)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>শিক্ষার্থী দেখুন পৃষ্ঠায় ফিরে যান</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Loading State */}
          {studentLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">শিক্ষার্থী লোড হচ্ছে...</span>
            </div>
          ) : !student ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">শিক্ষার্থী পাওয়া যায়নি</h3>
              <p className="mt-1 text-sm text-gray-500">এই শিক্ষার্থীটি আর বিদ্যমান নেই</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Student Header */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">
                        {student.displayName?.split(' ')[0].charAt(0) || student.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{student.displayName || student.name || 'Unknown Student'}</h2>
                      <p className="text-gray-600">ID: {student.studentId || 'N/A'}</p>
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full mt-2 ${
                        student.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => router.push(`/admin/students/view?id=${student.uid}`)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>দেখুন</span>
                    </button>
                    <button
                      onClick={handleSaveStudent}
                      disabled={isSaving}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isSaving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>{isSaving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Edit Form */}
              <div className="space-y-6">
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
                      <p className="text-gray-500 text-sm mt-2">সর্বোচ্চ ৫MB, JPG, PNG বা GIF ফরম্যাট</p>
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">মৌলিক তথ্য</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">নাম *</label>
                      <input
                        type="text"
                        value={student.name || student.displayName || ''}
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">ইমেইল</label>
                      <input
                        type="email"
                        value={student.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="student@example.com"
                      />
                      {errors.email && (
                        <p className="text-red-600 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ফোন নম্বর</label>
                      <input
                        type="tel"
                        value={student.phoneNumber || student.phone || ''}
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">রোল নম্বর</label>
                      <input
                        type="text"
                        value={student.studentId || ''}
                        onChange={(e) => handleInputChange('studentId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="০১"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ক্লাস</label>
                      <select
                        value={student.class || ''}
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">বিভাগ</label>
                      <select
                        value={student.section || ''}
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">গ্রুপ</label>
                      <select
                        value={student.group || ''}
                        onChange={(e) => handleInputChange('group', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">গ্রুপ নির্বাচন করুন</option>
                        {groups.map((group) => (
                          <option key={group} value={group}>
                            {group}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">স্ট্যাটাস</label>
                      <select
                        value={student.isActive ? 'active' : 'inactive'}
                        onChange={(e) => {
                          const isActive = e.target.value === 'active';
                          setStudent({ ...student, isActive });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="active">সক্রিয়</option>
                        <option value="inactive">নিষ্ক্রিয়</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">ঠিকানা</label>
                      <textarea
                        value={student.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="পুরো ঠিকানা"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* Guardian Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">অভিভাবকের তথ্য</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">অভিভাবকের নাম</label>
                      <input
                        type="text"
                        value={student.guardianName || ''}
                        onChange={(e) => handleInputChange('guardianName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="অভিভাবকের নাম"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">অভিভাবকের ফোন</label>
                      <input
                        type="tel"
                        value={student.guardianPhone || ''}
                        onChange={(e) => handleInputChange('guardianPhone', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.guardianPhone ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="01712345678"
                      />
                      {errors.guardianPhone && (
                        <p className="text-red-600 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.guardianPhone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudentEditPageWrapper() {
  return (
    <ProtectedRoute requireAuth={true}>
      <StudentEditPage />
    </ProtectedRoute>
  );
}
