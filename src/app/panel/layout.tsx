import { redirect } from "next/navigation";
import { obtenerSesion } from "@/lib/sesion";
import { salir } from "./actions";
import { Sidebar } from "./Sidebar";
import { IconSalir } from "./iconos";
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
          <div className={styles.acciones}>
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
