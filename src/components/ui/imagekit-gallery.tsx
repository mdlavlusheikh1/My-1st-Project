'use client';

import React, { useState, useEffect } from 'react';
import { transformImageUrl, getImageKitFile, deleteFromImageKit, ImageKitFile } from '@/lib/imagekit-utils';
import { Trash2, Download, Eye, ImageIcon } from 'lucide-react';

interface ImageKitGalleryProps {
  files: ImageKitFile[];
  onDelete?: (fileId: string) => void;
  className?: string;
  showActions?: boolean;
  columns?: 1 | 2 | 3 | 4 | 6;
}

export default function ImageKitGallery({ 
  files, 
  onDelete, 
  className = '',
  showActions = true,
  columns = 3
}: ImageKitGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set());

  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই ফাইলটি মুছে ফেলতে চান?')) {
      return;
    }

    setDeletingFiles(prev => new Set(prev).add(fileId));

    try {
      await deleteFromImageKit(fileId);
      onDelete?.(fileId);
    } catch (error) {
      console.error('Delete error:', error);
      alert('ফাইল মুছতে ব্যর্থ: ' + (error instanceof Error ? error.message : 'অজানা ত্রুটি'));
    } finally {
      setDeletingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };

  const handleDownload = (file: ImageKitFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isImage = (file: ImageKitFile) => {
    return file.type.startsWith('image/');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (files.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">কোনো ফাইল পাওয়া যায়নি</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Gallery Grid */}
      <div className={`grid gap-4 ${gridClass[columns]}`}>
        {files.map((file) => (
          <div
            key={file.fileId}
            className="group relative bg-white rounded-lg border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Image/File Preview */}
            <div className="aspect-square relative overflow-hidden">
              {isImage(file) ? (
                <img
                  src={transformImageUrl(file.url, {
                    width: 300,
                    height: 300,
                    crop: 'force',
                    format: 'webp',
                    quality: 80
                  })}
                  alt={file.name}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setSelectedImage(file.url)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 font-medium">{file.type}</p>
                  </div>
                </div>
              )}

              {/* Loading Overlay */}
              {deletingFiles.has(file.fileId) && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}

              {/* Actions Overlay */}
              {showActions && (
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    {isImage(file) && (
                      <button
                        onClick={() => setSelectedImage(file.url)}
                        className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full transition-all"
                        title="বড় করে দেখুন"
                      >
                        <Eye className="h-4 w-4 text-gray-700" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDownload(file)}
                      className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full transition-all"
                      title="ডাউনলোড করুন"
                    >
                      <Download className="h-4 w-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => handleDelete(file.fileId)}
                      disabled={deletingFiles.has(file.fileId)}
                      className="bg-red-500 bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full transition-all disabled:opacity-50"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="p-3">
              <h4 className="font-medium text-sm text-gray-900 truncate" title={file.name}>
                {file.name}
              </h4>
              <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
                <span>{formatFileSize(file.size)}</span>
                {file.width && file.height && (
                  <span>{file.width}×{file.height}</span>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(file.createdAt).toLocaleDateString('bn-BD')}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={transformImageUrl(selectedImage, {
                width: 1200,
                height: 800,
                crop: 'at_max',
                format: 'webp',
                quality: 90
              })}
              alt="Full size preview"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}