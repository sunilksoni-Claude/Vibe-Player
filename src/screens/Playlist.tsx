import React, { useState } from 'react'
import { useLibrary } from '../context/LibraryContext'
import { usePlayer } from '../context/PlayerContext'
import { useNav } from '../context/NavContext'
import SongRow from '../components/SongRow'
import { OrnamentLine } from '../components/OrnamentalBorder'

export default function PlaylistScreen() {
  const { playlists, getSongsByIds, deletePlaylist, renamePlaylist } = useLibrary()
  const { playSong } = usePlayer()
  const { params, goBack } = useNav()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')

  const playlist = playlists.find(p => p.id === params.id)
  if (!playlist) return null

  const songs = getSongsByIds(playlist.songs)

  const handleRename = () => {
    if (name.trim()) { renamePlaylist(playlist.id, name.trim()); setEditing(false) }
  }

  const handleDelete = () => {
    if (confirm(`Delete playlist "${playlist.name}"?`)) { deletePlaylist(playlist.id); goBack() }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 pt-safe-top" style={{ background: 'linear-gradient(180deg, #0f2535, transparent)' }}>
        <button onClick={goBack} className="text-[#8B6F47] hover:text-white mb-4 block">‹ Back</button>

        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl flex items-center justify-center text-4xl" style={{ background: 'linear-gradient(135deg, #003d5c, #0f2535)', border: '1px solid rgba(212,175,55,0.4)' }}>
            🎵
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleRename()}
                  className="flex-1 bg-[#0f2535] text-white text-lg font-bold rounded-lg px-3 py-1 outline-none border border-[#D4AF3780]"
                />
                <button onClick={handleRename} className="text-[#FF6F00] text-sm">✓</button>
              </div>
            ) : (
              <div
                className="text-xl font-bold font-display cursor-pointer hover:opacity-80"
                style={{ color: '#FF6F00' }}
                onClick={() => { setName(playlist.name); setEditing(true) }}
              >
                {playlist.name}
              </div>
            )}
            <div className="text-sm text-[#8B6F47]">{songs.length} songs</div>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          {songs.length > 0 && (
            <button
              onClick={() => playSong(songs[0], songs)}
              className="px-6 py-2 rounded-full text-sm font-semibold text-black"
              style={{ background: 'linear-gradient(90deg, #FF6F00, #D4AF37)' }}
            >
              ▶ Play
            </button>
          )}
          <button onClick={handleDelete} className="px-4 py-2 rounded-full text-sm text-red-400 border border-red-400/30 hover:border-red-400 transition-colors">
            Delete
          </button>
        </div>
      </div>

      <OrnamentLine />

      <div className="flex-1 overflow-y-auto pb-28 px-2">
        {songs.length === 0 ? (
          <div className="text-center text-[#8B6F47] text-sm mt-12">No songs yet. Add from the library.</div>
        ) : (
          songs.map(song => <SongRow key={song.id} song={song} queue={songs} showAlbum />)
        )}
      </div>
    </div>
  )
}
