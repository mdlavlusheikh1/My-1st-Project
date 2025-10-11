'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  Home, Users, BookOpen, ClipboardList, Calendar, Settings, LogOut, Menu, X,
  UserCheck, GraduationCap, Building, CreditCard, TrendingUp, Search, Bell,
  Plus, Edit, Trash2, Eye, Megaphone, Pin, AlertCircle,
  Package
} from 'lucide-react';

function NoticePage() {
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
    { icon: Settings, label: 'Generate', href: '/admin/generate', active: false },
    { icon: Package, label: 'ইনভেন্টরি', href: '/admin/inventory', active: false },
    { icon: Users, label: 'অভিযোগ', href: '/admin/misc', active: false },
    { icon: Megaphone, label: 'নোটিশ', href: '/admin/notice', active: true },
    { icon: Settings, label: 'সেটিংস', href: '/admin/settings', active: false },
  ];

  const notices = [
    {
      id: 1,
      title: 'বার্ষিক পরীক্ষার সময়সূচী',
      content: 'আসন্ন বার্ষিক পরীক্ষার সময়সূচী প্রকাশ করা হলো। সকল শিক্ষার্থীরা নিজ নিজ ক্লাসের সময়সূচী দেখে নিন।',
      category: 'পরীক্ষা',
      targetAudience: 'সকল শিক্ষার্থী',
      publishDate: '২০২৪-০১-১৫',
      expiryDate: '২০২৪-০৩-৩০',
      status: 'প্রকাশিত',
      priority: 'উচ্চ',
      isPinned: true,
      author: 'প্রশাসন'
    },
    {
      id: 2,
      title: 'নতুন ক্লাস রুটিন',
      content: 'আগামী সোমবার থেকে নতুন ক্লাস রুটিন কার্যকর হবে। সকল শিক্ষক ও শিক্ষার্থীরা নতুন সময়সূচী অনুসরণ করবেন।',
      category: 'একাডেমিক',
      targetAudience: 'শিক্ষক ও শিক্ষার্থী',
      publishDate: '২০২৪-০১-১২',
      expiryDate: '২০২৪-০২-২৮',
      status: 'প্রকাশিত',
      priority: 'মাঝারি',
      isPinned: false,
      author: 'একাডেমিক বিভাগ'
    },
    {
      id: 3,
      title: 'ফি জমার শেষ তারিখ',
      content: 'চলতি মাসের ফি জমার শেষ তারিখ ২৫ তারিখ। সকল অভিভাবকগণ নির্ধারিত সময়ের মধ্যে ফি পরিশোধ করুন।',
      category: 'ফি',
      targetAudience: 'অভিভাবকগণ',
      publishDate: '২০২৪-০১-১০',
      expiryDate: '২০২৪-০১-২৫',
      status: 'প্রকাশিত',
      priority: 'উচ্চ',
      isPinned: true,
      author: 'বার্তা বিভাগ'
    },
    {
      id: 4,
      title: 'সাংস্কৃতিক অনুষ্ঠানের আয়োজন',
      content: 'আগামী মাসে স্কুলে সাংস্কৃতিক অনুষ্ঠানের আয়োজন করা হবে। আগ্রহী শিক্ষার্থীরা নাম নিবন্ধন করুন।',
      category: 'ইভেন্ট',
      targetAudience: 'সকল শিক্ষার্থী',
      publishDate: '২০২৪-০১-০৮',
      expiryDate: '২০২৪-০২-১৫',
      status: 'খসড়া',
      priority: 'নিম্ন',
      isPinned: false,
      author: 'সাংস্কৃতিক বিভাগ'
    },
    {
      id: 5,
      title: 'স্কুল বন্ধের ঘোষণা',
      content: 'আগামী শুক্রবার স্কুল বন্ধ থাকবে। সকল ক্লাস পরবর্তী কার্যদিবসে অনুষ্ঠিত হবে।',
      category: 'সাধারণ',
      targetAudience: 'সকলে',
      publishDate: '২০২৪-০১-০৫',
      expiryDate: '২০২৪-০১-২০',
      status: 'মেয়াদোত্তীর্ণ',
      priority: 'মাঝারি',
      isPinned: false,
      author: 'প্রশাসন'
    }
  ];

  const noticeStats = {
    total: notices.length,
    published: notices.filter(n => n.status === 'প্রকাশিত').length,
    draft: notices.filter(n => n.status === 'খসড়া').length,
    expired: notices.filter(n => n.status === 'মেয়াদোত্তীর্ণ').length
  };

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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <div className="bg-white shadow-sm border-b border-gray-200 h-16">
          <div className="h-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center h-full">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700 mr-4">
                  <Menu className="w-6 h-6" />
                </button>
                <div className="flex flex-col justify-center h-full">
                  <h1 className="text-xl font-semibold text-gray-900 leading-tight">নোটিশ ব্যবস্থাপনা</h1>
                  <p className="text-sm text-gray-600 leading-tight">সকল নোটিশ ও ঘোষণা পরিচালনা করুন</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 h-full">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="নোটিশ খুঁজুন..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-10" />
                </div>
                <Bell className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-800" />
                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">{user?.email?.charAt(0).toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-6 bg-gray-50 overflow-y-auto">
          {/* Notice Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">মোট নোটিশ</p>
                  <p className="text-2xl font-bold text-gray-900">{noticeStats.total}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">প্রকাশিত</p>
                  <p className="text-2xl font-bold text-green-600">{noticeStats.published}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Eye className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">খসড়া</p>
                  <p className="text-2xl font-bold text-yellow-600">{noticeStats.draft}</p>
                </div>
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Edit className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">মেয়াদোত্তীর্ণ</p>
                  <p className="text-2xl font-bold text-red-600">{noticeStats.expired}</p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Page Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">নোটিশ বোর্ড</h2>
              <p className="text-gray-600">সকল নোটিশ ও ঘোষণা</p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>নতুন নোটিশ</span>
            </button>
          </div>

          {/* Notices Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {notices.map((notice) => (
              <div key={notice.id} className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${
                notice.isPinned ? 'ring-2 ring-yellow-400' : ''
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {notice.isPinned && <Pin className="w-4 h-4 text-yellow-500" />}
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      notice.status === 'প্রকাশিত' ? 'bg-green-100 text-green-800' : 
                      notice.status === 'খসড়া' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {notice.status}
                    </span>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    notice.priority === 'উচ্চ' ? 'bg-red-100 text-red-800' : 
                    notice.priority === 'মাঝারি' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {notice.priority}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{notice.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{notice.content}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">বিভাগ:</span>
                    <span className="font-medium text-gray-700">{notice.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">লক্ষ্য:</span>
                    <span className="font-medium text-gray-700">{notice.targetAudience}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">প্রকাশ:</span>
                    <span className="font-medium text-gray-700">{notice.publishDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">মেয়াদ:</span>
                    <span className="font-medium text-gray-700">{notice.expiryDate}</span>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500">লেখক: {notice.author}</span>
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NoticePageWrapper() {
  return (
    <ProtectedRoute requireAuth={true}>
      <NoticePage />
    </ProtectedRoute>
  );
}