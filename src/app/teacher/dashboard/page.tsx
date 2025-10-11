'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  Home, 
  Users, 
  BookOpen, 
  ClipboardList, 
  Calendar, 
  FileText,
  GraduationCap,
  LogOut,
  Menu,
  X,
  QrCode
} from 'lucide-react';

function TeacherDashboard() {
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
    { icon: Home, label: 'ড্যাশবোর্ড', href: '/teacher/dashboard', active: true },
    { icon: Users, label: 'আমার ছাত্রছাত্রী', href: '/teacher/students' },
    { icon: BookOpen, label: 'আমার ক্লাস', href: '/teacher/classes' },
    { icon: QrCode, label: 'QR স্ক্যানার', href: '/teacher/qr-scanner' },
    { icon: ClipboardList, label: 'উপস্থিতি', href: '/teacher/attendance' },
    { icon: Calendar, label: 'ক্লাস রুটিন', href: '/teacher/schedule' },
    { icon: FileText, label: 'পরীক্ষার ফলাফল', href: '/teacher/results' },
    { icon: GraduationCap, label: 'সিলেবাস', href: '/teacher/syllabus' },
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
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-green-600 to-green-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-green-500">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">শিক্ষক প্যানেল</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-green-200 hover:text-white"
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
                  ? 'bg-green-500 text-white border-r-2 border-yellow-400'
                  : 'text-green-200 hover:bg-green-500 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </a>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-green-500">
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
                <h1 className="ml-4 lg:ml-0 text-xl font-semibold text-gray-900">শিক্ষক ড্যাশবোর্ড</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  স্বাগতম, <span className="font-medium">{userData?.name || user?.email}</span>
                </div>
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">আমার ছাত্রছাত্রী</p>
                  <p className="text-2xl font-bold text-gray-900">১২৮</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">আমার ক্লাস</p>
                  <p className="text-2xl font-bold text-gray-900">৫</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">আজকের উপস্থিতি</p>
                  <p className="text-2xl font-bold text-gray-900">৯৫%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">আজকের ক্লাস</p>
                  <p className="text-2xl font-bold text-gray-900">৪</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Schedule */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">দ্রুত কাজ</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    <QrCode className="w-8 h-8 text-blue-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">QR স্ক্যান</span>
                  </button>
                  <button className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                    <ClipboardList className="w-8 h-8 text-green-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">উপস্থিতি নিন</span>
                  </button>
                  <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                    <FileText className="w-8 h-8 text-purple-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">ফলাফল এন্ট্রি</span>
                  </button>
                  <button className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                    <Users className="w-8 h-8 text-yellow-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">ছাত্র তালিকা</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">আজকের ক্লাস রুটিন</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">গণিত - ক্লাস নাইন এ</p>
                      <p className="text-sm text-gray-600">০৯:০০ - ১০:০০</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      চলমান
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">গণিত - ক্লাস টেন বি</p>
                      <p className="text-sm text-gray-600">১০:৩০ - ১১:৩০</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      আসছে
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">গণিত - ক্লাস এইট এ</p>
                      <p className="text-sm text-gray-600">১২:০০ - ১৩:০০</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      আসছে
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">সাম্প্রতিক কার্যকলাপ</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">উপস্থিতি গ্রহণ সম্পন্ন</p>
                      <p className="text-sm text-gray-600">ক্লাস নাইন এ - গণিত (২৮/৩০ উপস্থিত)</p>
                      <p className="text-xs text-gray-500">১ ঘন্টা আগে</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">পরীক্ষার ফলাফল এন্ট্রি</p>
                      <p className="text-sm text-gray-600">ক্লাস টেন বি - সাপ্তাহিক পরীক্ষা</p>
                      <p className="text-xs text-gray-500">৩ ঘন্টা আগে</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">হোমওয়ার্ক প্রদান</p>
                      <p className="text-sm text-gray-600">ক্লাস এইট এ - অধ্যায় ৫ এর অনুশীলনী</p>
                      <p className="text-xs text-gray-500">গতকাল</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeacherDashboardWrapper() {
  const { userData } = useAuth();
  
  // Check if user has teacher role
  if (userData && userData.role !== 'teacher') {
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
      <TeacherDashboard />
    </ProtectedRoute>
  );
}