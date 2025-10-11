'use client';

import { useState } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, CheckCircle, AlertCircle } from 'lucide-react';

export default function PromoteUser() {
  const [uid, setUid] = useState('ndrZqsqNWmZ5Hq1fDVYvCNFQKs72');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const { userData } = useAuth();

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const promoteToSuperAdmin = async () => {
    if (!uid.trim()) {
      showMessage('UID প্রয়োজন', 'error');
      return;
    }

    setLoading(true);

    try {
      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (!userDoc.exists()) {
        showMessage('ব্যবহারকারী পাওয়া যায়নি', 'error');
        return;
      }

      const currentData = userDoc.data();
      
      // Update user to super admin
      await updateDoc(doc(db, 'users', uid), {
        role: 'super_admin',
        schoolId: 'all',
        schoolName: 'System Administrator',
        isActive: true,
        updatedAt: new Date()
      });

      showMessage(
        `✅ সফলভাবে সুপার অ্যাডমিন করা হয়েছে!\nপূর্বের রোল: ${currentData.role}\nনতুন রোল: super_admin`,
        'success'
      );

    } catch (error) {
      console.error('Error promoting user:', error);
      showMessage('সুপার অ্যাডমিন করতে ব্যর্থ: ' + (error instanceof Error ? error.message : 'অজানা ত্রুটি'), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Only allow access to super admin or your teacher account
  if (!userData || (userData.role !== 'super_admin' && userData.email !== 'mdlavlusheikh220@gmail.com')) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">আপনার এই পেইজে প্রবেশের অনুমতি নেই</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-lg border shadow-sm p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">সুপার অ্যাডমিন প্রমোশন</h1>
          <p className="text-gray-600">ব্যবহারকারীকে সুপার অ্যাডমিন করুন</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            messageType === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <div className="flex items-start">
              {messageType === 'success' ? (
                <CheckCircle className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
              )}
              <pre className="whitespace-pre-wrap text-sm">{message}</pre>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ব্যবহারকারীর UID
            </label>
            <input
              type="text"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="ব্যবহারকারীর UID লিখুন"
            />
            <p className="text-sm text-gray-500 mt-1">
              Firebase Authentication থেকে ব্যবহারকারীর UID কপি করুন
            </p>
          </div>

          <button
            onClick={promoteToSuperAdmin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                প্রসেসিং...
              </div>
            ) : (
              'সুপার অ্যাডমিন করুন'
            )}
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">নির্দেশনা:</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Firebase Console → Authentication → Users থেকে ব্যবহারকারীর UID কপি করুন</li>
            <li>উপরের ফিল্ডে UID পেস্ট করুন</li>
            <li>"সুপার অ্যাডমিন করুন" বাটনে ক্লিক করুন</li>
            <li>ব্যবহারকারী লগআউট এবং আবার লগইন করলে সুপার অ্যাডমিন অ্যাক্সেস পাবেন</li>
          </ol>
        </div>

        {/* Current UID Display */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">বর্তমান UID:</h4>
          <code className="text-sm text-gray-700 bg-white px-2 py-1 rounded border break-all">
            {uid}
          </code>
        </div>
      </div>
    </div>
  );
}