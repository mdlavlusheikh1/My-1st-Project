import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { auth } from './firebase';
import { userQueries } from './database-queries';
import { User } from '@/types';

export class AuthService {
  static async registerUser(
    email: string, 
    password: string, 
    userData: Omit<User, 'id' | 'email' | 'createdAt' | 'updatedAt'>
  ) {
    try {
      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update Firebase profile
      await updateProfile(firebaseUser, {
        displayName: userData.name
      });

      // Create user document in Firestore
      const userDoc = await userQueries.createUser({
        uid: firebaseUser.uid,
        ...userData,
        email,
        schoolId: userData.schoolId || 'IQRA-202531', // Default school ID if not provided
        isActive: true
      });

      return {
        success: true,
        data: {
          firebaseUser,
          userData: userDoc
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  static async signIn(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Get user data from Firestore
      const userData = await userQueries.getUserByEmail(email);

      if (!userData) {
        throw new Error('User data not found');
      }

      // Check if user is active
      if (!userData.isActive) {
        throw new Error('Account is deactivated. Please contact administrator.');
      }

      return {
        success: true,
        data: {
          firebaseUser,
          userData
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign in failed'
      };
    }
  }

  static async signOut() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign out failed'
      };
    }
  }

  static onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  static getCurrentUser() {
    return auth.currentUser;
  }

  static async getCurrentUserData() {
    const firebaseUser = this.getCurrentUser();
    if (!firebaseUser) {
      return { success: false, error: 'No authenticated user' };
    }

    try {
      const userData = await userQueries.getUserByEmail(firebaseUser.email!);

      if (!userData) {
        return { success: false, error: 'User data not found' };
      }

      return {
        success: true,
        data: {
          firebaseUser,
          userData
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user data'
      };
    }
  }

  // Role-based access control helpers
  static hasRole(user: User, requiredRole: User['role'] | User['role'][]): boolean {
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    return user.role === requiredRole;
  }

  static canAccessSchool(user: User, schoolId: string): boolean {
    // Super admin can access any school
    if (user.role === 'super_admin') {
      return true;
    }
    // Other roles can only access their assigned school
    return user.schoolId === schoolId;
  }

  static canManageUsers(user: User): boolean {
    return user.role === 'super_admin' || user.role === 'admin';
  }

  static canManageAttendance(user: User): boolean {
    return user.role === 'super_admin' || user.role === 'admin' || user.role === 'teacher';
  }

  static canViewReports(user: User): boolean {
    return user.role === 'super_admin' || user.role === 'admin' || user.role === 'teacher';
  }
}
