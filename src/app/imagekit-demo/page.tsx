'use client';

import { useState } from 'react';
import ImageKitUploader from '@/components/ui/imagekit-uploader';
import ImageKitGallery from '@/components/ui/imagekit-gallery';
import { ImageKitFile } from '@/lib/imagekit-utils';

export default function ImageKitDemo() {
  const [studentFiles, setStudentFiles] = useState<ImageKitFile[]>([]);
  const [teacherFiles, setTeacherFiles] = useState<ImageKitFile[]>([]);
  const [schoolFiles, setSchoolFiles] = useState<ImageKitFile[]>([]);
  const [documentFiles, setDocumentFiles] = useState<ImageKitFile[]>([]);

  const handleStudentUpload = (file: ImageKitFile) => {
    setStudentFiles(prev => [file, ...prev]);
  };

  const handleTeacherUpload = (file: ImageKitFile) => {
    setTeacherFiles(prev => [file, ...prev]);
  };

  const handleSchoolUpload = (file: ImageKitFile) => {
    setSchoolFiles(prev => [file, ...prev]);
  };

  const handleDocumentUpload = (file: ImageKitFile) => {
    setDocumentFiles(prev => [file, ...prev]);
  };

  const handleDeleteStudent = (fileId: string) => {
    setStudentFiles(prev => prev.filter(f => f.fileId !== fileId));
  };

  const handleDeleteTeacher = (fileId: string) => {
    setTeacherFiles(prev => prev.filter(f => f.fileId !== fileId));
  };

  const handleDeleteSchool = (fileId: string) => {
    setSchoolFiles(prev => prev.filter(f => f.fileId !== fileId));
  };

  const handleDeleteDocument = (fileId: string) => {
    setDocumentFiles(prev => prev.filter(f => f.fileId !== fileId));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ImageKit.io ইন্টিগ্রেশন ডেমো
          </h1>
          <p className="text-gray-600">
            স্কুল ম্যানেজমেন্ট সিস্টেমের জন্য ইমেজ এবং ভিডিও স্টোরেজ
          </p>
        </div>

        {/* Configuration Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <h3 className="font-semibold text-yellow-800 mb-2">
            📝 সেটআপ প্রয়োজন
          </h3>
          <p className="text-yellow-700 text-sm">
            ImageKit.io ব্যবহার করার জন্য আপনার .env.local ফাইলে নিম্নলিখিত কনফিগারেশন যোগ করুন:
          </p>
          <ul className="list-disc list-inside text-yellow-700 text-sm mt-2 space-y-1">
            <li>NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY</li>
            <li>NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT</li>
            <li>IMAGEKIT_PRIVATE_KEY</li>
          </ul>
          <p className="text-yellow-700 text-sm mt-2">
            এই কী গুলো আপনি <a href="https://imagekit.io/dashboard/developer/api-keys" target="_blank" rel="noopener noreferrer" className="underline">ImageKit.io Dashboard</a> থেকে পেতে পারেন।
          </p>
        </div>

        {/* Upload Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Student Photo Upload */}
          <div>
            <h2 className="text-xl font-semibold mb-4">ছাত্র/ছাত্রীর ছবি</h2>
            <ImageKitUploader
              type="student"
              userId="student-123"
              schoolId="school-abc"
              onUploadSuccess={handleStudentUpload}
              className="mb-6"
            />
            <ImageKitGallery
              files={studentFiles}
              onDelete={handleDeleteStudent}
              columns={3}
            />
          </div>

          {/* Teacher Photo Upload */}
          <div>
            <h2 className="text-xl font-semibold mb-4">শিক্ষকের ছবি</h2>
            <ImageKitUploader
              type="teacher"
              userId="teacher-456"
              schoolId="school-abc"
              onUploadSuccess={handleTeacherUpload}
              className="mb-6"
            />
            <ImageKitGallery
              files={teacherFiles}
              onDelete={handleDeleteTeacher}
              columns={3}
            />
          </div>

          {/* School Logo Upload */}
          <div>
            <h2 className="text-xl font-semibold mb-4">স্কুল লোগো</h2>
            <ImageKitUploader
              type="school"
              schoolId="school-abc"
              onUploadSuccess={handleSchoolUpload}
              className="mb-6"
            />
            <ImageKitGallery
              files={schoolFiles}
              onDelete={handleDeleteSchool}
              columns={2}
            />
          </div>

          {/* Document Upload */}
          <div>
            <h2 className="text-xl font-semibold mb-4">ডকুমেন্ট</h2>
            <ImageKitUploader
              type="document"
              userId="user-789"
              schoolId="school-abc"
              onUploadSuccess={handleDocumentUpload}
              className="mb-6"
            />
            <ImageKitGallery
              files={documentFiles}
              onDelete={handleDeleteDocument}
              columns={2}
            />
          </div>
        </div>

        {/* Features List */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">🚀 বৈশিষ্ট্যসমূহ</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">স্বয়ংক্রিয় অপ্টিমাইজেশন</h4>
                <p className="text-sm text-gray-600">ইমেজ স্বয়ংক্রিয়ভাবে WebP ফরম্যাটে কনভার্ট ও কম্প্রেস হয়</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">রিয়েল-টাইম ট্রান্সফরমেশন</h4>
                <p className="text-sm text-gray-600">URL এর মাধ্যমে ইমেজ রিসাইজ, ক্রপ, ফিল্টার প্রয়োগ</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">স্মার্ট ক্রপিং</h4>
                <p className="text-sm text-gray-600">AI দ্বারা ফেস ডিটেকশন ও স্মার্ট ক্রপিং</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">CDN ডেলিভারি</h4>
                <p className="text-sm text-gray-600">বিশ্বব্যাপী CDN নেটওয়ার্কের মাধ্যমে দ্রুত লোডিং</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">সিকিউর স্টোরেজ</h4>
                <p className="text-sm text-gray-600">এনক্রিপ্টেড ও সিকিউর ক্লাউড স্টোরেজ</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">ফোল্ডার ব্যবস্থাপনা</h4>
                <p className="text-sm text-gray-600">স্কুল ভিত্তিক সুসংগঠিত ফোল্ডার স্ট্রাকচার</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}