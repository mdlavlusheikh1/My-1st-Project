# 🎯 Complete Exam Fee Solution

## Problem
The exam-fee-management page needs to:
1. Save exam records to Firestore `/exams` collection
2. Save fees to `/examSpecificFees/{schoolId}/fees/{examId}`
3. Display all exams with fees in collect-exam-fee dialog

## Solution

### Step 1: Create Exam Records
When setting fees in exam-fee-management, also create/update exam records.

### Step 2: Save Exam-Specific Fees
Link fees to specific exam IDs, not just exam types.

### Step 3: Load in Collect Fee Dialog
Read both exams and their associated fees.

---

## Implementation

### File 1: exam-fee-management/page.tsx

Add function to create/update exam records:

```tsx
const saveExamWithFees = async (examType: string, fees: {[className: string]: number}) => {
  const schoolId = 'IQRA-202531';
  
  // 1. Create or update exam record
  const examData = {
    name: getExamName(examType), // e.g., "প্রথম সাময়িক পরীক্ষা ২০২৫"
    examType: examType,
    schoolId: schoolId,
    academicYear: '2025',
    status: 'upcoming',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Save to /exams collection
  const examRef = doc(db, 'exams', `${schoolId}-${examType}-2025`);
  await setDoc(examRef, examData, { merge: true });
  
  const examId = examRef.id;
  
  // 2. Save fees linked to this exam ID
  const examFeesRef = doc(db, 'examSpecificFees', schoolId);
  await setDoc(examFeesRef, {
    fees: {
      [examId]: fees
    }
  }, { merge: true });
  
  console.log('✅ Saved exam and fees:', examId);
};
```

### File 2: collect-exam-fee/page.tsx

Load exams and fees properly:

```tsx
const loadExamsAndFees = async () => {
  const schoolId = 'IQRA-202531';
  
  // 1. Load all exams for this school
  const examsRef = collection(db, 'exams');
  const q = query(examsRef, where('schoolId', '==', schoolId));
  const examsSnap = await getDocs(q);
  
  const exams = examsSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  // 2. Load exam-specific fees
  const feesRef = doc(db, 'examSpecificFees', schoolId);
  const feesSnap = await getDoc(feesRef);
  const fees = feesSnap.data()?.fees || {};
  
  // 3. Combine exams with their fees
  const examsWithFees = exams.map(exam => ({
    ...exam,
    fees: fees[exam.id] || {}
  }));
  
  setExistingExams(examsWithFees);
  setExamFeesData(fees);
};
```

---

## Quick Fix

I'll update the exam-fee-management page to automatically create exam records when saving fees.
