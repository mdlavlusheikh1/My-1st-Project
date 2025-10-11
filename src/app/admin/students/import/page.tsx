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
        // Ensure proper UTF-8 decoding for Bengali text
        const csv = e.target?.result as string;

        // Handle BOM (Byte Order Mark) if present - multiple BOM types
        let cleanedCsv = csv.replace(/^\uFEFF/, ''); // UTF-8 BOM
        cleanedCsv = cleanedCsv.replace(/^\uFFFE/, ''); // UTF-16 BOM (reversed)
        cleanedCsv = cleanedCsv.replace(/^\uEFBBBF/, ''); // UTF-8 BOM (alternative)

        // Fix common Bengali text encoding issues - comprehensive Unicode fixes
        cleanedCsv = cleanedCsv.replace(/à¦/g, 'আ');
        cleanedCsv = cleanedCsv.replace(/à§/g, 'ি');
        cleanedCsv = cleanedCsv.replace(/à¨/g, 'ী');
        cleanedCsv = cleanedCsv.replace(/à©/g, 'ু');
        cleanedCsv = cleanedCsv.replace(/àª/g, 'ূ');
        cleanedCsv = cleanedCsv.replace(/à«/g, 'ৃ');
        cleanedCsv = cleanedCsv.replace(/à¬/g, 'ে');
        cleanedCsv = cleanedCsv.replace(/à­/g, 'ৈ');
        cleanedCsv = cleanedCsv.replace(/à®/g, 'ো');
        cleanedCsv = cleanedCsv.replace(/à¯/g, 'ৌ');
        cleanedCsv = cleanedCsv.replace(/à°/g, 'ক');
        cleanedCsv = cleanedCsv.replace(/à±/g, 'খ');
        cleanedCsv = cleanedCsv.replace(/à²/g, 'গ');
        cleanedCsv = cleanedCsv.replace(/à³/g, 'ঘ');
        cleanedCsv = cleanedCsv.replace(/à´/g, 'ঙ');
        cleanedCsv = cleanedCsv.replace(/àµ/g, 'চ');
        cleanedCsv = cleanedCsv.replace(/à¶/g, 'ছ');
        cleanedCsv = cleanedCsv.replace(/à·/g, 'জ');
        cleanedCsv = cleanedCsv.replace(/à¸/g, 'ঝ');
        cleanedCsv = cleanedCsv.replace(/à¹/g, 'ঞ');
        cleanedCsv = cleanedCsv.replace(/àº/g, 'ট');
        cleanedCsv = cleanedCsv.replace(/à»/g, 'ঠ');
        cleanedCsv = cleanedCsv.replace(/à¼/g, 'ড');
        cleanedCsv = cleanedCsv.replace(/à½/g, 'ঢ');
        cleanedCsv = cleanedCsv.replace(/à¾/g, 'ণ');
        cleanedCsv = cleanedCsv.replace(/à¿/g, 'ত');
        cleanedCsv = cleanedCsv.replace(/àÀ/g, 'থ');
        cleanedCsv = cleanedCsv.replace(/àÁ/g, 'দ');
        cleanedCsv = cleanedCsv.replace(/àÂ/g, 'ধ');
        cleanedCsv = cleanedCsv.replace(/àÃ/g, 'ন');
        cleanedCsv = cleanedCsv.replace(/àÄ/g, 'প');
        cleanedCsv = cleanedCsv.replace(/àÅ/g, 'ফ');
        cleanedCsv = cleanedCsv.replace(/àÆ/g, 'ব');
        cleanedCsv = cleanedCsv.replace(/àÇ/g, 'ভ');
        cleanedCsv = cleanedCsv.replace(/àÈ/g, 'ম');
        cleanedCsv = cleanedCsv.replace(/àÉ/g, 'য');
        cleanedCsv = cleanedCsv.replace(/àÊ/g, 'র');
        cleanedCsv = cleanedCsv.replace(/àË/g, 'ল');
        cleanedCsv = cleanedCsv.replace(/àÌ/g, 'শ');
        cleanedCsv = cleanedCsv.replace(/àÍ/g, 'ষ');
        cleanedCsv = cleanedCsv.replace(/àÎ/g, 'স');
        cleanedCsv = cleanedCsv.replace(/àÏ/g, 'হ');
        cleanedCsv = cleanedCsv.replace(/àÐ/g, 'ড়');
        cleanedCsv = cleanedCsv.replace(/àÑ/g, 'ঢ়');
        cleanedCsv = cleanedCsv.replace(/àÒ/g, 'য়');
        cleanedCsv = cleanedCsv.replace(/àÓ/g, 'ৎ');
        cleanedCsv = cleanedCsv.replace(/àÔ/g, 'ং');
        cleanedCsv = cleanedCsv.replace(/àÕ/g, 'ঃ');
        cleanedCsv = cleanedCsv.replace(/àÖ/g, 'ঁ');

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
    reader.readAsText(file);
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
        // Ensure proper UTF-8 decoding for Bengali text
        const csv = e.target?.result as string;

        // Handle BOM (Byte Order Mark) if present
        const cleanedCsv = csv.replace(/^\uFEFF/, '');

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
      reader.readAsText(importFile);
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
    const sampleData = `name,email,phone_number,student_id,class,section,group,roll_number,date_of_birth,father_name,father_phone,father_occupation,mother_name,mother_phone,mother_occupation,guardian_name,emergency_contact,relationship,present_address,permanent_address,city,district,postal_code,previous_school,previous_class,previous_address,reason_for_change,gpa
Mohammed Abdullah Al Mamun,abdullah.mamun@iqnaschool.edu,01711111111,STD2024001,10,A,Science,01,2007-03-15,Mohammed Ali Hossain,01711111112,Government Service,Jahanara Begum,01711111113,Housewife,Mohammed Ali Hossain,01711111112,Father,Road No 5, House No 123, Mirpur, Dhaka,Road No 5, House No 123, Mirpur, Dhaka,Dhaka,Dhaka,1216,Mirpur Government High School,Class 9,Mirpur, Dhaka,Advanced Education System,A+
Fatema Akter,fatema.akter@iqnaschool.edu,01722222222,STD2024002,10,A,Science,02,2007-07-22,Abdur Rahman Mia,01722222223,Businessman,Salma Begum,01722222224,Teacher,Abdur Rahman Mia,01722222223,Father,Block C, Road 15, Banani, Dhaka,Block C, Road 15, Banani, Dhaka,Dhaka,Dhaka,1213,Banani Model School,Class 9,Banani, Dhaka,Modern Facilities,A
Mohammed Rafi Hasan,rafi.hasan@iqnaschool.edu,01733333333,STD2024003,10,B,Humanities,03,2007-01-10,Mohammed Hossain Ali,01733333334,Farmer,Rehana Khatun,01733333335,Housewife,Mohammed Hossain Ali,01733333334,Father,Village: Charpara, Upazila: Savar, Dhaka,Village: Charpara, Upazila: Savar, Dhaka,Dhaka,Dhaka,1340,Savar Pilot School,Class 9,Savar, Dhaka,Education Quality Improvement,A-
Sadia Islam,sadia.islam@iqnaschool.edu,01744444444,STD2024004,9,A,Science,04,2008-09-05,Abdul Karim Mia,01744444445,Engineer,Nasrin Akter,01744444446,Doctor,Abdul Karim Mia,01744444445,Father,Flat 5B, Road 27, Gulshan, Dhaka,Flat 5B, Road 27, Gulshan, Dhaka,Dhaka,Dhaka,1212,Gulshan Model School,Class 8,Gulshan, Dhaka,Best Educational Institution,A+
Tanvir Hasan,tanvir.hasan@iqnaschool.edu,01755555555,STD2024005,9,A,Science,05,2008-12-18,Mohammed Ali Hossain,01755555556,Teacher,Shahnaz Begum,01755555557,Housewife,Mohammed Ali Hossain,01755555556,Father,House No 45, Lane No 3, Uttara, Dhaka,House No 45, Lane No 3, Uttara, Dhaka,Dhaka,Dhaka,1230,Uttara High School,Class 8,Uttara, Dhaka,Good Environment,A
Nusrat Jahan,nusrat.jahan@iqnaschool.edu,01766666666,STD2024006,9,B,Humanities,06,2008-05-30,Abdur Razzak Mia,01766666667,Businessman,Fatema Begum,01766666668,Housewife,Abdur Razzak Mia,01766666667,Father,Plot No 12, Sector 10, Mirpur, Dhaka,Plot No 12, Sector 10, Mirpur, Dhaka,Dhaka,Dhaka,1216,Mirpur Girls School,Class 8,Mirpur, Dhaka,Good School for Girls,A
Rakibul Islam,rakibul.islam@iqnaschool.edu,01777777777,STD2024007,8,A,Science,07,2009-11-25,Mohammed Islam Uddin,01777777778,Police,Sabina Islam,01777777779,Nurse,Mohammed Islam Uddin,01777777778,Father,House No 23, Gali No 5, Mohammadpur, Dhaka,House No 23, Gali No 5, Mohammadpur, Dhaka,Dhaka,Dhaka,1207,Mohammadpur Preparatory School,Class 7,Mohammadpur, Dhaka,Safety and Education,A+
Jannatul Ferdous,jannatul.ferdous@iqnaschool.edu,01788888888,STD2024008,8,A,Science,08,2009-08-14,Abdul Halim Mia,01788888889,Doctor,Roshan Ara Begum,01788888890,Housewife,Abdul Halim Mia,01788888889,Father,Flat 12A, Road 4, Dhanmondi, Dhaka,Flat 12A, Road 4, Dhanmondi, Dhaka,Dhaka,Dhaka,1209,Dhanmondi Girls School,Class 7,Dhanmondi, Dhaka,Healthy Environment,A
Imran Hossain,imran.hossain@iqnaschool.edu,01799999999,STD2024009,8,B,Humanities,09,2009-04-08,Mohammed Hossain Mia,01799999998,Farmer,Amina Begum,01799999997,Housewife,Mohammed Hossain Mia,01799999998,Father,Village: Taltala, Upazila: Gazipur, Dhaka,Village: Taltala, Upazila: Gazipur, Dhaka,Dhaka,Dhaka,1700,Gazipur Public School,Class 7,Gazipur, Dhaka,Living with Family,A-
Maria Chowdhury,maria.chowdhury@iqnaschool.edu,01811111111,STD2024010,7,A,Science,10,2010-06-20,Abdul Chowdhury,01811111112,Banker,Najnine Chowdhury,01811111113,Housewife,Abdul Chowdhury,01811111112,Father,House No 78, Road No 11, Banani, Dhaka,House No 78, Road No 11, Banani, Dhaka,Dhaka,Dhaka,1213,Banani Preparatory School,Class 6,Banani, Dhaka,Study Facilities,A+
Sakib Ahmed,sakib.ahmed@iqnaschool.edu,01822222222,STD2024011,7,A,Science,11,2010-10-12,Mohammed Ahmed Hossain,01822222223,Engineer,Sumaiya Ahmed,01822222224,Teacher,Mohammed Ahmed Hossain,01822222223,Father,Villa No 5, Lake Road, Gulshan, Dhaka,Villa No 5, Lake Road, Gulshan, Dhaka,Dhaka,Dhaka,1212,Gulshan Preparatory School,Class 6,Gulshan, Dhaka,International Standard,A
Anika Rahman,anika.rahman@iqnaschool.edu,01833333333,STD2024012,7,B,Humanities,12,2010-02-28,Abdur Rahman Mia,01833333334,Businessman,Shirin Rahman,01833333335,Housewife,Abdur Rahman Mia,01833333334,Father,Apartment 3C, Road 8, Dhanmondi, Dhaka,Apartment 3C, Road 8, Dhanmondi, Dhaka,Dhaka,Dhaka,1209,Dhanmondi Preparatory School,Class 6,Dhanmondi, Dhaka,Family Decision,A
Riyad Mahmud,riyad.mahmud@iqnaschool.edu,01844444444,STD2024013,6,A,Science,13,2011-09-17,Mohammed Mahmud Hossain,01844444445,Government Service,Rubina Mahmud,01844444446,Housewife,Mohammed Mahmud Hossain,01844444445,Father,House No 234, Sector 4, Uttara, Dhaka,House No 234, Sector 4, Uttara, Dhaka,Dhaka,Dhaka,1230,Uttara Preparatory School,Class 5,Uttara, Dhaka,Close Location,A+
Tasnia Hoque,tasnia.hoque@iqnaschool.edu,01855555555,STD2024014,6,A,Science,14,2011-05-03,Abdul Hoque Mia,01855555556,Doctor,Nargis Hoque,01855555557,Housewife,Abdul Hoque Mia,01855555556,Father,Plot No 15, Road No 3, Baridhara, Dhaka,Plot No 15, Road No 3, Baridhara, Dhaka,Dhaka,Dhaka,1212,Baridhara Preparatory School,Class 5,Baridhara, Dhaka,Health Conscious Environment,A
Naim Islam,naim.islam@iqnaschool.edu,01866666666,STD2024015,6,B,Humanities,15,2011-12-08,Mohammed Islam Mia,01866666667,Police,Sakila Islam,01866666668,Nurse,Mohammed Islam Mia,01866666667,Father,Quarter No 12, Police Line, Rajarbag, Dhaka,Quarter No 12, Police Line, Rajarbag, Dhaka,Dhaka,Dhaka,1214,Rajarbag Police Line School,Class 5,Rajarbag, Dhaka,Father's Job Benefits,A
Ayesha Siddika,ayesha.siddika@iqnaschool.edu,01877777777,STD2024016,5,A,Science,16,2012-08-10,Mohammed Siddikur Rahman,01877777778,Teacher,Fatema Siddika,01877777779,Housewife,Mohammed Siddikur Rahman,01877777778,Father,House No 89, Road No 6, Mirpur, Dhaka,House No 89, Road No 6, Mirpur, Dhaka,Dhaka,Dhaka,1216,Mirpur Preparatory School,Class 4,Mirpur, Dhaka,Quality Education,A+
Jihad Hossain,jihad.hossain@iqnaschool.edu,01888888888,STD2024017,5,A,Science,17,2012-04-25,Mohammed Hossain Ali,01888888889,Farmer,Rejia Begum,01888888890,Housewife,Mohammed Hossain Ali,01888888889,Father,Village: Kashimpur, Upazila: Gazipur, Dhaka,Village: Kashimpur, Upazila: Gazipur, Dhaka,Dhaka,Dhaka,1700,Kashimpur Primary School,Class 4,Gazipur, Dhaka,Good School Near Village,A
Samia Akter,samia.akter@iqnaschool.edu,01899999999,STD2024018,4,A,Science,18,2013-11-15,Mohammed Akter Hossain,01899999998,Businessman,Samia Begum,01899999997,Housewife,Mohammed Akter Hossain,01899999998,Father,Flat No 23B, Road No 12, Banani, Dhaka,Flat No 23B, Road No 12, Banani, Dhaka,Dhaka,Dhaka,1213,Banani Kindergarten School,Class 3,Banani, Dhaka,Good Urban School,A+
Ariful Islam,ariful.islam@iqnaschool.edu,01911111111,STD2024019,4,B,Humanities,19,2013-06-08,Mohammed Islam Mia,01911111112,Engineer,Arifa Begum,01911111113,Housewife,Mohammed Islam Mia,01911111112,Father,House No 56, Lane No 7, Uttara, Dhaka,House No 56, Lane No 7, Uttara, Dhaka,Dhaka,Dhaka,1230,Uttara Kindergarten School,Class 3,Uttara, Dhaka,Modern Education System,A
Lamia Khan,lamia.khan@iqnaschool.edu,01922222222,STD2024020,3,A,Science,20,2014-09-20,Mohammed Khan Saheb,01922222223,Government Service,Lamia Khatun,01922222224,Housewife,Mohammed Khan Saheb,01922222223,Father,Plot No 34, Road No 9, Dhanmondi, Dhaka,Plot No 34, Road No 9, Dhanmondi, Dhaka,Dhaka,Dhaka,1209,Dhanmondi Kindergarten School,Class 2,Dhanmondi, Dhaka,Beautiful Environment,A+`;

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
                    </div>


                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">⭐ আবশ্যক কলামসমূহ:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        নাম (Name)
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        ইমেইল (Email)
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        ক্লাস (Class)
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">📋 ঐচ্ছিক কলামসমূহ:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm text-gray-600">
                      <div>• ফোন_নম্বর (Phone Number)</div>
                      <div>• শিক্ষার্থী_আইডি (Student ID)</div>
                      <div>• বিভাগ (Section)</div>
                      <div>• গ্রুপ (Group)</div>
                      <div>• রোল_নম্বর (Roll Number)</div>
                      <div>• বাবার_নাম (Father's Name)</div>
                      <div>• মাতার_নাম (Mother's Name)</div>
                      <div>• অভিভাবকের_নাম (Guardian Name)</div>
                      <div>• অভিভাবকের_ফোন (Guardian Phone)</div>
                      <div>• ঠিকানা (Address)</div>
                    </div>
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
                          <td className="px-4 py-3 text-sm text-gray-900">{student.displayName || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{student.email || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{student.class || 'N/A'}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              student.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {student.isValid ? 'বৈধ' : 'ত্রুটি'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-red-600">
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
