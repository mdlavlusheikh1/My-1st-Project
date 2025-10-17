# Replace All Browser Alerts - Complete Guide

## ✅ Setup Complete

The global AlertProvider is now installed in your app. All pages can now use the custom alert dialogs.

## 🔄 How to Replace Alerts in Any File

### Step 1: Add Import
At the top of the file, add:
```tsx
import { useGlobalAlert } from '@/contexts/AlertContext';
```

### Step 2: Use the Hook
Inside your component function:
```tsx
function MyComponent() {
  const { showSuccess, showError, showWarning, showInfo } = useGlobalAlert();
  
  // Your code...
}
```

### Step 3: Replace alert() Calls

**Before:**
```tsx
alert('সফলভাবে সংরক্ষণ করা হয়েছে!');
```

**After:**
```tsx
showSuccess('সফলভাবে সংরক্ষণ করা হয়েছে!');
```

## 📋 Quick Reference

| Old Code | New Code | Type |
|----------|----------|------|
| `alert('Success message')` | `showSuccess('Success message')` | ✅ Success |
| `alert('Error message')` | `showError('Error message')` | ❌ Error |
| `alert('Warning message')` | `showWarning('Warning message')` | ⚠️ Warning |
| `alert('Info message')` | `showInfo('Info message')` | ℹ️ Info |

## 🎯 Files That Need Updates (98 alerts in 36 files)

### High Priority (Most alerts):
1. ✅ `src/app/admin/accounting/collect-exam-fee/page.tsx` - DONE
2. ⏳ `src/app/admin/exams/manage/page.tsx` - 8 alerts
3. ⏳ `src/app/admin/exams/page.tsx` - 8 alerts
4. ⏳ `src/app/admin/subjects/page.tsx` - 8 alerts
5. ⏳ `src/app/admin/users/page.tsx` - 7 alerts
6. ⏳ `src/app/admin/exams/save-marks/page.tsx` - 6 alerts
7. ⏳ `src/app/admin/inventory/edit/[id]/page.tsx` - 6 alerts
8. ⏳ `src/app/admin/inventory/view/[id]/page.tsx` - 5 alerts

### Medium Priority:
9. ⏳ `src/app/admin/exams/mark-entry/page.tsx` - 4 alerts
10. ⏳ `src/app/admin/exams/promotion/page.tsx` - 4 alerts
11. ⏳ `src/app/admin/students/page.tsx` - 4 alerts
12. ⏳ `src/app/admin/exams/exam-subjects/page.tsx` - 3 alerts
13. ⏳ `src/app/admin/students/import/page.tsx` - 3 alerts
14. ⏳ `src/app/admin/teachers/edit/page.tsx` - 3 alerts

### Lower Priority (1-2 alerts each):
- All other 22 files with 1-2 alerts each

## 🚀 Automated Replacement Pattern

For each file, follow this pattern:

### 1. Add Import (Top of file)
```tsx
import { useGlobalAlert } from '@/contexts/AlertContext';
```

### 2. Add Hook (Inside component)
```tsx
const { showSuccess, showError, showWarning, showInfo } = useGlobalAlert();
```

### 3. Replace Patterns

**Success Messages:**
```tsx
// Before
alert('সফলভাবে যোগ করা হয়েছে!');
alert('সফলভাবে সংরক্ষণ করা হয়েছে!');
alert('সফলভাবে মুছে ফেলা হয়েছে!');

// After
showSuccess('সফলভাবে যোগ করা হয়েছে!');
showSuccess('সফলভাবে সংরক্ষণ করা হয়েছে!');
showSuccess('সফলভাবে মুছে ফেলা হয়েছে!');
```

**Error Messages:**
```tsx
// Before
alert('ত্রুটি হয়েছে!');
alert('সংরক্ষণ করতে ব্যর্থ!');

// After
showError('ত্রুটি হয়েছে!');
showError('সংরক্ষণ করতে ব্যর্থ!');
```

**Warning/Validation Messages:**
```tsx
// Before
alert('অনুগ্রহ করে সকল তথ্য পূরণ করুন');
alert('অনুগ্রহ করে নির্বাচন করুন');

// After
showWarning('অনুগ্রহ করে সকল তথ্য পূরণ করুন');
showWarning('অনুগ্রহ করে নির্বাচন করুন');
```

