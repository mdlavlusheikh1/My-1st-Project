'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { User as AuthUser, onAuthStateChanged } from 'firebase/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { studentQueries, User as StudentUser } from '@/lib/database-queries';
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
  MapPin,
  User,
  Calendar as CalendarIcon,
  Phone as PhoneIcon,
  Mail as MailIcon,
  Building as BuildingIcon,
  GraduationCap as GraduationCapIcon
} from 'lucide-react';

function StudentViewPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [student, setStudent] = useState<StudentUser | null>(null);
  const [studentLoading, setStudentLoading] = useState(false);
  const [error, setError] = useState('');
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

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleEditStudent = () => {
    if (student) {
      router.push(`/admin/students/edit?id=${student.uid}`);
    }
  };

  const handleDeleteStudent = async () => {
    if (!student) return;

    if (!confirm('আপনি কি এই শিক্ষার্থীকে মুছে ফেলতে চান? এটি স্থায়ীভাবে মুছে যাবে।')) return;

    try {
      await studentQueries.deleteStudent(student.uid);
      router.push('/admin/students');
    } catch (error) {
      console.error('Error deleting student:', error);
      setError('শিক্ষার্থী মুছে ফেলতে সমস্যা হয়েছে');
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
                  <h1 className="text-xl font-semibold text-gray-900 leading-tight">শিক্ষার্থী দেখুন</h1>
                  <p className="text-sm text-gray-600 leading-tight">শিক্ষার্থীর বিস্তারিত তথ্য</p>
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
              <ArrowLeft className="w-5 h-5" />
              <span>শিক্ষার্থী তালিকায় ফিরে যান</span>
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
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">শিক্ষার্থী পাওয়া যায়নি</h3>
              <p className="mt-1 text-sm text-gray-500">এই শিক্ষার্থীটি আর বিদ্যমান নেই</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Student Header */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center overflow-hidden">
                      {student.profileImage ? (
                        <img
                          src={student.profileImage}
                          alt={student.displayName || student.name || 'Student'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-2xl">
                          {student.displayName?.split(' ')[0].charAt(0) || student.email?.charAt(0).toUpperCase()}
                        </span>
                      )}
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
                      onClick={handleEditStudent}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>সম্পাদনা</span>
                    </button>
                    <button
                      onClick={handleDeleteStudent}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>মুছে ফেলুন</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Student Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    মৌলিক তথ্য
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <UserCheck className="w-4 h-4 mr-3 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">নাম</p>
                        <p className="font-medium">{student.displayName || student.name || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <MailIcon className="w-4 h-4 mr-3 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">ইমেইল</p>
                        <p className="font-medium">{student.email || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <PhoneIcon className="w-4 h-4 mr-3 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">ফোন নম্বর</p>
                        <p className="font-medium">{student.phoneNumber || student.phone || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-3 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">যোগদানের তারিখ</p>
                        <p className="font-medium">
                          {student.createdAt ? new Date(student.createdAt.toDate()).toLocaleDateString('bn-BD') : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <GraduationCapIcon className="w-5 h-5 mr-2" />
                    একাডেমিক তথ্য
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <BuildingIcon className="w-4 h-4 mr-3 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">ক্লাস</p>
                        <p className="font-medium">{student.class || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-3 text-gray-400">বি</span>
                      <div>
                        <p className="text-sm text-gray-600">বিভাগ</p>
                        <p className="font-medium">{student.section || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-3 text-gray-400">গ্রু</span>
                      <div>
                        <p className="text-sm text-gray-600">গ্রুপ</p>
                        <p className="font-medium">{student.group || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-3 text-gray-400">ID</span>
                      <div>
                        <p className="text-sm text-gray-600">রোল নম্বর</p>
                        <p className="font-medium">{student.studentId || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Guardian Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <UserCheck className="w-5 h-5 mr-2" />
                    অভিভাবকের তথ্য
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">অভিভাবকের নাম</p>
                      <p className="font-medium">{student.guardianName || 'N/A'}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">অভিভাবকের ফোন</p>
                      <p className="font-medium">{student.guardianPhone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    ঠিকানা
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">ঠিকানা</p>
                      <p className="font-medium">{student.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* School Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BuildingIcon className="w-5 h-5 mr-2" />
                  স্কুল তথ্য
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">স্কুল আইডি</p>
                    <p className="font-medium">{student.schoolId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">স্কুলের নাম</p>
                    <p className="font-medium">{student.schoolName || 'N/A'}</p>
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

export default function StudentViewPageWrapper() {
  return (
    <ProtectedRoute requireAuth={true}>
      <StudentViewPage />
    </ProtectedRoute>
  );
}
