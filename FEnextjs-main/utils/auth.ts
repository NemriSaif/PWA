export type UserRole = 'manager' | 'fournisseur' | 'personnel';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  company?: string;
}

export const getUserFromStorage = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const getUserRole = (): UserRole | null => {
  const user = getUserFromStorage();
  // Normalize role to lowercase to handle backend returning uppercase
  const role = user?.role;
  if (!role) return null;
  return role.toLowerCase() as UserRole;
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
};

// Role-based access control
export const canAccessPage = (userRole: UserRole | null, pagePath: string): boolean => {
  console.log('canAccessPage check:', { userRole, pagePath });
  
  if (!userRole) {
    console.log('canAccessPage: No role, denying access');
    return false;
  }

  const rolePermissions: Record<UserRole, string[]> = {
    manager: [
      '/dashboard',
      '/work-sites',
      '/employees',
      '/vehicles',
      '/fuel-costs',
      '/daily-assignments',
      '/suppliers',
      '/stock',
      '/orders',
      '/accounts',
    ],
    fournisseur: [
      '/dashboard',
      '/stock',
      '/orders',
    ],
    personnel: [
      '/dashboard',
      '/work-sites',
      '/daily-assignments',
    ],
  };

  const allowedPaths = rolePermissions[userRole] || [];
  const hasAccess = allowedPaths.includes(pagePath);
  console.log('canAccessPage result:', { userRole, pagePath, hasAccess, allowedPaths });
  return hasAccess;
};

// Check if user can perform action on resource
export const canEdit = (userRole: UserRole | null, resourceType: string): boolean => {
  if (!userRole) return false;

  if (userRole === 'personnel') return false; // Personnel are read-only

  if (userRole === 'fournisseur') {
    // Suppliers can only edit their own stock and orders
    return ['stock', 'orders'].includes(resourceType);
  }

  if (userRole === 'manager') {
    return true; // Managers can edit everything
  }

  return false;
};

export const canDelete = (userRole: UserRole | null, resourceType: string): boolean => {
  if (!userRole) return false;

  if (userRole === 'personnel') return false; // Personnel cannot delete

  if (userRole === 'fournisseur') {
    // Suppliers can only delete their own stock
    return resourceType === 'stock';
  }

  if (userRole === 'manager') {
    return true; // Managers can delete everything
  }

  return false;
};

export const canCreate = (userRole: UserRole | null, resourceType: string): boolean => {
  if (!userRole) return false;

  if (userRole === 'personnel') return false; // Personnel cannot create

  if (userRole === 'fournisseur') {
    // Suppliers can only create stock items
    return resourceType === 'stock';
  }

  if (userRole === 'manager') {
    return true; // Managers can create everything
  }

  return false;
};
