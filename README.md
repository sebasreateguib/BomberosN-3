# Compañía de Bomberos Voluntarios France N° 3 — Plataforma de gestión

Panel institucional que reúne los tres proyectos de modernización de la Compañía:
Mesa de Partes Virtual, agente de IA para generación documental y dashboard ejecutivo.

## Desarrollo

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000). Acceso de demostración: `b-1866` / `france1866`.

---

# Arquitectura

| Pieza | Función en la app |
|---|---|
| **Next.js 16** (Vercel) | Panel, autenticación de sesión, Server Actions y Route Handlers. Consulta Supabase directamente y ejecuta la generación documental. |
| **Supabase** | Postgres con pgvector (datos de los tres módulos), Auth (identidad y roles), Storage (archivos de los documentos registrados). |
| **Worker Python** (Fly / Render / Cloud Run) | Ingesta asíncrona: docling, OCR, chunking y embeddings de documentos escaneados. Corre fuera del camino de la petición, disparado por cola o cron. |
| **LLM + embeddings** (API externa) | Redacción del cuerpo de los documentos y vectorización del corpus para búsqueda semántica. |

Un solo proceso Next.js sirve los tres módulos. El servicio Python existe únicamente porque
docling y el stack de OCR son Python, y no participa en ninguna petición del usuario.

**Regla de acceso a datos:** las lecturas y escrituras del panel usan la clave anónima de
Supabase con el JWT del usuario, de modo que RLS aplica en la base. La `service_role` queda
reservada al worker de ingesta.

## Módulos

### 1. Mesa de Partes Virtual

Registro, clasificación, derivación y trazabilidad de la documentación que entra y sale de la
Compañía. Cada documento recibe un número único, se deriva a una sección responsable y guarda
el historial de etapas por las que pasó. El archivo original va a Storage; su texto se indexa
para búsqueda semántica en lenguaje natural.

### 2. Agente de generación documental

A partir de pocos datos (tipo, destinatario, asunto, antecedentes, fecha) produce oficios,
notas informativas, informes, memorandos, cartas, actas y solicitudes con el formato
institucional, listos para revisar y descargar en PDF.

**El formato no sale del LLM.** El tipo documental lo elige el usuario, así que la plantilla se
carga por clave desde SQL — no por búsqueda vectorial. El modelo redacta prosa dentro de un
esquema validado y un renderer determinista arma la maquetación:

```
inputs del usuario ─┐
plantilla (SQL)  ───┼─→ LLM ─→ JSON validado ─→ renderer determinista ─→ PDF
contexto RAG     ───┘          (secciones)        (membrete, correlativo,
                                                   fórmulas de cortesía)
```

Así la uniformidad del formato es una garantía estructural. pgvector se reserva para lo que sí
es abierto: recuperación de antecedentes y selección de ejemplos de estilo.

### 3. Dashboard ejecutivo

Indicadores operativos, administrativos y de personal para la Jefatura y el Cuadro de
Oficiales: estado de unidades, emergencias atendidas, tiempos de respuesta, asistencia,
requerimientos y convenios. Los agregados son vistas SQL calculadas sobre las mismas tablas
que alimentan los otros dos módulos.

## Esquema de datos

Migraciones SQL en `supabase/migrations/`.

**Núcleo compartido**

- `secciones` — áreas de la Compañía; destinos de derivación.
- `personal` — perfil del bombero, ligado a `auth.users`; grado, sección y rol. Base del KPI de
  files del dashboard.

**Mesa de Partes**

- `documentos` — número, tipo, asunto, remitente, sección destino, prioridad, estado, fecha de
  ingreso, ruta del archivo en Storage y texto extraído.
- `documento_etapas` — trazabilidad: cada movimiento del documento con su fecha y responsable.
- `fragmentos` — chunks de texto con `embedding vector(N)` e índice HNSW. Se escriben al
  registrar el documento.

**Agente**

- `tipos_documento` — catálogo cerrado de tipos documentales.
- `plantillas` — por tipo: patrón de encabezado, `esquema_json` con las secciones que el LLM
  debe llenar, instrucciones de redacción, fórmula de cierre y `version`.
- `documentos_generados` — entrada del usuario (`jsonb`), contenido generado (`jsonb`), estado,
  autor, duración, modelo y tokens consumidos.
- `correlativos` — numeración atómica por tipo y año.

**Dashboard**

- `unidades`, `emergencias`, `requerimientos`, `convenios`, más vistas SQL para los agregados.

**RLS** — la Jefatura ve todo; cada sección ve los documentos derivados a ella; el personal ve
solo lo propio.

## Orden de implementación

1. **Fundaciones** — proyecto Supabase con `vector` habilitado, migración inicial, semillas.
   Auth real sobre Supabase y capa de acceso tipada en `src/lib/db/`.
2. **Agente** — `POST /api/agente/generar`: carga de plantilla por tipo, correlativo atómico,
   contexto (ejemplos de estilo del mismo tipo y, si hay corpus, fragmentos relevantes),
   llamada al LLM con salida estructurada, persistencia y respuesta en streaming. Renderer PDF
   consumiendo el JSON estructurado.
3. **Mesa de Partes y Dashboard** — registro con subida a Storage y embedding al insertar,
   búsqueda semántica vía función RPC con `<=>` sobre `fragmentos`, dashboard contra vistas SQL.
4. **Ingesta con docling** — worker Python para los documentos escaneados que entren por mesa
   de partes: docling → texto estructurado → chunks → embeddings → `fragmentos`.

El corpus de RAG se alimenta del uso: cada documento registrado y cada documento generado se
indexa al escribirse. Docling entra cuando empiece a llegar documento físico escaneado.

Salida en PDF en la primera etapa; el mismo JSON estructurado alimentará después un renderer
`.docx` sin cambiar el modelo ni el prompt.
