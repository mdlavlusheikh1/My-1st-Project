#!/bin/bash

echo "🚀 Quick Connect to IqNA Landing"
echo "==============================="

# Check if Firebase CLI is available
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found!"
    echo "Install it: npm install -g firebase-tools"
    exit 1
fi

echo "🔍 Current Firebase project:"
current=$(firebase use --current 2>/dev/null)
if [[ $current == *"iqna-landing"* ]]; then
    echo "✅ Already connected to IqNA Landing!"
else
    echo "🔄 Switching to IqNA Landing..."
    firebase use iqna-landing 2>/dev/null || {
        echo "❌ IqNA Landing project not found in your Firebase projects."
        echo ""
        echo "📋 Available projects:"
        firebase projects:list
        echo ""
        echo "💡 To add IqNA Landing project:"
        echo "   firebase use --add"
        echo "   (Then select IqNA Landing from the list)"
        exit 1
    }
fi

echo ""
echo "📋 Next steps:"
echo "1. Update .env.local with IqNA Landing Firebase config"
echo "2. Run: ./connect-iqna-landing.sh"
echo "3. Create your teacher account in Firebase Console"
echo "4. Test login: mdlavlusheikh220@gmail.com"
echo ""
echo "📖 Full guide: IQNA_LANDING_SETUP.md"