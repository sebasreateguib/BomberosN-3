import { BOMBERO_DEMO, type Bombero } from "./datos-demo";

/**
 * Verificación de credenciales — punto de integración.
 *
 * TODO(integración): reemplazar por la conexión al directorio de personal
 * de la Compañía (LDAP / base institucional) con contraseñas cifradas.
 * Esta maqueta solo reconoce el perfil de demostración.
 */

export const CREDENCIALES_DEMO = {
  usuario: "b-1866",
  clave: "france1866",
};

export type Credenciales = {
  usuario: string;
  clave: string;
};

export type ResultadoAuth =
  | { ok: true; bombero: Bombero }
  | { ok: false; motivo: string };

export async function verificarCredenciales({
  usuario,
  clave,
}: Credenciales): Promise<ResultadoAuth> {
  // Retardo deliberado: iguala el tiempo de respuesta de éxito y error
  // para no filtrar qué usuarios existen.
  await new Promise((resolve) => setTimeout(resolve, 800));

  const coincide =
    usuario.trim().toLowerCase() === CREDENCIALES_DEMO.usuario &&
    clave === CREDENCIALES_DEMO.clave;

  if (!coincide) {
    return {
      ok: false,
      motivo: "Credenciales incorrectas. Verifique su usuario y contraseña.",
    };
  }

  return { ok: true, bombero: BOMBERO_DEMO };
}
