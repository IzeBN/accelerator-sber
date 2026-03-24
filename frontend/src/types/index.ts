export interface User {
  id: number;
  role: 'student' | 'parent' | 'admin';
  full_name: string;
  email: string;
  phone?: string;
  university?: string;
  package: 'base' | 'standard' | 'premium';
  onboarding_done: boolean;
  survey_done: boolean;
  parent_id?: number;
  created_at: string;
}

export interface Transaction {
  id: number;
  account_id: number;
  amount: number;
  category: string;
  description?: string;
  tx_date: string;
}

export interface DashboardSummary {
  balance: number;
  income_month: number;
  expense_month: number;
  cashback_balance: number;
  bonus_points: number;
  top_categories: { category: string; amount: number; pct: number }[];
  days_until_next_income: number;
  daily_limit: number;
}

export interface SpendingChartData {
  month: string;
  food: number;
  transport: number;
  cafe: number;
  education: number;
  entertainment: number;
  other: number;
}

export interface SavingsGoal {
  id: number;
  user_id: number;
  title: string;
  target_amount: number;
  current_amount: number;
  strategy?: string;
  deadline?: string;
  created_at: string;
}

export interface Investment {
  id: number;
  user_id: number;
  instrument: string;
  type: string;
  amount: number;
  profit_pct: number;
  opened_at: string;
}

export interface InvestmentPortfolio {
  investments: Investment[];
  total_value: number;
  total_profit_pct: number;
}

export interface InvestmentCatalogItem {
  instrument: string;
  type: string;
  description: string;
  min_amount: number;
  expected_return: string;
}

export interface Benefit {
  id: number;
  title: string;
  description: string;
  category: string;
  eligible_package: string;
  link?: string;
}

export interface Tip {
  id: number;
  trigger: string;
  text: string;
}

export interface Document {
  id: number;
  user_id: number;
  doc_type: string;
  file_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewer_id?: number;
  submitted_at: string;
  reviewed_at?: string;
}

export interface AdminMetrics {
  total_students: number;
  active_today: number;
  onboarding_completion_rate: number;
  survey_completion_rate: number;
  savings_users_pct: number;
  investment_users_pct: number;
  avg_balance: number;
  new_this_week: number;
}

export interface ChildSummary {
  balance: number;
  expense_week: number;
  expense_month: number;
}
