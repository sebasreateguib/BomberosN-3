import type { Metadata } from "next";
import {
  CONSUMO_COMBUSTIBLE,
  HORARIOS_INCIDENCIA,
  UNIDADES,
} from "@/lib/datos-demo";
import styles from "../../panel.module.css";

export const metadata: Metadata = { title: "Operaciones" };

const CLASES_ESTADO = {
  Operativa: styles.unidadOperativa,
  "En mantenimiento": styles.unidadMantenimiento,
  "Fuera de servicio": styles.unidadFuera,
};

export default function Operaciones() {
  const maxHorario = Math.max(...HORARIOS_INCIDENCIA.map((h) => h.valor));
  const maxConsumo = Math.max(...CONSUMO_COMBUSTIBLE.map((c) => c.galones));
  const pico = HORARIOS_INCIDENCIA.reduce((a, b) => (b.valor > a.valor ? b : a));

  const proximos = UNIDADES.filter((u) =>
    /^\d{2}\/\d{2}\/\d{4}$/.test(u.proximoMantenimiento),
  ).slice(0, 4);

  const resumen = [
    { etiqueta: "Unidades operativas", valor: "8", nota: "De 11 en total" },
    { etiqueta: "Conductores en turno", valor: "9", nota: "De 12 habilitados" },
    { etiqueta: "Franja de mayor carga", valor: pico.franja, nota: `${pico.valor} emergencias` },
    { etiqueta: "Combustible del mes", valor: "667", nota: "Galones consumidos" },
  ];

  return (
    <div className={`${styles.contenido} ${styles.moduloEjecutivo}`}>
      <header className={styles.encabezado}>
        <div>
          <p className={styles.migas}>
            Dashboard ejecutivo <span data-acento="">·</span> Operaciones
          </p>
          <h1 className={styles.titulo}>Operaciones</h1>
          <p className={styles.subtitulo}>
            Estado de la flota, disponibilidad de conductores, incidencia por
            franja horaria y consumo de recursos.
          </p>
        </div>
      </header>

      <section className={styles.kpis}>
        {resumen.map((dato) => (
          <article key={dato.etiqueta} className={styles.kpi}>
            <span className={styles.kpiEtiqueta}>{dato.etiqueta}</span>
            <span className={styles.kpiValor}>{dato.valor}</span>
            <span className={styles.kpiPie}>{dato.nota}</span>
          </article>
        ))}
      </section>

      <section className={styles.tarjeta}>
        <div className={styles.tarjetaEncabezado}>
          <h2 className={styles.tarjetaTitulo}>Estado de unidades</h2>
          <span className={styles.tarjetaNota}>{UNIDADES.length} unidades</span>
        </div>

        <div className={styles.tablaEnvoltura}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Unidad</th>
                <th>Tipo</th>
                <th>Conductor asignado</th>
                <th>Kilometraje</th>
                <th>Combustible</th>
                <th>Próx. mantenimiento</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {UNIDADES.map((unidad) => (
                <tr key={unidad.id}>
                  <td className={styles.celdaNumero}>{unidad.id}</td>
                  <td>{unidad.tipo}</td>
                  <td>{unidad.conductor}</td>
                  <td>{unidad.kilometraje.toLocaleString("es-PE")} km</td>
                  <td>{unidad.combustible}%</td>
                  <td>{unidad.proximoMantenimiento}</td>
                  <td>
                    <span className={CLASES_ESTADO[unidad.estado]}>
                      <span
                        className={styles.puntoEstado}
                        style={{ background: "currentColor" }}
                      />
                      {unidad.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.rejillaAncha}>
        <article className={styles.tarjeta}>
          <div className={styles.tarjetaEncabezado}>
            <h2 className={styles.tarjetaTitulo}>Horarios de mayor incidencia</h2>
            <span className={styles.tarjetaNota}>Emergencias por franja</span>
          </div>

          <div className={styles.columnas}>
            {HORARIOS_INCIDENCIA.map((franja, i) => (
              <div key={franja.franja} className={styles.columna}>
                <span className={styles.columnaValor}>{franja.valor}</span>
                <span
                  className={styles.columnaBarra}
                  style={{
                    height: `${(franja.valor / maxHorario) * 100}%`,
                    animationDelay: `${i * 80}ms`,
                  }}
                />
                <span className={styles.columnaEtiqueta}>{franja.franja}</span>
              </div>
            ))}
          </div>
        </article>

        <article className={styles.tarjeta}>
          <div className={styles.tarjetaEncabezado}>
            <h2 className={styles.tarjetaTitulo}>Consumo de combustible</h2>
            <span className={styles.tarjetaNota}>Galones · este mes</span>
          </div>

          <div className={styles.barras}>
            {CONSUMO_COMBUSTIBLE.map((consumo, i) => (
              <div key={consumo.unidad} className={styles.barraFila}>
                <span>{consumo.unidad}</span>
                <span className={styles.barraValor}>{consumo.galones}</span>
                <span className={styles.barraPista}>
                  <span
                    className={styles.barraRelleno}
                    style={{
                      width: `${(consumo.galones / maxConsumo) * 100}%`,
                      background:
                        "linear-gradient(90deg, var(--acento), rgba(229,55,42,0.3))",
                      animationDelay: `${i * 90}ms`,
                    }}
                  />
                </span>
              </div>
            ))}
          </div>

          <div className={styles.tarjetaEncabezado} style={{ marginTop: "1.75rem" }}>
            <h2 className={styles.tarjetaTitulo}>Mantenimientos programados</h2>
          </div>
          <div className={styles.progresoLista}>
            {proximos.map((unidad) => (
              <div key={unidad.id} className={styles.progresoFila}>
                <span>
                  {unidad.id} · {unidad.tipo}
                </span>
                <span className={styles.barraValor}>
                  {unidad.proximoMantenimiento}
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
