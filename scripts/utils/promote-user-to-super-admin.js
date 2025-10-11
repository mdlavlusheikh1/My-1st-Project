const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// Note: You'll need to set up your service account key
const serviceAccount = {
  "type": "service_account",
  "project_id": "iqna-landing",
  // Add your service account details here or use environment variables
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://iqna-landing-default-rtdb.asia-southeast1.firebasedatabase.app'
});

const firestore = admin.firestore();

// The UID you provided
const USER_UID = 'ndrZqsqNWmZ5Hq1fDVYvCNFQKs72';

async function promoteUserToSuperAdmin() {
  try {
    console.log('🔍 Checking user with UID:', USER_UID);
    
    // Get the current user document
    const userDoc = await firestore.collection('users').doc(USER_UID).get();
    
    if (!userDoc.exists) {
      console.log('❌ User document not found in Firestore');
      console.log('💡 Creating new super admin document...');
      
      // Create new super admin document
      await firestore.collection('users').doc(USER_UID).set({
        uid: USER_UID,
        name: 'Super Administrator',
        email: 'superadmin@iqra.edu.bd', // You can update this
        phone: '+880 1700000000',
        role: 'super_admin',
        schoolId: 'all',
        schoolName: 'System Administrator',
        address: 'Admin Office',
        isActive: true,
        profileImage: '',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ Created new super admin document!');
    } else {
      console.log('✅ Found existing user document');
      const userData = userDoc.data();
      console.log('Current role:', userData.role);
      console.log('Current email:', userData.email);
      
      // Update existing document to super admin
      await firestore.collection('users').doc(USER_UID).update({
        role: 'super_admin',
        schoolId: 'all',
        schoolName: 'System Administrator',
        isActive: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ Updated existing user to super admin!');
    }
    
    console.log('\n🎉 User Successfully Promoted to Super Admin!');
    console.log('===============================================');
    console.log('UID:', USER_UID);
    console.log('Role: super_admin');
    console.log('School Access: all');
    console.log('Status: active');
    
    console.log('\n📝 The user can now:');
    console.log('- Access /admin/users for user management');
    console.log('- View and manage all schools');
    console.log('- Approve/reject user registrations');
    console.log('- Access all super admin features');
    
  } catch (error) {
    console.error('❌ Error promoting user to super admin:', error);
  }
  
  process.exit(0);
}

// Run the function
promoteUserToSuperAdmin();