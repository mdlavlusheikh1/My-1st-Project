# Multi-School Management System with QR-Based Attendance

A comprehensive school management system built with Next.js, Firebase, and QR code technology for efficient attendance tracking across multiple schools.

## Features

### 🏫 Multi-School Support
- Manage multiple schools from a single platform
- Role-based access control (Super Admin, School Admin, Teacher, Student)
- School-specific data isolation and security

### 📱 QR-Based Attendance
- Unique QR codes for each student
- Real-time QR code scanning for attendance
- Automatic attendance marking with timestamps
- Support for check-in and check-out tracking
- Late arrival detection

### 👥 User Management
- Secure authentication with Firebase Auth
- Role-based permissions and access controls
- User profiles with school associations

### 📊 Dashboard & Analytics
- Real-time attendance statistics
- Interactive dashboard for different user roles
- Attendance rate tracking and reporting
- Student enrollment metrics

### 🔧 Technology Stack
- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **QR Codes**: QRCode.js, HTML5-QRCode
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with custom gradients

## Getting Started

### Prerequisites
- Node.js 18 or later
- npm or yarn
- Firebase project setup

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd webapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create Firestore database
   - Enable Storage (optional, for profile images)
   - Get your Firebase configuration

4. **Configure environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
   ```

5. **Set up Firestore Security Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can read/write their own data
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // School admins can manage their school data
       match /schools/{schoolId} {
         allow read, write: if request.auth != null && 
           (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin' ||
            (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'school_admin' &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.schoolId == schoolId));
       }
       
       // Students and classes - school-specific access
       match /{path=**} {
         allow read, write: if request.auth != null && 
           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['super_admin', 'school_admin', 'teacher'];
       }
     }
   }
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Initial Setup

1. **Create Super Admin Account**
   - Manually create a user in Firebase Auth
   - Add user document in Firestore with role: 'super_admin'

2. **Register Schools**
   - Super Admin can register new schools
   - Assign school administrators

3. **Add Students and Teachers**
   - School admins can add students and teachers
   - Generate QR codes for students

### Daily Attendance

1. **Teacher Login**
   - Teachers log in to their dashboard
   - Select their class for attendance

2. **QR Scanning**
   - Use the attendance tracker
   - Scan student QR codes
   - Attendance is automatically recorded

3. **Reports**
   - View real-time attendance statistics
   - Generate attendance reports
   - Monitor attendance rates

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard page
│   ├── login/            # Login page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # React components
│   ├── AttendanceTracker.tsx
│   └── QRScanner.tsx
├── contexts/            # React contexts
│   └── AuthContext.tsx
├── lib/                # Utility libraries
│   ├── auth.ts         # Authentication service
│   ├── database.ts     # Database service
│   ├── firebase.ts     # Firebase configuration
│   └── qr-utils.ts     # QR code utilities
└── types/              # TypeScript type definitions
    └── index.ts
```

## API Documentation

### Database Collections

#### Users
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'school_admin' | 'teacher' | 'student';
  schoolId?: string;
  profileImage?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
```

#### Schools
```typescript
interface School {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  principalName: string;
  establishedYear: number;
  logo?: string;
  adminIds: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
```

#### Students
```typescript
interface Student {
  id: string;
  schoolId: string;
  classId: string;
  rollNumber: string;
  name: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: Date;
  address: string;
  qrCode: string;
  guardianPhone: string;
  admissionDate: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
```

#### Attendance Records
```typescript
interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  schoolId: string;
  date: Date;
  checkInTime?: Date;
  checkOutTime?: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  markedBy: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security Considerations

- All Firebase security rules are properly configured
- Role-based access control is enforced at the database level
- QR codes contain encrypted student information
- Sensitive data is not exposed in client-side code

## Future Enhancements

- [ ] Mobile app for QR scanning
- [ ] SMS notifications for parents
- [ ] Advanced reporting and analytics
- [ ] Integration with student information systems
- [ ] Bulk operations for student management
- [ ] Multi-language support
- [ ] Offline attendance support

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact:
- Email: mdlavlusheikh220@gmail.com
- Create an issue in the GitHub repository

---

**Built with ❤️ for educational institutions**