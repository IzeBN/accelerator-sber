import { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './GlowButton.module.css';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

export const GlowButton = ({
  children,
  variant = 'primary',
  size = 'md',
  glow = true,
  className = '',
  ...props
}: Props) => {
  return (
    <button
      className={[
        styles.btn,
        styles[variant],
        styles[size],
        glow ? styles.glow : '',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      <span className={styles.shimmer} />
      <span className={styles.content}>{children}</span>
    </button>
  );
};
