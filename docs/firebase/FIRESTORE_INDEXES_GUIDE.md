# Firestore Indexes Deployment Guide

## 🎯 Purpose
This guide helps you create the necessary Firestore indexes for the School Management System's user queries to work properly.

## ⚠️ Why Indexes Are Required
Firestore requires composite indexes for queries that:
- Filter by multiple fields
- Combine filtering with ordering
- Use inequality filters on different fields

The user management system uses complex queries like:
```javascript
// This requires an index for (schoolId, createdAt)
query(collection(db, 'users'), 
  where('schoolId', '==', userData.schoolId),
  orderBy('createdAt', 'desc')
)
```

## 📋 Pre-requisites
1. **Firebase CLI installed**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase login**:
   ```bash
   firebase login
   ```

3. **Access to iqna-landing project**: You need Editor/Owner permissions

## 🚀 Quick Deployment

### Windows Users:
1. Open Command Prompt or PowerShell
2. Navigate to the project directory:
   ```cmd
   cd "d:\LAvlu Personal\Iqra\Website\webapp"
   ```
3. Run the deployment script:
   ```cmd
   deploy-indexes.bat
   ```

### Linux/Mac Users:
1. Open Terminal
2. Navigate to the project directory:
   ```bash
   cd "d:/LAvlu Personal/Iqra/Website/webapp"
   ```
3. Make script executable and run:
   ```bash
   chmod +x deploy-indexes.sh
   ./deploy-indexes.sh
   ```

### Manual Deployment:
```bash
# Set project
firebase use iqna-landing

# Deploy indexes
firebase deploy --only firestore:indexes
```

## 📊 Indexes Created
The following indexes will be created for optimal query performance:

### Users Collection Indexes:
1. **Basic createdAt ordering**:
   - `createdAt (desc)`

2. **School-specific queries**:
   - `schoolId (asc), createdAt (desc)`

3. **Status-based queries**:
   - `isActive (asc), createdAt (desc)`

4. **Role-based queries**:
   - `role (asc), createdAt (desc)`

5. **Complex filtering**:
   - `schoolId (asc), isActive (asc), createdAt (desc)`
   - `schoolId (asc), role (asc), isActive (asc)`

### Other Collection Indexes:
- **attendanceRecords**: For attendance tracking queries
- **students**: For student management
- **classes**: For class scheduling
- **notifications**: For user notifications

## 🔍 Verification
1. **Check Firebase Console**:
   - Go to: https://console.firebase.google.com/project/iqna-landing/firestore/indexes
   - Verify all indexes show "Enabled" status

2. **Test User Management**:
   - Go to `/admin/users` in your app
   - Try filtering by different statuses
   - Check browser console for any errors

3. **Check Debug Panel**:
   - Visit `/debug/firestore` to test data loading

## ⏰ Important Notes
- **Index building takes time**: New indexes may take 5-15 minutes to build
- **Query errors during building**: Queries may fail until indexes are ready
- **Production impact**: Index building doesn't affect existing simple queries

## 🐛 Troubleshooting

### Common Issues:

1. **"Missing index" error**:
   - Wait for indexes to finish building
   - Check Firebase Console for index status

2. **Permission denied**:
   - Ensure you have Editor/Owner role on iqna-landing project
   - Re-run `firebase login` if needed

3. **Project not found**:
   - Verify project ID is correct: `iqna-landing`
   - Check available projects: `firebase projects:list`

4. **Syntax errors**:
   - Validate `firestore.indexes.json` format
   - Check for trailing commas or missing brackets

### Debug Commands:
```bash
# Check current project
firebase use

# List available projects
firebase projects:list

# View current indexes
firebase firestore:indexes

# Validate index file
cat firestore.indexes.json | json_verify
```

## 📱 After Deployment
1. **Test sign up process**: Create a new user account
2. **Check user management**: Go to `/admin/users` and verify users load
3. **Test filtering**: Try different user status filters
4. **Monitor performance**: Check query response times

## 📞 Support
If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify Firebase project permissions
3. Ensure all environment variables are correct
4. Try the debug panel at `/debug/firestore`

---
*Generated for School Management System - iqna-landing project*