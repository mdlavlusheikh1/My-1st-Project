'use client';

import React, { useState, useRef } from 'react';
import { uploadStudentPhoto, uploadTeacherPhoto, uploadSchoolLogo, uploadDocument, transformImageUrl, IMAGEKIT_FOLDERS } from '@/lib/imagekit-utils';
import { Upload, Image as ImageIcon, FileText, User, School } from 'lucide-react';

interface ImageKitUploaderProps {
  type: 'student' | 'teacher' | 'school' | 'document';
  userId?: string;
  schoolId: string;
  onUploadSuccess?: (file: any) => void;
  className?: string;
}

export default function ImageKitUploader({ 
  type, 
  userId, 
  schoolId, 
  onUploadSuccess,
  className = '' 
}: ImageKitUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getUploadConfig = () => {
    switch (type) {
      case 'student':
        return {
          title: 'ছাত্র/ছাত্রীর ছবি আপলোড',
          icon: <User className="h-5 w-5" />,
          accept: 'image/*',
          maxSize: 5 * 1024 * 1024, // 5MB
        };
      case 'teacher':
        return {
          title: 'শিক্ষকের ছবি আপলোড',
          icon: <User className="h-5 w-5" />,
          accept: 'image/*',
          maxSize: 5 * 1024 * 1024, // 5MB
        };
      case 'school':
        return {
          title: 'স্কুল লোগো আপলোড',
          icon: <School className="h-5 w-5" />,
          accept: 'image/*',
          maxSize: 2 * 1024 * 1024, // 2MB
        };
      case 'document':
        return {
          title: 'ডকুমেন্ট আপলোড',
          icon: <FileText className="h-5 w-5" />,
          accept: 'image/*,application/pdf,.doc,.docx',
          maxSize: 10 * 1024 * 1024, // 10MB
        };
      default:
        return {
          title: 'ফাইল আপলোড',
          icon: <Upload className="h-5 w-5" />,
          accept: '*/*',
          maxSize: 10 * 1024 * 1024, // 10MB
        };
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccess(message);
      setError('');
      setTimeout(() => setSuccess(''), 5000);
    } else {
      setError(message);
      setSuccess('');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const config = getUploadConfig();
    
    // Validate file size
    if (file.size > config.maxSize) {
      showToast(`ফাইল সাইজ ${config.maxSize / (1024 * 1024)}MB এর কম হতে হবে`, 'error');
      return;
    }

    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    if (!userId && type !== 'school') {
      showToast('ইউজার আইডি প্রয়োজন', 'error');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      let uploadedFile;

      switch (type) {
        case 'student':
          uploadedFile = await uploadStudentPhoto(file, userId!, schoolId);
          break;
        case 'teacher':
          uploadedFile = await uploadTeacherPhoto(file, userId!, schoolId);
          break;
        case 'school':
          uploadedFile = await uploadSchoolLogo(file, schoolId);
          break;
        case 'document':
          uploadedFile = await uploadDocument(file, 'document', userId!, schoolId);
          break;
        default:
          throw new Error('অজানা আপলোড টাইপ');
      }

      setUploadedFile(uploadedFile);
      onUploadSuccess?.(uploadedFile);
      showToast('ফাইল সফলভাবে আপলোড হয়েছে', 'success');

    } catch (error) {
      console.error('Upload error:', error);
      showToast(error instanceof Error ? error.message : 'অজানা ত্রুটি ঘটেছে', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const config = getUploadConfig();

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          {config.icon}
          {config.title}
        </h3>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* File Input */}
        <div>
          <label htmlFor={`file-${type}`} className="block text-sm font-medium text-gray-700 mb-1">
            ফাইল নির্বাচন করুন
          </label>
          <input
            id={`file-${type}`}
            type="file"
            ref={fileInputRef}
            accept={config.accept}
            onChange={handleFileSelect}
            disabled={isUploading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <p className="text-sm text-gray-500 mt-1">
            সর্বোচ্চ সাইজ: {config.maxSize / (1024 * 1024)}MB
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {/* Loading */}
        {isUploading && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">আপলোড হচ্ছে...</span>
          </div>
        )}

        {/* Upload Result */}
        {uploadedFile && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-green-600">
              আপলোড সম্পন্ন!
            </p>
            
            {uploadedFile.type.startsWith('image/') && (
              <div className="mt-2">
                <img
                  src={transformImageUrl(uploadedFile.url, {
                    width: 200,
                    height: 200,
                    crop: 'maintain_ratio',
                    format: 'webp',
                    quality: 80
                  })}
                  alt="Uploaded preview"
                  className="rounded-lg border max-w-[200px] shadow-sm"
                />
              </div>
            )}

            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              <p><strong>ফাইল নাম:</strong> {uploadedFile.name}</p>
              <p><strong>সাইজ:</strong> {(uploadedFile.size / 1024).toFixed(1)} KB</p>
              <p><strong>URL:</strong> <a href={uploadedFile.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">দেখুন</a></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}