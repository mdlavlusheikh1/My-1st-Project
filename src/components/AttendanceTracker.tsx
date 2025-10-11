'use client';

import React, { useState, useEffect } from 'react';
import { QRScanner } from './QRScanner';
import { QRUtils } from '@/lib/qr-utils';
import { AttendanceService, StudentService, ClassService } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';
import { AttendanceRecord, Student, Class as SchoolClass } from '@/types';
import { format } from 'date-fns';

interface AttendanceTrackerProps {
  classId?: string;
  sessionType: 'checkin' | 'checkout';
}

interface ScannedStudent {
  student: Student;
  scanTime: Date;
  status: 'present' | 'late';
}

export const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({
  classId,
  sessionType = 'checkin'
}) => {
  const { userData } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedStudents, setScannedStudents] = useState<ScannedStudent[]>([]);
  const [currentClass, setCurrentClass] = useState<SchoolClass | null>(null);
  const [availableClasses, setAvailableClasses] = useState<SchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>(classId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (userData) {
      loadUserClasses();
    }
  }, [userData]);

  useEffect(() => {
    if (selectedClassId) {
      loadClassDetails();
    }
  }, [selectedClassId]);

  const loadUserClasses = async () => {
    if (!userData) return;

    try {
      let classes: SchoolClass[] = [];

      if (userData.role === 'teacher') {
        const result = await ClassService.getClassesByTeacher(userData.uid);
        if (result.success && result.data) {
          classes = result.data;
        }
      } else if (userData.role === 'admin' || userData.role === 'super_admin') {
        const result = await ClassService.getClassesBySchool(userData.schoolId || '');
        if (result.success && result.data) {
          classes = result.data;
        }
      }

      setAvailableClasses(classes);
      
      if (classes.length > 0 && !selectedClassId) {
        setSelectedClassId(classes[0].id);
      }
    } catch (err) {
      setError('Failed to load classes');
    }
  };

  const loadClassDetails = async () => {
    if (!selectedClassId) return;

    try {
      const result = await ClassService.getClassById(selectedClassId);
      if (result.success && result.data) {
        setCurrentClass(result.data);
      }
    } catch (err) {
      setError('Failed to load class details');
    }
  };

  const handleScanSuccess = async (qrData: string, parsedData: any) => {
    if (!userData || !selectedClassId) {
      setError('Missing required data');
      return;
    }

    try {
      setError(null);
      
      if (parsedData.type !== 'student' || !parsedData.data) {
        setError('Invalid QR code. Please scan a valid student QR code.');
        return;
      }

      const studentData = parsedData.data;
      
      // Verify student belongs to current school
      if (userData.schoolId && studentData.schoolId !== userData.schoolId) {
        setError('Student does not belong to your school');
        return;
      }

      // Get student details
      const studentResult = await StudentService.getStudentById(studentData.studentId);
      if (!studentResult.success || !studentResult.data) {
        setError('Student not found');
        return;
      }

      const student = studentResult.data;

      // Check if student is already scanned
      const alreadyScanned = scannedStudents.find(s => s.student.id === student.id);
      if (alreadyScanned) {
        setError(`${student.name} has already been marked ${sessionType === 'checkin' ? 'present' : 'checked out'}`);
        return;
      }

      // Check if attendance already exists for today
      const today = new Date();
      const existingAttendance = await AttendanceService.getAttendanceByDate(today);
      if (existingAttendance.success && existingAttendance.data) {
        const studentTodayAttendance = existingAttendance.data.find(
          record => record.studentId === student.id && record.classId === selectedClassId
        );

        if (sessionType === 'checkin' && studentTodayAttendance) {
          setError(`${student.name} is already marked present for today`);
          return;
        }

        if (sessionType === 'checkout' && !studentTodayAttendance) {
          setError(`${student.name} was not checked in today`);
          return;
        }
      }

      // Determine status (present/late based on time)
      const currentTime = new Date();
      const isLate = sessionType === 'checkin' && currentTime.getHours() > 8; // After 8 AM is late
      
      const scannedStudent: ScannedStudent = {
        student,
        scanTime: currentTime,
        status: isLate ? 'late' : 'present'
      };

      setScannedStudents(prev => [...prev, scannedStudent]);

      // Automatically save attendance
      await saveAttendance(scannedStudent);

      setSuccessMessage(`${student.name} marked ${sessionType === 'checkin' ? 'present' : 'checked out'} ${isLate ? '(late)' : ''}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process QR code');
    }
  };

  const saveAttendance = async (scannedStudent: ScannedStudent) => {
    if (!userData || !selectedClassId) return;

    try {
      const attendanceData: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'> = {
        studentId: scannedStudent.student.id,
        classId: selectedClassId,
        schoolId: scannedStudent.student.schoolId,
        date: new Date(),
        status: scannedStudent.status,
        markedBy: userData.uid,
        notes: `Marked via QR scan - ${sessionType}`
      };

      if (sessionType === 'checkin') {
        attendanceData.checkInTime = scannedStudent.scanTime;
      } else {
        attendanceData.checkOutTime = scannedStudent.scanTime;
      }

      const result = await AttendanceService.markAttendance(attendanceData);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save attendance');
      }
    } catch (err) {
      throw new Error(`Failed to save attendance: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleScanError = (error: string) => {
    setError(`Scan error: ${error}`);
  };

  const clearScannedStudents = () => {
    setScannedStudents([]);
    setError(null);
    setSuccessMessage(null);
  };

  const removeScannedStudent = (studentId: string) => {
    setScannedStudents(prev => prev.filter(s => s.student.id !== studentId));
  };

  if (!userData) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">Please log in to access attendance tracking</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {sessionType === 'checkin' ? 'Check-In' : 'Check-Out'} Attendance
          </h2>
          <p className="text-gray-600">
            Scan student QR codes to mark attendance for {format(new Date(), 'MMMM dd, yyyy')}
          </p>
        </div>

        {/* Class Selection */}
        {availableClasses.length > 1 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Class
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              {availableClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} - Section {cls.section}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Current Class Info */}
        {currentClass && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900">
              {currentClass.name} - Section {currentClass.section}
            </h3>
            <p className="text-blue-700 text-sm">Academic Year: {currentClass.academicYear}</p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* QR Scanner */}
        {selectedClassId && (
          <div className="mb-6">
            <QRScanner
              onScanSuccess={handleScanSuccess}
              onScanError={handleScanError}
              width={400}
              height={300}
            />
          </div>
        )}

        {/* Scanned Students List */}
        {scannedStudents.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Scanned Students ({scannedStudents.length})
              </h3>
              <button
                onClick={clearScannedStudents}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50"
              >
                Clear All
              </button>
            </div>
            
            <div className="space-y-2">
              {scannedStudents.map((scannedStudent, index) => (
                <div
                  key={scannedStudent.student.id}
                  className="flex items-center justify-between p-3 bg-white rounded border"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${
                        scannedStudent.status === 'present' ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {scannedStudent.student.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Roll: {scannedStudent.student.rollNumber} | 
                        {' '}{format(scannedStudent.scanTime, 'HH:mm:ss')} |
                        {' '}{scannedStudent.status === 'late' ? 'Late' : 'On Time'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeScannedStudent(scannedStudent.student.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Instructions:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Ensure you have selected the correct class</li>
            <li>• Ask students to show their QR codes one at a time</li>
            <li>• Each QR code can only be scanned once per session</li>
            <li>• Attendance is automatically saved when scanned</li>
            <li>• Students arriving after 8:00 AM will be marked as late</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracker;
