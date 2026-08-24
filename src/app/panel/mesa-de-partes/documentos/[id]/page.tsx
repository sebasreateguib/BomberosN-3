import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { documentoPorId } from "@/lib/datos-demo";
import { EtiquetaEstado, EtiquetaPrioridad } from "../../Etiquetas";
import { IconChispa, IconDescarga } from "../../../iconos";
import styles from "../../../panel.module.css";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const documento = documentoPorId(id);
  return { title: documento?.numero ?? "Documento" };
}

export default async function DetalleDocumento({ params }: Props) {
  const { id } = await params;
  const documento = documentoPorId(id);

  if (!documento) {
    notFound();
  }

  return (
    <div className={`${styles.contenido} ${styles.moduloMesa}`}>
      <header className={styles.encabezado}>
        <div>
          <p className={styles.migas}>
            <Link href="/panel/mesa-de-partes/documentos">Bandeja documental</Link>
            <span data-acento="">·</span> {documento.tipo}
          </p>
          <h1 className={styles.titulo}>{documento.numero}</h1>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <EtiquetaPrioridad prioridad={documento.prioridad} />
          <EtiquetaEstado estado={documento.estado} />
          <button type="button" className={styles.botonSecundario}>
            <IconDescarga width={14} height={14} />
            Descargar
          </button>
        </div>
      </header>

      <div className={styles.detalle}>
        <section className={styles.tarjeta}>
          <p className={styles.asuntoDestacado}>{documento.asunto}</p>

          <div className={styles.ficha}>
            {[
              ["Remitente", documento.origen],
              ["Área responsable", documento.destino],
              ["Vía de ingreso", documento.via],
              ["Folios", `${documento.folios}`],
              ["Fecha de ingreso", documento.fechaIngreso],
              ["Plazo de atención", documento.plazo],
              ["Código único", `F3-${documento.id}`],
              ["Tipo documental", documento.tipo],
            ].map(([etiqueta, valor]) => (
              <div key={etiqueta} className={styles.fichaDato}>
                <span className={styles.fichaEtiqueta}>{etiqueta}</span>
                <span className={styles.fichaValor}>{valor}</span>
              </div>
            ))}
          </div>

          <div className={styles.iaCaja} style={{ marginTop: "1.75rem" }}>
            <span className={styles.iaTitulo}>
              <IconChispa width={13} height={13} />
              Clasificación por inteligencia artificial
            </span>
            <span className={styles.iaValor}>{documento.clasificacionIA}</span>
            <span className={styles.medidor}>
              <span
                className={styles.medidorRelleno}
                style={{ width: `${documento.confianzaIA}%` }}
              />
            </span>
            <span className={styles.lineaMeta}>
              Confianza del modelo: {documento.confianzaIA}%
            </span>
          </div>
        </section>

        <section className={styles.tarjeta}>
          <div className={styles.tarjetaEncabezado}>
            <h2 className={styles.tarjetaTitulo}>Trazabilidad</h2>
          </div>

          <div className={styles.linea}>
            {documento.trazabilidad.map((etapa) => (
              <div key={etapa.etapa} className={styles.lineaItem}>
                <span
                  className={`${styles.lineaPunto} ${
                    etapa.completada ? styles.lineaPuntoHecho : ""
                  }`}
                />
                <div className={styles.lineaContenido}>
                  <span
                    className={`${styles.lineaEtapa} ${
                      etapa.completada ? "" : styles.pendienteTexto
                    }`}
                  >
                    {etapa.etapa}
                  </span>
                  <span className={styles.lineaMeta}>
                    {etapa.completada
                      ? `${etapa.fecha} · ${etapa.hora} · ${etapa.responsable}`
                      : "Pendiente"}
                  </span>
                  <span className={styles.lineaDetalle}>{etapa.detalle}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
