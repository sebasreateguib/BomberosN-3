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
| **Supabase** (gestionado) | Postgres, Auth (identidad y roles), Storage (archivos registrados). |

**Acceso a datos.** El panel usa la clave anónima de Supabase con el JWT del usuario, de modo
que RLS aplica en la base. La `service_role` queda reservada a tareas administrativas fuera del
panel.

## Módulos dentro de Next.js

```
src/
  app/panel/bandeja-documental/   registro, listado y detalle de documentos
  app/panel/dashboard/            tablero ejecutivo
  lib/db/                         capa de acceso tipada a Supabase
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

**RLS** — la Jefatura ve todo; cada sección ve los documentos derivados a ella; el personal ve
solo lo propio.

# Orden de implementación

**Fase 1 — Fundaciones.** Proyecto Supabase, migración inicial y semillas. Auth sobre Supabase
reemplazando el acceso de demostración, conservando la firma de `obtenerSesion()` para no tocar
el layout ni las páginas. Capa de acceso tipada en `src/lib/db/`; las páginas cambian el origen
de datos, no su render.

**Fase 2 — Bandeja Documental.** Registro con subida del archivo a Storage, derivación por
sección y trazabilidad de etapas. Búsqueda por número, remitente y asunto expuesta al buscador
de la bandeja.

**Fase 3 — Dashboard.** Las vistas SQL de los agregados y las páginas del tablero contra ellas.

# Verificación

- `supabase db reset` levanta esquema y semillas sin error.
- **RLS:** un usuario de la sección A consultando un documento derivado a la sección B recibe 0
  filas desde la base — no un 403 en la app. Confirma que RLS aplica y que no se está usando la
  `service_role`.
- **Numeración:** dos registros concurrentes del mismo tipo producen números distintos.
- **Trazabilidad:** derivar un documento agrega su etapa con fecha, hora y responsable, y el
  detalle la refleja en orden.
