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
import { IconChispa, IconCopiar, IconDescarga, IconRedactar } from "../iconos";
import styles from "../panel.module.css";

type Generado = {
  numero: string;
  plantilla: Plantilla;
  datos: DatosGeneracion;
  parrafos: string[];
};

const CORRELATIVO_INICIAL = 135;

export function Generador({ autor }: { autor: string }) {
  const [plantilla, setPlantilla] = useState<Plantilla>(PLANTILLAS[0]);
  const [destinatario, setDestinatario] = useState(DESTINATARIOS[0]);
  const [asunto, setAsunto] = useState("");
  const [antecedentes, setAntecedentes] = useState("");
  const [fecha, setFecha] = useState("05 de agosto de 2026");
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
      const datos: DatosGeneracion = { destinatario, asunto, antecedentes, fecha };
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

  return (
    <div className={styles.generador}>
      {/* ---------- Formulario ---------- */}
      <section className={styles.tarjeta}>
        <div className={styles.tarjetaEncabezado}>
          <h2 className={styles.tarjetaTitulo}>Datos del documento</h2>
          <span className={styles.tarjetaNota}>Paso 1 de 2</span>
        </div>

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
            <label className={styles.campo}>
              <span className={styles.campoEtiqueta}>Destinatario</span>
              <select
                className={styles.control}
                value={destinatario}
                onChange={(evento) => setDestinatario(evento.target.value)}
              >
                {DESTINATARIOS.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {opcion}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.campo}>
              <span className={styles.campoEtiqueta}>Fecha del documento</span>
              <input
                className={styles.control}
                value={fecha}
                onChange={(evento) => setFecha(evento.target.value)}
              />
            </label>
          </div>

          <label className={styles.campo}>
            <span className={styles.campoEtiqueta}>Motivo o asunto</span>
            <input
              className={styles.control}
              value={asunto}
              onChange={(evento) => setAsunto(evento.target.value)}
              placeholder="Informe de asistencia del personal — julio 2026"
            />
          </label>

          <label className={styles.campo}>
            <span className={styles.campoEtiqueta}>Antecedentes (opcional)</span>
            <textarea
              className={styles.control}
              value={antecedentes}
              onChange={(evento) => setAntecedentes(evento.target.value)}
              placeholder="Información previa que el agente debe considerar al redactar."
            />
          </label>

          <div className={styles.filaAccion}>
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
              <span className={styles.tarjetaNota}>
                Indique el motivo o asunto para habilitar la generación.
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ---------- Vista previa ---------- */}
      <section className={styles.vistaPrevia}>
        <div className={styles.hojaMarco}>
          {trabajando ? (
            <div className={styles.trabajando}>
              <span>El agente está redactando</span>
              <span className={styles.esqueleto} />
              <span className={styles.esqueleto} />
              <span className={styles.esqueleto} />
            </div>
          ) : generado ? (
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
          ) : (
            <div className={styles.hojaVacia}>
              <span>
                Complete los datos y presione <strong>Generar documento</strong>.
                <br />
                El documento aparecerá aquí, listo para revisar, ajustar y
                descargar.
              </span>
            </div>
          )}
        </div>

        <p className={styles.sugerencia}>
          <IconChispa width={14} height={14} />
          El agente aplica los formatos y lineamientos institucionales de la
          Compañía: numeración correlativa, estructura reglamentaria y fórmulas
          de cortesía según el tipo documental.
        </p>

        {generado && !trabajando && (
          <div className={styles.accionesHoja}>
            <button type="button" className={styles.botonSecundario} onClick={copiar}>
              <IconCopiar width={14} height={14} />
              {copiado ? "Copiado" : "Copiar texto"}
            </button>
            <button
              type="button"
              className={styles.botonSecundario}
              onClick={descargar}
              disabled={descargando}
            >
              <IconDescarga width={14} height={14} />
              {descargando ? "Generando PDF…" : "Descargar PDF"}
            </button>
            <button
              type="button"
              className={styles.botonSecundario}
              onClick={() => setGenerado(null)}
            >
              Nuevo documento
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
