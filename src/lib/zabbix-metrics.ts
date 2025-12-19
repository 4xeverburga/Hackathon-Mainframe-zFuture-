// Explicit metric shape used across charts + dashboard.
// Keeping metrics typed as numbers avoids unions like `string | number` leaking into UI code.
export type ZPoint = {
  t: string;
  cpuUser: number;
  cpuSystem: number;
  cpuIowait: number;
  cpuSteal: number;
  procTotal: number;
  procMonitoring: number;
  procMySQL: number;
  procOther: number;
  trafficIn: number;
  trafficOut: number;
  valuesProcessed: number;
  queue: number;
  mysqlSelect: number;
  mysqlInsert: number;
  mysqlUpdate: number;
  mysqlDelete: number;
};

function iso(ms: number) {
  return new Date(ms).toISOString();
}

export function buildSeries({
  points = 120,
  stepMs = 60_000,
  seed = 7,
}: {
  points?: number;
  stepMs?: number;
  seed?: number;
}) {
  const now = Date.now();
  let s = seed;
  const rand = () => {
    // deterministic-ish
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  const data: ZPoint[] = [];
  for (let i = points - 1; i >= 0; i--) {
    const t = now - i * stepMs;
    const x = (points - i) / points;

    const cpuUser = 18 + Math.sin(x * 10) * 6 + rand() * 3;
    const cpuSystem = 7 + Math.cos(x * 8) * 3 + rand() * 2;
    const cpuIowait = 2 + Math.max(0, Math.sin(x * 13)) * 8 + rand() * 2;
    const cpuSteal = 0.2 + rand() * 0.6;

    const procTotal = 140 + Math.sin(x * 5) * 12 + rand() * 10;
    const procMonitoring = 70 + Math.cos(x * 6) * 6 + rand() * 5;
    const procMySQL = 30 + Math.sin(x * 7) * 4 + rand() * 3;
    const procOther = procTotal - procMonitoring - procMySQL;

    const trafficIn = 10 + Math.sin(x * 12) * 3 + rand() * 4;
    const trafficOut = 9 + Math.cos(x * 12) * 3 + rand() * 3;

    const valuesProcessed = 1200 + Math.sin(x * 8) * 200 + rand() * 120;
    const queue = 0.2 + Math.max(0, Math.sin(x * 9)) * 2 + rand() * 0.6;

    const mysqlSelect = 260 + Math.sin(x * 7) * 55 + rand() * 40;
    const mysqlInsert = 70 + Math.cos(x * 9) * 20 + rand() * 15;
    const mysqlUpdate = 55 + Math.sin(x * 10) * 18 + rand() * 12;
    const mysqlDelete = 12 + rand() * 6;

    data.push({
      t: iso(t),
      cpuUser,
      cpuSystem,
      cpuIowait,
      cpuSteal,
      procTotal,
      procMonitoring,
      procMySQL,
      procOther,
      trafficIn,
      trafficOut,
      valuesProcessed,
      queue,
      mysqlSelect,
      mysqlInsert,
      mysqlUpdate,
      mysqlDelete,
    });
  }
  return data;
}

export function buildSessionBuckets() {
  // mirrored histogram-like shape
  const buckets: { bucket: string; left: number; right: number }[] = [];
  for (let i = 0; i < 16; i++) {
    const x = (i - 7.5) / 3.2;
    const base = Math.exp(-x * x) * 80;
    const left = Math.round(base * (0.7 + (i % 3) * 0.08));
    const right = Math.round(base * (0.75 + ((i + 1) % 3) * 0.08));
    buckets.push({
      bucket: `${i * 10}-${i * 10 + 10}`,
      left: -left,
      right,
    });
  }
  return buckets;
}


