# 🔥 IqNA Landing Firebase Connection Guide

## 🎯 Objective
Connect your Iqra School Management System to the **IqNA Landing** Firebase project.

## 📋 Quick Setup Checklist

### ✅ Step 1: Firebase CLI Connection
```bash
# Connect to IqNA Landing project
firebase use --add
# Select "IqNA Landing" from the list when prompted
```

### ✅ Step 2: Get Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select **"IqNA Landing"** project
3. Go to Project Settings (⚙️ gear icon)
4. Scroll to "Your apps" section
5. If no web app exists:
   - Click **"Add app"** → **Web** (</> icon)
   - App nickname: **"Iqra School Management"**
   - Register app
6. Copy the Firebase config object

### ✅ Step 3: Update Environment Variables
Replace values in `.env.local` with your IqNA Landing config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=iqna-landing.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=iqna-landing
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=iqna-landing.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_actual_app_id
```

### ✅ Step 4: Enable Firebase Services
In **IqNA Landing** Firebase Console:
- [ ] **Authentication** → Sign-in method → Email/Password ✅
- [ ] **Firestore Database** → Create database ✅
- [ ] **Storage** → Get started ✅
- [ ] **Hosting** (optional) ✅

### ✅ Step 5: Deploy Security Rules
```bash
# Make sure you're using IqNA Landing project
firebase use iqna-landing

# Deploy rules
./connect-iqna-landing.sh
```

### ✅ Step 6: Create Your Teacher Account

#### A. Authentication User:
1. Firebase Console → **IqNA Landing** → Authentication → Users
2. Click **"Add user"**
3. Email: `mdlavlusheikh220@gmail.com`
4. Password: `demo123`
5. **Copy the User UID** 📝

#### B. Firestore User Document:
1. Firestore Database → **"users"** collection
2. Document ID: **[User UID from above]**
3. Add these fields:

```json
{
  "email": "mdlavlusheikh220@gmail.com",
  "name": "Md Lavlu Sheikh",
  "role": "teacher",
  "schoolId": "iqra-academy",
  "isActive": true,
  "phone": "+8801788888888",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### ✅ Step 7: Create School Document
1. Firestore Database → **"schools"** collection
2. Document ID: `iqra-academy`
3. Add these fields:

```json
{
  "name": "Iqra Mukari Academy",
  "address": "159 Main Road, Dhaka-1207",
  "phone": "+8801788888888",
  "email": "info@iqraacademy.edu",
  "principalName": "Principal Name",
  "establishedYear": 2018,
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### ✅ Step 8: Test Connection
1. **Restart development server:**
   ```bash
   npm run dev
   ```

2. **Test login:**
   - Email: `mdlavlusheikh220@gmail.com`
   - Password: `demo123`

3. **Verify redirect:** Should go to `/teacher/dashboard`

## 🎉 Success Verification

When everything is working correctly:
- ✅ Login with your teacher account works
- ✅ Redirected to teacher dashboard
- ✅ No authentication errors
- ✅ Firebase Console shows the user login

## 🔧 Quick Commands

```bash
# Check current Firebase project
firebase use --current

# Switch to IqNA Landing (if needed)
firebase use iqna-landing

# Deploy security rules
firebase deploy --only firestore:rules,storage

# Start development server
npm run dev
```

## 🆘 Troubleshooting

### Issue: "Project not found"
**Solution:** Make sure you have access to the IqNA Landing project and it's spelled correctly.

### Issue: "Authentication error"
**Solution:** Verify the User UID in Firestore matches the Authentication UID exactly.

### Issue: "Access denied"
**Solution:** Ensure security rules are deployed and user has `isActive: true`.

## 📞 Your Setup Summary
- **Project:** IqNA Landing
- **Teacher Email:** mdlavlusheikh220@gmail.com
- **Role:** teacher
- **School ID:** iqra-academy
- **Dashboard:** `/teacher/dashboard`

---
**Ready to use your Iqra School Management System with IqNA Landing! 🎓**