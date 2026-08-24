import { EMERGENCIAS_TIPO, EVOLUCION_OPERATIVA } from "@/lib/datos-demo";
import styles from "../panel.module.css";

/** Distribución de emergencias por tipo. */
export function Dona({ total }: { total: number }) {
  const radio = 60;
  const circunferencia = 2 * Math.PI * radio;

  // Cada segmento arranca donde terminan los anteriores.
  const segmentos = EMERGENCIAS_TIPO.map((segmento, i) => ({
    ...segmento,
    inicio: EMERGENCIAS_TIPO.slice(0, i).reduce((t, s) => t + s.valor, 0),
  }));

  return (
    <div className={styles.donutZona}>
      <div className={styles.donutMarco}>
        <svg
          className={styles.donutSvg}
          viewBox="0 0 160 160"
          role="img"
          aria-label="Distribución de emergencias por tipo"
        >
          <circle
            cx="80"
            cy="80"
            r={radio}
            fill="none"
            stroke="rgba(244,240,233,0.06)"
            strokeWidth="16"
          />
          {segmentos.map((segmento, i) => {
            const largo = (segmento.valor / 100) * circunferencia;
            const desfase = -(segmento.inicio / 100) * circunferencia;
            return (
              <circle
                key={segmento.tipo}
                className={styles.donutSegmento}
                cx="80"
                cy="80"
                r={radio}
                stroke={segmento.color}
                strokeDasharray={`${largo} ${circunferencia - largo}`}
                strokeDashoffset={desfase}
                style={{ animationDelay: `${i * 120}ms` }}
              />
            );
          })}
        </svg>
        <div className={styles.donutCentro}>
          <span className={styles.donutCentroValor}>{total}</span>
          <span className={styles.donutCentroEtiqueta}>Emergencias</span>
        </div>
      </div>

      <ul className={styles.leyenda}>
        {EMERGENCIAS_TIPO.map((segmento) => (
          <li key={segmento.tipo} className={styles.leyendaItem}>
            <span
              className={styles.leyendaPunto}
              style={{ background: segmento.color }}
            />
            {segmento.tipo}
            <span className={styles.leyendaValor}>{segmento.valor}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const ANCHO = 640;
const ALTO = 300;
const MARGEN = { top: 26, right: 50, bottom: 34, left: 46 };
const DIVISIONES = 3;
const COLOR_RESPUESTA = "#f2b544";

/** Redondea el tope del eje a un valor legible (50, 100, 150…). */
function topeBonito(maximo: number) {
  const bruto = maximo / DIVISIONES;
  const magnitud = 10 ** Math.floor(Math.log10(bruto));
  const paso =
    [1, 2, 2.5, 5, 10].map((m) => m * magnitud).find((p) => p >= bruto) ??
    magnitud * 10;
  return paso * DIVISIONES;
}

/** Evolución mensual: emergencias (barras) y tiempo de respuesta (línea). */
export function Combo() {
  const anchoUtil = ANCHO - MARGEN.left - MARGEN.right;
  const altoUtil = ALTO - MARGEN.top - MARGEN.bottom;

  // Eje izquierdo: emergencias, siempre desde cero.
  const topeEmergencias = topeBonito(
    Math.max(...EVOLUCION_OPERATIVA.map((m) => m.emergencias)),
  );

  // Eje derecho: minutos de respuesta. Al variar solo entre 6 y 7 min, se
  // recorta el dominio a medios minutos para que la tendencia se lea; por
  // eso el eje va rotulado y no arranca en cero.
  const respuestas = EVOLUCION_OPERATIVA.map((m) => m.respuesta);
  const piso = Math.floor(Math.min(...respuestas) * 2) / 2;
  const techo = Math.ceil(Math.max(...respuestas) * 2) / 2;
  const rango = techo - piso || 1;

  const paso = anchoUtil / EVOLUCION_OPERATIVA.length;
  const anchoBarra = Math.min(paso * 0.46, 46);

  const puntos = EVOLUCION_OPERATIVA.map((mes, i) => ({
    ...mes,
    centro: MARGEN.left + paso * i + paso / 2,
    altoBarra: (mes.emergencias / topeEmergencias) * altoUtil,
    y: MARGEN.top + altoUtil * (1 - (mes.respuesta - piso) / rango),
  }));

  // Las dos escalas comparten las mismas líneas guía.
  const guias = Array.from({ length: DIVISIONES + 1 }, (_, i) => {
    const r = i / DIVISIONES;
    return {
      y: MARGEN.top + altoUtil * r,
      emergencias: Math.round(topeEmergencias * (1 - r)),
      minutos: (techo - rango * r).toFixed(1),
    };
  });

  return (
    <div className={styles.comboEnvoltura}>
      <svg
        className={styles.combo}
        viewBox={`0 0 ${ANCHO} ${ALTO}`}
        role="img"
        aria-label={`Emergencias atendidas y tiempo de respuesta por mes, de marzo a agosto de 2026. Emergencias entre ${Math.min(
          ...EVOLUCION_OPERATIVA.map((m) => m.emergencias),
        )} y ${Math.max(
          ...EVOLUCION_OPERATIVA.map((m) => m.emergencias),
        )}; tiempo de respuesta entre ${Math.min(
          ...respuestas,
        )} y ${Math.max(...respuestas)} minutos.`}
      >
        {guias.map((guia) => (
          <g key={guia.y}>
            <line
              className={styles.graficoEje}
              x1={MARGEN.left}
              y1={guia.y}
              x2={ANCHO - MARGEN.right}
              y2={guia.y}
            />
            <text
              className={styles.graficoTexto}
              x={MARGEN.left - 8}
              y={guia.y + 3}
              textAnchor="end"
            >
              {guia.emergencias}
            </text>
            <text
              className={styles.comboEjeMinutos}
              x={ANCHO - MARGEN.right + 8}
              y={guia.y + 3}
            >
              {guia.minutos}
            </text>
          </g>
        ))}

        {puntos.map((mes, i) => (
          <rect
            key={`b-${mes.mes}`}
            className={styles.comboBarra}
            x={mes.centro - anchoBarra / 2}
            y={MARGEN.top + altoUtil - mes.altoBarra}
            width={anchoBarra}
            height={mes.altoBarra}
            style={{ animationDelay: `${i * 90}ms` }}
          />
        ))}

        <polyline
          className={styles.comboLinea}
          points={puntos.map((p) => `${p.centro},${p.y}`).join(" ")}
        />

        {puntos.map((mes) => (
          <g key={mes.mes}>
            <title>{`${mes.mes}: ${mes.emergencias} emergencias · ${mes.respuesta} min`}</title>
            <circle className={styles.comboPunto} cx={mes.centro} cy={mes.y} r={3.5} />
            <text
              className={styles.graficoTexto}
              x={mes.centro}
              y={ALTO - 10}
              textAnchor="middle"
            >
              {mes.mes}
            </text>
            {/* El valor va dentro de la barra: fuera chocaba con la línea. */}
            <text
              className={styles.comboValor}
              x={mes.centro}
              y={MARGEN.top + altoUtil - mes.altoBarra + 15}
              textAnchor="middle"
            >
              {mes.emergencias}
            </text>
          </g>
        ))}
      </svg>

      <div className={styles.leyendaFila}>
        <span className={styles.leyendaMarca}>
          <span
            className={styles.leyendaMuestra}
            style={{ background: "var(--acento)", opacity: 0.62 }}
          />
          Emergencias atendidas (eje izq.)
        </span>
        <span className={styles.leyendaMarca}>
          <span
            className={styles.leyendaMuestra}
            style={{ background: COLOR_RESPUESTA }}
          />
          Tiempo de respuesta en minutos (eje der.)
        </span>
      </div>
    </div>
  );
}
