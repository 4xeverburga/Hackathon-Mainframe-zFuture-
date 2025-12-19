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

## Deploy en IBM Cloud

Este proyecto es **Next.js** y está preparado para deploy en **IBM Cloud Code Engine** vía container:
- `next.config.ts` usa `output: "standalone"`
- `Dockerfile` expone `PORT=8080` (recomendado para Code Engine)

### Opción A (recomendada): IBM Cloud Code Engine (Container)

#### 1) Prerrequisitos

- Tener cuenta de IBM Cloud y un **Resource Group**
- Instalar IBM Cloud CLI + plugins:

```bash
ibmcloud --version
ibmcloud plugin install container-registry -f
ibmcloud plugin install code-engine -f
```

#### 2) Login + elegir región

```bash
ibmcloud login
ibmcloud target -r us-south
```

> Puedes usar otra región (ej. `eu-de`) según tu cuenta.

#### 3) Crear namespace en Container Registry (una vez)

```bash
ibmcloud cr region-set us-south
ibmcloud cr namespace-add ibm-hackathon-z
```

#### 4) Build y push de la imagen

Opción simple (build local con Docker):

```bash
ibmcloud cr login
docker build -t us.icr.io/ibm-hackathon-z/ops-command-center:latest .
docker push us.icr.io/ibm-hackathon-z/ops-command-center:latest
```

#### 5) Deploy en Code Engine

```bash
ibmcloud ce project create --name ops-ce
ibmcloud ce project select --name ops-ce

ibmcloud ce application create \
  --name ops-command-center \
  --image us.icr.io/ibm-hackathon-z/ops-command-center:latest \
  --port 8080
```

Para ver la URL pública:

```bash
ibmcloud ce application get --name ops-command-center
```

### Opción B: IBM Cloud Foundry (Node buildpack) (alternativa)

Si prefieres Cloud Foundry, dime y te agrego un `manifest.yml` listo (la opción Code Engine suele ser más directa para Next.js).

