#!/bin/bash

# Firebase Rules Deployment Script
# This script deploys all Firebase security rules to your project

echo "🔥 Firebase Rules Deployment Script"
echo "===================================="

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed."
    echo "Please install it by running: npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ You are not logged in to Firebase."
    echo "Please run: firebase login"
    exit 1
fi

echo "🔍 Checking current Firebase project..."
PROJECT_ID=$(firebase use --current 2>/dev/null | grep "Active project" | cut -d' ' -f3)

if [ -z "$PROJECT_ID" ]; then
    echo "❌ No Firebase project is currently active."
    echo "Please run: firebase use <your-project-id>"
    exit 1
fi

echo "📋 Current project: $PROJECT_ID"
echo ""

# Deploy Firestore rules
echo "📝 Deploying Firestore rules..."
if firebase deploy --only firestore:rules; then
    echo "✅ Firestore rules deployed successfully!"
else
    echo "❌ Failed to deploy Firestore rules"
    exit 1
fi

echo ""

# Deploy Storage rules
echo "📁 Deploying Storage rules..."
if firebase deploy --only storage; then
    echo "✅ Storage rules deployed successfully!"
else
    echo "❌ Failed to deploy Storage rules"
    exit 1
fi

echo ""

# Deploy Realtime Database rules (if you're using it)
echo "🔄 Deploying Realtime Database rules..."
if firebase deploy --only database; then
    echo "✅ Realtime Database rules deployed successfully!"
else
    echo "⚠️  Realtime Database rules deployment failed (this is okay if you're not using Realtime Database)"
fi

echo ""
echo "🎉 All Firebase rules have been deployed successfully!"
echo "Your school management system is now secured with proper access controls."

# Display security summary
echo ""
echo "📊 Security Rules Summary:"
echo "=========================="
echo "🏫 Super Admin: Full access to all schools and data"
echo "🔧 School Admin: Full access to their school's data"
echo "👩‍🏫 Teacher: Read/write access to their school's students, classes, and attendance"
echo "👨‍🎓 Student: Read-only access to their own profile and attendance"
echo "🔒 All users must be authenticated and active"
echo "📱 File uploads are restricted by type and size"
echo ""
echo "⚠️  Important: Make sure to test these rules thoroughly in your development environment!"