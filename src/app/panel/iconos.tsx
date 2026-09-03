type Props = React.SVGProps<SVGSVGElement>;

const base = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconTablero(p: Props) {
  return (
    <svg {...base} {...p} aria-hidden="true">
      <rect x="3.5" y="3.5" width="7" height="8.5" rx="1" />
      <rect x="13.5" y="3.5" width="7" height="5" rx="1" />
      <rect x="3.5" y="15" width="7" height="5.5" rx="1" />
      <rect x="13.5" y="11.5" width="7" height="9" rx="1" />
    </svg>
  );
}

export function IconBandeja(p: Props) {
  return (
    <svg {...base} {...p} aria-hidden="true">
      <path d="M3.5 13.5 6 5h12l2.5 8.5" />
      <path d="M3.5 13.5h4l1 2.5h7l1-2.5h4v5a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5v-5Z" />
    </svg>
  );
}

export function IconGrafico(p: Props) {
  return (
    <svg {...base} {...p} aria-hidden="true">
      <path d="M4 19.5h16" />
      <path d="M6.5 16V10" />
      <path d="M11 16V5.5" />
      <path d="M15.5 16v-4" />
      <path d="M20 16V8" />
    </svg>
  );
}

export function IconEngranaje(p: Props) {
  return (
    <svg {...base} {...p} aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M18 6l-1.4 1.4M7.4 16.6 6 18" />
    </svg>
  );
}

export function IconBuscar(p: Props) {
  return (
    <svg {...base} {...p} aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

export function IconSalir(p: Props) {
  return (
    <svg {...base} {...p} aria-hidden="true">
      <path d="M14 5.5h4.5A1.5 1.5 0 0 1 20 7v10a1.5 1.5 0 0 1-1.5 1.5H14" />
      <path d="M10 15.5 6 12l4-3.5" />
      <path d="M6 12h9" />
    </svg>
  );
}

export function IconFlecha(p: Props) {
  return (
    <svg {...base} {...p} aria-hidden="true">
      <path d="M5 12h13" />
      <path d="m12.5 6 6 6-6 6" />
    </svg>
  );
}

export function IconDescarga(p: Props) {
  return (
    <svg {...base} {...p} aria-hidden="true">
      <path d="M12 4v10" />
      <path d="m8 10.5 4 4 4-4" />
      <path d="M5 19h14" />
    </svg>
  );
}

export function IconUnidad(p: Props) {
  return (
    <svg {...base} {...p} aria-hidden="true">
      <path d="M3 15.5V9.5A1.5 1.5 0 0 1 4.5 8h8.2l2.6 3H19a2 2 0 0 1 2 2v2.5" />
      <path d="M3 15.5h2M9.5 15.5h5M19 15.5h2" />
      <circle cx="7.2" cy="16.5" r="1.8" />
      <circle cx="16.8" cy="16.5" r="1.8" />
    </svg>
  );
}

export function IconPersonal(p: Props) {
  return (
    <svg {...base} {...p} aria-hidden="true">
      <circle cx="9.5" cy="8.5" r="3" />
      <path d="M3.5 19c0-3 2.7-4.8 6-4.8s6 1.8 6 4.8" />
      <path d="M16 5.6a3 3 0 0 1 0 5.8" />
      <path d="M17.5 14.6c1.9.6 3 1.9 3 3.4" />
    </svg>
  );
}

export function IconCarpeta(p: Props) {
  return (
    <svg {...base} {...p} aria-hidden="true">
      <path d="M3.5 6.5A1.5 1.5 0 0 1 5 5h4l1.8 2.2H19a1.5 1.5 0 0 1 1.5 1.5v8.8A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5v-11Z" />
      <path d="M3.5 11h17" />
    </svg>
  );
}

