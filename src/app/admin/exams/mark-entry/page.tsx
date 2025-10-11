'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import {
  Plus, Edit, Trash2, Eye, FileText, Upload, ArrowLeft, Download
} from 'lucide-react';

interface MarkEntry {
  id?: string;
  studentId: string;
  studentName: string;
  class: string;
  subject: string;
  examName: string;
  obtainedMarks: number;
  fullMarks: number;
  percentage: number;
  grade: string;
  status: 'পাস' | 'ফেল';
  entryDate: string;
  enteredBy: string;
}

function MarkEntryPage() {
  const [markEntries, setMarkEntries] = useState<MarkEntry[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [newEntry, setNewEntry] = useState({
    studentId: '',
    studentName: '',
    class: '',
    subject: '',
    examName: '',
    obtainedMarks: 0,
    fullMarks: 100
  });
  const router = useRouter();
  const schoolId = 'iqra-school-2025';

  // Sample data for demo
  const sampleEntries = [
    {
      id: '1',
      studentId: '2025001',
      studentName: 'মোঃ রাহিম হোসেন',
      class: '৫',
      subject: 'বাংলা',
      examName: 'প্রথম সাময়িক পরীক্ষা',
      obtainedMarks: 85,
      fullMarks: 100,
      percentage: 85,
      grade: 'A+',
      status: 'পাস' as const,
      entryDate: new Date().toISOString(),
      enteredBy: 'admin'
    },
    {
      id: '2',
      studentId: '2025002',
      studentName: 'ফাতেমা আক্তার',
      class: '৫',
      subject: 'গণিত',
      examName: 'প্রথম সাময়িক পরীক্ষা',
      obtainedMarks: 72,
      fullMarks: 100,
      percentage: 72,
      grade: 'B+',
      status: 'পাস' as const,
      entryDate: new Date().toISOString(),
      enteredBy: 'admin'
    }
  ];

  // Load sample data
  useEffect(() => {
    setMarkEntries(sampleEntries);
  }, []);

  // Calculate grade and percentage
  const calculateGrade = (marks: number, fullMarks: number) => {
    const percentage = (marks / fullMarks) * 100;
    if (percentage >= 90) return { grade: 'A+', percentage: Math.round(percentage) };
    if (percentage >= 80) return { grade: 'A', percentage: Math.round(percentage) };
    if (percentage >= 70) return { grade: 'B+', percentage: Math.round(percentage) };
    if (percentage >= 60) return { grade: 'B', percentage: Math.round(percentage) };
    if (percentage >= 50) return { grade: 'C+', percentage: Math.round(percentage) };
    if (percentage >= 40) return { grade: 'C', percentage: Math.round(percentage) };
    if (percentage >= 33) return { grade: 'D', percentage: Math.round(percentage) };
    return { grade: 'F', percentage: Math.round(percentage) };
  };

  // Add new mark entry
  const handleAddEntry = () => {
    if (!newEntry.studentId || !newEntry.studentName || !newEntry.class || !newEntry.subject || !newEntry.examName) {
      alert('অনুগ্রহ করে সকল তথ্য পূরণ করুন।');
      return;
    }

    if (newEntry.obtainedMarks > newEntry.fullMarks) {
      alert('প্রাপ্ত নম্বর পূর্ণ নম্বরের চেয়ে বেশি হতে পারে না।');
      return;
    }

    const { grade, percentage } = calculateGrade(newEntry.obtainedMarks, newEntry.fullMarks);
    const status = percentage >= 40 ? 'পাস' : 'ফেল';

    const entry: MarkEntry = {
      id: Date.now().toString(),
      ...newEntry,
      percentage,
      grade,
      status,
      entryDate: new Date().toISOString(),
      enteredBy: 'admin'
    };

    const updatedEntries = [...markEntries, entry];
    setMarkEntries(updatedEntries);
    setShowAddModal(false);
    setNewEntry({
      studentId: '',
      studentName: '',
      class: '',
      subject: '',
      examName: '',
      obtainedMarks: 0,
      fullMarks: 100
    });
    alert('মার্ক এন্ট্রি সফলভাবে যোগ করা হয়েছে।');
  };

  // Delete mark entry
  const handleDeleteEntry = (entryId: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই মার্ক এন্ট্রিটি মুছে ফেলতে চান?')) {
      return;
    }

    const updatedEntries = markEntries.filter(entry => entry.id !== entryId);
    setMarkEntries(updatedEntries);
    alert('মার্ক এন্ট্রি সফলভাবে মুছে ফেলা হয়েছে।');
  };

  // Filter entries based on search and filters
  const filteredEntries = markEntries.filter(entry => {
    const matchesSearch =
      entry.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClass = !selectedClass || entry.class === selectedClass;
    const matchesSubject = !selectedSubject || entry.subject === selectedSubject;
    const matchesExam = !selectedExam || entry.examName === selectedExam;

    return matchesSearch && matchesClass && matchesSubject && matchesExam;
  });

  // Get unique values for filter dropdowns
  const classes = [...new Set(markEntries.map(entry => entry.class))];
  const subjects = [...new Set(markEntries.map(entry => entry.subject))];
  const exams = [...new Set(markEntries.map(entry => entry.examName))];

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
            <h2 className="text-2xl font-bold text-gray-900">মার্ক এন্ট্রি</h2>
            <p className="text-gray-600">শিক্ষার্থীদের পরীক্ষার নম্বর এন্ট্রি করুন, সম্পাদনা করুন এবং পরিচালনা করুন।</p>
          </div>

          <div className="flex items-center space-x-3">
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>বাল্ক আপলোড</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন এন্ট্রি যোগ করুন</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ক্লাস</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">সকল ক্লাস</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">বিষয়</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">সকল বিষয়</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">পরীক্ষা</label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">সকল পরীক্ষা</option>
              {exams.map(exam => (
                <option key={exam} value={exam}>{exam}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedClass('');
                setSelectedSubject('');
                setSelectedExam('');
                setSearchQuery('');
              }}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
            >
              ফিল্টার রিসেট করুন
            </button>
          </div>
        </div>
      </div>

      {/* Mark Entries Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">মার্ক এন্ট্রিসমূহ</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="শিক্ষার্থী খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  শিক্ষার্থী
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  আইডি
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ক্লাস
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  বিষয়
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  পরীক্ষা
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  প্রাপ্ত নম্বর
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  শতাংশ
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
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">কোনো মার্ক এন্ট্রি পাওয়া যায়নি</h3>
                    <p className="mt-1 text-sm text-gray-500">নতুন মার্ক এন্ট্রি যোগ করুন</p>
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{entry.studentName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.studentId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.class}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.examName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {entry.obtainedMarks}/{entry.fullMarks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {entry.percentage}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        entry.grade.includes('A') ? 'bg-green-100 text-green-800' :
                        entry.grade.includes('B') ? 'bg-blue-100 text-blue-800' :
                        entry.grade.includes('C') ? 'bg-yellow-100 text-yellow-800' :
                        entry.grade.includes('D') ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {entry.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        entry.status === 'পাস' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {entry.status}
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
                          onClick={() => handleDeleteEntry(entry.id!)}
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

      {/* Add Mark Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">নতুন মার্ক এন্ট্রি যোগ করুন</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      শিক্ষার্থী আইডি *
                    </label>
                    <input
                      type="text"
                      value={newEntry.studentId}
                      onChange={(e) => setNewEntry({...newEntry, studentId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="যেমন: 2025001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      শিক্ষার্থীর নাম *
                    </label>
                    <input
                      type="text"
                      value={newEntry.studentName}
                      onChange={(e) => setNewEntry({...newEntry, studentName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="যেমন: আব্দুল্লাহ"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ক্লাস *
                    </label>
                    <select
                      value={newEntry.class}
                      onChange={(e) => setNewEntry({...newEntry, class: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">ক্লাস নির্বাচন করুন</option>
                      <option value="১">ক্লাস ১</option>
                      <option value="২">ক্লাস ২</option>
                      <option value="৩">ক্লাস ৩</option>
                      <option value="৪">ক্লাস ৪</option>
                      <option value="৫">ক্লাস ৫</option>
                      <option value="৬">ক্লাস ৬</option>
                      <option value="৭">ক্লাস ৭</option>
                      <option value="৮">ক্লাস ৮</option>
                      <option value="৯">ক্লাস ৯</option>
                      <option value="১০">ক্লাস ১০</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      বিষয় *
                    </label>
                    <input
                      type="text"
                      value={newEntry.subject}
                      onChange={(e) => setNewEntry({...newEntry, subject: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="যেমন: বাংলা"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      পরীক্ষার নাম *
                    </label>
                    <input
                      type="text"
                      value={newEntry.examName}
                      onChange={(e) => setNewEntry({...newEntry, examName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="যেমন: প্রথম সাময়িক"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      প্রাপ্ত নম্বর *
                    </label>
                    <input
                      type="number"
                      value={newEntry.obtainedMarks}
                      onChange={(e) => setNewEntry({...newEntry, obtainedMarks: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      min="0"
                      max={newEntry.fullMarks}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      পূর্ণ নম্বর
                    </label>
                    <input
                      type="number"
                      value={newEntry.fullMarks}
                      onChange={(e) => setNewEntry({...newEntry, fullMarks: parseInt(e.target.value) || 100})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  বাতিল করুন
                </button>
                <button
                  onClick={handleAddEntry}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  যোগ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MarkEntryPageWrapper() {
  return (
    <AdminLayout title="মার্ক এন্ট্রি" subtitle="পরীক্ষার মার্ক এন্ট্রি">
      <MarkEntryPage />
    </AdminLayout>
  );
}
