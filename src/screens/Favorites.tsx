import React from 'react'
import { useLibrary } from '../context/LibraryContext'
import { usePlayer } from '../context/PlayerContext'
import { useNav } from '../context/NavContext'
import SongRow from '../components/SongRow'
import { OrnamentLine } from '../components/OrnamentalBorder'

export default function FavoritesScreen() {
  const { favorites, getSongsByIds, library } = useLibrary()
  const { playSong } = usePlayer()
  const { goBack } = useNav()

  const songs = getSongsByIds(favorites)
  const allSongs = library ? Object.values(library.songs) : []

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 pt-safe-top">
        <button onClick={goBack} className="text-[#8B6F47] hover:text-white mb-4 block">‹ Back</button>
        <div className="flex items-center gap-3 mb-2">
          <div className="text-3xl text-[#FF6F00]">♥</div>
          <div>
            <div className="text-xl font-bold font-display text-[#FF6F00]">Favorites</div>
            <div className="text-sm text-[#8B6F47]">{songs.length} songs</div>
          </div>
        </div>
        {songs.length > 0 && (
          <button
            onClick={() => playSong(songs[0], songs)}
            className="mt-2 px-6 py-2 rounded-full text-sm font-semibold text-black"
            style={{ background: 'linear-gradient(90deg, #FF6F00, #D4AF37)' }}
          >
            ▶ Play All
          </button>
        )}
      </div>

      <OrnamentLine />

      <div className="flex-1 overflow-y-auto pb-28 px-2">
        {songs.length === 0
          ? <div className="text-center text-[#8B6F47] text-sm mt-12">No favorites yet.<br />Tap ♡ on any song.</div>
          : songs.map(song => <SongRow key={song.id} song={song} queue={allSongs} showAlbum />)
        }
      </div>
    </div>
  )
}
