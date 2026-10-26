export type UserRole = 'admin' | 'analyst' | 'agent'; // agent = Registrador

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  storeAccess?: string; // Tienda específica o 'Todas'
  photoURL?: string;
}

export interface RolePermissions {
  canCreateCase: boolean;
  canEditCase: boolean;
  canArchiveCase: boolean;
  canViewReports: boolean;
  canExportData: boolean;
  canImportData: boolean;
  canManageUsers: boolean;
  canConfigureFields: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canCreateCase: true,
    canEditCase: true,
    canArchiveCase: true,
    canViewReports: true,
    canExportData: true,
    canImportData: true,
    canManageUsers: true,
    canConfigureFields: true,
  },
  analyst: {
    canCreateCase: true,
    canEditCase: false,
    canArchiveCase: false,
    canViewReports: true,
    canExportData: true,
    canImportData: false,
    canManageUsers: false,
    canConfigureFields: false,
  },
  agent: {
    canCreateCase: true,
    canEditCase: true, // Only own or open cases
    canArchiveCase: false,
    canViewReports: false,
    canExportData: false,
    canImportData: false,
    canManageUsers: false,
    canConfigureFields: false,
  },
};
