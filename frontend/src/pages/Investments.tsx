import { useEffect, useState } from 'react';
import {
  Bot,
  Building2,
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart2,
} from 'lucide-react';
import { getInvestments, getInvestmentsCatalog, buyInvestment } from '../api/client';
import { InvestmentPortfolio, InvestmentCatalogItem } from '../types';
import { PageTransition } from '../components/PageTransition';
import { AnimatedCounter } from '../components/AnimatedCounter';
import styles from './Investments.module.css';

function fmt(n: number) {
  return n.toLocaleString('ru-RU', { maximumFractionDigits: 0 }) + ' ₽';
}

const WEEKLY_AMOUNTS = [100, 300, 500, 1000];

export default function Investments() {
  const [portfolio, setPortfolio] = useState<InvestmentPortfolio | null>(null);
  const [catalog, setCatalog] = useState<InvestmentCatalogItem[]>([]);
  const [selectedInstrument, setSelectedInstrument] = useState<InvestmentCatalogItem | null>(null);
  const [weeklyAmount, setWeeklyAmount] = useState(300);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    Promise.all([getInvestments(), getInvestmentsCatalog()])
      .then(([p, c]) => {
        setPortfolio(p);
        setCatalog(c);
        if (c.length > 0) setSelectedInstrument(c[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleBuy = async () => {
    if (!selectedInstrument) return;
    setBuying(true);
    try {
      await buyInvestment({
        instrument: selectedInstrument.instrument,
        type: selectedInstrument.type,
        amount: weeklyAmount * 4,
      });
      const updated = await getInvestments();
      setPortfolio(updated);
      setShowConfirm(false);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      alert(err?.response?.data?.detail || 'Ошибка');
    }
    setBuying(false);
  };

  const forecast = Math.round(weeklyAmount * 52 * 1.06);

  if (loading) return <div className="spinner" />;

  return (
    <PageTransition>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Первые инвестиции</h1>
          <p className={styles.sub}>
            <Bot size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} color="#21A038" />
            Степан: Инвестиции — это не страшно. Начни с {weeklyAmount} ₽ в неделю!
          </p>
        </div>

        {/* Portfolio */}
        {portfolio && portfolio.investments.length > 0 && (
          <div className={`card ${styles.portfolioCard}`}>
            <div className={styles.portfolioHeader}>
              <div>
                <div className={styles.portfolioLabel}>Мой портфель</div>
                <div className={styles.portfolioValue}>{fmt(portfolio.total_value)}</div>
              </div>
              <div className={`${styles.profitBadge} ${portfolio.total_profit_pct >= 0 ? styles.profitPos : styles.profitNeg}`}>
                {portfolio.total_profit_pct >= 0
                  ? <TrendingUp size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                  : <TrendingDown size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                }
                {Math.abs(portfolio.total_profit_pct)}% доход
              </div>
            </div>
            <div className={styles.invList}>
              {portfolio.investments.map((inv, i) => (
                <div key={inv.id} className={styles.invRow} style={{ animationDelay: `${i * 0.08}s` }}>
                  <div>
                    <div className={styles.invName}>{inv.instrument}</div>
                    <div className={styles.invType}>
                      {inv.type === 'bond' ? 'Облигации' : inv.type === 'stock_fund' ? 'Фонд акций' : 'Депозит'}
                    </div>
                  </div>
                  <div className={styles.invRight}>
                    <div className={styles.invAmount}>{fmt(inv.amount)}</div>
                    <div className={`${styles.invProfit} ${inv.profit_pct >= 0 ? styles.invProfitPos : styles.invProfitNeg}`}>
                      {inv.profit_pct >= 0 ? '+' : ''}{inv.profit_pct}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Catalog */}
        <div className="card">
          <h2 className={styles.sectionTitle}>Выбери свой путь</h2>
          <p className={styles.sectionHint}>Три инструмента с разным уровнем риска</p>
          <div className={styles.catalogGrid}>
            {catalog.map((item) => (
              <button
                key={item.instrument}
                className={`${styles.catalogCard} ${selectedInstrument?.instrument === item.instrument ? styles.catalogCardActive : ''}`}
                onClick={() => setSelectedInstrument(item)}
              >
                <div className={styles.catalogIcon}>
                  {item.type === 'bond'
                    ? <Building2 size={28} color="#21A038" />
                    : item.type === 'stock_fund'
                    ? <TrendingUp size={28} color="#21A038" />
                    : <Wallet size={28} color="#21A038" />
                  }
                </div>
                <div className={styles.catalogName}>{item.instrument}</div>
                <div className={styles.catalogDesc}>{item.description}</div>
                <div className={styles.catalogReturn}>
                  <span className="badge badge-green">{item.expected_return}</span>
                </div>
                <div className={styles.catalogMin}>от {fmt(item.min_amount)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Weekly amount selector */}
        <div className="card">
          <h2 className={styles.sectionTitle}>Настрой регулярность</h2>
          <p className={styles.hint}>Сколько откладывать в неделю?</p>
          <div className={styles.amountBtns}>
            {WEEKLY_AMOUNTS.map((a) => (
              <button
                key={a}
                className={`${styles.amountBtn} ${weeklyAmount === a ? styles.amountBtnActive : ''}`}
                onClick={() => setWeeklyAmount(a)}
              >
                {a} ₽
              </button>
            ))}
          </div>

          <div className={styles.forecast}>
            <span className={styles.forecastIcon}><BarChart2 size={24} color="#21A038" /></span>
            <div>
              <div className={styles.forecastTitle}>Прогноз на год</div>
              <div className={styles.forecastText}>
                Если откладывать <strong>{weeklyAmount} ₽/нед</strong>, через год у тебя может быть около{' '}
                <strong style={{ color: 'var(--green)' }}>
                  <AnimatedCounter end={forecast} suffix=" ₽" duration={800} />
                </strong>
              </div>
              <div className={styles.forecastNote}>* Прогноз не является гарантией доходности</div>
            </div>
          </div>

          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            onClick={() => setShowConfirm(true)}
          >
            Начать инвестировать
          </button>
        </div>

        {/* Confirm modal */}
        {showConfirm && (
          <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title">Начать инвестировать</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: 14, lineHeight: 1.7 }}>
                Инструмент: <strong>{selectedInstrument?.instrument}</strong><br />
                Сумма: <strong>{fmt(weeklyAmount * 4)} (за месяц)</strong><br /><br />
                Я ознакомлен(-а) с инвестиционными рисками и согласен(-а) начать.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowConfirm(false)}>
                  Отмена
                </button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleBuy} disabled={buying}>
                  {buying ? 'Открываем счёт...' : 'Подтвердить'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
