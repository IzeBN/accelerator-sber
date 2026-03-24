import { NavLink } from 'react-router-dom';
import {
  GraduationCap,
  Home,
  Building2,
  TrendingUp,
  Gift,
  Users,
  BarChart2,
  ClipboardList,
} from 'lucide-react';
import { useStore } from '../store';
import styles from './Sidebar.module.css';

const studentLinks = [
  { to: '/dashboard', icon: <Home size={18} />, label: 'Главная' },
  { to: '/savings', icon: <Building2 size={18} />, label: 'Копилка' },
  { to: '/investments', icon: <TrendingUp size={18} />, label: 'Инвестиции' },
  { to: '/benefits', icon: <Gift size={18} />, label: 'Льготы и бонусы' },
];

const parentLinks = [
  { to: '/parent', icon: <Users size={18} />, label: 'Мои дети' },
];

const adminLinks = [
  { to: '/admin', icon: <BarChart2 size={18} />, label: 'Метрики' },
  { to: '/admin/documents', icon: <ClipboardList size={18} />, label: 'Документы' },
];

export default function Sidebar() {
  const user = useStore((s) => s.user);

  const links =
    user?.role === 'admin' ? adminLinks :
    user?.role === 'parent' ? parentLinks :
    studentLinks;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandIcon}><GraduationCap size={24} color="#21A038" /></span>
        <div>
          <div className={styles.brandName}>СберСтарт</div>
          <div className={styles.brandSub}>
            {user?.role === 'admin' ? 'Администратор' :
             user?.role === 'parent' ? 'Родитель' : 'Студент'}
          </div>
        </div>
      </div>

      <nav className={styles.nav}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.navIcon}>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.userCard}>
          <div className={styles.avatar}>{user?.full_name?.[0] ?? '?'}</div>
          <div>
            <div className={styles.userName}>{user?.full_name}</div>
            <div className={styles.userEmail}>{user?.email}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
