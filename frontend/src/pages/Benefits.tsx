import { useEffect, useState } from 'react';
import {
  CreditCard,
  Star,
  Bus,
  GraduationCap,
  Home,
  Pill,
  Shield,
  TrendingUp,
  Crown,
  Gift,
  Film,
  Music,
  ShoppingCart,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import { getBenefits } from '../api/client';
import { Benefit } from '../types';
import { PageTransition } from '../components/PageTransition';
import styles from './Benefits.module.css';

const CAT_ICON_MAP: Record<string, React.ReactNode> = {
  cashback: <CreditCard size={22} color="#21A038" />,
  subscription: <Star size={22} color="#21A038" />,
  transport: <Bus size={22} color="#21A038" />,
  scholarship: <GraduationCap size={22} color="#21A038" />,
  mortgage: <Home size={22} color="#21A038" />,
  health: <Pill size={22} color="#21A038" />,
  insurance: <Shield size={22} color="#21A038" />,
  investment: <TrendingUp size={22} color="#21A038" />,
  service: <Crown size={22} color="#21A038" />,
};

const PRIME_FEATURES = [
  { key: 'Okko', icon: <Film size={14} color="#21A038" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />, label: 'Okko' },
  { key: 'СберЗвук', icon: <Music size={14} color="#21A038" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />, label: 'СберЗвук' },
  { key: 'СберМаркет', icon: <ShoppingCart size={14} color="#21A038" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />, label: 'СберМаркет' },
  { key: 'Литрес', icon: <BookOpen size={14} color="#21A038" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />, label: 'Литрес' },
];

export default function Benefits() {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPrimeModal, setShowPrimeModal] = useState(false);
  const [primeActive, setPrimeActive] = useState(true);
  const [showBonusModal, setShowBonusModal] = useState(false);

  useEffect(() => {
    getBenefits().then(setBenefits).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  return (
    <PageTransition>
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Льготы и бонусы</h1>
      </div>

      {/* Active cashback countdown */}
      <div className={`card ${styles.cashbackBanner}`}>
        <div className={styles.bannerLeft}>
          <span className={styles.bannerIcon}><CreditCard size={24} color="#21A038" /></span>
          <div>
            <div className={styles.bannerTitle}>Повышенный кэшбэк 5% активен</div>
            <div className={styles.bannerSub}>Активен ещё 74 дня · Кафе, транспорт, столовые</div>
          </div>
        </div>
        <span className="badge badge-green">Активен</span>
      </div>

      {/* SberPrime */}
      <div className="card">
        <div className={styles.primeHeader}>
          <span className={styles.primeIcon}><Star size={24} color="#21A038" /></span>
          <div style={{ flex: 1 }}>
            <div className={styles.primeTitle}>СберПрайм Студент</div>
            <div className={styles.primeSub}>Статус: активен до 15.12.2026 · 99 ₽/мес</div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => setShowPrimeModal(true)}>Управление</button>
        </div>
        <div className={styles.primeFeatures}>
          {PRIME_FEATURES.map((f) => (
            <span key={f.key} className={styles.primeFeature}>
              {f.icon}{f.label}
            </span>
          ))}
        </div>
      </div>

      {/* Bonuses */}
      <div className="card">
        <div className={styles.bonusHeader}>
          <div>
            <div className={styles.bonusTitle}>Бонусы Спасибо</div>
            <div className={styles.bonusCount}>1 240 бонусов</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className={styles.bonusExpire}>500 бонусов сгорят 30.04.2027</div>
            <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={() => setShowBonusModal(true)}>Потратить</button>
          </div>
        </div>
      </div>

      {/* Benefits list */}
      <div>
        <h2 className={styles.sectionTitle}>Все льготы</h2>
        <div className={styles.benefitsList}>
          {benefits.map((b) => (
            <div key={b.id} className={`card ${styles.benefitCard}`}>
              <div className={styles.benefitIcon}>
                {CAT_ICON_MAP[b.category] ?? <Gift size={22} color="#21A038" />}
              </div>
              <div className={styles.benefitInfo}>
                <div className={styles.benefitTitle}>{b.title}</div>
                <div className={styles.benefitDesc}>{b.description}</div>
              </div>
              <div className={styles.benefitActions}>
                <span className="badge badge-green">{b.eligible_package}</span>
                {b.link && (
                  <a href={b.link} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                    Подробнее <ChevronRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

      {/* Управление подпиской */}
      {showPrimeModal && (
        <div className="modal-overlay" onClick={() => setShowPrimeModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">СберПрайм Студент</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', background: 'var(--bg)', borderRadius: 14, border: '1px solid var(--border)', marginBottom: 20 }}>
              <Star size={28} color="#21A038" />
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
                  {primeActive ? 'Подписка активна' : 'Подписка отключена'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {primeActive ? 'Активна до 15.12.2026 · 99 ₽/мес' : 'Подключить за 99 ₽/мес'}
                </div>
              </div>
              <span className={`badge ${primeActive ? 'badge-green' : 'badge-gray'}`} style={{ marginLeft: 'auto' }}>
                {primeActive ? 'Активна' : 'Неактивна'}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {PRIME_FEATURES.map((f) => (
                <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text-primary)' }}>
                  {f.icon} {f.label}
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: primeActive ? '#34C759' : 'var(--text-muted)' }}>
                    {primeActive ? 'Доступно' : 'Недоступно'}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowPrimeModal(false)}>
                Закрыть
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1, background: primeActive ? 'rgba(239,68,68,0.15)' : undefined, color: primeActive ? '#ef4444' : undefined, border: primeActive ? '1px solid rgba(239,68,68,0.3)' : undefined }}
                onClick={() => { setPrimeActive((v) => !v); setShowPrimeModal(false); }}
              >
                {primeActive ? 'Отключить подписку' : 'Подключить подписку'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Потратить бонусы */}
      {showBonusModal && (
        <div className="modal-overlay" onClick={() => setShowBonusModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Бонусы Спасибо</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
              Доступно: <strong style={{ color: 'var(--green)' }}>1 240 бонусов</strong>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {[
                { label: 'Оплата покупки бонусами', desc: 'До 30% стоимости товара', value: 372 },
                { label: 'Перевод в рубли', desc: '1 бонус = 1 рубль', value: 1240 },
                { label: 'Благотворительность', desc: 'Подарить бонусы на доброе дело', value: 1240 },
              ].map((opt) => (
                <button
                  key={opt.label}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 12, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                  onClick={() => setShowBonusModal(false)}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--green)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>{opt.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{opt.desc}</div>
                  </div>
                  <span className="badge badge-green">{opt.value} бон.</span>
                </button>
              ))}
            </div>
            <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => setShowBonusModal(false)}>
              Закрыть
            </button>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
