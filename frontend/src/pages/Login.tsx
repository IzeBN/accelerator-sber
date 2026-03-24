import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  Settings,
  CreditCard,
  Bot,
  TrendingUp,
  Gift,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { login } from '../api/client';
import { useStore } from '../store';
import styles from './Login.module.css';

const DEMO_USERS = [
  { email: 'ivan@student.ru', role: 'student', label: 'Студент', icon: <GraduationCap size={20} color="#21A038" />, desc: 'Иван Петров · НИУ ВШЭ' },
  { email: 'maria@parent.ru', role: 'parent', label: 'Родитель', icon: <Users size={20} color="#21A038" />, desc: 'Мария Петрова' },
  { email: 'admin@accelerator-sber.ru', role: 'admin', label: 'Администратор', icon: <Settings size={20} color="#21A038" />, desc: 'Панель управления' },
];

const FEATURES = [
  { icon: <CreditCard size={18} color="#21A038" />, text: 'Кэшбэк 5% на студенческие покупки' },
  { icon: <Bot size={18} color="#21A038" />, text: 'Умный помощник Степан всегда рядом' },
  { icon: <TrendingUp size={18} color="#21A038" />, text: 'Инвестиции с 100 ₽ — начни сейчас' },
  { icon: <Gift size={18} color="#21A038" />, text: 'СберПрайм за 1 рубль в первый месяц' },
];

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useStore();
  const [email, setEmail] = useState('ivan@student.ru');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await login(email, 'student');
      setAuth(data.user, data.access_token);
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else if (data.user.role === 'parent') {
        navigate('/parent');
      } else if (!data.user.onboarding_done) {
        navigate('/onboarding/welcome');
      } else if (!data.user.survey_done) {
        navigate('/survey');
      } else {
        navigate('/dashboard');
      }
    } catch {
      setError('Пользователь не найден. Используйте демо-аккаунты ниже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Left decorative panel */}
      <div className={styles.leftPanel}>
        <div className={styles.leftGlow} />
        <div className={styles.leftGlow2} />

        <div className={styles.leftContent}>
          <div className={styles.leftLogo}>
            <div className={styles.leftLogoIcon}><GraduationCap size={32} color="#21A038" /></div>
            <span className={styles.leftLogoText}>СберСтарт</span>
          </div>

          <h2 className={styles.leftTitle}>
            Финансовый старт<br />
            <span className={styles.leftTitleGreen}>для студентов</span>
          </h2>

          <p className={styles.leftSub}>
            Первый банковский продукт с персональным AI-наставником,
            который научит управлять деньгами с умом
          </p>

          <div className={styles.leftFeatures}>
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={styles.leftFeature}
                style={{ animationDelay: `${0.1 + i * 0.08}s` }}
              >
                <div className={styles.leftFeatureIcon}>{f.icon}</div>
                <span className={styles.leftFeatureText}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.leftFloatStat}>
          <div className={styles.leftFloatStatNum}>47 238</div>
          <div className={styles.leftFloatStatLabel}>студентов уже с нами</div>
        </div>
      </div>

      {/* Right form panel */}
      <div className={styles.rightPanel}>
        <div className={styles.formWrap}>
          <h1 className={styles.formTitle}>Добро пожаловать</h1>
          <p className={styles.formSub}>Выберите демо-аккаунт или введите email</p>

          <div className={styles.demoLabel}>Быстрый вход</div>
          <div className={styles.demoCards}>
            {DEMO_USERS.map((u) => (
              <button
                key={u.email}
                className={`${styles.demoCard} ${email === u.email ? styles.demoCardActive : ''}`}
                onClick={() => setEmail(u.email)}
              >
                <span className={styles.demoIcon}>{u.icon}</span>
                <div>
                  <div className={styles.demoCardLabel}>{u.label}</div>
                  <div className={styles.demoCardDesc}>{u.desc}</div>
                </div>
              </button>
            ))}
          </div>

          <div className={styles.inputSection}>
            <label className={styles.inputLabel}>Email</label>
            <input
              className={styles.loginInput}
              type="email"
              placeholder="you@example.ru"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button
            className={styles.submitBtn}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Входим...' : (
              <>Войти в СберСтарт <ChevronRight size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /></>
            )}
          </button>

          <button className={styles.backBtn} onClick={() => navigate('/')}>
            <ChevronLeft size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            Вернуться на главную
          </button>
        </div>
      </div>
    </div>
  );
}
