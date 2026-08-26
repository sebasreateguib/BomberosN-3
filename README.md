# Compañía de Bomberos Voluntarios France N° 3 — Plataforma de gestión

Panel institucional que reúne los tres proyectos de modernización de la Compañía:
Mesa de Partes Virtual, agente de IA para generación documental y dashboard ejecutivo.

## Desarrollo

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000). Acceso de demostración: `b-1866` / `france1866`.

Stack actual: Next.js 16 (App Router), React 19, CSS Modules, jsPDF.

---

# Plan de backend

## Contexto

Hoy el repositorio es una maqueta de frontend completa y sin backend: no hay base de datos,
`src/lib/auth.ts` compara credenciales hardcodeadas, y las tres pantallas del panel leen de
`src/lib/datos-demo.ts` (768 líneas de datos fijos). El agente de IA de
`src/app/panel/agente-ia/Generador.tsx:44` simula la redacción con un `setTimeout` de 1.5 s y
rellena string templates.

Los requisitos definen tres proyectos que comparten los mismos datos:

1. **Mesa de Partes Virtual** — registro, clasificación, derivación y trazabilidad de
   documentos. Pide búsqueda semántica en lenguaje natural.
2. **Agente de generación documental** — a partir de pocos inputs produce oficios, notas
   informativas, informes, memorandos, cartas, actas y solicitudes con el formato institucional.
3. **Dashboard ejecutivo** — indicadores operativos, administrativos y de personal.

El objetivo de este plan es la primera capa de backend real, compartida por los tres, con el
Proyecto 2 como primer módulo funcional de punta a punta.

### Decisión central: el formato NO sale del LLM

La pregunta que originó este plan era si convenía procesar las plantillas con docling y
meterlas a pgvector para que el agente las recupere. **No.** Los tipos documentales son un
conjunto cerrado y el usuario ya elige el tipo en un `<select>` — eso es un lookup por clave,
no una búsqueda semántica; usar k-NN ahí cambia un acierto del 100% por uno probabilístico.

El diseño es:

```
inputs del usuario ─┐
plantilla (SQL)  ───┼─→ LLM ─→ JSON validado ─→ renderer determinista ─→ PDF
contexto RAG     ───┘          (secciones)        (membrete, correlativo,
                                                   fórmulas de cortesía)
```

El LLM redacta **prosa dentro de un esquema**; nunca emite maquetación. Así la "uniformidad
100%" que promete la infografía es una garantía estructural, no una esperanza. `PLANTILLAS`
(`src/lib/datos-demo.ts:385`) y `src/lib/pdf-documento.ts` ya tienen esta separación — solo
hay que mover las plantillas a la BD y reemplazar el `cuerpo()` de string template por la
llamada al modelo.

pgvector se reserva para lo que sí es abierto: búsqueda semántica en mesa de partes,
recuperación de antecedentes y selección de ejemplos de estilo.

### Corpus: no existe todavía, y se construye solo

No hay plantillas oficiales, ni oficios previos, ni el RIF en digital. Por lo tanto **el
pipeline de docling no se construye en esta etapa** — no tendría entrada. El corpus se
alimenta del uso: cada documento que entra a mesa de partes y cada documento generado se
indexa al escribirse. A ~128 documentos/mes, hacia el tercer mes hay masa crítica para que el
RAG aporte. Docling entra cuando empiece a llegar documento escaneado por mesa de partes, que
es su caso de uso real (OCR + extracción de estructura).

## Arquitectura

Se descarta el esquema de microservicios: a 4 documentos/día no hay componente que escale
distinto, y el costo operativo (3 deploys, secretos, auth entre servicios, debugging
distribuido) no se paga solo. Monolito modular ahora; partir después si algo se vuelve cuello
de botella real.

