'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { SCHOOL_ID } from '@/lib/constants';
import {
  Users,
  UserCheck,
  GraduationCap,
  Building,
  CreditCard,
  TrendingUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { userQueries, accountingQueries, studentQueries, teacherQueries, parentQueries } from '@/lib/database-queries';

function AdminDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Dashboard state
  const [dashboardData, setDashboardData] = useState({
    students: 0,
    teachers: 0,
    parents: 0,
    totalIncome: 0,
    totalExpense: 0,
    maleStudents: 0,
    femaleStudents: 0,
    mosqueCount: 0,
    donationCollected: 0,
    donationSpent: 0,
    loading: true,
    lastUpdated: null as Date | null
  });

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const schoolId = SCHOOL_ID;

      // Fetch all data in parallel
      const [
        students,
        teachers,
        parents,
        financialSummary,
        studentStats
      ] = await Promise.all([
        studentQueries.getStudentsBySchool(schoolId),
        teacherQueries.getTeachersBySchool(schoolId),
        parentQueries.getParentsBySchool(schoolId),
        accountingQueries.getFinancialSummary(schoolId),
        studentQueries.getStudentStats(schoolId)
      ]);

      // Calculate donation amounts (transactions with category 'অনুদান')
      const allTransactions = await accountingQueries.getAllTransactions(schoolId);
      const donationTransactions = allTransactions.filter(t =>
        t.category === 'অনুদান' && t.status === 'completed'
      );

      const donationCollected = donationTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const donationSpent = donationTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      setDashboardData({
        students: students.length,
        teachers: teachers.length,
        parents: parents.length,
        totalIncome: financialSummary.totalIncome,
        totalExpense: financialSummary.totalExpense,
        maleStudents: studentStats.studentsByGender.male || 0,
        femaleStudents: studentStats.studentsByGender.female || 0,
        mosqueCount: 0, // This would need to be calculated from a different source
        donationCollected,
        donationSpent,
        loading: false,
        lastUpdated: new Date()
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  };

  // Auto-refresh every minute
  useEffect(() => {
    fetchDashboardData(); // Initial fetch

    const interval = setInterval(() => {
      fetchDashboardData();
    }, 60000); // 60000ms = 1 minute

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatBengaliDate = (date: Date) => {
    const bengaliMonths = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    return `${bengaliMonths[date.getMonth()]} ${date.getFullYear()}`;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const today = new Date().getDate();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today && 
                     currentDate.getMonth() === currentMonth && 
                     currentDate.getFullYear() === currentYear;
      
      days.push(
        <div
          key={day}
          className={`h-8 flex items-center justify-center text-sm cursor-pointer rounded ${
            isToday 
              ? 'bg-green-500 text-white font-bold'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          {day}
        </div>
      );
    }
    
    return days;
  };

  return (
    <AdminLayout title="সুপার অ্যাডমিন ড্যাশবোর্ড" subtitle="স্বাগতম! আপনার শিক্ষা প্রতিষ্ঠানের ড্যাশবোর্ড">
      {/* Dashboard Content */}
      <div className="space-y-6">
        {/* Last Updated and Refresh Button */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {dashboardData.lastUpdated && (
              <span>
                সর্বশেষ আপডেট: {dashboardData.lastUpdated.toLocaleTimeString('bn-BD')}
              </span>
            )}
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={dashboardData.loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {dashboardData.loading ? 'লোড হচ্ছে...' : 'রিফ্রেশ করুন'}
          </button>
        </div>
          {/* Top Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4 mb-4 lg:mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 lg:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">শিক্ষার্থী</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.loading ? '...' : dashboardData.students.toLocaleString('bn-BD')}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 lg:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">শিক্ষক</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.loading ? '...' : dashboardData.teachers.toLocaleString('bn-BD')}
                  </p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 lg:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">অভিভাবক</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.loading ? '...' : dashboardData.parents.toLocaleString('bn-BD')}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">মোট সংগৃহীত</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.loading ? '...' : dashboardData.totalIncome.toLocaleString('bn-BD')}
                  </p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 lg:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">খরচ</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.loading ? '...' : dashboardData.totalExpense.toLocaleString('bn-BD')}
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Second Row Stats */}
          <div className="mb-4 lg:mb-6">
            <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">শিক্ষার্থী এবং অনুদান সম্পর্কিত তথ্য</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">পুরুষ</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData.loading ? '...' : dashboardData.maleStudents.toLocaleString('bn-BD')}
                    </p>
                    <p className="text-xs text-gray-500">পুরুষ</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">মহিলা</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData.loading ? '...' : dashboardData.femaleStudents.toLocaleString('bn-BD')}
                    </p>
                    <p className="text-xs text-gray-500">মহিলা</p>
                  </div>
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-pink-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">মসজিদ</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData.loading ? '...' : dashboardData.mosqueCount.toLocaleString('bn-BD')}
                    </p>
                    <p className="text-xs text-gray-500">মসজিদ</p>
                  </div>
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Building className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">অনুদান সংগৃহীত</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData.loading ? '...' : dashboardData.donationCollected.toLocaleString('bn-BD')}
                    </p>
                    <p className="text-xs text-gray-500">অনুদান সংগৃহীত</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">অনুদান খরচ</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData.loading ? '...' : dashboardData.donationSpent.toLocaleString('bn-BD')}
                    </p>
                    <p className="text-xs text-gray-500">অনুদান খরচ</p>
                  </div>
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-red-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart and Calendar Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Revenue Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 lg:p-6 border-b border-gray-100">
                <h3 className="text-base lg:text-lg font-semibold text-gray-900">বেতন সংগ্রহ ও খরচ</h3>
              </div>
              <div className="p-4 lg:p-6">
                <div className="h-48 lg:h-64 flex items-end justify-between space-x-1 lg:space-x-2">
                  {/* Simple Bar Chart */}
                  <div className="flex flex-col items-center space-y-1 lg:space-y-2">
                    <div className="bg-gray-300 w-6 lg:w-8 h-6 lg:h-8 rounded-t"></div>
                    <span className="text-xs text-gray-600">জান</span>
                  </div>
                  <div className="flex flex-col items-center space-y-1 lg:space-y-2">
                    <div className="bg-gray-300 w-6 lg:w-8 h-8 lg:h-12 rounded-t"></div>
                    <span className="text-xs text-gray-600">ফেব</span>
                  </div>
                  <div className="flex flex-col items-center space-y-1 lg:space-y-2">
                    <div className="bg-gray-300 w-6 lg:w-8 h-10 lg:h-16 rounded-t"></div>
                    <span className="text-xs text-gray-600">মার</span>
                  </div>
                  <div className="flex flex-col items-center space-y-1 lg:space-y-2">
                    <div className="bg-gray-300 w-6 lg:w-8 h-12 lg:h-20 rounded-t"></div>
                    <span className="text-xs text-gray-600">এপ্র</span>
                  </div>
                  <div className="flex flex-col items-center space-y-1 lg:space-y-2">
                    <div className="bg-gray-300 w-6 lg:w-8 h-8 lg:h-12 rounded-t"></div>
                    <span className="text-xs text-gray-600">মে</span>
                  </div>
                  <div className="flex flex-col items-center space-y-1 lg:space-y-2">
                    <div className="bg-black w-6 lg:w-8 h-32 lg:h-48 rounded-t"></div>
                    <span className="text-xs text-gray-600">জুন</span>
                  </div>
                  <div className="flex flex-col items-center space-y-1 lg:space-y-2">
                    <div className="bg-orange-400 w-6 lg:w-8 h-20 lg:h-32 rounded-t"></div>
                    <span className="text-xs text-gray-600">জুল</span>
                  </div>
                  <div className="flex flex-col items-center space-y-1 lg:space-y-2">
                    <div className="bg-gray-300 w-6 lg:w-8 h-10 lg:h-16 rounded-t"></div>
                    <span className="text-xs text-gray-600">আগ</span>
                  </div>
                  <div className="flex flex-col items-center space-y-1 lg:space-y-2">
                    <div className="bg-gray-300 w-6 lg:w-8 h-12 lg:h-20 rounded-t"></div>
                    <span className="text-xs text-gray-600">সেপ</span>
                  </div>
                  <div className="flex flex-col items-center space-y-1 lg:space-y-2">
                    <div className="bg-gray-300 w-6 lg:w-8 h-8 lg:h-12 rounded-t"></div>
                    <span className="text-xs text-gray-600">অক্ট</span>
                  </div>
                  <div className="flex flex-col items-center space-y-1 lg:space-y-2">
                    <div className="bg-gray-300 w-6 lg:w-8 h-6 lg:h-8 rounded-t"></div>
                    <span className="text-xs text-gray-600">নভ</span>
                  </div>
                  <div className="flex flex-col items-center space-y-1 lg:space-y-2">
                    <div className="bg-gray-300 w-6 lg:w-8 h-10 lg:h-16 rounded-t"></div>
                    <span className="text-xs text-gray-600">ডিস</span>
                  </div>
                </div>
                <div className="flex items-center justify-center mt-4 space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-black rounded"></div>
                    <span className="text-sm text-gray-600">সংগ্রহ</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-400 rounded"></div>
                    <span className="text-sm text-gray-600">খরচ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-3 lg:p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900">ক্যালেন্ডার</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium text-gray-900">
                      {formatBengaliDate(currentDate)}
                    </span>
                    <button
                      onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-3 lg:p-4">
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'].map((day) => (
                    <div key={day} className="text-xs font-medium text-gray-600 text-center py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {renderCalendar()}
                </div>
              </div>
            </div>
          </div>
        </div>
    </AdminLayout>
  );
}

export default function AdminDashboardWrapper() {
  return (
    <ProtectedRoute requireAuth={true}>
      <AdminDashboard />
    </ProtectedRoute>
  );
}
