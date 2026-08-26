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

## Procesos desplegados

Son **dos procesos propios** más un servicio gestionado. Supabase no se despliega: se consume.

| Pieza | Función en la app |
|---|---|
| **Next.js 16** (Vercel) | Panel, sesión, Server Actions y Route Handlers. Aquí vive el endpoint de generación documental y todas las consultas del panel. |
| **Supabase** (gestionado) | Postgres con pgvector, Auth (identidad y roles), Storage (archivos registrados). |
| **Servicio Python** (Fly / Render / Cloud Run) | Todo lo que toca embeddings: ingesta con docling y OCR al escribir, y el endpoint de retrieval al consultar. |
| **LLM + embeddings** (API externa) | Redacción del cuerpo de los documentos; vectorización del corpus. |

**Por qué Python está separado y el resto no.** La frontera es el embedding, no "backend vs
frontend". El worker embebe los documentos al escribirlos y el retrieval embebe la consulta: si
eso vive en dos lenguajes, se desincronizan las versiones de cliente y la normalización, y un
índice con embeddings distintos entre escritura y consulta no falla ruidosamente — devuelve
peores resultados en silencio. Todo lo demás (SQL, LLM, streaming) se queda en Next.js.

**Acceso a datos.** El panel usa la clave anónima de Supabase con el JWT del usuario, de modo
que RLS aplica en la base. La `service_role` queda reservada al servicio Python.

## Módulos dentro de Next.js

El generador y el context builder **son módulos, no servicios**: viven dentro del proceso de
Next.js. La tabla de arriba lista procesos desplegados; estos dos están dentro del primero.

```
src/
  app/api/agente/generar/route.ts   endpoint de generación
  lib/agente/
    contexto.ts                     context builder
    generar.ts                      llamada al LLM + validación
  lib/db/                           capa de acceso tipada a Supabase
  lib/pdf-documento.ts              renderer determinista
```

Camino de una generación:

```
navegador
   │  POST /api/agente/generar  { tipo, destinatario, asunto, antecedentes, fecha }
   ▼
route.ts
   ├─→ contexto.ts ──→ Supabase          plantilla + correlativo + ejemplos de estilo
   │               └─→ Python /contexto  fragmentos RAG (fase 3; se omite si no hay corpus)
   ├─→ generar.ts ───→ LLM               JSON validado contra esquema_json
   └─→ Supabase                          persiste en documentos_generados
   ▼  respuesta en streaming
navegador ─→ pdf-documento.ts ─→ PDF
```

`contexto.ts` recibe `(tipo, datos del formulario)` y devuelve el prompt armado junto con los
datos deterministas: plantilla, número correlativo y fórmula de cierre. Mantener ese borde
definido es lo que permite moverlo a un servicio propio más adelante sin tocar a quien lo llama.

# Módulos de la app

## 1. Mesa de Partes Virtual

Registro, clasificación, derivación y trazabilidad de la documentación que entra y sale de la
Compañía. Cada documento recibe un número único, se deriva a una sección responsable y guarda
el historial de etapas por las que pasó. El archivo original va a Storage; su texto se indexa
para búsqueda semántica en lenguaje natural.

## 2. Agente de generación documental

A partir de tipo, destinatario, asunto, antecedentes y fecha produce oficios, notas
informativas, informes, memorandos, cartas, actas y solicitudes con el formato institucional,
listos para revisar y descargar en PDF.

**El formato no sale del LLM.** El tipo documental lo elige el usuario, así que la plantilla se
carga por clave desde SQL — no por búsqueda vectorial. El modelo redacta prosa dentro de un
esquema validado y un renderer determinista arma la maquetación:

```
inputs del usuario ─┐
plantilla (SQL)  ───┼─→ LLM ─→ JSON validado ─→ renderer determinista ─→ PDF
contexto RAG     ───┘          (secciones)        (membrete, correlativo,
                                                   fórmulas de cortesía)
```

| | Quién lo produce | Puede fallar |
|---|---|---|
| Estructura, membrete, numeración, orden de secciones, cierre, firma | Plantilla + código | No |
| Las palabras dentro de cada sección | LLM | Sí — por eso se valida contra el esquema |

