import type { Restriccion } from '../types';

export const RESTRICCIONES_DEMO: Restriccion[] = [
  {
    id: 'demo-1',
    descripcion: 'Falta de planos IFC para inicio de obras de concreto armado — Patio de Llaves',
    responsable: 'Ing. Diseño / Oficina Técnica',
    fecha: '2026-03-28',
    tipo: 'critica',
    estado: 'abierta',
    obs: 'Sin planos IFC aprobados no se puede iniciar hincado de pilotes ni encofrado. Impacto directo en ruta crítica. Se requiere emisión urgente de 3 planos: PL-CIV-001, PL-CIV-002, PL-CIV-005.',
  },
  {
    id: 'demo-2',
    descripcion: 'Transformador de Potencia 138/33kV sin fecha de entrega confirmada por proveedor',
    responsable: 'Logística / Adquisiciones',
    fecha: '2026-04-10',
    tipo: 'critica',
    estado: 'en-proceso',
    obs: 'Proveedor Siemens reporta demora por componentes importados. Lead time estimado: 18 semanas. Se gestiona alternativa con ABB. Reunión de seguimiento programada para S18.',
  },
  {
    id: 'demo-3',
    descripcion: 'Permiso municipal de excavación no emitido para Sala de Control',
    responsable: 'Gestión de Permisos / Área Legal',
    fecha: '2026-04-05',
    tipo: 'no-critica',
    estado: 'abierta',
    obs: 'Municipalidad de Motil requiere plano de impacto vial y póliza de seguro adicional. Documentos en preparación. Estimado de emisión: 2 semanas.',
  },
  {
    id: 'demo-4',
    descripcion: 'Acceso a frente de trabajo bloqueado por propietario de predio colindante — Sector Muro de Contención',
    responsable: 'Ing. Residente / Relaciones Comunitarias',
    fecha: '2026-03-25',
    tipo: 'critica',
    estado: 'cerrada',
    obs: 'RESUELTA S16: Se llegó a acuerdo económico con el propietario. Servidumbre de paso firmada el 14/03/2026. Acceso habilitado.',
  },
  {
    id: 'demo-5',
    descripcion: 'Celdas GIS 22.9 kV requieren certificado OSINERGMIN para ingreso a obra',
    responsable: 'Control de Calidad / Área Técnica',
    fecha: '2026-04-20',
    tipo: 'no-critica',
    estado: 'abierta',
    obs: 'Equipos en tránsito desde España. OSINERGMIN requiere protocolo de fábrica y certificado de origen. Se solicitó documentación al proveedor Schneider Electric.',
  },
];
