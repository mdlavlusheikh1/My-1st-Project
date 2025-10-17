'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import AlertDialog from '@/components/ui/alert-dialog';

interface AlertOptions {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  confirmText?: string;
  onConfirm?: () => void;
  showCancelButton?: boolean;
  cancelText?: string;
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  showConfirm: (message: string, onConfirm: () => void, title?: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  return (
    <AlertContext.Provider
      value={{
        showAlert,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showConfirm,
      }}
    >
      {children}
      <AlertDialog
        isOpen={isOpen}
        onClose={closeAlert}
        {...alertOptions}
      />
    </AlertContext.Provider>
  );
};

export const useGlobalAlert = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useGlobalAlert must be used within an AlertProvider');
  }
  return context;
};
