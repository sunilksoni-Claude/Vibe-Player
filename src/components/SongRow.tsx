import React from 'react'
import type { Song } from '../types'
import { usePlayer } from '../context/PlayerContext'
import { useLibrary } from '../context/LibraryContext'
import { AlbumArtPlaceholder } from './OrnamentalBorder'

interface Props {
  song: Song
  queue?: Song[]
  index?: number
  showAlbum?: boolean
  onContextMenu?: (song: Song) => void
}

function formatTime(s: number) {
  if (!isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function SongRow({ song, queue, showAlbum = false, onContextMenu }: Props) {
  const { playSong, currentSong, isPlaying } = usePlayer()
  const { isFavorite } = useLibrary()
  const isActive = currentSong?.id === song.id
  const isFav = isFavorite(song.id)

  return (
    <div
      onClick={() => playSong(song, queue)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group
        ${isActive ? 'bg-[#0f2535] border border-[#D4AF3740]' : 'hover:bg-[#0d2236]'}`}
    >
      {/* Album art */}
      <div className="relative flex-shrink-0">
        {song.coverArt
          ? <img src={song.coverArt} alt={song.album} className="w-12 h-12 rounded-lg object-cover" />
          : <AlbumArtPlaceholder size="sm" title={song.album} />
        }
        {isActive && isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
            <div className="eq-bars flex gap-0.5 items-end h-4">
              <span /><span /><span />
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium truncate ${isActive ? 'text-[#FF6F00]' : 'text-white'}`}>
          {song.title}
        </div>
        <div className="text-xs text-[#8B6F47] truncate">
          {song.artist}{showAlbum && song.album !== 'Singles' ? ` • ${song.album}` : ''}
        </div>
      </div>

      {/* Favorite indicator */}
      {isFav && <span className="text-[#FF6F00] text-xs opacity-70">♥</span>}

      {/* Duration */}
      <div className="text-xs text-[#8B6F47]">{formatTime(song.duration)}</div>

      {/* Context menu trigger */}
      {onContextMenu && (
        <button
          onClick={e => { e.stopPropagation(); onContextMenu(song) }}
          className="opacity-0 group-hover:opacity-100 text-[#8B6F47] hover:text-[#D4AF37] text-lg leading-none px-1 transition-opacity"
        >
          ⋮
        </button>
      )}
    </div>
  )
}
