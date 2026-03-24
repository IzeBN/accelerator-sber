import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  CreditCard,
  TrendingUp,
  Target,
  Star,
  Bot,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { AnimatedCounter } from '../components/AnimatedCounter';
import styles from './Landing.module.css';

const FAQ_ITEMS = [
  {
    q: 'Как подтвердить статус студента?',
    a: 'Через Госуслуги (быстро и автоматически) или загрузив справку из учебного заведения. Справка проверяется вручную в течение 24 часов.',
  },
  {
    q: 'Что будет после окончания учёбы?',
    a: 'Пакет СберСтарт автоматически сменится на стандартный, но все накопленные бонусы и инвестиции останутся с вами.',
  },
  {
    q: 'Могут ли родители видеть мои траты?',
    a: 'Нет. Банк не передаёт информацию о тратах студента родителям. Это личный счёт — только вы видите детализацию.',
  },
];

const STEPS = [
  { n: '1', title: 'Подтверди статус', desc: 'Через Госуслуги или справку из учебного заведения' },
  { n: '2', title: 'Активируй пакет', desc: 'Получи 500 бонусов и кэшбэк 5% на три месяца' },
  { n: '3', title: 'Советы от Степана', desc: 'Ежедневные персонализированные советы по бюджету' },
  { n: '4', title: 'Копи и инвестируй', desc: 'Начни с малых сумм — от 100 рублей в неделю' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  // IntersectionObserver for steps animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          }
        });
      },
      { threshold: 0.2 }
    );

    stepRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo} onClick={() => navigate('/')}>
            <span className={styles.logoIcon}><GraduationCap size={24} color="#21A038" /></span>
            <span className={styles.logoText}>СберСтарт</span>
          </div>
          <div className={styles.headerBtns}>
            <button className={styles.headerBtnOutline}>Скачать приложение</button>
            <button className={styles.headerBtnPrimary} onClick={() => navigate('/login')}>
              Уже клиент
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />

        {/* Floating cards */}
        <div className={styles.floatingElements}>
          <div className={styles.floatCard + ' ' + styles.floatCard1}>
            <span className={styles.floatCardIcon}><CreditCard size={22} color="#21A038" /></span>
            <div>
              <div className={styles.floatCardText}>Кэшбэк начислен</div>
              <div className={styles.floatCardSub}>+248 бонусов</div>
            </div>
          </div>
          <div className={styles.floatCard + ' ' + styles.floatCard2}>
            <span className={styles.floatCardIcon}><TrendingUp size={22} color="#21A038" /></span>
            <div>
              <div className={styles.floatCardText}>Портфель растёт</div>
              <div className={styles.floatCardSub}>+6.2% за год</div>
            </div>
          </div>
          <div className={styles.floatCard + ' ' + styles.floatCard3}>
            <span className={styles.floatCardIcon}><Target size={22} color="#21A038" /></span>
            <div>
              <div className={styles.floatCardText}>Цель: Ноутбук</div>
              <div className={styles.floatCardSub}>73% выполнено</div>
            </div>
          </div>
        </div>

        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            Специально для студентов
          </div>

          <h1 className={styles.heroTitle}>
            СберСтарт —<br />
            твой первый<br />
            <span className={styles.heroGreen}>финансовый наставник</span>
          </h1>

          <p className={styles.heroSub}>
            Карта, льготы и умный помощник Степан, который научит
            копить и инвестировать с 100 рублей
          </p>

          <button className={styles.heroCta} onClick={() => navigate('/login')}>
            Подтвердить статус и забрать бонусы
            <span className={styles.heroCtaArrow}><ChevronRight size={18} /></span>
          </button>

          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statNum}>
                <AnimatedCounter end={500} suffix=" " />
              </span>
              <span className={styles.statLabel}>бонусов при регистрации</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>
                <AnimatedCounter end={5} suffix="%" />
              </span>
              <span className={styles.statLabel}>кэшбэк на 3 месяца</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>
                <AnimatedCounter end={100} suffix="₽" />
              </span>
              <span className={styles.statLabel}>старт инвестиций</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionTag}>✦ Преимущества</div>
          <h2 className={styles.sectionTitle}>Что ты получишь</h2>
          <p className={styles.sectionSub}>Всё что нужно студенту — в одном приложении</p>
          <div className={styles.benefitsGrid}>
            <div className={styles.benefitCard}>
              <div className={styles.benefitIconWrap}><CreditCard size={28} color="#21A038" /></div>
              <h3>5% кэшбэка на студенческие траты</h3>
              <p>Кафе, транспорт, столовые — повышенный кэшбэк на всё, что нужно студенту каждый день</p>
            </div>
            <div className={styles.benefitCard}>
              <div className={styles.benefitIconWrap}><Star size={28} color="#21A038" /></div>
              <h3>СберПрайм за 1 рубль в первый месяц</h3>
              <p>Музыка, кино, доставка — вся экосистема Сбера по цене одного рубля</p>
            </div>
            <div className={styles.benefitCard}>
              <div className={styles.benefitIconWrap}><Bot size={28} color="#21A038" /></div>
              <h3>Умный помощник Степан</h3>
              <p>Личный эксперт, который поможет не уйти в минус и накопить на мечту</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className={`${styles.section} ${styles.sectionGray}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionTag}>✦ Как начать</div>
          <h2 className={styles.sectionTitle}>Как это работает</h2>
          <p className={styles.sectionSub}>Четыре простых шага до финансовой независимости</p>
          <div className={styles.steps} ref={stepsRef}>
            <div className={styles.stepsLine} />
            {STEPS.map((step, i) => (
              <div
                key={step.n}
                className={styles.step}
                ref={(el) => { stepRefs.current[i] = el; }}
                style={{ transitionDelay: `${i * 0.12}s` }}
              >
                <div className={styles.stepNum}>{step.n}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionTag}>✦ Сравнение</div>
          <h2 className={styles.sectionTitle}>Почему СберСтарт лучше</h2>
          <p className={styles.sectionSub}>Единственный банковский продукт с персональным финансовым наставником</p>
          <div className={styles.compareTable}>
            <div className={`${styles.compareCol} ${styles.compareColHighlight}`}>
              <div className={styles.compareHeader}>
                <GraduationCap size={18} color="#21A038" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> СберСтарт
              </div>
              <ul className={styles.compareList}>
                <li><CheckCircle2 size={14} color="#21A038" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> Умный наставник Степан</li>
                <li><CheckCircle2 size={14} color="#21A038" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> Финансовая грамотность</li>
                <li><CheckCircle2 size={14} color="#21A038" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> Инвестиции от 100 ₽</li>
                <li><CheckCircle2 size={14} color="#21A038" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> Вся экосистема Сбера</li>
                <li><CheckCircle2 size={14} color="#21A038" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> Кэшбэк 5%</li>
              </ul>
            </div>
            <div className={styles.compareCol}>
              <div className={styles.compareHeader}>
                <span>🟡</span> Т-Банк
              </div>
              <ul className={styles.compareList}>
                <li><CheckCircle2 size={14} color="#21A038" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> Кэшбэк</li>
                <li><CheckCircle2 size={14} color="#21A038" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> Скидки</li>
                <li>❌ Нет наставника</li>
                <li>❌ Нет обучения</li>
                <li>❌ Нет копилки</li>
              </ul>
            </div>
            <div className={styles.compareCol}>
              <div className={styles.compareHeader}>
                <span>🔴</span> Альфа-Банк
              </div>
              <ul className={styles.compareList}>
                <li><CheckCircle2 size={14} color="#21A038" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> Бесплатное обслуживание</li>
                <li>❌ Нет наставника</li>
                <li>❌ Нет обучения</li>
                <li>❌ Нет инвестиций</li>
                <li>❌ Нет экосистемы</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={`${styles.section} ${styles.sectionGray}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionTag}>✦ FAQ</div>
          <h2 className={styles.sectionTitle}>Часто задаваемые вопросы</h2>
          <p className={styles.sectionSub}>Всё что хотели узнать, но боялись спросить</p>
          <div className={styles.faq}>
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                className={`${styles.faqItem} ${openFaq === i ? styles.faqItemOpen : ''}`}
              >
                <button
                  className={styles.faqQ}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span>{item.q}</span>
                  <span className={`${styles.faqArrow} ${openFaq === i ? styles.faqArrowOpen : ''}`}>
                    <ChevronDown size={16} />
                  </span>
                </button>
                {openFaq === i && <div className={styles.faqA}>{item.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>Готов начать?</h2>
          <p className={styles.ctaSub}>Подтверди студенческий статус и получи 500 бонусов прямо сейчас</p>
          <button className={styles.heroCta} onClick={() => navigate('/login')}>
            Начать бесплатно
            <span className={styles.heroCtaArrow}><ChevronRight size={18} /></span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.sectionInner}>
          <p>© 2026 СберСтарт · ПАО Сбербанк · Правила · Публичная оферта · Поддержка</p>
        </div>
      </footer>
    </div>
  );
}
