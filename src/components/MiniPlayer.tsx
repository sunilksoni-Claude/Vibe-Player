import React from 'react'
import { usePlayer } from '../context/PlayerContext'
import { useNav } from '../context/NavContext'
import { AlbumArtPlaceholder } from './OrnamentalBorder'

function formatTime(s: number) {
  if (!isFinite(s) || s === 0) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function MiniPlayer() {
  const { currentSong, isPlaying, currentTime, duration, togglePlay, next } = usePlayer()
  const { navigate } = useNav()

  if (!currentSong) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      className="mini-player fixed bottom-0 left-0 right-0 z-40 safe-area-pb"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Saffron progress bar */}
      <div className="w-full h-0.5 bg-[#1a3a50]">
        <div
          className="h-full transition-all duration-200"
          style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #FF6F00, #D4AF37)' }}
        />
      </div>

      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer"
        onClick={() => navigate('now-playing')}
      >
        {/* Art */}
        <div className="flex-shrink-0">
          {currentSong.coverArt
            ? <img src={currentSong.coverArt} alt={currentSong.album} className="w-12 h-12 rounded-lg object-cover border border-[#D4AF3740]" />
            : <AlbumArtPlaceholder size="sm" title={currentSong.album} />
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white truncate">{currentSong.title}</div>
          <div className="text-xs text-[#8B6F47] truncate">{currentSong.artist}</div>
        </div>

        {/* Time */}
        <div className="text-xs text-[#8B6F47] tabular-nums hidden sm:block">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg btn-ripple transition-all duration-150 hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #FF6F00, #D4AF37)' }}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button
            onClick={next}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#E8D5C4] hover:text-[#FF6F00] transition-colors text-sm"
          >
            ⏭
          </button>
        </div>
      </div>
    </div>
  )
}
