'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { HelpCircle, Search, Filter, ChevronDown, ChevronUp, Send, MessageCircle, User, Calendar, BookOpen, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface Question {
  id: string;
  title: string;
  description: string;
  category: string;
  subject: string;
  class: string;
  askedBy: string;
  askedDate: string;
  status: 'pending' | 'answered' | 'closed';
  priority: 'low' | 'medium' | 'high';
  answers: {
    id: string;
    answer: string;
    answeredBy: string;
    answeredDate: string;
    isOfficial: boolean;
  }[];
  tags: string[];
}

const PublicQuestionsPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'title' | 'answers'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [showAskForm, setShowAskForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    description: '',
    category: '',
    subject: '',
    class: '',
    tags: ''
  });

  // Sample data
  const sampleQuestions: Question[] = [
    {
      id: '1',
      title: 'গণিতের অ্যালজেব্রা অধ্যায়ে সমস্যা',
      description: 'আমি অ্যালজেব্রার দ্বিঘাত সমীকরণ সমাধান করতে পারছি না। কেউ সাহায্য করতে পারবেন?',
      category: 'academic',
      subject: 'গণিত',
      class: '১০ম শ্রেণি',
      askedBy: 'মোহাম্মদ আব্দুল্লাহ',
      askedDate: '2024-12-20',
      status: 'answered',
      priority: 'medium',
      tags: ['গণিত', 'অ্যালজেব্রা', 'দ্বিঘাত সমীকরণ'],
      answers: [
        {
          id: '1',
          answer: 'দ্বিঘাত সমীকরণ সমাধানের জন্য প্রথমে সূত্রটি মনে রাখুন: x = (-b ± √(b²-4ac)) / 2a',
          answeredBy: 'শিক্ষক মোহাম্মদ আলী',
          answeredDate: '2024-12-21',
          isOfficial: true
        }
      ]
    },
    {
      id: '2',
      title: 'ইংরেজি গ্রামার নিয়ে প্রশ্ন',
      description: 'Present Perfect Tense কখন ব্যবহার করব?',
      category: 'academic',
      subject: 'ইংরেজি',
      class: '৯ম শ্রেণি',
      askedBy: 'ফাতেমা আক্তার',
      askedDate: '2024-12-19',
      status: 'answered',
      priority: 'low',
      tags: ['ইংরেজি', 'গ্রামার', 'Tense'],
      answers: [
        {
          id: '2',
          answer: 'Present Perfect Tense অতীতের কাজ যা বর্তমানের সাথে সম্পর্কিত তার জন্য ব্যবহার হয়।',
          answeredBy: 'ইংরেজি শিক্ষক',
          answeredDate: '2024-12-20',
          isOfficial: true
        }
      ]
    },
    {
      id: '3',
      title: 'স্কুলের ভর্তি প্রক্রিয়া সম্পর্কে জানতে চাই',
      description: 'আমার ছেলের জন্য ভর্তি করতে চাই। কি কি কাগজপত্র লাগবে?',
      category: 'admission',
      subject: 'সাধারণ',
      class: 'সকল ক্লাস',
      askedBy: 'রহিম উদ্দিন',
      askedDate: '2024-12-18',
      status: 'pending',
      priority: 'high',
      tags: ['ভর্তি', 'কাগজপত্র', 'প্রক্রিয়া'],
      answers: []
    },
    {
      id: '4',
      title: 'পরীক্ষার সময়সূচি কখন প্রকাশ হবে?',
      description: 'মধ্যবর্তী পরীক্ষার সময়সূচি জানতে চাই।',
      category: 'exam',
      subject: 'সাধারণ',
      class: 'সকল ক্লাস',
      askedBy: 'নাসির উদ্দিন',
      askedDate: '2024-12-17',
      status: 'answered',
      priority: 'high',
      tags: ['পরীক্ষা', 'সময়সূচি', 'মধ্যবর্তী'],
      answers: [
        {
          id: '3',
          answer: 'মধ্যবর্তী পরীক্ষার সময়সূচি আগামী সপ্তাহে প্রকাশ করা হবে।',
          answeredBy: 'প্রশাসন',
          answeredDate: '2024-12-18',
          isOfficial: true
        }
      ]
    }
  ];

  const categories = ['সকল বিভাগ', 'academic', 'admission', 'exam', 'general'];
  const subjects = ['সকল বিষয়', 'গণিত', 'ইংরেজি', 'বিজ্ঞান', 'বাংলা', 'ইতিহাস', 'ভূগোল', 'ধর্ম', 'সাধারণ'];
  const classes = ['সকল ক্লাস', '৮ম শ্রেণি', '৯ম শ্রেণি', '১০ম শ্রেণি', '১১ম শ্রেণি', '১২ম শ্রেণি'];
  const statuses = ['সকল অবস্থা', 'pending', 'answered', 'closed'];

  useEffect(() => {
    try {
      const loadQuestions = async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const data = sampleQuestions || [];
          setQuestions(data);
          setFilteredQuestions(data);
          setLoading(false);
        } catch (error) {
          console.error('Error in loadQuestions:', error);
          setQuestions([]);
          setFilteredQuestions([]);
          setLoading(false);
        }
      };
      
      loadQuestions();
    } catch (error) {
      console.error('Error in useEffect:', error);
      setQuestions([]);
      setFilteredQuestions([]);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      let filtered = questions || [];

      // Search filter
      if (searchTerm) {
        filtered = filtered.filter(question => 
          question?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          question?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          question?.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      // Category filter
      if (selectedCategory && selectedCategory !== 'সকল বিভাগ') {
        filtered = filtered.filter(question => question?.category === selectedCategory);
      }

      // Subject filter
      if (selectedSubject && selectedSubject !== 'সকল বিষয়') {
        filtered = filtered.filter(question => question?.subject === selectedSubject);
      }

      // Class filter
      if (selectedClass && selectedClass !== 'সকল ক্লাস') {
        filtered = filtered.filter(question => question?.class === selectedClass);
      }

      // Status filter
      if (selectedStatus && selectedStatus !== 'সকল অবস্থা') {
        filtered = filtered.filter(question => question?.status === selectedStatus);
      }

      // Sort
      filtered.sort((a, b) => {
        try {
          let aValue, bValue;
          
          switch (sortBy) {
            case 'date':
              aValue = new Date(a?.askedDate || '').getTime();
              bValue = new Date(b?.askedDate || '').getTime();
              break;
            case 'priority':
              const priorityOrder = { high: 3, medium: 2, low: 1 };
              aValue = priorityOrder[a?.priority as keyof typeof priorityOrder] || 0;
              bValue = priorityOrder[b?.priority as keyof typeof priorityOrder] || 0;
              break;
            case 'title':
              aValue = a?.title?.toLowerCase() || '';
              bValue = b?.title?.toLowerCase() || '';
              break;
            case 'answers':
              aValue = a?.answers?.length || 0;
              bValue = b?.answers?.length || 0;
              break;
            default:
              aValue = 0;
              bValue = 0;
          }

          if (sortBy === 'title') {
            return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
          }

          return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        } catch (error) {
          console.error('Error sorting questions:', error);
          return 0;
        }
      });

      setFilteredQuestions(filtered);
    } catch (error) {
      console.error('Error filtering questions:', error);
      setFilteredQuestions([]);
    }
  }, [questions, searchTerm, selectedCategory, selectedSubject, selectedClass, selectedStatus, sortBy, sortOrder]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'answered': return 'উত্তর দেওয়া হয়েছে';
      case 'pending': return 'অপেক্ষমান';
      case 'closed': return 'বন্ধ';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'উচ্চ';
      case 'medium': return 'মধ্যম';
      case 'low': return 'নিম্ন';
      default: return priority;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'academic': return 'শিক্ষামূলক';
      case 'admission': return 'ভর্তি';
      case 'exam': return 'পরীক্ষা';
      case 'general': return 'সাধারণ';
      default: return category;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'তারিখ নেই';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'অবৈধ তারিখ';
      return date.toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'তারিখ ফরম্যাট করতে ত্রুটি';
    }
  };

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically submit to your backend
    alert('আপনার প্রশ্ন সফলভাবে জমা হয়েছে! শীঘ্রই উত্তর দেওয়া হবে।');
    setShowAskForm(false);
    setNewQuestion({
      title: '',
      description: '',
      category: '',
      subject: '',
      class: '',
      tags: ''
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">প্রশ্ন লোড হচ্ছে...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <HelpCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">প্রশ্নোত্তর</h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              আপনার প্রশ্ন জিজ্ঞাসা করুন এবং উত্তর পান। আমাদের শিক্ষক ও প্রশাসন সবসময় সাহায্যের জন্য প্রস্তুত।
            </p>
          </div>
        </div>
      </div>

      {/* Ask Question Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <button
            onClick={() => setShowAskForm(!showAskForm)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
          >
            <MessageCircle className="w-5 h-5 inline mr-2" />
            নতুন প্রশ্ন জিজ্ঞাসা করুন
          </button>
        </div>

        {/* Ask Question Form */}
        {showAskForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">নতুন প্রশ্ন জিজ্ঞাসা করুন</h3>
            <form onSubmit={handleSubmitQuestion} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">প্রশ্নের শিরোনাম *</label>
                  <input
                    type="text"
                    value={newQuestion.title}
                    onChange={(e) => setNewQuestion({...newQuestion, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="আপনার প্রশ্নের সংক্ষিপ্ত শিরোনাম"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">বিভাগ</label>
                  <select
                    value={newQuestion.category}
                    onChange={(e) => setNewQuestion({...newQuestion, category: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">বিভাগ নির্বাচন করুন</option>
                    <option value="academic">শিক্ষামূলক</option>
                    <option value="admission">ভর্তি</option>
                    <option value="exam">পরীক্ষা</option>
                    <option value="general">সাধারণ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">বিষয়</label>
                  <select
                    value={newQuestion.subject}
                    onChange={(e) => setNewQuestion({...newQuestion, subject: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">বিষয় নির্বাচন করুন</option>
                    {subjects.slice(1).map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ক্লাস</label>
                  <select
                    value={newQuestion.class}
                    onChange={(e) => setNewQuestion({...newQuestion, class: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">ক্লাস নির্বাচন করুন</option>
                    {classes.slice(1).map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">প্রশ্নের বিস্তারিত বিবরণ *</label>
                <textarea
                  value={newQuestion.description}
                  onChange={(e) => setNewQuestion({...newQuestion, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={4}
                  placeholder="আপনার প্রশ্নের বিস্তারিত বিবরণ লিখুন..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ট্যাগ (কমা দিয়ে আলাদা করুন)</label>
                <input
                  type="text"
                  value={newQuestion.tags}
                  onChange={(e) => setNewQuestion({...newQuestion, tags: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="যেমন: গণিত, অ্যালজেব্রা, পরীক্ষা"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAskForm(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <Send className="w-4 h-4 inline mr-2" />
                  প্রশ্ন জমা দিন
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="প্রশ্ন খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category} value={category === 'সকল বিভাগ' ? '' : category}>
                    {category === 'সকল বিভাগ' ? category : getCategoryText(category)}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Filter */}
            <div>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {subjects.map((subject) => (
                  <option key={subject} value={subject === 'সকল বিষয়' ? '' : subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {statuses.map((status) => (
                  <option key={status} value={status === 'সকল অবস্থা' ? '' : status}>
                    {status === 'সকল অবস্থা' ? status : getStatusText(status)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort Options */}
          <div className="mt-4 flex flex-wrap gap-4 items-center">
            <span className="text-sm text-gray-600">সাজান:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="date">তারিখ অনুযায়ী</option>
              <option value="priority">অগ্রাধিকার অনুযায়ী</option>
              <option value="title">শিরোনাম অনুযায়ী</option>
              <option value="answers">উত্তরের সংখ্যা অনুযায়ী</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <span className="text-sm">{sortOrder === 'asc' ? 'আরোহী' : 'অবরোহী'}</span>
              {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Questions Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredQuestions.length}টি প্রশ্ন পাওয়া গেছে
          </p>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">কোন প্রশ্ন পাওয়া যায়নি</h3>
              <p className="text-gray-600">আপনার অনুসন্ধানের সাথে মিলে যায় এমন কোন প্রশ্ন নেই</p>
            </div>
          ) : (
            filteredQuestions.map((question) => (
              <div key={question.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{question.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(question.status)}`}>
                          {getStatusText(question.status)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(question.priority)}`}>
                          {getPriorityText(question.priority)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{question.askedBy}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(question.askedDate)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{question.subject} - {question.class}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{question.answers.length} উত্তর</span>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4">{question.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {question.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setExpandedQuestion(expandedQuestion === question.id ? null : question.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {expandedQuestion === question.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Answers */}
                  {expandedQuestion === question.id && (
                    <div className="border-t border-gray-200 pt-6 mt-6">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        উত্তরসমূহ ({question.answers.length})
                      </h4>
                      {question.answers.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                          <p>এখনও কোন উত্তর দেওয়া হয়নি</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {question.answers.map((answer) => (
                            <div key={answer.id} className="p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-gray-900">{answer.answeredBy}</span>
                                  {answer.isOfficial && (
                                    <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                                      অফিসিয়াল
                                    </span>
                                  )}
                                </div>
                                <span className="text-sm text-gray-500">{formatDate(answer.answeredDate)}</span>
                              </div>
                              <p className="text-gray-700">{answer.answer}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
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

export default function PublicQuestionsPageWrapper() {
  return <PublicQuestionsPage />;
}
