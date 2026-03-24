import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Bot } from 'lucide-react';
import Sidebar from './Sidebar';
import StepanWidget from './StepanWidget';
import { useStore } from '../store';
import styles from './Layout.module.css';

export default function Layout() {
  const { user, logout } = useStore();
  const [stepanOpen, setStepanOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.logo}>СберСтарт</span>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.userName}>{user?.full_name}</span>
            <button className={styles.logoutBtn} onClick={logout}>Выйти</button>
          </div>
        </header>
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>

      {/* Stepan floating button */}
      <button
        className={styles.stepanBtn}
        onClick={() => setStepanOpen(!stepanOpen)}
        title="Степан — финансовый помощник"
      >
        <Bot size={24} color="#fff" />
      </button>
      {stepanOpen && <StepanWidget onClose={() => setStepanOpen(false)} />}
    </div>
  );
}
