# Security Documentation

## Overview

This document outlines the security measures implemented in the Multi-School Management System to protect sensitive student and school data.

---

## 🔒 Security Features Implemented

### 1. **Firestore Security Rules (Production-Ready)**

#### Location: `firestore.rules`

**Key Security Measures:**
- ✅ **Role-Based Access Control (RBAC)**: Strict permissions based on user roles
- ✅ **School Data Isolation**: Users can only access data from their own school
- ✅ **No Privilege Escalation**: Users cannot change their own roles
- ✅ **Active User Validation**: Only active users can perform operations
- ✅ **Audit Trail**: Immutable system logs for all sensitive operations

**Role Permissions:**

| Role | Permissions |
|------|-------------|
| **Super Admin** | Full access to all schools and data |
| **School Admin** | Full access to their school's data only |
| **Teacher** | Read/write access to their school's classes and attendance |
| **Student** | Read-only access to their own data and attendance |
| **Parent** | Read-only access to their children's data |

**Important Rules:**
- User creation with `super_admin` role MUST be done manually in Firebase Console
- Students/Parents can only self-register (not create admin accounts)
- School admins cannot create super admins
- Attendance records can only be modified within 24 hours of creation

---

### 2. **Firebase Storage Security Rules**

#### Location: `storage.rules`

**Key Security Measures:**
- ✅ **File Type Validation**: Only allowed file types can be uploaded
- ✅ **File Size Limits**: 
  - Profile images: 5MB max
  - School logos: 2MB max
  - QR codes: 1MB max
  - Reports: 10MB max
- ✅ **School-Based Access**: Users can only access files from their school
- ✅ **Role-Based Upload**: Only admins/teachers can upload certain files

---

### 3. **Real-time Database Security Rules**

#### Location: `database.rules.json`

**Key Security Measures:**
- ✅ **School isolation for live attendance tracking**
- ✅ **Role-based read/write permissions**
- ✅ **Data validation for attendance sessions**
- ✅ **User-specific notification access**

---

### 4. **Input Validation & Sanitization**

#### Location: `src/lib/security.ts`

**Implemented Validations:**
- ✅ Email format validation
- ✅ Phone number validation (international format)
- ✅ Strong password requirements (8+ chars, uppercase, lowercase, number, special char)
- ✅ Role validation
- ✅ XSS protection (HTML escaping)
- ✅ File upload validation (type and size)
- ✅ SQL injection prevention (Firestore is NoSQL, but input sanitization applied)

**Sanitization Functions:**
- `sanitizeString()` - Removes dangerous characters
- `sanitizeHTML()` - Removes script tags and event handlers
- `sanitizeFileName()` - Ensures safe file names
- `escapeHTML()` - Prevents XSS attacks

---

### 5. **Rate Limiting**

#### Location: `src/lib/security.ts`

**Protection Against:**
- ✅ Brute force login attempts
- ✅ API abuse
- ✅ QR code scanning spam
- ✅ Excessive data requests

**Default Limits:**
- 10 attempts per minute per user/action
- Configurable per endpoint

---

### 6. **Audit Logging System**

#### Location: `src/lib/audit-logger.ts`

**Logged Events:**
- ✅ User login/logout
- ✅ User creation/deletion/role changes
- ✅ School creation/updates
- ✅ Student data modifications
- ✅ Attendance marking
- ✅ Unauthorized access attempts
- ✅ Failed login attempts
- ✅ Suspicious activities
- ✅ Data exports

**Log Severity Levels:**
- `INFO` - Normal operations
- `WARNING` - Potentially concerning actions
- `ERROR` - Failed operations
- `CRITICAL` - Security incidents

**Audit logs are:**
- Immutable (cannot be modified or deleted)
- Accessible only to super admins
- Include timestamp, user info, IP address, and user agent

---

### 7. **Security Middleware**

#### Location: `src/middleware.secure.ts`

