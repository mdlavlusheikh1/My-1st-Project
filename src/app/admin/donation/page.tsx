'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  Home, Users, BookOpen, ClipboardList, Calendar, Settings, LogOut, Menu, X,
  UserCheck, GraduationCap, Building, CreditCard, TrendingUp, Search, Bell,
  Plus, Play, Pause, RotateCcw, Activity, Database, Server,
  Package, Heart, DollarSign, Users2, Gift, Target, Eye, CheckCircle
} from 'lucide-react';

function DonationPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    { icon: Building, label: 'অভিভাবক', href: '/admin/parents', active: false },
    { icon: BookOpen, label: 'ক্লাস', href: '/admin/classes', active: false },
    { icon: ClipboardList, label: 'উপস্থিতি', href: '/admin/attendance', active: false },
    { icon: Calendar, label: 'ইভেন্ট', href: '/admin/events', active: false },
    { icon: CreditCard, label: 'হিসাব', href: '/admin/accounting', active: false },
    { icon: Heart, label: 'Donation', href: '/admin/donation', active: true },
    { icon: Home, label: 'পরীক্ষা', href: '/admin/exams', active: false },
    { icon: BookOpen, label: 'বিষয়', href: '/admin/subjects', active: false },
    { icon: Users, label: 'সাপোর্ট', href: '/admin/support', active: false },
    { icon: Calendar, label: 'বার্তা', href: '/admin/accounts', active: false },
    { icon: Settings, label: 'Generate', href: '/admin/generate', active: false },
    { icon: Package, label: 'ইনভেন্টরি', href: '/admin/inventory', active: false },
    { icon: Users, label: 'অভিযোগ', href: '/admin/misc', active: false },
    { icon: Settings, label: 'সেটিংস', href: '/admin/settings', active: false },
  ];

  const systemStatus = {
    server: 'চালু',
    database: 'চালু',
    backup: 'সম্পন্ন',
    maintenance: 'বন্ধ'
  };

  const services = [
    { name: 'ওয়েব সার্ভার', status: 'চালু', uptime: '৯৯.৯%', lastRestart: '৫ দিন আগে' },
    { name: 'ডেটাবেস সার্ভার', status: 'চালু', uptime: '৯৯.৮%', lastRestart: '৩ দিন আগে' },
    { name: 'ব্যাকআপ সিস্টেম', status: 'চালু', uptime: '১০০%', lastRestart: '১ সপ্তাহ আগে' },
    { name: 'নোটিফিকেশন সার্ভিস', status: 'চালু', uptime: '৯৮.৫%', lastRestart: '২ দিন আগে' }
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
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 mt-2 overflow-y-auto pb-4">
          {menuItems.map((item) => (
            <a key={item.label} href={item.href} className={`flex items-center px-6 py-2 text-sm font-medium transition-colors ${
                item.active ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}>
              <item.icon className="w-4 h-4 mr-3" />
              {item.label}
            </a>
          ))}
          <button onClick={handleLogout} className="flex items-center w-full px-6 py-2 mt-4 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="w-4 h-4 mr-3" />
            লগআউট
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200 h-16">
          <div className="h-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center h-full">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700 mr-4">
                  <Menu className="w-6 h-6" />
                </button>
                <div className="flex flex-col justify-center h-full">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-6 h-6 text-red-500" />
                    <h1 className="text-xl font-semibold text-gray-900 leading-tight">দান ব্যবস্থাপনা</h1>
                  </div>
                  <p className="text-sm text-gray-600 leading-tight">দান ব্যবস্থাপনা এবং অনুদান সংগ্রহ</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 h-full">
                <Bell className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-800" />
                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">{user?.email?.charAt(0).toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
          {/* Donation Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">মোট অনুদান</p>
                  <p className="text-2xl font-bold text-green-600">৳১,২৫,০০০</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">দাতার সংখ্যা</p>
                  <p className="text-2xl font-bold text-blue-600">১২৫</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users2 className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">এই মাসে</p>
                  <p className="text-2xl font-bold text-purple-600">৳২৫,৫০০</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">লক্ষ্যমাত্রা</p>
                  <p className="text-2xl font-bold text-orange-600">৮৫%</p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Gift className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Donations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">সাম্প্রতিক অনুদান</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[
                  { donor: 'মোহাম্মদ আলী', amount: '৳৫,০০০', purpose: 'শিক্ষার্থী সাহায্য', date: '২০২৫-০১-২৬', status: 'সম্পন্ন' },
                  { donor: 'ফাতেমা বেগম', amount: '৳৩,০০০', purpose: 'বই ক্রয়', date: '২০২৫-০১-২৫', status: 'সম্পন্ন' },
                  { donor: 'আব্দুল করিম', amount: '৳১০,০০০', purpose: 'অনুষ্ঠান আয়োজন', date: '২০২৫-০১-২৪', status: 'প্রক্রিয়াধীন' },
                  { donor: 'রেহানা আক্তার', amount: '৳২,৫০০', purpose: 'খেলার সামগ্রী', date: '২০২৫-০১-২৩', status: 'সম্পন্ন' }
                ].map((donation, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${donation.status === 'সম্পন্ন' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <div>
                        <h4 className="font-medium text-gray-900">{donation.donor}</h4>
                        <p className="text-sm text-gray-600">{donation.purpose} • {donation.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-bold text-green-600">{donation.amount}</p>
                        <p className={`text-xs ${donation.status === 'সম্পন্ন' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {donation.status}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">দ্রুত কার্যক্রম</h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  সিস্টেম রিস্টার্ট
                </button>
                <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                  ব্যাকআপ তৈরি করুন
                </button>
                <button className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700">
                  লগ দেখুন
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">পারফরম্যান্স</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>CPU ব্যবহার</span>
                    <span>৪৫%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '45%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>মেমোরি ব্যবহার</span>
                    <span>৬৮%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '68%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>ডিস্ক ব্যবহার</span>
                    <span>৩২%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{width: '32%'}}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">সিস্টেম তথ্য</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">সার্ভার সময়:</span>
                  <span className="font-medium">১১:০৪ AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">আপটাইম:</span>
                  <span className="font-medium">৫ দিন ৭ ঘন্টা</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ভার্সন:</span>
                  <span className="font-medium">v2.1.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">শেষ আপডেট:</span>
                  <span className="font-medium">৩ দিন আগে</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DonationPageWrapper() {
  return (
    <ProtectedRoute requireAuth={true}>
      <DonationPage />
    </ProtectedRoute>
  );
}
