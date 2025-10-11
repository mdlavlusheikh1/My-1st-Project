# ✅ IqNA Landing Firebase Configuration Complete!

## 🎯 Configuration Status

Your Iqra School Management System is now configured to use the **IqNA Landing** Firebase project with the following credentials:

### 🔥 Firebase Project Details
- **Project ID:** `iqna-landing`
- **Auth Domain:** `iqna-landing.firebaseapp.com`
- **Database:** `https://iqna-landing-default-rtdb.asia-southeast1.firebasedatabase.app`
- **Storage:** `iqna-landing.firebasestorage.app`
- **Region:** Asia Southeast 1 (Singapore)
- **App ID:** `1:707709810810:web:990a9d4505c0eb9eb463c3`

### 👤 Your Teacher Account
- **Email:** `mdlavlusheikh220@gmail.com`
- **Role:** `teacher`
- **Dashboard:** `/teacher/dashboard`

## 🚀 Quick Start Commands

```bash
# 1. Verify configuration
chmod +x verify-iqna-connection.sh
./verify-iqna-connection.sh

# 2. Setup Firebase CLI
chmod +x setup-iqna-firebase.sh
./setup-iqna-firebase.sh

# 3. Restart development server
npm run dev
```

## 📋 Required Manual Steps

### Step 1: Enable Firebase Services
Go to [IqNA Landing Console](https://console.firebase.google.com/project/iqna-landing):

1. **Authentication** → Sign-in methods → Enable Email/Password
2. **Firestore Database** → Create database
3. **Storage** → Get started

### Step 2: Create Your Teacher Account

#### A. In Authentication:
1. Go to Authentication → Users
2. Add user: `mdlavlusheikh220@gmail.com` / `demo123`
3. Copy the generated User UID

#### B. In Firestore:
1. Create collection: `users`
2. Document ID: [User UID from above]
3. Add fields:
```json
{
  "email": "mdlavlusheikh220@gmail.com",
  "name": "Md Lavlu Sheikh",
  "role": "teacher",
  "schoolId": "iqra-academy",
  "isActive": true,
  "phone": "+8801788888888",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Step 3: Create School Document
1. Create collection: `schools`
2. Document ID: `iqra-academy`
3. Add fields:
```json
{
  "name": "Iqra Mukari Academy",
  "address": "159 Main Road, Dhaka-1207",
  "phone": "+8801788888888",
  "email": "info@iqraacademy.edu",
  "principalName": "Principal Name",
  "establishedYear": 2018,
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## 🧪 Testing Your Setup

1. **Start Development Server:**
   ```bash
   npm run dev
   ```

2. **Test Login:**
   - Go to: `http://localhost:3000`
   - Click "লগইন" (Login)
   - Enter: `mdlavlusheikh220@gmail.com` / `demo123`
   - Should redirect to: `/teacher/dashboard`

## ✅ Success Indicators

When everything is working:
- ✅ No authentication errors
- ✅ Login redirects to teacher dashboard
- ✅ Firebase Console shows user login activity
- ✅ Firestore data is accessible

## 🆘 Troubleshooting

### Issue: "Invalid API key"
**Solution:** Double-check the API key in `.env.local` matches your Firebase project

### Issue: "User not found"
**Solution:** Ensure the Firestore user document ID exactly matches the Authentication UID

### Issue: "Access denied"
**Solution:** Verify security rules are deployed and user has `isActive: true`

## 🔗 Important Links

- **Firebase Console:** https://console.firebase.google.com/project/iqna-landing
- **Authentication:** https://console.firebase.google.com/project/iqna-landing/authentication/users
- **Firestore:** https://console.firebase.google.com/project/iqna-landing/firestore
- **Storage:** https://console.firebase.google.com/project/iqna-landing/storage

---

**🎉 Your Iqra School Management System is ready to use with IqNA Landing Firebase!**