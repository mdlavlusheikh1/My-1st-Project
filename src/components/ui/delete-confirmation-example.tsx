'use client';

import React, { useState } from 'react';
import DeleteConfirmationDialog from './delete-confirmation-dialog';

/**
 * Example component showing how to use the DeleteConfirmationDialog
 * This is just for demonstration purposes
 */
const DeleteConfirmationExample: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = () => {
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Here you would make your actual delete API call
    console.log('Item deleted successfully');

    setIsDeleting(false);
    setIsDialogOpen(false);
  };

  const handleCancelDelete = () => {
    setIsDialogOpen(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Delete Confirmation Dialog Example</h1>

      <button
        onClick={handleDeleteClick}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Delete Class
      </button>

      <DeleteConfirmationDialog
        isOpen={isDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        itemName="Class 10 - Science A"
        title="ক্লাস ডিলিট করুন"
        message="আপনি কি এই ক্লাসটি মুছে ফেলতে চান? এটি স্থায়ীভাবে মুছে যাবে এবং এই ক্লাসের সকল ডেটা হারিয়ে যাবে।"
      />
    </div>
  );
};

export default DeleteConfirmationExample;
