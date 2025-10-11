#!/bin/bash

echo "🔥 Firebase Account Change Guide for Iqra School Management"
echo "=========================================================="
echo ""

echo "👤 Current Teacher Account: mdlavlusheikh220@gmail.com"
echo "🎯 This script will help you change Firebase accounts while preserving your setup"
echo ""

# Step 1: Backup current setup
echo "📋 STEP 1: Backup Current Setup"
echo "================================"
echo "Before changing accounts, let's backup important information:"
echo ""
echo "Current Firebase CLI status:"
firebase use --current 2>/dev/null || echo "No Firebase project currently set"
echo ""

# Step 2: Change Firebase account
echo "📋 STEP 2: Change Firebase Account"
echo "=================================="
echo "To change to a different Google account:"
echo ""
echo "1. Logout from current Firebase account:"
echo "   firebase logout"
echo ""
echo "2. Login with your new Google account:"
echo "   firebase login"
echo ""
echo "3. This will open a browser window for authentication"
echo ""

# Step 3: Create or select new project
echo "📋 STEP 3: Create/Select New Firebase Project"
echo "============================================"
echo "Option A - Create New Project:"
echo "1. Go to https://console.firebase.google.com/"
echo "2. Click 'Create a project'"
echo "3. Name it (e.g., 'iqra-school-management')"
echo "4. Enable Google Analytics (optional)"
echo ""
echo "Option B - Use Existing Project:"
echo "1. List available projects: firebase projects:list"
echo "2. Select project: firebase use <project-id>"
echo ""

# Step 4: Get Firebase config
echo "📋 STEP 4: Get Firebase Configuration"
echo "===================================="
echo "1. Go to Firebase Console → Project Settings"
echo "2. Scroll down to 'Your apps' section"
echo "3. Click 'Add app' → Web (</> icon)"
echo "4. Register app with name: 'Iqra School Management Web'"
echo "5. Copy the config object"
echo ""

# Step 5: Enable services
echo "📋 STEP 5: Enable Required Firebase Services"
echo "============================================"
echo "In your Firebase Console, enable:"
echo "✅ Authentication → Sign-in method → Email/Password"
echo "✅ Firestore Database → Create database (start in test mode)"
echo "✅ Storage → Get started"
echo "✅ Hosting (optional)"
echo ""

echo "⚠️  IMPORTANT: After completing the above steps, update your .env.local file"
echo "   and run this script again to continue with data setup."
echo ""

read -p "Have you completed steps 1-5? (y/n): " completed

if [[ $completed == "y" || $completed == "Y" ]]; then
    echo ""
    echo "📋 STEP 6: Deploy Security Rules"
    echo "==============================="
    echo "Deploying Firebase security rules..."
    
    if command -v firebase &> /dev/null; then
        echo "Deploying Firestore rules..."
        firebase deploy --only firestore:rules
        
        echo "Deploying Storage rules..."
        firebase deploy --only storage
        
        echo "✅ Security rules deployed!"
    else
        echo "❌ Firebase CLI not found. Please install it:"
        echo "npm install -g firebase-tools"
    fi
    
    echo ""
    echo "📋 STEP 7: Create Teacher Account Data"
    echo "====================================="
    echo "Important: You need to manually create your teacher account in the new Firebase project:"
    echo ""
    echo "1. Go to Authentication → Users → Add user"
    echo "2. Email: mdlavlusheikh220@gmail.com"
    echo "3. Set a password (use the same as your demo accounts for consistency)"
    echo ""
    echo "4. Then create a user document in Firestore:"
    echo "   Collection: users"
    echo "   Document ID: [the UID from Authentication]"
    echo "   Data:"
    echo "   {"
    echo "     \"email\": \"mdlavlusheikh220@gmail.com\","
    echo "     \"name\": \"Your Name\","
    echo "     \"role\": \"teacher\","
    echo "     \"schoolId\": \"your-school-id\","
    echo "     \"isActive\": true,"
    echo "     \"createdAt\": [current timestamp],"
    echo "     \"updatedAt\": [current timestamp]"
    echo "   }"
    echo ""
    
    echo "📋 STEP 8: Test the Application"
    echo "=============================="
    echo "1. Restart your development server: npm run dev"
    echo "2. Test login with your teacher account"
    echo "3. Verify role-based routing works"
    echo "4. Check that you can access teacher dashboard"
    echo ""
    
    echo "🎉 Firebase account change completed!"
    echo "Your teacher account (mdlavlusheikh220@gmail.com) should now work with the new Firebase project."
    
else
    echo ""
    echo "Please complete steps 1-5 first, then run this script again."
fi

echo ""
echo "🔗 Quick Reference Commands:"
echo "============================"
echo "Check current project: firebase use --current"
echo "List projects: firebase projects:list"
echo "Switch project: firebase use <project-id>"
echo "Deploy rules: firebase deploy --only firestore:rules,storage"
echo "Start dev server: npm run dev"