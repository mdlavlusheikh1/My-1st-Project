'use client';

import { useState, useCallback } from 'react';

interface AlertOptions {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  confirmText?: string;
  onConfirm?: () => void;
  showCancelButton?: boolean;
  cancelText?: string;
}

export const useAlert = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [alertOptions, setAlertOptions] = useState<AlertOptions>({
    message: '',
    type: 'info',
  });

  const showAlert = useCallback((options: AlertOptions) => {
    setAlertOptions(options);
    setIsOpen(true);
  }, []);

  const showSuccess = useCallback((message: string, title?: string) => {
    showAlert({
      message,
      title: title || 'সফল!',
      type: 'success',
    });
  }, [showAlert]);

  const showError = useCallback((message: string, title?: string) => {
    showAlert({
      message,
      title: title || 'ত্রুটি!',
      type: 'error',
    });
  }, [showAlert]);

  const showWarning = useCallback((message: string, title?: string) => {
    showAlert({
      message,
      title: title || 'সতর্কতা!',
      type: 'warning',
    });
  }, [showAlert]);

  const showInfo = useCallback((message: string, title?: string) => {
    showAlert({
      message,
      title: title || 'তথ্য',
      type: 'info',
    });
  }, [showAlert]);

  const showConfirm = useCallback((
    message: string,
    onConfirm: () => void,
    title?: string
  ) => {
    showAlert({
      message,
      title: title || 'নিশ্চিত করুন',
      type: 'warning',
      onConfirm,
      showCancelButton: true,
    });
  }, [showAlert]);

  const closeAlert = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    alertOptions,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    closeAlert,
  };
};
