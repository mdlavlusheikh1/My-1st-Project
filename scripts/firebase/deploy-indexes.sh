#!/bin/bash

# Deploy Firestore indexes for the School Management System
# Run this script after updating firestore.indexes.json

echo "🚀 Deploying Firestore indexes to Firebase..."
echo "Project: iqna-landing"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please login first:"
    echo "firebase login"
    exit 1
fi

# Set the project
echo "📋 Setting Firebase project to iqna-landing..."
firebase use iqna-landing

if [ $? -ne 0 ]; then
    echo "❌ Failed to set project. Make sure you have access to iqna-landing project."
    echo "Available projects:"
    firebase projects:list
    exit 1
fi

# Deploy indexes
echo ""
echo "📊 Deploying Firestore indexes..."
firebase deploy --only firestore:indexes

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Firestore indexes deployed successfully!"
    echo ""
    echo "📝 Indexes created for:"
    echo "   • users collection (with schoolId, createdAt, isActive, role filters)"
    echo "   • attendanceRecords collection"
    echo "   • students collection"
    echo "   • classes collection"
    echo "   • notifications collection"
    echo "   • attendanceSessions collection"
    echo ""
    echo "🔗 You can view the indexes in Firebase Console:"
    echo "   https://console.firebase.google.com/project/iqna-landing/firestore/indexes"
    echo ""
    echo "⚠️  Note: It may take a few minutes for indexes to be built."
else
    echo ""
    echo "❌ Failed to deploy indexes. Check the error above."
    echo ""
    echo "💡 Common issues:"
    echo "   • Make sure you have Editor/Owner permissions for the project"
    echo "   • Check if firestore.indexes.json syntax is valid"
    echo "   • Ensure you're connected to the internet"
fi