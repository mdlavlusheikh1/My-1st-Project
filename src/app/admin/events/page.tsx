'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
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
  Clock,
  MapPin,
  CalendarDays,
  Package
} from 'lucide-react';

function EventsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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
    { icon: Calendar, label: 'ইভেন্ট', href: '/admin/events', active: true },
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

  // Sample events data
  const events = [
    { 
      id: 1, 
      title: 'বার্ষিক ক্রীড়া প্রতিযোগিতা', 
      description: 'সকল শিক্ষার্থীর জন্য বার্ষিক ক্রীড়া প্রতিযোগিতা অনুষ্ঠিত হবে।',
      date: '২০২৪-০১-১৫',
      time: '০৯:০০ - ১৭:০০',
      location: 'স্কুল মাঠ',
      category: 'ক্রীড়া',
      status: 'আসছে',
      participants: 150,
      organizer: 'ক্রীড়া বিভাগ'
    },
    { 
      id: 2, 
      title: 'বিজ্ঞান মেলা ২০২৪', 
      description: 'শিক্ষার্থীদের বিজ্ঞান প্রকল্প প্রদর্শনী ও প্রতিযোগিতা।',
      date: '২০২৪-০২-১০',
      time: '১০:০০ - ১৬:০০',
      location: 'বিজ্ঞান ভবন',
      category: 'শিক্ষা',
      status: 'আসছে',
      participants: 85,
      organizer: 'বিজ্ঞান বিভাগ'
    },
    { 
      id: 3, 
      title: 'অভিভাবক সভা', 
      description: 'ত্রৈমাসিক অভিভাবক সভা ও শিক্ষার্থীদের ফলাফল নিয়ে আলোচনা।',
      date: '২০২৪-০১-০৮',
      time: '১৪:০০ - ১৬:০০',
      location: 'মূল হল',
      category: 'সভা',
      status: 'সম্পন্ন',
      participants: 120,
      organizer: 'প্রশাসন'
    },
    { 
      id: 4, 
      title: 'সাংস্কৃতিক অনুষ্ঠান', 
      description: 'বাংলা নববর্ষ উপলক্ষে সাংস্কৃতিক অনুষ্ঠান ও প্রতিযোগিতা।',
      date: '২০২৪-০৪-১৪',
      time: '১৮:০০ - ২১:০০',
      location: 'মূল মঞ্চ',
      category: 'সাংস্কৃতিক',
      status: 'পরিকল্পনা',
      participants: 200,
      organizer: 'সাংস্কৃতিক বিভাগ'
    },
    { 
      id: 5, 
      title: 'শিক্ষা সফর', 
      description: 'ক্লাস ৯ ও ১০ এর শিক্ষার্থীদের জাতীয় জাদুঘর পরিদর্শন।',
      date: '২০২৪-০৩-২২',
      time: '০৮:০০ - ১৮:০০',
      location: 'জাতীয় জাদুঘর, ঢাকা',
      category: 'শিক্ষা সফর',
      status: 'আসছে',
      participants: 60,
      organizer: 'শিক্ষা বিভাগ'
    },
  ];

  const eventStats = {
    total: events.length,
    upcoming: events.filter(event => event.status === 'আসছে').length,
    completed: events.filter(event => event.status === 'সম্পন্ন').length,
    planning: events.filter(event => event.status === 'পরিকল্পনা').length
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
      <div className="flex-1 lg:ml-64">
        {/* Top Navigation */}
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200 h-16">
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
                  <h1 className="text-xl font-semibold text-gray-900 leading-tight">ইভেন্ট ব্যবস্থাপনা</h1>
                  <p className="text-sm text-gray-600 leading-tight">স্কুলের সকল ইভেন্ট ও অনুষ্ঠান পরিচালনা করুন</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 h-full">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ইভেন্ট খুঁজুন..."
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
        <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
          {/* Event Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">মোট ইভেন্ট</p>
                  <p className="text-2xl font-bold text-gray-900">{eventStats.total}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">আসছে</p>
                  <p className="text-2xl font-bold text-green-600">{eventStats.upcoming}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">সম্পন্ন</p>
                  <p className="text-2xl font-bold text-blue-600">{eventStats.completed}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">পরিকল্পনা</p>
                  <p className="text-2xl font-bold text-orange-600">{eventStats.planning}</p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Page Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">ইভেন্ট তালিকা</h2>
              <p className="text-gray-600">মোট {events.length} টি ইভেন্ট</p>
            </div>
            <div className="flex space-x-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>নতুন ইভেন্ট</span>
              </button>
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    event.status === 'আসছে' 
                      ? 'bg-green-100 text-green-800' 
                      : event.status === 'সম্পন্ন'
                      ? 'bg-blue-100 text-blue-800'
                      : event.status === 'পরিকল্পনা'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {event.status}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {event.category}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarDays className="w-4 h-4 mr-2 text-blue-500" />
                    {event.date}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-green-500" />
                    {event.time}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-red-500" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-purple-500" />
                    {event.participants} জন অংশগ্রহণকারী
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">আয়োজক:</span>
                    <span className="text-sm font-medium text-gray-900">{event.organizer}</span>
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

export default function EventsPageWrapper() {
  return (
    <ProtectedRoute requireAuth={true}>
      <EventsPage />
    </ProtectedRoute>
  );
}