/**
 * Armado del PDF institucional del Agente IA documental.
 *
 * Se genera en el navegador con jsPDF sobre una hoja A4, replicando el
 * membrete de la Compañía: riel tricolor, escudo, número correlativo,
 * bloque de campos, cuerpo justificado y firma.
 */

import type { DatosGeneracion, Plantilla } from "./datos-demo";

export type DocumentoPdf = {
  numero: string;
  plantilla: Plantilla;
  datos: DatosGeneracion;
  parrafos: string[];
  autor: string;
};

/* Medidas de la hoja, en milímetros. */
const HOJA = { ancho: 210, alto: 297 };
const MARGEN = 22;
const ANCHO_UTIL = HOJA.ancho - MARGEN * 2;
const PIE = 272; // límite inferior del área de texto

const BLEU: [number, number, number] = [44, 74, 154];
const ROUGE: [number, number, number] = [200, 16, 46];
const TINTA: [number, number, number] = [26, 26, 28];
const GRIS: [number, number, number] = [110, 110, 118];
const LINEA: [number, number, number] = [206, 202, 194];

const INSTITUCION = "Compañía de Bomberos Voluntarios France N° 3";
const LEMA = "Sauver ou Périr · Fundada en 1866 · Administración";

/** Carga el escudo para incrustarlo; si falla, el PDF sale sin imagen. */
async function cargarEscudo(): Promise<HTMLImageElement | null> {
  try {
    const escudo = new Image();
    escudo.src = "/logo2.jpg";
    await escudo.decode();
    return escudo;
  } catch {
    return null;
  }
}

function nombreArchivo(numero: string) {
  const base = numero
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `${base || "documento"}.pdf`;
}

/**
 * Arma la hoja. Recibe el escudo ya cargado para poder ejercitar el
 * maquetado fuera del navegador.
 */
export async function construirDocumentoPdf(
  documento: DocumentoPdf,
  escudo: HTMLImageElement | null,
) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: "a4" });

  /** Riel tricolor y pie: se repiten en cada página. */
  const decorarPagina = () => {
    const tercio = HOJA.ancho / 3;
    pdf.setFillColor(...BLEU);
    pdf.rect(0, 0, tercio, 3, "F");
    pdf.setFillColor(244, 240, 233);
    pdf.rect(tercio, 0, tercio, 3, "F");
    pdf.setFillColor(...ROUGE);
    pdf.rect(tercio * 2, 0, tercio, 3, "F");

    pdf.setDrawColor(...LINEA);
    pdf.setLineWidth(0.2);
    pdf.line(MARGEN, PIE + 6, HOJA.ancho - MARGEN, PIE + 6);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(...GRIS);
    pdf.text(`${INSTITUCION} · Sauver ou Périr`, MARGEN, PIE + 11);
    pdf.text(
      `Página ${pdf.getNumberOfPages()}`,
      HOJA.ancho - MARGEN,
      PIE + 11,
      { align: "right" },
    );
  };

  let y = 0;

  /** Salta de página cuando el bloque siguiente ya no entra. */
  const asegurarEspacio = (alto: number) => {
    if (y + alto <= PIE) return;
    pdf.addPage();
    decorarPagina();
    y = MARGEN;
  };

  decorarPagina();

  /* ---------- Membrete ---------- */
  if (escudo) {
    pdf.addImage(escudo, "JPEG", MARGEN, 12, 20, 20);
  }

  const xMembrete = MARGEN + (escudo ? 25 : 0);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11.5);
  pdf.setTextColor(...TINTA);
  pdf.text(INSTITUCION, xMembrete, 20);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(...GRIS);
  pdf.text(LEMA, xMembrete, 25.5);

  pdf.setDrawColor(...LINEA);
  pdf.setLineWidth(0.3);
  pdf.line(MARGEN, 37, HOJA.ancho - MARGEN, 37);

  /* ---------- Número correlativo ---------- */
  y = 48;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(...TINTA);
  pdf.text(documento.numero, MARGEN, y);
  y += 12;

  /* ---------- Campos ---------- */
  const campos: [string, string][] = [
    ["Destinatario", documento.datos.destinatario],
    ["Asunto", documento.datos.asunto],
    ["Fecha", documento.datos.fecha],
  ];

  for (const [etiqueta, valor] of campos) {
    const lineas = pdf.splitTextToSize(valor, ANCHO_UTIL - 32) as string[];
    asegurarEspacio(lineas.length * 5 + 2);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(...GRIS);
    pdf.text(etiqueta.toUpperCase(), MARGEN, y);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(...TINTA);
    pdf.text(lineas, MARGEN + 32, y);

    y += lineas.length * 5 + 3;
  }

  y += 4;
  pdf.setDrawColor(...LINEA);
  pdf.setLineWidth(0.2);
  pdf.line(MARGEN, y, HOJA.ancho - MARGEN, y);
  y += 10;

  /* ---------- Cuerpo ---------- */
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10.5);
  pdf.setTextColor(...TINTA);

  for (const parrafo of documento.parrafos) {
    const lineas = pdf.splitTextToSize(parrafo, ANCHO_UTIL) as string[];

    lineas.forEach((linea, i) => {
      asegurarEspacio(5.6);
      // Justificado salvo la última línea del párrafo, que se dejaría
      // con espacios estirados.
      const ultima = i === lineas.length - 1;
      pdf.text(
        linea,
        MARGEN,
        y,
        ultima ? undefined : { align: "justify", maxWidth: ANCHO_UTIL },
      );
      y += 5.6;
    });

    y += 4;
  }

  /* ---------- Cierre y firma ---------- */
  asegurarEspacio(40);
  y += 4;
  pdf.text(documento.plantilla.cierre, MARGEN, y);

  y += 26;
  asegurarEspacio(22);
  pdf.setDrawColor(...TINTA);
  pdf.setLineWidth(0.3);
  pdf.line(MARGEN, y, MARGEN + 62, y);
  y += 5.5;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text(documento.autor, MARGEN, y);

  y += 5;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(...GRIS);
  pdf.text(INSTITUCION, MARGEN, y);

  return pdf;
}

export async function descargarDocumentoPdf(documento: DocumentoPdf) {
  const pdf = await construirDocumentoPdf(documento, await cargarEscudo());
  pdf.save(nombreArchivo(documento.numero));
}
