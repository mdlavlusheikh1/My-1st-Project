#!/bin/bash

# Add Super Admin Script for Firebase
# This script helps you add a super admin user to your Firebase project

echo "🔥 Adding Super Admin to Firebase Project: iqna-landing"
echo "=================================================="

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

echo "📋 Super Admin Information"
echo "--------------------------"
echo "Please provide the following information:"

read -p "Super Admin Email: " ADMIN_EMAIL
read -p "Super Admin Name: " ADMIN_NAME
read -p "Super Admin Phone: " ADMIN_PHONE
read -s -p "Super Admin Password: " ADMIN_PASSWORD
echo ""

echo ""
echo "🔍 Summary:"
echo "Email: $ADMIN_EMAIL"
echo "Name: $ADMIN_NAME"
echo "Phone: $ADMIN_PHONE"
echo ""

read -p "Do you want to proceed? (y/n): " CONFIRM

if [[ $CONFIRM != "y" && $CONFIRM != "Y" ]]; then
    echo "❌ Operation cancelled."
    exit 0
fi

echo ""
echo "🚀 Creating super admin user..."

# Create a temporary Node.js script to add the user
cat > temp_add_admin.js << EOF
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./iqna-landing-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://iqna-landing-default-rtdb.asia-southeast1.firebasedatabase.app'
});

const auth = admin.auth();
const firestore = admin.firestore();

async function createSuperAdmin() {
  try {
    // Create authentication user
    console.log('Creating authentication user...');
    const userRecord = await auth.createUser({
      email: '$ADMIN_EMAIL',
      password: '$ADMIN_PASSWORD',
      displayName: '$ADMIN_NAME',
      emailVerified: true
    });

    console.log('User created with UID:', userRecord.uid);

    // Create Firestore document
    console.log('Creating Firestore document...');
    await firestore.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      name: '$ADMIN_NAME',
      email: '$ADMIN_EMAIL',
      phone: '$ADMIN_PHONE',
      role: 'super_admin',
      schoolId: 'all',
      schoolName: 'System Administrator',
      address: 'Admin Office',
      isActive: true,
      profileImage: '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Super admin user created successfully!');
    console.log('UID:', userRecord.uid);
    console.log('Email:', userRecord.email);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    process.exit(1);
  }
}

createSuperAdmin();
EOF

# Run the script
node temp_add_admin.js

# Clean up
rm temp_add_admin.js

echo ""
echo "🎉 Super admin has been added successfully!"
echo "You can now login with:"
echo "Email: $ADMIN_EMAIL"
echo "Password: [The password you entered]"
echo ""
echo "⚠️  Important: Make sure to keep these credentials secure!"