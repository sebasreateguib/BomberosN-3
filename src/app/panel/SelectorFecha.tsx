"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { IconChevron } from "./iconos";
import styles from "./panel.module.css";

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

/** Semana peruana: empieza en lunes, no en domingo. */
const DIAS = ["L", "M", "M", "J", "V", "S", "D"];

/** "2026-08-05" → "05/08/2026", el orden que se usa en el Perú. */
export function formatearFecha(iso: string) {
  const [anio, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${anio}`;
}

function aIso(anio: number, mes: number, dia: number) {
  return `${anio}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

/** Descompone el ISO sin pasar por Date, que interpreta UTC y corre un día. */
function partes(iso: string) {
  const [anio, mes, dia] = iso.split("-").map(Number);
  return { anio, mes: mes - 1, dia };
}

/** Suma días sobre el calendario real, con desborde de mes y de año. */
function correr(iso: string, dias: number) {
  const { anio, mes, dia } = partes(iso);
  const d = new Date(anio, mes, dia + dias);
  return aIso(d.getFullYear(), d.getMonth(), d.getDate());
}

function correrMes(iso: string, meses: number) {
  const { anio, mes, dia } = partes(iso);
  // El día se recorta al último del mes destino: 31 de enero + 1 mes es
  // 28 de febrero, no el 3 de marzo que devolvería Date por sí solo.
  const ultimo = new Date(anio, mes + meses + 1, 0).getDate();
  const d = new Date(anio, mes + meses, Math.min(dia, ultimo));
  return aIso(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Casillas del mes, con los huecos de la primera semana en null. */
function rejilla(anio: number, mes: number) {
  const primero = new Date(anio, mes, 1).getDay();
  const hueco = (primero + 6) % 7; // domingo (0) pasa a ser el séptimo
  const total = new Date(anio, mes + 1, 0).getDate();
  const casillas: (number | null)[] = Array(hueco).fill(null);
  for (let d = 1; d <= total; d++) casillas.push(d);
  return casillas;
}

type Props = {
  etiqueta: string;
  /** Fecha en ISO ("2026-08-05"); es el formato que viaja, no el que se ve. */
  valor: string;
  onCambio: (iso: string) => void;
};

/**
 * Calendario propio para elegir la fecha del documento. Antes era un
 * campo de texto libre, que admitía cualquier cosa; ahora la fecha se
 * escoge y siempre sale en día/mes/año. El <input type="date"> nativo
 * queda descartado por lo mismo que el <select>: dibuja su panel con
 * los estilos del sistema y en el orden que decide el navegador.
 */
export function SelectorFecha({ etiqueta, valor, onCambio }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [foco, setFoco] = useState(valor);
  const [haciaArriba, setHaciaArriba] = useState(false);
  const envoltura = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const casillaFoco = useRef<HTMLButtonElement>(null);
  const id = useId();

  const vista = partes(foco);

  useEffect(() => {
    if (!abierto) return;

    function fuera(evento: PointerEvent | FocusEvent) {
      const destino = evento.target as Node | null;
      if (destino && !envoltura.current?.contains(destino)) setAbierto(false);
    }

    document.addEventListener("pointerdown", fuera);
    document.addEventListener("focusin", fuera);
    return () => {
      document.removeEventListener("pointerdown", fuera);
      document.removeEventListener("focusin", fuera);
    };
  }, [abierto]);

  // Mismo motivo que en el combo: el cuerpo del panel recorta, así que
  // si no cabe abajo el calendario se despliega hacia arriba.
  useLayoutEffect(() => {
    if (!abierto) return;

    const boton = envoltura.current;
    const caja = panel.current;
    if (!boton || !caja) return;

    const marco = boton.getBoundingClientRect();
    const alto = caja.offsetHeight + 4;

    let tope = 0;
    let fondo = window.innerHeight;
    for (let n = boton.parentElement; n; n = n.parentElement) {
      const desborde = getComputedStyle(n).overflowY;
      if (desborde === "auto" || desborde === "scroll") {
        const r = n.getBoundingClientRect();
        tope = Math.max(tope, r.top);
        fondo = Math.min(fondo, r.bottom);
        break;
      }
    }

    const cabeAbajo = marco.bottom + alto <= fondo;
    const cabeArriba = marco.top - alto >= tope;
    setHaciaArriba(!cabeAbajo && cabeArriba);
  }, [abierto]);

  // El día enfocado lleva el foco real del teclado: es lo que permite
  // recorrer el mes con las flechas sin perder el lector de pantalla.
  useEffect(() => {
    if (abierto) casillaFoco.current?.focus();
  }, [abierto, foco]);

  function abrir() {
    setFoco(valor);
    setAbierto(true);
  }

  function elegir(iso: string) {
    onCambio(iso);
    setAbierto(false);
  }

  function teclado(evento: React.KeyboardEvent<HTMLDivElement>) {
    const saltos: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };

    if (evento.key in saltos) {
      evento.preventDefault();
      setFoco((f) => correr(f, saltos[evento.key]));
      return;
    }

    switch (evento.key) {
      case "PageUp":
        evento.preventDefault();
        setFoco((f) => correrMes(f, -1));
        break;
      case "PageDown":
        evento.preventDefault();
        setFoco((f) => correrMes(f, 1));
        break;
      case "Home":
        evento.preventDefault();
        setFoco((f) => aIso(partes(f).anio, partes(f).mes, 1));
        break;
      case "End": {
        evento.preventDefault();
        setFoco((f) => {
          const { anio, mes } = partes(f);
          return aIso(anio, mes, new Date(anio, mes + 1, 0).getDate());
        });
        break;
      }
      case "Enter":
      case " ":
        evento.preventDefault();
        elegir(foco);
        break;
      case "Escape":
        evento.preventDefault();
        setAbierto(false);
        break;
    }
  }

  return (
    <div className={styles.campo}>
      <span className={styles.campoEtiqueta} id={`${id}-etiqueta`}>
        {etiqueta}
      </span>

      <div className={styles.selector} ref={envoltura}>
        <button
          type="button"
          className={`${styles.control} ${styles.selectorBoton} ${
            abierto ? styles.selectorAbierto : ""
          }`}
          aria-haspopup="dialog"
          aria-expanded={abierto}
          aria-labelledby={`${id}-etiqueta`}
          onClick={() => (abierto ? setAbierto(false) : abrir())}
        >
          <span className={styles.selectorValor}>{formatearFecha(valor)}</span>
          <span className={styles.fechaPatron}>dd/mm/aaaa</span>
        </button>

        {abierto && (
          <div
            className={`${styles.calendario} ${
              haciaArriba ? styles.selectorListaArriba : ""
            }`}
            role="dialog"
            aria-modal="false"
            aria-labelledby={`${id}-mes`}
            ref={panel}
            onKeyDown={teclado}
          >
            <div className={styles.calendarioBarra}>
              <button
                type="button"
                className={styles.calendarioPaso}
                onClick={() => setFoco((f) => correrMes(f, -1))}
                aria-label="Mes anterior"
                tabIndex={-1}
              >
                <IconChevron width={13} height={13} style={{ transform: "rotate(90deg)" }} />
              </button>

              <span className={styles.calendarioMes} id={`${id}-mes`} aria-live="polite">
                {MESES[vista.mes]} {vista.anio}
              </span>

              <button
                type="button"
                className={styles.calendarioPaso}
                onClick={() => setFoco((f) => correrMes(f, 1))}
                aria-label="Mes siguiente"
                tabIndex={-1}
              >
                <IconChevron width={13} height={13} style={{ transform: "rotate(-90deg)" }} />
              </button>
            </div>

            <div className={styles.calendarioSemana} aria-hidden="true">
              {DIAS.map((dia, i) => (
                <span key={i}>{dia}</span>
              ))}
            </div>

            <div className={styles.calendarioRejilla} role="grid">
              {rejilla(vista.anio, vista.mes).map((dia, i) => {
                if (dia === null) return <span key={`h${i}`} />;

                const iso = aIso(vista.anio, vista.mes, dia);
                const elegido = iso === valor;
                return (
                  <button
                    key={iso}
                    type="button"
                    ref={iso === foco ? casillaFoco : undefined}
                    tabIndex={iso === foco ? 0 : -1}
                    className={`${styles.calendarioDia} ${
                      elegido ? styles.calendarioElegido : ""
                    }`}
                    aria-pressed={elegido}
                    aria-label={`${dia} de ${MESES[vista.mes]} de ${vista.anio}`}
                    onClick={() => elegir(iso)}
                  >
                    {dia}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
