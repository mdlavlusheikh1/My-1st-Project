'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { getRoleBasedRoute } from '@/utils/roleRedirect';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { userData } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Wait a moment for the auth context to update
      setTimeout(() => {
        // Redirect will be handled by useEffect when userData updates
      }, 100);
    } catch (error: any) {
      setError(getErrorMessage(error.code));
      setLoading(false);
    }
  };

  // Redirect based on user role when userData is available
  useEffect(() => {
    if (userData) {
      const redirectRoute = getRoleBasedRoute(userData.role);
      router.push(redirectRoute);
      setLoading(false);
    }
  }, [userData, router]);

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'এই ইমেইল ঠিকানা দিয়ে কোন অ্যাকাউন্ট পাওয়া যায়নি';
      case 'auth/wrong-password':
        return 'ভুল পাসওয়ার্ড';
      case 'auth/invalid-email':
        return 'অবৈধ ইমেইল ঠিকানা';
      case 'auth/invalid-credential':
        return 'ভুল ইমেইল বা পাসওয়ার্ড';
      default:
        return 'লগইনে সমস্যা হয়েছে, আবার চেষ্টা করুন';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-teal-500 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="mb-6 flex items-center text-white hover:text-blue-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>হোম পেইজে ফিরুন</span>
        </button>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">ই</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">অ্যাডমিন লগইন</h1>
            <p className="text-gray-600">আপনার অ্যাকাউন্টে প্রবেশ করুন</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                ইমেইল ঠিকানা
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="আপনার ইমেইল লিখুন"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                পাসওয়ার্ড
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors pr-12"
                  placeholder="আপনার পাসওয়ার্ড লিখুন"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">আমাকে মনে রাখুন</span>
              </label>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                পাসওয়ার্ড ভুলে গেছেন?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  লগইন হচ্ছে...
                </div>
              ) : (
                'লগইন করুন'
              )}
            </button>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                অ্যাকাউন্ট নেই?{' '}
                <button
                  type="button"
                  onClick={() => router.push('/auth/signup')}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  সাইন আপ করুন
                </button>
              </p>
            </div>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">ডেমো অ্যাকাউন্ট:</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="grid grid-cols-1 gap-2">
                <p><strong>সুপার এডমিন:</strong> superadmin@iqra.edu.bd | demo123</p>
                <p><strong>এডমিন:</strong> admin@iqra.edu.bd | demo123</p>
                <p><strong>শিক্ষক:</strong> mdlavlusheikh220@gmail.com | demo123</p>
                <p><strong>অভিভাবক:</strong> parent@iqra.edu.bd | demo123</p>
                <p><strong>ছাত্র:</strong> student@iqra.edu.bd | demo123</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-white text-sm mb-2">
            © 2024 আমার স্কুল। সর্বস্বত্ব সংরক্ষিত।
          </p>
          <div className="space-x-4">
            <a href="/debug/firestore" className="text-blue-200 hover:text-white text-xs underline">
              🔍 Debug Firestore
            </a>
            <a href="/admin/users" className="text-blue-200 hover:text-white text-xs underline">
              👥 User Management
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPageWrapper() {
  return (
    <ProtectedRoute requireAuth={false}>
      <LoginPage />
    </ProtectedRoute>
  );
}