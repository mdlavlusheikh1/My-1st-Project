# Dialog & Alert Usage Guide

## 🎨 Consistent Dialog Design

All dialogs and alerts now have a unified, professional design with:
- ✅ Centered on screen
- ✅ Blurred background showing page content
- ✅ Smooth animations
- ✅ Consistent styling
- ✅ Responsive design

---

## 📦 Available Components

### 1. AlertDialog - For Simple Alerts & Confirmations

**Location:** `src/components/ui/alert-dialog.tsx`

**Features:**
- Success, Error, Warning, Info types
- Auto-centered
- Blurred backdrop
- Smooth animations
- Bengali text support

### 2. Modal - For Complex Content

**Location:** `src/components/ui/modal.tsx`

**Features:**
- Multiple sizes (sm, md, lg, xl, 2xl, full)
- Custom header/footer
- Scrollable content
- Blurred backdrop

### 3. DeleteConfirmationDialog - For Delete Actions

**Location:** `src/components/ui/delete-confirmation-dialog.tsx`

**Features:**
- Pre-styled for delete actions
- Warning icon
- Confirmation required

---

## 🚀 Usage Examples

### Example 1: Simple Success Alert

Replace browser `alert()` with:

```tsx
import { useState } from 'react';
import AlertDialog from '@/components/ui/alert-dialog';

function MyComponent() {
  const [showAlert, setShowAlert] = useState(false);

  const handleSuccess = () => {
    setShowAlert(true);
  };

  return (
    <>
      <button onClick={handleSuccess}>
        Save
      </button>

      <AlertDialog
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        type="success"
        title="সফল!"
        message="সফলভাবে পরীক্ষার ফি সংগ্রহ করা হয়েছে!"
      />
    </>
  );
}
```

### Example 2: Error Alert

```tsx
<AlertDialog
  isOpen={showError}
  onClose={() => setShowError(false)}
  type="error"
  title="ত্রুটি!"
  message="ডেটা লোড করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।"
/>
```

### Example 3: Confirmation Dialog

```tsx
<AlertDialog
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  type="warning"
  title="নিশ্চিত করুন"
  message="আপনি কি এই ক্রিয়াটি সম্পাদন করতে চান?"
  showCancelButton={true}
  confirmText="হ্যাঁ, নিশ্চিত"
  cancelText="না, বাতিল করুন"
  onConfirm={() => {
    // Your action here
    console.log('Confirmed!');
    setShowConfirm(false);
  }}
/>
```

### Example 4: Using the Hook (Easier!)

```tsx
import { useAlert } from '@/hooks/useAlert';
import AlertDialog from '@/components/ui/alert-dialog';

function MyComponent() {
  const { 
    isOpen, 
    alertOptions, 
    showSuccess, 
    showError, 
    showConfirm,
    closeAlert 
  } = useAlert();

  const handleSave = async () => {
    try {
      // Your save logic
      await saveData();
      showSuccess('সফলভাবে সংরক্ষণ করা হয়েছে!');
    } catch (error) {
      showError('সংরক্ষণ করতে ব্যর্থ হয়েছে!');
    }
  };

  const handleDelete = () => {
    showConfirm(
      'আপনি কি এই আইটেমটি মুছে ফেলতে চান?',
      () => {
        // Delete logic
        deleteItem();
      }
    );
  };

  return (
    <>
      <button onClick={handleSave}>Save</button>
      <button onClick={handleDelete}>Delete</button>

      <AlertDialog
        isOpen={isOpen}
        onClose={closeAlert}
        {...alertOptions}
      />
    </>
  );
}
```

### Example 5: Complex Modal with Form

```tsx
import Modal from '@/components/ui/modal';

function MyComponent() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button onClick={() => setShowModal(true)}>
        Open Form
      </button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="নতুন শিক্ষার্থী যোগ করুন"
        subtitle="শিক্ষার্থীর তথ্য প্রদান করুন"
        size="lg"
        footer={
          <>
            <button onClick={() => setShowModal(false)}>
              বাতিল
            </button>
            <button onClick={handleSubmit}>
              সংরক্ষণ করুন
            </button>
          </>
        }
      >
        {/* Your form content */}
        <form>
          <input type="text" placeholder="নাম" />
          <input type="text" placeholder="রোল নম্বর" />
          {/* More fields */}
        </form>
      </Modal>
    </>
  );
}
```

---

## 🎨 Alert Types

### Success (type="success")
- ✅ Green color scheme
- ✅ CheckCircle icon
- ✅ Use for: Successful operations, confirmations

### Error (type="error")
- ❌ Red color scheme
- ❌ XCircle icon
- ❌ Use for: Errors, failures, critical issues

