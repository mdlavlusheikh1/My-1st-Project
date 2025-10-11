# Firebase Account Change Checklist

## ✅ Pre-Change Preparation

- [ ] **Backup Current Data** (if any important data exists)
  - Export Firestore data
  - Download any uploaded files from Storage
  - Note down current user accounts and roles

- [ ] **Create New Firebase Project**
  - Go to [Firebase Console](https://console.firebase.google.com/)
  - Sign in with your desired Google account
  - Create a new project with appropriate name

## ✅ Firebase Console Setup

- [ ] **Enable Required Services:**
  - [ ] Authentication → Sign-in method → Email/Password
  - [ ] Firestore Database → Create database
  - [ ] Storage → Get started
  - [ ] Hosting (optional)

- [ ] **Get Configuration:**
  - [ ] Go to Project Settings
  - [ ] Add Web App
  - [ ] Copy the configuration object

## ✅ Local Project Updates

- [ ] **Update Environment Variables:**
  - [ ] Update `.env.local` with new Firebase config
  - [ ] Restart your development server

- [ ] **Update Firebase CLI:**
  ```bash
  # If changing Google account
  firebase logout
  firebase login
  
  # Switch to new project
  firebase use <your-new-project-id>
  ```

- [ ] **Deploy Security Rules:**
  ```bash
  chmod +x deploy-rules.sh
  ./deploy-rules.sh
  ```

## ✅ Data Setup

- [ ] **Create User Accounts:**
  - [ ] Create your teacher account: `mdlavlusheikh220@gmail.com`
  - [ ] Set up demo accounts for testing
  - [ ] Assign proper roles in Firestore

- [ ] **Setup School Data:**
  - [ ] Create school document in Firestore
  - [ ] Create classes, subjects, etc.
  - [ ] Test role-based access

## ✅ Testing

- [ ] **Authentication Testing:**
  - [ ] Test login with all role types
  - [ ] Verify role-based redirects work
  - [ ] Check dashboard access for each role

- [ ] **Database Testing:**
  - [ ] Test data read/write permissions
  - [ ] Verify security rules are working
  - [ ] Check file upload functionality

- [ ] **Application Testing:**
  - [ ] Test all major features
  - [ ] Verify QR code functionality
  - [ ] Check attendance tracking

## ✅ Post-Change Cleanup

- [ ] **Remove Old References:**
  - [ ] Clear browser cache
  - [ ] Remove old Firebase project (if no longer needed)
  - [ ] Update any documentation

- [ ] **Security Review:**
  - [ ] Verify all security rules are properly deployed
  - [ ] Test unauthorized access attempts
  - [ ] Check file permissions

## 🚨 Important Notes

1. **Environment Variables**: Make sure to restart your development server after updating `.env.local`

2. **User Roles**: Remember to set up user documents with proper `role`, `schoolId`, and `isActive` fields

3. **Demo Accounts**: Update demo credentials in your login page if they change

4. **Backup**: Always backup important data before making changes

5. **Testing**: Thoroughly test all functionality after switching projects

## 🔗 Quick Commands

```bash
# Check current project
firebase use --current

# List all projects
firebase projects:list

# Switch project
firebase use <project-id>

# Deploy rules
firebase deploy --only firestore:rules,storage,database

# Start development server
npm run dev
```