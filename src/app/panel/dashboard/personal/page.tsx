import type { Metadata } from "next";
import {
  CAPACITACIONES,
  GUARDIAS_SECCION,
  METRICAS_PERSONAL,
  PARTICIPACION_PERSONAL,
} from "@/lib/datos-demo";
import styles from "../../panel.module.css";

export const metadata: Metadata = { title: "Personal" };

export default function Personal() {
  const maxEmergencias = Math.max(
    ...PARTICIPACION_PERSONAL.map((p) => p.emergencias),
  );

  return (
    <div className={`${styles.contenido} ${styles.moduloEjecutivo}`}>
      <header className={styles.encabezado}>
        <div>
          <p className={styles.migas}>
            Dashboard ejecutivo <span data-acento="">·</span> Personal
          </p>
          <h1 className={styles.titulo}>Personal</h1>
          <p className={styles.subtitulo}>
            Asistencia, cumplimiento de guardias, horas de servicio,
            capacitaciones y participación en emergencias.
          </p>
        </div>
      </header>

      <section className={styles.kpis}>
        {METRICAS_PERSONAL.map((dato) => (
          <article key={dato.etiqueta} className={styles.kpi}>
            <span className={styles.kpiEtiqueta}>{dato.etiqueta}</span>
            <span className={styles.kpiValor}>{dato.valor}</span>
            <span className={styles.kpiPie}>{dato.nota}</span>
          </article>
        ))}
      </section>

      <section className={styles.rejillaAncha}>
        <article className={styles.tarjeta}>
          <div className={styles.tarjetaEncabezado}>
            <h2 className={styles.tarjetaTitulo}>Participación en emergencias</h2>
            <span className={styles.tarjetaNota}>Top del mes</span>
          </div>

          <div className={styles.tablaEnvoltura}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Bombero</th>
                  <th>Sección</th>
                  <th>Emergencias</th>
                  <th>Horas</th>
                  <th>Guardias</th>
                  <th>Asistencia</th>
                </tr>
              </thead>
              <tbody>
                {PARTICIPACION_PERSONAL.map((bombero) => (
                  <tr key={bombero.nombre}>
                    <td style={{ color: "var(--bone)" }}>{bombero.nombre}</td>
                    <td>{bombero.seccion}</td>
                    <td>
                      <span className={styles.barraValor}>
                        {bombero.emergencias}
                      </span>
                      <span className={styles.barraPista} style={{ marginTop: "0.3rem" }}>
                        <span
                          className={styles.barraRelleno}
                          style={{
                            width: `${(bombero.emergencias / maxEmergencias) * 100}%`,
                            background:
                              "linear-gradient(90deg, var(--acento), rgba(229,55,42,0.3))",
                          }}
                        />
                      </span>
                    </td>
                    <td>{bombero.horas}</td>
                    <td>{bombero.guardias}</td>
                    <td>{bombero.asistencia}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className={styles.tarjeta}>
          <div className={styles.tarjetaEncabezado}>
            <h2 className={styles.tarjetaTitulo}>Cumplimiento de guardias</h2>
            <span className={styles.tarjetaNota}>Por sección</span>
          </div>

          <div className={styles.barras}>
            {GUARDIAS_SECCION.map((seccion, i) => (
              <div key={seccion.seccion} className={styles.barraFila}>
                <span>{seccion.seccion}</span>
                <span className={styles.barraValor}>{seccion.cumplimiento}%</span>
                <span className={styles.barraPista}>
                  <span
                    className={styles.barraRelleno}
                    style={{
                      width: `${seccion.cumplimiento}%`,
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
            <h2 className={styles.tarjetaTitulo}>Capacitaciones</h2>
          </div>
          <div className={styles.progresoLista}>
            {CAPACITACIONES.map((capacitacion) => (
              <div key={capacitacion.nombre} className={styles.progresoFila}>
                <span>
                  {capacitacion.nombre}
                  <span className={styles.celdaSecundaria}>
                    {capacitacion.fecha} · {capacitacion.inscritos} inscritos
                  </span>
                </span>
                <span
                  className={`${styles.etiqueta} ${
                    capacitacion.estado === "Dictada"
                      ? styles.estadoAtendido
                      : styles.estadoEnProceso
                  }`}
                >
                  {capacitacion.estado}
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
