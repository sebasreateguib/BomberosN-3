"use client";

import Image from "next/image";
import { useState } from "react";
import {
  DESTINATARIOS,
  PLANTILLAS,
  type DatosGeneracion,
  type Plantilla,
} from "@/lib/datos-demo";
import { descargarDocumentoPdf } from "@/lib/pdf-documento";
import { IconCopiar, IconDescarga, IconRedactar } from "../iconos";
import { Selector } from "../Selector";
import { SelectorFecha, formatearFecha } from "../SelectorFecha";
import styles from "../panel.module.css";

type Generado = {
  numero: string;
  plantilla: Plantilla;
  datos: DatosGeneracion;
  parrafos: string[];
};

const CORRELATIVO_INICIAL = 135;

// Anchos de las barras, agrupadas como los párrafos de la hoja real.
const FANTASMA_CAMPOS = ["58%", "82%", "44%", "94%", "36%", "51%"];
const FANTASMA_PARRAFOS = [
  ["96%", "91%", "97%", "68%"],
  ["93%", "98%", "89%", "94%", "54%"],
  ["95%", "87%", "72%"],
];

/**
 * Silueta del documento. La usan el estado vacío y el de carga: en
 * vacío queda quieta y sirve de anticipo de la forma; mientras el
 * agente redacta se anima. Reproduce la estructura de la hoja real
 * (membrete, número, metadatos, cuerpo y firma) y ocupa el alto
 * completo de la tarjeta, así que al llegar el documento no hay
 * salto de layout.
 */
function HojaFantasma({ animada }: { animada: boolean }) {
  return (
    <div
      className={`${styles.fantasma} ${animada ? styles.fantasmaActiva : ""}`}
      aria-hidden="true"
    >
      <div className={styles.fantasmaEncabezado}>
        <span className={styles.fantasmaEscudo} />
        <span className={styles.fantasmaMembrete}>
          <span className={styles.barraFantasma} style={{ width: "62%" }} />
          <span className={styles.barraFantasma} style={{ width: "44%" }} />
        </span>
      </div>

      <span className={styles.fantasmaTitulo} />

      <div className={styles.fantasmaCampos}>
        {FANTASMA_CAMPOS.map((ancho, i) => (
          <span
            key={i}
            className={styles.barraFantasma}
            style={{ width: ancho }}
          />
        ))}
      </div>

      <div className={styles.fantasmaCuerpo}>
        {FANTASMA_PARRAFOS.map((parrafo, i) => (
          <div key={i} className={styles.fantasmaParrafo}>
            {parrafo.map((ancho, j) => (
              <span
                key={j}
                className={styles.barraFantasma}
                style={{ width: ancho }}
              />
            ))}
          </div>
        ))}
      </div>

      <div className={styles.fantasmaFirma}>
        <span className={styles.barraFantasma} style={{ width: "74%" }} />
        <span className={styles.barraFantasma} style={{ width: "92%" }} />
      </div>
    </div>
  );
}

