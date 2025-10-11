# Teacher Account Setup Guide for mdlavlusheikh220@gmail.com

## 🎯 Objective
Set up your teacher account `mdlavlusheikh220@gmail.com` in the Firebase project.

## 👤 Account Details
- **Email**: mdlavlusheikh220@gmail.com  
- **Role**: teacher
- **Password**: demo123 (or your preferred password)
- **School**: Iqra Mukari Academy

## 📋 Step-by-Step Setup

### Step 1: Create Authentication User
1. Go to Firebase Console → Authentication → Users
2. Click "Add user"
3. Enter:
   - **Email**: `mdlavlusheikh220@gmail.com`
   - **Password**: `demo123` (or your preferred password)
4. Click "Add user"
5. **Copy the User UID** - you'll need this for Firestore

### Step 2: Create Firestore User Document
1. Go to Firebase Console → Firestore Database
2. Click "Start collection" (if no collections exist) or "+ Start collection"
3. Collection ID: `users`
4. Click "Next"
5. Document ID: **[Paste the User UID from Step 1]**
6. Add the following fields:

```json
{
  "email": "mdlavlusheikh220@gmail.com",
  "name": "Md Lavlu Sheikh",
  "role": "teacher",
  "schoolId": "iqra-academy-main",
  "isActive": true,
  "phone": "+8801788888888",
  "createdAt": [Firebase Timestamp - use current time],
  "updatedAt": [Firebase Timestamp - use current time]
}
```

### Step 3: Create School Document (Required)
1. In Firestore, create another collection: `schools`
2. Document ID: `iqra-academy-main`
3. Add the following fields:

```json
{
  "name": "Iqra Mukari Academy",
  "address": "159 Main Road, Dhaka-1207",
  "phone": "+8801788888888",
  "email": "info@iqraacademy.edu",
  "principalName": "Principal Name",
  "establishedYear": 2018,
  "adminIds": ["teacher-uid-here"],
  "isActive": true,
  "createdAt": [Firebase Timestamp - use current time],
  "updatedAt": [Firebase Timestamp - use current time]
}
```

### Step 4: Create Demo Accounts (Optional)
For testing purposes, you may want to create other demo accounts:

#### Super Admin
- **Authentication**: superadmin@iqra.edu.bd / demo123
- **Firestore Document**:
```json
{
  "email": "superadmin@iqra.edu.bd",
  "name": "Super Administrator",
  "role": "super_admin",
  "isActive": true,
  "createdAt": [timestamp],
  "updatedAt": [timestamp]
}
```

#### School Admin
- **Authentication**: admin@iqra.edu.bd / demo123
- **Firestore Document**:
```json
{
  "email": "admin@iqra.edu.bd",
  "name": "School Administrator",
  "role": "school_admin",
  "schoolId": "iqra-academy-main",
  "isActive": true,
  "createdAt": [timestamp],
  "updatedAt": [timestamp]
}
```

### Step 5: Test Your Setup
1. Restart your development server: `npm run dev`
2. Go to the login page
3. Enter:
   - **Email**: `mdlavlusheikh220@gmail.com`
   - **Password**: `demo123`
4. You should be redirected to `/teacher/dashboard`

## ⚠️ Important Notes

1. **UID Matching**: The Firestore document ID MUST match the Authentication UID
2. **Role Consistency**: Make sure the role in Firestore matches your expected permissions
3. **School ID**: All users in the same school should have the same `schoolId`
4. **Security Rules**: Make sure you've deployed the Firebase security rules

## 🔧 Troubleshooting

### Issue: Login fails with "User data not found"
- **Solution**: Check that the Firestore document ID matches the Authentication UID

### Issue: Access denied errors
- **Solution**: Verify security rules are deployed and user has `isActive: true`

### Issue: Wrong dashboard redirect
- **Solution**: Check the `role` field in the Firestore user document

## 📞 Your Account Details
- **Email**: mdlavlusheikh220@gmail.com
- **Role**: teacher
- **School**: iqra-academy-main
- **Dashboard**: `/teacher/dashboard`

## ✅ Verification Checklist
- [ ] Authentication user created
- [ ] Firestore user document created with correct UID
- [ ] School document created
- [ ] Security rules deployed
- [ ] Login test successful
- [ ] Teacher dashboard accessible