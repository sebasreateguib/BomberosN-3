import type { Metadata } from "next";
import {
  CONVENIOS,
  METRICAS_ADMINISTRACION,
  REQUERIMIENTOS,
  type Requerimiento,
} from "@/lib/datos-demo";
import styles from "../../panel.module.css";

export const metadata: Metadata = { title: "Administración" };

const CLASES_REQUERIMIENTO: Record<Requerimiento["estado"], string> = {
  Solicitado: styles.estadoPendiente,
  "En cotización": styles.estadoEnProceso,
  Aprobado: styles.estadoDerivado,
  Atendido: styles.estadoAtendido,
};

export default function Administracion() {
  return (
    <div className={`${styles.contenido} ${styles.moduloEjecutivo}`}>
      <header className={styles.encabezado}>
        <div>
          <p className={styles.migas}>
            Dashboard ejecutivo <span data-acento="">·</span> Administración
          </p>
          <h1 className={styles.titulo}>Administración</h1>
          <p className={styles.subtitulo}>
            Documentos pendientes, convenios vigentes, estado de requerimientos,
            compras y caja chica.
          </p>
        </div>
      </header>

      <section className={styles.kpis}>
        {METRICAS_ADMINISTRACION.map((dato) => (
          <article key={dato.etiqueta} className={styles.kpi}>
            <span className={styles.kpiEtiqueta}>{dato.etiqueta}</span>
            <span className={styles.kpiValor}>{dato.valor}</span>
            <span className={styles.kpiPie}>{dato.nota}</span>
          </article>
        ))}
      </section>

      <section className={styles.tarjeta}>
        <div className={styles.tarjetaEncabezado}>
          <h2 className={styles.tarjetaTitulo}>Requerimientos y compras</h2>
          <span className={styles.tarjetaNota}>Agosto 2026</span>
        </div>

        <div className={styles.tablaEnvoltura}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Código</th>
                <th>Descripción</th>
                <th>Sección</th>
                <th>Monto</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {REQUERIMIENTOS.map((requerimiento) => (
                <tr key={requerimiento.id}>
                  <td className={styles.celdaNumero}>{requerimiento.id}</td>
                  <td className={styles.celdaAsunto}>{requerimiento.descripcion}</td>
                  <td>{requerimiento.seccion}</td>
                  <td>{requerimiento.monto}</td>
                  <td>{requerimiento.fecha}</td>
                  <td>
                    <span
                      className={`${styles.etiqueta} ${
                        CLASES_REQUERIMIENTO[requerimiento.estado]
                      }`}
                    >
                      {requerimiento.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.tarjeta}>
        <div className={styles.tarjetaEncabezado}>
          <h2 className={styles.tarjetaTitulo}>Convenios institucionales</h2>
          <span className={styles.tarjetaNota}>{CONVENIOS.length} registrados</span>
        </div>

        <div className={styles.tablaEnvoltura}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Entidad</th>
                <th>Objeto</th>
                <th>Vence</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {CONVENIOS.map((convenio) => (
                <tr key={convenio.entidad}>
                  <td style={{ color: "var(--bone)" }}>{convenio.entidad}</td>
                  <td className={styles.celdaAsunto}>{convenio.objeto}</td>
                  <td>{convenio.vence}</td>
                  <td>
                    <span
                      className={`${styles.etiqueta} ${
                        convenio.estado === "Vigente"
                          ? styles.estadoAtendido
                          : styles.estadoPendiente
                      }`}
                    >
                      {convenio.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
