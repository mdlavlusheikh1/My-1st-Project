const admin = require('firebase-admin');

// Initialize Firebase Admin SDK with your project configuration
const serviceAccount = {
  "type": "service_account",
  "project_id": "iqna-landing",
  "private_key_id": "your-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@iqna-landing.iam.gserviceaccount.com",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://iqna-landing-default-rtdb.asia-southeast1.firebasedatabase.app'
});

const auth = admin.auth();
const firestore = admin.firestore();

// Super Admin Configuration
const SUPER_ADMIN_CONFIG = {
  email: 'superadmin@iqra.edu.bd',
  password: 'SuperAdmin123!',
  name: 'System Administrator',
  phone: '+880 1700000000'
};

async function createSuperAdmin() {
  try {
    console.log('🚀 Creating Super Admin User...');
    
    // Step 1: Create authentication user
    console.log('📧 Creating authentication user...');
    const userRecord = await auth.createUser({
      email: SUPER_ADMIN_CONFIG.email,
      password: SUPER_ADMIN_CONFIG.password,
      displayName: SUPER_ADMIN_CONFIG.name,
      emailVerified: true
    });

    console.log('✅ Authentication user created with UID:', userRecord.uid);

    // Step 2: Create Firestore document
    console.log('📝 Creating Firestore document...');
    const userData = {
      uid: userRecord.uid,
      name: SUPER_ADMIN_CONFIG.name,
      email: SUPER_ADMIN_CONFIG.email,
      phone: SUPER_ADMIN_CONFIG.phone,
      role: 'super_admin',
      schoolId: 'all',
      schoolName: 'System Administrator',
      address: 'System Admin Office',
      isActive: true,
      profileImage: '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await firestore.collection('users').doc(userRecord.uid).set(userData);

    console.log('✅ Firestore document created successfully!');
    
    console.log('\n🎉 Super Admin Created Successfully!');
    console.log('=======================================');
    console.log('UID:', userRecord.uid);
    console.log('Email:', SUPER_ADMIN_CONFIG.email);
    console.log('Password:', SUPER_ADMIN_CONFIG.password);
    console.log('Role: super_admin');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log('❌ User with this email already exists!');
      console.log('👤 Checking existing user...');
      
      try {
        const existingUser = await auth.getUserByEmail(SUPER_ADMIN_CONFIG.email);
        console.log('Found existing user with UID:', existingUser.uid);
        
        // Update the Firestore document to make them super admin
        await firestore.collection('users').doc(existingUser.uid).set({
          uid: existingUser.uid,
          name: SUPER_ADMIN_CONFIG.name,
          email: SUPER_ADMIN_CONFIG.email,
          phone: SUPER_ADMIN_CONFIG.phone,
          role: 'super_admin',
          schoolId: 'all',
          schoolName: 'System Administrator',
          address: 'System Admin Office',
          isActive: true,
          profileImage: '',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        console.log('✅ Updated existing user to super admin!');
      } catch (updateError) {
        console.error('❌ Error updating existing user:', updateError);
      }
    } else {
      console.error('❌ Error creating super admin:', error);
    }
  }
  
  process.exit(0);
}

// Run the function
createSuperAdmin();