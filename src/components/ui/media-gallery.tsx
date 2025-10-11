'use client';

import React, { useState, useEffect } from 'react';
import { MediaRecord, getMediaFromFirebase, deleteMediaFromImageKitAndFirebase } from '@/lib/firebase-imagekit';
import { transformImageUrl } from '@/lib/imagekit-utils';
import { Trash2, Download, Eye, ImageIcon, Video, FileText, Calendar, User } from 'lucide-react';
import Modal from './modal';

interface MediaGalleryProps {
  schoolId: string;
  category?: 'student' | 'teacher' | 'school' | 'document' | 'gallery';
  userId?: string;
  className?: string;
  showActions?: boolean;
  columns?: 1 | 2 | 3 | 4 | 6;
  autoRefresh?: boolean;
}

export default function MediaGallery({ 
  schoolId,
  category,
  userId,
  className = '',
  showActions = true,
  columns = 3,
  autoRefresh = false
}: MediaGalleryProps) {
  const [media, setMedia] = useState<MediaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string>('');

  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
  };

  const loadMedia = async () => {
    try {
      setLoading(true);
      setError('');
      const mediaData = await getMediaFromFirebase(schoolId, category, userId);
      setMedia(mediaData);
    } catch (error) {
      console.error('Error loading media:', error);
      setError('মিডিয়া লোড করতে ব্যর্থ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [schoolId, category, userId]);

  // Auto refresh every 30 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(loadMedia, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, schoolId, category, userId]);

  const handleDelete = async (mediaRecord: MediaRecord) => {
    if (!mediaRecord.id) return;
    
    if (!confirm('আপনি কি নিশ্চিত যে এই মিডিয়াটি মুছে ফেলতে চান?')) {
      return;
    }

    setDeletingIds(prev => new Set(prev).add(mediaRecord.id!));

    try {
      await deleteMediaFromImageKitAndFirebase(mediaRecord.id, mediaRecord.fileId);
      setMedia(prev => prev.filter(m => m.id !== mediaRecord.id));
    } catch (error) {
      console.error('Delete error:', error);
      alert('মিডিয়া মুছতে ব্যর্থ: ' + (error instanceof Error ? error.message : 'অজানা ত্রুটি'));
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(mediaRecord.id!);
        return newSet;
      });
    }
  };

  const handleDownload = (mediaRecord: MediaRecord) => {
    const link = document.createElement('a');
    link.href = mediaRecord.url;
    link.download = mediaRecord.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getMediaIcon = (type: string) => {
    if (type === 'image') return <ImageIcon className="h-4 w-4" />;
    if (type === 'video') return <Video className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const renderMediaPreview = (mediaRecord: MediaRecord) => {
    if (mediaRecord.type === 'image') {
      return (
        <img
          src={transformImageUrl(mediaRecord.url, {
            width: 300,
            height: 300,
            crop: 'force',
            format: 'webp',
            quality: 80
          })}
          alt={mediaRecord.name}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => setSelectedMedia(mediaRecord.url)}
        />
      );
    } else if (mediaRecord.type === 'video') {
      return (
        <div className="w-full h-full relative">
          <video
            src={mediaRecord.url}
            className="w-full h-full object-cover"
            onClick={() => setSelectedMedia(mediaRecord.url)}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 cursor-pointer">
            <Video className="h-12 w-12 text-white" />
          </div>
        </div>
      );
    } else {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500 font-medium">{mediaRecord.type}</p>
          </div>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">মিডিয়া লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <button
          onClick={loadMedia}
          className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          পুনরায় চেষ্টা করুন
        </button>
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">কোনো মিডিয়া পাওয়া যায়নি</p>
        <button
          onClick={loadMedia}
          className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          রিফ্রেশ করুন
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            মিডিয়া গ্যালারি ({media.length})
          </h3>
          {category && (
            <p className="text-sm text-gray-500">ক্যাটেগরি: {category}</p>
          )}
        </div>
        <button
          onClick={loadMedia}
          className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          রিফ্রেশ
        </button>
      </div>

      {/* Gallery Grid */}
      <div className={`grid gap-4 ${gridClass[columns]}`}>
        {media.map((mediaRecord) => (
          <div
            key={mediaRecord.id}
            className="group relative bg-white rounded-lg border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Media Preview */}
            <div className="aspect-square relative overflow-hidden">
              {renderMediaPreview(mediaRecord)}

              {/* Loading Overlay */}
              {mediaRecord.id && deletingIds.has(mediaRecord.id) && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}

              {/* Actions Overlay */}
              {showActions && (
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedMedia(mediaRecord.url)}
                      className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full transition-all"
                      title="বড় করে দেখুন"
                    >
                      <Eye className="h-4 w-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => handleDownload(mediaRecord)}
                      className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full transition-all"
                      title="ডাউনলোড করুন"
                    >
                      <Download className="h-4 w-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => handleDelete(mediaRecord)}
                      disabled={mediaRecord.id ? deletingIds.has(mediaRecord.id) : false}
                      className="bg-red-500 bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full transition-all disabled:opacity-50"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>
              )}

              {/* Media Type Badge */}
              <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                {getMediaIcon(mediaRecord.type)}
                {mediaRecord.type}
              </div>
            </div>

            {/* Media Info */}
            <div className="p-3">
              <h4 className="font-medium text-sm text-gray-900 truncate" title={mediaRecord.name}>
                {mediaRecord.name}
              </h4>
              
              <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
                <span>{formatFileSize(mediaRecord.size)}</span>
                {mediaRecord.width && mediaRecord.height && (
                  <span>{mediaRecord.width}×{mediaRecord.height}</span>
                )}
              </div>

              <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {mediaRecord.createdAt instanceof Date 
                    ? mediaRecord.createdAt.toLocaleDateString('bn-BD')
                    : 'তারিখ অজানা'
                  }
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span className="truncate max-w-[80px]" title={mediaRecord.uploadedBy}>
                    {mediaRecord.uploadedBy.split('@')[0]}
                  </span>
                </div>
              </div>

              {mediaRecord.tags && mediaRecord.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {mediaRecord.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {mediaRecord.tags.length > 2 && (
                    <span className="text-xs text-gray-500">+{mediaRecord.tags.length - 2}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <Modal
        isOpen={!!selectedMedia}
        onClose={() => setSelectedMedia(null)}
        size="2xl"
        showCloseButton={true}
        closeOnOverlayClick={true}
        className="bg-transparent shadow-none"
        headerClassName="bg-transparent border-none p-0"
        bodyClassName="p-0 bg-transparent"
      >
        <div className="relative max-w-4xl max-h-full">
          {selectedMedia && (selectedMedia.includes('.mp4') || selectedMedia.includes('.mov') || selectedMedia.includes('.avi')) ? (
            <video
              src={selectedMedia}
              controls
              className="max-w-full max-h-full"
              autoPlay
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              src={transformImageUrl(selectedMedia || '', {
                width: 1200,
                height: 800,
                crop: 'at_max',
                format: 'webp',
                quality: 90
              })}
              alt="Full size preview"
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
