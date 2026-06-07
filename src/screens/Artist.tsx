import React from 'react'
import { useLibrary } from '../context/LibraryContext'
import { usePlayer } from '../context/PlayerContext'
import { useNav } from '../context/NavContext'
import SongRow from '../components/SongRow'
import AlbumCard from '../components/AlbumCard'
import { OrnamentLine } from '../components/OrnamentalBorder'

export default function ArtistScreen() {
  const { library } = useLibrary()
  const { playSong } = usePlayer()
  const { params, goBack, navigate } = useNav()
  const artist = library?.artists[params.id]

  if (!artist || !library) return null

  const albums = artist.albums.map(id => library.albums[id]).filter(Boolean)
  const allSongs = albums.flatMap(a => a.songs.map(id => library.songs[id]).filter(Boolean))

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="relative p-4 pt-safe-top">
        {/* Blurred cover */}
        {artist.coverArt && (
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img src={artist.coverArt} className="w-full h-full object-cover blur-xl scale-110 opacity-20" alt="" />
          </div>
        )}
        <div className="relative z-10">
          <button onClick={goBack} className="text-[#8B6F47] hover:text-white mb-4 block">‹ Back</button>
          <div className="flex items-end gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0" style={{ border: '2px solid rgba(212,175,55,0.5)' }}>
              {artist.coverArt
                ? <img src={artist.coverArt} className="w-full h-full object-cover" alt={artist.name} />
                : <div className="w-full h-full flex items-center justify-center text-3xl font-display text-[#D4AF37]"
                    style={{ background: 'linear-gradient(135deg, #003d5c, #001a2e)' }}>
                    {artist.name.charAt(0)}
                  </div>
              }
            </div>
            <div>
              <div className="text-2xl font-bold font-display" style={{ color: '#FF6F00' }}>{artist.name}</div>
              <div className="text-sm text-[#8B6F47]">{albums.length} albums · {allSongs.length} songs</div>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => playSong(allSongs[0], allSongs)}
              className="px-6 py-2 rounded-full text-sm font-semibold text-black btn-ripple"
              style={{ background: 'linear-gradient(90deg, #FF6F00, #D4AF37)' }}
            >
              ▶ Play All
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-28">
        {/* Albums */}
        <div className="px-4 py-2">
          <div className="text-xs text-[#D4AF37] uppercase tracking-wider font-semibold mb-3">Albums</div>
          <div className="grid grid-cols-2 gap-3">
            {albums.map(album => (
              <AlbumCard key={album.id} album={album} onClick={() => navigate('album', { id: album.id })} />
            ))}
          </div>
        </div>

        <OrnamentLine />

        {/* Popular songs */}
        <div className="px-2 py-2">
          <div className="px-2 text-xs text-[#D4AF37] uppercase tracking-wider font-semibold mb-2">All Songs</div>
          {allSongs.map(song => (
            <SongRow key={song.id} song={song} queue={allSongs} showAlbum />
          ))}
        </div>
      </div>
    </div>
  )
}
