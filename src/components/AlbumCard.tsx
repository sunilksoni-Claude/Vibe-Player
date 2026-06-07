import React from 'react'
import type { Album } from '../types'
import { AlbumArtPlaceholder } from './OrnamentalBorder'

interface Props {
  album: Album
  onClick: () => void
}

export default function AlbumCard({ album, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="raaag-card p-3 cursor-pointer flex flex-col gap-2 animate-fade-in"
    >
      <div className="relative w-full aspect-square rounded-lg overflow-hidden">
        {album.coverArt
          ? <img src={album.coverArt} alt={album.name} className="w-full h-full object-cover" />
          : <AlbumArtPlaceholder size="lg" title={album.name} />
        }
        {/* Gold shimmer overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200" />
      </div>
      <div>
        <div className="text-xs font-semibold text-white truncate">{album.name}</div>
        <div className="text-[10px] text-[#8B6F47] truncate">{album.artist}</div>
        {album.year && <div className="text-[10px] text-[#8B6F47]">{album.year}</div>}
      </div>
    </div>
  )
}
