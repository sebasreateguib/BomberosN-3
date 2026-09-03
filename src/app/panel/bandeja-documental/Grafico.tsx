import { SERIE_MENSUAL } from "@/lib/datos-demo";
import styles from "../panel.module.css";

const ANCHO = 640;
const ALTO = 220;
const MARGEN = { top: 16, right: 12, bottom: 28, left: 30 };

/** Evolución mensual de documentos ingresados (SVG, sin dependencias). */
export function Grafico() {
  const maximo = Math.max(...SERIE_MENSUAL.map((p) => p.valor)) * 1.15;
  const anchoUtil = ANCHO - MARGEN.left - MARGEN.right;
  const altoUtil = ALTO - MARGEN.top - MARGEN.bottom;

  const puntos = SERIE_MENSUAL.map((punto, i) => ({
    ...punto,
    x: MARGEN.left + (anchoUtil / (SERIE_MENSUAL.length - 1)) * i,
    y: MARGEN.top + altoUtil - (punto.valor / maximo) * altoUtil,
  }));

  const linea = puntos.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${MARGEN.left},${MARGEN.top + altoUtil} ${linea} ${
    MARGEN.left + anchoUtil
  },${MARGEN.top + altoUtil}`;

  const referencias = [0, 0.5, 1];

  return (
    <svg
      className={styles.grafico}
      viewBox={`0 0 ${ANCHO} ${ALTO}`}
      role="img"
      aria-label="Documentos ingresados por mes, de enero a agosto de 2026"
    >
      <defs>
        <linearGradient id="degradadoArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--acento)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--acento)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {referencias.map((r) => {
        const y = MARGEN.top + altoUtil * r;
        return (
          <g key={r}>
            <line
              className={styles.graficoEje}
              x1={MARGEN.left}
              y1={y}
              x2={ANCHO - MARGEN.right}
              y2={y}
            />
            <text className={styles.graficoTexto} x={0} y={y + 3}>
              {Math.round(maximo * (1 - r))}
            </text>
          </g>
        );
      })}

      <polygon className={styles.graficoRelleno} points={area} />
      <polyline className={styles.graficoLinea} points={linea} />

      {puntos.map((p) => (
        <g key={p.mes}>
          <circle className={styles.graficoPunto} cx={p.x} cy={p.y} r={3.5} />
          <text
            className={styles.graficoTexto}
            x={p.x}
            y={ALTO - 8}
            textAnchor="middle"
          >
            {p.mes}
          </text>
        </g>
      ))}
    </svg>
  );
}
