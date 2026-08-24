/**
 * Datos de demostración. Todo el contenido de este archivo es ficticio y
 * existe solo para poder mostrar la interfaz; al conectar los sistemas
 * reales debe reemplazarse por consultas a la base institucional.
 */

export type Bombero = {
  codigo: string;
  nombre: string;
  grado: string;
  cargo: string;
  seccion: string;
  iniciales: string;
};

export const BOMBERO_DEMO: Bombero = {
  codigo: "B-1866",
  nombre: "Andrés Villanueva Ramos",
  grado: "Brigadier CBP",
  cargo: "Jefe de Administración",
  seccion: "Administración",
  iniciales: "AV",
};

/* ============================================================
   Proyecto 1 — Mesa de Partes Virtual
   ============================================================ */

export type EstadoDocumento =
  | "Pendiente"
  | "En proceso"
  | "Derivado"
  | "Atendido"
  | "Archivado";

export type TipoDocumento =
  | "Oficio"
  | "Nota Informativa"
  | "Informe"
  | "Memorando"
  | "Carta"
  | "Solicitud"
  | "Acta";

export type Etapa = {
  etapa: string;
  fecha: string;
  hora: string;
  responsable: string;
  detalle: string;
  completada: boolean;
};

export type Documento = {
  id: string;
  numero: string;
  tipo: TipoDocumento;
  asunto: string;
  origen: string;
  destino: string;
  via: "Físico" | "Digital";
  folios: number;
  fechaIngreso: string;
  plazo: string;
  estado: EstadoDocumento;
  prioridad: "Alta" | "Media" | "Baja";
  clasificacionIA: string;
  confianzaIA: number;
  trazabilidad: Etapa[];
};

const traza = (
  responsableIngreso: string,
  seccion: string,
  fecha: string,
  hasta: number,
): Etapa[] => {
  const etapas = [
    {
      etapa: "Ingreso",
      hora: "08:42",
      responsable: responsableIngreso,
      detalle: "Documento registrado en Mesa de Partes Virtual.",
    },
    {
      etapa: "Clasificación",
      hora: "08:44",
      responsable: "Sistema · Clasificador IA",
      detalle: "Tipo, prioridad y área asignados automáticamente.",
    },
    {
      etapa: "Derivación",
      hora: "09:15",
      responsable: "Administración",
      detalle: `Derivado a ${seccion} para su atención.`,
    },
    {
      etapa: "Seguimiento",
      hora: "11:30",
      responsable: seccion,
      detalle: "En revisión por el área responsable.",
    },
    {
      etapa: "Archivo",
      hora: "16:05",
      responsable: "Administración",
      detalle: "Documento archivado digitalmente.",
    },
  ];

  return etapas.map((e, i) => ({
    ...e,
    fecha,
    completada: i < hasta,
  }));
};

