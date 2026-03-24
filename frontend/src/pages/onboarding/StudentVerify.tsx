import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Building2,
  Paperclip,
  Clock,
  CheckCircle2,
  Gift,
} from 'lucide-react';
import { verifyStudent } from '../../api/client';
import styles from './Onboarding.module.css';

const OPTIONS = [
  {
    id: 'gosuslugi',
    icon: <Building2 size={24} color="#21A038" />,
    title: 'Через Госуслуги',
    desc: 'Быстро и автоматически',
    badge: 'Рекомендуется',
  },
  {
    id: 'upload',
    icon: <Paperclip size={24} color="#21A038" />,
    title: 'Загрузить справку',
    desc: 'Ручная проверка в течение 24 часов',
    badge: null,
  },
  {
    id: 'later',
    icon: <Clock size={24} color="#21A038" />,
    title: 'Подтвердить позже',
    desc: 'Ограниченный функционал до подтверждения',
    badge: null,
  },
];

export default function StudentVerify() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setLoading(true);
    try {
      if (selected === 'upload') {
        await verifyStudent('student_id', 'https://example.com/demo-doc.jpg');
      }
    } catch {}
    setLoading(false);
    navigate('/onboarding/package');
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.progress}><div className={styles.progressFill} style={{ width: '50%' }} /></div>
        <div className={styles.stepLabel}>Шаг 2 из 4</div>
        <div className={styles.avatar}><ClipboardList size={48} color="#21A038" /></div>
        <h1 className={styles.title}>Подтверждение статуса студента</h1>
        <p className={styles.desc}>Выбери удобный способ подтверждения</p>

        <div className={styles.options}>
          {OPTIONS.map((opt) => (
            <button
              key={opt.id}
              className={`${styles.optionCard} ${selected === opt.id ? styles.optionCardActive : ''}`}
              onClick={() => setSelected(opt.id)}
            >
              <span className={styles.optionIcon}>{opt.icon}</span>
              <div className={styles.optionInfo}>
                <div className={styles.optionTitle}>
                  {opt.title}
                  {opt.badge && <span className={`badge badge-green ${styles.optionBadge}`}>{opt.badge}</span>}
                </div>
                <div className={styles.optionDesc}>{opt.desc}</div>
              </div>
              <span className={styles.optionCheck}>
                {selected === opt.id
                  ? <CheckCircle2 size={18} color="#21A038" />
                  : '○'
                }
              </span>
            </button>
          ))}
        </div>

        <div className={styles.bonusNote}>
          <Gift size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} color="#21A038" />
          После подтверждения ты получишь <strong>500 бонусов</strong> и повышенный кэшбэк 5% на три месяца
        </div>

        <button
          className="btn btn-primary btn-lg"
          style={{ width: '100%' }}
          onClick={handleContinue}
          disabled={!selected || loading}
        >
          {loading ? 'Отправляем...' : 'Продолжить'}
        </button>
      </div>
    </div>
  );
}
