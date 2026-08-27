"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ingresarComoDemo, solicitarAcceso } from "@/app/login/actions";
import { estadoInicial } from "@/app/login/estado";
import {
  IconAlert,
  IconCapsLock,
  IconCheck,
  IconCheckLarge,
  IconEye,
  IconEyeOff,
} from "@/app/login/icons";
import styles from "./login-minimal.module.css";

export function LoginFormMinimal() {
  const [estado, enviar, pendiente] = useActionState(
    solicitarAcceso,
    estadoInicial,
  );
  // React reinicia el formulario tras ejecutar la acción: el usuario se
  // mantiene controlado para no perderlo en un intento fallido (la
  // contraseña sí se limpia, a propósito).
  const [usuario, setUsuario] = useState("");
  const [verClave, setVerClave] = useState(false);
  const [mayusculas, setMayusculas] = useState(false);
  const [entrandoDemo, iniciarDemo] = useTransition();
  const router = useRouter();

  // Tras conceder el acceso se deja ver la confirmación un instante y se
  // entra al panel.
  useEffect(() => {
    if (estado.estado !== "concedido") return;
    const id = window.setTimeout(() => router.push("/panel"), 1400);
    return () => window.clearTimeout(id);
  }, [estado, router]);

  const detectarMayusculas = (evento: React.KeyboardEvent<HTMLInputElement>) => {
    setMayusculas(evento.getModifierState?.("CapsLock") ?? false);
  };

  if (estado.estado === "concedido") {
    return (
      <div className={styles.granted}>
        <div className={styles.grantedMark}>
          <IconCheckLarge />
        </div>
        <h2 className={styles.grantedTitle}>Acceso concedido</h2>
        <p className={styles.grantedText}>
          Bienvenido, {estado.grado}{" "}
          <strong style={{ textTransform: "capitalize" }}>
            {estado.nombre}
          </strong>
        </p>
        <div className={styles.progress}>
          <i />
        </div>
      </div>
    );
  }

  const error = estado.estado === "error" ? estado : null;

  return (
    <>
      <form className={styles.form} action={enviar} noValidate>
        <div className={styles.field} data-invalid={error?.campo === "usuario"}>
          <label className={styles.label} htmlFor="usuario">
            Código institucional o correo
          </label>
          <div className={styles.inputWrap}>
            <input
              id="usuario"
              name="usuario"
              type="text"
              className={styles.input}
              placeholder="b-1866 · nombre@france3.pe"
              value={usuario}
              onChange={(evento) => setUsuario(evento.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              disabled={pendiente}
              aria-invalid={error?.campo === "usuario"}
            />
            <span className={styles.underline} />
          </div>
        </div>

        <div className={styles.field} data-invalid={error?.campo === "clave"}>
          <label className={styles.label} htmlFor="clave">
            Contraseña
          </label>
          <div className={styles.inputWrap}>
            <input
              id="clave"
              name="clave"
              type={verClave ? "text" : "password"}
              className={styles.input}
              placeholder="••••••••••"
              autoComplete="current-password"
              disabled={pendiente}
              aria-invalid={error?.campo === "clave"}
              onKeyDown={detectarMayusculas}
              onKeyUp={detectarMayusculas}
              onBlur={() => setMayusculas(false)}
            />
            <button
              type="button"
              className={styles.reveal}
              onClick={() => setVerClave((visible) => !visible)}
              aria-pressed={verClave}
              aria-label={
                verClave ? "Ocultar contraseña" : "Mostrar contraseña"
              }
            >
              {verClave ? <IconEyeOff /> : <IconEye />}
            </button>
            <span className={styles.underline} />
          </div>
          {mayusculas && (
            <p className={styles.hint}>
              <IconCapsLock />
              Bloq Mayús activado
            </p>
          )}
        </div>

        <div className={styles.options}>
          <label className={styles.check}>
            <input type="checkbox" name="recordar" disabled={pendiente} />
            <span className={styles.box}>
              <IconCheck />
            </span>
            Mantener sesión
          </label>
          <Link className={styles.link} href="/recuperar-acceso">
            ¿Olvidó su contraseña?
          </Link>
        </div>

        <div aria-live="polite">
          {error && (
            <p className={styles.alert} role="alert">
              <IconAlert width={15} height={15} />
              {error.mensaje}
            </p>
          )}
        </div>

        <button type="submit" className={styles.submit} disabled={pendiente}>
          <span className={styles.submitInner}>
            {pendiente ? (
              <>
                Verificando
                <span className={styles.dots} aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
              </>
            ) : (
              <>
                Ingresar
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h13" />
                  <path d="m12.5 6 6 6-6 6" />
                </svg>
              </>
            )}
          </span>
        </button>
      </form>

      <button
        type="button"
        className={styles.demo}
        onClick={() => iniciarDemo(() => ingresarComoDemo())}
        disabled={entrandoDemo || pendiente}
      >
        {entrandoDemo ? "Ingresando…" : "Entrar con perfil de demostración"}
      </button>

      <p className={styles.fine}>
        <code>b-1866</code> · <code>france1866</code>
      </p>

      <p className={styles.legal}>
        Uso exclusivo del personal autorizado. Los accesos quedan registrados.
      </p>
    </>
  );
}
