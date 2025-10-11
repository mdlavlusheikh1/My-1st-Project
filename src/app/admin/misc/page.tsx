'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  Home, Users, BookOpen, ClipboardList, Calendar, Settings, LogOut, Menu, X,
  UserCheck, GraduationCap, Building, CreditCard, TrendingUp, Search, Bell,
  Plus, AlertTriangle, MessageCircle, FileText, Clock, CheckCircle,
  Package
} from 'lucide-react';

function MiscPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newComplaint, setNewComplaint] = useState('');
  const [complaintCategory, setComplaintCategory] = useState('general');
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
    { icon: Users, label: 'অভিযোগ', href: '/admin/misc', active: true },
    { icon: Settings, label: 'সেটিংস', href: '/admin/settings', active: false },
  ];

  const complaints = [
    {
      id: 1,
      complainant: 'মোহাম্মদ আলী',
      complainantType: 'শিক্ষার্থী',
      category: 'সুবিধা',
      subject: 'ক্যান্টিনের খাবারের মান',
      description: 'ক্যান্টিনের খাবারের মান উন্নত করা প্রয়োজন।',
      status: 'নতুন',
      priority: 'মাঝারি',
      submittedDate: '২০২৪-০১-১৫',
      assignedTo: 'প্রশাসন'
    },
    {
      id: 2,
      complainant: 'সালমা খাতুন',
      complainantType: 'অভিভাবক',
      category: 'শিক্ষা',
      subject: 'পাঠ্যবই সরবরাহ',
      description: 'সময়মতো পাঠ্যবই পৌঁছাচ্ছে না।',
      status: 'প্রক্রিয়াধীন',
      priority: 'উচ্চ',
      submittedDate: '২০২৪-০১-১২',
      assignedTo: 'একাডেমিক বিভাগ'
    },
    {
      id: 3,
      complainant: 'ড. রহিম উদ্দিন',
      complainantType: 'শিক্ষক',
      category: 'প্রযুক্তি',
      subject: 'ইন্টারনেট সংযোগ',
      description: 'ক্লাসরুমে ইন্টারনেট সংযোগ দুর্বল।',
      status: 'সমাধান',
      priority: 'নিম্ন',
      submittedDate: '২০২৪-০১-১০',
      assignedTo: 'আইটি বিভাগ'
    },
    {
      id: 4,
      complainant: 'ফাতিমা আক্তার',
      complainantType: 'শিক্ষার্থী',
      category: 'নিরাপত্তা',
      subject: 'খেলার মাঠের নিরাপত্তা',
      description: 'খেলার মাঠে আরও নিরাপত্তা ব্যবস্থা প্রয়োজন।',
      status: 'নতুন',
      priority: 'উচ্চ',
      submittedDate: '২০২৪-০১-০৮',
      assignedTo: 'নিরাপত্তা বিভাগ'
    }
  ];

  const complaintStats = {
    total: complaints.length,
    new: complaints.filter(c => c.status === 'নতুন').length,
    inProgress: complaints.filter(c => c.status === 'প্রক্রিয়াধীন').length,
    resolved: complaints.filter(c => c.status === 'সমাধান').length
  };

  const handleSubmitComplaint = () => {
    if (newComplaint.trim()) {
      // Handle complaint submission logic here
      setNewComplaint('');
      alert('অভিযোগ জমা দেওয়া হয়েছে!');
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
                  <h1 className="text-xl font-semibold text-gray-900 leading-tight">অভিযোগ ব্যবস্থাপনা</h1>
                  <p className="text-sm text-gray-600 leading-tight">সকল অভিযোগ ও সমস্যা সমাধান</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 h-full">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="অভিযোগ খুঁজুন..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-10" />
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
          {/* Complaint Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">মোট অভিযোগ</p>
                  <p className="text-2xl font-bold text-gray-900">{complaintStats.total}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">নতুন</p>
                  <p className="text-2xl font-bold text-red-600">{complaintStats.new}</p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">প্রক্রিয়াধীন</p>
                  <p className="text-2xl font-bold text-yellow-600">{complaintStats.inProgress}</p>
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
                  <p className="text-2xl font-bold text-green-600">{complaintStats.resolved}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Submit New Complaint */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">নতুন অভিযোগ</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">বিভাগ</label>
                    <select 
                      value={complaintCategory}
                      onChange={(e) => setComplaintCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="general">সাধারণ</option>
                      <option value="education">শিক্ষা</option>
                      <option value="facility">সুবিধা</option>
                      <option value="technology">প্রযুক্তি</option>
                      <option value="security">নিরাপত্তা</option>
                      <option value="other">অন্যান্য</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">বিষয়</label>
                    <input 
                      type="text" 
                      placeholder="অভিযোগের বিষয়"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">বিবরণ</label>
                    <textarea 
                      rows={4}
                      value={newComplaint}
                      onChange={(e) => setNewComplaint(e.target.value)}
                      placeholder="অভিযোগের বিস্তারিত বিবরণ..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">অগ্রাধিকার</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="low">নিম্ন</option>
                      <option value="medium">মাঝারি</option>
                      <option value="high">উচ্চ</option>
                    </select>
                  </div>
                  <button 
                    onClick={handleSubmitComplaint}
                    className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>অভিযোগ জমা দিন</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Complaints List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">সাম্প্রতিক অভিযোগ</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {complaints.map((complaint) => (
                      <div key={complaint.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-gray-900">{complaint.complainant}</span>
                              <span className="text-sm text-gray-500">({complaint.complainantType})</span>
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{complaint.category}</span>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-1">{complaint.subject}</h4>
                            <p className="text-sm text-gray-600 mb-3">{complaint.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <span className="text-xs text-gray-500">জমা: {complaint.submittedDate}</span>
                                <span className="text-xs text-gray-500">দায়িত্বপ্রাপ্ত: {complaint.assignedTo}</span>
                              </div>
                              <div className="flex space-x-2">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  complaint.priority === 'উচ্চ' ? 'bg-red-100 text-red-800' : 
                                  complaint.priority === 'মাঝারি' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                }`}>
                                  {complaint.priority}
                                </span>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  complaint.status === 'নতুন' ? 'bg-red-100 text-red-800' : 
                                  complaint.status === 'প্রক্রিয়াধীন' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                }`}>
                                  {complaint.status}
                                </span>
                              </div>
                            </div>
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

export default function MiscPageWrapper() {
  return (
    <ProtectedRoute requireAuth={true}>
      <MiscPage />
    </ProtectedRoute>
  );
}