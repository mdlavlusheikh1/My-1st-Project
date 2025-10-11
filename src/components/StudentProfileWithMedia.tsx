'use client';

import React, { useState, useEffect } from 'react';
import { MediaRecord, getMediaFromFirebase } from '@/lib/firebase-imagekit';
import { getUserProfileImage, getSchoolLogo } from '@/lib/media-helpers';
import MediaUploader from '@/components/ui/media-uploader';
import MediaGallery from '@/components/ui/media-gallery';
import { User, School, Camera } from 'lucide-react';

interface StudentProfileProps {
  studentId: string;
  schoolId: string;
  teacherEmail: string;
}

export default function StudentProfileWithMedia({ 
  studentId, 
  schoolId, 
  teacherEmail 
}: StudentProfileProps) {
  const [studentMedia, setStudentMedia] = useState<MediaRecord[]>([]);
  const [schoolMedia, setSchoolMedia] = useState<MediaRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Sample student data
  const studentData = {
    name: 'আব্দুল করিম',
    studentId: 'STD-2024-001',
    class: 'দশম শ্রেণী',
    guardianName: 'মোহাম্মদ রহিম'
  };

  useEffect(() => {
    loadMediaData();
  }, [studentId, schoolId]);

  const loadMediaData = async () => {
    try {
      setLoading(true);
      const studentMediaData = await getMediaFromFirebase(schoolId, 'student', studentId);
      setStudentMedia(studentMediaData);
      
      const schoolMediaData = await getMediaFromFirebase(schoolId, 'school');
      setSchoolMedia(schoolMediaData);
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setLoading(false);
    }
  };

  const profileImageUrl = getUserProfileImage(studentMedia, studentId, 'large');
  const schoolLogoUrl = getSchoolLogo(schoolMedia, 'medium');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex items-center space-x-4">
          {schoolLogoUrl && (
            <img src={schoolLogoUrl} alt="School Logo" className="w-16 h-16 object-contain" />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ছাত্র প্রোফাইল</h1>
            <p className="text-gray-600">ImageKit + Firebase Integration</p>
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-start space-x-6">
            {/* Profile Image from ImageKit */}
            <div className="flex-shrink-0">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt={studentData.name}
                  className="w-32 h-32 rounded-lg object-cover border-4 border-blue-100"
                />
              ) : (
                <div className="w-32 h-32 rounded-lg bg-gray-100 border-4 border-gray-200 flex items-center justify-center">
                  <User className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Student Details */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{studentData.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">ছাত্র আইডি:</span>
                  <span className="ml-2 text-gray-600">{studentData.studentId}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">শ্রেণী:</span>
                  <span className="ml-2 text-gray-600">{studentData.class}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">অভিভাবক:</span>
                  <span className="ml-2 text-gray-600">{studentData.guardianName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div>
          <MediaUploader
            category="student"
            schoolId={schoolId}
            uploadedBy={teacherEmail}
            userId={studentId}
            onUploadSuccess={loadMediaData}
            acceptedTypes="image/*,video/*"
          />
        </div>
      </div>

      {/* Gallery Section */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Camera className="h-5 w-5" />
          ছাত্রের মিডিয়া গ্যালারি
        </h3>
        <MediaGallery
          schoolId={schoolId}
          category="student"
          userId={studentId}
          showActions={true}
          columns={4}
        />
      </div>
    </div>
  );
}