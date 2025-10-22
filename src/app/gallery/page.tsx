'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Camera, Search, Filter, Grid, List, Download, Eye, Calendar, User, MapPin, Heart, Share2, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  event: string;
  date: string;
  photographer: string;
  location: string;
  tags: string[];
  likes: number;
  isLiked: boolean;
}

const PublicGalleryPage = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'likes' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Sample data
  const sampleGalleryItems: GalleryItem[] = [
    {
      id: '1',
      title: 'বার্ষিক ক্রীড়া প্রতিযোগিতা ২০২৪',
      description: 'স্কুলের বার্ষিক ক্রীড়া প্রতিযোগিতার স্মরণীয় মুহূর্তগুলো',
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
      category: 'events',
      event: 'বার্ষিক ক্রীড়া প্রতিযোগিতা',
      date: '2024-12-15',
      photographer: 'মোহাম্মদ আলী',
      location: 'স্কুল মাঠ',
      tags: ['ক্রীড়া', 'প্রতিযোগিতা', 'ছাত্রছাত্রী', 'মাঠ'],
      likes: 45,
      isLiked: false
    },
    {
      id: '2',
      title: 'বিজ্ঞান মেলা ২০২৪',
      description: 'ছাত্রছাত্রীদের বিজ্ঞান প্রকল্প প্রদর্শনী',
      imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop',
      category: 'academic',
      event: 'বিজ্ঞান মেলা',
      date: '2024-12-10',
      photographer: 'ফাতেমা খাতুন',
      location: 'স্কুল হল',
      tags: ['বিজ্ঞান', 'প্রকল্প', 'প্রদর্শনী', 'শিক্ষা'],
      likes: 32,
      isLiked: true
    },
    {
      id: '3',
      title: 'ইসলামিক সাংস্কৃতিক অনুষ্ঠান',
      description: 'ইসলামিক মূল্যবোধের উপর ভিত্তি করে সাংস্কৃতিক অনুষ্ঠান',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
      category: 'cultural',
      event: 'ইসলামিক সাংস্কৃতিক অনুষ্ঠান',
      date: '2024-12-05',
      photographer: 'আব্দুল রহমান',
      location: 'স্কুল মিলনায়তন',
      tags: ['ইসলামিক', 'সংস্কৃতি', 'অনুষ্ঠান', 'ধর্ম'],
      likes: 67,
      isLiked: false
    },
    {
      id: '4',
      title: 'শিক্ষক দিবস উদযাপন',
      description: 'শিক্ষকদের প্রতি শ্রদ্ধা জানিয়ে বিশেষ অনুষ্ঠান',
      imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop',
      category: 'events',
      event: 'শিক্ষক দিবস',
      date: '2024-11-30',
      photographer: 'নাসির উদ্দিন',
      location: 'স্কুল হল',
      tags: ['শিক্ষক', 'শ্রদ্ধা', 'অনুষ্ঠান', 'শিক্ষা'],
      likes: 89,
      isLiked: true
    },
    {
      id: '5',
      title: 'বইমেলা ২০২৪',
      description: 'ছাত্রছাত্রীদের বই পড়ার আগ্রহ বাড়াতে বইমেলা',
      imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
      category: 'academic',
      event: 'বইমেলা',
      date: '2024-11-25',
      photographer: 'রহিম উদ্দিন',
      location: 'স্কুল লাইব্রেরি',
      tags: ['বই', 'পড়া', 'শিক্ষা', 'লাইব্রেরি'],
      likes: 54,
      isLiked: false
    },
    {
      id: '6',
      title: 'বৃক্ষরোপণ কর্মসূচি',
      description: 'পরিবেশ সুরক্ষায় বৃক্ষরোপণ কর্মসূচি',
      imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
      category: 'environment',
      event: 'বৃক্ষরোপণ কর্মসূচি',
      date: '2024-11-20',
      photographer: 'মোহাম্মদ হাসান',
      location: 'স্কুল প্রাঙ্গণ',
      tags: ['বৃক্ষ', 'পরিবেশ', 'সুরক্ষা', 'প্রকৃতি'],
      likes: 41,
      isLiked: false
    }
  ];

  const categories = ['সকল বিভাগ', 'events', 'academic', 'cultural', 'environment', 'sports'];
  const events = ['সকল অনুষ্ঠান', 'বার্ষিক ক্রীড়া প্রতিযোগিতা', 'বিজ্ঞান মেলা', 'ইসলামিক সাংস্কৃতিক অনুষ্ঠান', 'শিক্ষক দিবস', 'বইমেলা', 'বৃক্ষরোপণ কর্মসূচি'];

  useEffect(() => {
    try {
      const loadGalleryItems = async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const data = sampleGalleryItems || [];
          setGalleryItems(data);
          setFilteredItems(data);
          setLoading(false);
        } catch (error) {
          console.error('Error in loadGalleryItems:', error);
          setGalleryItems([]);
          setFilteredItems([]);
          setLoading(false);
        }
      };
      
      loadGalleryItems();
    } catch (error) {
      console.error('Error in useEffect:', error);
      setGalleryItems([]);
      setFilteredItems([]);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      let filtered = galleryItems || [];

      // Search filter
      if (searchTerm) {
        filtered = filtered.filter(item => 
          item?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item?.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      // Category filter
      if (selectedCategory && selectedCategory !== 'সকল বিভাগ') {
        filtered = filtered.filter(item => item?.category === selectedCategory);
      }

      // Event filter
      if (selectedEvent && selectedEvent !== 'সকল অনুষ্ঠান') {
        filtered = filtered.filter(item => item?.event === selectedEvent);
      }

      // Sort
      filtered.sort((a, b) => {
        try {
          let aValue, bValue;
          
          switch (sortBy) {
            case 'date':
              aValue = new Date(a?.date || '').getTime();
              bValue = new Date(b?.date || '').getTime();
              break;
            case 'likes':
              aValue = a?.likes || 0;
              bValue = b?.likes || 0;
              break;
            case 'title':
              aValue = a?.title?.toLowerCase() || '';
              bValue = b?.title?.toLowerCase() || '';
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
          console.error('Error sorting gallery items:', error);
          return 0;
        }
      });

      setFilteredItems(filtered);
    } catch (error) {
      console.error('Error filtering gallery items:', error);
      setFilteredItems([]);
    }
  }, [galleryItems, searchTerm, selectedCategory, selectedEvent, sortBy, sortOrder]);

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'events': return 'অনুষ্ঠান';
      case 'academic': return 'শিক্ষামূলক';
      case 'cultural': return 'সাংস্কৃতিক';
      case 'environment': return 'পরিবেশ';
      case 'sports': return 'ক্রীড়া';
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

  const handleLike = (id: string) => {
    setGalleryItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, isLiked: !item.isLiked, likes: item.isLiked ? item.likes - 1 : item.likes + 1 }
        : item
    ));
  };

  const openLightbox = (item: GalleryItem) => {
    setSelectedImage(item);
    setCurrentImageIndex(filteredItems.findIndex(img => img.id === item.id));
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (currentImageIndex < filteredItems.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      setSelectedImage(filteredItems[currentImageIndex + 1]);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
      setSelectedImage(filteredItems[currentImageIndex - 1]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">গ্যালারি লোড হচ্ছে...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">ফটো গ্যালারি</h1>
            <p className="text-xl text-pink-100 max-w-3xl mx-auto">
              আমাদের স্কুলের স্মরণীয় মুহূর্তগুলো এবং বিশেষ অনুষ্ঠানগুলোর ছবি দেখুন
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ছবি খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category} value={category === 'সকল বিভাগ' ? '' : category}>
                    {category === 'সকল বিভাগ' ? category : getCategoryText(category)}
                  </option>
                ))}
              </select>
            </div>

            {/* Event Filter */}
            <div>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                {events.map((event) => (
                  <option key={event} value={event === 'সকল অনুষ্ঠান' ? '' : event}>
                    {event}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* View Mode and Sort Options */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">দেখার ধরন:</span>
              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-pink-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-pink-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">সাজান:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="date">তারিখ অনুযায়ী</option>
                <option value="likes">লাইক অনুযায়ী</option>
                <option value="title">শিরোনাম অনুযায়ী</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <span className="text-sm">{sortOrder === 'asc' ? 'আরোহী' : 'অবরোহী'}</span>
                {sortOrder === 'asc' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Gallery Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredItems.length}টি ছবি পাওয়া গেছে
          </p>
        </div>

        {/* Gallery Grid/List */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">কোন ছবি পাওয়া যায়নি</h3>
            <p className="text-gray-600">আপনার অনুসন্ধানের সাথে মিলে যায় এমন কোন ছবি নেই</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
            : 'space-y-6'
          }>
            {filteredItems.map((item) => (
              <div key={item.id} className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow ${
                viewMode === 'list' ? 'flex' : ''
              }`}>
                <div className={`${viewMode === 'list' ? 'w-1/3' : 'w-full'} relative group`}>
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className={`w-full object-cover cursor-pointer transition-transform group-hover:scale-105 ${
                      viewMode === 'list' ? 'h-48' : 'h-64'
                    }`}
                    onClick={() => openLightbox(item)}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded-full">
                      {getCategoryText(item.category)}
                    </span>
                  </div>
                </div>
                
                <div className={`p-6 ${viewMode === 'list' ? 'w-2/3' : 'w-full'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-pink-100 text-pink-600 text-xs rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{item.photographer}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(item.date)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleLike(item.id)}
                        className={`flex items-center space-x-1 ${
                          item.isLiked ? 'text-pink-600' : 'text-gray-400 hover:text-pink-600'
                        } transition-colors`}
                      >
                        <Heart className={`w-5 h-5 ${item.isLiked ? 'fill-current' : ''}`} />
                        <span>{item.likes}</span>
                      </button>
                      <button className="flex items-center space-x-1 text-gray-400 hover:text-gray-600 transition-colors">
                        <Share2 className="w-5 h-5" />
                        <span>শেয়ার</span>
                      </button>
                    </div>
                    <button className="flex items-center space-x-1 text-gray-400 hover:text-gray-600 transition-colors">
                      <Download className="w-5 h-5" />
                      <span>ডাউনলোড</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="w-8 h-8" />
            </button>
            
            <img
              src={selectedImage.imageUrl}
              alt={selectedImage.title}
              className="max-w-full max-h-full object-contain"
            />
            
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
              <h3 className="text-xl font-semibold mb-2">{selectedImage.title}</h3>
              <p className="text-sm text-gray-300">{selectedImage.description}</p>
            </div>
            
            {currentImageIndex > 0 && (
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}
            
            {currentImageIndex < filteredItems.length - 1 && (
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-purple-600 rounded-full flex items-center justify-center">
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

export default function PublicGalleryPageWrapper() {
  return <PublicGalleryPage />;
}
