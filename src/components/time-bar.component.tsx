// src/components/time-bar.component.tsx
import React from 'react';

type Props = {
  /** 0..1 */
  value: number;
  /** larghezza della barra in px (default 220) */
  widthPx?: number;
  /** altezza della barra in px (default 14) */
  heightPx?: number;
  /** bordi arrotondati */
  rounded?: boolean;
  /** (opz) immagini per replicare stile PNG, altrimenti puro CSS */
  bgSrc?: string;
  fillSrc?: string;
  className?: string;
  'aria-label'?: string;
};

const TimeBar: React.FC<Props> = ({
  value,
  widthPx = 220,
  heightPx = 14,
  rounded = true,
  bgSrc,
  fillSrc,
  className,
  'aria-label': ariaLabel = 'Tempo rimanente',
}) => {
  const pct = Math.max(0, Math.min(1, value));
  const radiusClass = rounded ? 'rounded-full' : '';

  if (bgSrc && fillSrc) {
    // Modalità con PNG come background/crop (se vuoi mantenere le texture)
    return (
      <div
        role='progressbar'
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct * 100)}
        className={className}
        style={{ width: widthPx, height: heightPx, position: 'relative' }}
      >
        <img
          src={bgSrc}
          alt=''
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'fill',
            pointerEvents: 'none',
            WebkitUserDrag: 'none',
          } as React.CSSProperties}
        />
        <div
          className='absolute inset-y-0 left-0 overflow-hidden'
          style={{ width: `${pct * 100}%` }}
        >
          <img
            src={fillSrc}
            alt=''
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'fill',
              pointerEvents: 'none',
              WebkitUserDrag: 'none',
            } as React.CSSProperties}
          />
        </div>
      </div>
    );
  }

  // Modalità pura HTML/CSS (più semplice da modificare)
  return (
    <div
      role='progressbar'
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct * 100)}
      className={`relative ${className ?? ''}`}
      style={{ width: widthPx, height: heightPx }}
    >
      <div
        className={`absolute inset-0 bg-white/20 ${radiusClass}`}
        aria-hidden
      />
      <div
        className={`absolute inset-y-0 left-0 bg-indigo-400 ${radiusClass}`}
        aria-hidden
        style={{ width: `${pct * 100}%` }}
      />
    </div>
  );
};

export default TimeBar;
