import React, { useState, useCallback, useRef } from 'react'
import { useLibrary } from '../context/LibraryContext'
import { usePlayer } from '../context/PlayerContext'
import { useNav } from '../context/NavContext'
import { scanMasterFolder, type ScanProgress } from '../modules/FileScanner'
import { clearAllSongs, clearLibraryIndex } from '../modules/db'
import SongRow from '../components/SongRow'
import AlbumCard from '../components/AlbumCard'
import { OrnamentLine, CornerOrnament } from '../components/OrnamentalBorder'
import type { Song } from '../types'

const RAAG_TIMES = [
  {
    id: 'morning',
    label: 'Morning Raags',
    sub: 'Bhairav · Todi · Ahir Bhairav',
    gradient: 'linear-gradient(135deg, #FF6F00 0%, #D4AF37 100%)',
    emoji: '🌅',
  },
  {
    id: 'afternoon',
    label: 'Afternoon Raags',
    sub: 'Khamaj · Sarang · Patdeep',
    gradient: 'linear-gradient(135deg, #003d5c 0%, #0f6688 100%)',
    emoji: '☀️',
  },
  {
    id: 'evening',
    label: 'Evening Raags',
    sub: 'Yaman · Bageshri · Jaijaivanti',
    gradient: 'linear-gradient(135deg, #6B1D1D 0%, #FF6F00 100%)',
    emoji: '🌆',
  },
  {
    id: 'night',
    label: 'Night Raags',
    sub: 'Kafi · Malkauns · Lalit',
    gradient: 'linear-gradient(135deg, #001020 0%, #003d5c 100%)',
    emoji: '🌙',
  },
]

type Tab = 'home' | 'artists' | 'albums' | 'songs'

