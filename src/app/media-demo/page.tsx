'use client';

import { useState } from 'react';
import MediaUploader from '@/components/ui/media-uploader';
import MediaGallery from '@/components/ui/media-gallery';
import { MediaRecord } from '@/lib/firebase-imagekit';

export default function MediaDemo() {
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Demo configuration - replace with actual user data
  const demoConfig = {
    schoolId: 'school-abc-123',
    teacherEmail: 'mdlavlusheikh220@gmail.com', // From user memory
    studentId: 'student-demo-456',
    teacherId: 'teacher-demo-789'
  };

  const handleUploadSuccess = (media: MediaRecord) => {
    console.log('Media uploaded successfully:', media);
    // Refresh galleries
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ImageKit + Firebase Media Integration
          </h1>
          <p className="text-gray-600">
            Upload to ImageKit.io → Store links in Firebase → Display on website
          </p>
        </div>

        {/* Workflow Explanation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-800 mb-3">🔄 কীভাবে এটি কাজ করে:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-4 rounded border">
              <div className="font-medium text-blue-700 mb-2">১. আপলোড</div>
              <p className="text-gray-600">ফাইল ImageKit.io তে আপলোড হয়</p>
            </div>
            <div className="bg-white p-4 rounded border">
              <div className="font-medium text-blue-700 mb-2">২. সংরক্ষণ</div>
              <p className="text-gray-600">ImageKit URL Firebase এ সেভ হয়</p>
            </div>
            <div className="bg-white p-4 rounded border">
              <div className="font-medium text-blue-700 mb-2">৩. প্রদর্শন</div>
              <p className="text-gray-600">Firebase থেকে URL নিয়ে ওয়েবসাইটে দেখানো হয়</p>
            </div>
          </div>
        </div>

        {/* Upload Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Student Media Upload */}
          <div>
            <h2 className="text-xl font-semibold mb-4">ছাত্র/ছাত্রীর মিডিয়া</h2>
            <MediaUploader
              category="student"
              schoolId={demoConfig.schoolId}
              uploadedBy={demoConfig.teacherEmail}
              userId={demoConfig.studentId}
              onUploadSuccess={handleUploadSuccess}
              className="mb-6"
              acceptedTypes="image/*,video/*"
            />
          </div>

          {/* Teacher Media Upload */}
          <div>
            <h2 className="text-xl font-semibold mb-4">শিক্ষকের মিডিয়া</h2>
            <MediaUploader
              category="teacher"
              schoolId={demoConfig.schoolId}
              uploadedBy={demoConfig.teacherEmail}
              userId={demoConfig.teacherId}
              onUploadSuccess={handleUploadSuccess}
              className="mb-6"
              acceptedTypes="image/*,video/*"
            />
          </div>

          {/* School Media Upload */}
          <div>
            <h2 className="text-xl font-semibold mb-4">স্কুল মিডিয়া</h2>
            <MediaUploader
              category="school"
              schoolId={demoConfig.schoolId}
              uploadedBy={demoConfig.teacherEmail}
              onUploadSuccess={handleUploadSuccess}
              className="mb-6"
              acceptedTypes="image/*,video/*"
            />
          </div>

          {/* Gallery Upload */}
          <div>
            <h2 className="text-xl font-semibold mb-4">গ্যালারি মিডিয়া</h2>
            <MediaUploader
              category="gallery"
              schoolId={demoConfig.schoolId}
              uploadedBy={demoConfig.teacherEmail}
              onUploadSuccess={handleUploadSuccess}
              className="mb-6"
              acceptedTypes="image/*,video/*"
            />
          </div>
        </div>

        {/* Media Galleries */}
        <div className="space-y-12">
          {/* All Media Gallery */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">সব মিডিয়া (Firebase থেকে লোড)</h2>
            <MediaGallery
              key={`all-${refreshKey}`}
              schoolId={demoConfig.schoolId}
              showActions={true}
              columns={4}
              autoRefresh={true}
            />
          </div>

          {/* Student Media Gallery */}
          <div>
            <h2 className="text-xl font-semibold mb-4">ছাত্র/ছাত্রীর মিডিয়া</h2>
            <MediaGallery
              key={`student-${refreshKey}`}
              schoolId={demoConfig.schoolId}
              category="student"
              userId={demoConfig.studentId}
              showActions={true}
              columns={3}
            />
          </div>

          {/* Teacher Media Gallery */}
          <div>
            <h2 className="text-xl font-semibold mb-4">শিক্ষকের মিডিয়া</h2>
            <MediaGallery
              key={`teacher-${refreshKey}`}
              schoolId={demoConfig.schoolId}
              category="teacher"
              userId={demoConfig.teacherId}
              showActions={true}
              columns={3}
            />
          </div>

          {/* School Media Gallery */}
          <div>
            <h2 className="text-xl font-semibold mb-4">স্কুল মিডিয়া</h2>
            <MediaGallery
              key={`school-${refreshKey}`}
              schoolId={demoConfig.schoolId}
              category="school"
              showActions={true}
              columns={2}
            />
          </div>

          {/* Gallery Media */}
          <div>
            <h2 className="text-xl font-semibold mb-4">গ্যালারি</h2>
            <MediaGallery
              key={`gallery-${refreshKey}`}
              schoolId={demoConfig.schoolId}
              category="gallery"
              showActions={true}
              columns={3}
            />
          </div>
        </div>

        {/* Integration Example */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Integration Example: Student Profile</h2>
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <p className="text-gray-600 mb-4">
              এই উদাহরণটি দেখায় কীভাবে আপনার বিদ্যমান স্কুল ম্যানেজমেন্ট সিস্টেমে ImageKit + Firebase মিডিয়া ইন্টিগ্রেশন ব্যবহার করতে হয়:
            </p>
            <div className="bg-gray-50 p-4 rounded text-sm">
              <code>
                import StudentProfileWithMedia from '@/components/StudentProfileWithMedia';<br/><br/>
                &lt;StudentProfileWithMedia<br/>
                &nbsp;&nbsp;studentId="student-123"<br/>
                &nbsp;&nbsp;schoolId="{demoConfig.schoolId}"<br/>
                &nbsp;&nbsp;teacherEmail="{demoConfig.teacherEmail}"<br/>
                /&gt;
              </code>
            </div>
          </div>
        </div>
        <div className="mt-12 bg-white rounded-lg border shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">🔧 টেকনিক্যাল বিস্তারিত</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">ImageKit.io বৈশিষ্ট্য:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• স্বয়ংক্রিয় WebP কনভার্শন</li>
                <li>• রিয়েল-টাইম ইমেজ ট্রান্সফরমেশন</li>
                <li>• CDN ডেলিভারি</li>
                <li>• ভিডিও অপ্টিমাইজেশন</li>
                <li>• সিকিউর URL</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Firebase ইন্টিগ্রেশন:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• মিডিয়া মেটাডেটা স্টোরেজ</li>
                <li>• রিয়েল-টাইম আপডেট</li>
                <li>• ইউজার/স্কুল ভিত্তিক ফিল্টারিং</li>
                <li>• সিকিউরিটি রুলস</li>
                <li>• অটোমেটিক ইনডেক্সিং</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded">
            <h4 className="font-medium mb-2">ব্যবহৃত টেকনোলজি:</h4>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">Next.js 15</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Firebase Firestore</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">ImageKit.io</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">TypeScript</span>
              <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded">Tailwind CSS</span>
              <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded">Lucide Icons</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}