## 🔍 How to Identify Alert Type

| Message Contains | Use |
|------------------|-----|
| সফলভাবে (successfully) | `showSuccess()` |
| ত্রুটি, ব্যর্থ (error, failed) | `showError()` |
| অনুগ্রহ করে (please), নির্বাচন (select) | `showWarning()` |
| Other informational | `showInfo()` |

## 📝 Example: Complete File Update

**Before:**
```tsx
'use client';
import { useState } from 'react';

function MyPage() {
  const [data, setData] = useState([]);
  
  const handleSave = () => {
    try {
      // Save logic
      alert('সফলভাবে সংরক্ষণ করা হয়েছে!');
    } catch (error) {
      alert('সংরক্ষণ করতে ব্যর্থ হয়েছে!');
    }
  };
  
  const handleDelete = () => {
    if (!selectedItem) {
      alert('অনুগ্রহ করে একটি আইটেম নির্বাচন করুন');
      return;
    }
    // Delete logic
    alert('সফলভাবে মুছে ফেলা হয়েছে!');
  };
  
  return <div>...</div>;
}
```

**After:**
```tsx
'use client';
import { useState } from 'react';
import { useGlobalAlert } from '@/contexts/AlertContext';

function MyPage() {
  const { showSuccess, showError, showWarning } = useGlobalAlert();
  const [data, setData] = useState([]);
  
  const handleSave = () => {
    try {
      // Save logic
      showSuccess('সফলভাবে সংরক্ষণ করা হয়েছে!');
    } catch (error) {
      showError('সংরক্ষণ করতে ব্যর্থ হয়েছে!');
    }
  };
  
  const handleDelete = () => {
    if (!selectedItem) {
      showWarning('অনুগ্রহ করে একটি আইটেম নির্বাচন করুন');
      return;
    }
    // Delete logic
    showSuccess('সফলভাবে মুছে ফেলা হয়েছে!');
  };
  
  return <div>...</div>;
}
```

## ⚡ Quick Commands

### Find all alerts in a file:
```bash
# Search for alert calls
grep -n "alert(" filename.tsx
```

### Count alerts in project:
```bash
# Count total alerts
grep -r "alert(" src/ | wc -l
```

## ✅ Verification Checklist

After updating each file:
- [ ] Import added: `import { useGlobalAlert } from '@/contexts/AlertContext';`
- [ ] Hook declared: `const { showSuccess, showError, showWarning } = useGlobalAlert();`
- [ ] All `alert()` calls replaced
- [ ] Correct type used (success/error/warning/info)
- [ ] File saved and tested

## 🎯 Priority Order

Update files in this order for maximum impact:

1. **Phase 1** - Exam & Fee Management (Most visible)
   - collect-exam-fee (✅ DONE)
   - exams/manage
   - exams/save-marks
   - subjects

2. **Phase 2** - User Management
   - users
   - students
   - teachers

3. **Phase 3** - Inventory & Accounting
   - inventory files
   - accounting files

4. **Phase 4** - Remaining files
   - All other files with 1-2 alerts

## 🔧 Troubleshooting

### Error: "useGlobalAlert must be used within an AlertProvider"
**Solution:** The AlertProvider is already added to layout.tsx. Restart your dev server.

### Alert not showing
**Solution:** Check browser console for errors. Make sure the import path is correct.

### Wrong alert type showing
**Solution:** Use the correct method:
- Success → `showSuccess()`
- Error → `showError()`
- Warning → `showWarning()`
- Info → `showInfo()`

## 📊 Progress Tracking

Total: 98 alerts in 36 files
- ✅ Completed: 1 file (collect-exam-fee)
- ⏳ Remaining: 35 files
- 📈 Progress: 3%

## 🎉 Benefits

After completing all replacements:
- ✅ Consistent, professional design across entire app
- ✅ Centered dialogs with blur backdrop
- ✅ Smooth animations
- ✅ Color-coded by type
- ✅ Bengali text support
- ✅ Better UX

---

**Start with the high-priority files and work your way down!**
