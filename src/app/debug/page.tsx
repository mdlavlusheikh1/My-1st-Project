'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function DebugPage() {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, userData, loading } = useAuth();

  useEffect(() => {
    try {
      setMounted(true);
      console.log('Debug page mounted successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading debug page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug Information</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <h3 className="font-bold">Error:</h3>
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* System Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">System Status</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Page Mounted:</span>
                <span className={mounted ? 'text-green-600' : 'text-red-600'}>
                  {mounted ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>React Working:</span>
                <span className="text-green-600">✅ Yes</span>
              </div>
              <div className="flex justify-between">
                <span>Next.js Version:</span>
                <span>15.5.4</span>
              </div>
              <div className="flex justify-between">
                <span>Current Time:</span>
                <span>{new Date().toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Auth Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Auth Loading:</span>
                <span className={loading ? 'text-yellow-600' : 'text-green-600'}>
                  {loading ? '⏳ Loading' : '✅ Complete'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>User Logged In:</span>
                <span className={user ? 'text-green-600' : 'text-gray-600'}>
                  {user ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>User Data:</span>
                <span className={userData ? 'text-green-600' : 'text-gray-600'}>
                  {userData ? '✅ Loaded' : '❌ None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>User Email:</span>
                <span>{user?.email || 'Not logged in'}</span>
              </div>
              <div className="flex justify-between">
                <span>User Role:</span>
                <span>{userData?.role || 'None'}</span>
              </div>
            </div>
          </div>

          {/* Environment Check */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Environment</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Development Mode:</span>
                <span className="text-green-600">✅ Yes</span>
              </div>
              <div className="flex justify-between">
                <span>Server Port:</span>
                <span>3001</span>
              </div>
              <div className="flex justify-between">
                <span>Browser:</span>
                <span>{typeof window !== 'undefined' ? navigator.userAgent.split(' ')[0] : 'Server'}</span>
              </div>
            </div>
          </div>

          {/* Navigation Test */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Navigation Test</h2>
            <div className="space-y-3">
              <a 
                href="/" 
                className="block bg-blue-100 hover:bg-blue-200 p-3 rounded border text-center transition-colors"
              >
                🏠 Go to Home Page
              </a>
              <a 
                href="/auth/login" 
                className="block bg-green-100 hover:bg-green-200 p-3 rounded border text-center transition-colors"
              >
                🔐 Go to Login Page
              </a>
              <a 
                href="/auth/signup" 
                className="block bg-purple-100 hover:bg-purple-200 p-3 rounded border text-center transition-colors"
              >
                📝 Go to Sign Up Page
              </a>
            </div>
          </div>
        </div>

        {/* Raw Data */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Raw Data (JSON)</h2>
          <div className="bg-gray-100 p-4 rounded overflow-auto">
            <pre className="text-sm">
              {JSON.stringify({
                mounted,
                error,
                auth: {
                  loading,
                  user: user ? {
                    uid: user.uid,
                    email: user.email,
                    emailVerified: user.emailVerified
                  } : null,
                  userData
                },
                timestamp: new Date().toISOString()
              }, null, 2)}
            </pre>
          </div>
        </div>

        {/* Console Test */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Console Test</h2>
          <button 
            onClick={() => {
              console.log('Console test button clicked');
              alert('Console test - check browser developer tools');
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Test Console Log
          </button>
        </div>
      </div>
    </div>
  );
}