export const DOCUMENTOS: Documento[] = [
  {
    id: "125-2026",
    numero: "Oficio N° 125-2026",
    tipo: "Oficio",
    asunto: "Requerimiento de equipos de protección personal para el II semestre",
    origen: "IV Comandancia Departamental Lima",
    destino: "Sección Logística",
    via: "Digital",
    folios: 4,
    fechaIngreso: "04/08/2026",
    plazo: "12/08/2026",
    estado: "Pendiente",
    prioridad: "Alta",
    clasificacionIA: "Logística · Requerimiento",
    confianzaIA: 96,
    trazabilidad: traza("Bomb. Quispe Alarcón", "Sección Logística", "04/08/2026", 3),
  },
  {
    id: "089-2026",
    numero: "Nota Informativa N° 089-2026",
    tipo: "Nota Informativa",
    asunto: "Reporte de asistencia del personal correspondiente a julio 2026",
    origen: "Sección Personal",
    destino: "Jefatura de Compañía",
    via: "Digital",
    folios: 2,
    fechaIngreso: "04/08/2026",
    plazo: "08/08/2026",
    estado: "Derivado",
    prioridad: "Media",
    clasificacionIA: "Personal · Informe mensual",
    confianzaIA: 93,
    trazabilidad: traza("Bomb. Rojas Medina", "Jefatura de Compañía", "04/08/2026", 3),
  },
  {
    id: "021-2026",
    numero: "Informe N° 021-2026",
    tipo: "Informe",
    asunto: "Estado operativo de las unidades tras mantenimiento preventivo",
    origen: "Sección Máquinas",
    destino: "Jefatura de Compañía",
    via: "Digital",
    folios: 7,
    fechaIngreso: "03/08/2026",
    plazo: "10/08/2026",
    estado: "Pendiente",
    prioridad: "Alta",
    clasificacionIA: "Máquinas · Estado operativo",
    confianzaIA: 91,
    trazabilidad: traza("Bomb. Chávez Núñez", "Jefatura de Compañía", "03/08/2026", 2),
  },
  {
    id: "015-2026",
    numero: "Carta N° 015-2026",
    tipo: "Carta",
    asunto: "Agradecimiento por donación de equipamiento de rescate",
    origen: "Municipalidad de Cercado de Lima",
    destino: "Jefatura de Compañía",
    via: "Físico",
    folios: 1,
    fechaIngreso: "02/08/2026",
    plazo: "09/08/2026",
    estado: "Atendido",
    prioridad: "Baja",
    clasificacionIA: "Institucional · Agradecimiento",
    confianzaIA: 88,
    trazabilidad: traza("Bomb. Salazar Pinto", "Jefatura de Compañía", "02/08/2026", 5),
  },
  {
    id: "112-2026",
    numero: "Memorando N° 112-2026",
    tipo: "Memorando",
    asunto: "Cronograma de guardias del mes de agosto 2026",
    origen: "Jefatura de Compañía",
    destino: "Todo el personal",
    via: "Digital",
    folios: 3,
    fechaIngreso: "01/08/2026",
    plazo: "05/08/2026",
    estado: "Atendido",
    prioridad: "Media",
    clasificacionIA: "Operaciones · Cronograma",
    confianzaIA: 97,
    trazabilidad: traza("Bomb. Rojas Medina", "Secciones", "01/08/2026", 5),
  },
  {
    id: "133-2026",
    numero: "Oficio N° 133-2026",
    tipo: "Oficio",
    asunto: "Convocatoria a capacitación en materiales peligrosos (HAZMAT)",
    origen: "Escuela CGBVP",
    destino: "Sección Instrucción",
    via: "Digital",
    folios: 5,
    fechaIngreso: "05/08/2026",
    plazo: "15/08/2026",
    estado: "En proceso",
    prioridad: "Media",
    clasificacionIA: "Instrucción · Capacitación",
    confianzaIA: 94,
    trazabilidad: traza("Bomb. Quispe Alarcón", "Sección Instrucción", "05/08/2026", 4),
  },
  {
    id: "047-2026",
    numero: "Solicitud N° 047-2026",
    tipo: "Solicitud",
    asunto: "Solicitud de licencia por estudios — Bomb. Paredes Loayza",
    origen: "Sección Personal",
    destino: "Jefatura de Compañía",
    via: "Físico",
    folios: 2,
    fechaIngreso: "05/08/2026",
    plazo: "13/08/2026",
    estado: "Pendiente",
    prioridad: "Media",
    clasificacionIA: "Personal · Licencia",
    confianzaIA: 90,
    trazabilidad: traza("Bomb. Salazar Pinto", "Jefatura de Compañía", "05/08/2026", 2),
  },
  {
    id: "008-2026",
    numero: "Acta N° 008-2026",
    tipo: "Acta",
    asunto: "Acta de reunión del Cuadro de Oficiales — 05 de agosto",
    origen: "Secretaría de Compañía",
    destino: "Cuadro de Oficiales",
    via: "Digital",
    folios: 6,
    fechaIngreso: "05/08/2026",
    plazo: "12/08/2026",
    estado: "En proceso",
    prioridad: "Alta",
    clasificacionIA: "Institucional · Acta",
    confianzaIA: 98,
    trazabilidad: traza("Bomb. Chávez Núñez", "Cuadro de Oficiales", "05/08/2026", 4),
  },
  {
    id: "119-2026",
    numero: "Oficio N° 119-2026",
    tipo: "Oficio",
    asunto: "Coordinación de simulacro multisectorial en Cercado de Lima",
    origen: "INDECI",
    destino: "Sección Operaciones",
    via: "Digital",
    folios: 9,
    fechaIngreso: "31/07/2026",
    plazo: "07/08/2026",
    estado: "Derivado",
    prioridad: "Alta",
    clasificacionIA: "Operaciones · Coordinación externa",
    confianzaIA: 95,
    trazabilidad: traza("Bomb. Rojas Medina", "Sección Operaciones", "31/07/2026", 3),
  },
  {
    id: "072-2026",
    numero: "Nota Informativa N° 072-2026",
    tipo: "Nota Informativa",
    asunto: "Consumo de combustible de unidades — julio 2026",
    origen: "Sección Máquinas",
    destino: "Administración",
    via: "Digital",
    folios: 2,
    fechaIngreso: "30/07/2026",
    plazo: "06/08/2026",
    estado: "Archivado",
    prioridad: "Baja",
    clasificacionIA: "Administración · Reporte de consumo",
    confianzaIA: 92,
    trazabilidad: traza("Bomb. Quispe Alarcón", "Administración", "30/07/2026", 5),
  },
  {
    id: "018-2026",
    numero: "Informe N° 018-2026",
    tipo: "Informe",
    asunto: "Evaluación de files de personal — avance del plan de actualización",
    origen: "Administración",
    destino: "Jefatura de Compañía",
    via: "Digital",
    folios: 11,
    fechaIngreso: "29/07/2026",
    plazo: "05/08/2026",
    estado: "Atendido",
    prioridad: "Alta",
    clasificacionIA: "Administración · Plan de gestión",
    confianzaIA: 99,
    trazabilidad: traza("Bomb. Salazar Pinto", "Jefatura de Compañía", "29/07/2026", 5),
  },
  {
    id: "104-2026",
    numero: "Memorando N° 104-2026",
    tipo: "Memorando",
    asunto: "Disposición sobre uso de uniformes en actos institucionales",
    origen: "Jefatura de Compañía",
    destino: "Todo el personal",
    via: "Digital",
    folios: 1,
    fechaIngreso: "28/07/2026",
    plazo: "02/08/2026",
    estado: "Archivado",
    prioridad: "Baja",
    clasificacionIA: "Institucional · Disposición",
    confianzaIA: 96,
    trazabilidad: traza("Bomb. Chávez Núñez", "Secciones", "28/07/2026", 5),
  },
];

