# Compañía de Bomberos Voluntarios France N° 3 — Plataforma de gestión

Panel institucional que reúne los dos proyectos de modernización de la Compañía:
Bandeja Documental y dashboard ejecutivo.

---

# Arquitectura

## Procesos desplegados

Es **un proceso propio** más un servicio gestionado. Supabase no se despliega: se consume.

| Pieza | Función en la app |
|---|---|
| **Next.js 16** (Vercel) | Panel, sesión, Server Actions y Route Handlers. Aquí viven todas las consultas del panel. |
| **Supabase** (gestionado) | Postgres, Auth (identidad y roles), Storage (archivos registrados), Queues (cola de cargas), Edge Functions (worker de ingesta) y Realtime (avisos al panel). |

La ingesta de consolidados no añade un segundo proveedor: la cola, el worker y los avisos viven
dentro de Supabase. Sigue siendo un proceso propio más un servicio gestionado.

**Acceso a datos.** El panel usa la clave anónima de Supabase con el JWT del usuario, de modo
que RLS aplica en la base. La `service_role` queda reservada a tareas administrativas fuera del
panel.

**El worker es la excepción.** La Edge Function de ingesta escribe con `service_role` y por tanto
no pasa por RLS. El alcance de lo que puede tocar cada carga —la sección del usuario que la
subió— se valida en el código del worker, no en la base.

## Distribución del código

```
src/
  app/panel/bandeja-documental/   registro, listado y detalle de documentos
  app/panel/dashboard/            tablero ejecutivo
  lib/db/                         capa de acceso tipada a Supabase

supabase/
  migrations/                     esquema, vistas y políticas RLS
  functions/procesar-carga/       worker de ingesta (Deno)
```

# Módulos de la app

## 1. Bandeja Documental

Registro, clasificación, derivación y trazabilidad de la documentación que entra y sale de la
Compañía. Cada documento recibe un número único, se deriva a una sección responsable y guarda
el historial de etapas por las que pasó. El archivo original va a Storage y su texto extraído
queda disponible para la búsqueda de la bandeja.

## 2. Dashboard ejecutivo

Indicadores operativos, administrativos y de personal para la Jefatura y el Cuadro de
Oficiales: estado de unidades, emergencias atendidas, tiempos de respuesta, asistencia,
requerimientos y convenios. Los agregados son vistas SQL calculadas sobre las mismas tablas que
alimentan la bandeja.

## 3. Ingesta de consolidados

Los oficiales cargan la información operativa en Excel. Cada archivo subido es una fila de
`cargas` con estado propio: el usuario ve su progreso, su resultado y el motivo si falló, y el
dashboard se actualiza solo cuando la carga cierra. El detalle está en *Ingesta y tiempo real*.

# Esquema de datos

Migraciones SQL en `supabase/migrations/`.

**Núcleo compartido**

- `secciones` — áreas de la Compañía; destinos de derivación.
- `personal` — perfil del bombero, ligado a `auth.users`; grado, sección y rol. Base del KPI de
  files del dashboard.

**Bandeja Documental**

- `documentos` — número, tipo, asunto, remitente, sección destino, prioridad, estado, fecha de
  ingreso, ruta del archivo en Storage y texto extraído.
- `documento_etapas` — trazabilidad: cada movimiento del documento con su fecha y responsable.
- `tipos_documento` — catálogo cerrado de tipos documentales.

**Dashboard**

- `unidades`, `emergencias`, `requerimientos`, `convenios`, más vistas SQL para los agregados.
  Las filas cargadas desde Excel llevan `carga_id`, que es lo que hace idempotente el reproceso.

**Ingesta**

- `cargas` — un Excel subido: usuario, ruta en Storage, estado, filas totales y procesadas,
  intentos, `locked_at` y detalle del error. Fuente de verdad del trabajo y origen de los avisos
  al panel.

**RLS** — la Jefatura ve todo; cada sección ve los documentos derivados a ella; el personal ve
solo lo propio. Cada oficial ve únicamente sus propias cargas.

# Ingesta y tiempo real

## Por qué hay una cola

Parsear un Excel dentro de una Server Action agota el tiempo de la petición y deja al usuario
mirando una pantalla quieta. El trabajo se encola y se procesa aparte. La cola es `pgmq` dentro
del mismo Postgres, así que el encolado ocurre en la misma transacción que la fila de `cargas`:
no existe el caso de un archivo subido que nadie llegue a procesar.

## El orden importa

La fila se crea **antes** que la subida. Al revés quedarían archivos huérfanos en Storage el día
que Postgres no responda.

1. `INSERT` en `cargas` con estado `esperando_archivo` y la ruta de Storage reservada
2. Signed upload URL para esa ruta
3. El navegador sube el Excel directo a Storage — el server de Next.js nunca toca el archivo
4. `UPDATE` a `pendiente` y encolado, en la misma transacción

Si algo falla en cualquier punto, el usuario ve el error antes de que exista trabajo a medias y
la fila queda en un estado visible que un barrido puede cerrar. Ningún fallo es silencioso.

## Estados de una carga

