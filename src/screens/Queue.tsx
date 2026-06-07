import React from 'react'
import { usePlayer } from '../context/PlayerContext'
import { useNav } from '../context/NavContext'
import { AlbumArtPlaceholder } from '../components/OrnamentalBorder'

export default function QueueScreen() {
  const { queue, currentSong, playSong } = usePlayer()
  const { goBack } = useNav()

  const currentIndex = queue.findIndex(s => s.id === currentSong?.id)
  const upcoming = queue.slice(currentIndex + 1)

  return (
    <div className="flex flex-col h-full bottom-sheet">
      <div className="flex items-center justify-between p-4 pt-safe-top border-b border-[rgba(212,175,55,0.2)]">
        <div className="text-base font-semibold text-white">Queue</div>
        <button onClick={goBack} className="text-[#8B6F47] hover:text-white text-2xl leading-none">×</button>
      </div>

      <div className="flex-1 overflow-y-auto pb-28">
        {/* Now Playing */}
        {currentSong && (
          <div className="px-4 py-3">
            <div className="text-xs text-[#D4AF37] uppercase tracking-wider font-semibold mb-3">Now Playing</div>
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,111,0,0.1)', border: '1px solid rgba(255,111,0,0.3)' }}>
              <div className="flex-shrink-0">
                {currentSong.coverArt
                  ? <img src={currentSong.coverArt} className="w-12 h-12 rounded-lg object-cover" alt="" />
                  : <AlbumArtPlaceholder size="sm" title={currentSong.album} />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate" style={{ color: '#FF6F00' }}>{currentSong.title}</div>
                <div className="text-xs text-[#8B6F47] truncate">{currentSong.artist}</div>
              </div>
              <div className="eq-bars flex gap-0.5 items-end h-4">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}

        {/* Up Next */}
        {upcoming.length > 0 && (
          <div className="px-4 py-2">
            <div className="text-xs text-[#D4AF37] uppercase tracking-wider font-semibold mb-3">Up Next</div>
            {upcoming.map((song, i) => (
              <div
                key={`${song.id}-${i}`}
                onClick={() => playSong(song, queue)}
                className="flex items-center gap-3 py-2.5 px-2 rounded-xl cursor-pointer hover:bg-[#0d2236] transition-colors"
              >
                <div className="text-xs text-[#8B6F47] w-5 text-center">{i + 1}</div>
                <div className="flex-shrink-0">
                  {song.coverArt
                    ? <img src={song.coverArt} className="w-10 h-10 rounded-lg object-cover" alt="" />
                    : <AlbumArtPlaceholder size="sm" title={song.album} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{song.title}</div>
                  <div className="text-xs text-[#8B6F47] truncate">{song.artist}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {upcoming.length === 0 && (
          <div className="text-center text-[#8B6F47] text-sm mt-8">Queue is empty</div>
        )}
      </div>
    </div>
  )
}
