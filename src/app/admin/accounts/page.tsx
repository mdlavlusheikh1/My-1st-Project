'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  Home, Users, BookOpen, ClipboardList, Calendar, Settings, LogOut, Menu, X,
  UserCheck, GraduationCap, Building, CreditCard, TrendingUp, Search, Bell,
  Plus, MessageSquare, Send, Trash2, Eye, User as UserIcon,
  Package
} from 'lucide-react';

function AccountsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('all');
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
    { icon: Calendar, label: 'বার্তা', href: '/admin/accounts', active: true },
    { icon: Settings, label: 'Generate', href: '/admin/generate', active: false },
    { icon: Package, label: 'ইনভেন্টরি', href: '/admin/inventory', active: false },
    { icon: Users, label: 'অভিযোগ', href: '/admin/misc', active: false },
    { icon: Settings, label: 'সেটিংস', href: '/admin/settings', active: false },
  ];

  const messages = [
    {
      id: 1,
      sender: 'মোহাম্মদ আলী',
      recipient: 'সকল শিক্ষক',
      subject: 'ক্লাসের সময়সূচী পরিবর্তন',
      message: 'আগামীকাল থেকে গণিত ক্লাসের সময় পরিবর্তন হবে।',
      timestamp: '২০২৪-০১-১৫ ১০:৩০',
      status: 'পঠিত',
      priority: 'উচ্চ'
    },
    {
      id: 2,
      sender: 'ড. সালমা খাতুন',
      recipient: 'অভিভাবকগণ',
      subject: 'পরীক্ষার সময়সূচী',
      message: 'আসন্ন মাসিক পরীক্ষার সময়সূচী প্রকাশ করা হলো।',
      timestamp: '২০২৪-০১-১৪ ১৪:২০',
      status: 'নতুন',
      priority: 'মাঝারি'
    },
    {
      id: 3,
      sender: 'প্রশাসন',
      recipient: 'সকল শিক্ষার্থী',
      subject: 'ছুটির দিন ঘোষণা',
      message: 'আগামী শুক্রবার স্কুল বন্ধ থাকবে।',
      timestamp: '২০২৪-০১-১২ ০৯:১৫',
      status: 'পঠিত',
      priority: 'নিম্ন'
    }
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Handle message sending logic here
      setNewMessage('');
      alert('বার্তা পাঠানো হয়েছে!');
    }
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
        {/* Top Navigation */}
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200 h-16">
          <div className="h-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center h-full">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700 mr-4">
                  <Menu className="w-6 h-6" />
                </button>
                <div className="flex flex-col justify-center h-full">
                  <h1 className="text-xl font-semibold text-gray-900 leading-tight">বার্তা ব্যবস্থাপনা</h1>
                  <p className="text-sm text-gray-600 leading-tight">সকলের সাথে যোগাযোগ করুন</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 h-full">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="বার্তা খুঁজুন..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-10" />
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
        <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Compose Message */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">নতুন বার্তা</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">প্রাপক</label>
                    <select 
                      value={selectedRecipient}
                      onChange={(e) => setSelectedRecipient(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">সকলে</option>
                      <option value="teachers">সকল শিক্ষক</option>
                      <option value="students">সকল শিক্ষার্থী</option>
                      <option value="parents">সকল অভিভাবক</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">বিষয়</label>
                    <input 
                      type="text" 
                      placeholder="বার্তার বিষয়"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">বার্তা</label>
                    <textarea 
                      rows={5}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="আপনার বার্তা লিখুন..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button 
                    onClick={handleSendMessage}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>পাঠান</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Messages List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">সাম্প্রতিক বার্তা</h3>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>নতুন গ্রুপ</span>
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <UserIcon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-gray-900">{message.sender}</span>
                                <span className="text-sm text-gray-500">→ {message.recipient}</span>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  message.priority === 'উচ্চ' ? 'bg-red-100 text-red-800' : 
                                  message.priority === 'মাঝারি' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                }`}>
                                  {message.priority}
                                </span>
                              </div>
                              <h4 className="font-medium text-gray-900 mb-1">{message.subject}</h4>
                              <p className="text-sm text-gray-600 mb-2">{message.message}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">{message.timestamp}</span>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  message.status === 'নতুন' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {message.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <button className="text-blue-600 hover:text-blue-800">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-800">
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountsPageWrapper() {
  return (
    <ProtectedRoute requireAuth={true}>
      <AccountsPage />
    </ProtectedRoute>
  );
}