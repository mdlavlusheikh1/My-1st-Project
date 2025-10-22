'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { User as AuthUser, onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { studentQueries, User as StudentUser } from '@/lib/database-queries';
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
  Search,
  Bell,
  Plus,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  Package,
  Heart,
  IdCard,
  Upload,
  Download,
  FileText,
  CheckCircle,
  AlertCircle,
  X as XIcon,
  Grid3X3,
  List,
  MapPin,
  Calendar as CalendarIcon
} from 'lucide-react';

function StudentsPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    class: '',
    section: '',
    status: 'all',
    group: '',
    name: '',
    rollNumber: '',
    showPromoted: false
  });
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<StudentUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const router = useRouter();

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await loadStudents();
      } else {
        router.push('/auth/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Real-time listener for students
  useEffect(() => {
    if (!user) return;

    setStudentsLoading(true);
    setError('');

    const q = query(
      collection(db, 'users'),
      where('role', '==', 'student'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const studentsData = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as StudentUser));

      console.log('Loaded students:', studentsData.length, studentsData);
      setStudents(studentsData);
      setStudentsLoading(false);

      if (studentsData.length === 0) {
        setError('কোন শিক্ষার্থী পাওয়া যায়নি। নতুন শিক্ষার্থী যোগ করুন বা ইমপোর্ট করুন।');
      }
    }, (error) => {
      console.error('Error loading students:', error);
      setError(`শিক্ষার্থী লোড করতে সমস্যা হয়েছে: ${error.message}`);
      setStudentsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const loadStudents = async () => {
    if (!user) return;

    setStudentsLoading(true);
    setError('');

    try {
      // Force fresh data by adding timestamp to prevent caching
      const timestamp = new Date().getTime();
      console.log(`🔄 Loading students at ${timestamp}`);

      const studentsData = await studentQueries.getAllStudents(); // Only load active students (default behavior)
      setStudents(studentsData);

      console.log(`✅ Loaded ${studentsData.length} active students`);
    } catch (error) {
      console.error('❌ Error loading students:', error);
      setError('শিক্ষার্থী লোড করতে সমস্যা হয়েছে');
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (auth) {
        await auth.signOut();
      }
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleViewStudent = (student: StudentUser) => {
    router.push(`/admin/students/view?id=${student.uid}`);
  };

  const handleEditStudent = (student: StudentUser) => {
    router.push(`/admin/students/edit?id=${student.uid}`);
  };

  const handleDeleteClick = (student: StudentUser) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;

    setIsDeleting(true);
    try {
      await studentQueries.deleteStudent(studentToDelete.uid);

      // Clear browser cache and reload fresh data
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      await loadStudents();
      setError('');
      setShowDeleteModal(false);
      setStudentToDelete(null);

      console.log('✅ Student successfully deleted and cache cleared');
    } catch (error) {
      console.error('❌ Error deleting student:', error);
      setError(`শিক্ষার্থী মুছে ফেলতে সমস্যা হয়েছে: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setStudentToDelete(null);
  };

  // Sort students by roll number within each class
  const sortedStudents = [...students].sort((a, b) => {
    const classA = a.class || '';
    const classB = b.class || '';
    if (classA !== classB) return classA.localeCompare(classB);
    return (parseInt(a.rollNumber || '0') - parseInt(b.rollNumber || '0'));
  });

  // Enhanced search and filter logic with promotion tracking
  const filteredStudents = sortedStudents.filter(student => {
    const searchMatch = !searchTerm ||
      student.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.guardianName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.guardianPhone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.section?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.group?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber?.toString().includes(searchTerm);

    const classMatch = !searchFilters.class || student.class === searchFilters.class;
    const sectionMatch = !searchFilters.section || student.section === searchFilters.section;
    const statusMatch = searchFilters.status === 'all' ||
      (searchFilters.status === 'active' && student.isActive) ||
      (searchFilters.status === 'inactive' && !student.isActive);
    const groupMatch = !searchFilters.group || student.group === searchFilters.group;
    const nameMatch = !searchFilters.name ||
      student.displayName?.toLowerCase().includes(searchFilters.name.toLowerCase()) ||
      student.name?.toLowerCase().includes(searchFilters.name.toLowerCase());
    const rollMatch = !searchFilters.rollNumber ||
      student.rollNumber?.toLowerCase().includes(searchFilters.rollNumber.toLowerCase());

    return searchMatch && classMatch && sectionMatch && statusMatch && groupMatch && nameMatch && rollMatch;
  });

  // Get unique values for filter dropdowns
  const uniqueClasses = [...new Set(students.map(s => s.class).filter(Boolean))];
  const uniqueSections = [...new Set(students.map(s => s.section).filter(Boolean))];
  const uniqueGroups = [...new Set(students.map(s => s.group).filter(Boolean))];

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, 5);
      } else if (currentPage >= totalPages - 2) {
        pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2);
      }
    }

    return pages;
  };

  // Export to PDF function
  const exportToPDF = async (students: StudentUser[]) => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const currentDate = new Date().toLocaleDateString('bn-BD');

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="bn" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>শিক্ষার্থী তালিকা রিপোর্ট</title>
            <style>
                body {
                    font-family: 'Bangla', 'SolaimanLipi', Arial, sans-serif;
                    margin: 0;
                    padding: 10px 8px;
                    direction: rtl;
                    text-align: right;
                }
                .school-header {
                    text-align: center;
                    margin-bottom: 8px;
                    padding: 8px;
                    border-bottom: 2px solid #2563eb;
                }
                .school-name {
                    font-size: 26px;
                    font-weight: bold;
                    color: #2563eb;
                    margin-bottom: 6px;
                }
                .school-info {
                    font-size: 14px;
                    color: #333;
                    margin-bottom: 3px;
                }
                .report-header {
                    text-align: center;
                    margin-bottom: 10px;
                    padding: 8px;
                }
                .report-title {
                    font-size: 24px;
                    font-weight: bold;
                    color: #2563eb;
                    margin-bottom: 15px;
                }
                .report-info {
                    font-size: 16px;
                    color: #333;
                    margin-bottom: 5px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px auto;
                    font-size: 11px;
                    font-family: 'Bangla', 'SolaimanLipi', Arial, sans-serif;
                    table-layout: fixed;
                }
                th, td {
                    border: 1px solid #2563eb;
                    padding: 8px 4px;
                    text-align: center;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                th {
                    background-color: #dbeafe;
                    font-weight: bold;
                    color: #1e40af;
                    font-size: 14px;
                    border-bottom: 2px solid #2563eb;
                }
                tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                @media print {
                    body { padding: 20px; }
                    .no-print { display: none; }
                }
                @page {
                    size: A4 landscape;
                    margin: 0.3in;
                }
            </style>
        </head>
        <body>
            <div class="school-header">
                <div class="school-name">ইকনা স্কুল এন্ড কলেজ</div>
                <div class="school-info">মিরপুর, ঢাকা, বাংলাদেশ</div>
                <div class="school-info">ফোন: ০১৭১১১১১১১১ | ইমেইল: info@iqnaschool.edu</div>
            </div>

            <div class="report-header">
                <div class="report-title">শিক্ষার্থী তালিকা</div>
                <div class="report-info">
                    রিপোর্ট তৈরির তারিখ: ${currentDate} | মোট শিক্ষার্থী: ${students.length} জন
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>ফোন নম্বর</th>
                        <th>ঠিকানা</th>
                        <th>বাবার নাম</th>
                        <th>বিভাগ</th>
                        <th>ক্লাস</th>
                        <th>শিক্ষার্থীর নাম</th>
                        <th>রোল নম্বর</th>
                    </tr>
                </thead>
                <tbody>
                    ${students.map((student) => `
                        <tr>
                            <td>${student.phoneNumber || student.phone || 'N/A'}</td>
                            <td>${student.address || 'N/A'}</td>
                            <td>${student.fatherName || student.guardianName || 'N/A'}</td>
                            <td>${student.section || 'N/A'}</td>
                            <td>${student.class || 'N/A'}</td>
                            <td>${student.displayName || student.name || 'N/A'}</td>
                            <td>${student.rollNumber || 'N/A'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };

    } catch (error) {
      console.error('PDF export error:', error);
      alert('PDF এক্সপোর্ট করতে সমস্যা হয়েছে');
    }
  };

  // Export to DOCX function
  const exportToDOCX = async (students: StudentUser[]) => {
    try {
      const currentDate = new Date().toLocaleDateString('bn-BD');

      // Create DOCX content as HTML that can be opened in Word
      const docxContent = `
        <!DOCTYPE html>
        <html lang="bn" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>শিক্ষার্থী তালিকা রিপোর্ট</title>
            <style>
                body {
                    font-family: 'Bangla', 'SolaimanLipi', Arial, sans-serif;
                    margin: 20px;
                    padding: 15px;
                    direction: rtl;
                    text-align: right;
                    line-height: 1.6;
                }
                .report-header {
                    text-align: center;
                    margin-bottom: 40px;
                    padding: 20px;
                }
                .report-title {
                    font-size: 28px;
                    font-weight: bold;
                    color: #2563eb;
                    margin-bottom: 15px;
                }
                .report-info {
                    font-size: 16px;
                    color: #333;
                    margin-bottom: 10px;
                }
                .summary-box {
                    background-color: #f8f9fa;
                    padding: 15px;
                    margin: 20px auto 40px auto;
                    border-radius: 8px;
                    border: 2px solid #e9ecef;
                    font-size: 14px;
                    color: #495057;
                    max-width: 600px;
                    text-align: center;
                }
                .student-table {
                    width: auto;
                    min-width: 100%;
                    border-collapse: collapse;
                    margin: 25px auto;
                    font-size: 14px;
                    font-family: 'Bangla', 'SolaimanLipi', Arial, sans-serif;
                    table-layout: auto;
                    page-break-inside: auto;
                }
                .student-table th,
                .student-table td {
                    border: 2px solid #2563eb;
                    padding: 10px 6px;
                    text-align: center;
                    vertical-align: top;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .student-table th {
                    background-color: #dbeafe;
                    font-weight: bold;
                    color: #1e40af;
                    font-size: 15px;
                    border-bottom: 3px solid #2563eb;
                }
                .student-table tr:nth-child(even) {
                    background-color: #f8fafc;
                }
                @page {
                    size: A4 landscape;
                    margin: 0.3in;
                }
                @media print {
                    body { margin: 0; padding: 20px; }
                }
            </style>
        </head>
        <body>
            <div class="school-header">
                <div class="school-name">ইকনা স্কুল এন্ড কলেজ</div>
                <div class="school-info">মিরপুর, ঢাকা, বাংলাদেশ</div>
                <div class="school-info">ফোন: ০১৭১১১১১১১১ | ইমেইল: info@iqnaschool.edu</div>
            </div>

            <div class="report-header">
                <div class="report-title">শিক্ষার্থী তালিকা</div>
                <div class="report-info">
                    রিপোর্ট তৈরির তারিখ: ${currentDate} | মোট শিক্ষার্থী: ${students.length} জন
                </div>
            </div>

            <table class="student-table">
                <thead>
                    <tr>
                        <th>ফোন নম্বর</th>
                        <th>ঠিকানা</th>
                        <th>বাবার নাম</th>
                        <th>বিভাগ</th>
                        <th>ক্লাস</th>
                        <th>শিক্ষার্থীর নাম</th>
                        <th>রোল নম্বর</th>
                    </tr>
                </thead>
                <tbody>
                    ${students.map((student) => `
                        <tr>
                            <td>${student.phoneNumber || student.phone || 'N/A'}</td>
                            <td>${student.address || 'N/A'}</td>
                            <td>${student.fatherName || student.guardianName || 'N/A'}</td>
                            <td>${student.section || 'N/A'}</td>
                            <td>${student.class || 'N/A'}</td>
                            <td>${student.displayName || student.name || 'N/A'}</td>
                            <td>${student.rollNumber || 'N/A'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
      `;

      // Create and download the file
      const blob = new Blob([docxContent], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `শিক্ষার্থী_তালিকা_${new Date().toISOString().split('T')[0]}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('DOCX export error:', error);
      alert('DOCX এক্সপোর্ট করতে সমস্যা হয়েছে');
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
    { icon: Users, label: 'শিক্ষার্থী', href: '/admin/students', active: true },
    { icon: GraduationCap, label: 'শিক্ষক', href: '/admin/teachers', active: false },
    { icon: Building, label: 'অভিভাবক', href: '/admin/parents', active: false },
    { icon: BookOpen, label: 'ক্লাস', href: '/admin/classes', active: false },
    { icon: ClipboardList, label: 'উপস্থিতি', href: '/admin/attendance', active: false },
    { icon: Calendar, label: 'ইভেন্ট', href: '/admin/events', active: false },
    { icon: CreditCard, label: 'হিসাব', href: '/admin/accounting', active: false },
    { icon: Heart, label: 'Donation', href: '/admin/donation', active: false },
    { icon: Home, label: 'পরীক্ষা', href: '/admin/exams', active: false },
    { icon: BookOpen, label: 'বিষয়', href: '/admin/subjects', active: false },
    { icon: Users, label: 'সাপোর্ট', href: '/admin/support', active: false },
    { icon: Calendar, label: 'বার্তা', href: '/admin/accounts', active: false },
    { icon: Settings, label: 'Generate', href: '/admin/generate', active: false },
    { icon: Package, label: 'ইনভেন্টরি', href: '/admin/inventory', active: false },
    { icon: Users, label: 'অভিযোগ', href: '/admin/misc', active: false },
    { icon: Settings, label: 'সেটিংস', href: '/admin/settings', active: false },
  ];

  return (
    <AdminLayout title="শিক্ষার্থী ব্যবস্থাপনা" subtitle="সকল শিক্ষার্থীর তথ্য দেখুন এবং পরিচালনা করুন">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="শিক্ষার্থী খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
            </div>
            <button
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                showAdvancedSearch
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="উন্নত অনুসন্ধান"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
            {(searchFilters.class || searchFilters.section || searchFilters.status !== 'all' || searchFilters.group || searchFilters.name || searchFilters.rollNumber) && (
              <button
                onClick={() => setSearchFilters({ class: '', section: '', status: 'all', group: '', name: '', rollNumber: '', showPromoted: false })}
                className="px-4 py-3 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200"
                title="ফিল্টার পরিষ্কার করুন"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {/* View Toggle Buttons */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="গ্রিড ভিউ"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="লিস্ট ভিউ"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/admin/students/approve')}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>অনুমোদন</span>
              </button>
              <button
                onClick={() => router.push('/admin/students/import')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>বাল্ক ইমপোর্ট</span>
              </button>
              <button
                onClick={() => router.push('/admin/students/id-cards')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <IdCard className="w-4 h-4" />
                <span>আইডি কার্ড তৈরি করুন</span>
              </button>
              <button
                onClick={() => router.push('/admin/students/add')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন শিক্ষার্থী যোগ করুন</span>
              </button>
            </div>

            {/* Export Buttons */}
            {filteredStudents.length > 0 && (
              <div className="flex space-x-2">
                <button
                  onClick={() => exportToPDF(filteredStudents)}
                  className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2 text-sm"
                  title="PDF এ এক্সপোর্ট করুন"
                >
                  <FileText className="w-4 h-4" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => exportToDOCX(filteredStudents)}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 text-sm"
                  title="DOCX এ এক্সপোর্ট করুন"
                >
                  <Download className="w-4 h-4" />
                  <span>DOCX</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">শিক্ষার্থী তালিকা</h2>
          <p className="text-gray-600">
            {searchTerm ? `${filteredStudents.length} জন পাওয়া গেছে` : `মোট ${students.length} জন শিক্ষার্থী`}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Advanced Search Panel */}
        {showAdvancedSearch && (
          <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">উন্নত অনুসন্ধান ফিল্টার</h3>

            {/* Primary Search Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">শিক্ষার্থীর নাম</label>
                <input
                  type="text"
                  placeholder="নাম দিয়ে খুঁজুন..."
                  value={searchFilters.name}
                  onChange={(e) => setSearchFilters({ ...searchFilters, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">রোল নম্বর</label>
                <input
                  type="text"
                  placeholder="রোল দিয়ে খুঁজুন..."
                  value={searchFilters.rollNumber}
                  onChange={(e) => setSearchFilters({ ...searchFilters, rollNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ক্লাস</label>
                <select
                  value={searchFilters.class}
                  onChange={(e) => setSearchFilters({ ...searchFilters, class: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">সব ক্লাস</option>
                  {uniqueClasses.map((className) => (
                    <option key={className} value={className}>
                      {className}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">বিভাগ</label>
                <select
                  value={searchFilters.section}
                  onChange={(e) => setSearchFilters({ ...searchFilters, section: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">সব বিভাগ</option>
                  {uniqueSections.map((section) => (
                    <option key={section} value={section}>
                      {section}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">গ্রুপ</label>
                <select
                  value={searchFilters.group}
                  onChange={(e) => setSearchFilters({ ...searchFilters, group: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">সব গ্রুপ</option>
                  {uniqueGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">স্ট্যাটাস</label>
                <select
                  value={searchFilters.status}
                  onChange={(e) => setSearchFilters({ ...searchFilters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">সব স্ট্যাটাস</option>
                  <option value="active">সক্রিয়</option>
                  <option value="inactive">নিষ্ক্রিয়</option>
                </select>
              </div>
            </div>

            {/* Search Summary */}
            {(searchFilters.name || searchFilters.rollNumber || searchFilters.class || searchFilters.section || searchFilters.group || searchFilters.status !== 'all') && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="font-medium text-blue-800">সক্রিয় ফিল্টার:</span>
                  {searchFilters.name && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      নাম: "{searchFilters.name}"
                      <button
                        onClick={() => setSearchFilters({ ...searchFilters, name: '' })}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {searchFilters.rollNumber && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      রোল: "{searchFilters.rollNumber}"
                      <button
                        onClick={() => setSearchFilters({ ...searchFilters, rollNumber: '' })}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {searchFilters.class && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      ক্লাস: "{searchFilters.class}"
                      <button
                        onClick={() => setSearchFilters({ ...searchFilters, class: '' })}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {searchFilters.section && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      বিভাগ: "{searchFilters.section}"
                      <button
                        onClick={() => setSearchFilters({ ...searchFilters, section: '' })}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {searchFilters.group && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      গ্রুপ: "{searchFilters.group}"
                      <button
                        onClick={() => setSearchFilters({ ...searchFilters, group: '' })}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {searchFilters.status !== 'all' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      স্ট্যাটাস: "{searchFilters.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}"
                      <button
                        onClick={() => setSearchFilters({ ...searchFilters, status: 'all' })}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {studentsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">শিক্ষার্থী লোড হচ্ছে...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm ? 'কোন শিক্ষার্থী পাওয়া যায়নি' : 'কোন শিক্ষার্থী নেই'}
            </h3>
            <p className="mt-1 text-sm text-gray-500 mb-6">
              {searchTerm ? 'অন্য কিছু দিয়ে অনুসন্ধান করুন' : 'নতুন শিক্ষার্থী যোগ করুন বা ইমপোর্ট করুন'}
            </p>

            {!searchTerm && (
              <div className="space-y-4 max-w-md mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => router.push('/admin/students/add')}
                    className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span>নতুন যোগ করুন</span>
                  </button>
                  <button
                    onClick={() => router.push('/admin/students/import')}
                    className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    <span>CSV ইমপোর্ট</span>
                  </button>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-xs text-gray-500 mb-3">দ্রুত টেস্ট করার জন্য:</p>
                  <button
                    onClick={async () => {
                      try {
                        const sampleStudent = {
                          uid: `sample_${Date.now()}`,
                          schoolId: 'IQNA_SCHOOL',
                          role: 'student' as const,
                          displayName: 'মোঃ আব্দুল্লাহ আল মামুন',
                          email: `abdullah.mamun.${Date.now()}@iqnaschool.edu`,
                          phoneNumber: '01711111111',
                          studentId: `STD${Date.now()}`,
                          class: '10',
                          section: 'A',
                          group: 'Science',
                          rollNumber: '01',
                          fatherName: 'মোঃ আলী হোসেন',
                          motherName: 'জাহানারা বেগম',
                          guardianName: 'মোঃ আলী হোসেন',
                          address: 'রোড নং ৫, হাউস নং ১২৩, মিরপুর, ঢাকা',
                          city: 'ঢাকা',
                          district: 'ঢাকা',
                          postalCode: '1216',
                          isActive: true,
                          createdAt: new Date(),
                          updatedAt: new Date()
                        };

                        await studentQueries.createStudent(sampleStudent);
                        alert('স্যাম্পল শিক্ষার্থী যোগ করা হয়েছে!');
                      } catch (error) {
                        console.error('Error adding sample student:', error);
                        alert('স্যাম্পল শিক্ষার্থী যোগ করতে সমস্যা হয়েছে');
                      }
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm transition-colors"
                  >
                    স্যাম্পল শিক্ষার্থী যোগ করুন
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedStudents.map((student) => (
              <div key={student.uid} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center overflow-hidden">
                    {student.profileImage ? (
                      <img
                        src={student.profileImage}
                        alt={student.displayName || student.name || 'Student'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-lg">
                        {student.displayName?.split(' ')[0].charAt(0) || student.email?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{student.displayName || student.name || 'Unknown Student'}</h3>
                    <p className="text-sm text-gray-600">ID: {student.studentId || 'N/A'}</p>
                    <p className="text-sm text-gray-600">{student.class || 'No Class'}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                      student.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {student.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <UserCheck className="w-4 h-4 mr-2" />
                    গার্ডিয়ান: {student.guardianName || 'N/A'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {student.phoneNumber || student.phone || 'N/A'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {student.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    যোগদান: {student.createdAt ? new Date(student.createdAt.toDate()).toLocaleDateString('bn-BD') : 'N/A'}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewStudent(student)}
                    className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-sm hover:bg-blue-100 flex items-center justify-center space-x-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span>দেখুন</span>
                  </button>
                  <button
                    onClick={() => handleEditStudent(student)}
                    className="flex-1 bg-green-50 text-green-600 px-3 py-2 rounded-lg text-sm hover:bg-green-100 flex items-center justify-center space-x-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span>সম্পাদনা</span>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(student)}
                    className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ছাত্র</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admission No</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">রোল</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">শিক্ষার্থীর নাম</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">গ্রুপ</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">বাবার নাম</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ফোন</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">বর্তমান ঠিকানা</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ক্রিয়াকলাপ</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedStudents.map((student) => (
                    <tr key={student.uid} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center overflow-hidden">
                            {student.profileImage ? (
                              <img
                                src={student.profileImage}
                                alt={student.displayName || student.name || 'Student'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-bold text-sm">
                                {student.displayName?.split(' ')[0].charAt(0) || student.email?.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.studentId || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.rollNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{student.displayName || student.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.group || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.fatherName || student.guardianName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.phoneNumber || student.phone || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                          {student.address || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewStudent(student)}
                            className="text-blue-600 hover:text-blue-900"
                            title="দেখুন"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditStudent(student)}
                            className="text-green-600 hover:text-green-900"
                            title="সম্পাদনা করুন"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(student)}
                            className="text-red-600 hover:text-red-900"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center text-sm text-gray-700">
              <span className="mr-2">দেখানো হচ্ছে</span>
              <span className="font-medium">{startIndex + 1}</span>
              <span className="mx-1">থেকে</span>
              <span className="font-medium">{Math.min(endIndex, filteredStudents.length)}</span>
              <span className="mx-1">পর্যন্ত</span>
              <span className="font-medium">{filteredStudents.length}</span>
              <span className="ml-1">জন শিক্ষার্থী</span>
            </div>

            <div className="flex items-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:hover:bg-gray-100"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                আগের
              </button>

              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`relative inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      page === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:hover:bg-gray-100"
              >
                পরের
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && studentToDelete && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">শিক্ষার্থী মুছে ফেলুন</h3>
                    <p className="text-sm text-gray-600">এটি স্থায়ীভাবে মুছে যাবে</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {studentToDelete.displayName?.split(' ')[0].charAt(0) || studentToDelete.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{studentToDelete.displayName || studentToDelete.name || 'Unknown Student'}</p>
                      <p className="text-sm text-gray-600">ID: {studentToDelete.studentId || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>📧 {studentToDelete.email}</p>
                    <p>📞 {studentToDelete.phoneNumber || studentToDelete.phone || 'N/A'}</p>
                    <p>🏫 {studentToDelete.class || 'No Class'}</p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleCancelDelete}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    বাতিল করুন
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>মুছে ফেলছি...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>মুছে ফেলুন</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </AdminLayout>
    );
  }

export default function StudentsPageWrapper() {
  return (
    <ProtectedRoute requireAuth={true}>
      <StudentsPage />
    </ProtectedRoute>
  );
}