**Security Headers Added:**
- ✅ `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- ✅ `X-Frame-Options: DENY` - Prevents clickjacking
- ✅ `X-XSS-Protection: 1; mode=block` - XSS protection
- ✅ `Strict-Transport-Security` - Forces HTTPS (production only)
- ✅ `Content-Security-Policy` - Restricts resource loading
- ✅ `Referrer-Policy` - Controls referrer information
- ✅ `Permissions-Policy` - Restricts browser features

**Additional Protection:**
- Blocks access to sensitive files (.env, .git, firebase config)
- Returns 404 for unauthorized file access attempts

---

### 8. **Server-Side User Creation API**

#### Location: `src/app/api/users/create/route.ts`

**Security Features:**
- ✅ Token-based authentication required
- ✅ Role validation before user creation
- ✅ Password strength enforcement
- ✅ School isolation for school admins
- ✅ Prevents privilege escalation
- ✅ Audit logging for all user creation

---

## 🚀 Deployment Checklist

### Before Going to Production:

#### 1. **Firebase Configuration**
- [ ] Replace `firestore.rules` with production rules (already done)
- [ ] Deploy security rules: `firebase deploy --only firestore:rules`
- [ ] Deploy storage rules: `firebase deploy --only storage`
- [ ] Deploy database rules: `firebase deploy --only database`

#### 2. **Environment Variables**
- [ ] Ensure `.env.local` is NOT committed to Git (already in .gitignore)
- [ ] Set up environment variables in production hosting:
  ```
  NEXT_PUBLIC_FIREBASE_API_KEY=xxx
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
  NEXT_PUBLIC_FIREBASE_APP_ID=xxx
  FIREBASE_CLIENT_EMAIL=xxx (for admin SDK)
  FIREBASE_PRIVATE_KEY=xxx (for admin SDK)
  ```

#### 3. **Firebase Admin SDK**
- [ ] Create a service account in Firebase Console
- [ ] Download the service account JSON
- [ ] Add credentials to environment variables (never commit the JSON file)

#### 4. **Middleware**
- [ ] Rename `middleware.secure.ts` to `middleware.ts` to activate security headers
- [ ] Test all routes with security headers enabled

#### 5. **Super Admin Setup**
- [ ] Manually create first super admin in Firebase Console:
  1. Go to Firebase Console → Authentication
  2. Add user with email/password
  3. Go to Firestore → users collection
  4. Create document with user's UID:
     ```json
     {
       "email": "admin@example.com",
       "name": "Super Admin",
       "role": "super_admin",
       "isActive": true,
       "createdAt": [current timestamp],
       "updatedAt": [current timestamp]
     }
     ```

#### 6. **Testing**
- [ ] Test role-based access control
- [ ] Test school data isolation
- [ ] Verify users cannot access other schools' data
- [ ] Test rate limiting
- [ ] Verify audit logs are being created
- [ ] Test file upload restrictions
- [ ] Verify security headers are present

#### 7. **Monitoring**
- [ ] Set up Firebase Security Rules alerts
- [ ] Monitor audit logs regularly
- [ ] Set up alerts for critical security events
- [ ] Review failed login attempts

---

## 🛡️ Security Best Practices

### For Developers:

1. **Never commit sensitive data**
   - API keys, passwords, service accounts
   - Use environment variables

2. **Always validate input**
   - Use validation functions from `src/lib/security.ts`
   - Sanitize user input before storing

3. **Use audit logging**
   - Log all sensitive operations
   - Import from `src/lib/audit-logger.ts`

4. **Follow the principle of least privilege**
   - Give users minimum required permissions
   - Don't bypass security rules

5. **Keep dependencies updated**
   - Regularly run `npm audit`
   - Update packages with security vulnerabilities

### For Administrators:

1. **Regular security audits**
   - Review audit logs weekly
   - Check for suspicious activities
   - Monitor failed login attempts

2. **User management**
   - Deactivate users who leave
   - Review user roles regularly
   - Never share admin credentials

3. **Data backup**
   - Regular Firestore backups
   - Test restore procedures
   - Keep backups secure

4. **Incident response**
   - Have a plan for security breaches
   - Know how to revoke access quickly
   - Document incidents in audit logs

---

## 📞 Security Incident Response

### If you suspect a security breach:

1. **Immediate Actions:**
   - Disable affected user accounts
   - Review audit logs for the timeframe
   - Check for unauthorized data access
   - Change admin passwords

2. **Investigation:**
   - Identify the scope of the breach
   - Determine what data was accessed
   - Find the entry point

3. **Remediation:**
   - Fix the vulnerability
   - Update security rules if needed
   - Notify affected users if required
   - Document the incident

4. **Prevention:**
   - Implement additional security measures
   - Update security documentation
   - Train users on security best practices

---

## 📚 Additional Resources

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/rules)
- [OWASP Top 10 Web Application Security Risks](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)

---

## 🔄 Security Updates

**Last Updated:** October 12, 2025

**Version:** 1.0.0 - Production Security Implementation

**Changes:**
- Implemented production-ready Firestore security rules
- Added comprehensive input validation and sanitization
- Implemented audit logging system
- Added rate limiting protection
- Enhanced middleware with security headers
- Created secure user creation API

---

## ✅ Current Security Status

| Component | Status | Notes |
|-----------|--------|-------|
| Firestore Rules | ✅ **SECURE** | Production-ready with RBAC |
| Storage Rules | ✅ **SECURE** | File validation and size limits |
| Database Rules | ✅ **SECURE** | School isolation implemented |
| Input Validation | ✅ **IMPLEMENTED** | Comprehensive validation |
| Rate Limiting | ✅ **IMPLEMENTED** | Client-side protection |
| Audit Logging | ✅ **IMPLEMENTED** | All sensitive operations logged |
| Security Headers | ⚠️ **READY** | Activate middleware.secure.ts |
| HTTPS | ⚠️ **PENDING** | Enable in production hosting |

---

**For questions or security concerns, contact: mdlavlusheikh220@gmail.com**
