'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import AdminLayout from '@/components/AdminLayout';
import { examQueries, examResultQueries } from '@/lib/database-queries';
import {
  ArrowLeft, Download, Filter, Eye, Edit, Trash2, FileText, Award, BarChart3, Loader2
} from 'lucide-react';

function ExamResultsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = searchParams.get('examId');
  const schoolId = 'iqra-school-2025';

  // Sample data for demo
  const sampleResults = [
    {
      id: '1',
      studentName: 'মোঃ রাহিম হোসেন',
      studentId: '2025001',
      classId: '৫',
      obtainedMarks: 85,
      percentage: 85,
      grade: 'A+',
      status: 'পাস'
    },
    {
      id: '2',
      studentName: 'ফাতেমা আক্তার',
      studentId: '2025002',
      classId: '৫',
      obtainedMarks: 72,
      percentage: 72,
      grade: 'B+',
      status: 'পাস'
    },
    {
      id: '3',
      studentName: 'করিমুল হাসান',
      studentId: '2025003',
      classId: '৫',
      obtainedMarks: 45,
      percentage: 45,
      grade: 'C',
      status: 'পাস'
    }
  ];

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

  // Load exam and results from Firebase
  useEffect(() => {
    if (user && examId) {
      loadExamAndResults();
    }
  }, [user, examId]);

  // Load exam and results from Firebase
  const loadExamAndResults = async () => {
    try {
      setLoading(true);

      // Load exam details
      const examData = await examQueries.getExamById(examId!);
      if (examData) {
        setExam(examData);
      }

      // Load exam results
      const resultsData = await examResultQueries.getExamResults(examId!);
      setResults(resultsData);
    } catch (error) {
      console.error('Error loading exam and results:', error);
      alert('পরীক্ষা এবং ফলাফল লোড করতে ত্রুটি হয়েছে।');
    } finally {
      setLoading(false);
    }
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

  // Filter results based on search
  const filteredResults = results.filter(result =>
    result.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    result.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    result.classId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate grade based on marks
  const calculateGrade = (marks: number) => {
    if (marks >= 90) return { grade: 'A+', color: 'bg-green-100 text-green-800' };
    if (marks >= 80) return { grade: 'A', color: 'bg-green-100 text-green-800' };
    if (marks >= 70) return { grade: 'B+', color: 'bg-blue-100 text-blue-800' };
    if (marks >= 60) return { grade: 'B', color: 'bg-blue-100 text-blue-800' };
    if (marks >= 50) return { grade: 'C+', color: 'bg-yellow-100 text-yellow-800' };
    if (marks >= 40) return { grade: 'C', color: 'bg-yellow-100 text-yellow-800' };
    if (marks >= 33) return { grade: 'D', color: 'bg-orange-100 text-orange-800' };
    return { grade: 'F', color: 'bg-red-100 text-red-800' };
  };

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
            <h2 className="text-2xl font-bold text-gray-900">
              {exam?.name || 'পরীক্ষার ফলাফল'}
            </h2>
            <p className="text-gray-600">
              {exam ? `${exam.class} - ${exam.subject}` : 'পরীক্ষার ফলাফল দেখুন এবং পরিচালনা করুন'}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>ফলাফল ডাউনলোড করুন</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">ফলাফল তালিকা</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="ফলাফল খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  শিক্ষার্থীর নাম
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  আইডি
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ক্লাস
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  প্রাপ্ত নম্বর
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  গ্রেড
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  অবস্থা
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ক্রিয়াকলাপ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">কোনো ফলাফল পাওয়া যায়নি</h3>
                    <p className="mt-1 text-sm text-gray-500">ফলাফল যোগ করুন</p>
                  </td>
                </tr>
              ) : (
                filteredResults.map((result) => {
                  const gradeInfo = calculateGrade(result.obtainedMarks);
                  return (
                    <tr key={result.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{result.studentName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.studentId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.classId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {result.obtainedMarks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${gradeInfo.color}`}>
                          {gradeInfo.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          result.percentage >= 40 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {result.percentage >= 40 ? 'পাস' : 'ফেল'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            className="p-1 text-gray-400 hover:text-blue-600"
                            title="সম্পাদনা করুন"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function ExamResultsPageWrapper() {
  return (
    <AdminLayout title="ফলাফল" subtitle="পরীক্ষার ফলাফল">
      <ExamResultsPage />
    </AdminLayout>
  );
}
