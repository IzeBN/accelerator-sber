import { useEffect, useRef, useState } from 'react';
import {
  Bot,
  Target,
  Laptop,
  Plane,
  Umbrella,
  Music,
  Car,
  BookOpen,
  Home,
  RefreshCw,
  Calendar,
  Wallet,
  X,
  Plus,
} from 'lucide-react';
import { getSavingsGoals, createSavingsGoal, depositToGoal, deleteSavingsGoal } from '../api/client';
import { SavingsGoal } from '../types';
import { PageTransition } from '../components/PageTransition';
import { AnimatedCounter } from '../components/AnimatedCounter';
import styles from './Savings.module.css';

function fmt(n: number) {
  return n.toLocaleString('ru-RU', { maximumFractionDigits: 0 }) + ' ₽';
}

const STRATEGY_LABELS: Record<string, string> = {
  round_up: 'Округление',
  weekly: 'Фиксированная сумма',
  percent_income: 'Процент от поступлений',
};

const GOAL_ICONS = [
  <Target size={22} color="#21A038" />,
  <Laptop size={22} color="#21A038" />,
  <Plane size={22} color="#21A038" />,
  <Umbrella size={22} color="#21A038" />,
  <Music size={22} color="#21A038" />,
  <Car size={22} color="#21A038" />,
  <BookOpen size={22} color="#21A038" />,
  <Home size={22} color="#21A038" />,
];

const COLOR_CLASSES = ['color0', 'color1', 'color2', 'color3', 'color4'];

interface ProgressBarProps {
  pct: number;
  colorClass: string;
}

