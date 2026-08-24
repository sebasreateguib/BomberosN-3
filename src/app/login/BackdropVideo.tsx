"use client";

import { useEffect, useRef } from "react";
import styles from "./login.module.css";

/**
 * Telón de fondo: el emblema en 3D con brasas.
 * Si el sistema pide movimiento reducido, el video se detiene y queda
 * únicamente el fotograma fijo (poster).
 */
export function BackdropVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const consulta = window.matchMedia("(prefers-reduced-motion: reduce)");
    const aplicar = () => {
      if (consulta.matches) {
        video.pause();
        video.removeAttribute("autoplay");
      } else if (video.paused) {
        void video.play().catch(() => {});
      }
    };

    aplicar();
    consulta.addEventListener("change", aplicar);
    return () => consulta.removeEventListener("change", aplicar);
  }, []);

  return (
    <video
      ref={ref}
      className={styles.video}
      poster="/login-poster.jpg"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
    >
      <source src="/login-video.mp4" type="video/mp4" />
    </video>
  );
}
