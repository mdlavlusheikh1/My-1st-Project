'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { User as AuthUser, onAuthStateChanged } from 'firebase/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { subjectQueries } from '@/lib/database-queries';
import {
  Home, Users, BookOpen, ClipboardList, Calendar, Settings, LogOut, Menu, X,
  UserCheck, GraduationCap, Building, CreditCard, TrendingUp, Search, Bell,
  Plus, Edit, Trash2, Eye, Clock, Book, FileText,
  Package, Loader2
} from 'lucide-react';

function SubjectsPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Subject management states
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);

  // Classes management states
  const [classes, setClasses] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Form states
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    nameEn: '',
    code: '',
    teacherName: '',
    selectedClass: '',
    type: 'মূল' as 'মূল' | 'ধর্মীয়' | 'ঐচ্ছিক',
    description: ''
  });

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        loadSubjects();
        loadClasses();
      } else {
        router.push('/auth/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  // Load subjects from Firebase
  const loadSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const schoolId = 'iqra-school-2025';
      let subjectsData = await subjectQueries.getActiveSubjects(schoolId);

      // If no subjects exist, create sample data
      if (subjectsData.length === 0) {
        console.log('No subjects found, creating sample data...');
        await subjectQueries.createSampleSubjects();
        subjectsData = await subjectQueries.getActiveSubjects(schoolId);
        console.log('Created and loaded sample subjects:', subjectsData);
      } else {
        console.log('Loaded subjects from Firebase:', subjectsData);
      }

      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error loading subjects:', error);
    } finally {
      setLoadingSubjects(false);
    }
  };

  // Load classes from Firebase
  const loadClasses = async () => {
    try {
      setLoadingClasses(true);
      console.log('🔄 Starting to load classes...');

      // Always use fallback classes for now to ensure they show
      const fallbackClasses = [
        { classId: 'play-class', className: 'প্লে', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true },
        { classId: 'nursery-class', className: 'নার্সারি', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true },
        { classId: 'one-class', className: 'প্রথম', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true },
        { classId: 'two-class', className: 'দ্বিতীয়', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true },
        { classId: 'three-class', className: 'তৃতীয়', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true },
        { classId: 'four-class', className: 'চতুর্থ', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true },
        { classId: 'five-class', className: 'পঞ্চম', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true },
        { classId: 'six-class', className: 'ষষ্ঠ', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true },
        { classId: 'seven-class', className: 'সপ্তম', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true },
        { classId: 'eight-class', className: 'অষ্টম', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true },
        { classId: 'nine-class', className: 'নবম', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true },
        { classId: 'ten-class', className: 'দশম', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true }
      ];

      setClasses(fallbackClasses);
      console.log('✅ Classes loaded (fallback):', fallbackClasses);

      // Try to load from Firebase in background
      try {
        const { collection, getDocs } = await import('firebase/firestore');
        const classesSnapshot = await getDocs(collection(db, 'classes'));
        console.log('🔍 Firebase classes snapshot size:', classesSnapshot.size);

        if (!classesSnapshot.empty) {
          const firebaseClasses: any[] = [];
          classesSnapshot.forEach((doc) => {
            console.log('📄 Class document:', doc.id, doc.data());
            firebaseClasses.push({
              id: doc.id,
              ...doc.data()
            });
          });

          // Format classes for display
          const formattedClasses = firebaseClasses.map((cls) => ({
            classId: cls.classId || cls.id,
            className: cls.className || cls.name || `Class ${cls.id}`,
            section: cls.section || 'এ',
            teacherName: cls.teacherName || cls.teacher || 'নির্ধারিত নয়',
            totalStudents: cls.totalStudents || 0,
            isActive: cls.isActive !== false
          }));

          setClasses(formattedClasses);
          localStorage.setItem('iqra_classes', JSON.stringify(formattedClasses));
          console.log('✅ Classes loaded from Firebase:', formattedClasses);
        } else {
          console.log('⚠️ No classes found in Firebase, using fallback');
        }
      } catch (firebaseError) {
        console.error('❌ Firebase error loading classes:', firebaseError);
        console.log('🔄 Using fallback classes due to Firebase error');
      }
    } catch (error) {
      console.error('❌ Critical error loading classes:', error);
      // Ensure we always have fallback classes
      const emergencyClasses = [
        { classId: 'play-class', className: 'প্লে', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true },
        { classId: 'nursery-class', className: 'নার্সারি', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true },
        { classId: 'one-class', className: 'প্রথম', section: 'এ', teacherName: 'নির্ধারিত নয়', totalStudents: 0, isActive: true }
      ];
      setClasses(emergencyClasses);
    } finally {
      setLoadingClasses(false);
    }
  };

  // Handle create subject
  const handleCreateSubject = async () => {
    if (!subjectForm.name || !subjectForm.code || !subjectForm.selectedClass) {
      alert('অনুগ্রহ করে বিষয়ের নাম, কোড এবং ক্লাস নির্বাচন করুন।');
      return;
    }

    try {
      const subjectData = {
        name: subjectForm.name,
        nameEn: subjectForm.nameEn || subjectForm.name,
        code: subjectForm.code,
        teacherName: subjectForm.teacherName,
        classes: [subjectForm.selectedClass],
        students: 0, // Default value
        credits: 1, // Default value
        type: subjectForm.type,
        description: subjectForm.description,
        schoolId: 'iqra-school-2025',
        createdBy: user?.email || 'admin',
        isActive: true
      };

      await subjectQueries.createSubject(subjectData);
      setShowCreateDialog(false);
      resetForm();
      loadSubjects(); // Reload subjects
      alert('বিষয় সফলভাবে তৈরি করা হয়েছে!');
    } catch (error) {
      console.error('Error creating subject:', error);
      alert('বিষয় তৈরি করতে ত্রুটি হয়েছে।');
    }
  };

  // Handle edit subject
  const handleEditSubject = async () => {
    if (!selectedSubject || !subjectForm.name || !subjectForm.code || !subjectForm.selectedClass) {
      alert('অনুগ্রহ করে বিষয়ের নাম, কোড এবং ক্লাস নির্বাচন করুন।');
      return;
    }

    try {
      const updates = {
        name: subjectForm.name,
        nameEn: subjectForm.nameEn || subjectForm.name,
        code: subjectForm.code,
        teacherName: subjectForm.teacherName,
        classes: [subjectForm.selectedClass],
        students: 0, // Default value
        credits: 1, // Default value
        type: subjectForm.type,
        description: subjectForm.description
      };

      await subjectQueries.updateSubject(selectedSubject.id, updates);
      setShowEditDialog(false);
      setSelectedSubject(null);
      resetForm();
      loadSubjects(); // Reload subjects
      alert('বিষয় সফলভাবে আপডেট করা হয়েছে!');
    } catch (error) {
      console.error('Error updating subject:', error);
      alert('বিষয় আপডেট করতে ত্রুটি হয়েছে।');
    }
  };

  // Handle delete subject
  const handleDeleteSubject = async () => {
    if (!selectedSubject) return;

    try {
      await subjectQueries.deleteSubject(selectedSubject.id);
      setShowDeleteDialog(false);
      setSelectedSubject(null);
      loadSubjects(); // Reload subjects
      alert('বিষয় সফলভাবে মুছে ফেলা হয়েছে!');
    } catch (error) {
      console.error('Error deleting subject:', error);
      alert('বিষয় মুছে ফেলতে ত্রুটি হয়েছে।');
    }
  };

  // Open edit dialog with subject data
  const openEditDialog = (subject: any) => {
    setSelectedSubject(subject);
    setSubjectForm({
      name: subject.name || '',
      nameEn: subject.nameEn || '',
      code: subject.code || '',
      teacherName: subject.teacherName || '',
      selectedClass: subject.classes?.[0] || '',
      type: subject.type || 'মূল',
      description: subject.description || ''
    });
    setShowEditDialog(true);
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (subject: any) => {
    setSelectedSubject(subject);
    setShowDeleteDialog(true);
  };

  // Reset form
  const resetForm = () => {
    setSubjectForm({
      name: '',
      nameEn: '',
      code: '',
      teacherName: '',
      selectedClass: '',
      type: 'মূল' as 'মূল' | 'ধর্মীয়' | 'ঐচ্ছিক',
      description: ''
    });
  };

  // Filter subjects based on search
  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.teacherName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    { icon: BookOpen, label: 'বিষয়', href: '/admin/subjects', active: true },
    { icon: Users, label: 'সাপোর্ট', href: '/admin/support', active: false },
    { icon: Calendar, label: 'বার্তা', href: '/admin/accounts', active: false },
    { icon: Settings, label: 'Generate', href: '/admin/generate', active: false },
    { icon: Package, label: 'ইনভেন্টরি', href: '/admin/inventory', active: false },
    { icon: Users, label: 'অভিযোগ', href: '/admin/misc', active: false },
    { icon: Settings, label: 'সেটিংস', href: '/admin/settings', active: false },
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
                  <h1 className="text-xl font-semibold text-gray-900 leading-tight">বিষয় ব্যবস্থাপনা</h1>
                  <p className="text-sm text-gray-600 leading-tight">সকল বিষয়ের তথ্য দেখুন এবং পরিচালনা করুন</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 h-full">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="বিষয় খুঁজুন..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
                  />
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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">বিষয় তালিকা</h2>
              <p className="text-gray-600">মোট {filteredSubjects.length} টি বিষয়</p>
            </div>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন বিষয়</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {loadingSubjects ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">বিষয় লোড হচ্ছে...</span>
              </div>
            ) : filteredSubjects.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Book className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">কোনো বিষয় পাওয়া যায়নি</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'অনুসন্ধান ফিল্টার পরিবর্তন করুন' : 'নতুন বিষয় যোগ করুন'}
                </p>
              </div>
            ) : (
              filteredSubjects.map((subject) => (
              <div key={subject.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <Book className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{subject.name}</h3>
                      <p className="text-sm text-gray-500">{subject.code}</p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    subject.type === 'মূল' ? 'bg-blue-100 text-blue-800' : 
                    subject.type === 'ধর্মীয়' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {subject.type}
                  </span>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <GraduationCap className="w-4 h-4 mr-2 text-blue-500" />
                    <span>{subject.teacher}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-green-500" />
                    <span>{subject.students} জন শিক্ষার্থী</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FileText className="w-4 h-4 mr-2 text-orange-500" />
                    <span>{subject.credits} ক্রেডিট</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">ক্লাসঃ </span>
                    {subject.classes.join(', ')}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 line-clamp-2">{subject.description}</p>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => router.push(`/admin/subjects/${subject.id}`)}
                    className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-sm hover:bg-blue-100 flex items-center justify-center space-x-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span>দেখুন</span>
                  </button>
                  <button
                    onClick={() => openEditDialog(subject)}
                    className="flex-1 bg-green-50 text-green-600 px-3 py-2 rounded-lg text-sm hover:bg-green-100 flex items-center justify-center space-x-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span>সম্পাদনা</span>
                  </button>
                  <button
                    onClick={() => openDeleteDialog(subject)}
                    className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
            )}
          </div>
        </div>
      </div>

      {/* Create Subject Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">নতুন বিষয় যোগ করুন</h2>
              <button
                onClick={() => {
                  setShowCreateDialog(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    বিষয়ের নাম (বাংলা) *
                  </label>
                  <input
                    type="text"
                    value={subjectForm.name}
                    onChange={(e) => setSubjectForm({...subjectForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="যেমন: গণিত"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    বিষয়ের নাম (ইংরেজি)
                  </label>
                  <input
                    type="text"
                    value={subjectForm.nameEn}
                    onChange={(e) => setSubjectForm({...subjectForm, nameEn: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mathematics (ঐচ্ছিক)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    কোড *
                  </label>
                  <input
                    type="text"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({...subjectForm, code: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="MATH101"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    শিক্ষকের নাম
                  </label>
                  <input
                    type="text"
                    value={subjectForm.teacherName}
                    onChange={(e) => setSubjectForm({...subjectForm, teacherName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="শিক্ষকের নাম (ঐচ্ছিক)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ক্লাস নির্বাচন করুন *
                  </label>
                  <select
                    value={subjectForm.selectedClass}
                    onChange={(e) => setSubjectForm({...subjectForm, selectedClass: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loadingClasses}
                  >
                    <option value="">ক্লাস নির্বাচন করুন</option>
                    {loadingClasses ? (
                      <option disabled>ক্লাস লোড হচ্ছে...</option>
                    ) : classes.length === 0 ? (
                      <option disabled>কোনো ক্লাস পাওয়া যায়নি</option>
                    ) : (
                      classes.map((classItem) => (
                        <option key={classItem.classId} value={classItem.className}>
                          {classItem.className} {classItem.section ? `(${classItem.section})` : ''}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ধরন
                  </label>
                  <select
                    value={subjectForm.type}
                    onChange={(e) => setSubjectForm({...subjectForm, type: e.target.value as 'মূল' | 'ধর্মীয়' | 'ঐচ্ছিক'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="মূল">মূল</option>
                    <option value="ধর্মীয়">ধর্মীয়</option>
                    <option value="ঐচ্ছিক">ঐচ্ছিক</option>
                  </select>
                </div>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  বিবরণ
                </label>
                <textarea
                  value={subjectForm.description}
                  onChange={(e) => setSubjectForm({...subjectForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="বিষয়ের বিস্তারিত বিবরণ..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => {
                  setShowCreateDialog(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                বাতিল করুন
              </button>
              <button
                onClick={handleCreateSubject}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>তৈরি করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Subject Dialog */}
      {showEditDialog && selectedSubject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">বিষয় সম্পাদনা করুন</h2>
              <button
                onClick={() => {
                  setShowEditDialog(false);
                  setSelectedSubject(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Same form fields as create dialog */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    বিষয়ের নাম (বাংলা) *
                  </label>
                  <input
                    type="text"
                    value={subjectForm.name}
                    onChange={(e) => setSubjectForm({...subjectForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    বিষয়ের নাম (ইংরেজি)
                  </label>
                  <input
                    type="text"
                    value={subjectForm.nameEn}
                    onChange={(e) => setSubjectForm({...subjectForm, nameEn: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mathematics (ঐচ্ছিক)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    কোড *
                  </label>
                  <input
                    type="text"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({...subjectForm, code: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    শিক্ষকের নাম
                  </label>
                  <input
                    type="text"
                    value={subjectForm.teacherName}
                    onChange={(e) => setSubjectForm({...subjectForm, teacherName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="শিক্ষকের নাম (ঐচ্ছিক)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ক্লাস নির্বাচন করুন *
                  </label>
                  <select
                    value={subjectForm.selectedClass}
                    onChange={(e) => setSubjectForm({...subjectForm, selectedClass: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loadingClasses}
                  >
                    <option value="">ক্লাস নির্বাচন করুন</option>
                    {loadingClasses ? (
                      <option disabled>ক্লাস লোড হচ্ছে...</option>
                    ) : classes.length === 0 ? (
                      <option disabled>কোনো ক্লাস পাওয়া যায়নি</option>
                    ) : (
                      classes.map((classItem) => (
                        <option key={classItem.classId} value={classItem.className}>
                          {classItem.className} {classItem.section ? `(${classItem.section})` : ''}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ধরন
                  </label>
                  <select
                    value={subjectForm.type}
                    onChange={(e) => setSubjectForm({...subjectForm, type: e.target.value as 'মূল' | 'ধর্মীয়' | 'ঐচ্ছিক'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="মূল">মূল</option>
                    <option value="ধর্মীয়">ধর্মীয়</option>
                    <option value="ঐচ্ছিক">ঐচ্ছিক</option>
                  </select>
                </div>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  বিবরণ
                </label>
                <textarea
                  value={subjectForm.description}
                  onChange={(e) => setSubjectForm({...subjectForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => {
                  setShowEditDialog(false);
                  setSelectedSubject(null);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                বাতিল করুন
              </button>
              <button
                onClick={handleEditSubject}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>আপডেট করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && selectedSubject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">বিষয় মুছে ফেলুন</h2>
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setSelectedSubject(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-700">
                    আপনি কি নিশ্চিত যে <strong>{selectedSubject.name}</strong> বিষয়টি মুছে ফেলতে চান?
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    এই কাজটি অপরিবর্তনীয় এবং সকল সম্পর্কিত ডেটা মুছে যাবে।
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setSelectedSubject(null);
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                বাতিল করুন
              </button>
              <button
                onClick={handleDeleteSubject}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>মুছে ফেলুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SubjectsPageWrapper() {
  return (
    <ProtectedRoute requireAuth={true}>
      <SubjectsPage />
    </ProtectedRoute>
  );
}