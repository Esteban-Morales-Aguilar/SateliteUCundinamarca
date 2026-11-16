import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const { user, accessToken, login, logout } = useAuthStore();
  return { user, isAuthenticated: !!accessToken, isAdmin: user?.role === 'admin', login, logout };
}
