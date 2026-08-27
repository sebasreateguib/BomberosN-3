"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { IconCheck, IconChevron } from "./iconos";
import styles from "./panel.module.css";

type Props = {
  /** Rótulo del campo. Se dibuja arriba y titula el combo. */
  etiqueta: string;
  opciones: readonly string[];
  valor: string;
  onCambio: (valor: string) => void;
};

/**
 * Selector desplegable propio. El <select> nativo dibuja su lista con
 * los estilos del sistema operativo —fondo claro, tipografía ajena— y
 * en una consola oscura eso se ve como un parche. Aquí la lista es un
 * listbox nuestro, con las mismas superficies y filetes que el resto
 * del panel, y conserva el teclado que se espera de un select.
 */
export function Selector({ etiqueta, opciones, valor, onCambio }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [marcado, setMarcado] = useState(() =>
    Math.max(0, opciones.indexOf(valor)),
  );
  const [haciaArriba, setHaciaArriba] = useState(false);
  const envoltura = useRef<HTMLDivElement>(null);
  const lista = useRef<HTMLDivElement>(null);
  const id = useId();

  // Cierre al salir del combo: puntero fuera o foco que se va a otro
  // control. Sin esto la lista quedaría flotando sobre el formulario.
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

  // El cuerpo del panel recorta lo que se salga de su caja, así que un
  // combo cerca del borde inferior perdería media lista. Al abrir se
  // mide el hueco real y, si no alcanza abajo, la lista sube.
  useLayoutEffect(() => {
    if (!abierto) return;

    const boton = envoltura.current;
    const caja = lista.current;
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

  // La opción marcada siempre visible: la lista tiene alto máximo y el
  // recorrido con flechas puede salirse de la ventana.
  useEffect(() => {
    if (!abierto) return;
    const fila = lista.current?.children[marcado];
    fila?.scrollIntoView({ block: "nearest" });
  }, [abierto, marcado]);

  function abrir(indice: number) {
    setMarcado(Math.max(0, indice));
    setAbierto(true);
  }

  function elegir(indice: number) {
    onCambio(opciones[indice]);
    setAbierto(false);
  }

  function teclado(evento: React.KeyboardEvent<HTMLButtonElement>) {
    const actual = Math.max(0, opciones.indexOf(valor));

    switch (evento.key) {
      case "ArrowDown":
        evento.preventDefault();
        if (!abierto) abrir(actual);
        else setMarcado((i) => Math.min(opciones.length - 1, i + 1));
        break;
      case "ArrowUp":
        evento.preventDefault();
        if (!abierto) abrir(actual);
        else setMarcado((i) => Math.max(0, i - 1));
        break;
      case "Home":
        if (!abierto) break;
        evento.preventDefault();
        setMarcado(0);
        break;
      case "End":
        if (!abierto) break;
        evento.preventDefault();
        setMarcado(opciones.length - 1);
        break;
      case "Enter":
      case " ":
        evento.preventDefault();
        if (abierto) elegir(marcado);
        else abrir(actual);
        break;
      case "Escape":
        if (!abierto) break;
        evento.preventDefault();
        setAbierto(false);
        break;
      case "Tab":
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
          role="combobox"
          aria-controls={`${id}-lista`}
          aria-expanded={abierto}
          aria-haspopup="listbox"
          aria-labelledby={`${id}-etiqueta`}
          aria-activedescendant={abierto ? `${id}-op-${marcado}` : undefined}
          onClick={() => (abierto ? setAbierto(false) : abrir(opciones.indexOf(valor)))}
          onKeyDown={teclado}
        >
          <span className={styles.selectorValor}>{valor}</span>
          <IconChevron width={14} height={14} className={styles.selectorFlecha} />
        </button>

        {abierto && (
          <div
            className={`${styles.selectorLista} ${
              haciaArriba ? styles.selectorListaArriba : ""
            }`}
            id={`${id}-lista`}
            role="listbox"
            aria-labelledby={`${id}-etiqueta`}
            ref={lista}
          >
            {opciones.map((opcion, indice) => {
              const elegida = opcion === valor;
              return (
                <div
                  key={opcion}
                  id={`${id}-op-${indice}`}
                  role="option"
                  aria-selected={elegida}
                  className={`${styles.selectorOpcion} ${
                    indice === marcado ? styles.selectorMarcada : ""
                  } ${elegida ? styles.selectorElegida : ""}`}
                  onPointerMove={() => setMarcado(indice)}
                  onClick={() => elegir(indice)}
                >
                  <span className={styles.selectorTexto}>{opcion}</span>
                  {elegida && (
                    <IconCheck
                      width={13}
                      height={13}
                      className={styles.selectorVisto}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
