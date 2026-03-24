import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../store';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = useStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
