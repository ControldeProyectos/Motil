# Control de Obra — Proyecto MOTIL

Dashboard de control de avance de obra para el proyecto **S.E. Motil** de **C MEJIA S.A.C.**

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- Recharts (Curva S y gráficos)
- localStorage para persistencia

## Desarrollo

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Estructura

```
src/
  components/       # Componentes React
    sections/       # Secciones por tab (Resumen, Avance, CurvaS, etc.)
    ui/             # Componentes reutilizables (Card, Badge, Modal, KpiCard)
  data/             # Datos estáticos (curva S, actividades, restricciones demo)
  hooks/            # Custom hooks (useAppState, useCountdown)
  types/            # Interfaces TypeScript
```
