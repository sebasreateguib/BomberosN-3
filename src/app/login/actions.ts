"use server";

import { redirect } from "next/navigation";
import { verificarCredenciales } from "@/lib/auth";
import { BOMBERO_DEMO } from "@/lib/datos-demo";
import { crearSesion } from "@/lib/sesion";
import type { EstadoAcceso } from "./estado";

export async function solicitarAcceso(
  _previo: EstadoAcceso,
  formData: FormData,
): Promise<EstadoAcceso> {
  const usuario = String(formData.get("usuario") ?? "").trim();
  const clave = String(formData.get("clave") ?? "");

  if (!usuario) {
    return {
      estado: "error",
      campo: "usuario",
      mensaje: "Ingrese su código institucional o correo de la Compañía.",
    };
  }

  if (!clave) {
    return {
      estado: "error",
      campo: "clave",
      mensaje: "Ingrese su contraseña para continuar.",
    };
  }

  const resultado = await verificarCredenciales({ usuario, clave });

  if (!resultado.ok) {
    return { estado: "error", campo: "clave", mensaje: resultado.motivo };
  }

  await crearSesion(resultado.bombero.codigo);

  return {
    estado: "concedido",
    nombre: resultado.bombero.nombre,
    grado: resultado.bombero.grado,
  };
}

/** Atajo de la demostración: entra directo con el perfil de bombero por defecto. */
export async function ingresarComoDemo() {
  await crearSesion(BOMBERO_DEMO.codigo);
  redirect("/panel");
}
