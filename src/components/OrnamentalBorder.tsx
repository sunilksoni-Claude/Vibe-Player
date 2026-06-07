import React from 'react'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

// Decorative horizontal ornament line with mandala-inspired center
export function OrnamentLine({ color = '#D4AF37' }: { color?: string }) {
  return (
    <div className="flex items-center gap-2 w-full my-1">
      <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color})` }} />
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="3" stroke={color} strokeWidth="1.5" />
        <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="0.5" />
        <line x1="8" y1="0" x2="8" y2="4" stroke={color} strokeWidth="0.8" />
        <line x1="8" y1="12" x2="8" y2="16" stroke={color} strokeWidth="0.8" />
        <line x1="0" y1="8" x2="4" y2="8" stroke={color} strokeWidth="0.8" />
        <line x1="12" y1="8" x2="16" y2="8" stroke={color} strokeWidth="0.8" />
      </svg>
      <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
    </div>
  )
}

// Corner ornament — temple arch flourish
export function CornerOrnament({ size = 'md' }: Props) {
  const px = size === 'sm' ? 28 : size === 'lg' ? 56 : 40
  return (
    <svg width={px} height={px} viewBox="0 0 40 40" fill="none" style={{ opacity: 0.35 }}>
      <path d="M2 2 Q2 20 20 20 Q2 20 2 38" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
      <circle cx="2" cy="2" r="2" fill="#D4AF37" />
      <circle cx="20" cy="20" r="1.5" fill="#FF6F00" />
      <path d="M8 2 Q8 14 20 14" stroke="#D4AF37" strokeWidth="0.8" fill="none" opacity="0.6" />
    </svg>
  )
}

// Album art placeholder with ornamental frame
export function AlbumArtPlaceholder({ size = 'md', title = '' }: { size?: 'sm' | 'md' | 'lg'; title?: string }) {
  const dim = size === 'sm' ? 48 : size === 'lg' ? 240 : 64
  const letter = title.charAt(0).toUpperCase() || '♪'
  return (
    <div
      style={{
        width: dim, height: dim, flexShrink: 0,
        background: 'linear-gradient(135deg, #003d5c 0%, #0f2535 100%)',
        border: '1px solid rgba(212,175,55,0.4)',
        borderRadius: size === 'lg' ? 16 : 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: dim * 0.38,
        color: '#D4AF37',
        fontFamily: '"Playfair Display", serif',
        fontWeight: 700,
      }}
    >
      {letter}
    </div>
  )
}
