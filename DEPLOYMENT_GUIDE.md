# Deployment Guide - Secure Production Setup

## 🚀 Quick Start - Making Your Website Production-Ready

This guide will help you deploy your Multi-School Management System securely.

---

## Step 1: Activate Security Rules

### 1.1 Deploy Firestore Security Rules

Your production-ready Firestore rules are already in place. Deploy them:

```bash
firebase deploy --only firestore:rules
```

**Verify deployment:**
1. Go to Firebase Console → Firestore Database → Rules
2. Confirm the rules show role-based access control
3. Test that users can only access their school's data

### 1.2 Deploy Storage Rules

```bash
firebase deploy --only storage
```

### 1.3 Deploy Database Rules

```bash
firebase deploy --only database
```

---

## Step 2: Activate Security Middleware

Rename the secure middleware file to activate security headers:

**Windows (PowerShell):**
```powershell
cd "d:\LAvlu Personal\Iqra\Website\webapp\src"
Remove-Item middleware.ts
Rename-Item middleware.secure.ts middleware.ts
```

**Or manually:**
1. Delete `src/middleware.ts`
2. Rename `src/middleware.secure.ts` to `src/middleware.ts`

---

## Step 3: Set Up Firebase Admin SDK

### 3.1 Create Service Account

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click Settings (gear icon) → Project settings
4. Go to "Service accounts" tab
5. Click "Generate new private key"
6. Save the JSON file securely (DO NOT commit to Git)

### 3.2 Add Environment Variables

Add these to your `.env.local` file:

```env
# Existing Firebase config (keep these)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Add these for Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

**Important:** 
- The private key must be in quotes
- Keep the `\n` characters for line breaks
- Never commit this file to Git (it's already in .gitignore)

---

## Step 4: Create First Super Admin

**CRITICAL:** Super admins MUST be created manually in Firebase Console.

### 4.1 Create User in Firebase Auth

1. Go to Firebase Console → Authentication
2. Click "Add user"
3. Enter email and password
4. Copy the User UID

### 4.2 Create User Document in Firestore

1. Go to Firebase Console → Firestore Database
2. Click "Start collection"
3. Collection ID: `users`
4. Document ID: [paste the User UID from step 4.1]
5. Add fields:

```
email: "admin@yourschool.com" (string)
name: "Super Admin" (string)
role: "super_admin" (string)
isActive: true (boolean)
createdAt: [click "timestamp" and select current time]
updatedAt: [click "timestamp" and select current time]
```

6. Click "Save"

### 4.3 Test Super Admin Login

1. Go to your website
2. Log in with the super admin credentials
3. Verify you can access all features

---

## Step 5: Configure Production Hosting

### Option A: Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Add environment variables in Vercel dashboard:
   - Go to your project settings
   - Add all variables from `.env.local`

4. Redeploy:
```bash
vercel --prod
```

### Option B: Deploy to Firebase Hosting

1. Build the project:
```bash
npm run build
```

2. Deploy:
```bash
firebase deploy --only hosting
```

### Option C: Deploy to Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy using Netlify CLI or connect your Git repository

3. Add environment variables in Netlify dashboard

---

## Step 6: Enable HTTPS

**CRITICAL:** Always use HTTPS in production.

- **Vercel/Netlify:** HTTPS is automatic
- **Firebase Hosting:** HTTPS is automatic
- **Custom domain:** Configure SSL certificate

---

## Step 7: Security Testing

### 7.1 Test Role-Based Access

1. Create test users with different roles
2. Verify each role can only access appropriate data
3. Try to access other schools' data (should fail)

### 7.2 Test Security Rules

```bash
# Install Firebase emulator
npm install -g firebase-tools

# Run security rules tests
firebase emulators:start --only firestore
```

### 7.3 Check Security Headers

Visit your deployed site and check headers:

```bash
curl -I https://your-domain.com
```

Verify these headers are present:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security`

---

## Step 8: Set Up Monitoring

### 8.1 Firebase Monitoring

1. Go to Firebase Console → Performance
2. Enable Performance Monitoring
3. Set up alerts for security rule violations

### 8.2 Audit Log Monitoring

Create a script to check audit logs regularly:

