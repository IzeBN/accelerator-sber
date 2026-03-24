import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Rocket,
  HelpCircle,
  Meh,
  Check,
  ChevronLeft,
  ChevronRight,
  PartyPopper,
} from 'lucide-react';
import { saveSurveyAnswer, completeSurvey, completeOnboarding } from '../../api/client';
import { useStore } from '../../store';
import styles from './SurveyFlow.module.css';

const INCOME_SOURCES = ['Стипендия', 'Подработка', 'Переводы от родителей', 'Все вместе'];
const EXPENSE_CATS = ['Еда вне дома', 'Транспорт', 'Развлечения', 'Одежда и обувь', 'Учёба и книги', 'Связь и интернет', 'Другое'];
const GOAL_PRESETS = ['Новые наушники', 'Поездка на выходные', 'Подушка безопасности', 'Не знаю, но хочу начать копить'];

export default function SurveyFlow() {
  const navigate = useNavigate();
  const { updateUser, user } = useStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [income, setIncome] = useState<string[]>([]);
  const [spending, setSpending] = useState(15000);
  const [expenseCats, setExpenseCats] = useState<string[]>([]);
  const [saveIntent, setSaveIntent] = useState('');
  const [goal, setGoal] = useState('');

  const toggleIncome = (v: string) =>
    setIncome((prev) => prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]);

  const toggleCat = (v: string) =>
    setExpenseCats((prev) => prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]);

  const saveAndNext = async () => {
    setLoading(true);
    try {
      const answers: Record<number, { question: string; answer: unknown }> = {
        1: { question: 'Откуда у тебя деньги?', answer: { values: income } },
        2: { question: 'Сколько примерно ты тратишь в месяц?', answer: { value: spending } },
        3: { question: 'На что тратишь чаще всего?', answer: { values: expenseCats } },
        4: { question: 'Хочешь ли ты пробовать копить или инвестировать?', answer: { value: saveIntent } },
        5: { question: 'Какая у тебя цель?', answer: { value: goal } },
      };
      await saveSurveyAnswer(step, answers[step].question, answers[step].answer);

      if (step === 5) {
        await completeSurvey();
        await completeOnboarding();
        if (user) updateUser({ ...user, survey_done: true, onboarding_done: true });
        navigate('/dashboard');
        return;
      }
      setStep((s) => s + 1);
    } catch {}
    setLoading(false);
  };

  const pct = (step / 5) * 100;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.stepIcon}><Bot size={28} color="#21A038" /></div>
          <div>
            <div className={styles.stepLabel}>Степан настраивает твой профиль</div>
            <div className={styles.stepNum}>Вопрос {step} из 5</div>
          </div>
        </div>
        <div className={styles.progress}><div className={styles.progressFill} style={{ width: `${pct}%` }} /></div>

        {step === 1 && (
          <div className={styles.step}>
            <h2 className={styles.question}>Откуда у тебя деньги?</h2>
            <p className={styles.hint}>Можно выбрать несколько вариантов</p>
            <div className={styles.chips}>
              {INCOME_SOURCES.map((v) => (
                <button
                  key={v}
                  className={`${styles.chip} ${income.includes(v) ? styles.chipActive : ''}`}
                  onClick={() => toggleIncome(v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.step}>
            <h2 className={styles.question}>Сколько примерно ты тратишь в месяц?</h2>
            <div className={styles.sliderValue}>{spending.toLocaleString('ru-RU')} ₽</div>
            <input
              type="range"
              min={0}
              max={50000}
              step={500}
              value={spending}
              onChange={(e) => setSpending(Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderLabels}>
              <span>0 ₽</span>
              <span>50 000+ ₽</span>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={styles.step}>
            <h2 className={styles.question}>На что тратишь чаще всего?</h2>
            <p className={styles.hint}>Выбери все подходящие</p>
            <div className={styles.checkList}>
              {EXPENSE_CATS.map((v) => (
                <button
                  key={v}
                  className={`${styles.checkItem} ${expenseCats.includes(v) ? styles.checkItemActive : ''}`}
                  onClick={() => toggleCat(v)}
                >
                  <span className={styles.checkBox}>
                    {expenseCats.includes(v) ? <Check size={14} color="#21A038" /> : ''}
                  </span>
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className={styles.step}>
            <h2 className={styles.question}>Хочешь ли ты пробовать копить или инвестировать?</h2>
            <div className={styles.radioGroup}>
              {[
                { v: 'Да, научи меня', icon: <Rocket size={20} color="#21A038" />, desc: 'Готов(-а) начать прямо сейчас' },
                { v: 'Пока нет, но хочу понять, как', icon: <HelpCircle size={20} color="#21A038" />, desc: 'Хочу разобраться сначала' },
                { v: 'Нет, мне это неинтересно', icon: <Meh size={20} color="#21A038" />, desc: 'Пока не актуально' },
              ].map((opt) => (
                <button
                  key={opt.v}
                  className={`${styles.radioCard} ${saveIntent === opt.v ? styles.radioCardActive : ''}`}
                  onClick={() => setSaveIntent(opt.v)}
                >
                  <span className={styles.radioIcon}>{opt.icon}</span>
                  <div>
                    <div className={styles.radioTitle}>{opt.v}</div>
                    <div className={styles.radioDesc}>{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className={styles.step}>
            <h2 className={styles.question}>Какая у тебя цель?</h2>
            <p className={styles.hint}>Выбери из пресетов или напиши свою</p>
            <div className={styles.chips} style={{ marginBottom: 16 }}>
              {GOAL_PRESETS.map((v) => (
                <button
                  key={v}
                  className={`${styles.chip} ${goal === v ? styles.chipActive : ''}`}
                  onClick={() => setGoal(v)}
                >
                  {v}
                </button>
              ))}
            </div>
            <input
              className="input"
              placeholder="Или напиши свою цель..."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </div>
        )}

        <div className={styles.actions}>
          {step > 1 && (
            <button className="btn btn-ghost" onClick={() => setStep((s) => s - 1)}>
              <ChevronLeft size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
              Назад
            </button>
          )}
          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={saveAndNext}
            disabled={loading}
          >
            {loading ? 'Сохраняем...' : step === 5 ? (
              <>
                Завершить настройку
                <PartyPopper size={16} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 6 }} />
              </>
            ) : (
              <>
                Продолжить
                <ChevronRight size={16} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
