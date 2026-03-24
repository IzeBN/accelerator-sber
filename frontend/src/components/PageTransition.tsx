import { ReactNode } from 'react';
import styles from './PageTransition.module.css';

interface Props {
  children: ReactNode;
}

export const PageTransition = ({ children }: Props) => {
  return <div className={styles.wrapper}>{children}</div>;
};
