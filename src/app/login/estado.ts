export type EstadoAcceso =
  | { estado: "inicial" }
  | { estado: "error"; mensaje: string; campo?: "usuario" | "clave" }
  | { estado: "concedido"; nombre: string; grado: string };

export const estadoInicial: EstadoAcceso = { estado: "inicial" };
