import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Card({ children, className = '', style }: CardProps) {
  return (
    <div
      className={className}
      style={{
        background: 'white',
        border: '1px solid #dde5ef',
        borderRadius: 10,
        padding: 18,
        marginBottom: 16,
        boxShadow: '0 1px 4px rgba(26,43,74,.05)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  badge?: string;
  action?: React.ReactNode;
}

export function CardTitle({ children, badge, action }: CardTitleProps) {
  return (
    <div style={{
      fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '.8px', color: '#1a2b4a', marginBottom: 14,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ display: 'inline-block', width: 3, height: 16, background: '#2e6da4', borderRadius: 2, flexShrink: 0 }} />
        {children}
      </div>
      {badge && (
        <span style={{
          fontSize: 9, fontFamily: 'DM Mono, monospace', padding: '3px 8px',
          borderRadius: 20, background: '#c8ddf0', color: '#2e6da4', fontWeight: 600,
        }}>{badge}</span>
      )}
      {action}
    </div>
  );
}
