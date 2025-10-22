# Vercel Deployment Guide

## Prerequisites
1. Vercel account (sign up at vercel.com)
2. GitHub repository with your code
3. Environment variables configured

## Step 1: Environment Variables Setup

### Required Environment Variables for Vercel:

#### Firebase Configuration:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

#### Firebase Admin (Server-side):
```
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key_here
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
```

#### ImageKit Configuration:
```
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_public_key_here
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
IMAGEKIT_PRIVATE_KEY=your_private_key_here
```

## Step 2: Deployment Methods

### Method 1: Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables in project settings
5. Deploy

### Method 2: Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

## Step 3: Common Issues & Solutions

### Issue 1: Build Failures
- **Solution**: Check `next.config.ts` configuration
- **Solution**: Ensure all dependencies are in `package.json`

### Issue 2: Environment Variables Not Working
- **Solution**: Add variables in Vercel dashboard under Project Settings > Environment Variables
- **Solution**: Ensure variable names match exactly

### Issue 3: ImageKit Upload Issues
- **Solution**: Add ImageKit domain to `next.config.ts` images configuration
- **Solution**: Verify ImageKit credentials

### Issue 4: Firebase Connection Issues
- **Solution**: Check Firebase configuration
- **Solution**: Ensure Firebase project is properly set up

## Step 4: Post-Deployment

### 1. Test All Features
- [ ] Home page loads
- [ ] Admission form works
- [ ] Image upload works
- [ ] Admin login works
- [ ] Student approval works

### 2. Monitor Performance
- Check Vercel dashboard for build logs
- Monitor function execution
- Check for any errors

### 3. Domain Configuration
- Set up custom domain if needed
- Configure SSL certificates

## Troubleshooting

### Build Logs
Check Vercel dashboard > Functions tab for detailed error logs

### Common Error Messages:
- `Module not found`: Check import paths
- `Environment variable not defined`: Add to Vercel environment variables
- `Build timeout`: Optimize build process

### Support
- Vercel Documentation: https://vercel.com/docs
- Next.js Documentation: https://nextjs.org/docs
