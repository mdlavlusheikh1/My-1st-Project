'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { User as AuthUser, onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '@/contexts/AuthContext';
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
  Package,
  Award,
  BookOpen as BookOpenIcon,
  FileText,
  Target,
  TrendingDown,
  CheckSquare,
  Users as UsersIcon,
  Phone,
  Mail,
  MapPin,
  GraduationCap as StudentIcon,
  CheckCircle,
  Clock,
  Filter,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AdminLayout({ children, title = 'ড্যাশবোর্ড', subtitle = 'স্বাগতম' }: AdminLayoutProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
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

  const menuItems = [
    { icon: Home, label: 'ড্যাশবোর্ড', href: '/admin/dashboard', active: pathname === '/admin/dashboard' },
    { icon: Users, label: 'শিক্ষার্থী', href: '/admin/students', active: pathname?.startsWith('/admin/students') },
    { icon: GraduationCap, label: 'শিক্ষক', href: '/admin/teachers', active: pathname?.startsWith('/admin/teachers') },
    { icon: Building, label: 'অভিভাবক', href: '/admin/parents', active: pathname?.startsWith('/admin/parents') },
    { icon: BookOpen, label: 'ক্লাস', href: '/admin/classes', active: pathname?.startsWith('/admin/classes') },
    { icon: ClipboardList, label: 'উপস্থিতি', href: '/admin/attendance', active: pathname?.startsWith('/admin/attendance') },
    { icon: Calendar, label: 'ইভেন্ট', href: '/admin/events', active: pathname?.startsWith('/admin/events') },
    { icon: CreditCard, label: 'হিসাব', href: '/admin/accounting', active: pathname?.startsWith('/admin/accounting') },
    { icon: Settings, label: 'Donation', href: '/admin/donation', active: pathname?.startsWith('/admin/donation') },
    { icon: Award, label: 'পরীক্ষা', href: '/admin/exams', active: pathname?.startsWith('/admin/exams') },
    { icon: BookOpenIcon, label: 'বিষয়', href: '/admin/subjects', active: pathname?.startsWith('/admin/subjects') },
    { icon: UsersIcon, label: 'সাপোর্ট', href: '/admin/support', active: pathname?.startsWith('/admin/support') },
    { icon: Calendar, label: 'বার্তা', href: '/admin/accounts', active: pathname?.startsWith('/admin/accounts') },
    { icon: Settings, label: 'Generate', href: '/admin/generate', active: pathname?.startsWith('/admin/generate') },
    { icon: Package, label: 'ইনভেন্টরি', href: '/admin/inventory', active: pathname?.startsWith('/admin/inventory') },
    { icon: UsersIcon, label: 'অভিযোগ', href: '/admin/misc', active: pathname?.startsWith('/admin/misc') },
    { icon: Settings, label: 'সেটিংস', href: '/admin/settings', active: pathname?.startsWith('/admin/settings') },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen
          ? 'translate-x-0'
          : '-translate-x-full lg:translate-x-0'
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
            onClick={() => auth.signOut()}
            className="flex items-center w-full px-6 py-2 mt-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3" />
            লগআউট
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-screen transition-all duration-300 ease-in-out lg:ml-64">
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
                  <h1 className="text-xl font-semibold text-gray-900 leading-tight">{title}</h1>
                  <p className="text-sm text-gray-600 leading-tight">{subtitle}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 h-full">
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
        <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
}
