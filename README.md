# Compañía de Bomberos Voluntarios France N° 3 — Plataforma de gestión

Panel institucional que reúne los dos proyectos de modernización de la Compañía:
Bandeja Documental y dashboard ejecutivo.

---

# Arquitectura

## Procesos desplegados

Es **un proceso propio** más un servicio gestionado, y un destino externo de solo escritura.
Supabase no se despliega: se consume.

| Pieza | Función en la app |
|---|---|
| **Next.js 16** (Vercel) | Panel, sesión, Server Actions y Route Handlers. Aquí viven todas las consultas del panel. |
| **Supabase** (gestionado) | Postgres, Auth (identidad y roles), Storage (archivos registrados), Queues (colas de cargas y de archivado), Edge Functions (workers de ingesta y de archivado) y Realtime (avisos al panel). |
| **Google Drive** (externo) | Copia de respaldo de los documentos archivados. Destino, no origen: el panel nunca lee de aquí. |

La ingesta de consolidados no añade un segundo proveedor: la cola, el worker y los avisos viven
dentro de Supabase. Google Drive sí es un tercero, pero pasivo: ninguna lectura del panel depende
de que responda, y si está caído lo único que se retrasa es la copia. El detalle está en
*Archivado en Google Drive*.

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
  functions/archivar-en-drive/    worker de copia a Google Drive (Deno)
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
  ingreso, ruta del archivo en Storage, texto extraído y `archivado_en`.
- `documento_etapas` — trazabilidad: cada movimiento del documento con su fecha y responsable.
- `tipos_documento` — catálogo cerrado de tipos documentales.
- `archivados` — un documento en camino a Google Drive: ruta en Storage, id y enlace del archivo
  en Drive, md5 de origen, estado, intentos, `locked_at` y detalle del error. Espeja a `cargas` a
  propósito, para reutilizar su bloqueo y sus barridos.
- `drive_carpetas` — caché de los ids de carpeta de Drive por ruta lógica (`2026/Logistica`).

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

La fila de `cargas` se crea **antes** que la subida, con la ruta de Storage ya reservada. Al revés
quedarían archivos huérfanos el día que Postgres no responda: subidos, pero sin nadie que sepa
que existen. Creando la fila primero, un fallo en cualquier punto deja un estado visible que un
barrido puede cerrar. Ningún fallo es silencioso.

## Flujo completo

Diagrama editable en `arquitectura.drawio`.

| # | Servicio | Qué ocurre |
|---|---|---|
| 1 | Next.js → Postgres | `INSERT` en `cargas`, estado `esperando_archivo`, con la ruta de Storage reservada |
| 2 | Next.js → navegador | Devuelve la signed upload URL para esa ruta |
| 3 | Navegador → Storage | `PUT` del Excel. Sale desde el cliente; Vercel no ve el archivo |
| 4 | Navegador → Next.js | Storage responde `200` al navegador, que llama a `confirmarCarga()` |
| 5 | Next.js → Postgres | `UPDATE cargas → pendiente` **+** `pgmq.send()`, en una sola transacción |
| 6 | Postgres | El trigger `AFTER UPDATE` sobre `cargas` ejecuta `pg_net` |
| 7 | pg_net → Edge Function | `net.http_post()` la despierta. `pg_cron` la despierta también cada minuto |
| 8 | Edge Function → pgmq | `read(vt=300)` reclama un mensaje; queda invisible cinco minutos |
| 9 | Edge Function → Postgres | `UPDATE cargas → procesando`, graba `locked_at` |
| 10 | Edge Function → Storage | `download` del Excel |
| 11 | Edge Function | Parseo con SheetJS y validación de cabeceras |
| 12 | Edge Function → Postgres | `INSERT` por lotes en las tablas de datos, vía RPC |
| 13 | Edge Function → Postgres | `UPDATE cargas → completado` (o `error` con el detalle) |
| 14 | Edge Function → pgmq | `delete(msg_id)` cierra el mensaje |
| 15 | Postgres → Realtime → navegador | El UPDATE del paso 13 entra al WAL y sale por WebSocket |
| 16 | Navegador → Next.js → Postgres | `router.refresh()` y `SELECT` sobre las vistas |

Los pasos 1, 2, 4, 5 y 16 son los únicos en que interviene Next.js, y ninguno toca el archivo: el
Excel viaja del disco del usuario a Storage y de ahí a la Edge Function, sin pasar por Vercel.

## Estados de una carga

```
esperando_archivo ──▶ pendiente ──▶ procesando ──▶ completado
        │                                └──────▶ error
        └──▶ caducada          (barrido: subida abandonada)
```

## Quién despierta al worker

Dos mecanismos, y hacen falta los dos.

**El acelerador.** Un trigger `AFTER UPDATE` sobre `cargas` que dispara `net.http_post()` hacia la
Edge Function en cuanto el estado pasa a `pendiente`. Nadie lo invoca: es una regla que Postgres
aplica solo. `pg_net` encola la petición en su propia tabla y la despacha tras el `COMMIT`, así
que la función nunca despierta antes de que el trabajo sea visible. La clave de autenticación va
en Supabase Vault.

