import type { Metadata } from "next";
import { obtenerSesion } from "@/lib/sesion";
import { Generador } from "./Generador";
import styles from "../panel.module.css";

export const metadata: Metadata = { title: "Agente IA documental" };

export default async function AgenteIA() {
  const bombero = await obtenerSesion();
  const autor = bombero
    ? `${bombero.grado} ${bombero.nombre}`
    : "Administración France N° 3";

  return (
    <div className={`${styles.contenido} ${styles.moduloAgente}`}>
      <header className={styles.encabezado}>
        <div>
          <p className={styles.migas}>
            Proyecto 2 <span data-acento="">·</span> Agente de inteligencia
            artificial
          </p>
          <h1 className={styles.titulo}>Generación de documentos</h1>
          <p className={styles.subtitulo}>
            Documentos institucionales listos en minutos con solo unos pocos
            datos. El agente aplica los formatos, reglamentos y lineamientos de
            la Compañía para asegurar calidad, coherencia y uniformidad.
          </p>
        </div>
      </header>

      <Generador autor={autor} />
    </div>
  );
}
