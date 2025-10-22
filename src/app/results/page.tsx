'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Award, Search, Filter, ChevronDown, ChevronUp, Download, Eye, Calendar, User, BookOpen, TrendingUp, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface ExamResult {
  id: string;
  studentName: string;
  studentId: string;
  class: string;
  examName: string;
  examType: string;
  examDate: string;
  subjects: {
    subject: string;
    obtainedMarks: number;
    totalMarks: number;
    grade: string;
    gpa: number;
  }[];
  totalObtainedMarks: number;
  totalMarks: number;
  overallGPA: number;
  overallGrade: string;
  position: number;
  status: 'pass' | 'fail';
  remarks: string;
}

const PublicResultsPage = () => {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [formData, setFormData] = useState({
    examination: '',
    year: '',
    board: '',
    roll: '',
    regNo: '',
    captcha: ''
  });
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, answer: 0 });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [expandedResult, setExpandedResult] = useState<string | null>(null);

  // Sample data
  const sampleResults: ExamResult[] = [
    {
      id: '1',
      studentName: 'মোহাম্মদ আব্দুল্লাহ আল মামুন',
      studentId: 'STD001',
      class: '১০ম শ্রেণি',
      examName: 'মধ্যবর্তী পরীক্ষা ২০২৪',
      examType: 'মধ্যবর্তী',
      examDate: '2024-12-15',
      subjects: [
        { subject: 'গণিত', obtainedMarks: 85, totalMarks: 100, grade: 'A+', gpa: 5.0 },
        { subject: 'ইংরেজি', obtainedMarks: 78, totalMarks: 100, grade: 'A', gpa: 4.0 },
        { subject: 'বিজ্ঞান', obtainedMarks: 92, totalMarks: 100, grade: 'A+', gpa: 5.0 },
        { subject: 'বাংলা', obtainedMarks: 88, totalMarks: 100, grade: 'A+', gpa: 5.0 }
      ],
      totalObtainedMarks: 343,
      totalMarks: 400,
      overallGPA: 4.75,
      overallGrade: 'A+',
      position: 1,
      status: 'pass',
      remarks: 'অত্যন্ত ভালো ফলাফল'
    },
    {
      id: '2',
      studentName: 'ফাতেমা আক্তার',
      studentId: 'STD002',
      class: '১০ম শ্রেণি',
      examName: 'মধ্যবর্তী পরীক্ষা ২০২৪',
      examType: 'মধ্যবর্তী',
      examDate: '2024-12-15',
      subjects: [
        { subject: 'গণিত', obtainedMarks: 78, totalMarks: 100, grade: 'A', gpa: 4.0 },
        { subject: 'ইংরেজি', obtainedMarks: 82, totalMarks: 100, grade: 'A+', gpa: 5.0 },
        { subject: 'বিজ্ঞান', obtainedMarks: 85, totalMarks: 100, grade: 'A+', gpa: 5.0 },
        { subject: 'বাংলা', obtainedMarks: 80, totalMarks: 100, grade: 'A', gpa: 4.0 }
      ],
      totalObtainedMarks: 325,
      totalMarks: 400,
      overallGPA: 4.5,
      overallGrade: 'A+',
      position: 2,
      status: 'pass',
      remarks: 'ভালো ফলাফল'
    }
  ];

  const examinations = [
    'এসএসসি/দাখিল/সমমান',
    'এইচএসসি/আলিম/সমমান',
    'জেএসসি/জেডিসি',
    'পিইসি/ইবতেদায়ী'
  ];

  const years = [
    'নির্বাচন করুন',
    '২০২৪',
    '২০২৩',
    '২০২২',
    '২০২১',
    '২০২০'
  ];

  const boards = [
    'নির্বাচন করুন',
    'ঢাকা',
    'চট্টগ্রাম',
    'রাজশাহী',
    'কুমিল্লা',
    'সিলেট',
    'বরিশাল',
    'যশোর',
    'দিনাজপুর',
    'মাদ্রাসা',
    'কারিগরি'
  ];

  // Generate captcha
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptcha({ num1, num2, answer: num1 + num2 });
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.examination) {
      newErrors.examination = 'পরীক্ষা নির্বাচন করুন';
    }
    if (!formData.year || formData.year === 'নির্বাচন করুন') {
      newErrors.year = 'বছর নির্বাচন করুন';
    }
    if (!formData.board || formData.board === 'নির্বাচন করুন') {
      newErrors.board = 'বোর্ড নির্বাচন করুন';
    }
    if (!formData.roll.trim()) {
      newErrors.roll = 'রোল নম্বর প্রয়োজন';
    }
    if (!formData.regNo.trim()) {
      newErrors.regNo = 'রেজিস্ট্রেশন নম্বর প্রয়োজন';
    }
    if (!formData.captcha.trim()) {
      newErrors.captcha = 'ক্যাপচা উত্তর প্রয়োজন';
    } else if (parseInt(formData.captcha) !== captcha.answer) {
      newErrors.captcha = 'ভুল ক্যাপচা উত্তর';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSearching(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Filter results based on form data
      const filtered = sampleResults.filter(result => 
        result.studentId === formData.roll || 
        result.studentName.toLowerCase().includes(formData.roll.toLowerCase())
      );
      
      setResults(filtered);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching results:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleReset = () => {
    setFormData({
      examination: '',
      year: '',
      board: '',
      roll: '',
      regNo: '',
      captcha: ''
    });
    setErrors({});
    setShowResults(false);
    setResults([]);
    generateCaptcha();
  };

  const getStatusColor = (status: string) => {
    try {
      if (!status) return 'text-gray-600 bg-gray-100';
      switch (status) {
        case 'pass': return 'text-green-600 bg-green-100';
        case 'fail': return 'text-red-600 bg-red-100';
        default: return 'text-gray-600 bg-gray-100';
      }
    } catch (error) {
      console.error('Error in getStatusColor:', error);
      return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pass': return 'Pass';
      case 'fail': return 'Fail';
      default: return status;
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.includes('A+')) return 'text-green-600 bg-green-100';
    if (grade.includes('A')) return 'text-blue-600 bg-blue-100';
    if (grade.includes('B+')) return 'text-yellow-600 bg-yellow-100';
    if (grade.includes('B')) return 'text-orange-600 bg-orange-100';
    return 'text-gray-600 bg-gray-100';
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'No date';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date formatting error';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Award className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">পরীক্ষার ফলাফল</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              নিচের তথ্যগুলো দিয়ে আপনার পরীক্ষার ফলাফল দেখুন
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Examination */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  পরীক্ষা :
                </label>
                <select
                  value={formData.examination}
                  onChange={(e) => handleInputChange('examination', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.examination ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">পরীক্ষা নির্বাচন করুন</option>
                  {examinations.map((exam) => (
                    <option key={exam} value={exam}>
                      {exam}
                    </option>
                  ))}
                </select>
                {errors.examination && (
                  <p className="text-red-600 text-sm mt-1">{errors.examination}</p>
                )}
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  বছর :
                </label>
                <select
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.year ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                {errors.year && (
                  <p className="text-red-600 text-sm mt-1">{errors.year}</p>
                )}
              </div>

              {/* Board */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  বোর্ড :
                </label>
                <select
                  value={formData.board}
                  onChange={(e) => handleInputChange('board', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.board ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  {boards.map((board) => (
                    <option key={board} value={board}>
                      {board}
                    </option>
                  ))}
                </select>
                {errors.board && (
                  <p className="text-red-600 text-sm mt-1">{errors.board}</p>
                )}
              </div>

              {/* Roll */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  রোল :
                </label>
                <input
                  type="text"
                  value={formData.roll}
                  onChange={(e) => handleInputChange('roll', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.roll ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="রোল নম্বর দিন"
                />
                {errors.roll && (
                  <p className="text-red-600 text-sm mt-1">{errors.roll}</p>
                )}
              </div>

              {/* Registration Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  রেজি: নং :
                </label>
                <input
                  type="text"
                  value={formData.regNo}
                  onChange={(e) => handleInputChange('regNo', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.regNo ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="রেজিস্ট্রেশন নম্বর দিন"
                />
                {errors.regNo && (
                  <p className="text-red-600 text-sm mt-1">{errors.regNo}</p>
                )}
              </div>

              {/* Captcha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {captcha.num1} + {captcha.num2} =
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formData.captcha}
                    onChange={(e) => handleInputChange('captcha', e.target.value)}
                    className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.captcha ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="উত্তর"
                  />
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
                {errors.captcha && (
                  <p className="text-red-600 text-sm mt-1">{errors.captcha}</p>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                রিসেট
              </button>
              <button
                type="submit"
                disabled={searching}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {searching ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>খুঁজছি...</span>
                  </div>
                ) : (
                  'জমা দিন'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results Display */}
      {showResults && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            {results.length === 0 ? (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">কোন ফলাফল পাওয়া যায়নি</h3>
                <p className="text-gray-600">প্রদত্ত তথ্যের জন্য কোন ফলাফল পাওয়া যায়নি। অনুগ্রহ করে আপনার তথ্য পরীক্ষা করে আবার চেষ্টা করুন।</p>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">আপনার ফলাফল</h2>
                {results.map((result) => (
                  <div key={result.id} className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{result.studentName}</h3>
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-600">
                            #{result.position}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(result.status)}`}>
                            {getStatusText(result.status)}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(result.overallGrade)}`}>
                            {result.overallGrade} ({result.overallGPA})
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{result.studentId}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{result.class}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Award className="w-4 h-4" />
                            <span>{result.examName}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(result.examDate)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6 text-sm">
                          <div>
                            <span className="text-gray-500">মোট নম্বর:</span>
                            <span className="font-semibold text-gray-900 ml-1">
                              {result.totalObtainedMarks}/{result.totalMarks}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">GPA:</span>
                            <span className="font-semibold text-gray-900 ml-1">{result.overallGPA}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">গ্রেড:</span>
                            <span className="font-semibold text-gray-900 ml-1">{result.overallGrade}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Subject-wise Results */}
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <BookOpen className="w-4 h-4 mr-2" />
                        বিষয়ভিত্তিক ফলাফল
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {result.subjects.map((subject, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{subject.subject}</div>
                              <div className="text-sm text-gray-600">
                                {subject.obtainedMarks}/{subject.totalMarks} নম্বর
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`px-2 py-1 rounded text-sm font-medium ${getGradeColor(subject.grade)}`}>
                                {subject.grade}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">GPA: {subject.gpa}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">ই</span>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">আমার স্কুল</h3>
            <p className="text-gray-400 mb-4">ভালোবাসা দিয়ে শিক্ষা, ইসলামিক মূল্যবোধে জীবন গড়া</p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <span>📞 +৮৮০ ১৭১১ ২৩৪৫৬৭</span>
              <span>✉️ info@iqraschool.edu</span>
              <span>📍 ঢাকা, বাংলাদেশ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PublicResultsPageWrapper() {
  return <PublicResultsPage />;
}