export const KPIS_MESA = [
  { clave: "ingresos", etiqueta: "Ingresos", valor: 128, nota: "Este mes", variacion: 12 },
  { clave: "derivados", etiqueta: "Derivados", valor: 86, nota: "Este mes", variacion: 8 },
  { clave: "pendientes", etiqueta: "Pendientes", valor: 27, nota: "Por atender", variacion: -5 },
  { clave: "atendidos", etiqueta: "Atendidos", valor: 101, nota: "Este mes", variacion: 15 },
] as const;

export const SERIE_MENSUAL = [
  { mes: "Ene", valor: 24 },
  { mes: "Feb", valor: 31 },
  { mes: "Mar", valor: 52 },
  { mes: "Abr", valor: 44 },
  { mes: "May", valor: 68 },
  { mes: "Jun", valor: 49 },
  { mes: "Jul", valor: 74 },
  { mes: "Ago", valor: 88 },
];

export const DISTRIBUCION_TIPOS = [
  { tipo: "Oficios", valor: 38 },
  { tipo: "Notas informativas", valor: 24 },
  { tipo: "Informes", valor: 18 },
  { tipo: "Memorandos", valor: 12 },
  { tipo: "Otros", valor: 8 },
];

/* ============================================================
   Proyecto 2 — Agente de IA documental
   ============================================================ */

export type Plantilla = {
  id: string;
  nombre: string;
  descripcion: string;
  encabezado: string;
  cuerpo: (datos: DatosGeneracion) => string[];
  cierre: string;
};

export type DatosGeneracion = {
  destinatario: string;
  asunto: string;
  antecedentes: string;
  fecha: string;
};

/**
 * Pasa la primera letra a minúscula para encajar el asunto dentro de una
 * frase, sin arruinar siglas ni números romanos ("II semestre", "HAZMAT").
 */
