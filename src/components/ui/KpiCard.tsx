interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  delta?: string;
  deltaVariant?: 'ok' | 'warn' | 'danger' | 'info';
  accentColor?: string;
  valueColor?: string;
}

const DELTA_STYLES = {
  ok:      { bg: '#e6f5ee', color: '#1a7a4a' },
  warn:    { bg: '#fff3e0', color: '#b36a00' },
  danger:  { bg: '#fdecea', color: '#c0392b' },
  info:    { bg: '#c8ddf0', color: '#2e6da4' },
};

export function KpiCard({ label, value, sub, delta, deltaVariant = 'info', accentColor = '#2e6da4', valueColor = '#1a2b4a' }: KpiCardProps) {
  return (
    <div style={{
      background: 'white',
      border: '1px solid #dde5ef',
      borderRadius: 10,
      padding: 16,
      borderTop: `3px solid ${accentColor}`,
      boxShadow: '0 1px 4px rgba(26,43,74,.06)',
    }}>
      <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: '#4a6080', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: valueColor, lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 10, color: '#7a92a8', marginTop: 5 }}>{sub}</div>}
      {delta && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 3,
          fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, marginTop: 6,
          ...DELTA_STYLES[deltaVariant],
        }}>
          {delta}
        </div>
      )}
    </div>
  );
}