La plantilla define en `esquema_json` las secciones que el modelo debe llenar. Para un oficio:

```json
{
  "apertura":   "Frase de apertura protocolar dirigida al destinatario, indicando la finalidad",
  "desarrollo": "Exposición del asunto incorporando los antecedentes",
  "solicitud":  "Lo que se pide concretamente y por qué vía se espera respuesta",
  "cortesia":   "Párrafo de cierre protocolar"
}
```

El modelo devuelve exactamente esas claves con prosa dentro. No emite membrete, número, cierre,
firma ni maquetación: eso lo pone el renderer. Si la respuesta no valida contra el esquema, se
reintenta una vez y no se persiste nada malformado.

pgvector se reserva para lo que sí es abierto: recuperación de antecedentes y selección de
ejemplos de estilo.

## 3. Dashboard ejecutivo

Indicadores operativos, administrativos y de personal para la Jefatura y el Cuadro de
Oficiales: estado de unidades, emergencias atendidas, tiempos de respuesta, asistencia,
requerimientos y convenios. Los agregados son vistas SQL calculadas sobre las mismas tablas que
alimentan los otros dos módulos.

# Esquema de datos

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

# Orden de implementación

**Fase 1 — Fundaciones.** Proyecto Supabase con `vector` habilitado, migración inicial y
semillas. Auth sobre Supabase reemplazando el acceso de demostración, conservando la firma de
`obtenerSesion()` para no tocar el layout ni las páginas. Capa de acceso tipada en
`src/lib/db/`; las páginas cambian el origen de datos, no su render.

**Fase 2 — Agente.** `POST /api/agente/generar`: plantilla por tipo, correlativo atómico,
ejemplos de estilo del mismo tipo (SQL por fecha), llamada al LLM con salida estructurada
validada contra `esquema_json` con un reintento, persistencia y respuesta en streaming.
`Generador.tsx` cambia su simulación por la llamada real; la vista previa ya renderiza desde un
arreglo de párrafos, así que cambia el origen de datos, no la UI. `pdf-documento.ts` pasa a
consumir el JSON estructurado. El historial y sus KPIs pasan a agregados SQL.

**Fase 3 — Mesa de Partes y Dashboard.** Registro con subida a Storage y embedding al insertar.
Búsqueda semántica vía función RPC con `<=>` sobre `fragmentos`, expuesta al buscador de la
bandeja. Dashboard contra vistas SQL. Aquí aparece el endpoint `POST /contexto` del servicio
Python, y `contexto.ts` empieza a llamarlo.

**Fase 4 — Ingesta con docling.** Cuando empiece a entrar documento escaneado por mesa de
partes: cola → docling → texto estructurado → chunks → embeddings → `fragmentos`. Se agrega al
servicio Python que ya existe desde la fase 3; no es un despliegue nuevo.

El corpus de RAG se alimenta del uso: cada documento registrado y cada documento generado se
indexa al escribirse. Por eso las fases 3 y 4 llegan después — antes no hay qué recuperar.

Salida en PDF en la primera etapa; el mismo JSON estructurado alimentará después un renderer
`.docx` sin cambiar el modelo ni el prompt.

# Verificación

- `supabase db reset` levanta esquema y semillas sin error.
- **RLS:** un usuario de la sección A consultando un documento derivado a la sección B recibe 0
  filas desde la base — no un 403 en la app. Confirma que RLS aplica y que no se está usando la
  `service_role`.
- **Correlativo:** dos peticiones concurrentes a `/api/agente/generar` del mismo tipo producen
  números distintos.
- **Generación:** generar uno de cada tipo documental; cada salida valida contra su
  `esquema_json` y el PDF trae membrete, correlativo y fórmula de cierre correctos.
- **Búsqueda semántica:** "documentos sobre mantenimiento de unidades" debe traer el
  requerimiento de la unidad B-3 aunque no contenga esas palabras.
- **Costos:** revisar tokens por documento en `documentos_generados` antes de abrir el uso a
  toda la Compañía.
