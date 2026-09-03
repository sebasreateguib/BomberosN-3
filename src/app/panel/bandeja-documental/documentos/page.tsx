import type { Metadata } from "next";
import { DOCUMENTOS } from "@/lib/datos-demo";
import { TablaDocumentos } from "./TablaDocumentos";
import styles from "../../panel.module.css";

export const metadata: Metadata = { title: "Documentos" };

export default function Bandeja() {
  return (
    <div className={`${styles.contenido} ${styles.moduloMesa}`}>
      <header className={styles.encabezado}>
        <div>
          <p className={styles.migas}>
            Bandeja Documental <span data-acento="">·</span> Listado
          </p>
          <h1 className={styles.titulo}>Documentos</h1>
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
