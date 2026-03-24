import { useNavigate } from 'react-router-dom';
import { Bot, Lightbulb, Target, TrendingUp } from 'lucide-react';
import styles from './Onboarding.module.css';

export default function MeetStepan() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.progress}><div className={styles.progressFill} style={{ width: '100%' }} /></div>
        <div className={styles.stepLabel}>Шаг 4 из 4</div>
        <div className={styles.avatarLarge}><Bot size={64} color="#21A038" /></div>
        <h1 className={styles.title}>Знакомься — это Степан!</h1>

        <div className={styles.chatBubble}>
          <div className={styles.chatText}>
            Привет! Я Степан, твой финансовый помощник.<br /><br />
            Я помогу тебе не уходить в минус и накопить на мечту.<br /><br />
            Давай настроим бюджет, чтобы стипендии всегда хватало?
          </div>
        </div>

        <div className={styles.stepanFeatures}>
          <div className={styles.stepanFeature}>
            <span><Lightbulb size={18} color="#21A038" style={{ display: 'inline', verticalAlign: 'middle' }} /></span>
            &nbsp;Ежедневные советы по бюджету
          </div>
          <div className={styles.stepanFeature}>
            <span><Target size={18} color="#21A038" style={{ display: 'inline', verticalAlign: 'middle' }} /></span>
            &nbsp;Помощь с накоплениями и целями
          </div>
          <div className={styles.stepanFeature}>
            <span><TrendingUp size={18} color="#21A038" style={{ display: 'inline', verticalAlign: 'middle' }} /></span>
            &nbsp;Введение в мир инвестиций
          </div>
        </div>

        <button
          className="btn btn-primary btn-lg"
          style={{ width: '100%' }}
          onClick={() => navigate('/survey')}
        >
          Настроить бюджет
        </button>
      </div>
    </div>
  );
}
