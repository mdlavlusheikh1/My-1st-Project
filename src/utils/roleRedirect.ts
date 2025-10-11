import { UserRole } from '@/contexts/AuthContext';

export const getRoleBasedRoute = (role: UserRole): string => {
  switch (role) {
    case 'super_admin':
      return '/super-admin/dashboard';
    case 'admin':
      return '/admin/dashboard';
    case 'teacher':
      return '/teacher/dashboard';
    case 'parent':
      return '/parent/dashboard';
    case 'student':
      return '/student/dashboard';
    default:
      return '/admin/dashboard';
  }
};

export const isAuthorizedForRoute = (userRole: UserRole, routePath: string): boolean => {
  const roleRoutes = {
    super_admin: ['/super-admin'],
    admin: ['/admin'],
    teacher: ['/teacher'],
    parent: ['/parent'],
    student: ['/student'],
  };

  // Super admin can access all routes
  if (userRole === 'super_admin') {
    return true;
  }

  // Check if user role has access to the route
  return roleRoutes[userRole]?.some(route => routePath.startsWith(route)) || false;
};