```typescript
// Check for suspicious activities
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './lib/firebase';

async function checkSuspiciousActivities() {
  const logsRef = collection(db, 'systemLogs');
  const q = query(
    logsRef, 
    where('severity', 'in', ['error', 'critical']),
    where('timestamp', '>=', new Date(Date.now() - 24 * 60 * 60 * 1000))
  );
  
  const snapshot = await getDocs(q);
  console.log(`Found ${snapshot.size} security events in last 24 hours`);
}
```

---

## Step 9: Backup Strategy

### 9.1 Automated Firestore Backups

Set up automated backups:

```bash
# Using gcloud CLI
gcloud firestore export gs://your-backup-bucket
```

### 9.2 Schedule Regular Backups

Use Cloud Scheduler or cron jobs to run backups daily.

---

## Step 10: Post-Deployment Checklist

- [ ] Firestore rules deployed and tested
- [ ] Storage rules deployed
- [ ] Database rules deployed
- [ ] Security middleware activated
- [ ] Super admin created and tested
- [ ] Environment variables configured
- [ ] HTTPS enabled
- [ ] Security headers verified
- [ ] Role-based access tested
- [ ] Audit logging working
- [ ] Monitoring set up
- [ ] Backup strategy implemented
- [ ] Documentation updated
- [ ] Team trained on security practices

---

## 🔒 Security Maintenance

### Weekly Tasks:
- Review audit logs for suspicious activities
- Check failed login attempts
- Verify no unauthorized access

### Monthly Tasks:
- Update dependencies (`npm audit fix`)
- Review user roles and permissions
- Test backup restoration
- Security rules audit

### Quarterly Tasks:
- Full security audit
- Penetration testing
- Update security documentation
- Team security training

---

## 🚨 Emergency Procedures

### If You Detect a Security Breach:

1. **Immediate Response:**
   ```bash
   # Disable affected user
   firebase auth:users:delete [USER_ID]
   
   # Review audit logs
   # Check systemLogs collection in Firestore
   ```

2. **Investigate:**
   - Check audit logs for timeframe
   - Identify compromised data
   - Find entry point

3. **Remediate:**
   - Fix vulnerability
   - Update security rules
   - Reset passwords
   - Notify affected users

4. **Document:**
   - Record incident details
   - Update security procedures
   - Implement additional safeguards

---

## 📊 Performance Optimization

### After Security Setup:

1. **Enable Firestore Indexes:**
   ```bash
   firebase deploy --only firestore:indexes
   ```

2. **Optimize Images:**
   - Use WebP format
   - Implement lazy loading
   - Use Next.js Image component

3. **Enable Caching:**
   - Configure CDN
   - Set cache headers
   - Use service workers

---

## 🆘 Troubleshooting

### Common Issues:

**Issue: "Permission denied" errors**
- **Solution:** Check Firestore rules are deployed
- Verify user has correct role in Firestore
- Check user's `isActive` status

**Issue: Security headers not showing**
- **Solution:** Verify middleware.ts is active (not middleware.secure.ts)
- Rebuild and redeploy the application
- Clear browser cache

**Issue: Admin SDK authentication fails**
- **Solution:** Check environment variables are set correctly
- Verify private key format (must include `\n` characters)
- Ensure service account has correct permissions

**Issue: Rate limiting too aggressive**
- **Solution:** Adjust limits in `src/lib/security.ts`
- Clear rate limit cache: `clearRateLimit(key)`

---

## 📞 Support

For security concerns or deployment issues:
- **Email:** mdlavlusheikh220@gmail.com
- **Documentation:** See SECURITY.md for detailed security info
- **Firebase Support:** https://firebase.google.com/support

---

## ✅ Success Criteria

Your deployment is successful when:

1. ✅ Users can only access their school's data
2. ✅ Role-based permissions work correctly
3. ✅ Security headers are present
4. ✅ Audit logs are being created
5. ✅ HTTPS is enabled
6. ✅ No security warnings in browser console
7. ✅ File uploads respect size/type limits
8. ✅ Rate limiting prevents abuse
9. ✅ Super admin can manage all schools
10. ✅ Regular users cannot escalate privileges

---

**Congratulations! Your Multi-School Management System is now secure and production-ready! 🎉**
