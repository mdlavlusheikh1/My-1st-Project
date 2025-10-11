'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  Home, 
  User as UserIcon, 
  BookOpen, 
  ClipboardList, 
  Calendar, 
  FileText,
  MessageCircle,
  DollarSign,
  LogOut,
  Menu,
  X,
  TrendingUp
} from 'lucide-react';

function ParentDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { userData } = useAuth();

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

  const handleLogout = async () => {
    try {
      await signOut(auth);
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
    { icon: Home, label: 'ড্যাশবোর্ড', href: '/parent/dashboard', active: true },
    { icon: UserIcon, label: 'আমার সন্তান', href: '/parent/children' },
    { icon: ClipboardList, label: 'উপস্থিতি রিপোর্ট', href: '/parent/attendance' },
    { icon: TrendingUp, label: 'একাডেমিক পারফরম্যান্স', href: '/parent/performance' },
    { icon: FileText, label: 'পরীক্ষার ফলাফল', href: '/parent/results' },
    { icon: BookOpen, label: 'হোমওয়ার্ক', href: '/parent/homework' },
    { icon: Calendar, label: 'ইভেন্ট ও সময়সূচী', href: '/parent/events' },
    { icon: MessageCircle, label: 'শিক্ষকদের সাথে যোগাযোগ', href: '/parent/messages' },
    { icon: DollarSign, label: 'ফিস ও পেমেন্ট', href: '/parent/fees' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blue-600 to-blue-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-blue-500">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">অভিভাবক প্যানেল</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-blue-200 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-6">
          {menuItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                item.active
                  ? 'bg-blue-500 text-white border-r-2 border-yellow-400'
                  : 'text-blue-200 hover:bg-blue-500 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </a>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-blue-500">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            লগআউট
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Navigation */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-500 hover:text-gray-700"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <h1 className="ml-4 lg:ml-0 text-xl font-semibold text-gray-900">অভিভাবক ড্যাশবোর্ড</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  স্বাগতম, <span className="font-medium">{userData?.name || user?.email}</span>
                </div>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Children Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">আমার সন্তানগণ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">র</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">রাহুল আহমেদ</h4>
                    <p className="text-sm text-gray-600">ক্লাস নাইন - বিভাগ এ</p>
                    <p className="text-sm text-green-600 font-medium">উপস্থিতি: ৯৫%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg p-4 border border-pink-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">স</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">সারা আহমেদ</h4>
                    <p className="text-sm text-gray-600">ক্লাস সেভেন - বিভাগ বি</p>
                    <p className="text-sm text-green-600 font-medium">উপস্থিতি: ৯৮%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">গড় উপস্থিতি</p>
                  <p className="text-2xl font-bold text-gray-900">৯৬.৫%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">গড় নম্বর</p>
                  <p className="text-2xl font-bold text-gray-900">৮৫%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">মোট বিষয়</p>
                  <p className="text-2xl font-bold text-gray-900">১২</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">নতুন বার্তা</p>
                  <p className="text-2xl font-bold text-gray-900">৩</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Updates & Upcoming Events */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">সাম্প্রতিক আপডেট</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">নতুন পরীক্ষার ফলাফল</p>
                      <p className="text-sm text-gray-600">রাহুল আহমেদ - গণিত: A+ (৯৫%)</p>
                      <p className="text-xs text-gray-500">২ ঘন্টা আগে</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">হোমওয়ার্ক জমা</p>
                      <p className="text-sm text-gray-600">সারা আহমেদ - ইংরেজি অ্যাসাইনমেন্ট</p>
                      <p className="text-xs text-gray-500">৫ ঘন্টা আগে</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">শিক্ষকের বার্তা</p>
                      <p className="text-sm text-gray-600">গণিত শিক্ষক থেকে নতুন বার্তা</p>
                      <p className="text-xs text-gray-500">গতকাল</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">আসন্ন ইভেন্টসমূহ</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">মাসিক পরীক্ষা</p>
                      <p className="text-sm text-gray-600">সব বিষয়</p>
                      <p className="text-xs text-gray-500">১৫ ডিসেম্বর, ২০২৪</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                      গুরুত্বপূর্ণ
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">অভিভাবক সভা</p>
                      <p className="text-sm text-gray-600">ক্লাস নাইন - বিভাগ এ</p>
                      <p className="text-xs text-gray-500">২০ ডিসেম্বর, ২০২৪</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      উপস্থিত থাকুন
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">শীতকালীন ছুটি</p>
                      <p className="text-sm text-gray-600">স্কুল বন্ধ থাকবে</p>
                      <p className="text-xs text-gray-500">২৫ ডিসেম্বর - ৫ জানুয়ারি</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      ছুটি
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">দ্রুত কাজ</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    <ClipboardList className="w-8 h-8 text-blue-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">উপস্থিতি দেখুন</span>
                  </button>
                  <button className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                    <FileText className="w-8 h-8 text-green-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">ফলাফল দেখুন</span>
                  </button>
                  <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                    <MessageCircle className="w-8 h-8 text-purple-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">শিক্ষকের সাথে যোগাযোগ</span>
                  </button>
                  <button className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                    <DollarSign className="w-8 h-8 text-yellow-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">ফিস পেমেন্ট</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ParentDashboardWrapper() {
  const { userData } = useAuth();
  
  // Check if user has parent role
  if (userData && userData.role !== 'parent') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">অ্যাক্সেস অস্বীকৃত</h1>
          <p className="text-gray-600">আপনার এই পেজে অ্যাক্সেসের অনুমতি নেই।</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requireAuth={true}>
      <ParentDashboard />
    </ProtectedRoute>
  );
}