```
esperando_archivo ──▶ pendiente ──▶ procesando ──▶ completado
        │                                └──────▶ error
        └──▶ caducada          (barrido: subida abandonada)
```

## El worker

Edge Function en `supabase/functions/procesar-carga`, despertada por el encolado y por un
`pg_cron` de respaldo. Descarga el Excel de Storage, valida cabeceras, inserta por lotes y cierra
la fila.

- **Idempotencia.** Toda fila insertada lleva `carga_id`; reprocesar borra por `carga_id` y
  vuelve a insertar. Un reintento nunca duplica datos.
- **Bloqueo.** Al pasar a `procesando` se graba `locked_at`. Un `pg_cron` devuelve a `pendiente`
  lo que lleve más de cinco minutos bloqueado e incrementa `intentos`. Es el equivalente del
  visibility timeout de una cola externa, y cubre al worker que muere a mitad.
- **Solo se reintenta lo transitorio.** La base saturada se reintenta. Un Excel con la cabecera
  equivocada no: pasa a `error` con la fila y la columna del problema, y eso se muestra en el
  panel. Reintentar tres veces un archivo mal formado no lo arregla y esconde el motivo.
- **Excels grandes.** La Edge Function tiene tope de ejecución. Por encima del umbral la carga se
  parte en bloques, un mensaje por bloque, y cierra cuando todos terminan. `filas_procesadas`
  alimenta la barra de progreso.

## Actualización del panel

Los gráficos siguen saliendo de las vistas SQL consultadas por Server Components. Realtime no
entrega métricas: **avisa**, y el panel vuelve a consultar.

Una vista no puede estar en una publicación de replicación. No almacena datos, así que no genera
entradas en el WAL y no hay evento que emitir. Lo observable es la tabla `cargas`.

| Canal | Qué transporta | Por qué ese canal |
|---|---|---|
| **Postgres Changes** sobre `cargas` | `completado` y `error` | Hecho durable: el oficial debe poder consultarlo mañana. |
| **Broadcast** | progreso por bloque | Efímero; no merece una escritura ni pasar por replicación. |

Un componente cliente sin render escucha `cargas` y llama a `router.refresh()`. El Server
Component vuelve a consultar la vista y React reconcilia el SVG, sin recarga de página. Los
gráficos no pasan a cliente. Frente a un sondeo periódico, esto no ejecuta ninguna consulta
mientras nadie sube nada, y llega en el instante exacto en que sí.

## Si Supabase no responde

Nada se pierde, porque nada se confirma a medias. Con Postgres caído la fila de `cargas` no se
crea y el usuario ve el error antes de subir nada; los metadatos de Storage viven en
`storage.objects`, dentro del mismo Postgres, así que la subida tampoco prospera por su cuenta.
Una carga ya confirmada sobrevive: el archivo está en Storage y la fila comprometida en el WAL.
Al volver el servicio, el worker toma lo que quedó en `pendiente`. Una caída es indisponibilidad,
no pérdida de datos.

# Orden de implementación

**Fase 1 — Fundaciones.** Proyecto Supabase, migración inicial y semillas. Auth sobre Supabase
reemplazando el acceso de demostración, conservando la firma de `obtenerSesion()` para no tocar
el layout ni las páginas. Capa de acceso tipada en `src/lib/db/`; las páginas cambian el origen
de datos, no su render.

**Fase 2 — Bandeja Documental.** Registro con subida del archivo a Storage, derivación por
sección y trazabilidad de etapas. Búsqueda por número, remitente y asunto expuesta al buscador
de la bandeja.

**Fase 3 — Dashboard.** Las vistas SQL de los agregados y las páginas del tablero contra ellas.

**Fase 4 — Ingesta y tiempo real.** Tabla `cargas`, cola `pgmq` y la Edge Function de parseo con
idempotencia por `carga_id` y los barridos de `pg_cron`. Al final, la suscripción del panel a
`cargas` y el progreso por Broadcast. Va después del dashboard: hasta que las vistas no existan,
no hay nada que refrescar.

# Verificación

- `supabase db reset` levanta esquema y semillas sin error.
- **RLS:** un usuario de la sección A consultando un documento derivado a la sección B recibe 0
  filas desde la base — no un 403 en la app. Confirma que RLS aplica y que no se está usando la
  `service_role`.
- **Numeración:** dos registros concurrentes del mismo tipo producen números distintos.
- **Trazabilidad:** derivar un documento agrega su etapa con fecha, hora y responsable, y el
  detalle la refleja en orden.
- **Ingesta idempotente:** procesar dos veces la misma carga deja el mismo número de filas.
- **Fallo de validación:** un Excel con cabecera incorrecta termina en `error` indicando fila y
  columna, sin gastar reintentos.
- **Worker interrumpido:** matar el worker en `procesando` devuelve la carga a `pendiente` al
  vencer el bloqueo, y la segunda pasada la completa sin duplicar.
- **Tiempo real:** al cerrarse una carga el dashboard refleja los datos nuevos sin recarga
  manual, y sin haber consultado las vistas mientras no había nada que cargar.
