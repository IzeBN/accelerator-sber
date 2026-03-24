import { useEffect, useState } from 'react';
import { Lock, Users } from 'lucide-react';
import { getChildren, getChildSummary, transferToChild } from '../api/client';
import { User, ChildSummary } from '../types';
import { PageTransition } from '../components/PageTransition';
import styles from './Parent.module.css';

function fmt(n: number) { return n.toLocaleString('ru-RU', { maximumFractionDigits: 0 }) + ' ₽'; }

export default function Parent() {
  const [children, setChildren] = useState<User[]>([]);
  const [summaries, setSummaries] = useState<Record<number, ChildSummary>>({});
  const [loading, setLoading] = useState(true);
  const [transferModal, setTransferModal] = useState<User | null>(null);
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getChildren().then(async (kids: User[]) => {
      setChildren(kids);
      const sums: Record<number, ChildSummary> = {};
      await Promise.all(kids.map(async (k) => {
        sums[k.id] = await getChildSummary(k.id);
      }));
      setSummaries(sums);
    }).finally(() => setLoading(false));
  }, []);

  const handleTransfer = async () => {
    if (!transferModal || !amount) return;
    setSending(true);
    try {
      await transferToChild(transferModal.id, Number(amount), comment || undefined);
      const updated = await getChildSummary(transferModal.id);
      setSummaries((prev) => ({ ...prev, [transferModal.id]: updated }));
      setTransferModal(null);
      setAmount('');
      setComment('');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      alert(err?.response?.data?.detail || 'Ошибка');
    }
    setSending(false);
  };

  if (loading) return <div className="spinner" />;

  return (
    <PageTransition>
    <div className={styles.page}>
      <h1 className={styles.title}>Переводы студенту</h1>

      <div className={`card ${styles.disclaimer}`}>
        <span className={styles.disclaimerIcon}><Lock size={22} color="#21A038" /></span>
        <div>
          <div className={styles.disclaimerTitle}>Конфиденциальность гарантирована</div>
          <p className={styles.disclaimerText}>
            Вы переводите самостоятельному студенту. Банк не передаёт информацию о его тратах
            и не предоставляет доступ к выписке. Это личный счёт вашего ребёнка.
          </p>
        </div>
      </div>

      <div className={styles.childrenList}>
        {children.map((child) => {
          const sum = summaries[child.id];
          return (
            <div key={child.id} className="card">
              <div className={styles.childHeader}>
                <div className={styles.childAvatar}>{child.full_name[0]}</div>
                <div>
                  <div className={styles.childName}>{child.full_name}</div>
                  <div className={styles.childMeta}>{child.university || 'Студент'}</div>
                </div>
                <button className="btn btn-primary" onClick={() => { setTransferModal(child); setAmount(''); setComment(''); }}>
                  Перевести
                </button>
              </div>

              {sum && (
                <div className={styles.childStats}>
                  <div className={styles.childStat}>
                    <span className={styles.childStatLabel}>Баланс</span>
                    <span className={styles.childStatVal}>{fmt(sum.balance)}</span>
                  </div>
                  <div className={styles.childStat}>
                    <span className={styles.childStatLabel}>Расходы за неделю</span>
                    <span className={styles.childStatVal}>{fmt(sum.expense_week)}</span>
                  </div>
                  <div className={styles.childStat}>
                    <span className={styles.childStatLabel}>Расходы за месяц</span>
                    <span className={styles.childStatVal}>{fmt(sum.expense_month)}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {children.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
              <Users size={48} color="#21A038" />
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>Привязанные студенты не найдены</p>
          </div>
        )}
      </div>

      {transferModal && (
        <div className="modal-overlay" onClick={() => setTransferModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalChild}>
              <div className={styles.childAvatar}>{transferModal.full_name[0]}</div>
              <div>
                <div className={styles.childName}>{transferModal.full_name}</div>
                <div className={styles.childMeta}>Баланс: {fmt(summaries[transferModal.id]?.balance || 0)}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: '20px 0' }}>
              <input className="input" type="number" placeholder="Сумма перевода, ₽" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <input className="input" placeholder="Комментарий (необязательно)" value={comment} onChange={(e) => setComment(e.target.value)} />
            </div>
            <div className={styles.transferNote}>
              <Lock size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} color="#21A038" />
              Банк не передаёт информацию о тратах студента
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setTransferModal(null)}>Отмена</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleTransfer} disabled={sending || !amount}>
                {sending ? 'Отправляем...' : 'Перевести'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </PageTransition>
  );
}
