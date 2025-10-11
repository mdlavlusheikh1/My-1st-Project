'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { QRUtils } from '@/lib/qr-utils';

interface QRScannerProps {
  onScanSuccess: (qrData: string, parsedData: any) => void;
  onScanError?: (error: string) => void;
  width?: number;
  height?: number;
  fps?: number;
  qrbox?: number;
  aspectRatio?: number;
  disableFlip?: boolean;
  verbose?: boolean;
}

interface ScanResult {
  decodedText: string;
  result: any;
}

export const QRScanner: React.FC<QRScannerProps> = ({
  onScanSuccess,
  onScanError,
  width = 600,
  height = 400,
  fps = 10,
  qrbox = 250,
  aspectRatio = 1.0,
  disableFlip = false,
  verbose = false
}) => {
  const qrCodeScannerRef = useRef<Html5Qrcode | null>(null);
  const qrCodeRegionId = useRef(`qr-reader-${Math.random().toString(36).substr(2, 9)}`);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // Cleanup function
  const cleanup = useCallback(async () => {
    try {
      if (qrCodeScannerRef.current && isScanning) {
        console.log('Cleaning up QR scanner...');
        await qrCodeScannerRef.current.stop();
        qrCodeScannerRef.current.clear();
        qrCodeScannerRef.current = null;
        setIsScanning(false);
      }
    } catch (err) {
      console.error('Error during cleanup:', err);
      // Don't throw error during cleanup
    }
  }, [isScanning]);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        if (!mounted) return;

        await getCameras();
        if (mounted) {
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Error initializing scanner:', error);
      }
    };

    initialize();

    return () => {
      mounted = false;
      cleanup();
    };
  }, [cleanup]);

  // Separate effect for auto-start to prevent dependency issues
  useEffect(() => {
    if (selectedCamera && isInitialized && !isScanning && !error && !isStarting) {
      const timer = setTimeout(() => {
        startScanning();
      }, 500); // Small delay to prevent rapid re-renders

      return () => clearTimeout(timer);
    }
  }, [selectedCamera, isInitialized, isScanning, error, isStarting]);

  const getCameras = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      setCameras(devices);
      if (devices.length > 0) {
        // Prefer back camera if available
        const backCamera = devices.find((device: any) =>
          device.label.toLowerCase().includes('back') ||
          device.label.toLowerCase().includes('environment')
        );
        setSelectedCamera(backCamera ? backCamera.id : devices[0].id);
      }
    } catch (err) {
      const errorMessage = 'ক্যামেরা অ্যাক্সেস করতে সমস্যা হয়েছে। অনুগ্রহ করে ক্যামেরা অনুমতি দিন এবং পেজ রিফ্রেশ করুন।';
      setError(errorMessage);
      onScanError?.(errorMessage);
    }
  };

  const startScanning = async (cameraId?: string) => {
    if (isStarting || isScanning) {
      console.log('Scan already in progress, skipping...');
      return;
    }

    try {
      setIsStarting(true);
      setError(null);

      // Clean up existing scanner first
      if (qrCodeScannerRef.current) {
        await cleanup();
      }

      // Check if the DOM element exists
      const element = document.getElementById(qrCodeRegionId.current);
      if (!element) {
        throw new Error('QR scanner element not found in DOM');
      }

      const scanner = new Html5Qrcode(qrCodeRegionId.current);
      qrCodeScannerRef.current = scanner;

      const config = {
        fps,
        qrbox: { width: qrbox, height: qrbox },
        aspectRatio,
        disableFlip,
        verbose,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: false
        },
        supportedScanTypes: ['qr_code'],
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        defaultZoomValueIfSupported: 2
      };

      const cameraToUse = cameraId || selectedCamera;

      if (!cameraToUse) {
        throw new Error('No camera selected');
      }

      console.log('Starting QR scanner with camera:', cameraToUse);

      await scanner.start(
        cameraToUse,
        config,
        (decodedText: string, result: any) => {
          console.log('QR code scanned successfully:', decodedText);
          handleScanSuccess({ decodedText, result });
        },
        (errorMessage: string) => {
          // Only log significant errors, not every frame
          if (verbose && errorMessage.includes('NotFoundException')) {
            console.log('QR scan error:', errorMessage);
          }
        }
      );

      setIsScanning(true);
      setIsStarting(false);
      console.log('QR scanner started successfully');
    } catch (err) {
      setIsStarting(false);
      const errorMsg = err instanceof Error ? err.message : 'Failed to start scanning';
      console.error('Error starting scanner:', errorMsg);
      setError(errorMsg);
      onScanError?.(errorMsg);

      // Provide more specific error messages in Bengali
      if (errorMsg.includes('NotAllowedError') || errorMsg.includes('Permission denied')) {
        setError('ক্যামেরা অনুমতি অস্বীকৃত। অনুগ্রহ করে ক্যামেরা অ্যাক্সেসের অনুমতি দিন এবং পেজ রিফ্রেশ করুন।');
      } else if (errorMsg.includes('NotFoundError') || errorMsg.includes('No devices found')) {
        setError('কোনো ক্যামেরা পাওয়া যায়নি। অনুগ্রহ করে ক্যামেরা কানেক্ট করুন এবং আবার চেষ্টা করুন।');
      } else if (errorMsg.includes('NotReadableError') || errorMsg.includes('already in use')) {
        setError('ক্যামেরা অন্য অ্যাপ্লিকেশন দ্বারা ব্যবহৃত হচ্ছে। অন্য অ্যাপ্লিকেশন বন্ধ করুন।');
      } else if (errorMsg.includes('not found in DOM')) {
        setError('স্ক্যানার এলিমেন্ট পাওয়া যায়নি। অনুগ্রহ করে পেজ রিফ্রেশ করুন।');
      } else {
        setError('ক্যামেরা শুরু করতে সমস্যা হয়েছে। অনুগ্রহ করে পেজ রিফ্রেশ করুন।');
      }
    }
  };

  const stopScanning = async () => {
    try {
      if (qrCodeScannerRef.current && isScanning) {
        console.log('Stopping QR scanner...');
        await qrCodeScannerRef.current.stop();
        qrCodeScannerRef.current.clear();
        qrCodeScannerRef.current = null;
        setIsScanning(false);
        console.log('QR scanner stopped successfully');
      }
    } catch (err) {
      console.error('Error stopping scanner:', err);
      // Force cleanup even if stop fails
      qrCodeScannerRef.current = null;
      setIsScanning(false);
    }
  };

  const handleScanSuccess = (result: ScanResult) => {
    const { decodedText } = result;

    console.log('Raw QR scan result:', decodedText);
    console.log('Full result object:', result);

    // Parse the QR data to determine its type
    const studentData = QRUtils.parseQRData(decodedText);
    const sessionData = QRUtils.parseSessionQRData(decodedText);

    console.log('Parsed student data:', studentData);
    console.log('Parsed session data:', sessionData);

    let parsedData = null;

    if (studentData) {
      parsedData = {
        type: 'student',
        data: studentData
      };
      console.log('✅ Detected student QR code:', studentData);
    } else if (sessionData) {
      parsedData = {
        type: 'session',
        data: sessionData
      };
      console.log('✅ Detected session QR code:', sessionData);
    } else {
      // Try to parse as JSON even if it doesn't match our expected format
      try {
        const jsonData = JSON.parse(decodedText);
        parsedData = {
          type: 'json',
          data: jsonData
        };
        console.log('✅ Detected JSON QR code:', jsonData);
      } catch (parseError) {
        parsedData = {
          type: 'unknown',
          data: decodedText
        };
        console.log('❌ Detected unknown QR code format:', decodedText);
        console.log('Parse error:', parseError);
      }
    }

    // Show immediate feedback for any scan
    if (parsedData && parsedData.type !== 'unknown') {
      console.log('✅ Valid QR code detected, calling onScanSuccess');
    } else {
      console.log('❌ Invalid QR code format detected');
    }

    onScanSuccess(decodedText, parsedData);
  };

  const switchCamera = async (cameraId: string) => {
    setSelectedCamera(cameraId);
    if (isScanning) {
      await stopScanning();
      await startScanning(cameraId);
    }
  };

  return (
    <div className="qr-scanner-container" key={qrCodeRegionId.current}>
      <div className="mb-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Camera Selection */}
        {cameras.length > 1 && (
          <select
            value={selectedCamera}
            onChange={(e) => switchCamera(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {cameras.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.label || `Camera ${camera.id}`}
              </option>
            ))}
          </select>
        )}

        {/* Scan Controls */}
        <div className="flex gap-2">
          {!isScanning ? (
            <button
              onClick={() => startScanning()}
              disabled={!selectedCamera || isStarting}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isStarting ? 'Starting...' : 'Start Scanning'}
            </button>
          ) : (
            <button
              onClick={stopScanning}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Stop Scanning
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
          {error.includes('permission') && (
            <div className="mt-2">
              <button
                onClick={() => window.location.reload()}
                className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
              >
                Refresh Page
              </button>
            </div>
          )}
        </div>
      )}

      {/* QR Scanner Region */}
      <div className="relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
        <div
          id={qrCodeRegionId.current}
          style={{ width: `${width}px`, height: `${height}px` }}
          className="mx-auto"
        />

        {!isScanning && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-90">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 border-4 border-gray-300 border-dashed rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-gray-600">Click "Start Scanning" to begin</p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 text-sm text-gray-600 space-y-1">
        <p>• QR কোডটি স্ক্যানিং এরিয়ার মধ্যে রাখুন</p>
        <p>• ভালো আলো নিশ্চিত করুন</p>
        <p>• ক্যামেরা স্থির রাখুন</p>
      </div>
    </div>
  );
};

export default QRScanner;
