import { useNavigate } from 'react-router-dom';
import { GraduationCap, CheckCircle2 } from 'lucide-react';
import styles from './Onboarding.module.css';

export default function Welcome() {
  const navigate = useNavigate();
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.progress}><div className={styles.progressFill} style={{ width: '25%' }} /></div>
        <div className={styles.stepLabel}>Шаг 1 из 4</div>
        <div className={styles.avatar}><GraduationCap size={48} color="#21A038" /></div>
        <h1 className={styles.title}>СберСтарт приветствует тебя!</h1>
        <p className={styles.desc}>
          Сейчас мы поможем настроить всё за 2 минуты.<br />
          Получи карту, льготы и умного помощника Степана.
        </p>
        <div className={styles.perks}>
          <div className={styles.perk}>
            <span><CheckCircle2 size={16} color="#21A038" style={{ display: 'inline', verticalAlign: 'middle' }} /></span>
            &nbsp;500 бонусов при регистрации
          </div>
          <div className={styles.perk}>
            <span><CheckCircle2 size={16} color="#21A038" style={{ display: 'inline', verticalAlign: 'middle' }} /></span>
            &nbsp;Кэшбэк 5% на 3 месяца
          </div>
          <div className={styles.perk}>
            <span><CheckCircle2 size={16} color="#21A038" style={{ display: 'inline', verticalAlign: 'middle' }} /></span>
            &nbsp;Умный помощник Степан
          </div>
        </div>
        <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={() => navigate('/onboarding/verify')}>
          Начать
        </button>
      </div>
    </div>
  );
}
