import { redirect } from "next/navigation";
import { obtenerSesion } from "@/lib/sesion";
import { salir } from "./actions";
import { Sidebar } from "./Sidebar";
import { IconBuscar, IconCampana, IconSalir } from "./iconos";
import styles from "./panel.module.css";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const bombero = await obtenerSesion();

  if (!bombero) {
    redirect("/login");
  }

  return (
    <div className={styles.app}>
      <Sidebar />

      <div className={styles.principal}>
        <header className={styles.barra}>
          <label className={styles.buscador}>
            <IconBuscar width={15} height={15} />
            <input
              type="search"
              placeholder="Buscar documento, número o remitente…"
              aria-label="Buscar en el sistema"
            />
            <kbd>⌘K</kbd>
          </label>

          <div className={styles.acciones}>
            <button
              type="button"
              className={styles.iconoBoton}
              aria-label="Notificaciones"
            >
              <IconCampana width={16} height={16} />
              <span className={styles.avisoPunto} />
            </button>

            <div className={styles.usuario}>
              <span className={styles.avatar}>{bombero.iniciales}</span>
              <span className={styles.usuarioMeta}>
                <span className={styles.usuarioNombre}>
                  {bombero.grado} {bombero.nombre.split(" ")[0]}{" "}
                  {bombero.nombre.split(" ")[1]}
                </span>
                <span className={styles.usuarioCargo}>{bombero.cargo}</span>
              </span>
              <form action={salir}>
                <button
                  type="submit"
                  className={styles.iconoBoton}
                  aria-label="Cerrar sesión"
                  title="Cerrar sesión"
                >
                  <IconSalir width={16} height={16} />
                </button>
              </form>
            </div>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
