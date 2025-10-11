#!/bin/bash

echo "🔗 Quick Setup: Firebase CLI for IqNA Landing"
echo "============================================="
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "📦 Installing Firebase CLI..."
    npm install -g firebase-tools
else
    echo "✅ Firebase CLI already installed"
fi

echo ""
echo "🔐 Firebase Login"
echo "================="

# Check if user is logged in
if firebase projects:list &> /dev/null 2>&1; then
    echo "✅ Already logged in to Firebase"
else
    echo "🔑 Logging in to Firebase..."
    firebase login
fi

echo ""
echo "🎯 Setting IqNA Landing as Active Project"
echo "========================================"

# Set the project
firebase use iqna-landing 2>/dev/null || {
    echo "⚠️  IqNA Landing not found in your projects"
    echo ""
    echo "📋 Available projects:"
    firebase projects:list
    echo ""
    echo "💡 To add IqNA Landing:"
    echo "1. Make sure you have access to the project"
    echo "2. Run: firebase use --add"
    echo "3. Select 'iqna-landing' from the list"
    exit 1
}

echo "✅ IqNA Landing is now the active project"
echo ""

echo "📋 Project Status:"
echo "=================="
echo "Project ID: iqna-landing"
echo "Auth Domain: iqna-landing.firebaseapp.com"
echo "Region: Asia Southeast 1"
echo ""

echo "🚀 Ready to deploy security rules!"
echo ""
read -p "Deploy security rules now? (y/n): " deploy

if [[ $deploy == "y" || $deploy == "Y" ]]; then
    echo ""
    echo "🛡️ Deploying Security Rules..."
    echo "============================"
    
    echo "Deploying Firestore rules..."
    firebase deploy --only firestore:rules
    
    echo ""
    echo "Deploying Storage rules..."
    firebase deploy --only storage
    
    echo ""
    echo "Deploying Realtime Database rules..."
    firebase deploy --only database
    
    echo ""
    echo "✅ All security rules deployed to IqNA Landing!"
else
    echo ""
    echo "⏭️  Security rules deployment skipped"
    echo "To deploy later, run:"
    echo "firebase deploy --only firestore:rules,storage,database"
fi

echo ""
echo "🎉 IqNA Landing Firebase setup complete!"
echo ""
echo "Next steps:"
echo "1. Create teacher account in Firebase Console"
echo "2. Set up Firestore user document"
echo "3. Test login: mdlavlusheikh220@gmail.com"