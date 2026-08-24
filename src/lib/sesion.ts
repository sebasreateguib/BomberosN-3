import { cookies } from "next/headers";
import { BOMBERO_DEMO, type Bombero } from "./datos-demo";

const NOMBRE_COOKIE = "f3_sesion";
const DURACION = 60 * 60 * 8; // 8 horas de guardia

export async function crearSesion(codigo: string) {
  const almacen = await cookies();
  almacen.set(NOMBRE_COOKIE, codigo, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: DURACION,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function cerrarSesion() {
  const almacen = await cookies();
  almacen.delete(NOMBRE_COOKIE);
}

/**
 * Recupera al bombero de la sesión. En esta maqueta solo existe el perfil
 * de demostración; con el directorio real, aquí se consulta al personal.
 */
export async function obtenerSesion(): Promise<Bombero | null> {
  const almacen = await cookies();
  const codigo = almacen.get(NOMBRE_COOKIE)?.value;
  if (!codigo) return null;
  return codigo === BOMBERO_DEMO.codigo ? BOMBERO_DEMO : null;
}