**La red de seguridad.** Un `pg_cron` que invoca la función cada minuto pase lo que pase.

La invocación es un timbre, no una orden: no lleva qué carga procesar. La función despierta, le
pregunta a la cola qué hay pendiente y reclama un mensaje. Por eso da igual cuántas invocaciones
se pierdan o se dupliquen —el trabajo se hace una sola vez, y cualquier despertar drena lo que
haya—, y por eso el trigger vive en la tabla y no en Next.js: cuando `pg_cron` devuelve a
`pendiente` una carga colgada, el aviso se dispara igual, sin que nadie deba acordarse de emitirlo.

## El worker

Edge Function en `supabase/functions/procesar-carga`. Descarga el Excel de Storage, lo parsea con
SheetJS —el runtime es Deno, no hay pandas—, valida cabeceras, inserta por lotes y cierra la
fila.

- **Idempotencia.** Toda fila insertada lleva `carga_id`; reprocesar borra por `carga_id` y
  vuelve a insertar. Un reintento nunca duplica datos.
- **Bloqueo.** Al pasar a `procesando` se graba `locked_at`. Un `pg_cron` devuelve a `pendiente`
  lo que lleve más de cinco minutos bloqueado e incrementa `intentos`. Es el equivalente del
  visibility timeout de una cola externa, y cubre al worker que muere a mitad.
- **Solo se reintenta lo transitorio.** La base saturada se reintenta. Un Excel con la cabecera
  equivocada no: pasa a `error` con la fila y la columna del problema, y eso se muestra en el
  panel. Reintentar tres veces un archivo mal formado no lo arregla y esconde el motivo.
- **Excels grandes.** La Edge Function tiene tope de ejecución y de memoria, y un `.xlsx` es XML
  comprimido que se expande al parsearlo. Por encima del umbral la carga se parte en bloques, un
  mensaje por bloque, con borrado por `(carga_id, bloque)`, y cierra cuando todos terminan.
  `filas_procesadas` alimenta la barra de progreso.
- **Subidas abandonadas.** Si el usuario cierra la pestaña entre el `200` de Storage y
  `confirmarCarga()`, la fila se queda en `esperando_archivo`. Un `pg_cron` revisa esas filas
  contra la ruta reservada en Storage: si el archivo está, la promueve a `pendiente`; si no,
  la marca `caducada`. Es la razón de reservar la ruta en el paso 1 — sin ese registro previo
  no habría dónde mirar.

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

# Archivado en Google Drive

## Qué se copia y qué no

Marcar un documento como archivado deja una copia de su archivo original en un Google Drive de la
Compañía. **Es un espejo, no una mudanza.** El archivo sigue en Storage y el panel lo sigue
sirviendo desde ahí con signed URLs, sujeto a RLS. Drive existe para que la comandancia tenga el
acervo documental en un sitio que pueda auditar sin entrar al panel.

No hay nada que reconstruir ni que generar: el worker descarga de Storage los mismos bytes que
subió el oficial y los sube tal cual con `files.create` de la API de Drive.

## La cuenta de Google decide el diseño

Con una cuenta de Gmail corriente no existen las Unidades compartidas ni la delegación de dominio,
así que la única vía es OAuth: un oficial autoriza la app una vez y el refresh token queda en
Supabase Vault, junto a la clave que ya usa `pg_net`. El worker lo canjea por un access token en
cada ejecución.

Conviene decir lo que eso implica. Los archivos quedan **en el Drive personal de esa cuenta** y
consumen sus 15 GB compartidos con Gmail y Fotos. Si esa persona deja la Compañía, cambia su
contraseña o revoca el acceso, el archivado se detiene. Un acervo documental que depende de la
cuenta personal de un bombero no es un acervo institucional, y esa es la razón de peso para pasar
a Google Workspace: con una Unidad compartida el archivo lo posee la Compañía y no una persona.
Esa migración cambia solo cómo se obtiene el access token —Service Account en lugar de refresh
token—; el resto del flujo es idéntico, y por eso esa pieza se aísla desde el primer día.

Dos decisiones de configuración que no son opcionales:

- **El scope es `drive.file`, no `drive`.** `drive.file` no es un scope sensible y da acceso
  únicamente a los archivos que la propia app creó, que es exactamente lo que hace falta: la app
  crea las carpetas y sube los archivos. `drive` y `drive.readonly` son *restricted* y obligan a
  una evaluación de seguridad por almacenar datos en servidores. Pedir más permiso del necesario
  cuesta aquí una auditoría entera.
- **La pantalla de consentimiento va publicada "En producción".** En estado "Testing" el refresh
  token caduca a los siete días y el archivado se detendría cada semana. El token muere además si
  el usuario revoca el acceso, si pasa seis meses sin usarse o al superar los cien refresh tokens
  por cliente y cuenta. Todos esos casos terminan en el mismo estado y se tratan igual.

## Por qué aquí también hay una cola

