import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  GraduationCap,
  Smartphone,
  Sparkles,
  Wallet,
  ClipboardList,
} from 'lucide-react';
import { getAdminMetrics } from '../../api/client';
import { AdminMetrics } from '../../types';
import { PageTransition } from '../../components/PageTransition';
import { AnimatedCounter } from '../../components/AnimatedCounter';
import styles from './Admin.module.css';

const MOCK_WEEKLY = [
  { week: 'Янв 1', students: 12 },
  { week: 'Янв 8', students: 19 },
  { week: 'Янв 15', students: 31 },
  { week: 'Янв 22', students: 28 },
  { week: 'Янв 29', students: 42 },
  { week: 'Фев 5', students: 38 },
  { week: 'Фев 12', students: 55 },
  { week: 'Фев 19', students: 48 },
];

function fmt(n: number) {
  return n.toLocaleString('ru-RU', { maximumFractionDigits: 0 }) + ' ₽';
}

interface FunnelBarProps {
  pct: number;
  color: string;
}

const AnimatedFunnelBar = ({ pct, color }: FunnelBarProps) => {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setWidth(pct || 0), 150);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [pct]);

  return (
    <div className={styles.funnelBarWrap} ref={ref}>
      <div
        className={styles.funnelBar}
        style={{ width: `${width}%`, background: color }}
      />
    </div>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminMetrics().then(setMetrics).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  const KPI_CARDS = [
    {
      label: 'Студентов всего',
      value: metrics?.total_students ?? 0,
      icon: <GraduationCap size={22} />,
      color: '#21A038',
      bg: 'rgba(33,160,56,0.1)',
      isNumber: true,
    },
    {
      label: 'Активны сегодня',
      value: metrics?.active_today ?? 0,
      icon: <Smartphone size={22} />,
      color: '#3B82F6',
      bg: 'rgba(59,130,246,0.1)',
      isNumber: true,
    },
    {
      label: 'Новых за неделю',
      value: metrics?.new_this_week ?? 0,
      icon: <Sparkles size={22} />,
      color: '#8B5CF6',
      bg: 'rgba(139,92,246,0.1)',
      isNumber: true,
    },
    {
      label: 'Средний баланс',
      value: metrics ? fmt(metrics.avg_balance) : '—',
      icon: <Wallet size={22} />,
      color: '#F59E0B',
      bg: 'rgba(245,158,11,0.1)',
      isNumber: false,
    },
  ];

  const FUNNEL = [
    { label: 'Онбординг завершён', pct: metrics?.onboarding_completion_rate, color: '#21A038' },
    { label: 'Опрос пройден', pct: metrics?.survey_completion_rate, color: '#3B82F6' },
    { label: 'Открыли копилку', pct: metrics?.savings_users_pct, color: '#8B5CF6' },
    { label: 'Инвестировали', pct: metrics?.investment_users_pct, color: '#F59E0B' },
  ];

  return (
    <PageTransition>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Панель администратора</h1>
          <button className="btn btn-primary" onClick={() => navigate('/admin/documents')}>
            <ClipboardList size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
            Справки на модерации
          </button>
        </div>

        {/* KPI Cards */}
        <div className={styles.kpiGrid}>
          {KPI_CARDS.map((kpi) => (
            <div key={kpi.label} className={`card ${styles.kpiCard}`}>
              <div className={styles.kpiIcon} style={{ background: kpi.bg, color: kpi.color }}>{kpi.icon}</div>
              <div className={styles.kpiValue} style={{ color: kpi.color }}>
                {kpi.isNumber ? (
                  <AnimatedCounter end={kpi.value as number} duration={1200} />
                ) : (
                  kpi.value
                )}
              </div>
              <div className={styles.kpiLabel}>{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="card">
          <h2 className={styles.sectionTitle}>Регистрации по неделям</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={MOCK_WEEKLY} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: '#fff',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: '10px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}
              />
              <Bar
                dataKey="students"
                name="Студентов"
                fill="url(#barGradient)"
                radius={[6, 6, 0, 0]}
                isAnimationActive
                animationBegin={0}
                animationDuration={1000}
              />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#21A038" />
                  <stop offset="100%" stopColor="#00D084" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Funnel */}
        <div className="card">
          <h2 className={styles.sectionTitle}>Воронка конверсии</h2>
          <div className={styles.funnelGrid}>
            {FUNNEL.map((f) => (
              <div key={f.label} className={styles.funnelItem}>
                <div className={styles.funnelLabel}>{f.label}</div>
                <AnimatedFunnelBar pct={f.pct || 0} color={f.color} />
                <div className={styles.funnelPct} style={{ color: f.color }}>{f.pct}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
