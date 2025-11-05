import { useRouter } from 'next/router';
import { useEffect, ReactNode, useState } from 'react';
import { getUserRole, canAccessPage, isAuthenticated } from '../utils/auth';
import { Box } from './styles/box';
import { Text, Loading } from '@nextui-org/react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      console.log('========== PROTECTED ROUTE CHECK ==========');
      console.log('ProtectedRoute: Current path:', router.pathname);
      
      // Check if user is authenticated
      const authenticated = isAuthenticated();
      console.log('ProtectedRoute: isAuthenticated:', authenticated);
      
      if (!authenticated) {
        console.log('ProtectedRoute: Not authenticated, redirecting to /login');
        router.replace('/login');
        return;
      }

      // Check role-based access
      const userRole = getUserRole();
      console.log('ProtectedRoute: User role:', userRole);
      
      if (!userRole) {
        console.log('ProtectedRoute: No user role found, redirecting to /login');
        router.replace('/login');
        return;
      }

      const currentPath = router.pathname;

      // Allow access to these pages for all authenticated users
      const publicAuthPages = ['/login', '/signup', '/'];
      if (publicAuthPages.includes(currentPath)) {
        console.log('ProtectedRoute: Public auth page, allowing access');
        setIsChecking(false);
        return;
      }

      // Check if user has access to current page
      const hasAccess = canAccessPage(userRole, currentPath);
      console.log('ProtectedRoute: canAccessPage result:', hasAccess);
      
      if (!hasAccess) {
        console.log(`ProtectedRoute: User role ${userRole} cannot access ${currentPath}`);
        
        // Redirect personnel to their assignments page
        if (userRole === 'personnel') {
          console.log('ProtectedRoute: Redirecting personnel to /daily-assignments');
          router.replace('/daily-assignments');
          return;
        }

        // Redirect suppliers to stock page
        if (userRole === 'fournisseur') {
          console.log('ProtectedRoute: Redirecting supplier to /stock');
          router.replace('/stock');
          return;
        }

        // Otherwise redirect to dashboard
        console.log('ProtectedRoute: Redirecting to /dashboard');
        router.replace('/dashboard');
        return;
      }

      // If allowedRoles is specified, check if user role is in the list
      if (allowedRoles && !allowedRoles.includes(userRole)) {
        console.log('ProtectedRoute: Role not in allowedRoles, redirecting to /dashboard');
        router.replace('/dashboard');
        return;
      }
      
      console.log('ProtectedRoute: All checks passed, allowing access');
      console.log('===========================================');
      setIsChecking(false);
    };

    // Only run check when router is ready
    if (router.isReady) {
      checkAuth();
    }
  }, [router, allowedRoles]);

  // Show loading while checking auth
  if (isChecking || !isAuthenticated()) {
    return (
      <Box css={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Loading size="lg" />
      </Box>
    );
  }

  return <>{children}</>;
};

// Higher-order component for easy page protection
export const withAuth = (Component: any, allowedRoles?: string[]) => {
  return function ProtectedComponent(props: any) {
    return (
      <ProtectedRoute allowedRoles={allowedRoles}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
};