const enMinuscula = (texto: string) => {
  const limpio = texto.trim();
  if (!limpio) return limpio;
  if (/^[A-ZÁÉÍÓÚÑ]{2}/.test(limpio)) return limpio;
  return limpio[0].toLowerCase() + limpio.slice(1);
};

const parrafoCortesia =
  "Es propicia la oportunidad para expresarle los sentimientos de mi especial consideración y estima.";

export const PLANTILLAS: Plantilla[] = [
  {
    id: "oficio",
    nombre: "Oficio",
    descripcion: "Comunicación formal dirigida a autoridades o unidades externas.",
    encabezado: "OFICIO N° {n}-2026-CBVP-F3/ADM",
    cuerpo: ({ destinatario, asunto, antecedentes }) => [
      `Tengo el agrado de dirigirme a usted, ${destinatario}, en el marco de las funciones administrativas de la Compañía de Bomberos Voluntarios France N° 3, con la finalidad de comunicarle lo referente a ${enMinuscula(asunto)}.`,
      antecedentes
        ? `Al respecto, y considerando ${enMinuscula(antecedentes)}, esta Jefatura ha dispuesto las acciones necesarias para su atención dentro de los plazos establecidos en el reglamento institucional.`
        : "Al respecto, esta Jefatura ha dispuesto las acciones necesarias para su atención dentro de los plazos establecidos en el reglamento institucional.",
      "En tal sentido, agradeceré disponer las coordinaciones que correspondan y remitir la respuesta a través de la Mesa de Partes Virtual de la Compañía.",
      parrafoCortesia,
    ],
    cierre: "Atentamente,",
  },
  {
    id: "nota-informativa",
    nombre: "Nota Informativa",
    descripcion: "Informe breve de un hecho o situación puntual a la superioridad.",
    encabezado: "NOTA INFORMATIVA N° {n}-2026-CBVP-F3/ADM",
    cuerpo: ({ destinatario, asunto, antecedentes }) => [
      `Por medio de la presente, se pone en conocimiento de ${destinatario} la información correspondiente a ${enMinuscula(asunto)}.`,
      antecedentes
        ? `Antecedentes: ${antecedentes}`
        : "Antecedentes: se trata de información de rutina generada por el área responsable.",
      "La documentación de sustento se encuentra registrada en el sistema institucional y queda a disposición para su verificación.",
    ],
    cierre: "Es cuanto informo a usted para su conocimiento y fines.",
  },
  {
    id: "informe",
    nombre: "Informe",
    descripcion: "Documento con análisis, conclusiones y recomendaciones.",
    encabezado: "INFORME N° {n}-2026-CBVP-F3/ADM",
    cuerpo: ({ destinatario, asunto, antecedentes }) => [
      `I. OBJETO\nInformar a ${destinatario} sobre ${enMinuscula(asunto)}.`,
      `II. ANTECEDENTES\n${antecedentes || "No se registran antecedentes previos sobre la materia."}`,
      "III. ANÁLISIS\nRevisada la documentación y verificada la información con las secciones involucradas, se advierte que las acciones ejecutadas se ajustan a los lineamientos institucionales vigentes.",
      "IV. CONCLUSIONES\nSe recomienda aprobar lo actuado y disponer el seguimiento mensual del indicador correspondiente.",
    ],
    cierre: "Es todo cuanto tengo que informar.",
  },
  {
    id: "memorando",
    nombre: "Memorando",
    descripcion: "Disposición interna dirigida al personal de la Compañía.",
    encabezado: "MEMORANDO N° {n}-2026-CBVP-F3/ADM",
    cuerpo: ({ destinatario, asunto, antecedentes }) => [
      `Se comunica a ${destinatario} la siguiente disposición referente a ${enMinuscula(asunto)}.`,
      antecedentes
        ? `Considerando ${enMinuscula(antecedentes)}, el cumplimiento de lo dispuesto es de carácter obligatorio a partir de la fecha.`
        : "El cumplimiento de lo dispuesto es de carácter obligatorio a partir de la fecha.",
      "Las secciones deberán reportar el cumplimiento a la Administración dentro de las 72 horas siguientes.",
    ],
    cierre: "Cúmplase.",
  },
  {
    id: "carta",
    nombre: "Carta institucional",
    descripcion: "Comunicación protocolar con entidades y aliados.",
    encabezado: "CARTA N° {n}-2026-CBVP-F3/ADM",
    cuerpo: ({ destinatario, asunto, antecedentes }) => [
      `Estimado(a) ${destinatario}:`,
      `Reciba el cordial saludo de la Compañía de Bomberos Voluntarios France N° 3. El motivo de la presente es ${enMinuscula(asunto)}.`,
      antecedentes ||
        "Nuestra institución reitera su disposición para continuar colaborando en beneficio de la comunidad.",
      parrafoCortesia,
    ],
    cierre: "Cordialmente,",
  },
  {
    id: "acta",
    nombre: "Acta",
    descripcion: "Registro formal de acuerdos de reunión.",
    encabezado: "ACTA N° {n}-2026-CBVP-F3/ADM",
    cuerpo: ({ destinatario, asunto, antecedentes, fecha }) => [
      `En la sede de la Compañía de Bomberos Voluntarios France N° 3, siendo el ${fecha}, se reunió ${destinatario} para tratar ${enMinuscula(asunto)}.`,
      `DESARROLLO\n${antecedentes || "Se expusieron los avances del período y se absolvieron las consultas del pleno."}`,
      "ACUERDOS\n1. Aprobar lo expuesto por la Administración.\n2. Disponer el seguimiento mensual de los indicadores.\n3. Remitir copia del acta a las secciones involucradas.",
    ],
    cierre: "No habiendo otro punto que tratar, se levanta la sesión.",
  },
];

