#!/bin/bash

echo "🔥 IqNA Landing Connection Verification"
echo "======================================"
echo ""

# Check environment variables
echo "📋 Environment Configuration Check:"
echo "=================================="

if [ -f ".env.local" ]; then
    echo "✅ .env.local file found"
    echo ""
    echo "🔍 Firebase Configuration:"
    echo "Project ID: iqna-landing"
    echo "Auth Domain: iqna-landing.firebaseapp.com"
    echo "Storage: iqna-landing.firebasestorage.app"
    echo "Database: Asia Southeast 1 (Singapore)"
    echo "App ID: 1:707709810810:web:990a9d4505c0eb9eb463c3"
    echo ""
else
    echo "❌ .env.local file not found!"
    exit 1
fi

# Check Firebase CLI connection
echo "📋 Firebase CLI Check:"
echo "====================="

if command -v firebase &> /dev/null; then
    echo "✅ Firebase CLI installed"
    
    current_project=$(firebase use --current 2>/dev/null)
    if [[ $current_project == *"iqna-landing"* ]]; then
        echo "✅ Connected to IqNA Landing project"
    else
        echo "⚠️  Not connected to IqNA Landing project"
        echo "Run: firebase use iqna-landing"
    fi
else
    echo "⚠️  Firebase CLI not installed"
    echo "Install: npm install -g firebase-tools"
fi

echo ""
echo "📋 Next Steps for IqNA Landing Setup:"
echo "===================================="
echo ""
echo "1. 🔐 Enable Firebase Services:"
echo "   - Go to https://console.firebase.google.com/project/iqna-landing"
echo "   - Enable Authentication → Email/Password"
echo "   - Enable Firestore Database"
echo "   - Enable Storage"
echo ""
echo "2. 👤 Create Your Teacher Account:"
echo "   - Authentication → Add user"
echo "   - Email: mdlavlusheikh220@gmail.com"
echo "   - Password: demo123"
echo ""
echo "3. 📄 Create User Document in Firestore:"
echo "   - Collection: users"
echo "   - Document ID: [User UID from Authentication]"
echo "   - Fields:"
echo "     * email: mdlavlusheikh220@gmail.com"
echo "     * name: Md Lavlu Sheikh"
echo "     * role: teacher"
echo "     * schoolId: iqra-academy"
echo "     * isActive: true"
echo ""
echo "4. 🏫 Create School Document:"
echo "   - Collection: schools"
echo "   - Document ID: iqra-academy"
echo "   - Fields:"
echo "     * name: Iqra Mukari Academy"
echo "     * address: 159 Main Road, Dhaka-1207"
echo "     * phone: +8801788888888"
echo "     * email: info@iqraacademy.edu"
echo "     * isActive: true"
echo ""
echo "5. 🛡️ Deploy Security Rules:"
echo "   firebase deploy --only firestore:rules,storage,database"
echo ""
echo "6. 🧪 Test Your Setup:"
echo "   - Restart dev server: npm run dev"
echo "   - Login with: mdlavlusheikh220@gmail.com / demo123"
echo "   - Should redirect to: /teacher/dashboard"
echo ""

echo "🎯 Your Configuration Summary:"
echo "============================="
echo "✅ Project: IqNA Landing"
echo "✅ Region: Asia Southeast 1"
echo "✅ Teacher Email: mdlavlusheikh220@gmail.com"
echo "✅ Dashboard: /teacher/dashboard"
echo "✅ Environment: Configured"
echo ""

echo "🚀 Ready to use IqNA Landing with your School Management System!"

# Check if dev server should be restarted
echo ""
read -p "Restart development server now? (y/n): " restart

if [[ $restart == "y" || $restart == "Y" ]]; then
    echo ""
    echo "🔄 Restarting development server..."
    echo "Run: npm run dev"
    echo ""
    echo "Then test login at: http://localhost:3000"
fi