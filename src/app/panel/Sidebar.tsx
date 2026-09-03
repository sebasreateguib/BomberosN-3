"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  IconBandeja,
  IconCarpeta,
  IconEngranaje,
  IconGrafico,
  IconPersonal,
  IconTablero,
  IconUnidad,
} from "./iconos";
import styles from "./panel.module.css";

type Enlace = {
  href: string;
  texto: string;
  icono: React.ReactNode;
  contador?: number;
  proximamente?: boolean;
};

const GRUPOS: { titulo: string; tono: string; enlaces: Enlace[] }[] = [
  {
    titulo: "Bandeja Documental",
    tono: "#4a7ade",
    enlaces: [
      {
        href: "/panel/bandeja-documental",
        texto: "Resumen",
        icono: <IconTablero />,
      },
      {
        href: "/panel/bandeja-documental/documentos",
        texto: "Documentos",
        icono: <IconBandeja />,
        contador: 27,
      },
    ],
  },
  {
    titulo: "Dashboard ejecutivo",
    tono: "#e5372a",
    enlaces: [
      {
        href: "/panel/dashboard",
        texto: "Resumen ejecutivo",
        icono: <IconGrafico />,
      },
      {
        href: "/panel/dashboard/operaciones",
        texto: "Operaciones",
        icono: <IconUnidad />,
      },
      {
        href: "/panel/dashboard/personal",
        texto: "Personal",
        icono: <IconPersonal />,
      },
      {
        href: "/panel/dashboard/administracion",
        texto: "Administración",
        icono: <IconCarpeta />,
      },
    ],
  },
  {
    titulo: "Institución",
    tono: "#c9a24b",
    enlaces: [
      {
        href: "#",
        texto: "Configuración",
        icono: <IconEngranaje />,
        proximamente: true,
      },
    ],
  },
];

export function Sidebar() {
  const ruta = usePathname();
  // Se guarda la ruta en la que se abrió el menú: al navegar cambia la
  // ruta y el cajón se cierra solo, sin efectos ni renders en cascada.
  const [rutaDelMenu, setRutaDelMenu] = useState<string | null>(null);
  const abierto = rutaDelMenu === ruta;
  const cerrar = () => setRutaDelMenu(null);

  useEffect(() => {
    if (!abierto) return;
    const alPresionar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setRutaDelMenu(null);
    };
    window.addEventListener("keydown", alPresionar);
    return () => window.removeEventListener("keydown", alPresionar);
  }, [abierto]);

  return (
    <aside className={styles.sidebar} data-abierto={abierto}>
      {abierto && (
        <button
          type="button"
          className={styles.velo}
          onClick={cerrar}
          aria-label="Cerrar menú"
        />
      )}

      <div className={styles.marca}>
        <div className={styles.marcaEscudo}>
          <div className={styles.marcaEscudoInterior}>
            <Image
              src="/logo2.jpg"
              alt="Escudo France N°3"
              fill
              sizes="38px"
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
        <div className={styles.marcaTexto}>
          <span className={styles.marcaNombre}>France N°3</span>
          <span className={styles.marcaSub}>Gestión institucional</span>
        </div>

        <button
          type="button"
          className={styles.hamburguesa}
          onClick={() => setRutaDelMenu(abierto ? null : ruta)}
          aria-expanded={abierto}
          aria-controls="navegacion-principal"
          aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
        >
          <span className={styles.hamburguesaBarras} data-abierto={abierto} />
        </button>
      </div>

      <nav id="navegacion-principal" className={styles.nav}>
        {GRUPOS.map((grupo) => (
          <div key={grupo.titulo}>
            <p className={styles.grupoTitulo}>
              <span
                className={styles.grupoPunto}
                style={{ "--tono": grupo.tono } as React.CSSProperties}
              />
              {grupo.titulo}
            </p>
            <div className={styles.navGrupo}>
              {grupo.enlaces.map((enlace) =>
                enlace.proximamente ? (
                  <span
                    key={enlace.texto}
                    className={styles.enlace}
                    style={{ opacity: 0.42, cursor: "not-allowed" }}
                    title="Disponible en una siguiente fase"
                  >
                    <span className={styles.enlaceIcono}>{enlace.icono}</span>
                    {enlace.texto}
                  </span>
                ) : (
                  <Link
                    key={enlace.href}
                    href={enlace.href}
                    className={`${styles.enlace} ${
                      ruta === enlace.href ? styles.enlaceActivo : ""
                    }`}
                    onClick={cerrar}
                  >
                    <span className={styles.enlaceIcono}>{enlace.icono}</span>
                    {enlace.texto}
                    {enlace.contador ? (
                      <span className={styles.contador}>{enlace.contador}</span>
                    ) : null}
                  </Link>
                ),
              )}
            </div>
          </div>
        ))}
      </nav>

      <div className={styles.sidebarPie}>
        Maqueta de demostración · Datos ficticios
      </div>
    </aside>
  );
}
