import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../services/firebase';
import { AppUser, UserRole, RolePermissions } from '../types/user';

interface AuthContextType {
  user: AppUser;
  role: UserRole;
  permissions: RolePermissions;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setDemoRole: (role: UserRole) => void;
  isFirebaseActive: boolean;
}

// Único usuario con acceso total a todo el sistema SICUREZZA XP
const SICUREZZA_ADMIN_USER: AppUser = {
  uid: 'sicurezza-admin-master',
  email: 'info@sicurezza.pe',
  displayName: 'Administrador SICUREZZA XP',
  role: 'admin',
  storeAccess: 'Todas las Sedes y Canales',
};

const ALL_PERMISSIONS: RolePermissions = {
  canCreateCase: true,
  canEditCase: true,
  canArchiveCase: true,
  canViewReports: true,
  canExportData: true,
  canImportData: true,
  canManageUsers: true,
  canConfigureFields: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser>(SICUREZZA_ADMIN_USER);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || 'info@sicurezza.pe',
            displayName: firebaseUser.displayName || 'Administrador SICUREZZA XP',
            role: 'admin',
            photoURL: firebaseUser.photoURL || undefined,
            storeAccess: 'Todas las Sedes y Canales',
          });
        } else {
          setUser(SICUREZZA_ADMIN_USER);
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth) {
      alert('Para autenticación Google en producción, añade credenciales de Firebase en el archivo .env o modal de Conexión.');
      return;
    }
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Error al iniciar sesión con Google:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    setUser(SICUREZZA_ADMIN_USER);
  };

  const setDemoRole = (_role: UserRole) => {
    // Un solo usuario con acceso a todo
    setUser(SICUREZZA_ADMIN_USER);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: 'admin',
        permissions: ALL_PERMISSIONS,
        isLoading,
        loginWithGoogle,
        logout,
        setDemoRole,
        isFirebaseActive: isFirebaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