export type DocumentoGenerado = {
  id: string;
  numero: string;
  tipo: string;
  asunto: string;
  destinatario: string;
  fecha: string;
  autor: string;
  estado: "Borrador" | "Validado" | "Enviado";
  segundos: number;
};

export const HISTORIAL_GENERADOS: DocumentoGenerado[] = [
  {
    id: "g-023",
    numero: "NOTA INFORMATIVA N° 023-2026",
    tipo: "Nota Informativa",
    asunto: "Informe de asistencia de personal — julio 2026",
    destinatario: "IV Comandancia Departamental",
    fecha: "05/08/2026",
    autor: "Brig. Villanueva Ramos",
    estado: "Enviado",
    segundos: 42,
  },
  {
    id: "g-022",
    numero: "OFICIO N° 134-2026",
    tipo: "Oficio",
    asunto: "Requerimiento de mantenimiento de la unidad B-3",
    destinatario: "Sección Máquinas",
    fecha: "04/08/2026",
    autor: "Brig. Villanueva Ramos",
    estado: "Validado",
    segundos: 51,
  },
  {
    id: "g-021",
    numero: "MEMORANDO N° 113-2026",
    tipo: "Memorando",
    asunto: "Disposición de uso de uniforme en actos oficiales",
    destinatario: "Todo el personal",
    fecha: "03/08/2026",
    autor: "Tte. Brig. Paredes Loayza",
    estado: "Enviado",
    segundos: 38,
  },
  {
    id: "g-020",
    numero: "INFORME N° 019-2026",
    tipo: "Informe",
    asunto: "Avance del plan de actualización de files de personal",
    destinatario: "Jefatura de Compañía",
    fecha: "02/08/2026",
    autor: "Brig. Villanueva Ramos",
    estado: "Validado",
    segundos: 67,
  },
  {
    id: "g-019",
    numero: "CARTA N° 016-2026",
    tipo: "Carta institucional",
    asunto: "Agradecimiento por donación de equipamiento",
    destinatario: "Municipalidad de Cercado de Lima",
    fecha: "01/08/2026",
    autor: "Sec. Chávez Núñez",
    estado: "Borrador",
    segundos: 33,
  },
  {
    id: "g-018",
    numero: "ACTA N° 009-2026",
    tipo: "Acta",
    asunto: "Reunión del Cuadro de Oficiales",
    destinatario: "Cuadro de Oficiales",
    fecha: "01/08/2026",
    autor: "Sec. Chávez Núñez",
    estado: "Enviado",
    segundos: 71,
  },
];

