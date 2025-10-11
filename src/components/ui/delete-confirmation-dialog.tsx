'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Modal from './modal';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'ডিলিট কনফার্মেশন',
  message = 'আপনি কি এই ক্লাসটি মুছে ফেলতে চান? এটি স্থায়ীভাবে মুছে যাবে।',
  itemName,
  isLoading = false,
  confirmText = 'ডিলিট করুন',
  cancelText = 'বাতিল করুন',
}) => {
  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const footer = (
    <div className="flex gap-3 justify-end">
      <button
        onClick={onClose}
        disabled={isLoading}
        className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {cancelText}
      </button>
      <button
        onClick={handleConfirm}
        disabled={isLoading}
        className="px-6 py-2.5 text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg font-medium transition-colors disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ডিলিট হচ্ছে...
          </>
        ) : (
          <>
            <AlertTriangle className="w-4 h-4" />
            {confirmText}
          </>
        )}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={!isLoading}
      closeOnOverlayClick={!isLoading}
      footer={footer}
      className="border-red-200"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {message}
          </p>
          {itemName && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-800">
                মুছে ফেলার জন্য নির্বাচিত আইটেম:
              </p>
              <p className="text-sm text-gray-700 font-semibold">
                "{itemName}"
              </p>
            </div>
          )}
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium">
              ⚠️ সতর্কতা: এই ক্রিয়াটি পূর্বাবস্থায় ফেরানো যাবে না।
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationDialog;