### Warning (type="warning")
- ⚠️ Yellow color scheme
- ⚠️ AlertCircle icon
- ⚠️ Use for: Confirmations, important notices

### Info (type="info")
- ℹ️ Blue color scheme
- ℹ️ Info icon
- ℹ️ Use for: General information, tips

---

## 📏 Modal Sizes

```tsx
<Modal size="sm">    {/* 28rem / 448px */}
<Modal size="md">    {/* 32rem / 512px - Default */}
<Modal size="lg">    {/* 42rem / 672px */}
<Modal size="xl">    {/* 56rem / 896px */}
<Modal size="2xl">   {/* 72rem / 1152px */}
<Modal size="full">  {/* Full width with margin */}
```

---

## 🔄 Migration Guide

### Replace Browser Alerts

**Before:**
```tsx
alert('সফলভাবে পরীক্ষার ফি সংগ্রহ করা হয়েছে!');
```

**After:**
```tsx
showSuccess('সফলভাবে পরীক্ষার ফি সংগ্রহ করা হয়েছে!');
```

### Replace Browser Confirm

**Before:**
```tsx
if (confirm('আপনি কি মুছে ফেলতে চান?')) {
  deleteItem();
}
```

**After:**
```tsx
showConfirm('আপনি কি মুছে ফেলতে চান?', () => {
  deleteItem();
});
```

### Replace Custom Dialogs

**Before:**
```tsx
{showDialog && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6">
      {/* Content */}
    </div>
  </div>
)}
```

**After:**
```tsx
<Modal
  isOpen={showDialog}
  onClose={() => setShowDialog(false)}
  title="Your Title"
>
  {/* Content */}
</Modal>
```

---

## 🎯 Best Practices

### 1. Use Appropriate Types
- ✅ Success for completed actions
- ❌ Error for failures
- ⚠️ Warning for confirmations
- ℹ️ Info for general messages

### 2. Keep Messages Clear
```tsx
// ✅ Good
showSuccess('ফি সফলভাবে সংগ্রহ করা হয়েছে!');

// ❌ Avoid
showSuccess('Done');
```

### 3. Use Bengali Text
```tsx
// ✅ Good
confirmText="হ্যাঁ, নিশ্চিত"
cancelText="না, বাতিল করুন"

// ❌ Avoid mixing unnecessarily
confirmText="Yes"
cancelText="বাতিল"
```

### 4. Handle Loading States
```tsx
const [isLoading, setIsLoading] = useState(false);

const handleSave = async () => {
  setIsLoading(true);
  try {
    await saveData();
    showSuccess('সংরক্ষণ সফল!');
  } catch (error) {
    showError('সংরক্ষণ ব্যর্থ!');
  } finally {
    setIsLoading(false);
  }
};
```

---

## 🎨 Customization

### Custom Colors
Edit `src/components/ui/alert-dialog.tsx`:

```tsx
const getColors = () => {
  switch (type) {
    case 'success':
      return {
        button: 'bg-green-600 hover:bg-green-700', // Change here
      };
  }
};
```

### Custom Animations
Edit `src/app/globals.css`:

```css
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95); /* Adjust scale */
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

---

## ✅ Updated Files

All these files now have consistent dialog design:

1. ✅ `src/components/ui/alert-dialog.tsx` - New alert component
2. ✅ `src/components/ui/modal.tsx` - Updated with blur & animations
3. ✅ `src/components/ui/delete-confirmation-dialog.tsx` - Uses Modal
4. ✅ `src/hooks/useAlert.tsx` - Easy-to-use hook
5. ✅ `src/app/globals.css` - Animations & global styles
6. ✅ `src/app/admin/accounting/collect-exam-fee/page.tsx` - Updated dialogs

---

## 🚀 Quick Start

1. **Import the hook:**
```tsx
import { useAlert } from '@/hooks/useAlert';
import AlertDialog from '@/components/ui/alert-dialog';
```

2. **Use in component:**
```tsx
const { isOpen, alertOptions, showSuccess, closeAlert } = useAlert();
```

3. **Add AlertDialog:**
```tsx
<AlertDialog
  isOpen={isOpen}
  onClose={closeAlert}
  {...alertOptions}
/>
```

4. **Show alerts:**
```tsx
showSuccess('Success message!');
showError('Error message!');
showWarning('Warning message!');
```

---

## 📞 Support

For questions or customization help, refer to:
- Component files in `src/components/ui/`
- Hook file in `src/hooks/useAlert.tsx`
- Global styles in `src/app/globals.css`

---

**All dialogs are now centered, beautifully designed, and consistent! 🎉**
