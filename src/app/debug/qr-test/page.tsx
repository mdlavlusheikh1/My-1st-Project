'use client';

import React, { useState, useEffect } from 'react';
import { QRUtils } from '@/lib/qr-utils';
import QRScanner from '@/components/QRScanner';

function QRTestPage() {
  const [testQRCode, setTestQRCode] = useState<string>('');
  const [testQRData, setTestQRData] = useState<string>('');
  const [scanResults, setScanResults] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    generateTestQR();
  }, []);

  const generateTestQR = async () => {
    setIsGenerating(true);
    try {
      // Generate a test student QR code
      const { qrCode, qrData } = await QRUtils.generateStudentQR(
        'test-student-123',
        'IQRA-202531',
        '001'
      );

      setTestQRCode(qrCode);
      setTestQRData(qrData);
      console.log('Generated test QR data:', qrData);
    } catch (error) {
      console.error('Error generating test QR:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScanSuccess = (qrData: string, parsedData: any) => {
    console.log('Scan successful!');
    console.log('Raw data:', qrData);
    console.log('Parsed data:', parsedData);

    // Add to results
    setScanResults(prev => [{
      timestamp: new Date(),
      rawData: qrData,
      parsedData: parsedData,
      success: parsedData && parsedData.type !== 'unknown'
    }, ...prev.slice(0, 4)]); // Keep only last 5 results
  };

  const handleScanError = (error: string) => {
    console.error('Scan error:', error);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">QR Code Test Page</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - QR Code Display */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Test QR Code</h2>

            {isGenerating ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Generating QR Code...</span>
              </div>
            ) : testQRCode ? (
              <div className="text-center">
                <div className="mb-4">
                  <img
                    src={testQRCode}
                    alt="Test QR Code"
                    className="mx-auto border-2 border-gray-300 rounded-lg"
                    style={{ maxWidth: '256px', height: 'auto' }}
                  />
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">QR Data:</h3>
                  <pre className="text-xs text-gray-600 bg-white p-2 rounded border overflow-x-auto">
                    {JSON.stringify(JSON.parse(testQRData), null, 2)}
                  </pre>
                </div>
                <button
                  onClick={generateTestQR}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Generate New QR Code
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Failed to generate QR code</p>
                <button
                  onClick={generateTestQR}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          {/* Right Column - QR Scanner */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">QR Scanner Test</h2>

            <div className="mb-6">
              <QRScanner
                onScanSuccess={handleScanSuccess}
                onScanError={handleScanError}
                width={300}
                height={300}
              />
            </div>

            {/* Scan Results */}
            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-900 mb-3">Recent Scan Results:</h3>
              {scanResults.length === 0 ? (
                <p className="text-gray-500 text-sm">No scans yet. Scan the QR code above to test.</p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {scanResults.map((result, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        result.success
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${
                          result.success ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {result.success ? '✅ Success' : '❌ Failed'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {result.timestamp.toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="text-xs text-gray-600">
                        <p><strong>Raw:</strong> {result.rawData}</p>
                        <p><strong>Type:</strong> {result.parsedData?.type || 'unknown'}</p>
                        {result.parsedData?.data && (
                          <p><strong>Parsed:</strong> {JSON.stringify(result.parsedData.data)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Testing Instructions:</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Wait for the test QR code to generate on the left</li>
            <li>Click "Start Scanning" in the QR scanner on the right</li>
            <li>Allow camera access when prompted by your browser</li>
            <li>Point your camera at the test QR code</li>
            <li>Check the scan results below the scanner</li>
            <li>Open browser console (F12) to see detailed logs</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default QRTestPage;