export const DESTINATARIOS = [
  "IV Comandancia Departamental Lima",
  "Jefatura de Compañía",
  "Cuadro de Oficiales",
  "Sección Administración",
  "Sección Logística",
  "Sección Máquinas",
  "Sección Personal",
  "Sección Instrucción",
  "Todo el personal de la Compañía",
];

export const documentoPorId = (id: string) =>
  DOCUMENTOS.find((documento) => documento.id === id);

/* ============================================================
   Proyecto 3 — Dashboard Ejecutivo
   ============================================================ */

export const KPIS_EJECUTIVO = [
  {
    clave: "emergencias",
    etiqueta: "Emergencias atendidas",
    valor: "128",
    nota: "Este mes",
    variacion: 10,
    mejorSube: true,
  },
  {
    clave: "respuesta",
    etiqueta: "Tiempo promedio de respuesta",
    valor: "6:24",
    unidad: "min",
    nota: "Este mes",
    variacion: -8,
    mejorSube: false,
  },
  {
    clave: "unidades",
    etiqueta: "Unidades operativas",
    valor: "8",
    total: "11",
    nota: "73% disponibles",
  },
  {
    clave: "personal",
    etiqueta: "Personal disponible",
    valor: "42",
    total: "56",
    nota: "75% disponible",
  },
] as const;

export const EMERGENCIAS_TIPO = [
  { tipo: "Incendio", valor: 42, color: "#e5372a" },
  { tipo: "Rescate", valor: 25, color: "#f2b544" },
  { tipo: "Emergencia médica", valor: 20, color: "#4a7ade" },
  { tipo: "Falsa alarma", valor: 8, color: "#9b8cf5" },
  { tipo: "Otros", valor: 5, color: "#6b6f7a" },
];

export const EMERGENCIAS_DISTRITO = [
  { distrito: "Cercado de Lima", valor: 36 },
  { distrito: "La Victoria", valor: 24 },
  { distrito: "San Martín de Porres", valor: 18 },
  { distrito: "Rímac", valor: 16 },
  { distrito: "Breña", valor: 12 },
];

export const EVOLUCION_OPERATIVA = [
  { mes: "Mar", emergencias: 95, respuesta: 7.2 },
  { mes: "Abr", emergencias: 102, respuesta: 6.9 },
  { mes: "May", emergencias: 88, respuesta: 7.4 },
  { mes: "Jun", emergencias: 110, respuesta: 6.8 },
  { mes: "Jul", emergencias: 118, respuesta: 6.6 },
  { mes: "Ago", emergencias: 128, respuesta: 6.4 },
];

export type EstadoUnidad = "Operativa" | "En mantenimiento" | "Fuera de servicio";

export type Unidad = {
  id: string;
  denominacion: string;
  tipo: string;
  estado: EstadoUnidad;
  conductor: string;
  kilometraje: number;
  combustible: number;
  proximoMantenimiento: string;
};

export const UNIDADES: Unidad[] = [
  { id: "B-3", denominacion: "Autobomba B-3", tipo: "Autobomba", estado: "Operativa", conductor: "Bomb. Quispe Alarcón", kilometraje: 84210, combustible: 82, proximoMantenimiento: "22/08/2026" },
  { id: "B-13", denominacion: "Autobomba B-13", tipo: "Autobomba", estado: "Operativa", conductor: "Bomb. Rojas Medina", kilometraje: 61840, combustible: 74, proximoMantenimiento: "05/09/2026" },
  { id: "B-23", denominacion: "Autobomba B-23", tipo: "Autobomba", estado: "En mantenimiento", conductor: "—", kilometraje: 118530, combustible: 35, proximoMantenimiento: "En taller" },
  { id: "R-3", denominacion: "Unidad de rescate R-3", tipo: "Rescate", estado: "Operativa", conductor: "Bomb. Chávez Núñez", kilometraje: 47320, combustible: 91, proximoMantenimiento: "18/09/2026" },
  { id: "R-13", denominacion: "Unidad de rescate R-13", tipo: "Rescate", estado: "Operativa", conductor: "Bomb. Salazar Pinto", kilometraje: 52990, combustible: 66, proximoMantenimiento: "29/08/2026" },
  { id: "A-3", denominacion: "Ambulancia A-3", tipo: "Ambulancia", estado: "Operativa", conductor: "Bomb. Paredes Loayza", kilometraje: 39150, combustible: 88, proximoMantenimiento: "12/09/2026" },
  { id: "A-13", denominacion: "Ambulancia A-13", tipo: "Ambulancia", estado: "Fuera de servicio", conductor: "—", kilometraje: 142870, combustible: 12, proximoMantenimiento: "Evaluación técnica" },
  { id: "E-3", denominacion: "Escala telescópica E-3", tipo: "Escala", estado: "Operativa", conductor: "Bomb. Villar Cáceres", kilometraje: 29640, combustible: 79, proximoMantenimiento: "02/09/2026" },
  { id: "C-3", denominacion: "Cisterna C-3", tipo: "Cisterna", estado: "Operativa", conductor: "Bomb. Huamán Ríos", kilometraje: 73410, combustible: 58, proximoMantenimiento: "25/08/2026" },
  { id: "U-3", denominacion: "Unidad de comando U-3", tipo: "Comando", estado: "Operativa", conductor: "Bomb. Ferrer Ayala", kilometraje: 21080, combustible: 95, proximoMantenimiento: "30/09/2026" },
  { id: "F-3", denominacion: "Forestal F-3", tipo: "Forestal", estado: "En mantenimiento", conductor: "—", kilometraje: 66720, combustible: 41, proximoMantenimiento: "En taller" },
];

