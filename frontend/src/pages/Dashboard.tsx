import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import {
  Bot,
  Building2,
  TrendingUp,
  Star,
  Gift,
  Lightbulb,
  Plus,
  ChevronRight,
} from 'lucide-react';
import { getDashboardSummary, getTransactions, getStepanTips } from '../api/client';
import { DashboardSummary, Transaction, Tip } from '../types';
import { PageTransition } from '../components/PageTransition';
import styles from './Dashboard.module.css';

const CAT_COLORS: Record<string, string> = {
  food: '#21A038',
  transport: '#00D084',
  cafe: '#34C759',
  education: '#1A7D2C',
  entertainment: '#0D5C1F',
  supermarket: '#5CB85C',
  other: '#86C68C',
};

const CAT_NAMES: Record<string, string> = {
  food: 'Еда',
  transport: 'Транспорт',
  cafe: 'Кафе',
  education: 'Учёба',
  entertainment: 'Развлечения',
  supermarket: 'Магазины',
  other: 'Другое',
  income: 'Пополнение',
  transfer: 'Перевод',
};

function fmt(n: number) {
  return n.toLocaleString('ru-RU', { maximumFractionDigits: 0 }) + ' ₽';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipDismissed, setTipDismissed] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitInput, setLimitInput] = useState('');
  const limitInputRef = useRef<HTMLInputElement>(null);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferPhone, setTransferPhone] = useState('');
  const [actionDone, setActionDone] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getDashboardSummary(), getTransactions(10), getStepanTips()])
      .then(([s, t, ti]) => {
        setSummary(s);
        setTxs(t);
        setTips(ti);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  const tip = tipDismissed ? null : tips[0];
  const pieData = summary?.top_categories.slice(0, 4).map((c) => ({
    name: CAT_NAMES[c.category] || c.category,
    value: c.amount,
    color: CAT_COLORS[c.category] || '#21A038',
  })) || [];

  return (
    <PageTransition>
      <div className={styles.page}>
        {/* Top row: Balance + Stepan */}
        <div className={styles.topRow}>
          {/* Balance Card */}
          <div className={`card ${styles.balanceCard}`}>
            <div className={styles.balanceLabel}>Баланс карты</div>
            <div className={styles.balance}>{fmt(summary?.balance || 0)}</div>
            <div className={styles.balanceStats}>
              <div className={styles.bStat}>
                <span className={styles.bStatLabel}>Доход / мес</span>
                <span className={`${styles.bStatVal} ${styles.bStatValPos}`}>
                  +{fmt(summary?.income_month || 0)}
                </span>
              </div>
              <div className={styles.bStat}>
                <span className={styles.bStatLabel}>Расход / мес</span>
                <span className={`${styles.bStatVal} ${styles.bStatValNeg}`}>
                  -{fmt(summary?.expense_month || 0)}
                </span>
              </div>
            </div>
            <div className={styles.balanceBtns}>
              <button className={styles.balanceBtn + ' ' + styles.balanceBtnPrimary} onClick={() => { setTopupAmount(''); setShowTopupModal(true); }}>
                <Plus size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                Пополнить
              </button>
              <button className={styles.balanceBtn + ' ' + styles.balanceBtnOutline} onClick={() => { setTransferAmount(''); setTransferPhone(''); setShowTransferModal(true); }}>
                <ChevronRight size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                Перевести
              </button>
              <button className={styles.balanceBtn + ' ' + styles.balanceBtnOutline} onClick={() => setShowQrModal(true)}>
                QR
              </button>
            </div>
          </div>

          {/* Stepan tip */}
          {tip && (
            <div className={`card ${styles.stepanCard}`}>
              <div className={styles.stepanHeader}>
                <div className={styles.stepanAvatarWrap}>
                  <div className={styles.stepanAvatar}><Bot size={28} color="#21A038" /></div>
                  <div className={styles.stepanPulse} />
                </div>
                <div>
                  <div className={styles.stepanName}>Степан</div>
                  <div className={styles.stepanSub}>Финансовый помощник</div>
                </div>
              </div>
              <p className={styles.stepanText}>{tip.text}</p>
              <div className={styles.limitInfo}>
                <span>Дней до поступления</span>
                <strong>{summary?.days_until_next_income}</strong>
              </div>
              <div className={`${styles.limitInfo} ${styles.limitInfoGreen}`}>
                <span>Дневной лимит</span>
                <strong>{fmt(summary?.daily_limit || 0)}</strong>
              </div>
              <div className={styles.stepanBtns}>
                <button className={styles.stepanBtnPrimary} onClick={() => setTipDismissed(true)}>
                  Понял, спасибо
                </button>
                <button className={styles.stepanBtnGhost} onClick={() => {
                  setLimitInput(String(summary?.daily_limit || ''));
                  setShowLimitModal(true);
                  setTimeout(() => limitInputRef.current?.focus(), 50);
                }}>
                  Настроить лимит
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className={`card ${styles.quickActions}`}>
          <div className={styles.qaTitle}>Быстрые действия</div>
          <div className={styles.qaGrid}>
            {[
              { icon: <Building2 size={24} color="#21A038" />, label: 'Копилка', path: '/savings' },
              { icon: <TrendingUp size={24} color="#21A038" />, label: 'Инвестиции', path: '/investments' },
              { icon: <Star size={24} color="#21A038" />, label: 'СберПрайм', path: '/benefits' },
              { icon: <Gift size={24} color="#21A038" />, label: 'Партнёры', path: '/benefits' },
            ].map((a) => (
              <button key={a.label} className={styles.qaBtn} onClick={() => navigate(a.path)}>
                <div className={styles.qaIconWrap}>
                  <span className={styles.qaIcon}>{a.icon}</span>
                </div>
                <span className={styles.qaLabel}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom: Chart + Transactions */}
        <div className={styles.bottomRow}>
          <div className={`card ${styles.chartCard}`}>
            <div className={styles.chartHeader}>
              <h3>Аналитика трат</h3>
              <span className={styles.chartPeriod}>За месяц</span>
            </div>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    isAnimationActive
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.noData}>Нет данных за этот месяц</div>
            )}
          </div>

          <div className={`card ${styles.txCard}`}>
            <div className={styles.chartHeader}>
              <h3>Последние операции</h3>
            </div>
            <div className={styles.txList}>
              {txs.map((tx) => (
                <div key={tx.id} className={styles.txRow}>
                  <span className={styles.txCat}>{CAT_NAMES[tx.category] || tx.category}</span>
                  <span className={styles.txDesc}>{tx.description || '—'}</span>
                  <span className={`${styles.txAmount} ${tx.amount > 0 ? styles.txPos : styles.txNeg}`}>
                    {tx.amount > 0 ? '+' : ''}{fmt(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className={`card ${styles.recsCard}`}>
          <h3 className={styles.recsTitle}>Рекомендации Степана</h3>
          <div className={styles.recsList}>
            {tips.slice(1, 4).map((t, i) => (
              <div
                key={t.id}
                className={styles.recItem}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <span className={styles.recIcon}><Lightbulb size={18} color="#21A038" /></span>
                <p className={styles.recText}>{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Топап */}
      {showTopupModal && (
        <div className="modal-overlay" onClick={() => setShowTopupModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {actionDone === 'topup' ? (
              <>
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                  <h2 className="modal-title">Счёт пополнен!</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                    +{Number(topupAmount).toLocaleString('ru-RU')} ₽ зачислено на карту
                  </p>
                </div>
                <button className="btn btn-primary" style={{ width: '100%', marginTop: 20 }} onClick={() => { setShowTopupModal(false); setActionDone(null); setSummary((prev) => prev ? { ...prev, balance: prev.balance + Number(topupAmount) } : prev); }}>
                  Готово
                </button>
              </>
            ) : (
              <>
                <h2 className="modal-title">Пополнение счёта</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
                  Текущий баланс: <strong style={{ color: 'var(--green)' }}>{fmt(summary?.balance || 0)}</strong>
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  {[500, 1000, 3000, 5000].map((v) => (
                    <button key={v} className={`btn btn-ghost btn-sm`} style={topupAmount === String(v) ? { borderColor: 'var(--green)', color: 'var(--green)' } : {}} onClick={() => setTopupAmount(String(v))}>
                      {v.toLocaleString('ru-RU')} ₽
                    </button>
                  ))}
                </div>
                <input className="input" type="number" placeholder="Или введите сумму, ₽" value={topupAmount} onChange={(e) => setTopupAmount(e.target.value)} />
                <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                  <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowTopupModal(false)}>Отмена</button>
                  <button className="btn btn-primary" style={{ flex: 1 }} disabled={!topupAmount || Number(topupAmount) <= 0} onClick={() => setActionDone('topup')}>
                    Пополнить
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Перевод */}
      {showTransferModal && (
        <div className="modal-overlay" onClick={() => setShowTransferModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {actionDone === 'transfer' ? (
              <>
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                  <h2 className="modal-title">Перевод отправлен!</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                    {Number(transferAmount).toLocaleString('ru-RU')} ₽ отправлено на {transferPhone}
                  </p>
                </div>
                <button className="btn btn-primary" style={{ width: '100%', marginTop: 20 }} onClick={() => { setShowTransferModal(false); setActionDone(null); setSummary((prev) => prev ? { ...prev, balance: prev.balance - Number(transferAmount) } : prev); }}>
                  Готово
                </button>
              </>
            ) : (
              <>
                <h2 className="modal-title">Перевод по номеру</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
                  Доступно: <strong style={{ color: 'var(--green)' }}>{fmt(summary?.balance || 0)}</strong>
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input className="input" type="tel" placeholder="Номер телефона получателя" value={transferPhone} onChange={(e) => setTransferPhone(e.target.value)} />
                  <input className="input" type="number" placeholder="Сумма, ₽" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                  <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowTransferModal(false)}>Отмена</button>
                  <button className="btn btn-primary" style={{ flex: 1 }} disabled={!transferAmount || !transferPhone || Number(transferAmount) <= 0} onClick={() => setActionDone('transfer')}>
                    Перевести
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* QR */}
      {showQrModal && (
        <div className="modal-overlay" onClick={() => setShowQrModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Мой QR-код</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24, textAlign: 'center' }}>
              Попросите отправителя отсканировать код для перевода на вашу карту
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <div style={{
                width: 180, height: 180,
                background: 'var(--bg)',
                border: '2px solid var(--border)',
                borderRadius: 16,
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 2,
                padding: 16,
              }}>
                {Array.from({ length: 49 }).map((_, i) => (
                  <div key={i} style={{
                    background: [0,1,2,3,4,5,6,7,13,14,20,21,27,28,34,35,41,42,43,44,45,46,48].includes(i % 49)
                      ? 'var(--green)' : 'transparent',
                    borderRadius: 2,
                  }} />
                ))}
              </div>
            </div>
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
              Карта СберСтарт · {summary ? `${fmt(summary.balance)}` : ''}
            </div>
            <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => setShowQrModal(false)}>Закрыть</button>
          </div>
        </div>
      )}

      {showLimitModal && (
        <div className="modal-overlay" onClick={() => setShowLimitModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Дневной лимит расходов</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
              Степан будет предупреждать, если ты приближаешься к лимиту. Текущий лимит:{' '}
              <strong style={{ color: 'var(--green)' }}>{fmt(summary?.daily_limit || 0)}</strong>
            </p>
            <input
              ref={limitInputRef}
              className="input"
              type="number"
              placeholder="Новый лимит, ₽"
              value={limitInput}
              onChange={(e) => setLimitInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && limitInput && (
                setSummary((prev) => prev ? { ...prev, daily_limit: Number(limitInput) } : prev),
                setShowLimitModal(false)
              )}
            />
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowLimitModal(false)}>
                Отмена
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={!limitInput || Number(limitInput) <= 0}
                onClick={() => {
                  setSummary((prev) => prev ? { ...prev, daily_limit: Number(limitInput) } : prev);
                  setShowLimitModal(false);
                }}
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
