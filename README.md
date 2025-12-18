## Interbank • Ops Command Center (IBM Z)

Frontend demo (hackathon) para continuidad operacional: **alertas + métricas + logs** con una capa de **IA** (mock) que **correlaciona**, **prioriza riesgo** y **recomienda acciones** con evidencia.

## Getting Started

### Requisitos

- Node.js 18+ (recomendado 20+)

### Correr en local

Instala dependencias y levanta el servidor:

```bash
npm i
npm run dev
```

Abre `http://localhost:3000`.

### Páginas

- `/dashboard`: Vista ejecutiva (KPIs + riesgo vs tiempo + drivers + incidentes activos)
- `/triage`: Vista operativa (feed de alertas + correlación + acciones sugeridas)
- `/incidents/inc-778`: Detalle de incidente (war room)
- `/reports`: Reportes (tabla TanStack + sparkline)

### Mock API (Next.js Route Handlers)

- `GET /api/overview`
- `GET /api/alerts`
- `GET /api/incidents`
- `GET /api/incidents/:id`
- `POST /api/incidents/:id/actions`
- `POST /api/itsm/ticket`

