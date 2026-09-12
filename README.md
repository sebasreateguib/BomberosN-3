# Compañía de Bomberos Voluntarios France N° 3 — Frontend

Interfaz del panel institucional de la Compañía: acceso, Bandeja Documental y dashboard
ejecutivo. Este repositorio contiene únicamente el frontend; los datos que muestra son de
demostración (`src/lib/datos-demo.ts`) hasta que se conecte al backend.

## Stack

- Next.js 16 (App Router) + React 19
- TypeScript
- Tailwind CSS 4 + CSS Modules

## Comandos

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

Acceso de demostración: usuario `b-1866`, clave `france1866`.

## Estructura

```
src/
  app/
    layout.tsx                      layout raíz y estilos globales
    page.tsx                        redirige a /login
    login/                          pantalla de acceso (formulario, video de fondo, reloj)
      actions.ts                    Server Action de inicio de sesión
    panel/
      layout.tsx                    shell del panel (sidebar + contenido)
      Sidebar.tsx                   navegación lateral
      actions.ts                    Server Action de cierre de sesión
      bandeja-documental/           listado, gráfico y detalle de documentos
        documentos/[id]/            detalle de un documento
      dashboard/                    tablero ejecutivo
        operaciones/                indicadores operativos
        administracion/             indicadores administrativos
        personal/                   indicadores de personal
  components/
    login-minimal/                  variante alternativa del login (no enrutada)
  lib/
    auth.ts                         verificación de credenciales (demo)
    sesion.ts                       sesión por cookie httpOnly
    datos-demo.ts                   datos ficticios que alimentan todas las vistas
    hora-lima.ts                    hook de hora local (America/Lima)

public/                             logos, video y póster del login
```

## Rutas

| Ruta | Contenido |
|---|---|
| `/login` | Acceso |
| `/panel` | Inicio del panel |
| `/panel/bandeja-documental` | Bandeja Documental |
| `/panel/bandeja-documental/documentos` | Listado de documentos |
| `/panel/bandeja-documental/documentos/[id]` | Detalle de documento |
| `/panel/dashboard` | Dashboard ejecutivo |
| `/panel/dashboard/{operaciones,administracion,personal}` | Secciones del dashboard |

## Puntos de integración

Los datos y la autenticación están aislados en `src/lib/`. Al conectar el backend se
reemplazan `auth.ts`, `sesion.ts` y `datos-demo.ts`; las páginas no cambian su render.
