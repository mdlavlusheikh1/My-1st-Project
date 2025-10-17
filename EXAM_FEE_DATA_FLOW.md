# Exam Fee Data Flow - Complete Guide

## 🔄 Data Flow Overview

```
/admin/exams/manage
    ↓ (creates exams)
Firebase: /exams/{examId}
    ↓ (reads exams)
/admin/exams/exam-fee-management
    ↓ (sets fees for each exam)
Firebase: /examSpecificFees/{schoolId}/fees/{examId}/{className}
    ↓ (reads exams + fees)
/admin/accounting/collect-exam-fee
    ↓ (displays in dialog)
"পরীক্ষা নির্বাচন করুন" dropdown with fees
```

## 📊 Firebase Data Structure

### 1. Exams Collection (`/exams/{examId}`)
```json
{
  "id": "exam123",
  "name": "প্রথম সাময়িক পরীক্ষা ২০২৫",
  "examType": "প্রথম সাময়িক",
  "schoolId": "IQRA-202531",
  "academicYear": "2025",
  "startDate": "2025-03-01",
  "endDate": "2025-03-15",
  "status": "upcoming",
  "createdAt": "2025-01-12T10:00:00Z"
}
```

### 2. Exam Fees Collection (`/examFees/{schoolId}`)
**Legacy structure for backward compatibility:**
```json
{
  "monthly": {
    "প্রথম": 150,
    "দ্বিতীয়": 150,
    "তৃতীয়": 200
  },
  "quarterly": {
    "প্রথম": 300,
    "দ্বিতীয়": 300
  },
  "annual": {
    "প্রথম": 500,
    "দ্বিতীয়": 500
  }
}
```

### 3. Exam-Specific Fees (`/examSpecificFees/{schoolId}`)
**New structure for individual exam fees:**
```json
{
  "fees": {
    "exam123": {
      "প্রথম": 300,
      "দ্বিতীয়": 300,
      "তৃতীয়": 350,
      "চতুর্থ": 350
    },
    "exam456": {
      "প্রথম": 500,
      "দ্বিতীয়": 500
    }
  },
  "lastUpdated": "2025-01-12T10:00:00Z"
}
```

## 🔧 Current Issues & Solutions

### Issue 1: Exams not showing in exam-fee-management
**Problem:** School ID mismatch
- Exams created with: `iqra-school-2025`
- Fee management looking for: `IQRA-202531`

**Solution:** Standardize school ID across all pages

### Issue 2: Fees not saving properly
**Problem:** Multiple fee structures causing confusion

**Solution:** Use exam-specific fees structure

### Issue 3: Fees not showing in collect-exam-fee dialog
**Problem:** Dialog not reading exam-specific fees

**Solution:** Update dialog to read from `/examSpecificFees/{schoolId}/fees/{examId}`

## ✅ Implementation Steps

### Step 1: Standardize School ID
Use `IQRA-202531` everywhere:
- `/admin/exams/manage`
- `/admin/exams/exam-fee-management`
- `/admin/accounting/collect-exam-fee`

### Step 2: Update Exam Creation
Ensure exams are created with correct schoolId:
```tsx
const examData = {
  name: examName,
  examType: examType,
  schoolId: 'IQRA-202531', // ✅ Standardized
  // ... other fields
};
```

### Step 3: Update Fee Management
Save fees in exam-specific structure:
```tsx
const examSpecificFeesRef = doc(db, 'examSpecificFees', 'IQRA-202531');
await setDoc(examSpecificFeesRef, {
  fees: {
    [examId]: {
      'প্রথম': 300,
      'দ্বিতীয়': 300,
      // ... other classes
    }
  }
}, { merge: true });
```

### Step 4: Update Collect Fee Dialog
Read both exam and fee data:
```tsx
// 1. Load exams
const exams = await examQueries.getAllExams('IQRA-202531');

// 2. Load exam-specific fees
const examFeesRef = doc(db, 'examSpecificFees', 'IQRA-202531');
const examFeesSnap = await getDoc(examFeesRef);
const examFees = examFeesSnap.data()?.fees || {};

// 3. Combine for display
const examsWithFees = exams.map(exam => ({
  ...exam,
  fees: examFees[exam.id] || {}
}));
```

## 📝 Code Changes Needed

### File 1: `/admin/exams/manage/page.tsx`
```tsx
// Ensure schoolId is IQRA-202531
const schoolId = 'IQRA-202531';
```

### File 2: `/admin/exams/exam-fee-management/page.tsx`
```tsx
// Change from
const schoolId = 'IQRA-202531';

// Ensure it loads exams with this ID
const exams = await examQueries.getAllExams('IQRA-202531');
```

### File 3: `/admin/accounting/collect-exam-fee/page.tsx`
```tsx
// Update loadExamFeesData function
const loadExamFeesData = async () => {
  const schoolId = 'IQRA-202531'; // ✅ Standardized
  
  // Load exams
  const exams = await examQueries.getAllExams(schoolId);
  
  // Load exam-specific fees
  const examFeesRef = doc(db, 'examSpecificFees', schoolId);
  const examFeesSnap = await getDoc(examFeesRef);
  const examFees = examFeesSnap.data()?.fees || {};
  
  setExistingExams(exams);
  setExamFeesData(examFees);
};
```

## 🎯 Expected Result

After implementation:

1. **Create Exam** in `/admin/exams/manage`
   - Exam saved to `/exams/{examId}` with `schoolId: "IQRA-202531"`

2. **Set Fees** in `/admin/exams/exam-fee-management`
   - Page loads exams from `/exams` where `schoolId === "IQRA-202531"`
   - Fees saved to `/examSpecificFees/IQRA-202531/fees/{examId}`

3. **Collect Fees** in `/admin/accounting/collect-exam-fee`
   - Dialog loads exams from `/exams` where `schoolId === "IQRA-202531"`
   - Dialog loads fees from `/examSpecificFees/IQRA-202531/fees`
   - Dropdown shows: "প্রথম সাময়িক পরীক্ষা ২০২৫"
   - মোট ফি shows: "৳300" (for প্রথম class)

## 🔍 Testing Checklist

- [ ] Create exam in `/admin/exams/manage`
- [ ] Verify exam appears in `/admin/exams/exam-fee-management`
- [ ] Set fees for each class in exam-fee-management
- [ ] Verify fees are saved to Firebase
- [ ] Open `/admin/accounting/collect-exam-fee`
- [ ] Click "ফি সংগ্রহ করুন" button for a student
- [ ] Verify exam appears in "পরীক্ষা নির্বাচন করুন" dropdown
- [ ] Verify "মোট ফি" shows correct amount based on student's class

## 🐛 Debugging Tips

### Check Firebase Console
1. Go to Firestore Database
2. Check `/exams` collection - verify schoolId
3. Check `/examSpecificFees/IQRA-202531` - verify fees structure
4. Check browser console for error messages

### Check Browser Console
Look for these log messages:
- `📋 Loaded existing exams from general query:`
- `✅ Loaded exam-specific fees from Firebase:`
- `🔍 Calculating fee for exam:`

### Common Issues
1. **No exams in dropdown** → Check schoolId matches
2. **No fees showing** → Check `/examSpecificFees` structure
3. **Wrong fee amount** → Check class name matches exactly

## 📞 Support

If issues persist:
1. Check browser console for errors
2. Check Firebase console for data structure
3. Verify schoolId is consistent across all pages
4. Check that exam IDs match between collections

---

**Next Step: Implement the school ID standardization across all three pages**
