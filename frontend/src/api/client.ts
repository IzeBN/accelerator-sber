import axios from 'axios';

const BASE_URL = (import.meta.env.VITE_API_URL as string) || '/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (email: string, role: string) =>
  api.post('/auth/login', { email, role }).then((r) => r.data);

export const getMe = () => api.get('/auth/me').then((r) => r.data);

// Dashboard
export const getDashboardSummary = () =>
  api.get('/dashboard/summary').then((r) => r.data);

export const getTransactions = (limit = 20, offset = 0) =>
  api.get('/dashboard/transactions', { params: { limit, offset } }).then((r) => r.data);

export const getStepanTips = () =>
  api.get('/dashboard/tips').then((r) => r.data);

export const getSpendingChart = () =>
  api.get('/dashboard/spending-chart').then((r) => r.data);

// Onboarding
export const setPackage = (pkg: string) =>
  api.put('/onboarding/package', { package: pkg }).then((r) => r.data);

export const verifyStudent = (doc_type: string, file_url?: string) =>
  api.post('/onboarding/verify-student', { doc_type, file_url }).then((r) => r.data);

export const completeOnboarding = () =>
  api.put('/onboarding/complete').then((r) => r.data);

// Survey
export const saveSurveyAnswer = (step: number, question: string, answer: unknown) =>
  api.post('/survey/answer', { step, question, answer }).then((r) => r.data);

export const completeSurvey = () =>
  api.put('/survey/complete').then((r) => r.data);

// Savings
export const getSavingsGoals = () =>
  api.get('/savings/goals').then((r) => r.data);

export const createSavingsGoal = (data: { title: string; target_amount: number; strategy?: string; deadline?: string }) =>
  api.post('/savings/goals', data).then((r) => r.data);

export const depositToGoal = (id: number, amount: number) =>
  api.post(`/savings/goals/${id}/deposit`, { amount }).then((r) => r.data);

export const deleteSavingsGoal = (id: number) =>
  api.delete(`/savings/goals/${id}`);

// Investments
export const getInvestments = () =>
  api.get('/investments').then((r) => r.data);

export const getInvestmentsCatalog = () =>
  api.get('/investments/catalog').then((r) => r.data);

export const buyInvestment = (data: { instrument: string; type: string; amount: number }) =>
  api.post('/investments/buy', data).then((r) => r.data);

// Benefits
export const getBenefits = () =>
  api.get('/benefits').then((r) => r.data);

// Parent
export const getChildren = () =>
  api.get('/parent/children').then((r) => r.data);

export const getChildSummary = (id: number) =>
  api.get(`/parent/child/${id}/summary`).then((r) => r.data);

export const transferToChild = (id: number, amount: number, comment?: string) =>
  api.post(`/parent/child/${id}/transfer`, { amount, comment }).then((r) => r.data);

// Admin
export const getDocuments = (status?: string) =>
  api.get('/admin/documents', { params: status ? { status } : {} }).then((r) => r.data);

export const reviewDocument = (id: number, status: string, comment?: string) =>
  api.put(`/admin/documents/${id}/review`, { status, comment }).then((r) => r.data);

export const getAdminMetrics = () =>
  api.get('/admin/metrics').then((r) => r.data);
