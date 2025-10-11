'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { AuthService } from '@/lib/auth';

export type UserRole = 'super_admin' | 'admin' | 'teacher' | 'parent' | 'student';

export interface UserData {
  uid: string;
  email: string;
  role: UserRole;
  name: string;
  schoolId?: string;
  classId?: string;
  studentId?: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  getUserRole: () => UserRole | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  getUserRole: () => null,
  signIn: async () => ({ success: false, error: 'Not implemented' }),
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;
        setUserData(data);
      } else {
        // Default role for demo purposes
        const defaultUserData: UserData = {
          uid,
          email: user?.email || '',
          role: 'admin',
          name: user?.email?.split('@')[0] || 'User',
        };
        setUserData(defaultUserData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Set default data on error
      const defaultUserData: UserData = {
        uid,
        email: user?.email || '',
        role: 'admin',
        name: user?.email?.split('@')[0] || 'User',
      };
      setUserData(defaultUserData);
    }
  };

  const getUserRole = (): UserRole | null => {
    return userData?.role || null;
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await AuthService.signIn(email, password);
      if (result.success && result.data) {
        // User data will be updated through onAuthStateChanged
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Sign in failed' };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Sign in failed' };
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await fetchUserData(user.uid);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading, getUserRole, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
