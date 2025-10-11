// Simple script to create sample classes for testing
// Run with: node create-sample-classes.js

const { classQueries } = require('./src/lib/database-queries');

async function createSampleClasses() {
  try {
    console.log('🚀 Creating sample classes...');
    await classQueries.createSampleClasses();
    console.log('✅ Sample classes created successfully!');
    console.log('You should now see all 8 classes in the "নতুন ফি যোগ করুন" dialog box');
  } catch (error) {
    console.error('❌ Error creating sample classes:', error);
  }
}

createSampleClasses();
