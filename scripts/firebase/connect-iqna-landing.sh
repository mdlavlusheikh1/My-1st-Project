#!/bin/bash

echo "🔥 Connect to IqNA Landing Firebase Project"
echo "==========================================="
echo ""
echo "👤 Teacher Account: mdlavlusheikh220@gmail.com"
echo "🏫 School Management System → IqNA Landing Project"
echo ""

# Step 1: Firebase CLI Setup
echo "📋 STEP 1: Firebase CLI Setup"
echo "============================="
echo "1. Make sure Firebase CLI is installed:"
echo "   npm install -g firebase-tools"
echo ""
echo "2. Login to Firebase (if not already logged in):"
echo "   firebase login"
echo ""
echo "3. Connect to IqNA Landing project:"
echo "   firebase use --add"
echo "   (Select 'IqNA Landing' from the list)"
echo ""

# Step 2: Get Firebase Configuration
echo "📋 STEP 2: Get IqNA Landing Firebase Configuration"
echo "================================================"
echo "1. Go to Firebase Console: https://console.firebase.google.com/"
echo "2. Select 'IqNA Landing' project"
echo "3. Go to Project Settings (gear icon)"
echo "4. Scroll down to 'Your apps' section"
echo "5. If no web app exists:"
echo "   - Click 'Add app' → Web (</> icon)"
echo "   - App nickname: 'Iqra School Management'"
echo "   - Register app"
echo "6. Copy the Firebase config object"
echo ""

# Step 3: Enable Required Services
echo "📋 STEP 3: Enable Firebase Services in IqNA Landing"
echo "=================================================="
echo "In your IqNA Landing Firebase Console, enable:"
echo "✅ Authentication → Sign-in method → Email/Password"
echo "✅ Firestore Database → Create database"
echo "✅ Storage → Get started"
echo "✅ Hosting (optional)"
echo ""

# Step 4: Update Environment Variables
echo "📋 STEP 4: Update Environment Variables"
echo "======================================="
echo "Update your .env.local file with IqNA Landing configuration:"
echo ""
echo "Example format:"
echo "NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy..."
echo "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=iqna-landing.firebaseapp.com"
echo "NEXT_PUBLIC_FIREBASE_PROJECT_ID=iqna-landing"
echo "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=iqna-landing.appspot.com"
echo "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789"
echo "NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef"
echo ""

# Check if we should continue
read -p "Have you completed steps 1-4? (y/n): " completed

if [[ $completed == "y" || $completed == "Y" ]]; then
    echo ""
    echo "📋 STEP 5: Deploy Security Rules to IqNA Landing"
    echo "==============================================="
    
    if command -v firebase &> /dev/null; then
        echo "Current Firebase project:"
        firebase use --current
        echo ""
        
        read -p "Is this the IqNA Landing project? (y/n): " correct_project
        
        if [[ $correct_project == "y" || $correct_project == "Y" ]]; then
            echo ""
            echo "Deploying Firestore rules..."
            firebase deploy --only firestore:rules
            
            echo ""
            echo "Deploying Storage rules..."
            firebase deploy --only storage
            
            echo ""
            echo "✅ Security rules deployed to IqNA Landing!"
        else
            echo ""
            echo "❌ Please switch to IqNA Landing project first:"
            echo "firebase use iqna-landing"
            echo "Then run this script again."
            exit 1
        fi
    else
        echo "❌ Firebase CLI not found. Please install it first."
        exit 1
    fi
    
    echo ""
    echo "📋 STEP 6: Create Your Teacher Account in IqNA Landing"
    echo "===================================================="
    echo "Now create your teacher account in the IqNA Landing project:"
    echo ""
    echo "1. Go to Firebase Console → IqNA Landing → Authentication"
    echo "2. Click 'Add user'"
    echo "3. Email: mdlavlusheikh220@gmail.com"
    echo "4. Password: demo123 (or your preferred password)"
    echo "5. Copy the User UID"
    echo ""
    echo "6. Go to Firestore Database → Create collection 'users'"
    echo "7. Document ID: [paste the User UID]"
    echo "8. Add fields:"
    echo "   - email: mdlavlusheikh220@gmail.com"
    echo "   - name: Md Lavlu Sheikh"
    echo "   - role: teacher"
    echo "   - schoolId: iqra-academy"
    echo "   - isActive: true"
    echo "   - createdAt: [current timestamp]"
    echo "   - updatedAt: [current timestamp]"
    echo ""
    
    echo "📋 STEP 7: Create School Document"
    echo "================================"
    echo "Create a school document in Firestore:"
    echo "Collection: schools"
    echo "Document ID: iqra-academy"
    echo "Fields:"
    echo "   - name: Iqra Mukari Academy"
    echo "   - address: 159 Main Road, Dhaka-1207"
    echo "   - phone: +8801788888888"
    echo "   - email: info@iqraacademy.edu"
    echo "   - principalName: Principal Name"
    echo "   - establishedYear: 2018"
    echo "   - isActive: true"
    echo "   - createdAt: [current timestamp]"
    echo "   - updatedAt: [current timestamp]"
    echo ""
    
    echo "📋 STEP 8: Test the Connection"
    echo "============================="
    echo "1. Restart your development server:"
    echo "   npm run dev"
    echo ""
    echo "2. Test login with your teacher account:"
    echo "   Email: mdlavlusheikh220@gmail.com"
    echo "   Password: demo123"
    echo ""
    echo "3. Verify you're redirected to /teacher/dashboard"
    echo ""
    
    echo "🎉 Your Iqra School Management System is now connected to IqNA Landing!"
    echo "======================================================================="
    echo ""
    echo "✅ Project: IqNA Landing"
    echo "✅ Teacher Account: mdlavlusheikh220@gmail.com"
    echo "✅ Security Rules: Deployed"
    echo "✅ Ready to use!"
    
else
    echo ""
    echo "Please complete steps 1-4 first:"
    echo "1. Setup Firebase CLI and connect to IqNA Landing"
    echo "2. Enable required Firebase services"
    echo "3. Get Firebase configuration"
    echo "4. Update .env.local file"
    echo ""
    echo "Then run this script again."
fi

echo ""
echo "🔗 Quick Commands:"
echo "=================="
echo "Switch to IqNA Landing: firebase use iqna-landing"
echo "Check current project: firebase use --current"
echo "Deploy rules: firebase deploy --only firestore:rules,storage"
echo "Start dev server: npm run dev"