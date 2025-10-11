const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// You'll need to replace this with your actual service account key
const serviceAccount = {
  "type": "service_account",
  "project_id": "iqna-landing",
  // Add your service account details here
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://iqna-landing-default-rtdb.asia-southeast1.firebasedatabase.app'
});

const auth = admin.auth();
const firestore = admin.firestore();

// Your teacher email from memory
const TEACHER_EMAIL = 'mdlavlusheikh220@gmail.com';

async function promoteToSuperAdmin() {
  try {
    console.log('🔍 Looking for user with email:', TEACHER_EMAIL);
    
    // Get user by email
    const userRecord = await auth.getUserByEmail(TEACHER_EMAIL);
    console.log('✅ Found user with UID:', userRecord.uid);
    
    // Update Firestore document to make them super admin
    console.log('📝 Promoting to super admin...');
    await firestore.collection('users').doc(userRecord.uid).update({
      role: 'super_admin',
      schoolId: 'all',
      schoolName: 'System Administrator',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('🎉 Successfully promoted to super admin!');
    console.log('=======================================');
    console.log('Email:', TEACHER_EMAIL);
    console.log('UID:', userRecord.uid);
    console.log('New Role: super_admin');
    console.log('\n✅ You can now login with super admin privileges!');
    
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log('❌ User not found with email:', TEACHER_EMAIL);
      console.log('💡 Please make sure the user exists in Firebase Authentication first.');
    } else {
      console.error('❌ Error promoting user:', error);
    }
  }
  
  process.exit(0);
}

// Run the function
promoteToSuperAdmin();