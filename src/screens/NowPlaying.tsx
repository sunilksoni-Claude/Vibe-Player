import React, { useState, useEffect } from 'react'
import { usePlayer } from '../context/PlayerContext'
import { useLibrary } from '../context/LibraryContext'
import { useNav } from '../context/NavContext'
import { OrnamentLine } from '../components/OrnamentalBorder'

function formatTime(s: number) {
  if (!isFinite(s) || s === 0) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function NowPlaying() {
  const {
    currentSong, isPlaying, currentTime, duration,
    repeatMode, shuffle, volume,
    togglePlay, next, prev, seek, setVolume, cycleRepeat, toggleShuffle, queue
  } = usePlayer()
  const { addToFavorites, removeFromFavorites, isFavorite, addToRecentlyPlayed } = useLibrary()
  const { goBack, navigate } = useNav()
  const [dragging, setDragging] = useState(false)
  const [dragTime, setDragTime] = useState(0)

  useEffect(() => {
    if (currentSong) addToRecentlyPlayed(currentSong.id)
  }, [currentSong?.id])

  if (!currentSong) return null

  const progress = duration > 0 ? (dragging ? dragTime / duration : currentTime / duration) : 0
  const isFav = isFavorite(currentSong.id)

  const repeatIcon = repeatMode === 'off' ? '⟲' : repeatMode === 'all' ? '⟲' : '①'
  const repeatActive = repeatMode !== 'off'

  return (
    <div className="now-playing-bg flex flex-col h-full overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-safe-top pt-4 pb-2">
        <button onClick={goBack} className="w-9 h-9 flex items-center justify-center text-[#8B6F47] hover:text-white transition-colors rounded-full hover:bg-[#0f2535]">
          ‹
        </button>
        <div className="text-xs text-[#8B6F47] uppercase tracking-wider font-medium">Now Playing</div>
        <button onClick={() => navigate('queue')} className="w-9 h-9 flex items-center justify-center text-[#8B6F47] hover:text-[#D4AF37] transition-colors rounded-full hover:bg-[#0f2535]">
          ≡
        </button>
      </div>

      <OrnamentLine />

      {/* Album Art */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 min-h-0">
        <div className="relative w-full max-w-xs aspect-square">
          {/* Blur background glow */}
          {currentSong.coverArt && (
            <div
              className="absolute inset-0 rounded-2xl blur-2xl scale-95 opacity-50"
              style={{ backgroundImage: `url(${currentSong.coverArt})`, backgroundSize: 'cover' }}
            />
          )}
          <div
            className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl"
            style={{ border: '2px solid rgba(212,175,55,0.4)' }}
          >
            {currentSong.coverArt
              ? <img src={currentSong.coverArt} alt={currentSong.album} className="w-full h-full object-cover" />
              : (
                <div className="w-full h-full flex items-center justify-center text-8xl font-display text-[#D4AF37]"
                  style={{ background: 'linear-gradient(135deg, #003d5c, #001a2e)' }}>
                  {currentSong.title.charAt(0)}
                </div>
              )
            }
          </div>
          {/* Double-tap favorite */}
          <div
            className="absolute inset-0 rounded-2xl"
            onDoubleClick={() => isFav ? removeFromFavorites(currentSong.id) : addToFavorites(currentSong.id)}
          />
        </div>
      </div>

      {/* Song info */}
      <div className="px-6 text-center">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0 text-left">
            <div className="text-xl font-bold text-white truncate" style={{ color: '#FF6F00' }}>{currentSong.title}</div>
            <div className="text-sm text-[#E8D5C4] truncate">{currentSong.artist}</div>
            <div className="text-xs text-[#8B6F47] truncate">{currentSong.album}</div>
          </div>
          <button
            onClick={() => isFav ? removeFromFavorites(currentSong.id) : addToFavorites(currentSong.id)}
            className="ml-4 text-2xl transition-all duration-200 hover:scale-125"
            style={{ color: isFav ? '#FF6F00' : '#8B6F47' }}
          >
            {isFav ? '♥' : '♡'}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-6 mt-5">
        <div className="relative">
          <div className="w-full h-1 rounded-full bg-[#1a3a50] overflow-hidden mb-1">
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{ width: `${progress * 100}%`, background: 'linear-gradient(90deg, #FF6F00, #D4AF37)' }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.5}
            value={dragging ? dragTime : currentTime}
            onChange={e => { setDragging(true); setDragTime(parseFloat(e.target.value)) }}
            onMouseUp={e => { seek(parseFloat((e.target as HTMLInputElement).value)); setDragging(false) }}
            onTouchEnd={e => { seek(parseFloat((e.target as HTMLInputElement).value)); setDragging(false) }}
            className="absolute inset-0 opacity-0 w-full cursor-pointer"
          />
        </div>
        <div className="flex justify-between text-xs text-[#8B6F47] tabular-nums mt-1">
          <span>{formatTime(dragging ? dragTime : currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className="w-10 h-10 flex items-center justify-center text-lg transition-all"
            style={{ color: shuffle ? '#FF6F00' : '#8B6F47' }}
          >
            ⇄
          </button>

          {/* Prev */}
          <button
            onClick={prev}
            className="w-12 h-12 flex items-center justify-center text-2xl text-[#E8D5C4] hover:text-white transition-all hover:scale-110"
          >
            ⏮
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl text-black shadow-lg btn-ripple transition-all duration-150 hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #FF6F00 0%, #D4AF37 100%)', boxShadow: '0 0 20px rgba(255,111,0,0.5)' }}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          {/* Next */}
          <button
            onClick={next}
            className="w-12 h-12 flex items-center justify-center text-2xl text-[#E8D5C4] hover:text-white transition-all hover:scale-110"
          >
            ⏭
          </button>

          {/* Repeat */}
          <button
            onClick={cycleRepeat}
            className="w-10 h-10 flex items-center justify-center text-lg transition-all"
            style={{ color: repeatActive ? '#FF6F00' : '#8B6F47' }}
          >
            {repeatIcon}
          </button>
        </div>
      </div>

      {/* Volume */}
      <div className="px-6 pb-safe pb-6 flex items-center gap-3">
        <span className="text-[#8B6F47] text-sm">🔈</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={e => setVolume(parseFloat(e.target.value))}
          className="flex-1"
          style={{ accentColor: '#FF6F00' }}
        />
        <span className="text-[#8B6F47] text-sm">🔊</span>
      </div>

      <OrnamentLine />
    </div>
  )
}
