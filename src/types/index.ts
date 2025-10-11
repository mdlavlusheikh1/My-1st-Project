export interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'teacher' | 'parent' | 'student';
  schoolId?: string; // Not applicable for super_admin
  profileImage?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface School {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  principalName: string;
  establishedYear: number;
  logo?: string;
  adminIds: string[]; // Array of user IDs who are school admins
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface Class {
  id: string;
  schoolId: string;
  name: string; // e.g., "Class 7", "Class 8"
  section: string; // e.g., "A", "B", "C"
  teacherId: string; // Class teacher ID
  academicYear: string; // e.g., "2024-2025"
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface Student {
  id: string;
  schoolId: string;
  classId: string;
  rollNumber: string;
  name: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: Date;
  address: string;
  phone?: string;
  email?: string;
  profileImage?: string;
  qrCode: string; // Unique QR code for the student
  guardianPhone: string;
  guardianEmail?: string;
  admissionDate: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  schoolId: string;
  date: Date;
  checkInTime?: Date;
  checkOutTime?: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  markedBy: string; // Teacher ID who marked attendance
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceSession {
  id: string;
  classId: string;
  schoolId: string;
  date: Date;
  startTime: Date;
  endTime?: Date;
  teacherId: string;
  isActive: boolean;
  attendanceType: 'checkin' | 'checkout';
  createdAt: Date;
  updatedAt: Date;
}

export interface Subject {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  teacherIds: string[];
  classIds: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  schoolId: string;
  title: string;
  message: string;
  type: 'attendance' | 'announcement' | 'alert';
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Utility types for API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Form types
export interface StudentRegistrationForm {
  name: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  address: string;
  phone?: string;
  email?: string;
  rollNumber: string;
  classId: string;
  guardianPhone: string;
  guardianEmail?: string;
  admissionDate: string;
}

export interface SchoolRegistrationForm {
  name: string;
  address: string;
  phone: string;
  email: string;
  principalName: string;
  establishedYear: number;
  adminEmail: string; // Email of the first school admin
}

export interface ClassCreationForm {
  name: string;
  section: string;
  teacherId: string;
  academicYear: string;
}

// Dashboard data types
export interface SchoolStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  presentToday: number;
  absentToday: number;
  attendanceRate: number;
}

export interface AttendanceStats {
  date: string;
  totalStudents: number;
  presentStudents: number;
  absentStudents: number;
  lateStudents: number;
  attendanceRate: number;
}

export interface MonthlyAttendanceReport {
  studentId: string;
  studentName: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendancePercentage: number;
}
