'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import {
  Plus, Edit, Trash2, Eye, BookOpen as BookOpenIcon, ArrowLeft
} from 'lucide-react';

interface ExamSubject {
  id?: string;
  name: string;
  code: string;
  class: string;
  description: string;
  fullMarks: number;
  passMarks: number;
  createdAt: string;
  updatedAt: string;
}

function ExamSubjectsPage() {
  const [subjects, setSubjects] = useState<ExamSubject[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<ExamSubject | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newSubject, setNewSubject] = useState({
    name: '',
    code: '',
    class: '',
    description: '',
    fullMarks: 100,
    passMarks: 33
  });
  const router = useRouter();
  const schoolId = 'iqra-school-2025';

  // Sample data for demo
  const sampleSubjects = [
    {
      id: '1',
      name: 'বাংলা',
      code: 'BAN101',
      class: '৫',
      description: 'বাংলা ভাষা ও সাহিত্য',
      fullMarks: 100,
      passMarks: 33,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'গণিত',
      code: 'MATH101',
      class: '৫',
      description: 'পাটিগণিত ও বীজগণিত',
      fullMarks: 100,
      passMarks: 33,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Load sample data
  useState(() => {
    setSubjects(sampleSubjects);
  });

  // Add new subject
  const handleAddSubject = () => {
    if (!newSubject.name || !newSubject.code || !newSubject.class) {
      alert('অনুগ্রহ করে সকল তথ্য পূরণ করুন।');
      return;
    }

    const subject: ExamSubject = {
      id: Date.now().toString(),
      ...newSubject,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedSubjects = [...subjects, subject];
    setSubjects(updatedSubjects);
    setShowAddModal(false);
    setNewSubject({
      name: '',
      code: '',
      class: '',
      description: '',
      fullMarks: 100,
      passMarks: 33
    });
    alert('পরীক্ষার বিষয় সফলভাবে যোগ করা হয়েছে।');
  };

  // Delete subject
  const handleDeleteSubject = (subjectId: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই বিষয়টি মুছে ফেলতে চান?')) {
      return;
    }

    const updatedSubjects = subjects.filter(subject => subject.id !== subjectId);
    setSubjects(updatedSubjects);
    alert('পরীক্ষার বিষয় সফলভাবে মুছে ফেলা হয়েছে।');
  };

  // Filter subjects based on search
  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.class.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <h2 className="text-2xl font-bold text-gray-900">পরীক্ষার বিষয়সমূহ</h2>
            <p className="text-gray-600">পরীক্ষায় অন্তর্ভুক্ত বিষয়সমূহ যোগ করুন, সম্পাদনা করুন এবং পরিচালনা করুন।</p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন বিষয় যোগ করুন</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subjects Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">বিষয়সমূহ</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="বিষয় খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  বিষয়ের নাম
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  কোড
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ক্লাস
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  পূর্ণ নম্বর
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  পাস নম্বর
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ক্রিয়াকলাপ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">কোনো বিষয় পাওয়া যায়নি</h3>
                    <p className="mt-1 text-sm text-gray-500">নতুন বিষয় যোগ করুন</p>
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                      <div className="text-xs text-gray-500">{subject.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subject.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subject.class}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {subject.fullMarks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {subject.passMarks}
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
                          onClick={() => handleDeleteSubject(subject.id!)}
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

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">নতুন বিষয় যোগ করুন</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    বিষয়ের নাম *
                  </label>
                  <input
                    type="text"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="যেমন: বাংলা"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    বিষয় কোড *
                  </label>
                  <input
                    type="text"
                    value={newSubject.code}
                    onChange={(e) => setNewSubject({...newSubject, code: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="যেমন: BAN101"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ক্লাস *
                  </label>
                  <select
                    value={newSubject.class}
                    onChange={(e) => setNewSubject({...newSubject, class: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    বিবরণ
                  </label>
                  <textarea
                    value={newSubject.description}
                    onChange={(e) => setNewSubject({...newSubject, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="বিষয়ের সংক্ষিপ্ত বিবরণ"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      পূর্ণ নম্বর
                    </label>
                    <input
                      type="number"
                      value={newSubject.fullMarks}
                      onChange={(e) => setNewSubject({...newSubject, fullMarks: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      পাস নম্বর
                    </label>
                    <input
                      type="number"
                      value={newSubject.passMarks}
                      onChange={(e) => setNewSubject({...newSubject, passMarks: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  onClick={handleAddSubject}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
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

export default function ExamSubjectsPageWrapper() {
  return (
    <AdminLayout title="পরীক্ষার বিষয়" subtitle="পরীক্ষার বিষয়সমূহ">
      <ExamSubjectsPage />
    </AdminLayout>
  );
}
