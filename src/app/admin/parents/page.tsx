'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { User as AuthUser, onAuthStateChanged } from 'firebase/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { parentQueries, User as DatabaseUser } from '@/lib/database-queries';
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
  MapPin,
  Package,
  Loader2
} from 'lucide-react';

function ParentsPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [parents, setParents] = useState<DatabaseUser[]>([]);
  const [parentsLoading, setParentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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

  // Fetch parents data from Firestore
  useEffect(() => {
    const fetchParents = async () => {
      try {
        setParentsLoading(true);
        setError(null);
        // Temporarily use unfiltered to debug - will show all parents
        const parentsData = await parentQueries.getAllParentsUnfiltered();
        setParents(parentsData);
      } catch (err) {
        console.error('Error fetching parents:', err);
        setError('অভিভাবকের তথ্য লোড করতে ত্রুটি হয়েছে');
      } finally {
        setParentsLoading(false);
      }
    };

    if (user) {
      fetchParents();
    }
  }, [user]);

  // Create sample parents with students
  const handleCreateSampleData = async () => {
    try {
      setParentsLoading(true);
      await parentQueries.createSampleParentsWithStudents();

      // Refresh the parents list after creating sample data
      const parentsData = await parentQueries.getAllParentsUnfiltered();
      setParents(parentsData);
      setError(null);

      alert('নমুনা অভিভাবক এবং শিক্ষার্থীর তথ্য সফলভাবে তৈরি করা হয়েছে!');
    } catch (err) {
      console.error('Error creating sample data:', err);
      setError('নমুনা তথ্য তৈরি করতে ত্রুটি হয়েছে');
    } finally {
      setParentsLoading(false);
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
    { icon: Building, label: 'অভিভাবক', href: '/admin/parents', active: true },
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
                <div className="flex flex-col justify-center h-full">
                  <h1 className="text-xl font-semibold text-gray-900 leading-tight">অভিভাবক ব্যবস্থাপনা</h1>
                  <p className="text-sm text-gray-600 leading-tight">সকল অভিভাবকের তথ্য দেখুন এবং পরিচালনা করুন</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 h-full">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="অভিভাবক খুঁজুন..."
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
        <div className="flex-1 p-4 lg:p-6 bg-gray-50 overflow-y-auto">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">অভিভাবক তালিকা</h2>
              <p className="text-gray-600">মোট {parents.length} জন অভিভাবক</p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>নতুন অভিভাবক যোগ করুন</span>
            </button>
          </div>

          {/* Loading State */}
          {parentsLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
              <span className="text-gray-600">অভিভাবকের তথ্য লোড হচ্ছে...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="text-red-600 mr-3">⚠️</div>
                <div className="text-red-800">{error}</div>
              </div>
            </div>
          )}

          {/* Parents Grid */}
          {!parentsLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {parents.map((parent) => (
                <div key={parent.uid} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {parent.name?.split(' ')[0]?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{parent.name || 'নাম নেই'}</h3>
                      <p className="text-sm text-gray-600">{parent.employmentType || 'পেশা নেই'}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                        parent.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {parent.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">সন্তানের তথ্য</p>
                      {parent.associatedStudents && parent.associatedStudents.length > 0 ? (
                        <div className="text-sm text-blue-700">
                          {parent.associatedStudents.map((student, index) => (
                            <div key={student.uid}>
                              {student.name} - {student.class || 'ক্লাস নেই'}
                              {index < parent.associatedStudents!.length - 1 && ', '}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-blue-700">কোনো সন্তানের তথ্য নেই</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {parent.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {parent.phoneNumber || parent.phone || 'ফোন নম্বর নেই'}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {parent.address || 'ঠিকানা নেই'}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-sm hover:bg-blue-100 flex items-center justify-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>দেখুন</span>
                    </button>
                    <button className="flex-1 bg-green-50 text-green-600 px-3 py-2 rounded-lg text-sm hover:bg-green-100 flex items-center justify-center space-x-1">
                      <Edit className="w-4 h-4" />
                      <span>সম্পাদনা</span>
                    </button>
                    <button className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm hover:bg-red-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!parentsLoading && !error && parents.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Users className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">কোনো অভিভাবক নেই</h3>
              <p className="text-gray-600 mb-6">এখনও কোনো অভিভাবকের তথ্য যোগ করা হয়নি।</p>

              {/* Sample Data Creation Button */}
              <div className="flex flex-col items-center space-y-4">
                <button
                  onClick={handleCreateSampleData}
                  disabled={parentsLoading}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {parentsLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>তৈরি হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-5 h-5" />
                      <span>নমুনা অভিভাবক তৈরি করুন</span>
                    </>
                  )}
                </button>
                <p className="text-sm text-gray-500 max-w-md">
                  এটি কিছু নমুনা অভিভাবক এবং তাদের সাথে সম্পর্কিত শিক্ষার্থীর তথ্য তৈরি করবে।
                  এটি শুধুমাত্র ডেমো এবং টেস্টিং এর জন্য।
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ParentsPageWrapper() {
  return (
    <ProtectedRoute requireAuth={true}>
      <ParentsPage />
    </ProtectedRoute>
  );
}
