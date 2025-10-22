'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { emailUtils, settingsQueries, studentQueries, classQueries } from '@/lib/database-queries';
import { IKContext } from 'imagekitio-react';
import {
  Upload,
  Camera,
  AlertCircle,
  CheckCircle,
  User,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Calendar,
  FileText,
  ArrowLeft,
  Loader2,
  Star,
  Award,
  BookOpen,
  Heart,
  Shield,
  Send,
  Users
} from 'lucide-react';

function PublicAdmissionPage() {
  const [classes, setClasses] = useState<string[]>([]);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    class: '',
    studentId: '',
    rollNumber: '',
    guardianName: '',
    guardianPhone: '',
    address: '',
    profileImage: null as File | null,
    dateOfBirth: '',
    // Parents Information
    fatherName: '',
    fatherPhone: '',
    fatherOccupation: '',
    motherName: '',
    motherPhone: '',
    motherOccupation: '',
    emergencyContact: '',
    emergencyRelation: '',
    // Previous School Info
    previousSchool: '',
    previousClass: '',
    reasonForLeaving: '',
    previousGPA: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  // Generate sequential student ID
  const generateStudentId = async () => {
    try {
      console.log('🔢 Generating new student ID...');
      const students = await studentQueries.getAllStudents();
      console.log('📊 Total students found:', students.length);
      
      // Log all students with their IDs for debugging
      students.forEach((student, index) => {
        console.log(`📝 Student ${index + 1}:`, {
          name: student.name,
          studentId: student.studentId,
          isApproved: student.isApproved
        });
      });
      
      // Get all valid sequential student IDs (STD001, STD002, etc.)
      const sequentialStudentIds = students
        .map(s => s.studentId)
        .filter((id): id is string => {
          if (!id || !id.startsWith('STD')) return false;
          const numPart = id.replace('STD', '');
          const num = parseInt(numPart);
          return !isNaN(num) && num > 0 && num < 1000; // Only valid sequential IDs
        })
        .map(id => {
          const numPart = id.replace('STD', '');
          const num = parseInt(numPart);
          console.log('🔍 Processing CHECKED ID:', id, '-> Number:', num);
          return num;
        })
        .sort((a, b) => a - b); // Sort ascending

      console.log('📋 Valid sequential student IDs:', sequentialStudentIds);
      
      // Find the next sequential number
      let nextNumber = 1;
      if (sequentialStudentIds.length > 0) {
        const maxNumber = Math.max(...sequentialStudentIds);
        nextNumber = maxNumber + 1;
      }
      
      const newId = `STD${nextNumber.toString().padStart(3, '0')}`;
      
      console.log('🔢 Next sequential number:', nextNumber);
      console.log('✅ Generated new student ID:', newId);
      
      return newId;
    } catch (error) {
      console.error('❌ Error generating student ID:', error);
      // Use simple sequential ID as fallback
      const fallbackId = `STD001`;
      console.log('🔄 Using fallback ID:', fallbackId);
      return fallbackId;
    }
  };

  // Load classes from Firebase
  useEffect(() => {
    const loadClassData = async () => {
      try {
        const allClasses = await classQueries.getAllClasses();
        const classNames = [...new Set(allClasses.map(cls => cls.className).filter((name): name is string => Boolean(name)))];

        setClasses(classNames.length > 0 ? classNames : ['১ম শ্রেণি', '২য় শ্রেণি', '৩য় শ্রেণি', '৪র্থ শ্রেণি', '৫ম শ্রেণি', '৬ষ্ঠ শ্রেণি', '৭ম শ্রেণি', '৮ম শ্রেণি', '৯ম শ্রেণি', '১০ম শ্রেণি']);
      } catch (error) {
        console.error('Error loading class data:', error);
        setClasses(['১ম শ্রেণি', '২য় শ্রেণি', '৩য় শ্রেণি', '৪র্থ শ্রেণি', '৫ম শ্রেণি', '৬ষ্ঠ শ্রেণি', '৭ম শ্রেণি', '৮ম শ্রেণি', '৯ম শ্রেণি', '১০ম শ্রেণি']);
      }
    };

    loadClassData();
  }, []);

  // Auto-generate email when name is typed
  useEffect(() => {
    if (newStudent.name.trim()) {
      const generatedEmail = emailUtils.generateStudentEmail(
        newStudent.name,
        newStudent.studentId || '001',
        'iqra'
      );
      setNewStudent(prev => ({ ...prev, email: generatedEmail }));
    } else {
      setNewStudent(prev => ({ ...prev, email: '' }));
    }
  }, [newStudent.name, newStudent.studentId]);

  const handleInputChange = (field: string, value: string) => {
    setNewStudent({ ...newStudent, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ ...errors, profileImage: 'ফাইলের আকার ১০MB এর বেশি হতে পারবে না' });
        return;
      }

      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, profileImage: 'শুধুমাত্র ছবি ফাইল আপলোড করুন' });
        return;
      }

      try {
        setErrors({ ...errors, profileImage: '' });
        setIsUploading(true);
        setUploadProgress(0);
        
        // Show preview immediately
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
        
        // Upload to ImageKit
        await uploadToImageKit(file);
      } catch (error) {
        console.error('Error handling file:', error);
        setErrors({ ...errors, profileImage: 'ফাইল প্রসেস করতে সমস্যা হয়েছে' });
        setIsUploading(false);
        setUploadProgress(0);
      }
    }
  };

  const uploadToImageKit = async (file: File) => {
    try {
      console.log('📸 Starting ImageKit upload...');
      
      // Get authentication parameters
      console.log('🔐 Getting authentication parameters...');
      const authResponse = await fetch('/api/imagekit/auth');
      console.log('🔐 Auth response status:', authResponse.status);
      
      const authData = await authResponse.json();
      console.log('🔐 Auth data:', authData);
      
      if (!authResponse.ok) {
        console.error('❌ Authentication failed:', authData);
        throw new Error(authData.error || 'Authentication failed');
      }
      
      // Create form data
      const formData = new FormData();
      const fileName = `student-${newStudent.studentId || 'temp'}-${Date.now()}`;
      
      formData.append('file', file);
      formData.append('fileName', fileName);
      formData.append('folder', '/school-management/students');
      formData.append('tags', 'student,profile,admission');
      formData.append('publicKey', process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || 'public_SyiCmoG2Z9e4m5xzB6IRRhtyY/o=');
      formData.append('token', authData.token);
      formData.append('expire', authData.expire.toString());
      formData.append('signature', authData.signature);
      
      console.log('📦 Form data prepared:');
      console.log('📦 File name:', fileName);
      console.log('📦 File size:', file.size);
      console.log('📦 File type:', file.type);
      console.log('📦 Public Key:', process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || 'public_SyiCmoG2Z9e4m5xzB6IRRhtyY/o=');
      console.log('📦 Token:', authData.token);
      console.log('📦 Expire:', authData.expire);
      console.log('📦 Signature:', authData.signature);
      
      // Upload with progress tracking
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
          console.log(`📊 Upload progress: ${progress}%`);
        }
      });
      
      xhr.addEventListener('load', () => {
        console.log('📡 Upload response status:', xhr.status);
        console.log('📡 Upload response:', xhr.responseText);
        
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log('✅ ImageKit upload successful:', response);
            setUploadedImageUrl(response.url);
            setImagePreview(response.url);
            setIsUploading(false);
            setUploadProgress(100);
            setErrors({ ...errors, profileImage: '' });
          } catch (parseError) {
            console.error('❌ Failed to parse upload response:', parseError);
            throw new Error('Invalid upload response');
          }
        } else {
          console.error('❌ Upload failed with status:', xhr.status);
          console.error('❌ Upload response:', xhr.responseText);
          throw new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`);
        }
      });
      
      xhr.addEventListener('error', (error) => {
        console.error('❌ Upload network error:', error);
        throw new Error('Network error during upload');
      });
      
      // Start upload
      xhr.open('POST', 'https://upload.imagekit.io/api/v1/files/upload');
      xhr.send(formData);
      
    } catch (error) {
      console.error('❌ ImageKit upload error:', error);
      setIsUploading(false);
      setUploadProgress(0);
      setUploadedImageUrl(null);
      setImagePreview(null);
      setErrors({ ...errors, profileImage: 'ছবি আপলোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' });
    }
  };

  const removeImage = () => {
    setNewStudent({ ...newStudent, profileImage: null });
    setImagePreview(null);
    setUploadedImageUrl(null);
    setUploadProgress(0);
    setIsUploading(false);
  };


  const generateEmail = async () => {
    if (!newStudent.name.trim()) {
      setErrors({ ...errors, email: 'নাম দিয়ে ইমেইল তৈরি করুন' });
      return;
    }
    
    // Generate student ID if not available
    let studentIdForEmail = newStudent.studentId;
    if (!studentIdForEmail.trim()) {
      studentIdForEmail = await generateStudentId();
      setNewStudent(prev => ({ ...prev, studentId: studentIdForEmail }));
    }
    
    const generatedEmail = emailUtils.generateStudentEmail(newStudent.name, studentIdForEmail);
    setNewStudent(prev => ({ ...prev, email: generatedEmail }));
  };

  const validateForm = () => {
    console.log('🔍 Validating form...');
    console.log('📝 Current form data:', newStudent);

    const newErrors: Record<string, string> = {};

    // Check name
    if (!newStudent.name.trim()) {
      newErrors.name = 'নাম প্রয়োজনীয়';
      console.log('❌ Name validation failed: empty');
    } else {
      console.log('✅ Name validation passed:', newStudent.name);
    }

    // Check class
    if (!newStudent.class.trim()) {
      newErrors.class = 'ক্লাস নির্বাচন করুন';
      console.log('❌ Class validation failed: empty');
    } else {
      console.log('✅ Class validation passed:', newStudent.class);
    }

    // Check email format if provided
    if (newStudent.email.trim()) {
      if (!/\S+@\S+\.\S+/.test(newStudent.email)) {
        newErrors.email = 'সঠিক ইমেইল ফরম্যাট দিন';
        console.log('❌ Email validation failed: invalid format');
      } else {
        console.log('✅ Email validation passed:', newStudent.email);
      }
    } else {
      console.log('✅ Email validation skipped: empty (optional)');
    }

    // Check phone number
    if (!newStudent.phoneNumber.trim()) {
      newErrors.phoneNumber = 'ফোন নম্বর প্রয়োজনীয়';
      console.log('❌ Phone validation failed: empty');
    } else if (!/^01[3-9]\d{8}$/.test(newStudent.phoneNumber)) {
      newErrors.phoneNumber = 'সঠিক ফোন নম্বর দিন';
      console.log('❌ Phone validation failed: invalid format -', newStudent.phoneNumber);
    } else {
      console.log('✅ Phone validation passed:', newStudent.phoneNumber);
    }

    // Check guardian phone if provided
    if (newStudent.guardianPhone && newStudent.guardianPhone.trim()) {
      if (!/^01[3-9]\d{8}$/.test(newStudent.guardianPhone)) {
        newErrors.guardianPhone = 'সঠিক ফোন নম্বর দিন';
        console.log('❌ Guardian phone validation failed: invalid format');
      } else {
        console.log('✅ Guardian phone validation passed:', newStudent.guardianPhone);
      }
    }

    console.log('❌ Final validation errors:', newErrors);
    console.log('📊 Total errors count:', Object.keys(newErrors).length);

    Object.entries(newErrors).forEach(([field, error]) => {
      console.log(`❌ ${field}: ${error}`);
    });

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('✅ Form is valid:', isValid);
    return isValid;
  };

  const handleSaveStudent = async () => {
    console.log('🔄 Starting form submission...');
    console.log('📝 Form data:', newStudent);
    console.log('📊 Current step:', currentStep);

    // Ensure we're on the final step
    if (currentStep < 3) {
      console.log('❌ Not on final step, moving to step 3');
      setCurrentStep(3);
      return;
    }

    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    console.log('✅ Form validation passed');
    setIsSaving(true);

    try {
      console.log('🔍 Getting settings...');
      const settings = await settingsQueries.getSettings();
      console.log('⚙️ Settings:', settings);

      // Always generate new student ID
      console.log('🔢 Generating new student ID...');
      let finalStudentId = await generateStudentId();
      console.log('✅ Generated student ID:', finalStudentId);
      
      // Ensure we get a proper sequential ID, not timestamp-based
      if (finalStudentId.includes('STD') && finalStudentId.length > 6) {
        console.log('⚠️ Got timestamp-based ID, generating proper sequential ID');
        // Get total students count and generate proper sequential ID
        const students = await studentQueries.getAllStudents();
        const sequentialNumber = students.length + 1;
        finalStudentId = `STD${sequentialNumber.toString().padStart(3, '0')}`;
        console.log('🔄 Using sequential ID:', finalStudentId);
      }

      // Use uploaded ImageKit URL
      const profileImageUrl = uploadedImageUrl || '';

      const studentData = {
        name: newStudent.name,
        displayName: newStudent.name,
        email: newStudent.email,
        phoneNumber: newStudent.phoneNumber,
        class: newStudent.class,
        studentId: finalStudentId,
        rollNumber: newStudent.rollNumber,
        guardianName: newStudent.guardianName,
        guardianPhone: newStudent.guardianPhone,
        address: newStudent.address,
        dateOfBirth: newStudent.dateOfBirth,
        profileImage: profileImageUrl, // Add profile image
        // Parents Information
        fatherName: newStudent.fatherName,
        fatherPhone: newStudent.fatherPhone,
        fatherOccupation: newStudent.fatherOccupation,
        motherName: newStudent.motherName,
        motherPhone: newStudent.motherPhone,
        motherOccupation: newStudent.motherOccupation,
        emergencyContact: newStudent.emergencyContact,
        emergencyRelation: newStudent.emergencyRelation,
        // Previous School Info
        previousSchool: newStudent.previousSchool,
        previousClass: newStudent.previousClass,
        reasonForLeaving: newStudent.reasonForLeaving,
        previousGPA: newStudent.previousGPA,
        role: 'student' as const,
        schoolId: settings?.schoolCode || 'IQRA-2025',
        schoolName: settings?.schoolName || 'ইকরা ইসলামিক স্কুল',
        isActive: false, // Inactive until approved
        isApproved: false, // For online admission, needs approval
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('💾 Creating student with data:', studentData);
      const result = await studentQueries.createStudentWithAutoEmail(studentData as any);
      console.log('✅ Student created with ID:', result);

      // Update the form with the generated student ID for display
      setNewStudent(prev => ({ ...prev, studentId: finalStudentId }));
      console.log('📝 Updated form with student ID:', finalStudentId);

      setShowSuccess(true);
    } catch (error) {
      console.error('❌ Error saving student:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setErrors({ general: 'ভর্তি আবেদন জমা দিতে ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন। ত্রুটি: ' + errorMessage });
    } finally {
      setIsSaving(false);
    }
  };

  const nextStep = () => {
    console.log('⏭️ Next step clicked, current step:', currentStep);

    // Validate current step before proceeding
    if (currentStep === 1) {
      const step1Errors: Record<string, string> = {};
      if (!newStudent.name.trim()) step1Errors.name = 'নাম প্রয়োজনীয়';
      if (!newStudent.class.trim()) step1Errors.class = 'ক্লাস নির্বাচন করুন';
      if (!newStudent.phoneNumber.trim()) step1Errors.phoneNumber = 'ফোন নম্বর প্রয়োজনীয়';

      if (Object.keys(step1Errors).length > 0) {
        console.log('❌ Step 1 validation failed:', step1Errors);
        setErrors(step1Errors);
        return;
      }
    }

    if (currentStep < 3) {
      console.log('⏭️ Moving to step:', currentStep + 1);
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-green-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="w-28 h-28 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-2xl">
                <GraduationCap className="w-14 h-14 text-white" />
              </div>
            </div>
            <h1 className="text-6xl font-bold mb-6 text-shadow-lg">ভর্তি আবেদন</h1>
            <p className="text-2xl text-blue-100 mb-10 max-w-4xl mx-auto leading-relaxed">
              ইকরা ইসলামিক স্কুলে আপনার সন্তানের ভবিষ্যৎ গড়ে তুলুন। 
              অনলাইনে সহজেই ভর্তি আবেদন করুন এবং উত্তম শিক্ষার সুযোগ গ্রহণ করুন।
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-base">
              <div className="flex items-center space-x-3 bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm">
                <Shield className="w-6 h-6" />
                <span className="font-medium">নিরাপদ পরিবেশ</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm">
                <Award className="w-6 h-6" />
                <span className="font-medium">মানসম্পন্ন শিক্ষা</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm">
                <Heart className="w-6 h-6" />
                <span className="font-medium">ইসলামিক মূল্যবোধ</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm">
                <Users className="w-6 h-6" />
                <span className="font-medium">দক্ষ শিক্ষক</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-6xl mx-auto p-4 lg:p-8 -mt-8 relative z-10">
        {/* Progress Indicator */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">ভর্তি আবেদন ফর্ম</h2>
                <p className="text-gray-600">সহজ ৩টি ধাপে আবেদন সম্পন্ন করুন</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">ধাপ {currentStep}/3</div>
              <div className="text-sm text-gray-500">প্রগতি</div>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 rounded-full transform -translate-y-1/2 z-0"></div>
            <div className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-blue-600 to-green-600 rounded-full transform -translate-y-1/2 z-10" 
                 style={{width: `${(currentStep - 1) * 50}%`}}></div>
            
            <div className={`flex flex-col items-center space-y-2 relative z-20 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                currentStep >= 1 ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg' : 'bg-gray-300 text-gray-600'
              }`}>১</div>
              <span className="text-sm font-medium text-center">ব্যক্তিগত<br/>তথ্য</span>
            </div>
            
            <div className={`flex flex-col items-center space-y-2 relative z-20 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                currentStep >= 2 ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg' : 'bg-gray-300 text-gray-600'
              }`}>২</div>
              <span className="text-sm font-medium text-center">অভিভাবকের<br/>তথ্য</span>
            </div>
            
            <div className={`flex flex-col items-center space-y-2 relative z-20 ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                currentStep >= 3 ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg' : 'bg-gray-300 text-gray-600'
              }`}>৩</div>
              <span className="text-sm font-medium text-center">অন্যান্য<br/>তথ্য</span>
            </div>
          </div>
        </div>

        {/* General Error Display */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">ত্রুটি</span>
            </div>
            <p className="text-red-700 mt-2 text-sm">{errors.general}</p>
          </div>
        )}

        {/* Form Sections */}
        <div className="space-y-8">
          {/* Step 1: Profile Image & Basic Info */}
          {currentStep === 1 && (
            <>
              {/* Profile Image Upload */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">প্রোফাইল ছবি</h3>
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">ঐচ্ছিক</span>
                </div>
                
                <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
                  <div className="relative">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-green-50 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors overflow-hidden">
                      {isUploading ? (
                        <div className="text-center w-full">
                          <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-2 animate-spin" />
                          <p className="text-xs text-blue-600 font-medium mb-2">আপলোড হচ্ছে...</p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-600">{uploadProgress}%</p>
                        </div>
                      ) : (imagePreview || uploadedImageUrl) ? (
                        <img
                          src={imagePreview || uploadedImageUrl || ''}
                          alt="Profile preview"
                          className="w-full h-full rounded-full object-cover shadow-lg"
                        />
                      ) : (
                        <div className="text-center">
                          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-500">ছবি যোগ করুন</p>
                        </div>
                      )}
                    </div>
                    {(imagePreview || uploadedImageUrl) && !isUploading && (
                      <button
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                        title="ছবি সরান"
                      >
                        <span className="text-xs">×</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ছবি আপলোড করুন</label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          disabled={isUploading}
                        />
                        <div className={`cursor-pointer inline-flex items-center space-x-2 px-6 py-3 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                          isUploading 
                            ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white' 
                            : 'bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-blue-700 hover:to-green-700'
                        }`}>
                          {isUploading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>আপলোড হচ্ছে... {uploadProgress}%</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              <span>ছবি নির্বাচন করুন</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {errors.profileImage && (
                      <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.profileImage}</span>
                      </div>
                    )}
                    
                    {(imagePreview || uploadedImageUrl) && !isUploading && (
                      <div className="flex items-center space-x-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg">
                        <CheckCircle className="w-4 h-4" />
                        <span>ছবি সফলভাবে আপলোড হয়েছে!</span>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>• সর্বোচ্চ ১০MB আকারের ছবি</p>
                      <p>• JPG, PNG, GIF ফরম্যাট সমর্থিত</p>
                      <p>• ছবি পরিষ্কার এবং স্পষ্ট হতে হবে</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Information */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">শিক্ষার্থীর তথ্য</h3>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">প্রয়োজনীয়</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>শিক্ষার্থীর নাম *</span>
                    </label>
                    <input
                      type="text"
                      value={newStudent.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                      }`}
                      placeholder="যেমন: মোহাম্মদ আব্দুল্লাহ আল মামুন"
                    />
                    {errors.name && (
                      <div className="flex items-center space-x-2 text-red-600 text-sm mt-2 bg-red-50 p-2 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.name}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span>ইমেইল ঠিকানা</span>
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">ঐচ্ছিক</span>
                    </label>
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <input
                          type="email"
                          value={newStudent.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                            errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                          } ${newStudent.email && newStudent.name ? 'bg-green-50 border-green-200' : ''}`}
                          placeholder="নাম লিখলে স্বয়ংক্রিয়ভাবে তৈরি হবে..."
                        />
                        <button
                          type="button"
                          onClick={generateEmail}
                          className="px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm whitespace-nowrap transition-all transform hover:scale-105"
                          title="ইমেইল তৈরি করুন"
                        >
                          <Star className="w-4 h-4 mr-1 inline" />
                          তৈরি করুন
                        </button>
                      </div>
                      
                      {errors.email && (
                        <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.email}</span>
                        </div>
                      )}
                      
                      {newStudent.email && newStudent.name && (
                        <div className="flex items-center space-x-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg">
                          <CheckCircle className="w-4 h-4" />
                          <span>স্বয়ংক্রিয়ভাবে তৈরি হয়েছে</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>ফোন নম্বর *</span>
                    </label>
                    <input
                      type="tel"
                      value={newStudent.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.phoneNumber ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                      }`}
                      placeholder="০১৭১২৩৪৫৬৭৮"
                      required
                    />
                    {errors.phoneNumber && (
                      <div className="flex items-center space-x-2 text-red-600 text-sm mt-2 bg-red-50 p-2 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.phoneNumber}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                      <BookOpen className="w-4 h-4 text-gray-500" />
                      <span>ক্লাস নির্বাচন করুন *</span>
                    </label>
                    <select
                      value={newStudent.class}
                      onChange={(e) => handleInputChange('class', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.class ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      <option value="">ক্লাস নির্বাচন করুন</option>
                      {classes.map((className) => (
                        <option key={className} value={className}>
                          {className}
                        </option>
                      ))}
                    </select>
                    {errors.class && (
                      <div className="flex items-center space-x-2 text-red-600 text-sm mt-2 bg-red-50 p-2 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.class}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                      <Award className="w-4 h-4 text-gray-500" />
                      <span>রোল নম্বর</span>
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">ঐচ্ছিক</span>
                    </label>
                    <input
                      type="text"
                      value={newStudent.rollNumber}
                      onChange={(e) => handleInputChange('rollNumber', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 transition-all"
                      placeholder="যেমন: ১২৩, ০০১"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                      <Award className="w-4 h-4 text-gray-500" />
                      <span>শিক্ষার্থী আইডি</span>
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">স্বয়ংক্রিয়</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={newStudent.studentId}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none"
                        placeholder="স্বয়ংক্রিয়ভাবে তৈরি হবে..."
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <Award className="w-4 h-4 text-green-500" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">আবেদন জমা দেওয়ার সময় স্বয়ংক্রিয়ভাবে তৈরি হবে</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>জন্ম তারিখ</span>
                    </label>
                    <input
                      type="date"
                      value={newStudent.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>ঠিকানা</span>
                    </label>
                    <textarea
                      value={newStudent.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 transition-all"
                      placeholder="পুরো ঠিকানা লিখুন"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 2: Parents Information */}
          {currentStep === 2 && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">অভিভাবকের তথ্য</h3>
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">ঐচ্ছিক</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">পিতার নাম</label>
                  <input
                    type="text"
                    value={newStudent.fatherName}
                    onChange={(e) => handleInputChange('fatherName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 transition-all"
                    placeholder="পিতার পুরো নাম"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">পিতার ফোন</label>
                  <input
                    type="tel"
                    value={newStudent.fatherPhone}
                    onChange={(e) => handleInputChange('fatherPhone', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.fatherPhone ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                    }`}
                    placeholder="০১৭১২৩৪৫৬৭৮"
                  />
                  {errors.fatherPhone && (
                    <div className="flex items-center space-x-2 text-red-600 text-sm mt-2 bg-red-50 p-2 rounded-lg">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.fatherPhone}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">পিতার পেশা</label>
                  <input
                    type="text"
                    value={newStudent.fatherOccupation}
                    onChange={(e) => handleInputChange('fatherOccupation', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 transition-all"
                    placeholder="পেশা বা চাকরির ধরন"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">মাতার নাম</label>
                  <input
                    type="text"
                    value={newStudent.motherName}
                    onChange={(e) => handleInputChange('motherName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 transition-all"
                    placeholder="মাতার পুরো নাম"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">মাতার ফোন</label>
                  <input
                    type="tel"
                    value={newStudent.motherPhone}
                    onChange={(e) => handleInputChange('motherPhone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 transition-all"
                    placeholder="০১৭১২৩৪৫৬৭৮"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">মাতার পেশা</label>
                  <input
                    type="text"
                    value={newStudent.motherOccupation}
                    onChange={(e) => handleInputChange('motherOccupation', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 transition-all"
                    placeholder="পেশা বা চাকরির ধরন"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Additional Information */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Previous School Information */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">পূর্ববর্তী স্কুলের তথ্য</h3>
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">ঐচ্ছিক</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">পূর্ববর্তী স্কুলের নাম</label>
                    <input
                      type="text"
                      value={newStudent.previousSchool}
                      onChange={(e) => handleInputChange('previousSchool', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 transition-all"
                      placeholder="পূর্ববর্তী স্কুলের নাম"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">পূর্ববর্তী ক্লাস</label>
                    <input
                      type="text"
                      value={newStudent.previousClass}
                      onChange={(e) => handleInputChange('previousClass', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 transition-all"
                      placeholder="যেমন: ক্লাস ৯, দশম শ্রেণী"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">পূর্ববর্তী GPA/Grade</label>
                    <input
                      type="text"
                      value={newStudent.previousGPA}
                      onChange={(e) => handleInputChange('previousGPA', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 transition-all"
                      placeholder="যেমন: 4.50, A+, 85%"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">স্কুল পরিবর্তনের কারণ</label>
                    <textarea
                      value={newStudent.reasonForLeaving}
                      onChange={(e) => handleInputChange('reasonForLeaving', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 transition-all"
                      placeholder="পূর্ববর্তী স্কুল থেকে চলে আসার কারণ"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <Phone className="w-4 h-4 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">জরুরী যোগাযোগ</h3>
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">ঐচ্ছিক</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">জরুরী যোগাযোগের ফোন</label>
                    <input
                      type="tel"
                      value={newStudent.emergencyContact}
                      onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 transition-all"
                      placeholder="০১৭১২৩৪৫৬৭৮"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">সম্পর্ক</label>
                    <input
                      type="text"
                      value={newStudent.emergencyRelation}
                      onChange={(e) => handleInputChange('emergencyRelation', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 transition-all"
                      placeholder="যেমন: চাচা, মামা, আত্মীয়"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success Notification */}
           {showSuccess && (
             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
               <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                 {/* Header with gradient background */}
                 <div className="bg-gradient-to-r from-green-500 to-blue-600 p-6 text-white text-center">
                   <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                     <CheckCircle className="w-8 h-8 text-white" />
                   </div>
                   <h3 className="text-xl font-bold mb-2">আবেদন সফল!</h3>
                   <p className="text-green-100 text-sm">ভর্তি আবেদন সফলভাবে জমা হয়েছে</p>
                 </div>

                 {/* Content */}
                 <div className="p-6 text-center">
                   <div className="mb-6">
                     <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                       {(imagePreview || uploadedImageUrl) ? (
                         <img
                           src={(imagePreview || uploadedImageUrl) as string}
                           alt="Profile"
                           className="w-full h-full object-cover rounded-full"
                         />
                       ) : (
                         <CheckCircle className="w-10 h-10 text-green-600" />
                       )}
                     </div>
                     <h4 className="text-lg font-semibold text-gray-900 mb-2">
                       আপনার ভর্তি আবেদন সফলভাবে জমা হয়েছে!
                     </h4>
                     <p className="text-gray-600 text-sm leading-relaxed">
                       প্রশাসনের অনুমোদনের পর আপনাকে জানানো হবে। ধন্যবাদ আমাদের সাথে যুক্ত হওয়ার জন্য।
                     </p>
                   </div>

                   {/* Student ID Display */}
                   {newStudent.studentId && (
                     <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                       <div className="flex items-center space-x-2 mb-2">
                         <Award className="w-4 h-4 text-blue-600" />
                         <span className="text-sm font-medium text-blue-800">শিক্ষার্থী আইডি</span>
                       </div>
                       <p className="text-lg font-mono font-bold text-blue-700">{newStudent.studentId}</p>
                       <p className="text-xs text-blue-600 mt-1">এই আইডি সংরক্ষণ করে রাখুন</p>
                     </div>
                   )}

                   {/* Action Button */}
                   <button
                     onClick={() => {
                       setShowSuccess(false);
                       router.push('/');
                     }}
                     className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-green-700 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
                   >
                     ঠিক আছে
                   </button>

                   {/* Footer Text */}
                   <p className="text-xs text-gray-500 mt-4">
                     আপনাকে শীঘ্রই যোগাযোগ করা হবে
                   </p>
                 </div>
               </div>
             </div>
           )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <div className="flex space-x-4">
              {currentStep > 1 && (
                <button
                  onClick={prevStep}
                  className="flex items-center space-x-2 px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>পিছনে</span>
                </button>
              )}
            </div>

            <div className="flex space-x-4">
              {currentStep < 3 ? (
                <button
                  onClick={nextStep}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all transform hover:scale-105"
                >
                  <span>পরবর্তী ধাপ</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    console.log('🚀 Submit button clicked, current step:', currentStep);
                    if (currentStep < 3) {
                      console.log('⏭️ Auto-moving to step 3');
                      setCurrentStep(3);
                      setTimeout(() => handleSaveStudent(), 100);
                    } else {
                      handleSaveStudent();
                    }
                  }}
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>ভর্তি হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>ভর্তি আবেদন জমা দিন</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center">
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
}

export default function PublicAdmissionPageWrapper() {
  return <PublicAdmissionPage />;
}