export default function Library() {
  const { library, playlists, favorites, recentlyPlayed, isLoading, setLibrary, getSongsByIds, createPlaylist } = useLibrary()
  const { playSong } = usePlayer()
  const { navigate } = useNav()
  const [tab, setTab] = useState<Tab>('home')
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState<ScanProgress | null>(null)
  const [search, setSearch] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const songs = library ? Object.values(library.songs) : []
  const albums = library ? Object.values(library.albums) : []
  const artists = library ? Object.values(library.artists) : []

  // Filter by search
  const filteredSongs = search
    ? songs.filter(s =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.artist.toLowerCase().includes(search.toLowerCase()) ||
        s.album.toLowerCase().includes(search.toLowerCase())
      )
    : songs

  const handleSyncFS = useCallback(async () => {
    // Modern File System Access API
    try {
      // @ts-ignore
      const dirHandle = await window.showDirectoryPicker({ mode: 'read' })
      setScanning(true)
      setProgress({ total: 0, done: 0, current: 'Scanning folders…' })
      await clearAllSongs()
      const lib = await scanMasterFolder(dirHandle, p => setProgress(p))
      setLibrary(lib)
      setScanning(false)
      setProgress(null)
    } catch (e: any) {
      if (e?.name !== 'AbortError') alert('Error scanning folder: ' + e?.message)
      setScanning(false)
      setProgress(null)
    }
  }, [setLibrary])

  const handleFolderInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setScanning(true)
    setProgress({ total: files.length, done: 0, current: 'Reading files…' })
    // Build pseudo-library from flat file list
    // Group by webkitRelativePath: artist/album/song
    const { library: lib } = await import('../modules/FallbackScanner')
    const result = await lib(Array.from(files), p => setProgress(p))
    setLibrary(result)
    setScanning(false)
    setProgress(null)
  }, [setLibrary])

  const handleClear = async () => {
    if (!confirm('Clear entire library? This cannot be undone.')) return
    await clearAllSongs()
    clearLibraryIndex()
    window.location.reload()
  }

  if (scanning) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 px-6">
        <div className="text-5xl animate-pulse-gold">🎵</div>
        <div className="text-center">
          <div className="text-lg font-semibold text-[#FF6F00] mb-2">Importing Library</div>
          {progress && (
            <>
              <div className="text-sm text-[#E8D5C4] mb-4">{progress.current}</div>
              {progress.total > 0 && (
                <div className="w-64 h-2 bg-[#1a3a50] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.round((progress.done / progress.total) * 100)}%`, background: 'linear-gradient(90deg, #FF6F00, #D4AF37)' }}
                  />
                </div>
              )}
              {progress.total > 0 && (
                <div className="text-xs text-[#8B6F47] mt-2">{progress.done} / {progress.total} songs</div>
              )}
            </>
          )}
        </div>
        <OrnamentLine />
      </div>
    )
  }

  // Empty state
  if (!library || songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-8 px-8 text-center">
        {/* Logo */}
        <div>
          <div className="font-display text-5xl font-bold text-[#FF6F00] mb-1" style={{ textShadow: '0 0 30px rgba(255,111,0,0.4)' }}>
            Raaag
          </div>
          <div className="text-sm text-[#8B6F47]">Music in the Classical Way</div>
        </div>

        <OrnamentLine />

        <div className="text-[#E8D5C4] text-base max-w-xs">
          Select your music folder to auto-import all your songs organized by Artist → Album.
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          {/* @ts-ignore */}
          {typeof window !== 'undefined' && 'showDirectoryPicker' in window ? (
            <button
              onClick={handleSyncFS}
              className="w-full py-4 rounded-2xl text-white font-semibold text-base btn-ripple transition-all duration-200 hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #FF6F00 0%, #D4AF37 100%)' }}
            >
              📂 Select Music Folder
            </button>
          ) : (
            <>
              <label
                htmlFor="folder-input"
                className="w-full py-4 rounded-2xl text-white font-semibold text-base text-center cursor-pointer btn-ripple transition-all duration-200 hover:scale-[1.02] block"
                style={{ background: 'linear-gradient(135deg, #FF6F00 0%, #D4AF37 100%)' }}
              >
                📂 Select Music Folder
              </label>
              <input
                id="folder-input"
                ref={fileInputRef}
                type="file"
                // @ts-ignore
                webkitdirectory="true"
                multiple
                className="hidden"
                onChange={handleFolderInput}
              />
            </>
          )}
        </div>

        <OrnamentLine />
        <div className="text-xs text-[#8B6F47] max-w-xs">
          Your music is stored locally on this device. Nothing is uploaded anywhere.
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-safe-top pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CornerOrnament size="sm" />
          <span className="font-display text-2xl font-bold text-[#FF6F00]">Raaag</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncFS}
            title="Sync Library"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#D4AF37] hover:bg-[#0f2535] transition-colors text-lg"
          >
            ↻
          </button>
          <button
            onClick={() => navigate('settings')}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#8B6F47] hover:text-[#D4AF37] hover:bg-[#0f2535] transition-colors"
          >
            ⚙
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B6F47] text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search songs, artists, albums…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-[#8B6F47] outline-none"
            style={{ background: '#0f2535', border: '1px solid rgba(212,175,55,0.2)' }}
          />
        </div>
      </div>

      {/* Tabs */}
      {!search && (
        <div className="flex gap-1 px-4 pb-3">
          {(['home', 'artists', 'albums', 'songs'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all duration-150 ${
                tab === t
                  ? 'text-black'
                  : 'text-[#8B6F47] hover:text-[#E8D5C4]'
              }`}
              style={tab === t ? { background: 'linear-gradient(90deg, #FF6F00, #D4AF37)' } : {}}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-2 pb-28">
        {/* Search results */}
        {search && (
          <div>
            <div className="px-2 py-2 text-xs text-[#8B6F47]">{filteredSongs.length} results</div>
            {filteredSongs.map(song => (
              <SongRow key={song.id} song={song} queue={filteredSongs} showAlbum />
            ))}
          </div>
        )}

        {/* Home tab */}
        {!search && tab === 'home' && (
          <div className="space-y-5">
            {/* Raag time cards */}
            <div>
              <OrnamentLine />
              <div className="grid grid-cols-2 gap-3 mt-3 px-2">
                {RAAG_TIMES.map(rt => (
                  <div
                    key={rt.id}
                    className="raag-time-card"
                    style={{ background: rt.gradient }}
                    onClick={() => navigate('library')}
                  >
                    <div className="text-2xl mb-1">{rt.emoji}</div>
                    <div className="text-sm font-semibold text-white">{rt.label}</div>
                    <div className="text-[10px] text-white/70 mt-0.5">{rt.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recently Played */}
            {recentlyPlayed.length > 0 && (
              <div>
                <div className="px-2 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-2">Recently Played</div>
                {getSongsByIds(recentlyPlayed.slice(0, 5)).map(song => (
                  <SongRow key={song.id} song={song} queue={songs} showAlbum />
                ))}
              </div>
            )}

            {/* Favorites */}
            {favorites.length > 0 && (
              <div>
                <div className="flex items-center justify-between px-2 mb-2">
                  <div className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">Favorites</div>
                  <button onClick={() => navigate('favorites')} className="text-xs text-[#8B6F47] hover:text-[#FF6F00]">See all</button>
                </div>
                {getSongsByIds(favorites.slice(0, 5)).map(song => (
                  <SongRow key={song.id} song={song} queue={songs} showAlbum />
                ))}
              </div>
            )}

            {/* Playlists */}
            {playlists.length > 0 && (
              <div>
                <div className="px-2 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-2">Playlists</div>
                {playlists.map(pl => (
                  <div
                    key={pl.id}
                    onClick={() => navigate('playlist', { id: pl.id })}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#0d2236] cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl" style={{ background: 'linear-gradient(135deg, #003d5c, #0f2535)', border: '1px solid rgba(212,175,55,0.3)' }}>
                      🎵
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{pl.name}</div>
                      <div className="text-xs text-[#8B6F47]">{pl.songs.length} songs</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* New Playlist button */}
            <div className="px-2">
              <button
                onClick={() => {
                  const name = prompt('Playlist name:')
                  if (name?.trim()) createPlaylist(name.trim())
                }}
                className="w-full py-3 rounded-xl text-sm text-[#D4AF37] border border-[#D4AF3740] hover:border-[#D4AF37] transition-colors"
              >
                + New Playlist
              </button>
            </div>

            {/* Clear Library */}
            <div className="px-2 pb-4">
              <button onClick={handleClear} className="text-xs text-[#8B6F47] hover:text-red-400 transition-colors">
                Clear Library
              </button>
            </div>
          </div>
        )}

        {/* Artists tab */}
        {!search && tab === 'artists' && (
          <div>
            {artists.sort((a, b) => a.name.localeCompare(b.name)).map(artist => (
              <div
                key={artist.id}
                onClick={() => navigate('artist', { id: artist.id })}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#0d2236] cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0" style={{ border: '1px solid rgba(212,175,55,0.3)' }}>
                  {artist.coverArt
                    ? <img src={artist.coverArt} alt={artist.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xl font-display text-[#D4AF37]" style={{ background: 'linear-gradient(135deg, #003d5c, #0f2535)' }}>
                        {artist.name.charAt(0)}
                      </div>
                  }
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{artist.name}</div>
                  <div className="text-xs text-[#8B6F47]">{artist.albums.length} albums</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Albums tab */}
        {!search && tab === 'albums' && (
          <div className="grid grid-cols-2 gap-3 p-2">
            {albums.sort((a, b) => a.name.localeCompare(b.name)).map(album => (
              <AlbumCard key={album.id} album={album} onClick={() => navigate('album', { id: album.id })} />
            ))}
          </div>
        )}

        {/* Songs tab */}
        {!search && tab === 'songs' && (
          <div>
            <div className="px-2 py-2 text-xs text-[#8B6F47]">{songs.length} songs</div>
            {songs.sort((a, b) => a.title.localeCompare(b.title)).map(song => (
              <SongRow key={song.id} song={song} queue={songs} showAlbum />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
