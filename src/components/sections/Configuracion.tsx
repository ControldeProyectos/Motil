import type { CSSProperties } from 'react';
import { Card, CardTitle } from '../ui/Card';

interface Props {
  diasAlerta: number;
  onSetDiasAlerta: (n: number) => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

export function Configuracion({ diasAlerta, onSetDiasAlerta, onExport, onImport }: Props) {
  const inputStyle: CSSProperties = {
    width: '100%', background: '#f0f4f8', border: '1.5px solid #dde5ef',
    borderRadius: 7, padding: '9px 12px', color: '#1a2b4a',
    fontFamily: 'Inter', fontSize: 12, outline: 'none',
  };
  const labelStyle: CSSProperties = {
    fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: '.8px', color: '#4a6080', marginBottom: 4, display: 'block',
  };
  const infoRowStyle: CSSProperties = {
    padding: '9px 12px', background: '#f0f4f8', borderRadius: 7, fontSize: 12, fontWeight: 500,
  };

  const InfoRow = ({ label, value, highlight }: { label: string; value: string; highlight?: 'danger' | 'blue' | 'green' }) => (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{
        ...infoRowStyle,
        background: highlight === 'danger' ? '#fdecea' : highlight === 'blue' ? '#c8ddf0' : highlight === 'green' ? '#e6f5ee' : '#f0f4f8',
        color: highlight === 'danger' ? '#c0392b' : highlight === 'blue' ? '#2e6da4' : highlight === 'green' ? '#1a7a4a' : '#1a2b4a',
        fontWeight: highlight ? 700 : 500,
      }}>
        {value}
      </div>
    </div>
  );

  return (
    <div>
      <Card>
        <CardTitle>Datos del Proyecto — RSP_MOTIL_SEM17.xlsx</CardTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <InfoRow label="Proyecto" value="MOTIL — Subestación Eléctrica Motil" />
          <InfoRow label="Empresa" value="C MEJIA S.A.C. — Contratistas Generales" />
          <InfoRow label="Semana de Reporte" value="SEM 17 (16–22 Mar 2026)" />
          <InfoRow label="Fecha Inicio Contractual" value="14/11/2025" />
          <InfoRow label="Fecha Fin Contractual" value="07/01/2027" highlight="danger" />
          <InfoRow label="Valor Total Contrato" value="USD $3,090,285.88" highlight="blue" />
          <InfoRow label="Avance Plan vs Real S17" value="8.55% = 8.55% (Sin desviación)" highlight="green" />
          <InfoRow label="Diferencia vs Contractual" value="+6.47% adelantado" highlight="green" />
        </div>
        <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
          <button
            onClick={onExport}
            style={{ padding: '9px 18px', borderRadius: 7, border: 'none', background: '#2e6da4', color: 'white', fontFamily: 'Inter', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            📤 Exportar Datos JSON
          </button>
          <label style={{ padding: '9px 18px', borderRadius: 7, background: '#f0f4f8', color: '#1a2b4a', border: '1.5px solid #dde5ef', fontFamily: 'Inter', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
            📥 Importar JSON
            <input
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) onImport(f); e.target.value = ''; }}
            />
          </label>
          <button
            onClick={() => window.print()}
            style={{ padding: '9px 18px', borderRadius: 7, background: '#f0f4f8', color: '#1a2b4a', border: '1.5px solid #dde5ef', fontFamily: 'Inter', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            🖨️ Imprimir / PDF
          </button>
        </div>
      </Card>

      <Card>
        <CardTitle>Configuración de Alertas</CardTitle>
        <div style={{ maxWidth: 300 }}>
          <label style={labelStyle}>Días de alerta anticipada (suministros)</label>
          <input
            type="number"
            min={1}
            value={diasAlerta}
            onChange={e => onSetDiasAlerta(parseInt(e.target.value) || 15)}
            style={inputStyle}
          />
          <div style={{ fontSize: 10, color: '#7a92a8', marginTop: 6 }}>
            Se generará alerta cuando queden {diasAlerta} días o menos para la fecha necesaria en obra.
          </div>
        </div>
      </Card>
    </div>
  );
}
