'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  Home, Users, BookOpen, ClipboardList, Calendar, Settings, LogOut, Menu, X,
  UserCheck, GraduationCap, Building, CreditCard, TrendingUp, Search, Bell,
  Plus, Download, FileText, BarChart, PieChart, Activity, Zap,
  Package
} from 'lucide-react';

function GeneratePage() {
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
    { icon: Settings, label: 'Donation', href: '/admin/donation', active: false },
    { icon: Home, label: 'পরীক্ষা', href: '/admin/exams', active: false },
    { icon: BookOpen, label: 'বিষয়', href: '/admin/subjects', active: false },
    { icon: Users, label: 'সাপোর্ট', href: '/admin/support', active: false },
    { icon: Calendar, label: 'বার্তা', href: '/admin/accounts', active: false },
    { icon: Settings, label: 'Generate', href: '/admin/generate', active: true },
    { icon: Package, label: 'ইনভেন্টরি', href: '/admin/inventory', active: false },
    { icon: Users, label: 'অভিযোগ', href: '/admin/misc', active: false },
    { icon: Settings, label: 'সেটিংস', href: '/admin/settings', active: false },
  ];

  const reportTypes = [
    {
      title: 'শিক্ষার্থী রিপোর্ট',
      description: 'সকল শিক্ষার্থীর বিস্তারিত তথ্য ও পরিসংখ্যান',
      icon: Users,
      color: 'blue',
      options: ['সম্পূর্ণ তালিকা', 'ক্লাস অনুযায়ী', 'উপস্থিতি রিপোর্ট']
    },
    {
      title: 'শিক্ষক রিপোর্ট',
      description: 'শিক্ষকদের তথ্য ও কর্মক্ষমতা বিশ্লেষণ',
      icon: GraduationCap,
      color: 'green',
      options: ['শিক্ষক তালিকা', 'বেতন রিপোর্ট', 'পারফরমেন্স']
    },
    {
      title: 'আর্থিক রিপোর্ট',
      description: 'আয়-ব্যয় ও আর্থিক লেনদেনের বিস্তারিত',
      icon: CreditCard,
      color: 'purple',
      options: ['মাসিক রিপোর্ট', 'বার্ষিক রিপোর্ট', 'ক্যাটেগরি অনুযায়ী']
    },
    {
      title: 'পরীক্ষার ফলাফল',
      description: 'পরীক্ষার ফলাফল ও গ্রেড বিশ্লেষণ',
      icon: FileText,
      color: 'orange',
      options: ['ক্লাস রিপোর্ট', 'ব্যক্তিগত রিপোর্ট', 'তুলনামূলক বিশ্লেষণ']
    },
    {
      title: 'উপস্থিতি বিশ্লেষণ',
      description: 'উপস্থিতির হার ও প্যাটার্ন বিশ্লেষণ',
      icon: BarChart,
      color: 'red',
      options: ['দৈনিক রিপোর্ট', 'মাসিক সংক্ষেপ', 'ট্রেন্ড বিশ্লেষণ']
    },
    {
      title: 'ইভেন্ট রিপোর্ট',
      description: 'স্কুলের সকল ইভেন্ট ও কার্যক্রমের রিপোর্ট',
      icon: Calendar,
      color: 'indigo',
      options: ['আসন্ন ইভেন্ট', 'সম্পন্ন ইভেন্ট', 'অংশগ্রহণকারী বিশ্লেষণ']
    }
  ];

  const quickActions = [
    {
      title: 'দ্রুত ছাত্র তালিকা',
      description: 'বর্তমান সেমিস্টারের সকল শিক্ষার্থী',
      action: 'এখনই জেনারেট করুন',
      icon: Zap,
      color: 'blue'
    },
    {
      title: 'মাসিক উপস্থিতি',
      description: 'চলতি মাসের উপস্থিতি রিপোর্ট',
      action: 'এখনই জেনারেট করুন',
      icon: Activity,
      color: 'green'
    },
    {
      title: 'আর্থিক সংক্ষেপ',
      description: 'চলতি মাসের আয়-ব্যয়ের সংক্ষেপ',
      action: 'এখনই জেনারেট করুন',
      icon: PieChart,
      color: 'purple'
    }
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
                  <h1 className="text-xl font-semibold text-gray-900 leading-tight">রিপোর্ট জেনারেটর</h1>
                  <p className="text-sm text-gray-600 leading-tight">বিভিন্ন ধরনের রিপোর্ট তৈরি ও ডাউনলোড করুন</p>
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
          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">দ্রুত অ্যাকশন</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`w-12 h-12 bg-${action.color}-100 rounded-full flex items-center justify-center`}>
                      <action.icon className={`w-6 h-6 text-${action.color}-600`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                  <button className={`w-full bg-${action.color}-600 text-white py-2 rounded-lg hover:bg-${action.color}-700`}>
                    {action.action}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Report Types */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">রিপোর্ট ধরন</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reportTypes.map((report, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`w-12 h-12 bg-${report.color}-100 rounded-full flex items-center justify-center`}>
                      <report.icon className={`w-6 h-6 text-${report.color}-600`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium text-gray-700">উপলব্ধ বিকল্প:</p>
                    {report.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2">
                        <input type="checkbox" className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-600">{option}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <button className={`w-full bg-${report.color}-600 text-white py-2 rounded-lg hover:bg-${report.color}-700 flex items-center justify-center space-x-2`}>
                      <Download className="w-4 h-4" />
                      <span>রিপোর্ট জেনারেট করুন</span>
                    </button>
                    <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200">
                      প্রিভিউ দেখুন
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Reports */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">সাম্প্রতিক রিপোর্ট</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <FileText className="w-8 h-8 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">জানুয়ারি মাসের শিক্ষার্থী রিপোর্ট</h4>
                        <p className="text-sm text-gray-600">তৈরি: ২০২৪-০১-৩১</p>
                      </div>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                      <Download className="w-4 h-4" />
                      <span>ডাউনলোড</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <BarChart className="w-8 h-8 text-green-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">উপস্থিতি বিশ্লেষণ রিপোর্ট</h4>
                        <p className="text-sm text-gray-600">তৈরি: ২০২৪-০১-২৮</p>
                      </div>
                    </div>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
                      <Download className="w-4 h-4" />
                      <span>ডাউনলোড</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <PieChart className="w-8 h-8 text-purple-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">আর্থিক মাসিক রিপোর্ট</h4>
                        <p className="text-sm text-gray-600">তৈরি: ২০২৪-০১-২৫</p>
                      </div>
                    </div>
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2">
                      <Download className="w-4 h-4" />
                      <span>ডাউনলোড</span>
                    </button>
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

export default function GeneratePageWrapper() {
  return (
    <ProtectedRoute requireAuth={true}>
      <GeneratePage />
    </ProtectedRoute>
  );
}