| Pieza | Qué corre ahí | Por qué |
|---|---|---|
| **Next.js** (Vercel) | Panel, Server Actions, Route Handlers, generación documental, consultas al dashboard | Ya existe; habla directo a Supabase con el JWT del usuario para que **RLS realmente aplique** |
| **Supabase** | Postgres + pgvector + Auth + Storage | Una sola BD para los tres proyectos |
| **Worker Python** (Fly/Render/Cloud Run) | Ingesta: docling, OCR, chunking, embeddings | Única razón legítima para Python; corre **fuera del request path**, disparado por cola/cron |
| **Externo** | LLM + embeddings | La generación se llama desde Next.js; los embeddings desde el worker y desde el hook de escritura |

**Trampa a evitar:** si el código de servidor usa la `service_role` key, RLS queda anulado y la
autorización hay que reimplementarla a mano. Usar la clave anónima con el JWT del usuario en
todo el camino de lectura/escritura del panel; la `service_role` solo en el worker.

## Esquema de datos

Migraciones SQL en `supabase/migrations/`. Los tipos de `datos-demo.ts` son la fuente para los
tipos de columna — se conservan los nombres en español.

**Núcleo compartido**

- `secciones` — áreas de la Compañía (destinos de derivación); semilla desde `DESTINATARIOS`
  (`datos-demo.ts:551`).
- `personal` — reemplaza `Bombero` (`datos-demo.ts:7`); `id` referencia `auth.users`, más
  grado, sección y rol. Es también la tabla del KPI de files del Proyecto 3.

**Proyecto 1 — Mesa de Partes**

- `documentos` — campos de `Documento` (`datos-demo.ts:54`): número, tipo, asunto, remitente,
  sección destino, prioridad, estado, fecha de ingreso, `archivo_path` (Supabase Storage),
  `texto_extraido`.
- `documento_etapas` — trazabilidad; corresponde al tipo `Etapa` (`datos-demo.ts:45`).
- `fragmentos` — chunks con `embedding vector(N)`; índice HNSW. Se llena al registrar un
  documento, no en un batch aparte.

**Proyecto 2 — Agente**

- `tipos_documento` — catálogo cerrado (oficio, nota informativa, informe, memorando, carta,
  acta, solicitud).
- `plantillas` — por tipo: patrón de encabezado, `esquema_json` (JSON Schema de las secciones
  que el LLM debe llenar), instrucciones de redacción, fórmula de cierre, `version`. Migradas
  desde `PLANTILLAS` (`datos-demo.ts:385`), que hoy ya contiene las seis redactadas.
- `documentos_generados` — sustituye `HISTORIAL_GENERADOS` (`datos-demo.ts:482`): entrada del
  usuario (`jsonb`), contenido generado (`jsonb`), estado, autor, duración, modelo y tokens
  usados (para costos).
- `correlativos` — numeración atómica por tipo y año. Hoy el correlativo se incrementa en el
  cliente (`Generador.tsx:33`), lo que produce duplicados con dos usuarios simultáneos; debe
  ser una secuencia en BD o un `UPDATE ... RETURNING`.

**Proyecto 3 — Dashboard**

- `unidades`, `emergencias`, `requerimientos`, `convenios` — desde `UNIDADES`
  (`datos-demo.ts:642`), `REQUERIMIENTOS` (`:752`), `CONVENIOS` (`:761`). Los agregados del
  dashboard (`KPIS_EJECUTIVO`, `EMERGENCIAS_TIPO`, `EVOLUCION_OPERATIVA`) pasan a ser vistas
  SQL, no constantes.

**RLS** — políticas por rol: la Jefatura ve todo; cada sección ve sus documentos derivados; el
personal ve solo lo suyo. Cubre el requisito de "acceso solo para usuarios autorizados" que
aparece en los tres proyectos.

## Implementación

### Fase 1 — Fundaciones

1. Proyecto Supabase; habilitar `vector`. Migración inicial con el esquema de arriba.
2. Semillas desde `datos-demo.ts` para no perder el contenido de la maqueta.
3. Sustituir el auth demo: `src/lib/auth.ts` y `src/lib/sesion.ts` pasan a Supabase Auth.
   `obtenerSesion()` (`sesion.ts:27`) mantiene su firma y devuelve el perfil de `personal`, de
   modo que `src/app/panel/layout.tsx` y los `page.tsx` no cambian.
