import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  Coffee,
  Bus,
  Laptop,
  Star,
  Check,
  PartyPopper,
} from 'lucide-react';
import { setPackage } from '../../api/client';
import styles from './Onboarding.module.css';

const PACKAGES = [
  { id: 'cafe', icon: <Coffee size={28} color="#21A038" />, title: 'Я люблю кофе и встречи', desc: 'Повышенный кэшбэк на кафе и столовые' },
  { id: 'transport', icon: <Bus size={28} color="#21A038" />, title: 'Я на транспорте', desc: 'Кэшбэк на проезд, такси и каршеринг' },
  { id: 'online', icon: <Laptop size={28} color="#21A038" />, title: 'Я в онлайне', desc: 'Скидки на подписки и стриминги' },
  { id: 'standard', icon: <Star size={28} color="#21A038" />, title: 'Универсальный', desc: 'Сбалансированный набор категорий' },
];

export default function PackageSelect() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await setPackage('standard');
    } catch {}
    setLoading(false);
    navigate('/onboarding/stepan');
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.progress}><div className={styles.progressFill} style={{ width: '75%' }} /></div>
        <div className={styles.stepLabel}>Шаг 3 из 4</div>
        <div className={styles.avatar}><Target size={48} color="#21A038" /></div>
        <h1 className={styles.title}>Выбери стартовый пакет</h1>
        <p className={styles.desc}>На что тратишь чаще всего? Настроим повышенный кэшбэк</p>

        <div className={styles.packageGrid}>
          {PACKAGES.map((pkg) => (
            <button
              key={pkg.id}
              className={`${styles.packageCard} ${selected === pkg.id ? styles.packageCardActive : ''}`}
              onClick={() => setSelected(pkg.id)}
            >
              <span className={styles.packageIcon}>{pkg.icon}</span>
              <div className={styles.packageTitle}>{pkg.title}</div>
              <div className={styles.packageDesc}>{pkg.desc}</div>
              {selected === pkg.id && (
                <div className={styles.packageCheck}>
                  <Check size={16} color="#21A038" />
                </div>
              )}
            </button>
          ))}
        </div>

        {selected && (
          <div className={styles.bonusNote}>
            <PartyPopper size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} color="#21A038" />
            Отлично! На первые 3 месяца ты получаешь <strong>5% кэшбэка</strong> на выбранные категории
          </div>
        )}

        <button
          className="btn btn-primary btn-lg"
          style={{ width: '100%' }}
          onClick={handleSelect}
          disabled={!selected || loading}
        >
          {loading ? 'Сохраняем...' : 'Выбрать'}
        </button>
      </div>
    </div>
  );
}
