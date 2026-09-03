import Link from "next/link";
import type { Metadata } from "next";
import {
  EMERGENCIAS_DISTRITO,
  EMERGENCIAS_TIPO,
  KPIS_EJECUTIVO,
  UNIDADES,
} from "@/lib/datos-demo";
import { Combo, Dona } from "./Graficos";
import { IconFlecha } from "../iconos";
import styles from "../panel.module.css";

export const metadata: Metadata = { title: "Dashboard ejecutivo" };

const CLASES_UNIDAD = {
  Operativa: styles.segOperativa,
  "En mantenimiento": styles.segMantenimiento,
  "Fuera de servicio": styles.segFuera,
};

export default function DashboardEjecutivo() {
  const totalEmergencias = 128;
  const maxDistrito = Math.max(...EMERGENCIAS_DISTRITO.map((d) => d.valor));
  const operativas = UNIDADES.filter((u) => u.estado === "Operativa").length;
  const mantenimiento = UNIDADES.filter((u) => u.estado === "En mantenimiento").length;
  const fuera = UNIDADES.filter((u) => u.estado === "Fuera de servicio").length;

  return (
    <div className={`${styles.contenido} ${styles.moduloEjecutivo}`}>
      <header className={styles.encabezado}>
        <div>
          <p className={styles.migas}>
            Proyecto 2 <span data-acento="">·</span> Tablero de control
          </p>
          <h1 className={styles.titulo}>Dashboard ejecutivo</h1>
          <p className={styles.subtitulo}>
            Información operativa, administrativa y de personal integrada en
            una sola vista para la Jefatura y el Cuadro de Oficiales.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <span className={styles.chip}>05 de agosto de 2026</span>
          <span className={`${styles.chip} ${styles.chipActivo}`}>Este mes</span>
        </div>
      </header>

      <section className={styles.kpis}>
        {KPIS_EJECUTIVO.map((kpi) => {
          const variacion = "variacion" in kpi ? kpi.variacion : undefined;
          const mejorSube = "mejorSube" in kpi ? kpi.mejorSube : true;
          const buena =
            variacion === undefined
              ? true
              : mejorSube
                ? variacion >= 0
                : variacion <= 0;

          return (
            <article key={kpi.clave} className={styles.kpi}>
              <span className={styles.kpiEtiqueta}>{kpi.etiqueta}</span>
              <span className={styles.kpiValor}>
                {kpi.valor}
                {"total" in kpi && kpi.total ? (
                  <em style={{ fontStyle: "normal", color: "var(--muted-dim)" }}>
                    /{kpi.total}
                  </em>
                ) : null}
                {"unidad" in kpi && kpi.unidad ? (
                  <em
                    style={{
                      fontStyle: "normal",
                      fontSize: "1rem",
                      color: "var(--muted-dim)",
                    }}
                  >
                    {" "}
                    {kpi.unidad}
                  </em>
                ) : null}
              </span>
              <span className={styles.kpiPie}>
                {kpi.nota}
                {variacion !== undefined && (
                  <span
                    className={`${styles.kpiVariacion} ${
                      buena ? styles.subeBien : styles.subeMal
                    }`}
                  >
                    {variacion >= 0 ? "▲" : "▼"} {Math.abs(variacion)}% vs. mes
                    anterior
                  </span>
                )}
              </span>
            </article>
          );
        })}
      </section>

      <section className={styles.rejillaAncha}>
        <article className={`${styles.tarjeta} ${styles.tarjetaGrafico}`}>
          <div className={styles.tarjetaEncabezado}>
            <h2 className={styles.tarjetaTitulo}>Evolución mensual</h2>
            <span className={styles.tarjetaNota}>Marzo – agosto 2026</span>
          </div>
          <div className={styles.zonaGrafico}>
            <Combo />
          </div>
        </article>

        <article className={styles.tarjeta}>
          <div className={styles.tarjetaEncabezado}>
            <h2 className={styles.tarjetaTitulo}>Emergencias por tipo</h2>
            <span className={styles.tarjetaNota}>
              {EMERGENCIAS_TIPO.length} categorías
            </span>
          </div>
          <Dona total={totalEmergencias} />
        </article>
      </section>

      <section className={styles.rejilla}>
        <article className={`${styles.tarjeta} ${styles.tarjetaColumna}`}>
          <div className={styles.tarjetaEncabezado}>
            <h2 className={styles.tarjetaTitulo}>Emergencias por distrito</h2>
            <span className={styles.tarjetaNota}>Este mes</span>
          </div>
          <div className={`${styles.barras} ${styles.barrasRepartidas}`}>
            {EMERGENCIAS_DISTRITO.map((distrito, i) => (
              <div key={distrito.distrito} className={styles.barraFila}>
                <span>{distrito.distrito}</span>
                <span className={styles.barraValor}>{distrito.valor}</span>
                <span className={styles.barraPista}>
                  <span
                    className={styles.barraRelleno}
                    style={{
                      width: `${(distrito.valor / maxDistrito) * 100}%`,
                      background:
                        "linear-gradient(90deg, var(--acento), rgba(229,55,42,0.3))",
                      animationDelay: `${i * 90}ms`,
                    }}
                  />
                </span>
              </div>
            ))}
          </div>

          <p className={`${styles.tarjetaNota} ${styles.alFondo}`}>
            Cercado de Lima concentra el 34% de las salidas del mes.
          </p>
        </article>

        <article className={`${styles.tarjeta} ${styles.tarjetaColumna}`}>
          <div className={styles.tarjetaEncabezado}>
            <h2 className={styles.tarjetaTitulo}>Estado de la flota</h2>
            <Link className={styles.botonSecundario} href="/panel/dashboard/operaciones">
              Ver unidades
            </Link>
          </div>

          <div className={styles.segmentos}>
            {UNIDADES.map((unidad) => (
              <span
                key={unidad.id}
                className={`${styles.segmento} ${CLASES_UNIDAD[unidad.estado]}`}
                title={`${unidad.id} · ${unidad.estado}`}
              />
            ))}
          </div>

          <div className={styles.progresoLista} style={{ marginTop: "1.5rem" }}>
            {[
              ["Operativas", operativas, styles.unidadOperativa],
              ["En mantenimiento", mantenimiento, styles.unidadMantenimiento],
              ["Fuera de servicio", fuera, styles.unidadFuera],
            ].map(([etiqueta, cantidad, clase]) => (
              <div key={String(etiqueta)} className={styles.progresoFila}>
                <span className={String(clase)}>
                  <span
                    className={styles.puntoEstado}
                    style={{ background: "currentColor" }}
                  />
                  {etiqueta}
                </span>
                <span className={styles.barraValor}>
                  {cantidad} <em style={{ color: "var(--muted-dim)" }}>/ {UNIDADES.length}</em>
                </span>
              </div>
            ))}
          </div>

          <p className={`${styles.tarjetaNota} ${styles.alFondo}`}>
            Disponibilidad de conductores: 9 de 12 habilitados en turno.
          </p>
        </article>
      </section>

      <section className={styles.rejilla}>
        {[
          {
            href: "/panel/dashboard/operaciones" as const,
            titulo: "Operaciones",
            detalle: "Flota, conductores, incidencia horaria y combustible.",
          },
          {
            href: "/panel/dashboard/personal" as const,
            titulo: "Personal",
            detalle: "Asistencia, guardias, capacitaciones y participación.",
          },
          {
            href: "/panel/dashboard/administracion" as const,
            titulo: "Administración",
            detalle: "Requerimientos, convenios, compras y caja chica.",
          },
        ].map((acceso) => (
          <Link key={acceso.href} href={acceso.href} className={styles.tarjeta}>
            <div className={styles.tarjetaEncabezado}>
              <h2 className={styles.tarjetaTitulo}>{acceso.titulo}</h2>
              <IconFlecha width={15} height={15} />
            </div>
            <p className={styles.tarjetaNota}>{acceso.detalle}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