4. Capa de acceso en `src/lib/db/` (una función por consulta, tipada). Los `page.tsx` cambian
   el import de `datos-demo` por el de `db/`.

### Fase 2 — Agente (Proyecto 2, el módulo que se demuestra)

5. `POST /api/agente/generar` (Route Handler, `src/app/api/agente/generar/route.ts`):
   - carga la plantilla y su `esquema_json` por `tipo_documento` — SQL, no vectores;
   - toma correlativo atómico;
   - reúne contexto: hasta 3 documentos aprobados del mismo tipo como ejemplos de estilo
     (`WHERE tipo = ? ORDER BY fecha DESC LIMIT 3` — SQL plano; el ranking vectorial es mejora
     posterior) y, si hay corpus, fragmentos relevantes al asunto;
   - una llamada al LLM con salida estructurada validada contra el `esquema_json`;
   - persiste en `documentos_generados` y devuelve el JSON de secciones.
   - Streaming en la respuesta: la redacción tarda decenas de segundos y hoy la UI ya tiene el
     estado `trabajando` con esqueletos (`Generador.tsx:191`) esperando ser alimentado.
6. `Generador.tsx` reemplaza el `setTimeout` de `generar()` por la llamada real. La vista
   previa (`Generador.tsx:186-262`) ya renderiza a partir de `parrafos: string[]`, así que el
   cambio es de origen de datos, no de UI.
7. `src/lib/pdf-documento.ts` pasa a consumir el JSON estructurado en vez de strings sueltos.
8. Historial (`agente-ia/historial/page.tsx`) leyendo de `documentos_generados`; los KPIs de esa
   página (hoy calculados sobre el array demo, `historial/page.tsx:14`) pasan a agregados SQL.

### Fase 3 — Mesa de Partes y Dashboard

9. Registro de documentos con subida a Storage; embedding del texto al insertar.
10. Búsqueda semántica: función RPC en Postgres con `<=>` sobre `fragmentos`, expuesta al
    buscador de `TablaDocumentos.tsx:42` (hoy filtra en cliente sobre el array completo).
11. Dashboard contra vistas SQL.

### Fase 4 — Ingesta con docling (cuando haya papel entrando)

12. Worker Python: cola de documentos escaneados → docling → texto estructurado + chunks +
    embeddings → `fragmentos`. Recién aquí el servicio Python se justifica.

## Verificación

- **Migraciones:** `supabase db reset` local levanta el esquema y las semillas sin error.
- **RLS:** con un usuario de sección A, consultar un documento derivado a la sección B debe
  devolver 0 filas — no un 403 en el código de la app, sino nada desde la BD. Es la prueba de
  que RLS aplica y no se está usando la `service_role`.
- **Correlativo:** dos peticiones concurrentes a `/api/agente/generar` con el mismo tipo deben
  producir números distintos. Es la regresión que el código actual sí tiene.
- **Generación:** `npm run dev`, entrar al panel, generar uno de cada tipo documental. Cada
  salida debe validar contra su `esquema_json` (rechazar y reintentar si no) y el PDF debe
  traer membrete, número correlativo y fórmula de cierre correctos.
- **Búsqueda semántica:** consultar "documentos sobre mantenimiento de unidades" y verificar que
  trae el requerimiento de la unidad B-3 aunque no contenga esas palabras.
- **Costos:** revisar `documentos_generados` y confirmar que el consumo de tokens por documento
  está dentro de lo esperado antes de abrir el uso a toda la Compañía.

## Fuera de alcance

- Docling / OCR (Fase 4, sin insumos hoy).
- Ranking vectorial de ejemplos de estilo: SQL por fecha primero, vectores cuando haya corpus.
- Salida `.docx`: se decidió PDF primero reusando `pdf-documento.ts`; el mismo JSON alimentará
  después un renderer `.docx` sin tocar el modelo ni el prompt.
