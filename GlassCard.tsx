import type { ButtonHTMLAttributes, HTMLAttributes } from 'react';
import { glassCore, glassShell } from '../../styles/tokens';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  innerClassName?: string;
}

/**
 * The "double-bezel" nested card: an outer tinted shell (hairline ring) around
 * an inner core with its own highlight, so containers read as machined
 * hardware rather than a flat div-on-background.
 */
export function GlassCard({ children, className = '', innerClassName = '', ...rest }: GlassCardProps) {
  return (
    <div className={`${glassShell} ${className}`} {...rest}>
      <div className={`${glassCore} ${innerClassName}`}>{children}</div>
    </div>
  );
}

interface GlassButtonCardProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  innerClassName?: string;
}

/** Same nested treatment, but as an interactive <button> (e.g. team cards). */
export function GlassCardButton({ children, className = '', innerClassName = '', ...rest }: GlassButtonCardProps) {
  return (
    <button className={`${glassShell} text-left ${className}`} {...rest}>
      <div className={`${glassCore} ${innerClassName}`}>{children}</div>
    </button>
  );
}
