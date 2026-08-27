import Image from "next/image";
import { LoginFormMinimal } from "./LoginFormMinimal";
import styles from "./login-minimal.module.css";

/**
 * Versión minimalista del acceso institucional: una sola columna
 * centrada, sin video de fondo, sin marcos ni reloj de estación.
 *
 * Guardada aquí fuera del enrutador para no perderla mientras el
 * /login vuelve a usar la versión anterior. Para reactivarla basta
 * con que `src/app/login/page.tsx` la renderice:
 *
 *   import { LoginMinimal } from "@/components/login-minimal/LoginMinimal";
 *   export default function LoginPage() {
 *     return <LoginMinimal />;
 *   }
 *
 * Los metadatos (`export const metadata`) viven en la página, no aquí.
 */
export function LoginMinimal() {
  return (
    <main className={styles.page}>
      <div className={styles.rail} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.shell}>
        <header className={styles.identity}>
          <div
            className={`${styles.crest} ${styles.enter}`}
            style={{ "--d": "60ms" } as React.CSSProperties}
          >
            <Image
              src="/logo2.jpg"
              alt="Escudo de la Compañía de Bomberos France N°3"
              fill
              sizes="52px"
              priority
            />
          </div>

          <h1
            className={`${styles.name} ${styles.enter}`}
            style={{ "--d": "140ms" } as React.CSSProperties}
          >
            France N°3
          </h1>

          <p
            className={`${styles.motto} ${styles.enter}`}
            style={{ "--d": "220ms" } as React.CSSProperties}
          >
            «&nbsp;Sauver ou Périr&nbsp;»
          </p>
        </header>

        <div
          className={styles.enter}
          style={{ "--d": "320ms" } as React.CSSProperties}
        >
          <LoginFormMinimal />
        </div>
      </div>

      <footer className={styles.foot}>
        © {new Date().getFullYear()} Compañía de Bomberos Voluntarios France N°3
      </footer>
    </main>
  );
}
