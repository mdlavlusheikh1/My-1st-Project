// Script to delete sample exam from Firebase
// Run this in browser console on your app page

const deleteExam = async () => {
  const examId = 'IQRA-202531-firstTerm-1760286756446';
  const schoolId = 'IQRA-202531';
  
  try {
    // Import Firebase
    const { doc, setDoc, deleteDoc, getDoc } = await import('firebase/firestore');
    const { db } = await import('./src/lib/firebase');
    
    console.log('🗑️ Deleting exam:', examId);
    
    // Method 1: Mark as deleted (soft delete)
    const examRef = doc(db, 'exams', examId);
    await setDoc(examRef, { 
      deleted: true, 
      deletedAt: new Date().toISOString() 
    }, { merge: true });
    console.log('✅ Exam marked as deleted');
    
    // Method 2: Remove from examSpecificFees
    const feesRef = doc(db, 'examSpecificFees', schoolId);
    const feesSnap = await getDoc(feesRef);
    
    if (feesSnap.exists()) {
      const data = feesSnap.data();
      if (data.fees && data.fees[examId]) {
        delete data.fees[examId];
        await setDoc(feesRef, data);
        console.log('✅ Exam fees removed');
      }
    }
    
    console.log('🎉 Sample exam deleted successfully!');
    console.log('Refresh the page to see changes.');
    
  } catch (error) {
    console.error('❌ Error deleting exam:', error);
  }
};

// Run the function
deleteExam();
