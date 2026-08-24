import type { Metadata } from "next";
import { HISTORIAL_GENERADOS } from "@/lib/datos-demo";
import styles from "../../panel.module.css";

export const metadata: Metadata = { title: "Historial de documentos generados" };

const CLASES_ESTADO: Record<string, string> = {
  Borrador: styles.estadoPendiente,
  Validado: styles.estadoEnProceso,
  Enviado: styles.estadoAtendido,
};

export default function Historial() {
  const promedio = Math.round(
    HISTORIAL_GENERADOS.reduce((s, d) => s + d.segundos, 0) /
      HISTORIAL_GENERADOS.length,
  );

  const resumen = [
    { etiqueta: "Documentos generados", valor: `${HISTORIAL_GENERADOS.length}`, nota: "Este mes" },
    { etiqueta: "Tiempo promedio", valor: `${promedio}s`, nota: "Por documento" },
    { etiqueta: "Horas ahorradas", valor: "18", nota: "Estimado del mes" },
    { etiqueta: "Uniformidad", valor: "100%", nota: "Formato institucional" },
  ];

  return (
    <div className={`${styles.contenido} ${styles.moduloAgente}`}>
      <header className={styles.encabezado}>
        <div>
          <p className={styles.migas}>
            Agente IA <span data-acento="">·</span> Historial
          </p>
          <h1 className={styles.titulo}>Documentos generados</h1>
          <p className={styles.subtitulo}>
            Todos los documentos producidos por el agente quedan registrados
            con su autor, fecha y estado de validación.
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
          <h2 className={styles.tarjetaTitulo}>Registro de generación</h2>
          <span className={styles.tarjetaNota}>Agosto 2026</span>
        </div>

        <div className={styles.tablaEnvoltura}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Documento</th>
                <th>Asunto</th>
                <th>Destinatario</th>
                <th>Autor</th>
                <th>Fecha</th>
                <th>Tiempo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {HISTORIAL_GENERADOS.map((documento) => (
                <tr key={documento.id}>
                  <td className={styles.celdaNumero}>{documento.numero}</td>
                  <td className={styles.celdaAsunto}>{documento.asunto}</td>
                  <td>{documento.destinatario}</td>
                  <td>{documento.autor}</td>
                  <td>{documento.fecha}</td>
                  <td>{documento.segundos}s</td>
                  <td>
                    <span
                      className={`${styles.etiqueta} ${
                        CLASES_ESTADO[documento.estado]
                      }`}
                    >
                      {documento.estado}
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