export const HORARIOS_INCIDENCIA = [
  { franja: "00–04", valor: 11 },
  { franja: "04–08", valor: 8 },
  { franja: "08–12", valor: 19 },
  { franja: "12–16", valor: 24 },
  { franja: "16–20", valor: 38 },
  { franja: "20–24", valor: 28 },
];

export const CONSUMO_COMBUSTIBLE = [
  { unidad: "B-3", galones: 186 },
  { unidad: "R-3", galones: 142 },
  { unidad: "A-3", galones: 128 },
  { unidad: "B-13", galones: 117 },
  { unidad: "C-3", galones: 94 },
];

export const ALERTAS_IA = [
  {
    nivel: "critica" as const,
    titulo: "Anomalía en tiempo de respuesta",
    detalle:
      "El turno 16–20 h registra 8:10 min promedio, 27% por encima del objetivo institucional.",
  },
  {
    nivel: "prediccion" as const,
    titulo: "Pronóstico de demanda",
    detalle:
      "Se proyectan 134 emergencias para septiembre (+5%), con mayor incidencia en Cercado de Lima.",
  },
  {
    nivel: "recomendacion" as const,
    titulo: "Optimización de unidades",
    detalle:
      "Reasignar la R-13 al turno tarde reduciría el tiempo de respuesta estimado en 42 segundos.",
  },
  {
    nivel: "aviso" as const,
    titulo: "Mantenimientos próximos",
    detalle: "3 unidades requieren mantenimiento programado dentro de los próximos 10 días.",
  },
];

/* Personal */

export const METRICAS_PERSONAL = [
  { etiqueta: "Asistencia mensual", valor: "87%", nota: "Meta institucional 85%" },
  { etiqueta: "Cumplimiento de guardias", valor: "92%", nota: "Sobre 168 guardias" },
  { etiqueta: "Horas de servicio", valor: "3 240", nota: "Acumuladas este mes" },
  { etiqueta: "Capacitaciones", valor: "14", nota: "Dictadas en el trimestre" },
];

export const PARTICIPACION_PERSONAL = [
  { nombre: "Bomb. Quispe Alarcón", seccion: "Operaciones", emergencias: 38, horas: 186, guardias: 22, asistencia: 96 },
  { nombre: "Bomb. Rojas Medina", seccion: "Operaciones", emergencias: 34, horas: 174, guardias: 21, asistencia: 94 },
  { nombre: "Bomb. Chávez Núñez", seccion: "Rescate", emergencias: 31, horas: 168, guardias: 20, asistencia: 91 },
  { nombre: "Bomb. Salazar Pinto", seccion: "Rescate", emergencias: 27, horas: 152, guardias: 19, asistencia: 89 },
  { nombre: "Bomb. Paredes Loayza", seccion: "Médica", emergencias: 24, horas: 147, guardias: 18, asistencia: 88 },
  { nombre: "Bomb. Villar Cáceres", seccion: "Operaciones", emergencias: 22, horas: 139, guardias: 17, asistencia: 86 },
  { nombre: "Bomb. Huamán Ríos", seccion: "Logística", emergencias: 18, horas: 121, guardias: 15, asistencia: 84 },
  { nombre: "Bomb. Ferrer Ayala", seccion: "Comando", emergencias: 15, horas: 110, guardias: 14, asistencia: 82 },
];

