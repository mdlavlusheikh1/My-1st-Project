'use client';

import { useState } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Database, Plus, Search, Users, BookOpen, Calendar } from 'lucide-react';

export default function DataQueryPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const showResult = (message: string) => {
    setResult(message);
    setTimeout(() => setResult(''), 10000);
  };

  // Create sample users
  const createSampleUsers = async () => {
    setLoading(true);
    try {
      const sampleUsers = [
        {
          uid: 'user-super-admin-001',
          name: 'Super Admin',
          email: 'superadmin@iqra.edu.bd',
          phone: '+880 1700000001',
          role: 'super_admin',
          schoolId: 'all',
          schoolName: 'System Administrator',
          address: 'System Address',
          isActive: true,
          profileImage: '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          uid: 'user-admin-001',
          name: 'School Admin',
          email: 'admin@iqra.edu.bd',
          phone: '+880 1700000002',
          role: 'admin',
          schoolId: 'school-abc-123',
          schoolName: 'আমার স্কুল',
          address: 'Dhaka, Bangladesh',
          isActive: true,
          profileImage: '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          uid: 'user-teacher-001',
          name: 'মোঃ লাভলু শেখ',
          email: 'mdlavlusheikh220@gmail.com',
          phone: '+880 1700000003',
          role: 'teacher',
          schoolId: 'school-abc-123',
          schoolName: 'আমার স্কুল',
          address: 'Dhaka, Bangladesh',
          isActive: true,
          profileImage: '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          uid: 'user-parent-001',
          name: 'অভিভাবক ১',
          email: 'parent@iqra.edu.bd',
          phone: '+880 1700000004',
          role: 'parent',
          schoolId: 'school-abc-123',
          schoolName: 'আমার স্কুল',
          address: 'Dhaka, Bangladesh',
          isActive: true,
          profileImage: '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          uid: 'user-student-001',
          name: 'ছাত্র ১',
          email: 'student@iqra.edu.bd',
          phone: '+880 1700000005',
          role: 'student',
          schoolId: 'school-abc-123',
          schoolName: 'আমার স্কুল',
          address: 'Dhaka, Bangladesh',
          isActive: false, // Needs approval
          profileImage: '',
          guardianName: 'অভিভাবক ১',
          guardianPhone: '+880 1700000004',
          studentId: 'STD-001',
          class: 'দশম শ্রেণী',
          section: 'ক',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      ];

      for (const user of sampleUsers) {
        await setDoc(doc(db, 'users', user.uid), user);
      }

      showResult(`✅ ${sampleUsers.length} sample users created successfully!`);
    } catch (error) {
      showResult(`❌ Error creating users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Create sample classes
  const createSampleClasses = async () => {
    setLoading(true);
    try {
      const sampleClasses = [
        {
          classId: 'class-ten-a',
          className: 'দশম শ্রেণী',
          section: 'ক',
          schoolId: 'school-abc-123',
          schoolName: 'আমার স্কুল',
          teacherId: 'user-teacher-001',
          teacherName: 'মোঃ লাভলু শেখ',
          academicYear: '2024',
          totalStudents: 45,
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          classId: 'class-nine-a',
          className: 'নবম শ্রেণী',
          section: 'ক',
          schoolId: 'school-abc-123',
          schoolName: 'আমার স্কুল',
          teacherId: 'user-teacher-001',
          teacherName: 'মোঃ লাভলু শেখ',
          academicYear: '2024',
          totalStudents: 42,
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      ];

      for (const classData of sampleClasses) {
        await setDoc(doc(db, 'classes', classData.classId), classData);
      }

      showResult(`✅ ${sampleClasses.length} sample classes created successfully!`);
    } catch (error) {
      showResult(`❌ Error creating classes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Create sample attendance records
  const createSampleAttendance = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const sampleAttendance = [
        {
          studentId: 'user-student-001',
          studentName: 'ছাত্র ১',
          classId: 'class-ten-a',
          className: 'দশম শ্রেণী - ক',
          schoolId: 'school-abc-123',
          date: today.toISOString().split('T')[0],
          status: 'present',
          timestamp: serverTimestamp(),
          teacherId: 'user-teacher-001',
          method: 'qr_scan'
        }
      ];

      for (const attendance of sampleAttendance) {
        await addDoc(collection(db, 'attendanceRecords'), attendance);
      }

      showResult(`✅ ${sampleAttendance.length} sample attendance records created!`);
    } catch (error) {
      showResult(`❌ Error creating attendance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Query all users
  const queryAllUsers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const users: any[] = [];
      snapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });

      showResult(`📊 Found ${users.length} users in database:\n${users.map(u => `• ${u.name} (${u.role})`).join('\n')}`);
    } catch (error) {
      showResult(`❌ Error querying users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Query users by role
  const queryUsersByRole = async () => {
    setLoading(true);
    try {
      const roles = ['super_admin', 'admin', 'teacher', 'parent', 'student'];
      let totalUsers = 0;
      let roleResults = '';

      for (const role of roles) {
        const q = query(
          collection(db, 'users'),
          where('role', '==', role),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        roleResults += `${role}: ${snapshot.size} users\n`;
        totalUsers += snapshot.size;
      }

      showResult(`👥 Users by role:\n${roleResults}Total: ${totalUsers} users`);
    } catch (error) {
      showResult(`❌ Error querying by role: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Query pending users (inactive)
  const queryPendingUsers = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'users'),
        where('isActive', '==', false),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const pendingUsers: any[] = [];
      snapshot.forEach((doc) => {
        pendingUsers.push({ id: doc.id, ...doc.data() });
      });

      showResult(`⏳ Found ${pendingUsers.length} pending users:\n${pendingUsers.map(u => `• ${u.name} (${u.role}) - ${u.email}`).join('\n')}`);
    } catch (error) {
      showResult(`❌ Error querying pending users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Query school-specific data
  const querySchoolData = async () => {
    setLoading(true);
    try {
      const schoolId = 'school-abc-123';
      
      // Get school users
      const usersQ = query(
        collection(db, 'users'),
        where('schoolId', '==', schoolId),
        orderBy('createdAt', 'desc')
      );
      const usersSnapshot = await getDocs(usersQ);

      // Get school classes
      const classesQ = query(
        collection(db, 'classes'),
        where('schoolId', '==', schoolId)
      );
      const classesSnapshot = await getDocs(classesQ);

      showResult(`🏫 School (${schoolId}) data:\n• Users: ${usersSnapshot.size}\n• Classes: ${classesSnapshot.size}`);
    } catch (error) {
      showResult(`❌ Error querying school data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Database className="w-8 h-8 mr-3 text-blue-600" />
            Data Query Panel
          </h1>
          <p className="text-gray-600">Create sample data and test database queries</p>
        </div>

        {/* Result Display */}
        {result && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <pre className="text-sm text-blue-800 whitespace-pre-wrap">{result}</pre>
          </div>
        )}

        {/* Data Creation Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Plus className="w-6 h-6 mr-2 text-green-600" />
            Create Sample Data
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={createSampleUsers}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <Users className="w-5 h-5 mr-2" />
              {loading ? 'Creating...' : 'Create Users'}
            </button>
            
            <button
              onClick={createSampleClasses}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              {loading ? 'Creating...' : 'Create Classes'}
            </button>
            
            <button
              onClick={createSampleAttendance}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <Calendar className="w-5 h-5 mr-2" />
              {loading ? 'Creating...' : 'Create Attendance'}
            </button>
          </div>
        </div>

        {/* Query Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Search className="w-6 h-6 mr-2 text-blue-600" />
            Database Queries
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={queryAllUsers}
              disabled={loading}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              Query All Users
            </button>
            
            <button
              onClick={queryUsersByRole}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              Query Users by Role
            </button>
            
            <button
              onClick={queryPendingUsers}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              Query Pending Users
            </button>
            
            <button
              onClick={querySchoolData}
              disabled={loading}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              Query School Data
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/debug/firestore"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors text-center"
          >
            🔍 Firestore Debug
          </a>
          
          <a
            href="/admin/users"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors text-center"
          >
            👥 User Management
          </a>
          
          <a
            href="/admin/promote"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-colors text-center"
          >
            ⬆️ Promote Users
          </a>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-medium text-yellow-900 mb-2">Instructions:</h3>
          <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
            <li>First, create sample data using the buttons above</li>
            <li>Deploy Firestore indexes using the deployment scripts</li>
            <li>Test queries to verify data is properly stored</li>
            <li>Use the admin panel to manage users and approve accounts</li>
            <li>Your teacher account (mdlavlusheikh220@gmail.com) will be created as active</li>
          </ol>
        </div>
      </div>
    </div>
  );
}