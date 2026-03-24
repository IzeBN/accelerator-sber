import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import { getMe } from './api/client';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Welcome from './pages/onboarding/Welcome';
import StudentVerify from './pages/onboarding/StudentVerify';
import PackageSelect from './pages/onboarding/PackageSelect';
import MeetStepan from './pages/onboarding/MeetStepan';
import SurveyFlow from './pages/survey/SurveyFlow';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Savings from './pages/Savings';
import Investments from './pages/Investments';
import Benefits from './pages/Benefits';
import Parent from './pages/Parent';
import AdminDashboard from './pages/admin/AdminDashboard';
import DocumentReview from './pages/admin/DocumentReview';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const { token, setAuth, user } = useStore();

  useEffect(() => {
    if (token && !user) {
      getMe().then((u) => setAuth(u, token)).catch(() => {
        localStorage.removeItem('token');
      });
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        <Route path="/onboarding/welcome" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
        <Route path="/onboarding/verify" element={<ProtectedRoute><StudentVerify /></ProtectedRoute>} />
        <Route path="/onboarding/package" element={<ProtectedRoute><PackageSelect /></ProtectedRoute>} />
        <Route path="/onboarding/stepan" element={<ProtectedRoute><MeetStepan /></ProtectedRoute>} />
        <Route path="/survey" element={<ProtectedRoute><SurveyFlow /></ProtectedRoute>} />

        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/savings" element={<Savings />} />
          <Route path="/investments" element={<Investments />} />
          <Route path="/benefits" element={<Benefits />} />
          <Route path="/parent" element={<Parent />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/documents" element={<DocumentReview />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
