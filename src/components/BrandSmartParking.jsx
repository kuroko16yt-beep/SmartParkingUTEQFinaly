import React from 'react'

// Ícono "P" en cuadro verde redondeado, reutilizado en las dos variantes del logo.
const IconoP = ({ size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="34" height="34" rx="9" fill="#2eb85c" />
    <text
      x="17"
      y="24"
      textAnchor="middle"
      fontFamily="Arial, Helvetica, sans-serif"
      fontWeight="700"
      fontSize="20"
      fill="#ffffff"
    >
      P
    </text>
  </svg>
)

// Logo completo: ícono + "SMART PARKING" + subtítulo "UTEQ · PARQUEADERO INTELIGENTE".
// Se muestra cuando el sidebar está expandido (clase sidebar-brand-full).
export const LogoSmartParking = () => (
  <div className="sidebar-brand-full d-flex align-items-center gap-2">
    <IconoP />
    <div className="d-flex flex-column lh-1">
      <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--cui-sidebar-brand-color, #fff)' }}>
        SMART<span style={{ color: '#2eb85c' }}>PARKING</span>
      </span>
      <span
        className="text-body-secondary text-uppercase"
        style={{ fontSize: '0.6rem', letterSpacing: '0.04em' }}
      >
        UTEQ · Parqueadero inteligente
      </span>
    </div>
  </div>
)

// Logo reducido (solo el ícono "P"): se muestra cuando el sidebar está
// colapsado/angosto (clase sidebar-brand-narrow).
export const SygnetSmartParking = () => (
  <div className="sidebar-brand-narrow">
    <IconoP size={32} />
  </div>
)
