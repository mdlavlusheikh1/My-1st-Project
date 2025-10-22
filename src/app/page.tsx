'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { Brain, Phone, Mail, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const { userData } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  const heroSlides = [
    {
      id: 1,
      title: "আমার স্কুল",
      subtitle: "আধুনিক শিক্ষা ও প্রযুক্তির সমন্বয়",
      bgGradient: "from-blue-900 via-purple-900 to-teal-800",
      aiText: "AI",
      aiSubtext: "Smart Education"
    },
    {
      id: 2,
      title: "ডিজিটাল শিক্ষা ব্যবস্থা",
      subtitle: "QR কোড এবং স্মার্ট উপস্থিতি ট্র্যাকিং",
      bgGradient: "from-green-900 via-emerald-900 to-cyan-800",
      aiText: "QR",
      aiSubtext: "Attendance System"
    },
    {
      id: 3,
      title: "রিয়েল-টাইম ড্যাশবোর্ড",
      subtitle: "লাইভ মনিটরিং এবং পারফরমেন্স ট্র্যাকিং",
      bgGradient: "from-purple-900 via-pink-900 to-indigo-800",
      aiText: "DB",
      aiSubtext: "Real-time Reports"
    }
  ];

  const nextHeroSlide = () => {
    setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevHeroSlide = () => {
    setCurrentHeroSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const goToHeroSlide = (index: number) => {
    setCurrentHeroSlide(index);
  };

  useEffect(() => {
    setIsLoading(false);
  }, [userData]);

  // Auto-slide functionality for hero
  useEffect(() => {
    const heroInterval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000); // Change hero slide every 6 seconds

    return () => clearInterval(heroInterval);
  }, [heroSlides.length]);


  // Content for home page specific sections
  const content = {
    notice: {
      badge: 'নোটিশ',
      text: '🔴 জরুরি: ভর্তির শেষ তারিখ ৩০ ডিসেম্বর ২০২৪ • 📢 নতুন: অনলাইন ক্লাস শুরু হবে ১৫ জানুয়ারি • ⚠️ সাবধান: জাল সার্টিফিকেট সম্পর্কে সতর্ক থাকুন • 📅 পরীক্ষার সময়সূচী প্রকাশিত হয়েছে • 🎓 বৃত্তি আবেদনের শেষ সময় ২০ ডিসেম্বর'
    },
    hero: {
      adminPanel: 'অ্যাডমিন প্যানেল'
    },
    aboutUs: {
      title: 'আমাদের সম্পর্কে',
      description1: 'আমার স্কুল ২০১৮ সালে প্রতিষ্ঠিত হয়। প্রতিষ্ঠার শুরু থেকেই আমাদের দান শিক্ষার মানোন্নয়ন ও নৈতিক শিক্ষার সমান গুরুত্ব সাথে প্রদান করে আসছে।',
      description2: 'আমাদের লক্ষ্য হচ্ছে শিক্ষার্থীদের নৈতিকতা, চরিত্র গঠন এবং আধুনিক জ্ঞানে দক্ষ করে গড়ে তোলা। আমরা বিশ্বাস করি প্রতিটি শিক্ষার্থী অসীম সম্ভাবনার অধিকারী।',
      readMore: 'বিস্তারিত পড়ুন'
    },
    admission: {
      title: 'ভর্তি চলছে সেশন ২০২৪',
      applyNow: '🎓 আবেদন করুন এখনই',
      classes: '৭ম-১০ম',
      classesLabel: 'শ্রেণী সমূহ',
      open: 'খোলা',
      openLabel: 'আবেদন প্রক্রিয়া',
      deadline: 'আবেদনের শেষ তারিখ: ৩০ ডিসেম্বর ২০২৪',
      admitNow: 'এখনই ভর্তি হন'
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation />

      {/* Notice Bar */}
      <div className="bg-gray-100 text-black py-2 fixed w-full top-20 z-40 border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <div className="flex items-center mr-4">
              <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                {content.notice.badge}
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="animate-marquee whitespace-nowrap">
                <span className="text-sm font-medium">
                  {content.notice.text}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translate3d(100%, 0, 0);
          }
          100% {
            transform: translate3d(-100%, 0, 0);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>

      {/* Hero Section - Now a Slider */}
      <section className="pt-32 pb-16 text-white min-h-screen flex items-center relative overflow-hidden">
        {/* Hero Slider Container */}
        <div className="absolute inset-0">
          <div 
            className="flex transition-transform duration-1000 ease-in-out h-full"
            style={{ transform: `translateX(-${currentHeroSlide * 100}%)` }}
          >
            {heroSlides.map((slide) => (
              <div key={slide.id} className={`w-full flex-shrink-0 bg-gradient-to-br ${slide.bgGradient} h-full`}>
                <div className="absolute inset-0 bg-black/10"></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Content Overlay */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            {/* Dynamic Heading */}
            <div className="mb-12">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight transition-all duration-500">
                <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                  {heroSlides[currentHeroSlide].title}
                </span>
              </h1>
              <p className="text-2xl text-blue-200 font-medium mb-8 transition-all duration-500">
                {heroSlides[currentHeroSlide].subtitle}
              </p>
            </div>
            
            {/* Dynamic AI Logo */}
            <div className="flex justify-center mb-12">
              <div className="w-64 h-64 rounded-full bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500 flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-105">
                <div className="text-center text-white">
                  <Brain className="w-16 h-16 mx-auto mb-4 text-cyan-300" />
                  <div className="text-4xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent mb-2 transition-all duration-500">
                    {heroSlides[currentHeroSlide].aiText}
                  </div>
                  <div className="text-xl font-semibold transition-all duration-500">
                    {heroSlides[currentHeroSlide].aiSubtext}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Button */}
            <div className="flex justify-center">
              <button 
                onClick={() => router.push('/auth/login')}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-10 py-4 rounded-lg text-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {content.hero.adminPanel}
              </button>
            </div>
          </div>
        </div>
        
        {/* Hero Navigation Arrows */}
        <button 
          onClick={prevHeroSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-4 rounded-full transition-all duration-300 hover:scale-110 z-20"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        
        <button 
          onClick={nextHeroSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-4 rounded-full transition-all duration-300 hover:scale-110 z-20"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
        
        {/* Hero Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToHeroSlide(index)}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                currentHeroSlide === index 
                  ? 'bg-white w-10' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </section>

      {/* About Us and Notice Board Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* About Us and Admission - Left Column (3/4 width) */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{content.aboutUs.title}</h2>
                <div className="space-y-6 text-gray-600 mb-6 p-6 border border-gray-300 rounded-xl bg-gray-50">
                  <div className="flex items-start gap-6">
                    <div className="flex-1">
                      <p className="text-base leading-relaxed mb-4">
                        {content.aboutUs.description1}
                      </p>
                      <p className="text-base leading-relaxed">
                        {content.aboutUs.description2}
                      </p>
                    </div>
                    
                    {/* AI Creative Section - Bigger */}
                    <div className="flex-shrink-0">
                      <div className="w-48 h-48 rounded-full bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500 flex items-center justify-center shadow-2xl border-8 border-white">
                        <div className="text-white text-center">
                          <div className="text-3xl font-bold mb-2">AI</div>
                          <div className="text-sm font-medium">Creative AI</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl text-base font-semibold transition-colors transform hover:scale-105">
                      {content.aboutUs.readMore}
                    </button>
                  </div>
                </div>
              </div>

              {/* Admission Section - Much Bigger */}
              <div className="bg-white rounded-2xl shadow-xl p-10">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{content.admission.title}</h2>
                <div className="text-center mb-10">
                  <div className="inline-block bg-gradient-to-r from-green-500 to-blue-500 text-white px-10 py-5 rounded-full text-xl font-bold mb-6">
                    {content.admission.applyNow}
                  </div>
                </div>
                
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="text-center p-6 bg-blue-50 rounded-2xl border-2 border-blue-200">
                      <div className="text-4xl font-bold text-blue-600 mb-2">{content.admission.classes}</div>
                      <div className="text-lg text-gray-700 font-semibold">{content.admission.classesLabel}</div>
                    </div>
                    <div className="text-center p-6 bg-green-50 rounded-2xl border-2 border-green-200">
                      <div className="text-4xl font-bold text-green-600 mb-2">{content.admission.open}</div>
                      <div className="text-lg text-gray-700 font-semibold">{content.admission.openLabel}</div>
                    </div>
                  </div>
                  
                  <div className="text-center bg-yellow-50 p-6 rounded-2xl border-2 border-yellow-200">
                    <p className="text-lg text-gray-700 mb-6 font-medium">{content.admission.deadline}</p>
                    <button 
                      onClick={() => router.push('/admission')}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 rounded-2xl text-lg font-bold transition-all duration-300 transform hover:scale-110 shadow-lg"
                    >
                      {content.admission.admitNow}
                    </button>
                  </div>
                  
                  {/* Additional Information */}
                  <div className="grid grid-cols-3 gap-6 mt-8">
                    <div className="text-center p-4 bg-purple-50 rounded-xl">
                      <div className="text-xl font-bold text-purple-600 mb-2">০৮:০০ - ১৫:০০</div>
                      <div className="text-sm text-gray-600">অফিস সময়</div>
                    </div>
                    <div className="text-center p-4 bg-indigo-50 rounded-xl">
                      <div className="text-xl font-bold text-indigo-600 mb-2">০১৭৮৮-৮৮৮৮</div>
                      <div className="text-sm text-gray-600">যোগাযোগ নম্বর</div>
                    </div>
                    <div className="text-center p-4 bg-teal-50 rounded-xl">
                      <div className="text-xl font-bold text-teal-600 mb-2">১৫ বছর</div>
                      <div className="text-sm text-gray-600">শিক্ষার অভিজ্ঞতা</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Bigger but still compact (1/4 width) */}
            <div className="lg:col-span-1 space-y-4">
              {/* Notice Board - Bigger */}
              <div className="bg-white rounded-xl shadow-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900">নোটিশ</h3>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start p-2 hover:bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-bold">⚠</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">সাবধান ভূমি</div>
                      <div className="text-sm text-gray-600">১৫ দিন আগো</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 text-center">
                  <span className="text-sm text-green-600 font-medium cursor-pointer hover:text-green-700">সব দেখুন</span>
                </div>
              </div>

              {/* Quick Links - Bigger */}
              <div className="bg-white rounded-xl shadow-lg p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-3">লিঙ্ক</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-600 rounded mr-3"></div>
                      <span className="text-sm font-medium">শিক্ষা মন্ত্রণালয়</span>
                    </div>
                    <span className="text-sm text-blue-600 font-medium">ভিজিট</span>
                  </div>
                  <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-600 rounded mr-3"></div>
                      <span className="text-sm font-medium">মাধ্যমিক বোর্ড</span>
                    </div>
                    <span className="text-sm text-blue-600 font-medium">ভিজিট</span>
                  </div>
                </div>
              </div>

              {/* Statistics Grid - Bigger */}
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-white rounded-lg shadow-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">95</div>
                  <div className="text-sm text-gray-600 font-medium">Seven</div>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">80</div>
                  <div className="text-sm text-gray-600 font-medium">Eight</div>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">160</div>
                  <div className="text-sm text-gray-600 font-medium">Nine</div>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">110</div>
                  <div className="text-sm text-gray-600 font-medium">Ten</div>
                </div>
              </div>

              {/* Top Students - Bigger */}
              <div className="bg-white rounded-xl shadow-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">কৃতি</h3>
                  <span className="text-sm text-green-600 font-medium">সব দেখুন</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-bold">ত</span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">তাসনিয়া আকতার</div>
                      <div className="text-sm text-gray-600">ক্লাস টেন</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-bold">ম</span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">মাহজাবুল ইসলাম</div>
                      <div className="text-sm text-gray-600">ক্লাস নাইন</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold mb-4">আমার স্কুল</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">আদর্শ শিক্ষা, আদর্শ মানুষ গড়ার কারিগর</p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">যোগাযোগ</h3>
              <div className="text-gray-300 space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 flex-shrink-0" />
                  <span>০১৭ ৮৮৮-৮৮৮৮</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 flex-shrink-0" />
                  <span>info@iqraacademy.edu</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 flex-shrink-0" />
                  <span>১৫৯ মেইন রোড, ঢাকা-১২০৭</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; ২০২৪ আমার স্কুল। সর্বস্বত্ব সংরক্ষিত।</p>
          </div>
        </div>
      </footer>
    </div>
  );
}