export const GUARDIAS_SECCION = [
  { seccion: "Operaciones", cumplimiento: 96 },
  { seccion: "Rescate", cumplimiento: 91 },
  { seccion: "Médica", cumplimiento: 88 },
  { seccion: "Logística", cumplimiento: 84 },
  { seccion: "Administración", cumplimiento: 79 },
];

export const CAPACITACIONES = [
  { nombre: "Materiales peligrosos (HAZMAT)", fecha: "12/08/2026", inscritos: 24, estado: "Programada" },
  { nombre: "Rescate vehicular avanzado", fecha: "19/08/2026", inscritos: 18, estado: "Programada" },
  { nombre: "Soporte vital básico", fecha: "02/08/2026", inscritos: 31, estado: "Dictada" },
  { nombre: "Manejo defensivo de unidades", fecha: "28/07/2026", inscritos: 12, estado: "Dictada" },
];

/* Administración */

export const METRICAS_ADMINISTRACION = [
  { etiqueta: "Documentos pendientes", valor: "27", nota: "Mesa de Partes" },
  { etiqueta: "Convenios vigentes", valor: "6", nota: "2 por renovar" },
  { etiqueta: "Requerimientos abiertos", valor: "9", nota: "De 14 del mes" },
  { etiqueta: "Caja chica", valor: "S/ 1 840", nota: "Saldo disponible" },
];

export type Requerimiento = {
  id: string;
  descripcion: string;
  seccion: string;
  monto: string;
  fecha: string;
  estado: "Solicitado" | "En cotización" | "Aprobado" | "Atendido";
};

export const REQUERIMIENTOS: Requerimiento[] = [
  { id: "REQ-041", descripcion: "Equipos de protección personal (24 juegos)", seccion: "Logística", monto: "S/ 18 400", fecha: "04/08/2026", estado: "En cotización" },
  { id: "REQ-040", descripcion: "Mangueras de 2½ pulgadas (12 tramos)", seccion: "Operaciones", monto: "S/ 7 200", fecha: "03/08/2026", estado: "Aprobado" },
  { id: "REQ-039", descripcion: "Mantenimiento correctivo unidad B-23", seccion: "Máquinas", monto: "S/ 5 950", fecha: "01/08/2026", estado: "Aprobado" },
  { id: "REQ-038", descripcion: "Insumos médicos para ambulancias", seccion: "Médica", monto: "S/ 3 120", fecha: "30/07/2026", estado: "Atendido" },
  { id: "REQ-037", descripcion: "Útiles de oficina y toners", seccion: "Administración", monto: "S/ 890", fecha: "29/07/2026", estado: "Atendido" },
  { id: "REQ-042", descripcion: "Renovación de extintores de la sede", seccion: "Logística", monto: "S/ 2 460", fecha: "05/08/2026", estado: "Solicitado" },
];

export const CONVENIOS = [
  { entidad: "Municipalidad de Cercado de Lima", objeto: "Apoyo logístico y capacitación", vence: "31/12/2026", estado: "Vigente" },
  { entidad: "Hospital Loayza", objeto: "Atención prehospitalaria", vence: "30/09/2026", estado: "Por renovar" },
  { entidad: "UTEC", objeto: "Automatización de procesos administrativos", vence: "31/10/2026", estado: "Vigente" },
  { entidad: "INDECI", objeto: "Simulacros multisectoriales", vence: "15/09/2026", estado: "Por renovar" },
  { entidad: "Empresa Aceros del Sur", objeto: "Donación de equipamiento", vence: "31/12/2026", estado: "Vigente" },
  { entidad: "Escuela CGBVP", objeto: "Programa de instrucción continua", vence: "31/12/2026", estado: "Vigente" },
];
