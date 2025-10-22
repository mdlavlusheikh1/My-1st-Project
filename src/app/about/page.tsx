'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { 
  Heart, 
  Award, 
  Users, 
  BookOpen, 
  Target, 
  Eye, 
  CheckCircle, 
  Star, 
  GraduationCap, 
  Shield, 
  Globe, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  User,
  Clock
} from 'lucide-react';

const PublicAboutPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const loadPage = async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          setLoading(false);
        } catch (error) {
          console.error('Error in loadPage:', error);
          setLoading(false);
        }
      };
      
      loadPage();
    } catch (error) {
      console.error('Error in useEffect:', error);
      setLoading(false);
    }
  }, []);

  const stats = [
    { icon: Users, label: 'শিক্ষার্থী', value: '৫০০+', color: 'text-blue-600' },
    { icon: GraduationCap, label: 'শিক্ষক', value: '৩৫+', color: 'text-green-600' },
    { icon: BookOpen, label: 'বছর', value: '১৫+', color: 'text-purple-600' },
    { icon: Award, label: 'সাফল্য', value: '৯৫%', color: 'text-yellow-600' }
  ];

  const values = [
    {
      icon: Heart,
      title: 'ভালোবাসা',
      description: 'শিক্ষার্থীদের প্রতি অকৃত্রিম ভালোবাসা এবং যত্ন নিয়ে শিক্ষাদান'
    },
    {
      icon: Shield,
      title: 'নিরাপত্তা',
      description: 'সব শিক্ষার্থীর জন্য নিরাপদ এবং সুন্দর পরিবেশ নিশ্চিত করা'
    },
    {
      icon: Target,
      title: 'মানসম্পন্ন শিক্ষা',
      description: 'আধুনিক শিক্ষা পদ্ধতি এবং ইসলামিক মূল্যবোধের সমন্বয়'
    },
    {
      icon: Globe,
      title: 'বিশ্বায়ন',
      description: 'আন্তর্জাতিক মানের শিক্ষা দিয়ে বিশ্ব নাগরিক তৈরি করা'
    }
  ];

  const achievements = [
    {
      year: '২০২৪',
      title: 'সেরা শিক্ষা প্রতিষ্ঠান পুরস্কার',
      description: 'জেলা শিক্ষা অফিস থেকে সেরা শিক্ষা প্রতিষ্ঠান হিসেবে স্বীকৃতি'
    },
    {
      year: '২০২৩',
      title: '১০০% পাসের হার',
      description: 'এসএসসি পরীক্ষায় ১০০% পাসের হার অর্জন'
    },
    {
      year: '২০২২',
      title: 'সাংস্কৃতিক প্রতিযোগিতায় চ্যাম্পিয়ন',
      description: 'জেলা পর্যায়ে সাংস্কৃতিক প্রতিযোগিতায় প্রথম স্থান'
    },
    {
      year: '২০২১',
      title: 'ক্রীড়া প্রতিযোগিতায় সাফল্য',
      description: 'বিভাগীয় ক্রীড়া প্রতিযোগিতায় একাধিক স্বর্ণপদক'
    }
  ];

  const team = [
    {
      name: 'প্রফেসর ড. মোহাম্মদ আলী',
      position: 'প্রধান শিক্ষক',
      qualification: 'পিএইচডি, ইসলামিক স্টাডিজ',
      experience: '২০+ বছর',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face'
    },
    {
      name: 'মিসেস ফাতেমা খাতুন',
      position: 'উপ-প্রধান শিক্ষক',
      qualification: 'এম.এ, বাংলা সাহিত্য',
      experience: '১৫+ বছর',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face'
    },
    {
      name: 'মোহাম্মদ আব্দুল রহমান',
      position: 'গণিত বিভাগের প্রধান',
      qualification: 'এম.এসসি, গণিত',
      experience: '১২+ বছর',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face'
    },
    {
      name: 'মিসেস নাসিরা বেগম',
      position: 'ইংরেজি বিভাগের প্রধান',
      qualification: 'এম.এ, ইংরেজি সাহিত্য',
      experience: '১০+ বছর',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">পেজ লোড হচ্ছে...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-white font-bold text-2xl">ই</span>
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-6">ইকরা ইসলামিক স্কুল</h1>
            <p className="text-2xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed">
              ভালোবাসা দিয়ে শিক্ষা, ইসলামিক মূল্যবোধে জীবন গড়া
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-lg">
              <div className="flex items-center space-x-2 bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm">
                <Heart className="w-5 h-5" />
                <span>প্রতিষ্ঠিত: ২০০৯</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm">
                <Award className="w-5 h-5" />
                <span>সেরা শিক্ষা প্রতিষ্ঠান</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm">
                <Shield className="w-5 h-5" />
                <span>নিরাপদ পরিবেশ</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-white flex items-center justify-center shadow-lg`}>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">আমাদের সম্পর্কে</h2>
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>
                  ইকরা ইসলামিক স্কুল ২০০৯ সালে প্রতিষ্ঠিত একটি আধুনিক শিক্ষা প্রতিষ্ঠান। 
                  আমরা বিশ্বাস করি যে শিক্ষা শুধুমাত্র জ্ঞান অর্জন নয়, বরং চরিত্র গঠন এবং 
                  মানবিক মূল্যবোধ বিকাশের মাধ্যম।
                </p>
                <p>
                  আমাদের লক্ষ্য হল প্রতিটি শিক্ষার্থীকে এমনভাবে গড়ে তোলা যাতে তারা 
                  আধুনিক শিক্ষায় শিক্ষিত হওয়ার পাশাপাশি ইসলামিক মূল্যবোধে সমৃদ্ধ হয়ে 
                  দেশ ও জাতির সেবায় আত্মনিয়োগ করতে পারে।
                </p>
                <p>
                  আমরা বিশ্বাস করি যে প্রতিটি শিশুর মধ্যে অসীম সম্ভাবনা রয়েছে এবং 
                  সঠিক শিক্ষা ও পরিচর্যার মাধ্যমে সেই সম্ভাবনাকে বিকশিত করা যায়।
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop"
                alt="School Building"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">৯৫%</div>
                    <div className="text-sm text-gray-600">সাফল্যের হার</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">আমাদের লক্ষ্য</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                প্রতিটি শিক্ষার্থীকে আধুনিক শিক্ষায় শিক্ষিত করে ইসলামিক মূল্যবোধে সমৃদ্ধ 
                নাগরিক হিসেবে গড়ে তোলা। আমরা চাই আমাদের শিক্ষার্থীরা জ্ঞান-বিজ্ঞানে 
                পারদর্শী হওয়ার পাশাপাশি নৈতিকতা ও চরিত্রে অনুকরণীয় হয়ে উঠুক।
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">আমাদের উদ্দেশ্য</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                মানসম্পন্ন শিক্ষা প্রদানের মাধ্যমে শিক্ষার্থীদের মেধা ও প্রতিভা বিকাশে 
                সহায়তা করা। আমরা চাই আমাদের শিক্ষার্থীরা বিশ্ব নাগরিক হিসেবে 
                আত্মবিশ্বাসী, সৃজনশীল এবং দায়িত্বশীল হয়ে উঠুক।
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">আমাদের মূল্যবোধ</h2>
            <p className="text-xl text-gray-600">যে মূল্যবোধগুলো আমাদের পরিচালিত করে</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">আমাদের সাফল্য</h2>
            <p className="text-xl text-gray-600">যে অর্জনগুলো আমাদের গর্বিত করে</p>
          </div>
          
          <div className="space-y-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8 flex items-center space-x-6">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <span className="text-2xl font-bold text-gray-900">{achievement.year}</span>
                    <h3 className="text-xl font-semibold text-gray-900">{achievement.title}</h3>
                  </div>
                  <p className="text-gray-600">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">আমাদের শিক্ষকবৃন্দ</h2>
            <p className="text-xl text-gray-600">যারা আমাদের শিক্ষার মান নিশ্চিত করেন</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-shadow">
                <div className="relative">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-2">{member.position}</p>
                  <p className="text-sm text-gray-600 mb-2">{member.qualification}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{member.experience}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">যোগাযোগ করুন</h2>
            <p className="text-xl text-blue-100">আমাদের সাথে যোগাযোগ করে আরও জানুন</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">ফোন</h3>
              <p className="text-blue-100">+৮৮০ ১৭১১ ২৩৪৫৬৭</p>
              <p className="text-blue-100">+৮৮০ ১৯১১ ২৩৪৫৬৭</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">ইমেইল</h3>
              <p className="text-blue-100">info@iqraschool.edu</p>
              <p className="text-blue-100">admission@iqraschool.edu</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">ঠিকানা</h3>
              <p className="text-blue-100">রামপুরা, ঢাকা-১২১৯</p>
              <p className="text-blue-100">বাংলাদেশ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">ই</span>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">ইকরা ইসলামিক স্কুল</h3>
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

export default function PublicAboutPageWrapper() {
  return <PublicAboutPage />;
}