export function Generador({ autor }: { autor: string }) {
  const [plantilla, setPlantilla] = useState<Plantilla>(PLANTILLAS[0]);
  const [destinatario, setDestinatario] = useState(DESTINATARIOS[0]);
  const [asunto, setAsunto] = useState("");
  const [antecedentes, setAntecedentes] = useState("");
  // La fecha viaja en ISO y solo se traduce a día/mes/año al mostrarla.
  const [fecha, setFecha] = useState("2026-08-05");
  const [trabajando, setTrabajando] = useState(false);
  const [generado, setGenerado] = useState<Generado | null>(null);
  const [correlativo, setCorrelativo] = useState(CORRELATIVO_INICIAL);
  const [copiado, setCopiado] = useState(false);
  const [descargando, setDescargando] = useState(false);

  const listo = asunto.trim().length > 3;

  const generar = () => {
    if (!listo || trabajando) return;
    setTrabajando(true);
    setCopiado(false);

    // La redacción real la haría el modelo en el servidor; aquí se simula
    // el tiempo de respuesta para poder mostrar el flujo completo.
    window.setTimeout(() => {
      const datos: DatosGeneracion = {
        destinatario,
        asunto,
        antecedentes,
        fecha: formatearFecha(fecha),
      };
      setGenerado({
        numero: plantilla.encabezado.replace(
          "{n}",
          String(correlativo).padStart(3, "0"),
        ),
        plantilla,
        datos,
        parrafos: plantilla.cuerpo(datos),
      });
      setCorrelativo((n) => n + 1);
      setTrabajando(false);
    }, 1500);
  };

  const textoPlano = generado
    ? [
        generado.numero,
        "",
        `Destinatario: ${generado.datos.destinatario}`,
        `Asunto: ${generado.datos.asunto}`,
        `Fecha: ${generado.datos.fecha}`,
        "",
        ...generado.parrafos,
        "",
        generado.plantilla.cierre,
        "",
        autor,
        "Compañía de Bomberos Voluntarios France N° 3",
      ].join("\n")
    : "";

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(textoPlano);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  };

  const descargar = async () => {
    if (!generado || descargando) return;
    setDescargando(true);
    try {
      await descargarDocumentoPdf({ ...generado, autor });
    } finally {
      setDescargando(false);
    }
  };

  const estado = trabajando
    ? "Redactando…"
    : generado
      ? generado.numero
      : "Sin documento";

  return (
    <div className={styles.generador}>
      {/* ---------- Panel de datos ---------- */}
      <section className={styles.panel}>
        <div className={styles.panelBarra}>
          <h2 className={styles.panelTitulo}>Datos del documento</h2>
        </div>

        <div className={styles.panelCuerpo}>
          <div className={styles.formulario}>
            <div className={styles.campo}>
              <span className={styles.campoEtiqueta}>Tipo de documento</span>
              <div className={styles.selectorTipos}>
                {PLANTILLAS.map((opcion) => (
                  <button
                    key={opcion.id}
                    type="button"
                    className={`${styles.tipoOpcion} ${
                      plantilla.id === opcion.id ? styles.tipoActivo : ""
                    }`}
                    onClick={() => setPlantilla(opcion)}
                    aria-pressed={plantilla.id === opcion.id}
                    title={opcion.descripcion}
                  >
                    <span className={styles.tipoNombre}>{opcion.nombre}</span>
                  </button>
                ))}
              </div>
              <span className={styles.tipoDetalle}>{plantilla.descripcion}</span>
            </div>

            <div className={styles.filaCampos}>
              <Selector
                etiqueta="Destinatario"
                opciones={DESTINATARIOS}
                valor={destinatario}
                onCambio={setDestinatario}
              />

              <SelectorFecha
                etiqueta="Fecha del documento"
                valor={fecha}
                onCambio={setFecha}
              />
            </div>

            <label className={styles.campo}>
              <span className={styles.campoEtiqueta}>Motivo o asunto</span>
              <input
                className={styles.control}
                value={asunto}
                onChange={(evento) => setAsunto(evento.target.value)}
                placeholder="Informe de asistencia del personal, julio 2026"
              />
            </label>

            <label className={styles.campo}>
              <span className={styles.campoEtiqueta}>
                Antecedentes (opcional)
              </span>
              <textarea
                className={styles.control}
                value={antecedentes}
                onChange={(evento) => setAntecedentes(evento.target.value)}
                placeholder="Información previa que el agente debe considerar al redactar."
              />
            </label>
          </div>
        </div>

        <div className={styles.panelPie}>
          <button
            type="button"
            className={styles.botonPrimario}
            onClick={generar}
            disabled={!listo || trabajando}
          >
            <IconRedactar width={15} height={15} />
            {trabajando ? "Generando…" : "Generar documento"}
          </button>

          {!listo && (
            <span className={styles.tipoDetalle} style={{ marginTop: 0 }}>
              Indique el motivo o asunto para habilitar la generación.
            </span>
          )}
        </div>
      </section>

      {/* ---------- Panel de la hoja ---------- */}
      <section className={styles.panel}>
        {/* Las herramientas viven en la barra y están siempre presentes,
            deshabilitadas hasta que haya documento: así el panel no cambia
            de alto al generar. */}
        <div className={styles.panelBarra}>
          <span
            className={`${styles.estadoDoc} ${
              generado ? "" : styles.estadoDocVacio
            }`}
          >
            <span className={styles.estadoTexto}>{estado}</span>
          </span>

          <div className={styles.herramientas}>
            <button
              type="button"
              className={`${styles.herramienta} ${
                copiado ? styles.herramientaHecha : ""
              }`}
              onClick={copiar}
              disabled={!generado || trabajando}
            >
              <IconCopiar width={14} height={14} />
              <span className={styles.herramientaTexto}>
                {copiado ? "Copiado" : "Copiar"}
              </span>
            </button>

            <button
              type="button"
              className={styles.herramienta}
              onClick={descargar}
              disabled={!generado || trabajando || descargando}
            >
              <IconDescarga width={14} height={14} />
              <span className={styles.herramientaTexto}>
                {descargando ? "Generando…" : "PDF"}
              </span>
            </button>

            <button
              type="button"
              className={styles.herramienta}
              onClick={() => setGenerado(null)}
              disabled={!generado || trabajando}
            >
              <span className={styles.herramientaTexto}>Nuevo</span>
            </button>
          </div>
        </div>

        <div className={styles.lienzo}>
          {generado && !trabajando ? (
            <article className={styles.hoja}>
              <div className={styles.hojaCinta} aria-hidden="true">
                <span />
                <span />
                <span />
              </div>

              <header className={styles.hojaEncabezado}>
                <div className={styles.hojaEscudo}>
                  <Image
                    src="/logo2.jpg"
                    alt="Escudo France N°3"
                    fill
                    sizes="52px"
                    style={{ objectFit: "contain" }}
                  />
                </div>
                <div className={styles.hojaMembrete}>
                  <span className={styles.hojaInstitucion}>
                    Compañía de Bomberos Voluntarios France N° 3
                  </span>
                  <span className={styles.hojaLema}>
                    Sauver ou Périr · Fundada en 1866 · Administración
                  </span>
                </div>
              </header>

              <h3 className={styles.hojaNumero}>{generado.numero}</h3>

              <dl className={styles.hojaCampo}>
                <dt>Destinatario</dt>
                <dd>{generado.datos.destinatario}</dd>
                <dt>Asunto</dt>
                <dd>{generado.datos.asunto}</dd>
                <dt>Fecha</dt>
                <dd>{generado.datos.fecha}</dd>
              </dl>

              <div className={styles.hojaCuerpo}>
                {generado.parrafos.map((parrafo, i) => (
                  <p key={i} style={{ margin: 0 }}>
                    {parrafo}
                  </p>
                ))}
              </div>

              <p className={styles.hojaCierre}>{generado.plantilla.cierre}</p>

              <div className={styles.hojaFirma}>
                {autor}
                <br />
                Compañía de Bomberos Voluntarios France N° 3
              </div>
            </article>
          ) : trabajando ? (
            <div
              className={styles.lienzoCargando}
              role="status"
              aria-live="polite"
            >
              <span className={styles.soloLectores}>
                El agente está redactando el documento.
              </span>
              <HojaFantasma animada />
            </div>
          ) : (
            <div className={styles.lienzoVacio}>
              <HojaFantasma animada={false} />
              <div className={styles.mensajeVacio}>
                <span className={styles.mensajeVacioTitulo}>
                  Sin documento
                </span>
                <span className={styles.mensajeVacioTexto}>
                  Complete los datos y genere el documento. Aparecerá aquí para
                  revisarlo y descargarlo.
                </span>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
