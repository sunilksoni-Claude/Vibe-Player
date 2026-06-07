import React from 'react'
import { useLibrary } from '../context/LibraryContext'
import { usePlayer } from '../context/PlayerContext'
import { useNav } from '../context/NavContext'
import SongRow from '../components/SongRow'
import { OrnamentLine } from '../components/OrnamentalBorder'

export default function AlbumScreen() {
  const { library } = useLibrary()
  const { playSong } = usePlayer()
  const { params, goBack, navigate } = useNav()
  const album = library?.albums[params.id]

  if (!album || !library) return null

  const songs = album.songs.map(id => library.songs[id]).filter(Boolean)
  const totalDuration = songs.reduce((acc, s) => acc + (s?.duration ?? 0), 0)
  const totalMins = Math.round(totalDuration / 60)

  return (
    <div className="flex flex-col h-full">
      {/* Header with art */}
      <div className="relative">
        {/* Blurred bg */}
        {album.coverArt && (
          <div className="absolute inset-0 overflow-hidden">
            <img src={album.coverArt} className="w-full h-full object-cover blur-xl scale-110 opacity-25" alt="" />
          </div>
        )}
        <div className="relative z-10 p-4 pt-safe-top flex flex-col items-center">
          <button onClick={goBack} className="self-start text-[#8B6F47] hover:text-white mb-4">‹ Back</button>
          <div className="w-44 h-44 rounded-2xl overflow-hidden shadow-2xl" style={{ border: '2px solid rgba(212,175,55,0.4)' }}>
            {album.coverArt
              ? <img src={album.coverArt} className="w-full h-full object-cover" alt={album.name} />
              : <div className="w-full h-full flex items-center justify-center text-6xl font-display text-[#D4AF37]"
                  style={{ background: 'linear-gradient(135deg, #003d5c, #001a2e)' }}>
                  {album.name.charAt(0)}
                </div>
            }
          </div>
          <div className="text-center mt-4">
            <div className="text-xl font-bold font-display" style={{ color: '#FF6F00' }}>{album.name}</div>
            <button onClick={() => navigate('artist', { id: album.artistId })} className="text-sm text-[#E8D5C4] hover:text-[#FF6F00] transition-colors">
              {album.artist}
            </button>
            <div className="text-xs text-[#8B6F47] mt-1">
              {album.year && `${album.year} · `}{songs.length} songs · {totalMins} min
            </div>
          </div>
          <button
            onClick={() => playSong(songs[0], songs)}
            className="mt-4 px-8 py-2.5 rounded-full text-sm font-semibold text-black btn-ripple"
            style={{ background: 'linear-gradient(90deg, #FF6F00, #D4AF37)' }}
          >
            ▶ Play Album
          </button>
        </div>
      </div>

      <OrnamentLine />

      {/* Song list */}
      <div className="flex-1 overflow-y-auto pb-28 px-2">
        {songs.map(song => (
          <SongRow key={song.id} song={song} queue={songs} />
        ))}
      </div>
    </div>
  )
}
