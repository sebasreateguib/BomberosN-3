import type { Metadata } from "next";
import { DOCUMENTOS } from "@/lib/datos-demo";
import { TablaDocumentos } from "./TablaDocumentos";
import styles from "../../panel.module.css";

export const metadata: Metadata = { title: "Bandeja documental" };

export default function Bandeja() {
  return (
    <div className={`${styles.contenido} ${styles.moduloMesa}`}>
      <header className={styles.encabezado}>
        <div>
          <p className={styles.migas}>
            Mesa de Partes <span data-acento="">·</span> Bandeja
          </p>
          <h1 className={styles.titulo}>Bandeja documental</h1>
          <p className={styles.subtitulo}>
            {DOCUMENTOS.length} documentos registrados en el período. Cada uno
            cuenta con un código único que permite conocer su estado, ubicación
            y responsable en tiempo real.
          </p>
        </div>
      </header>

      <section className={styles.tarjeta}>
        <TablaDocumentos documentos={DOCUMENTOS} />
      </section>
    </div>
  );
}
