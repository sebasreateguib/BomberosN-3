"use client";

import { useEffect, useState } from "react";
import styles from "./login.module.css";

const formato = new Intl.DateTimeFormat("es-PE", {
  timeZone: "America/Lima",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export function StationClock() {
  const [hora, setHora] = useState<string | null>(null);

  useEffect(() => {
    const actualizar = () => setHora(formato.format(new Date()));
    actualizar();
    const id = window.setInterval(actualizar, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className={styles.clock} suppressHydrationWarning>
      Lima {hora ?? "--:--:--"}
    </span>
  );
}
