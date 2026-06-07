import React from 'react'
import { usePlayer } from '../context/PlayerContext'
import { useNav } from '../context/NavContext'
import { OrnamentLine } from '../components/OrnamentalBorder'

export default function Settings() {
  const { volume, setVolume, repeatMode, cycleRepeat, shuffle, toggleShuffle } = usePlayer()
  const { goBack } = useNav()

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 pt-safe-top">
        <button onClick={goBack} className="text-[#8B6F47] hover:text-white mb-4 block">‹ Back</button>
        <div className="text-xl font-bold font-display text-[#FF6F00] mb-1">Settings</div>
        <div className="text-xs text-[#8B6F47]">Raaag — Music in the Classical Way</div>
      </div>

      <OrnamentLine />

      <div className="flex-1 overflow-y-auto pb-28 px-4 space-y-6 py-4">
        {/* Playback */}
        <div>
          <div className="text-xs text-[#D4AF37] uppercase tracking-wider font-semibold mb-4">Playback</div>

          <div className="space-y-4">
            {/* Volume */}
            <div className="raaag-card p-4">
              <div className="text-sm font-medium text-white mb-3">Volume</div>
              <div className="flex items-center gap-3">
                <span className="text-[#8B6F47]">🔈</span>
                <input
                  type="range"
                  min={0} max={1} step={0.01}
                  value={volume}
                  onChange={e => setVolume(parseFloat(e.target.value))}
                  className="flex-1"
                />
                <span className="text-[#8B6F47]">🔊</span>
              </div>
            </div>

            {/* Repeat */}
            <div className="raaag-card p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white">Repeat</div>
                <div className="text-xs text-[#8B6F47] capitalize">{repeatMode === 'off' ? 'Off' : repeatMode === 'all' ? 'Repeat All' : 'Repeat One'}</div>
              </div>
              <button
                onClick={cycleRepeat}
                className="px-4 py-1.5 rounded-full text-xs font-medium transition-all"
                style={repeatMode !== 'off'
                  ? { background: 'linear-gradient(90deg, #FF6F00, #D4AF37)', color: 'black' }
                  : { background: '#1a3a50', color: '#8B6F47' }
                }
              >
                {repeatMode === 'off' ? '⟲ Off' : repeatMode === 'all' ? '⟲ All' : '① One'}
              </button>
            </div>

            {/* Shuffle */}
            <div className="raaag-card p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white">Shuffle</div>
                <div className="text-xs text-[#8B6F47]">{shuffle ? 'On' : 'Off'}</div>
              </div>
              <button
                onClick={toggleShuffle}
                className="w-12 h-6 rounded-full relative transition-all duration-300"
                style={{ background: shuffle ? '#FF6F00' : '#1a3a50' }}
              >
                <div
                  className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300"
                  style={{ left: shuffle ? '28px' : '4px' }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* About */}
        <div>
          <div className="text-xs text-[#D4AF37] uppercase tracking-wider font-semibold mb-4">About</div>
          <div className="raaag-card p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-[#8B6F47]">App</span>
              <span className="text-sm text-white font-display">Raaag</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#8B6F47]">Version</span>
              <span className="text-sm text-[#E8D5C4]">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#8B6F47]">Storage</span>
              <span className="text-sm text-[#E8D5C4]">Local device only</span>
            </div>
          </div>
        </div>

        {/* iOS install tip */}
        <div className="raaag-card p-4">
          <div className="text-sm font-medium text-[#D4AF37] mb-2">📱 Add to Home Screen</div>
          <div className="text-xs text-[#8B6F47] leading-relaxed">
            Open this page in Safari → tap the Share icon → "Add to Home Screen" to use Raaag as a standalone app.
          </div>
        </div>
      </div>
    </div>
  )
}
