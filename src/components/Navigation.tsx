'use client';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const pathname = usePathname();
  const router = useRouter();

  // Only show navigation on public pages, hide on admin/user pages
  if (pathname.startsWith('/admin') || pathname.startsWith('/auth') || pathname.startsWith('/teacher') || pathname.startsWith('/student') || pathname.startsWith('/parent')) {
    return null;
  }

  const handleLoginClick = () => {
    router.push('/auth/login');
  };

  // Content
  const content = {
    bn: {
      nav: {
        home: 'হোম',
        admission: 'ভর্তি',
        homework: 'বাড়ির কাজ',
        results: 'ফলাফল',
        questions: 'প্রশ্ন',
        gallery: 'গ্যালারী',
        about: 'পরিচিতি',
        contact: 'যোগাযোগ',
        login: 'লগইন'
      }
    },
    en: {
      nav: {
        home: 'Home',
        admission: 'Admission',
        homework: 'Homework',
        results: 'Results',
        questions: 'Questions',
        gallery: 'Gallery',
        about: 'About',
        contact: 'Contact',
        login: 'Login'
      }
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">ই</span>
            </div>
            <span className="text-xl font-bold text-gray-900">ইকরা মুকারী একাডেমী</span>
          </div>
          <div className="hidden lg:flex items-center space-x-2 xl:space-x-4 flex-nowrap">
            <a href="/" className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-1 xl:px-2 py-2 whitespace-nowrap text-sm xl:text-base">{content[language].nav.home}</a>
            <a href="/admission" className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-1 xl:px-2 py-2 whitespace-nowrap text-sm xl:text-base">{content[language].nav.admission}</a>
            <a href="/homework" className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-1 xl:px-2 py-2 whitespace-nowrap text-sm xl:text-base">{content[language].nav.homework}</a>
            <a href="/results" className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-1 xl:px-2 py-2 whitespace-nowrap text-sm xl:text-base">{content[language].nav.results}</a>
            <a href="/questions" className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-1 xl:px-2 py-2 whitespace-nowrap text-sm xl:text-base">{content[language].nav.questions}</a>
            <a href="/gallery" className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-1 xl:px-2 py-2 whitespace-nowrap text-sm xl:text-base">{content[language].nav.gallery}</a>
            <a href="/about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-1 xl:px-2 py-2 whitespace-nowrap text-sm xl:text-base">{content[language].nav.about}</a>
            <a href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-1 xl:px-2 py-2 whitespace-nowrap text-sm xl:text-base">{content[language].nav.contact}</a>
            
            <button 
              onClick={handleLoginClick}
              className="bg-green-600 hover:bg-green-700 text-white px-3 xl:px-6 py-2 rounded-lg transition-colors font-medium whitespace-nowrap text-sm xl:text-base"
            >
              {content[language].nav.login}
            </button>
            
            {/* Language Toggle Switch */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-600">বাং</span>
              <button 
                onClick={() => setLanguage(prev => prev === 'bn' ? 'en' : 'bn')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  language === 'en' ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    language === 'en' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-xs text-gray-600">EN</span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="/" className="block text-gray-700 hover:text-blue-600 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-blue-50">{content[language].nav.home}</a>
              <a href="/admission" className="block text-gray-700 hover:text-blue-600 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-blue-50">{content[language].nav.admission}</a>
              <a href="/homework" className="block text-gray-700 hover:text-blue-600 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-blue-50">{content[language].nav.homework}</a>
              <a href="/results" className="block text-gray-700 hover:text-blue-600 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-blue-50">{content[language].nav.results}</a>
              <a href="/questions" className="block text-gray-700 hover:text-blue-600 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-blue-50">{content[language].nav.questions}</a>
              <a href="/gallery" className="block text-gray-700 hover:text-blue-600 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-blue-50">{content[language].nav.gallery}</a>
              <a href="/about" className="block text-gray-700 hover:text-blue-600 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-blue-50">{content[language].nav.about}</a>
              <a href="/contact" className="block text-gray-700 hover:text-blue-600 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-blue-50">{content[language].nav.contact}</a>
              
              <button 
                onClick={handleLoginClick}
                className="w-full text-left bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors font-medium"
              >
                {content[language].nav.login}
              </button>
              
              {/* Mobile Language Toggle */}
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-gray-700 font-medium">ভাষা / Language</span>
                <button 
                  onClick={() => setLanguage(prev => prev === 'bn' ? 'en' : 'bn')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    language === 'en' ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      language === 'en' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;