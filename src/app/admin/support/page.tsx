'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  Home, Users, BookOpen, ClipboardList, Calendar, Settings, LogOut, Menu, X,
  UserCheck, GraduationCap, Building, CreditCard, TrendingUp, Search, Bell,
  Plus, MessageSquare, Phone, Mail, AlertCircle, CheckCircle, Clock,
  Package
} from 'lucide-react';

function SupportPage() {
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
    { icon: Users, label: 'সাপোর্ট', href: '/admin/support', active: true },
    { icon: Calendar, label: 'বার্তা', href: '/admin/accounts', active: false },
    { icon: Settings, label: 'Generate', href: '/admin/generate', active: false },
    { icon: Package, label: 'ইনভেন্টরি', href: '/admin/inventory', active: false },
    { icon: Users, label: 'অভিযোগ', href: '/admin/misc', active: false },
    { icon: Settings, label: 'সেটিংস', href: '/admin/settings', active: false },
  ];

  const supportTickets = [
    {
      id: 1,
      title: 'লগইন সমস্যা',
      description: 'শিক্ষার্থী লগইন করতে পারছে না',
      user: 'মোহাম্মদ আলী',
      userType: 'শিক্ষার্থী',
      priority: 'উচ্চ',
      status: 'খোলা',
      createdAt: '২০২৪-০১-১৫',
      category: 'টেকনিক্যাল'
    },
    {
      id: 2,
      title: 'উপস্থিতি রেকর্ড ভুল',
      description: 'উপস্থিতি সঠিকভাবে সংরক্ষিত হচ্ছে না',
      user: 'ড. সালমা খাতুন',
      userType: 'শিক্ষক',
      priority: 'মাঝারি',
      status: 'প্রক্রিয়াধীন',
      createdAt: '২০২৪-০১-১৪',
      category: 'ডেটা'
    },
    {
      id: 3,
      title: 'পেমেন্ট সমস্যা',
      description: 'অনলাইন ফি পেমেন্ট সম্পন্ন হচ্ছে না',
      user: 'রহিম উদ্দিন',
      userType: 'অভিভাবক',
      priority: 'উচ্চ',
      status: 'সমাধান',
      createdAt: '২০২৪-০১-১২',
      category: 'পেমেন্ট'
    },
    {
      id: 4,
      title: 'রিপোর্ট জেনারেট হচ্ছে না',
      description: 'মাসিক রিপোর্ট ডাউনলোড করা যাচ্ছে না',
      user: 'আহমেদ হাসান',
      userType: 'প্রশাসক',
      priority: 'নিম্ন',
      status: 'খোলা',
      createdAt: '২০২৪-০১-১০',
      category: 'রিপোর্ট'
    }
  ];

  const supportStats = {
    total: supportTickets.length,
    open: supportTickets.filter(ticket => ticket.status === 'খোলা').length,
    inProgress: supportTickets.filter(ticket => ticket.status === 'প্রক্রিয়াধীন').length,
    resolved: supportTickets.filter(ticket => ticket.status === 'সমাধান').length
  };

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
                  <h1 className="text-xl font-semibold text-gray-900 leading-tight">সাপোর্ট সেন্টার</h1>
                  <p className="text-sm text-gray-600 leading-tight">সহায়তা টিকিট ও সমস্যা সমাধান</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 h-full">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="টিকিট খুঁজুন..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-10" />
                </div>
                <Bell className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-800" />
                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">{user?.email?.charAt(0).toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
          {/* Support Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">মোট টিকিট</p>
                  <p className="text-2xl font-bold text-gray-900">{supportStats.total}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">খোলা</p>
                  <p className="text-2xl font-bold text-red-600">{supportStats.open}</p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">প্রক্রিয়াধীন</p>
                  <p className="text-2xl font-bold text-yellow-600">{supportStats.inProgress}</p>
                </div>
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">সমাধান</p>
                  <p className="text-2xl font-bold text-green-600">{supportStats.resolved}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">সাপোর্ট টিকিট</h2>
              <p className="text-gray-600">সকল সহায়তা অনুরোধ</p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>নতুন টিকিট</span>
            </button>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">ফোন সাপোর্ট</h3>
                  <p className="text-sm text-gray-600">+৮৮০১৭১২৩৪৫৬১০</p>
                  <p className="text-xs text-gray-500">সকাল ৯টা - রাত ৬টা</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">ইমেইল সাপোর্ট</h3>
                  <p className="text-sm text-gray-600">support@iqraschool.com</p>
                  <p className="text-xs text-gray-500">২৤ ঘন্টা পরিষেবা</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">লাইভ চ্যাট</h3>
                  <p className="text-sm text-gray-600">তাৎক্ষণিক সহায়তা</p>
                  <p className="text-xs text-gray-500">সকাল ৮টা - রাত ১০টা</p>
                </div>
              </div>
            </div>
          </div>

          {/* Support Tickets Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">টিকিট</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ব্যবহারকারী</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ক্যাটেগরি</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">অগ্রাধিকার</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">অবস্থা</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">তারিখ</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {supportTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">#{ticket.id} - {ticket.title}</div>
                          <div className="text-sm text-gray-500">{ticket.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{ticket.user}</div>
                          <div className="text-sm text-gray-500">{ticket.userType}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ticket.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          ticket.priority === 'উচ্চ' ? 'bg-red-100 text-red-800' : 
                          ticket.priority === 'মাঝারি' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          ticket.status === 'খোলা' ? 'bg-red-100 text-red-800' : 
                          ticket.status === 'প্রক্রিয়াধীন' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ticket.createdAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SupportPageWrapper() {
  return (
    <ProtectedRoute requireAuth={true}>
      <SupportPage />
    </ProtectedRoute>
  );
}