'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  Home, 
  BookOpen, 
  ClipboardList, 
  Calendar, 
  FileText,
  Award,
  Users,
  QrCode,
  LogOut,
  Menu,
  X,
  TrendingUp
} from 'lucide-react';

function StudentDashboard() {
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
    { icon: Home, label: 'ড্যাশবোর্ড', href: '/student/dashboard', active: true },
    { icon: QrCode, label: 'আমার QR কোড', href: '/student/qr-code' },
    { icon: ClipboardList, label: 'আমার উপস্থিতি', href: '/student/attendance' },
    { icon: TrendingUp, label: 'একাডেমিক পারফরম্যান্স', href: '/student/performance' },
    { icon: FileText, label: 'পরীক্ষার ফলাফল', href: '/student/results' },
    { icon: BookOpen, label: 'হোমওয়ার্ক', href: '/student/homework' },
    { icon: Calendar, label: 'ক্লাস রুটিন', href: '/student/schedule' },
    { icon: Users, label: 'সহপাঠী', href: '/student/classmates' },
    { icon: Award, label: 'অর্জন ও সার্টিফিকেট', href: '/student/achievements' },
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
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-indigo-600 to-indigo-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-indigo-500">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">ছাত্র প্যানেল</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-indigo-200 hover:text-white"
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
                  ? 'bg-indigo-500 text-white border-r-2 border-yellow-400'
                  : 'text-indigo-200 hover:bg-indigo-500 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </a>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-indigo-500">
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
                <h1 className="ml-4 lg:ml-0 text-xl font-semibold text-gray-900">ছাত্র ড্যাশবোর্ড</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  স্বাগতম, <span className="font-medium">{userData?.name || user?.email}</span>
                </div>
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Student Profile Card */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 mb-6 text-white">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{userData?.name || 'মোহাম্মদ রাহুল'}</h2>
                <p className="text-indigo-100">ক্লাস নাইন - বিভাগ এ</p>
                <p className="text-indigo-100">রোল নম্বর: ১৫</p>
                <p className="text-indigo-100">ছাত্র আইডি: STD2024015</p>
              </div>
              <div className="ml-auto">
                <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors">
                  <QrCode className="w-6 h-6 text-white" />
                </button>
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
                  <p className="text-sm font-medium text-gray-600">উপস্থিতির হার</p>
                  <p className="text-2xl font-bold text-gray-900">৯৫%</p>
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
                  <p className="text-2xl font-bold text-gray-900">৮৮%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">বাকি হোমওয়ার্ক</p>
                  <p className="text-2xl font-bold text-gray-900">৩</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">ক্লাসে অবস্থান</p>
                  <p className="text-2xl font-bold text-gray-900">৫ম</p>
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
                  <button className="flex flex-col items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                    <QrCode className="w-8 h-8 text-indigo-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">আমার QR</span>
                  </button>
                  <button className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                    <ClipboardList className="w-8 h-8 text-green-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">উপস্থিতি দেখুন</span>
                  </button>
                  <button className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    <FileText className="w-8 h-8 text-blue-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">ফলাফল দেখুন</span>
                  </button>
                  <button className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                    <BookOpen className="w-8 h-8 text-yellow-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">হোমওয়ার্ক</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">আজকের ক্লাস</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">গণিত</p>
                      <p className="text-sm text-gray-600">০৯:০০ - ১০:০০</p>
                      <p className="text-xs text-gray-500">মিসেস রহিমা</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      চলমান
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">বাংলা</p>
                      <p className="text-sm text-gray-600">১০:৩০ - ১১:৩০</p>
                      <p className="text-xs text-gray-500">স্যার করিম</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      আসছে
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">ইংরেজি</p>
                      <p className="text-sm text-gray-600">১২:০০ - ১৩:০০</p>
                      <p className="text-xs text-gray-500">মিসেস খান</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      আসছে
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Performance & Homework */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">সাম্প্রতিক পরীক্ষার ফলাফল</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">গণিত</p>
                      <p className="text-sm text-gray-600">সাপ্তাহিক পরীক্ষা</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">A+</p>
                      <p className="text-sm text-gray-500">৯৫/১০০</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">বাংলা</p>
                      <p className="text-sm text-gray-600">সাপ্তাহিক পরীক্ষা</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">A</p>
                      <p className="text-sm text-gray-500">৮৮/১০০</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">ইংরেজি</p>
                      <p className="text-sm text-gray-600">সাপ্তাহিক পরীক্ষা</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-600">A</p>
                      <p className="text-sm text-gray-500">৮৫/১০০</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">বাকি হোমওয়ার্ক</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">গণিত অনুশীলনী</p>
                      <p className="text-sm text-gray-600">অধ্যায় ৫ এর সব অঙ্ক</p>
                      <p className="text-xs text-red-600 font-medium">আগামীকাল জমা দিতে হবে</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">ইংরেজি প্রবন্ধ</p>
                      <p className="text-sm text-gray-600">\"My Future Plan\" বিষয়ে ৫০০ শব্দ</p>
                      <p className="text-xs text-yellow-600 font-medium">৩ দিন বাকি</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">বিজ্ঞান প্রকল্প</p>
                      <p className="text-sm text-gray-600">পদার্থ বিজ্ঞান - আলোর প্রতিফলন</p>
                      <p className="text-xs text-blue-600 font-medium">১ সপ্তাহ বাকি</p>
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

export default function StudentDashboardWrapper() {
  const { userData } = useAuth();
  
  // Check if user has student role
  if (userData && userData.role !== 'student') {
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
      <StudentDashboard />
    </ProtectedRoute>
  );
}