const AnimatedProgressBar = ({ pct, colorClass }: ProgressBarProps) => {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setWidth(pct), 100);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [pct]);

  return (
    <div className={styles.goalProgress} ref={ref}>
      <div
        className={`${styles.goalProgressFill} ${styles[colorClass]}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
};

export default function Savings() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [depositModal, setDepositModal] = useState<SavingsGoal | null>(null);
  const [createForm, setCreateForm] = useState({ title: '', target_amount: '', strategy: 'round_up' });
  const [depositAmount, setDepositAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => getSavingsGoals().then(setGoals).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!createForm.title || !createForm.target_amount) return;
    setSaving(true);
    try {
      await createSavingsGoal({
        title: createForm.title,
        target_amount: Number(createForm.target_amount),
        strategy: createForm.strategy,
      });
      setShowCreateModal(false);
      setCreateForm({ title: '', target_amount: '', strategy: 'round_up' });
      load();
    } catch {}
    setSaving(false);
  };

  const handleDeposit = async () => {
    if (!depositModal || !depositAmount) return;
    setSaving(true);
    try {
      const updated = await depositToGoal(depositModal.id, Number(depositAmount));
      setGoals((prev) => prev.map((g) => g.id === updated.id ? updated : g));
      setDepositModal(null);
      setDepositAmount('');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      alert(err?.response?.data?.detail || 'Ошибка');
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить цель?')) return;
    await deleteSavingsGoal(id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  if (loading) return <div className="spinner" />;

  return (
    <PageTransition>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Копилка</h1>
            <p className={styles.sub}>
              <Bot size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} color="#21A038" />
              Степан: Давай копить на твою мечту!
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            Добавить цель
          </button>
        </div>

        {/* Goals */}
        <div className={styles.goalsGrid}>
          {goals.map((goal, idx) => {
            const pct = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
            const colorClass = COLOR_CLASSES[idx % COLOR_CLASSES.length];
            const goalIcon = GOAL_ICONS[idx % GOAL_ICONS.length];
            const isComplete = pct >= 100;

            return (
              <div
                key={goal.id}
                className={`${styles.goalCard} ${isComplete ? styles.goalCard100 : ''}`}
                style={{ animationDelay: `${idx * 0.06}s` }}
              >
                <div className={styles.goalHeader}>
                  <div className={styles.goalTitleRow}>
                    <div className={styles.goalEmoji}>{goalIcon}</div>
                    <div className={styles.goalTitle}>{goal.title}</div>
                  </div>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(goal.id)}>
                    <X size={14} />
                  </button>
                </div>

                <div className={styles.goalAmounts}>
                  <span className={styles.goalCurrent}>{fmt(goal.current_amount)}</span>
                  <span className={styles.goalTarget}>из {fmt(goal.target_amount)}</span>
                </div>

                <AnimatedProgressBar pct={pct} colorClass={colorClass} />

                <div className={styles.goalFooter}>
                  <span className="badge badge-green">
                    <AnimatedCounter end={pct} suffix="%" duration={800} />
                  </span>
                  {goal.strategy && (
                    <span className="badge badge-gray">{STRATEGY_LABELS[goal.strategy]}</span>
                  )}
                  {goal.deadline && (
                    <span className={styles.deadline}>
                      до {new Date(goal.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </div>

                <button
                  className={styles.goalDepositBtn}
                  onClick={() => { setDepositModal(goal); setDepositAmount(''); }}
                >
                  <Plus size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                  Пополнить копилку
                </button>
              </div>
            );
          })}

          {goals.length === 0 && (
            <div className={`card ${styles.emptyCard}`}>
              <span className={styles.emptyIcon}><Target size={48} color="#21A038" /></span>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
                У тебя пока нет целей накопления
              </p>
              <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                Создать первую цель
              </button>
            </div>
          )}
        </div>

        {/* Strategies */}
        <div className="card">
          <h2 className={styles.sectionTitle}>Стратегии накопления</h2>
          <div className={styles.strategiesGrid}>
            {[
              { icon: <RefreshCw size={22} color="#21A038" />, title: 'Округление', desc: 'Каждую покупку округляем до 10 ₽ — разница идёт в копилку' },
              { icon: <Calendar size={22} color="#21A038" />, title: 'Процент от поступлений', desc: 'Откладываем 5, 10 или 15% от каждой стипендии или перевода' },
              { icon: <Wallet size={22} color="#21A038" />, title: 'Фиксированная сумма', desc: 'Переводим заданную сумму каждый день или каждую неделю' },
            ].map((s) => (
              <div key={s.title} className={styles.strategyCard}>
                <span className={styles.strategyIcon}>{s.icon}</span>
                <div>
                  <div className={styles.strategyTitle}>{s.title}</div>
                  <div className={styles.strategyDesc}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title">Новая цель накопления</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  className="input"
                  placeholder="Название (например, Ноутбук)"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                />
                <input
                  className="input"
                  type="number"
                  placeholder="Сумма, ₽"
                  value={createForm.target_amount}
                  onChange={(e) => setCreateForm({ ...createForm, target_amount: e.target.value })}
                />
                <select
                  className="input"
                  value={createForm.strategy}
                  onChange={(e) => setCreateForm({ ...createForm, strategy: e.target.value })}
                >
                  <option value="round_up">Округление</option>
                  <option value="weekly">Фиксированная сумма</option>
                  <option value="percent_income">Процент от поступлений</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowCreateModal(false)}>
                  Отмена
                </button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleCreate} disabled={saving}>
                  {saving ? 'Создаём...' : 'Создать цель'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Deposit modal */}
        {depositModal && (
          <div className="modal-overlay" onClick={() => setDepositModal(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title">Пополнить «{depositModal.title}»</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: 14 }}>
                Прогресс: {fmt(depositModal.current_amount)} из {fmt(depositModal.target_amount)}
              </p>
              <input
                className="input"
                type="number"
                placeholder="Сумма пополнения, ₽"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setDepositModal(null)}>
                  Отмена
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={handleDeposit}
                  disabled={saving || !depositAmount}
                >
                  {saving ? 'Пополняем...' : 'Пополнить'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
