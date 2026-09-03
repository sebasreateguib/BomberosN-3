"use client";

import { GUARDIA_ACTUAL, KPIS_MESA, UNIDADES } from "@/lib/datos-demo";
import { useHoraLima } from "@/lib/hora-lima";
import styles from "./panel.module.css";

const CLASES_UNIDAD = {
  Operativa: styles.segOperativa,
  "En mantenimiento": styles.segMantenimiento,
  "Fuera de servicio": styles.segFuera,
};

// Se calculan una vez al cargar el módulo: son datos fijos de la maqueta,
// no dependen del render ni del usuario.
const OPERATIVAS = UNIDADES.filter((u) => u.estado === "Operativa").length;
const PENDIENTES = KPIS_MESA.find((k) => k.clave === "pendientes")?.valor ?? 0;

export function EstadoCompania() {
  const hora = useHoraLima();

  return (
    <section className={styles.estado} aria-label="Estado de la Compañía">
      <p className={styles.estadoCabecera}>
        <span className={styles.estadoPulso} aria-hidden="true" />
        En servicio
        <time className={styles.estadoHora} suppressHydrationWarning>
          {hora ?? "--:--:--"}
        </time>
      </p>

      <div className={styles.estadoDato}>
        <span className={styles.estadoFila}>
          <span className={styles.estadoEtiqueta}>Unidades</span>
          <span className={styles.estadoValor}>
            {OPERATIVAS} <em>/ {UNIDADES.length}</em>
          </span>
        </span>
        <span className={styles.estadoSegmentos} aria-hidden="true">
          {UNIDADES.map((unidad) => (
            <span
              key={unidad.id}
              className={`${styles.estadoSegmento} ${CLASES_UNIDAD[unidad.estado]}`}
            />
          ))}
        </span>
      </div>

      <span className={styles.estadoFila}>
        <span className={styles.estadoEtiqueta}>Guardia</span>
        <span className={styles.estadoValor}>
          {GUARDIA_ACTUAL.enServicio} <em>/ {GUARDIA_ACTUAL.dotacion}</em>
        </span>
      </span>

      <span className={styles.estadoFila}>
        <span className={styles.estadoEtiqueta}>Pendientes</span>
        <span className={styles.estadoValor}>
          {PENDIENTES} <em>docs</em>
        </span>
      </span>
    </section>
  );
}
