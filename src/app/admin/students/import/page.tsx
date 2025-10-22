'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { User as AuthUser, onAuthStateChanged } from 'firebase/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { studentQueries } from '@/lib/database-queries';
import {
  Home,
  Users,
  BookOpen,
  ClipboardList,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  Upload,
  Download,
  FileText,
  CheckCircle,
  AlertCircle,
  X as XIcon,
  ArrowLeft,
  Plus,
  Eye,
  Edit,
  Trash2,
  Package,
  Heart,
  IdCard
} from 'lucide-react';

function StudentsImportPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Import related state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{success: number, failed: number, errors: string[]} | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.push('/auth/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleFileSelect = (file: File) => {
    setImportFile(file);
    parseCSVFile(file);
  };

  const parseCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        // Read as ArrayBuffer and explicitly decode as UTF-8 to avoid encoding issues
        let csv: string;
        const result = e.target?.result;
        
        if (result instanceof ArrayBuffer) {
          // Decode ArrayBuffer as UTF-8
          const decoder = new TextDecoder('utf-8');
          csv = decoder.decode(result);
        } else {
          // Fallback for string result
          csv = result as string;
        }

        // Handle BOM (Byte Order Mark) if present
        let cleanedCsv = csv.replace(/^\uFEFF/, ''); // UTF-8 BOM

        // Normalize to NFC (Canonical Decomposition, followed by Canonical Composition)
        // This ensures Bengali characters are in their proper form
        cleanedCsv = cleanedCsv.normalize('NFC');

        // Fix UTF-8 mojibake (garbled text) - when UTF-8 is decoded as Latin-1
        // This is the most common encoding issue with Bengali text
        try {
          // Check if text looks like mojibake (contains characters in Latin-1 range that represent UTF-8 bytes)
          // Bangla UTF-8 mojibake typically shows as à¦* or à§* patterns
          if (/[\xc0-\xff][\x80-\xbf]/.test(cleanedCsv) || /à[¦§¨©ªª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿]/.test(cleanedCsv)) {
            console.log('🔧 Detected mojibake encoding, attempting UTF-8 recovery...');
            // Likely mojibake - re-encode and decode
            const latin1Bytes = new Uint8Array(cleanedCsv.length);
            for (let i = 0; i < cleanedCsv.length; i++) {
              latin1Bytes[i] = cleanedCsv.charCodeAt(i);
            }
            // Decode as UTF-8
            const decoder = new TextDecoder('utf-8');
            const fixedCsv = decoder.decode(latin1Bytes);
            // Validate that the fix worked (should contain Bengali characters now)
            if (/[\u0980-\u09FF]/.test(fixedCsv)) {
              cleanedCsv = fixedCsv;
              console.log('✅ Mojibake successfully fixed!');
            } else {
              console.warn('⚠️ Mojibake fix did not produce valid Bengali text');
            }
          }
        } catch (e) {
          // If re-encoding fails, continue with current text
          console.warn('UTF-8 re-encoding failed, proceeding with current encoding');
        }

        const lines = cleanedCsv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

        const preview = lines.slice(1, 16).map((line, index) => {
          const values = line.split(',').map(v => v.trim());
          const student: any = { rowNumber: index + 2 };

        headers.forEach((header, i) => {
          let cleanHeader = header.toLowerCase();

          // Map Bengali headers to English - All fields from add student form
          if (cleanHeader.includes('নাম') || cleanHeader === 'name') {
            student.displayName = values[i];
          } else if (cleanHeader.includes('ইমেইল') || cleanHeader === 'email') {
            student.email = values[i];
          } else if (cleanHeader.includes('ফোন') || cleanHeader === 'phone') {
            student.phoneNumber = values[i];
          } else if (cleanHeader.includes('ক্লাস') || cleanHeader === 'class') {
            student.class = values[i];
          } else if (cleanHeader.includes('বিভাগ') || cleanHeader === 'section') {
            student.section = values[i];
          } else if (cleanHeader.includes('গ্রুপ') || cleanHeader === 'group') {
            student.group = values[i];
          } else if (cleanHeader.includes('রোল') || cleanHeader === 'roll') {
            student.rollNumber = values[i];
          } else if (cleanHeader.includes('আইডি') || cleanHeader === 'id') {
            student.studentId = values[i];
          } else if (cleanHeader.includes('বাবা') || cleanHeader === 'father') {
            student.fatherName = values[i];
          } else if (cleanHeader.includes('মা') || cleanHeader === 'mother') {
            student.motherName = values[i];
          } else if (cleanHeader.includes('অভিভাবক') || cleanHeader === 'guardian') {
            student.guardianName = values[i];
          } else if (cleanHeader.includes('ঠিকানা') || cleanHeader === 'address') {
            student.address = values[i];
          } else if (cleanHeader.includes('জন্ম') || cleanHeader === 'birth') {
            student.dateOfBirth = values[i];
          } else if (cleanHeader.includes('পিতার_ফোন') || cleanHeader === 'father_phone') {
            student.fatherPhone = values[i];
          } else if (cleanHeader.includes('পিতার_পেশা') || cleanHeader === 'father_occupation') {
            student.fatherOccupation = values[i];
          } else if (cleanHeader.includes('মাতার_ফোন') || cleanHeader === 'mother_phone') {
            student.motherPhone = values[i];
          } else if (cleanHeader.includes('মাতার_পেশা') || cleanHeader === 'mother_occupation') {
            student.motherOccupation = values[i];
          } else if (cleanHeader.includes('জরুরী') || cleanHeader === 'emergency') {
            student.emergencyContact = values[i];
          } else if (cleanHeader.includes('সম্পর্ক') || cleanHeader === 'relation') {
            student.emergencyRelation = values[i];
          } else if (cleanHeader.includes('বর্তমান') || cleanHeader === 'present') {
            student.presentAddress = values[i];
          } else if (cleanHeader.includes('স্থায়ী') || cleanHeader === 'permanent') {
            student.permanentAddress = values[i];
          } else if (cleanHeader.includes('শহর') || cleanHeader === 'city') {
            student.city = values[i];
          } else if (cleanHeader.includes('জেলা') || cleanHeader === 'district') {
            student.district = values[i];
          } else if (cleanHeader.includes('পোস্টাল') || cleanHeader === 'postal') {
            student.postalCode = values[i];
          } else if (cleanHeader.includes('পূর্ববর্তী') || cleanHeader === 'previous') {
            student.previousSchool = values[i];
          } else if (cleanHeader.includes('পূর্ববর্তী_ক্লাস') || cleanHeader === 'previous_class') {
            student.previousClass = values[i];
          } else if (cleanHeader.includes('পূর্ববর্তী_ঠিকানা') || cleanHeader === 'previous_address') {
            student.previousSchoolAddress = values[i];
          } else if (cleanHeader.includes('কারণ') || cleanHeader === 'reason') {
            student.reasonForLeaving = values[i];
          } else if (cleanHeader.includes('জিপিএ') || cleanHeader === 'gpa') {
            student.previousGPA = values[i];
          }
        });

        // Basic validation
        const errors: string[] = [];
        if (!student.displayName) errors.push('নাম আবশ্যক');
        if (!student.email) errors.push('ইমেইল আবশ্যক');
        if (!student.class) errors.push('ক্লাস আবশ্যক');

        student.isValid = errors.length === 0;
        student.errors = errors;

          return student;
        });

        setImportPreview(preview);
      } catch (error) {
        console.error('CSV parsing error:', error);
        alert('CSV ফাইল পড়তে সমস্যা হয়েছে। ফাইলটি সঠিক ফরম্যাটে আছে কিনা যাচাই করুন।');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleBulkImport = async () => {
    if (!importFile || importPreview.length === 0) return;

    setImportLoading(true);
    setImportProgress(0);
    const results: { success: number, failed: number, errors: string[] } = { success: 0, failed: 0, errors: [] };

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        // Read as ArrayBuffer and explicitly decode as UTF-8 to avoid encoding issues
        let csv: string;
        const result = e.target?.result;
        
        if (result instanceof ArrayBuffer) {
          // Decode ArrayBuffer as UTF-8
          const decoder = new TextDecoder('utf-8');
          csv = decoder.decode(result);
        } else {
          // Fallback for string result
          csv = result as string;
        }

        // Handle BOM (Byte Order Mark) if present
        let cleanedCsv = csv.replace(/^\uFEFF/, '');

        // Normalize to NFC
        cleanedCsv = cleanedCsv.normalize('NFC');

        // Fix UTF-8 mojibake (garbled text) - when UTF-8 is decoded as Latin-1
        try {
          if (/[\xc0-\xff][\x80-\xbf]/.test(cleanedCsv) || /à[¦§¨©ªª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿]/.test(cleanedCsv)) {
            console.log('🔧 Detected mojibake encoding in bulk import, attempting UTF-8 recovery...');
            const latin1Bytes = new Uint8Array(cleanedCsv.length);
            for (let i = 0; i < cleanedCsv.length; i++) {
              latin1Bytes[i] = cleanedCsv.charCodeAt(i);
            }
            const decoder = new TextDecoder('utf-8');
            const fixedCsv = decoder.decode(latin1Bytes);
            // Validate that the fix worked (should contain Bengali characters now)
            if (/[\u0980-\u09FF]/.test(fixedCsv)) {
              cleanedCsv = fixedCsv;
              console.log('✅ Mojibake successfully fixed in bulk import!');
            } else {
              console.warn('⚠️ Mojibake fix did not produce valid Bengali text in bulk import');
            }
          }
        } catch (e) {
          console.warn('UTF-8 re-encoding failed in bulk import');
        }

        const lines = cleanedCsv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

        // Process all students (not just preview)
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;

          setImportProgress(Math.round((i / lines.length) * 100));

          const values = lines[i].split(',').map(v => v.trim());
          const studentData: any = {
            role: 'student',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          headers.forEach((header, j) => {
            let cleanHeader = header.toLowerCase();

            if (cleanHeader.includes('নাম') || cleanHeader === 'name') {
              studentData.displayName = values[j];
            } else if (cleanHeader.includes('ইমেইল') || cleanHeader === 'email') {
              studentData.email = values[j];
            } else if (cleanHeader.includes('ফোন') || cleanHeader === 'phone') {
              studentData.phoneNumber = values[j];
            } else if (cleanHeader.includes('ক্লাস') || cleanHeader === 'class') {
              studentData.class = values[j];
            } else if (cleanHeader.includes('বিভাগ') || cleanHeader === 'section') {
              studentData.section = values[j];
            } else if (cleanHeader.includes('গ্রুপ') || cleanHeader === 'group') {
              studentData.group = values[j];
            } else if (cleanHeader.includes('রোল') || cleanHeader === 'roll') {
              studentData.rollNumber = values[j];
            } else if (cleanHeader.includes('আইডি') || cleanHeader === 'id') {
              studentData.studentId = values[j];
            } else if (cleanHeader.includes('বাবা') || cleanHeader === 'father') {
              studentData.fatherName = values[j];
            } else if (cleanHeader.includes('মা') || cleanHeader === 'mother') {
              studentData.motherName = values[j];
            } else if (cleanHeader.includes('অভিভাবক') || cleanHeader === 'guardian') {
              studentData.guardianName = values[j];
            } else if (cleanHeader.includes('ঠিকানা') || cleanHeader === 'address') {
              studentData.address = values[j];
            } else if (cleanHeader.includes('জন্ম') || cleanHeader === 'birth') {
              studentData.dateOfBirth = values[j];
            } else if (cleanHeader.includes('পিতার_ফোন') || cleanHeader === 'father_phone') {
              studentData.fatherPhone = values[j];
            } else if (cleanHeader.includes('পিতার_পেশা') || cleanHeader === 'father_occupation') {
              studentData.fatherOccupation = values[j];
            } else if (cleanHeader.includes('মাতার_ফোন') || cleanHeader === 'mother_phone') {
              studentData.motherPhone = values[j];
            } else if (cleanHeader.includes('মাতার_পেশা') || cleanHeader === 'mother_occupation') {
              studentData.motherOccupation = values[j];
            } else if (cleanHeader.includes('জরুরী') || cleanHeader === 'emergency') {
              studentData.emergencyContact = values[j];
            } else if (cleanHeader.includes('সম্পর্ক') || cleanHeader === 'relation') {
              studentData.emergencyRelation = values[j];
            } else if (cleanHeader.includes('বর্তমান') || cleanHeader === 'present') {
              studentData.presentAddress = values[j];
            } else if (cleanHeader.includes('স্থায়ী') || cleanHeader === 'permanent') {
              studentData.permanentAddress = values[j];
            } else if (cleanHeader.includes('শহর') || cleanHeader === 'city') {
              studentData.city = values[j];
            } else if (cleanHeader.includes('জেলা') || cleanHeader === 'district') {
              studentData.district = values[j];
            } else if (cleanHeader.includes('পোস্টাল') || cleanHeader === 'postal') {
              studentData.postalCode = values[j];
            } else if (cleanHeader.includes('পূর্ববর্তী') || cleanHeader === 'previous') {
              studentData.previousSchool = values[j];
            } else if (cleanHeader.includes('পূর্ববর্তী_ক্লাস') || cleanHeader === 'previous_class') {
              studentData.previousClass = values[j];
            } else if (cleanHeader.includes('পূর্ববর্তী_ঠিকানা') || cleanHeader === 'previous_address') {
              studentData.previousSchoolAddress = values[j];
            } else if (cleanHeader.includes('কারণ') || cleanHeader === 'reason') {
              studentData.reasonForLeaving = values[j];
            } else if (cleanHeader.includes('জিপিএ') || cleanHeader === 'gpa') {
              studentData.previousGPA = values[j];
            }
          });

          try {
            await studentQueries.createStudent(studentData);
            results.success++;
          } catch (error) {
            results.failed++;
            results.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : String(error)}`);
          }
        }

        setImportResults(results);
        setImportLoading(false);
        setImportProgress(100);

        if (results.success > 0) {
          alert(`সফলভাবে ${results.success} জন শিক্ষার্থী ইমপোর্ট করা হয়েছে!`);
        }
      };
      reader.readAsArrayBuffer(importFile);
    } catch (error) {
      console.error('Import error:', error);
      setImportLoading(false);
      alert('ইমপোর্ট করতে সমস্যা হয়েছে');
    }
  };

  const resetImport = () => {
    setImportFile(null);
    setImportPreview([]);
    setImportResults(null);
    setImportProgress(0);
  };

  const downloadSampleCSV = () => {
    const sampleData = `নাম,ইমেইল,ফোন_নম্বর,শিক্ষার্থী_আইডি,ক্লাস,বিভাগ,গ্রুপ,রোল_নম্বর,জন্ম_তারিখ,বাবার_নাম,পিতার_ফোন,পিতার_পেশা,মাতার_নাম,মাতার_ফোন,মাতার_পেশা,অভিভাবকের_নাম,জরুরী_যোগাযোগ,সম্পর্ক,বর্তমান_ঠিকানা,স্থায়ী_ঠিকানা,শহর,জেলা,পোস্টাল_কোড,পূর্ববর্তী_স্কুল,পূর্ববর্তী_ক্লাস,পূর্ববর্তী_ঠিকানা,স্কুল_পরিবর্তনের_কারণ,জিপিএ
মোহাম্মদ আব্দুল্লাহ আল মামুন,abdullah.mamun@iqnaschool.edu,01711111111,STD2024001,১০,এ,বিজ্ঞান,০১,২০০৭-০৩-১৫,মোহাম্মদ আলী হোসেন,01711111112,সরকারি চাকরি,জাহানারা বেগম,01711111113,গৃহিণী,মোহাম্মদ আলী হোসেন,01711111112,পিতা,রোড নং ৫, বাড়ি নং ১২৩, মিরপুর, ঢাকা,রোড নং ৫, বাড়ি নং ১২৩, মিরপুর, ঢাকা,ঢাকা,ঢাকা,১২১৬,মিরপুর সরকারি উচ্চ বিদ্যালয়,নবম শ্রেণি,মিরপুর, ঢাকা,উন্নত শিক্ষা ব্যবস্থা,এ+
ফাতেমা আক্তার,fatema.akter@iqnaschool.edu,01722222222,STD2024002,১০,এ,বিজ্ঞান,০২,২০০৭-০৭-২২,আবদুর রহমান মিয়া,01722222223,ব্যবসায়ী,সালমা বেগম,01722222224,শিক্ষক,আবদুর রহমান মিয়া,01722222223,পিতা,ব্লক সি, রোড ১৫, বনানী, ঢাকা,ব্লক সি, রোড ১৫, বনানী, ঢাকা,ঢাকা,ঢাকা,১২১৩,বনানী মডেল স্কুল,নবম শ্রেণি,বনানী, ঢাকা,আধুনিক সুবিধা,এ
মোহাম্মদ রফি হাসান,rafi.hasan@iqnaschool.edu,01733333333,STD2024003,১০,বি,মানবিক,০৩,২০০৭-০১-১০,মোহাম্মদ হোসেন আলী,01733333334,কৃষক,রেহানা খাতুন,01733333335,গৃহিণী,মোহাম্মদ হোসেন আলী,01733333334,পিতা,গ্রাম: চরপাড়া, উপজেলা: সাভার, ঢাকা,গ্রাম: চরপাড়া, উপজেলা: সাভার, ঢাকা,ঢাকা,ঢাকা,১৩৪০,সাভার পাইলট স্কুল,নবম শ্রেণি,সাভার, ঢাকা,শিক্ষার মান উন্নয়ন,এ-
সাদিয়া ইসলাম,sadia.islam@iqnaschool.edu,01744444444,STD2024004,৯,এ,বিজ্ঞান,০৪,২০০৮-০৯-০৫,আবদুল করিম মিয়া,01744444445,ইঞ্জিনিয়ার,নাসরিন আক্তার,01744444446,ডাক্তার,আবদুল করিম মিয়া,01744444445,পিতা,ফ্ল্যাট ৫বি, রোড ২৭, গুলশান, ঢাকা,ফ্ল্যাট ৫বি, রোড ২৭, গুলশান, ঢাকা,ঢাকা,ঢাকা,১২১২,গুলশান মডেল স্কুল,অষ্টম শ্রেণি,গুলশান, ঢাকা,সেরা শিক্ষা প্রতিষ্ঠান,এ+
তানভীর হাসান,tanvir.hasan@iqnaschool.edu,01755555555,STD2024005,৯,এ,বিজ্ঞান,০৫,২০০৮-১২-১৮,মোহাম্মদ আলী হোসেন,01755555556,শিক্ষক,শাহনাজ বেগম,01755555557,গৃহিণী,মোহাম্মদ আলী হোসেন,01755555556,পিতা,বাড়ি নং ৪৫, লেন নং ৩, উত্তরা, ঢাকা,বাড়ি নং ৪৫, লেন নং ৩, উত্তরা, ঢাকা,ঢাকা,ঢাকা,১২৩০,উত্তরা উচ্চ বিদ্যালয়,অষ্টম শ্রেণি,উত্তরা, ঢাকা,ভাল পরিবেশ,এ
নুসরাত জাহান,nusrat.jahan@iqnaschool.edu,01766666666,STD2024006,৯,বি,মানবিক,০৬,২০০৮-০৫-৩০,আবদুর রাজ্জাক মিয়া,01766666667,ব্যবসায়ী,ফাতেমা বেগম,01766666668,গৃহিণী,আবদুর রাজ্জাক মিয়া,01766666667,পিতা,প্লট নং ১২, সেক্টর ১০, মিরপুর, ঢাকা,প্লট নং ১২, সেক্টর ১০, মিরপুর, ঢাকা,ঢাকা,ঢাকা,১২১৬,মিরপুর বালিকা বিদ্যালয়,অষ্টম শ্রেণি,মিরপুর, ঢাকা,মেয়েদের জন্য ভাল স্কুল,এ
রাকিবুল ইসলাম,rakibul.islam@iqnaschool.edu,01777777777,STD2024007,৮,এ,বিজ্ঞান,০৭,২০০৯-১১-২৫,মোহাম্মদ ইসলাম উদ্দিন,01777777778,পুলিশ,সাবিনা ইসলাম,01777777779,নার্স,মোহাম্মদ ইসলাম উদ্দিন,01777777778,পিতা,বাড়ি নং ২৩, গলি নং ৫, মোহাম্মদপুর, ঢাকা,বাড়ি নং ২৩, গলি নং ৫, মোহাম্মদপুর, ঢাকা,ঢাকা,ঢাকা,১২০৭,মোহাম্মদপুর প্রিপারেটরি স্কুল,সপ্তম শ্রেণি,মোহাম্মদপুর, ঢাকা,নিরাপত্তা ও শিক্ষা,এ+
জান্নাতুল ফেরদৌস,jannatul.ferdous@iqnaschool.edu,01788888888,STD2024008,৮,এ,বিজ্ঞান,০৮,২০০৯-০৮-১৪,আবদুল হালিম মিয়া,01788888889,ডাক্তার,রোশন আরা বেগম,01788888890,গৃহিণী,আবদুল হালিম মিয়া,01788888889,পিতা,ফ্ল্যাট ১২এ, রোড ৪, ধানমন্ডি, ঢাকা,ফ্ল্যাট ১২এ, রোড ৪, ধানমন্ডি, ঢাকা,ঢাকা,ঢাকা,১২০৯,ধানমন্ডি বালিকা বিদ্যালয়,সপ্তম শ্রেণি,ধানমন্ডি, ঢাকা,স্বাস্থ্যকর পরিবেশ,এ
ইমরান হোসেন,imran.hossain@iqnaschool.edu,01799999999,STD2024009,৮,বি,মানবিক,০৯,২০০৯-০৪-০৮,মোহাম্মদ হোসেন মিয়া,01799999998,কৃষক,আমিনা বেগম,01799999997,গৃহিণী,মোহাম্মদ হোসেন মিয়া,01799999998,পিতা,গ্রাম: তালতলা, উপজেলা: গাজীপুর, ঢাকা,গ্রাম: তালতলা, উপজেলা: গাজীপুর, ঢাকা,ঢাকা,ঢাকা,১৭০০,গাজীপুর সরকারি বিদ্যালয়,সপ্তম শ্রেণি,গাজীপুর, ঢাকা,পরিবারের সাথে থাকা,এ-
মারিয়া চৌধুরী,maria.chowdhury@iqnaschool.edu,01811111111,STD2024010,৭,এ,বিজ্ঞান,১০,২০১০-০৬-২০,আবদুল চৌধুরী,01811111112,ব্যাংকার,নাজনীন চৌধুরী,01811111113,গৃহিণী,আবদুল চৌধুরী,01811111112,পিতা,বাড়ি নং ৭৮, রোড নং ১১, বনানী, ঢাকা,বাড়ি নং ৭৮, রোড নং ১১, বনানী, ঢাকা,ঢাকা,ঢাকা,১২১৩,বনানী প্রিপারেটরি স্কুল,ষষ্ঠ শ্রেণি,বনানী, ঢাকা,অধ্যয়নের সুবিধা,এ+
সাকিব আহমেদ,sakib.ahmed@iqnaschool.edu,01822222222,STD2024011,৭,এ,বিজ্ঞান,১১,২০১০-১০-১২,মোহাম্মদ আহমেদ হোসেন,01822222223,ইঞ্জিনিয়ার,সুমাইয়া আহমেদ,01822222224,শিক্ষক,মোহাম্মদ আহমেদ হোসেন,01822222223,পিতা,ভিলা নং ৫, লেক রোড, গুলশান, ঢাকা,ভিলা নং ৫, লেক রোড, গুলশান, ঢাকা,ঢাকা,ঢাকা,১২১২,গুলশান প্রিপারেটরি স্কুল,ষষ্ঠ শ্রেণি,গুলশান, ঢাকা,আন্তর্জাতিক মান,এ
আনিকা রহমান,anika.rahman@iqnaschool.edu,01833333333,STD2024012,৭,বি,মানবিক,১২,২০১০-০২-২৮,আবদুর রহমান মিয়া,01833333334,ব্যবসায়ী,শিরিন রহমান,01833333335,গৃহিণী,আবদুর রহমান মিয়া,01833333334,পিতা,অ্যাপার্টমেন্ট ৩সি, রোড ৮, ধানমন্ডি, ঢাকা,অ্যাপার্টমেন্ট ৩সি, রোড ৮, ধানমন্ডি, ঢাকা,ঢাকা,ঢাকা,১২০৯,ধানমন্ডি প্রিপারেটরি স্কুল,ষষ্ঠ শ্রেণি,ধানমন্ডি, ঢাকা,পারিবারিক সিদ্ধান্ত,এ
রিয়াদ মাহমুদ,riyad.mahmud@iqnaschool.edu,01844444444,STD2024013,৬,এ,বিজ্ঞান,১৩,২০১১-০৯-১৭,মোহাম্মদ মাহমুদ হোসেন,01844444445,সরকারি চাকরি,রুবিনা মাহমুদ,01844444446,গৃহিণী,মোহাম্মদ মাহমুদ হোসেন,01844444445,পিতা,বাড়ি নং ২৩৪, সেক্টর ৪, উত্তরা, ঢাকা,বাড়ি নং ২৩৪, সেক্টর ৪, উত্তরা, ঢাকা,ঢাকা,ঢাকা,১২৩০,উত্তরা প্রিপারেটরি স্কুল,পঞ্চম শ্রেণি,উত্তরা, ঢাকা,কাছাকাছি অবস্থান,এ+
তাসনিয়া হক,tasnia.hoque@iqnaschool.edu,01855555555,STD2024014,৬,এ,বিজ্ঞান,১৪,২০১১-০৫-০৩,আবদুল হক মিয়া,01855555556,ডাক্তার,নার্গিস হক,01855555557,গৃহিণী,আবদুল হক মিয়া,01855555556,পিতা,প্লট নং ১৫, রোড নং ৩, বারিধারা, ঢাকা,প্লট নং ১৫, রোড নং ৩, বারিধারা, ঢাকা,ঢাকা,ঢাকা,১২১২,বারিধারা প্রিপারেটরি স্কুল,পঞ্চম শ্রেণি,বারিধারা, ঢাকা,স্বাস্থ্য সচেতন পরিবেশ,এ
নাঈম ইসলাম,naim.islam@iqnaschool.edu,01866666666,STD2024015,৬,বি,মানবিক,১৫,২০১১-১২-০৮,মোহাম্মদ ইসলাম মিয়া,01866666667,পুলিশ,সাকিলা ইসলাম,01866666668,নার্স,মোহাম্মদ ইসলাম মিয়া,01866666667,পিতা,কোয়ার্টার নং ১২, পুলিশ লাইন, রাজারবাগ, ঢাকা,কোয়ার্টার নং ১২, পুলিশ লাইন, রাজারবাগ, ঢাকা,ঢাকা,ঢাকা,১২১৪,রাজারবাগ পুলিশ লাইন স্কুল,পঞ্চম শ্রেণি,রাজারবাগ, ঢাকা,পিতার চাকরির সুবিধা,এ
আয়েশা সিদ্দিকা,ayesha.siddika@iqnaschool.edu,01877777777,STD2024016,৫,এ,বিজ্ঞান,১৬,২০১২-০৮-১০,মোহাম্মদ সিদ্দিকুর রহমান,01877777778,শিক্ষক,ফাতেমা সিদ্দিকা,01877777779,গৃহিণী,মোহাম্মদ সিদ্দিকুর রহমান,01877777778,পিতা,বাড়ি নং ৮৯, রোড নং ৬, মিরপুর, ঢাকা,বাড়ি নং ৮৯, রোড নং ৬, মিরপুর, ঢাকা,ঢাকা,ঢাকা,১২১৬,মিরপুর প্রিপারেটরি স্কুল,চতুর্থ শ্রেণি,মিরপুর, ঢাকা,মানসম্পন্ন শিক্ষা,এ+
জিহাদ হোসেন,jihad.hossain@iqnaschool.edu,01888888888,STD2024017,৫,এ,বিজ্ঞান,১৭,২০১২-০৪-২৫,মোহাম্মদ হোসেন আলী,01888888889,কৃষক,রেজিয়া বেগম,01888888890,গৃহিণী,মোহাম্মদ হোসেন আলী,01888888889,পিতা,গ্রাম: কাশিমপুর, উপজেলা: গাজীপুর, ঢাকা,গ্রাম: কাশিমপুর, উপজেলা: গাজীপুর, ঢাকা,ঢাকা,ঢাকা,১৭০০,কাশিমপুর প্রাথমিক বিদ্যালয়,চতুর্থ শ্রেণি,গাজীপুর, ঢাকা,গ্রামের কাছে ভাল স্কুল,এ
সামিয়া আক্তার,samia.akter@iqnaschool.edu,01899999999,STD2024018,৪,এ,বিজ্ঞান,১৮,২০১৩-১১-১৫,মোহাম্মদ আক্তার হোসেন,01899999998,ব্যবসায়ী,সামিয়া বেগম,01899999997,গৃহিণী,মোহাম্মদ আক্তার হোসেন,01899999998,পিতা,ফ্ল্যাট নং ২৩বি, রোড নং ১২, বনানী, ঢাকা,ফ্ল্যাট নং ২৩বি, রোড নং ১২, বনানী, ঢাকা,ঢাকা,ঢাকা,১২১৩,বনানী কিন্ডারগার্টেন স্কুল,তৃতীয় শ্রেণি,বনানী, ঢাকা,ভাল শহুরে স্কুল,এ+
আরিফুল ইসলাম,ariful.islam@iqnaschool.edu,01911111111,STD2024019,৪,বি,মানবিক,১৯,২০১৩-০৬-০৮,মোহাম্মদ ইসলাম মিয়া,01911111112,ইঞ্জিনিয়ার,আরিফা বেগম,01911111113,গৃহিণী,মোহাম্মদ ইসলাম মিয়া,01911111112,পিতা,বাড়ি নং ৫৬, লেন নং ৭, উত্তরা, ঢাকা,বাড়ি নং ৫৬, লেন নং ৭, উত্তরা, ঢাকা,ঢাকা,ঢাকা,১২৩০,উত্তরা কিন্ডারগার্টেন স্কুল,তৃতীয় শ্রেণি,উত্তরা, ঢাকা,আধুনিক শিক্ষা ব্যবস্থা,এ
লামিয়া খান,lamia.khan@iqnaschool.edu,01922222222,STD2024020,৩,এ,বিজ্ঞান,২০,২০১৪-০৯-২০,মোহাম্মদ খান সাহেব,01922222223,সরকারি চাকরি,লামিয়া খাতুন,01922222224,গৃহিণী,মোহাম্মদ খান সাহেব,01922222223,পিতা,প্লট নং ৩৪, রোড নং ৯, ধানমন্ডি, ঢাকা,প্লট নং ৩৪, রোড নং ৯, ধানমন্ডি, ঢাকা,ঢাকা,ঢাকা,১২০৯,ধানমন্ডি কিন্ডারগার্টেন স্কুল,দ্বিতীয় শ্রেণি,ধানমন্ডি, ঢাকা,সুন্দর পরিবেশ,এ+`;

    const blob = new Blob([sampleData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_students_bangla.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const menuItems = [
    { icon: Home, label: 'ড্যাশবোর্ড', href: '/admin/dashboard', active: false },
    { icon: Users, label: 'শিক্ষার্থী', href: '/admin/students', active: false },
    { icon: BookOpen, label: 'শিক্ষক', href: '/admin/teachers', active: false },
    { icon: Package, label: 'অভিভাবক', href: '/admin/parents', active: false },
    { icon: ClipboardList, label: 'ক্লাস', href: '/admin/classes', active: false },
    { icon: Calendar, label: 'উপস্থিতি', href: '/admin/attendance', active: false },
    { icon: Settings, label: 'ইভেন্ট', href: '/admin/events', active: false },
    { icon: Heart, label: 'হিসাব', href: '/admin/accounting', active: false },
    { icon: IdCard, label: 'Donation', href: '/admin/donation', active: false },
    { icon: Home, label: 'পরীক্ষা', href: '/admin/exams', active: false },
    { icon: BookOpen, label: 'বিষয়', href: '/admin/subjects', active: false },
    { icon: Users, label: 'সাপোর্ট', href: '/admin/support', active: false },
    { icon: Calendar, label: 'বার্তা', href: '/admin/accounts', active: false },
    { icon: Settings, label: 'Generate', href: '/admin/generate', active: false },
    { icon: Package, label: 'ইনভেন্টরি', href: '/admin/inventory', active: false },
    { icon: Users, label: 'অভিযোগ', href: '/admin/misc', active: false },
    { icon: Settings, label: 'সেটিংস', href: '/admin/settings', active: false },
  ];

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform lg:translate-x-0 lg:static lg:inset-0 lg:flex lg:flex-col ${
        sidebarOpen ? 'translate-x-0 transition-transform duration-300 ease-in-out' : '-translate-x-full'
      }`}>
        <div className="flex items-center h-16 px-6 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-2 flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-gray-600 hover:text-gray-800 p-1"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">ই</span>
            </div>
            <span className={`text-lg font-bold text-gray-900 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100'}`}>
              সুপার অ্যাডমিন
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className={`text-gray-500 hover:text-gray-700 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 mt-2 overflow-y-auto pb-4">
          {menuItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`flex items-center px-6 py-2 text-sm font-medium transition-colors ${
                item.active
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-4 h-4 mr-3" />
              {item.label}
            </a>
          ))}

          <button
            onClick={handleLogout}
            className="flex items-center w-full px-6 py-2 mt-4 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3" />
            লগআউট
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <div className="bg-white shadow-sm border-b border-gray-200 h-16">
          <div className="h-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center h-full">
                <button
                  onClick={() => router.push('/admin/students')}
                  className="mr-4 text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex flex-col justify-center h-full">
                  <h1 className="text-xl font-semibold text-gray-900 leading-tight">শিক্ষার্থী ইমপোর্ট</h1>
                  <p className="text-sm text-gray-600 leading-tight">CSV ফাইল থেকে বাল্ক শিক্ষার্থী ইমপোর্ট করুন</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 h-full">
                <button
                  onClick={downloadSampleCSV}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>স্যাম্পল CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-6 bg-gray-50 overflow-y-auto">
          {!importFile ? (
            /* File Upload Section */
            <div className="max-w-4xl mx-auto">
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-12 h-12 text-purple-600" />
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-4">CSV ফাইল আপলোড করুন</h2>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                  শিক্ষার্থীদের তথ্য সম্বলিত CSV ফাইল নির্বাচন করুন। ফাইলটি বাংলায় হেডার সহ হতে হবে।
                </p>

                {/* Drag and Drop Area */}
                <div
                  className={`relative border-2 border-dashed rounded-xl p-12 mb-8 transition-colors ${
                    dragActive
                      ? 'border-purple-400 bg-purple-50'
                      : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="text-center">
                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg text-gray-600 mb-2">
                      ফাইলটি এখানে ড্র্যাগ করে ছেড়ে দিন
                    </p>
                    <p className="text-gray-500 mb-4">অথবা</p>

                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                      className="hidden"
                      id="import-file"
                    />
                    <label
                      htmlFor="import-file"
                      className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer transition-colors"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      ফাইল নির্বাচন করুন
                    </label>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-4">সমর্থিত ফরম্যাট: CSV, Excel</p>
                  <button
                    onClick={downloadSampleCSV}
                    className="text-purple-600 hover:text-purple-800 text-sm underline font-medium"
                  >
                    📥 স্যাম্পল CSV ফাইল ডাউনলোড করুন
                  </button>
                </div>

                {/* CSV Format Guide */}
                <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-left">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">📋 CSV ফাইল ফরম্যাট গাইড</h3>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">📝 হেডার ফরম্যাট (বাংলায়):</h4>
                      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 font-bengali leading-relaxed break-words whitespace-pre-wrap">
                        নাম,ইমেইল,ফোন_নম্বর,শিক্ষার্থী_আইডি,ক্লাস,বিভাগ,গ্রুপ,রোল_নম্বর,জন্ম_তারিখ,বাবার_নাম,পিতার_ফোন,পিতার_পেশা,মাতার_নাম,মাতার_ফোন,মাতার_পেশা,অভিভাবকের_নাম,জরুরী_যোগাযোগ,সম্পর্ক,বর্তমান_ঠিকানা,স্থায়ী_ঠিকানা,শহর,জেলা,পোস্টাল_কোড,পূর্ববর্তী_স্কুল,পূর্ববর্তী_ক্লাস,পূর্ববর্তী_ঠিকানা,স্কুল_পরিবর্তনের_কারণ,জিপিএ
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        💡 <strong>উদাহরণ:</strong> ক্লাস ফিল্ডে "১০", "৯", "৮" ইত্যাদি বাংলা সংখ্যা ব্যবহার করুন
                      </p>
                    </div>


                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">⭐ আবশ্যক কলামসমূহ:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        নাম (Name) - বাংলায়
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        ইমেইল (Email) - ইংরেজিতে
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        ক্লাস (Class) - বাংলা সংখ্যায়
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">📋 ঐচ্ছিক কলামসমূহ:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm text-gray-600">
                      <div>• ফোন_নম্বর (Phone Number)</div>
                      <div>• শিক্ষার্থী_আইডি (Student ID)</div>
                      <div>• বিভাগ (Section) - এ, বি, সি</div>
                      <div>• গ্রুপ (Group) - বিজ্ঞান, মানবিক</div>
                      <div>• রোল_নম্বর (Roll Number) - বাংলা সংখ্যায়</div>
                      <div>• বাবার_নাম (Father's Name) - বাংলায়</div>
                      <div>• মাতার_নাম (Mother's Name) - বাংলায়</div>
                      <div>• অভিভাবকের_নাম (Guardian Name)</div>
                      <div>• জরুরী_যোগাযোগ (Emergency Contact)</div>
                      <div>• সম্পর্ক (Relationship) - পিতা, মাতা, ভাই</div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">💡 গুরুত্বপূর্ণ টিপস:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• ক্লাস ফিল্ডে বাংলা সংখ্যা ব্যবহার করুন: "১০", "৯", "৮"</li>
                      <li>• বিভাগ ফিল্ডে: "এ", "বি", "সি" ইত্যাদি</li>
                      <li>• গ্রুপ ফিল্ডে: "বিজ্ঞান", "মানবিক"</li>
                      <li>• জন্ম তারিখ ফরম্যাট: YYYY-MM-DD (যেমন: ২০০৭-০৩-১৫)</li>
                      <li>• ফোন নম্বর: ০১৭১১১১১১১১ ফরম্যাটে</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : !importResults ? (
            /* Preview Section */
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">প্রিভিউ এবং ভ্যালিডেশন</h2>
                  <p className="text-gray-600">ফাইল: {importFile.name} • আকার: {(importFile.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  onClick={resetImport}
                  className="text-gray-500 hover:text-gray-700 flex items-center space-x-2"
                >
                  <XIcon className="w-5 h-5" />
                  <span>অন্য ফাইল নির্বাচন করুন</span>
                </button>
              </div>

              {/* Validation Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                    <span className="font-semibold text-green-800">বৈধ শিক্ষার্থী</span>
                  </div>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {importPreview.filter(s => s.isValid).length}
                  </p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-center">
                    <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
                    <span className="font-semibold text-red-800">ত্রুটিযুক্ত</span>
                  </div>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    {importPreview.filter(s => !s.isValid).length}
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-center">
                    <Users className="w-6 h-6 text-blue-600 mr-3" />
                    <span className="font-semibold text-blue-800">মোট প্রিভিউ</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {importPreview.length}
                  </p>
                </div>
              </div>

              {/* Preview Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">ফাইল প্রিভিউ (প্রথম ১৫ জন)</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">রো</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">নাম</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ইমেইল</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ক্লাস</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">স্ট্যাটাস</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ত্রুটি</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {importPreview.map((student, index) => (
                        <tr key={index} className={student.isValid ? 'bg-green-50' : 'bg-red-50'}>
                          <td className="px-4 py-3 text-sm text-gray-900">{student.rowNumber}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 bengali">{student.displayName || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{student.email || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 bengali">{student.class || 'N/A'}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              student.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {student.isValid ? 'বৈধ' : 'ত্রুটি'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-red-600 bengali">
                            {student.errors?.join(', ') || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Import Actions */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={resetImport}
                  className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  বাতিল করুন
                </button>
                <button
                  onClick={handleBulkImport}
                  disabled={!importPreview.some(s => s.isValid) || importLoading}
                  className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
                >
                  {importLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>ইমপোর্ট হচ্ছে... ({importProgress}%)</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>ইমপোর্ট করুন ({importPreview.filter(s => s.isValid).length} জন)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Results Section */
            <div className="max-w-4xl mx-auto text-center py-12">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                importResults.success > 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {importResults.success > 0 ? (
                  <CheckCircle className="w-10 h-10 text-green-600" />
                ) : (
                  <AlertCircle className="w-10 h-10 text-red-600" />
                )}
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                ইমপোর্ট সম্পন্ন!
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-2xl mx-auto">
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <p className="text-lg text-green-600 mb-2">✅ সফলভাবে ইমপোর্ট</p>
                  <p className="text-4xl font-bold text-green-600">{importResults.success} জন</p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <p className="text-lg text-red-600 mb-2">❌ ব্যর্থ</p>
                  <p className="text-4xl font-bold text-red-600">{importResults.failed} জন</p>
                </div>
              </div>

              {importResults.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 text-left max-w-2xl mx-auto">
                  <h3 className="font-semibold text-red-800 mb-3">ত্রুটি বিবরণ:</h3>
                  <ul className="space-y-1 text-sm text-red-700">
                    {importResults.errors.slice(0, 5).map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                    {importResults.errors.length > 5 && (
                      <li>• এবং আরও {importResults.errors.length - 5} টি ত্রুটি...</li>
                    )}
                  </ul>
                </div>
              )}

              <div className="flex justify-center space-x-4">
                <button
                  onClick={resetImport}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  নতুন ইমপোর্ট শুরু করুন
                </button>
                <button
                  onClick={() => router.push('/admin/students')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  শিক্ষার্থী তালিকা দেখুন
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudentsImportPageWrapper() {
  return (
    <ProtectedRoute requireAuth={true}>
      <StudentsImportPage />
    </ProtectedRoute>
  );
}
