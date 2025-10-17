'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { SCHOOL_ID } from '@/lib/constants';
import {
  TrendingUp as TrendingUpIcon, AlertCircle, CheckCircle2, XCircle as XCircleIcon,
  ArrowLeft, BarChart3, User as UserIcon
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  studentId: string;
  currentClass: string;
  section: string;
  rollNo: string;
  status: 'প্রমোশনের জন্য যোগ্য' | 'প্রমোশনের জন্য অযোগ্য' | 'শর্তসাপেক্ষে প্রমোশন' | 'প্রমোশন সম্পন্ন';
  averageMarks: number;
  totalExams: number;
  passedExams: number;
  failedSubjects: string[];
  nextClass: string;
  promotionDate?: string;
  promotedBy?: string;
}

function PromotionPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [promotionSettings, setPromotionSettings] = useState({
    autoPromote: true,
    minAverageMarks: 40,
    maxFailedSubjects: 2,
    requireAllSubjectsPass: false
  });
  const router = useRouter();
  const schoolId = SCHOOL_ID;

  // Sample data for demo
  const sampleStudents: Student[] = [
    {
      id: '1',
      name: 'আব্দুল্লাহ আল মামুন',
      studentId: '2025001',
      currentClass: '৫',
      section: 'A',
      rollNo: '01',
      status: 'প্রমোশনের জন্য যোগ্য',
      averageMarks: 85,
      totalExams: 5,
      passedExams: 5,
      failedSubjects: [],
      nextClass: '৬'
    },
    {
      id: '2',
      name: 'ফাতিমা খান',
      studentId: '2025002',
      currentClass: '৫',
      section: 'A',
      rollNo: '02',
      status: 'প্রমোশনের জন্য যোগ্য',
      averageMarks: 78,
      totalExams: 5,
      passedExams: 5,
      failedSubjects: [],
      nextClass: '৬'
    },
    {
      id: '3',
      name: 'রাহিম হোসেন',
      studentId: '2025003',
      currentClass: '৫',
      section: 'A',
      rollNo: '03',
      status: 'শর্তসাপেক্ষে প্রমোশন',
      averageMarks: 45,
      totalExams: 5,
      passedExams: 3,
      failedSubjects: ['গণিত', 'বিজ্ঞান'],
      nextClass: '৬'
    },
    {
      id: '4',
      name: 'মরিয়ম বেগম',
      studentId: '2025004',
      currentClass: '৫',
      section: 'A',
      rollNo: '04',
      status: 'প্রমোশনের জন্য অযোগ্য',
      averageMarks: 32,
      totalExams: 5,
      passedExams: 1,
      failedSubjects: ['বাংলা', 'গণিত', 'ইংরেজি', 'বিজ্ঞান'],
      nextClass: '৫'
    }
  ];

  // Load sample data
  useEffect(() => {
    setStudents(sampleStudents);
  }, []);

  // Promote selected students
  const handlePromoteStudents = async () => {
    if (selectedStudents.length === 0) {
      alert('অনুগ্রহ করে প্রমোশনের জন্য শিক্ষার্থী নির্বাচন করুন।');
      return;
    }

    try {
      const updatedStudents = students.map(student => {
        if (selectedStudents.includes(student.id)) {
          return {
            ...student,
            status: 'প্রমোশন সম্পন্ন' as const,
            promotionDate: new Date().toISOString(),
            promotedBy: 'admin'
          };
        }
        return student;
      });

      setStudents(updatedStudents);
      setSelectedStudents([]);
      setShowPromotionModal(false);
      alert(`${selectedStudents.length} জন শিক্ষার্থীকে সফলভাবে প্রমোশন দেওয়া হয়েছে।`);

    } catch (error) {
      console.error('Promotion error:', error);
      alert('প্রমোশন প্রক্রিয়ায় ত্রুটি হয়েছে।');
    }
  };

  // Auto-evaluate students for promotion
  const handleAutoEvaluate = () => {
    const updatedStudents = students.map(student => {
      let status: Student['status'] = 'প্রমোশনের জন্য অযোগ্য';
      let nextClass = student.currentClass;

      if (student.averageMarks >= promotionSettings.minAverageMarks &&
          student.failedSubjects.length <= promotionSettings.maxFailedSubjects) {
        if (student.failedSubjects.length === 0) {
          status = 'প্রমোশনের জন্য যোগ্য';
        } else {
          status = 'শর্তসাপেক্ষে প্রমোশন';
        }

        // Determine next class
        const currentClassNum = parseInt(student.currentClass);
        if (currentClassNum >= 1 && currentClassNum < 10) {
          nextClass = (currentClassNum + 1).toString();
        }
      }

      return {
        ...student,
        status,
        nextClass
      };
    });

    setStudents(updatedStudents);
    alert('সকল শিক্ষার্থীর প্রমোশন যোগ্যতা পুনঃমূল্যায়ন করা হয়েছে।');
  };

  // Filter students based on search and filters
  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClass = !selectedClass || student.currentClass === selectedClass;
    const matchesStatus = !selectedStatus || student.status === selectedStatus;

    return matchesSearch && matchesClass && matchesStatus;
  });

  // Get unique values for filter dropdowns
  const classes = [...new Set(students.map(student => student.currentClass))];
  const statuses = [...new Set(students.map(student => student.status))];

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
            <h2 className="text-2xl font-bold text-gray-900">শিক্ষার্থী প্রমোশন</h2>
            <p className="text-gray-600">শিক্ষার্থীদের পরবর্তী ক্লাসে প্রমোশন দিন এবং প্রমোশন সংক্রান্ত তথ্য পরিচালনা করুন।</p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleAutoEvaluate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span>অটো ইভালুয়েশন</span>
            </button>
            <button
              onClick={() => setShowPromotionModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
            >
              <TrendingUpIcon className="w-4 h-4" />
              <span>প্রমোশন দিন</span>
            </button>
          </div>
        </div>
      </div>

      {/* Promotion Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">প্রমোশন সেটিংস</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ন্যূনতম গড় নম্বর
            </label>
            <input
              type="number"
              value={promotionSettings.minAverageMarks}
              onChange={(e) => setPromotionSettings({...promotionSettings, minAverageMarks: parseInt(e.target.value) || 0})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              min="0"
              max="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              সর্বাধিক ফেল সাবজেক্ট
            </label>
            <input
              type="number"
              value={promotionSettings.maxFailedSubjects}
              onChange={(e) => setPromotionSettings({...promotionSettings, maxFailedSubjects: parseInt(e.target.value) || 0})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              min="0"
              max="10"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="requireAllSubjectsPass"
              checked={promotionSettings.requireAllSubjectsPass}
              onChange={(e) => setPromotionSettings({...promotionSettings, requireAllSubjectsPass: e.target.checked})}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="requireAllSubjectsPass" className="ml-2 text-sm text-gray-700">
              সকল সাবজেক্টে পাস আবশ্যক
            </label>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ক্লাস</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">সকল ক্লাস</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>ক্লাস {cls}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">প্রমোশন স্ট্যাটাস</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">সকল স্ট্যাটাস</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedClass('');
                setSelectedStatus('');
                setSearchQuery('');
              }}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
            >
              ফিল্টার রিসেট করুন
            </button>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">শিক্ষার্থী তালিকা</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="শিক্ষার্থী খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedStudents.length === filteredStudents.filter(s => s.status !== 'প্রমোশন সম্পন্ন').length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudents(filteredStudents.filter(s => s.status !== 'প্রমোশন সম্পন্ন').map(s => s.id));
                      } else {
                        setSelectedStudents([]);
                      }
                    }}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  শিক্ষার্থী
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  আইডি
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  বর্তমান ক্লাস
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  গড় নম্বর
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ফেল সাবজেক্ট
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  পরবর্তী ক্লাস
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  স্ট্যাটাস
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">কোনো শিক্ষার্থী পাওয়া যায়নি</h3>
                    <p className="mt-1 text-sm text-gray-500">শিক্ষার্থী যোগ করুন</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.status !== 'প্রমোশন সম্পন্ন' && (
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudents([...selectedStudents, student.id]);
                            } else {
                              setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                            }
                          }}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      <div className="text-xs text-gray-500">রোল: {student.rollNo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.studentId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ক্লাস {student.currentClass} ({student.section})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {student.averageMarks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {student.failedSubjects.length > 0 ? student.failedSubjects.join(', ') : 'কোনোটি নেই'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      ক্লাস {student.nextClass}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.status === 'প্রমোশনের জন্য যোগ্য' ? 'bg-green-100 text-green-800' :
                        student.status === 'শর্তসাপেক্ষে প্রমোশন' ? 'bg-yellow-100 text-yellow-800' :
                        student.status === 'প্রমোশনের জন্য অযোগ্য' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {student.status === 'প্রমোশনের জন্য যোগ্য' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {student.status === 'প্রমোশনের জন্য অযোগ্য' && <XCircleIcon className="w-3 h-3 mr-1" />}
                        {student.status === 'শর্তসাপেক্ষে প্রমোশন' && <AlertCircle className="w-3 h-3 mr-1" />}
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Promotion Modal */}
      {showPromotionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">শিক্ষার্থীদের প্রমোশন দিন</h3>

              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">প্রমোশন তথ্য:</p>
                      <p>নির্বাচিত শিক্ষার্থী: {selectedStudents.length} জন</p>
                      <p>প্রমোশন তারিখ: {new Date().toLocaleDateString('bn-BD')}</p>
                      <p>প্রমোশন দিচ্ছেন: admin</p>
                    </div>
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto">
                  <h4 className="font-medium text-gray-900 mb-2">নির্বাচিত শিক্ষার্থীদের তালিকা:</h4>
                  <div className="space-y-2">
                    {students.filter(student => selectedStudents.includes(student.id)).map(student => (
                      <div key={student.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium">{student.name}</span>
                          <span className="text-sm text-gray-600 ml-2">({student.studentId})</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {student.currentClass} → {student.nextClass}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowPromotionModal(false);
                    setSelectedStudents([]);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  বাতিল করুন
                </button>
                <button
                  onClick={handlePromoteStudents}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center space-x-2"
                >
                  <TrendingUpIcon className="w-4 h-4" />
                  <span>প্রমোশন দিন</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PromotionPageWrapper() {
  return (
    <AdminLayout title="প্রমোশন" subtitle="শিক্ষার্থী প্রমোশন">
      <PromotionPage />
    </AdminLayout>
  );
}
