"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Documento, EstadoDocumento } from "@/lib/datos-demo";
import { EtiquetaEstado, EtiquetaPrioridad } from "../Etiquetas";
import { IconBuscar } from "../../iconos";
import styles from "../../panel.module.css";

const ESTADOS: (EstadoDocumento | "Todos")[] = [
  "Todos",
  "Pendiente",
  "En proceso",
  "Atendido",
  "Archivado",
];

export function TablaDocumentos({ documentos }: { documentos: Documento[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState<EstadoDocumento | "Todos">("Todos");

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return documentos.filter((documento) => {
      const coincideEstado = estado === "Todos" || documento.estado === estado;
      const coincideTexto =
        !texto ||
        [documento.numero, documento.asunto, documento.origen, documento.destino]
          .join(" ")
          .toLowerCase()
          .includes(texto);
      return coincideEstado && coincideTexto;
    });
  }, [documentos, busqueda, estado]);

  return (
    <>
      <div className={styles.filtros}>
        <label className={styles.campoBusqueda}>
          <IconBuscar width={15} height={15} />
          <input
            type="search"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar por número, asunto o área…"
            aria-label="Buscar documentos"
          />
        </label>

        {ESTADOS.map((opcion) => (
          <button
            key={opcion}
            type="button"
            className={`${styles.chip} ${
              estado === opcion ? styles.chipActivo : ""
            }`}
            onClick={() => setEstado(opcion)}
          >
            {opcion}
          </button>
        ))}
      </div>

      <div className={styles.tablaEnvoltura}>
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th>Documento</th>
              <th>Asunto</th>
              <th>Remitente</th>
              <th>Área responsable</th>
              <th>Ingreso · plazo</th>
              <th>Prioridad</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((documento) => (
              <tr key={documento.id}>
                <td>
                  <Link
                    className={styles.celdaNumero}
                    href={`/panel/bandeja-documental/documentos/${documento.id}`}
                  >
                    {documento.numero}
                  </Link>
                </td>
                <td className={styles.celdaAsunto}>{documento.asunto}</td>
                <td>{documento.origen}</td>
                <td>{documento.destino}</td>
                <td>
                  {documento.fechaIngreso}
                  <span className={styles.celdaSecundaria}>
                    vence {documento.plazo}
                  </span>
                </td>
                <td>
                  <EtiquetaPrioridad prioridad={documento.prioridad} />
                </td>
                <td>
                  <EtiquetaEstado estado={documento.estado} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtrados.length === 0 && (
          <p className={styles.vacio}>
            No se encontraron documentos con los filtros aplicados.
          </p>
        )}
      </div>
    </>
  );
}
