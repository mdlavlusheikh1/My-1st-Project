'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import AdminLayout from '@/components/AdminLayout';
import { examQueries } from '@/lib/database-queries';
import {
  ArrowLeft, Save, Edit, Trash2, FileText, Award, BarChart3, Loader2, Plus, DollarSign
} from 'lucide-react';

function ExamManagePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingExam, setEditingExam] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExam, setNewExam] = useState({
    name: '',
    startDate: '',
    endDate: '',
    examType: 'সাময়িক'
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = searchParams.get('examId');
  const schoolId = 'IQRA-202531';


  // Authentication check
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

  // Load exams from Firebase
  useEffect(() => {
    if (user) {
      loadExams();
    }
  }, [user]);

  // Load exams from Firebase
  const loadExams = async () => {
    try {
      setLoading(true);
      const examsData = await examQueries.getAllExams(schoolId);
      setExams(examsData);
    } catch (error) {
      console.error('Error loading exams:', error);
      alert('পরীক্ষা লোড করতে ত্রুটি হয়েছে।');
    } finally {
      setLoading(false);
    }
  };


  // Delete exam
  const handleDeleteExam = async (examId: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই পরীক্ষা মুছে ফেলতে চান?')) {
      try {
        await examQueries.deleteExam(examId);
        alert('পরীক্ষা সফলভাবে মুছে ফেলা হয়েছে');
        loadExams(); // Reload the list
      } catch (error) {
        console.error('Error deleting exam:', error);
        alert('পরীক্ষা মুছে ফেলতে ত্রুটি হয়েছে।');
      }
    }
  };

  // Add new exam
  const handleAddExam = async () => {
    try {
      const examData = {
        name: newExam.name,
        class: 'সাধারণ', // Default class since removed from form
        subject: 'সাধারণ', // Default subject since removed from form
        startDate: newExam.startDate,
        endDate: newExam.endDate,
        date: newExam.startDate,
        time: '10:00',
        duration: '2 ঘণ্টা',
        totalMarks: 100,
        students: 0,
        status: 'সক্রিয়' as const,
        schoolId,
        createdBy: user?.email || 'admin',
        resultsPublished: false,
        allowResultView: false,
        examType: newExam.examType as any,
        passingMarks: 40,
        gradingSystem: 'percentage' as const
      };

      await examQueries.createExam(examData);
      alert(`নতুন পরীক্ষা "${newExam.name}" সফলভাবে যোগ করা হয়েছে।`);
      loadExams(); // Reload the list
    } catch (error) {
      console.error('Error creating exam:', error);
      alert('পরীক্ষা তৈরি করতে ত্রুটি হয়েছে।');
    }
  };

  // Toggle result publication
  const toggleResultPublication = async (examId: string, currentStatus: boolean) => {
    try {
      await examQueries.toggleResultPublication(examId, !currentStatus, user?.email || 'admin');
      alert(currentStatus ? 'ফলাফল গোপন করা হয়েছে' : 'ফলাফল প্রকাশ করা হয়েছে');
      loadExams(); // Reload the list to show updated status
    } catch (error) {
      console.error('Error toggling result publication:', error);
      alert('ফলাফল প্রকাশনা টগল করতে ত্রুটি হয়েছে।');
    }
  };

  // Filter exams based on search
  const filteredExams = exams.filter(exam =>
    exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exam.class.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">লোড হচ্ছে...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <button
                onClick={() => router.push('/admin/exams')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>পিছনে যান</span>
              </button>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">পরীক্ষা পরিচালনা করুন</h2>
            <p className="text-gray-600 mt-1">
              নতুন পরীক্ষা তৈরি করুন, সম্পাদনা করুন এবং পরীক্ষা ব্যবস্থাপনা করুন।
            </p>
            <div className="mt-4">
              <button
                onClick={() => router.push('/admin/exams/exam-fee-management')}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                পরীক্ষার ফি ম্যানেজমেন্ট
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* Existing Exams Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">বিদ্যমান পরীক্ষাসমূহ</h3>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>পরীক্ষা যোগ করুন</span>
              </button>
              <div className="relative">
                <input
                  type="text"
                  placeholder="পরীক্ষা খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  পরীক্ষার নাম
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  তারিখ
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ফলাফল প্রকাশ
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ক্রিয়াকলাপ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExams.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">কোনো পরীক্ষা পাওয়া যায়নি</h3>
                    <p className="mt-1 text-sm text-gray-500">নতুন পরীক্ষা যোগ করার জন্য অন্য পৃষ্ঠায় যান</p>
                  </td>
                </tr>
              ) : (
                filteredExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{exam.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(exam.startDate)} - {formatDate(exam.endDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => toggleResultPublication(exam.id!, exam.resultsPublished)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                          exam.resultsPublished ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                        title={exam.resultsPublished ? 'ফলাফল প্রকাশিত' : 'ফলাফল গোপন'}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            exam.resultsPublished ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      {exam.resultsPublished && (
                        <div className="text-xs text-green-600 mt-1 flex items-center justify-center">
                          <Award className="w-3 h-3 mr-1" />
                          প্রকাশিত
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => router.push('/admin/exams/exam-fee-management')}
                          className="p-1 text-gray-400 hover:text-purple-600"
                          title="ফি ম্যানেজমেন্ট"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/exams/results?examId=${exam.id}`)}
                          className="p-1 text-gray-400 hover:text-green-600"
                          title="ফলাফল দেখুন"
                        >
                          <Award className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingExam(exam)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="সম্পাদনা করুন"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExam(exam.id!)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Exam Modal Dialog */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-[600px] max-w-[90%] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">নতুন পরীক্ষা যোগ করুন</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      পরীক্ষার নাম *
                    </label>
                    <input
                      type="text"
                      value={newExam.name}
                      onChange={(e) => setNewExam({...newExam, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="যেমন: প্রথম সাময়িক পরীক্ষা"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      পরীক্ষার ধরন *
                    </label>
                    <select
                      value={newExam.examType}
                      onChange={(e) => setNewExam({...newExam, examType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="প্রথম সাময়িক">প্রথম সাময়িক</option>
                      <option value="দ্বিতীয় সাময়িক">দ্বিতীয় সাময়িক</option>
                      <option value="তৃতীয় সাময়িক">তৃতীয় সাময়িক</option>
                      <option value="বার্ষিক">বার্ষিক</option>
                      <option value="মাসিক">মাসিক</option>
                      <option value="নির্বাচনী">নির্বাচনী</option>
                      <option value="পরীক্ষামূলক">পরীক্ষামূলক</option>
                      <option value="অন্যান্য">অন্যান্য</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      শুরুর তারিখ *
                    </label>
                    <input
                      type="date"
                      value={newExam.startDate}
                      onChange={(e) => setNewExam({...newExam, startDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      শেষের তারিখ *
                    </label>
                    <input
                      type="date"
                      value={newExam.endDate}
                      onChange={(e) => setNewExam({...newExam, endDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  বাতিল করুন
                </button>
                <button
                  onClick={() => {
                    // Handle form submission
                    if (!newExam.name || !newExam.startDate || !newExam.endDate) {
                      alert('অনুগ্রহ করে সকল তথ্য পূরণ করুন।');
                      return;
                    }

                    // Save to Firebase
                    handleAddExam();

                    // Reset form and close modal
                    setNewExam({
                      name: '',
                      startDate: '',
                      endDate: '',
                      examType: 'সাময়িক'
                    });
                    setShowAddModal(false);
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  তৈরি করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExamManagePageWrapper() {
  return (
    <AdminLayout title="পরীক্ষা পরিচালনা করুন" subtitle="আপনার প্রতিষ্ঠানের সকল পরীক্ষা যোগ, সম্পাদনা এবং পরিচালনা করুন।">
      <ExamManagePage />
    </AdminLayout>
  );
}