El mismo motivo que en la ingesta. Google puede estar caído, lento o limitando por cuota, y
archivar no puede fallar porque un tercero no responda: el hecho de negocio es el `UPDATE` sobre
`documentos`, y la copia es trabajo diferido que necesita reintentos. La fila de `archivados` y el
mensaje de `pgmq` se crean en la misma transacción que el cambio de estado, así que no existe el
documento archivado que nadie llegue a copiar. De paso, el archivo no pasa por Vercel.

## Flujo completo del archivado

| # | Servicio | Qué ocurre |
|---|---|---|
| 1 | Next.js → Postgres | `UPDATE documentos → archivado` con `archivado_en`, `INSERT` en `archivados` estado `pendiente` **+** `pgmq.send()`, en una sola transacción |
| 2 | Postgres | El trigger `AFTER INSERT` sobre `archivados` ejecuta `pg_net`; `pg_cron` despierta al worker igual cada minuto |
| 3 | Edge Function → pgmq | `read(vt=300)` reclama un mensaje |
| 4 | Edge Function → Postgres | `UPDATE archivados → copiando`, graba `locked_at` |
| 5 | Edge Function → Google | Canjea el refresh token del Vault por un access token |
| 6 | Edge Function → Drive | Resuelve o crea la carpeta `{año}/{sección}`, consultando antes `drive_carpetas` |
| 7 | Edge Function → Storage | `download` del archivo original |
| 8 | Edge Function → Drive | `files.create` con el id del documento en `appProperties` |
| 9 | Edge Function | Compara el `md5Checksum` que devuelve Drive con el del objeto en Storage |
| 10 | Edge Function → Postgres | `UPDATE archivados → copiado`, con el id y el enlace del archivo en Drive |
| 11 | Edge Function → pgmq | `delete(msg_id)` cierra el mensaje |

## Estados de un archivado

```
pendiente ──▶ copiando ──▶ copiado
                  ├──────▶ error
                  └──────▶ requiere_reconexion
```

## Idempotencia

`files.create` no es idempotente: un worker que muere después de subir y antes de escribir la fila
dejaría un duplicado en Drive al reintentarse. Por eso cada archivo se sube con el id del documento
en `appProperties`, un campo indexable e invisible para quien mire la carpeta. Antes de subir, el
worker comprueba si la fila ya tiene el id de Drive; si no lo tiene, busca por esa propiedad y
adopta el archivo que encuentre en vez de crear otro. Reintentar nunca duplica.

## Dos carpetas con el mismo nombre

Drive permite dos carpetas hermanas llamadas igual, así que dos archivados simultáneos de la misma
sección y el mismo año crearían dos carpetas y repartirían los documentos entre ellas. La creación
se serializa con `pg_advisory_xact_lock` sobre la ruta lógica, y `drive_carpetas` la guarda en una
columna `UNIQUE`. La caché ahorra además una consulta a Drive por cada documento archivado.

## Solo se reintenta lo transitorio

| Fallo | Tratamiento |
|---|---|
| `429`, `5xx`, corte de red | Reintento con backoff exponencial |
| `401 invalid_grant` | `requiere_reconexion`, **sin gastar intentos**: el panel pide volver a conectar la cuenta |
| `403 storageQuotaExceeded` | `error`. El Drive está lleno, y reintentar no lo vacía |
| El archivo no está en Storage | `error` inmediato, indicando la ruta que se buscó |

Un token revocado no es un fallo transitorio ni un error del documento: es una tarea para una
persona. Gastar reintentos en él solo escondería el motivo, y por eso tiene estado propio.

## Desarchivar

Devolver un documento a la bandeja activa manda su archivo a la papelera de Drive (`files.update`
con `trashed: true`) y deja la fila en `revertido`. Nunca borrado duro: la papelera da treinta días
de margen para deshacer un archivado hecho por error, y el original sigue intacto en Storage de
todas formas.

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

**Fase 5 — Archivado en Drive.** Tabla `archivados`, su cola y la Edge Function de copia, con la
idempotencia por `appProperties`. Va al final porque necesita las dos mitades: sin la Fase 2 no
hay archivo en Storage que copiar, y sin la Fase 4 no existen ni la cola ni el patrón de worker
que reutiliza. Antes de empezarla hay que tener resuelta la cuenta de Google, porque de ella
depende cómo se autentica.

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
- **Archivado:** archivar un documento deja su fila de `archivados` en `copiado`, y el archivo
  aparece en `{año}/{sección}` dentro de Drive.
- **Archivado idempotente:** reprocesar el mismo mensaje no crea un segundo archivo en Drive; el
  worker adopta por `appProperties` el que ya existe.
- **Integridad de la copia:** el `md5Checksum` que devuelve Drive coincide con el del objeto en
  Storage.
- **Drive es espejo:** con Drive inalcanzable, la descarga de un documento archivado sigue
  funcionando desde Storage. Ninguna lectura del panel toca Drive.
- **Token revocado:** revocar el acceso desde la cuenta de Google deja la fila en
  `requiere_reconexion` sin agotar intentos, y el panel lo muestra.
- **Carpetas sin duplicar:** dos archivados concurrentes de la misma sección y el mismo año
  producen una sola carpeta en Drive.
