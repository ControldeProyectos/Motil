import React, { useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(26,43,74,.45)',
        zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(2px)',
      }}
    >
      <div style={{
        background: 'white',
        borderRadius: 12,
        padding: 26,
        width: 500,
        maxWidth: '95vw',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(26,43,74,.2)',
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#1a2b4a', marginBottom: 18 }}>
          {title}
        </div>
        {children}
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
}
export function Field({ label, children, error }: FieldProps) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.8px', color: error ? '#c0392b' : '#4a6080', marginBottom: 4, display: 'block' }}>
        {label}
      </label>
      {children}
      {error && (
        <div style={{ fontSize: 10, color: '#c0392b', marginTop: 4, fontWeight: 500 }}>
          {error}
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#f0f4f8', border: '1.5px solid #dde5ef',
  borderRadius: 7, padding: '9px 12px', color: '#1a2b4a',
  fontFamily: 'Inter', fontSize: 12, outline: 'none',
};
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{ ...inputStyle, ...props.style }}
      onFocus={e => { e.currentTarget.style.borderColor = '#2e6da4'; e.currentTarget.style.background = 'white'; }}
      onBlur={e => { e.currentTarget.style.borderColor = '#dde5ef'; e.currentTarget.style.background = '#f0f4f8'; }}
    />
  );
}
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      style={{ ...inputStyle, ...props.style }}
      onFocus={e => { e.currentTarget.style.borderColor = '#2e6da4'; e.currentTarget.style.background = 'white'; }}
      onBlur={e => { e.currentTarget.style.borderColor = '#dde5ef'; e.currentTarget.style.background = '#f0f4f8'; }}
    />
  );
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{ ...inputStyle, resize: 'vertical', minHeight: 70, ...props.style }}
      onFocus={e => { e.currentTarget.style.borderColor = '#2e6da4'; e.currentTarget.style.background = 'white'; }}
      onBlur={e => { e.currentTarget.style.borderColor = '#dde5ef'; e.currentTarget.style.background = '#f0f4f8'; }}
    />
  );
}

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md';
}
export function Btn({ variant = 'primary', size = 'md', style, ...rest }: BtnProps) {
  const base: React.CSSProperties = {
    padding: size === 'sm' ? '5px 12px' : '9px 18px',
    borderRadius: 7, border: 'none',
    fontFamily: 'Inter', fontSize: size === 'sm' ? 11 : 12, fontWeight: 600,
    cursor: 'pointer', transition: 'all .15s',
  };
  const variants = {
    primary:   { background: '#2e6da4', color: 'white' },
    secondary: { background: '#f0f4f8', color: '#1a2b4a', border: '1.5px solid #dde5ef' },
    danger:    { background: '#fdecea', color: '#c0392b', border: '1px solid #f5c6c2' },
  };
  return <button {...rest} style={{ ...base, ...variants[variant], ...style }} />;
}

export function ModalFooter({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
      {children}
    </div>
  );
}
