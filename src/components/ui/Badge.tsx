import React from 'react';

type BadgeVariant = 'ok' | 'warn' | 'danger' | 'info' | 'neutral';

const VARIANTS: Record<BadgeVariant, { bg: string; color: string }> = {
  ok:      { bg: '#e6f5ee', color: '#1a7a4a' },
  warn:    { bg: '#fff3e0', color: '#b36a00' },
  danger:  { bg: '#fdecea', color: '#c0392b' },
  info:    { bg: '#c8ddf0', color: '#2e6da4' },
  neutral: { bg: '#f7f9fc', color: '#4a6080' },
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function Badge({ variant = 'neutral', children, style }: BadgeProps) {
  const v = VARIANTS[variant];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '3px 8px', borderRadius: 20,
      fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap',
      background: v.bg, color: v.color,
      ...style,
    }}>
      {children}
    </span>
  );
}
