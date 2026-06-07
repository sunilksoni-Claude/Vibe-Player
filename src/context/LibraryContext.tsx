import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { Library, Playlist, Song } from '../types'
import { loadLibraryIndex, saveLibraryIndex, loadStore, saveStore } from '../modules/db'
import { getAllMetadata } from '../modules/db'

interface LibraryContextValue {
  library: Library | null
  playlists: Playlist[]
  favorites: string[]
  recentlyPlayed: string[]
  isLoading: boolean
  setLibrary: (lib: Library) => void
  addToFavorites: (songId: string) => void
  removeFromFavorites: (songId: string) => void
  isFavorite: (songId: string) => boolean
  addToRecentlyPlayed: (songId: string) => void
  createPlaylist: (name: string) => Playlist
  addToPlaylist: (playlistId: string, songId: string) => void
  removeFromPlaylist: (playlistId: string, songId: string) => void
  deletePlaylist: (playlistId: string) => void
  renamePlaylist: (playlistId: string, name: string) => void
  getSong: (id: string) => Song | null
  getSongsByIds: (ids: string[]) => Song[]
  searchSongs: (query: string) => Song[]
}

const LibraryContext = createContext<LibraryContextValue | null>(null)

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [library, setLibraryState] = useState<Library | null>(null)
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [recentlyPlayed, setRecentlyPlayed] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load persisted data on mount
  useEffect(() => {
    const lib = loadLibraryIndex()
    if (lib) setLibraryState(lib)

    // Also hydrate from IndexedDB metadata in case LS was cleared
    if (!lib) {
      getAllMetadata().then(songs => {
        if (songs.length === 0) { setIsLoading(false); return }
        // Rebuild minimal library from metadata
        const rebuilt: Library = { songs: {}, albums: {}, artists: {}, lastSync: Date.now() }
        songs.forEach(s => {
          rebuilt.songs[s.id] = s
          if (!rebuilt.albums[s.albumId]) {
            rebuilt.albums[s.albumId] = { id: s.albumId, name: s.album, artist: s.artist, artistId: s.artistId, songs: [], coverArt: s.coverArt }
          }
          if (!rebuilt.albums[s.albumId].songs.includes(s.id)) rebuilt.albums[s.albumId].songs.push(s.id)
          if (!rebuilt.artists[s.artistId]) {
            rebuilt.artists[s.artistId] = { id: s.artistId, name: s.artist, albums: [], coverArt: s.coverArt }
          }
          if (!rebuilt.artists[s.artistId].albums.includes(s.albumId)) rebuilt.artists[s.artistId].albums.push(s.albumId)
        })
        saveLibraryIndex(rebuilt)
        setLibraryState(rebuilt)
        setIsLoading(false)
      })
    } else {
      setIsLoading(false)
    }

    const store = loadStore()
    setPlaylists(store.playlists)
    setFavorites(store.favorites)
    setRecentlyPlayed(store.recentlyPlayed)
  }, [])

  const persistStore = useCallback((p: Playlist[], f: string[], r: string[]) => {
    saveStore({ playlists: p, favorites: f, recentlyPlayed: r, settings: { volume: 0.8, repeatMode: 'off', shuffle: false } })
  }, [])

  const setLibrary = useCallback((lib: Library) => {
    saveLibraryIndex(lib)
    setLibraryState(lib)
    setIsLoading(false)
  }, [])

  const addToFavorites = useCallback((id: string) => {
    setFavorites(prev => {
      if (prev.includes(id)) return prev
      const next = [id, ...prev]
      persistStore(playlists, next, recentlyPlayed)
      return next
    })
  }, [playlists, recentlyPlayed, persistStore])

  const removeFromFavorites = useCallback((id: string) => {
    setFavorites(prev => {
      const next = prev.filter(x => x !== id)
      persistStore(playlists, next, recentlyPlayed)
      return next
    })
  }, [playlists, recentlyPlayed, persistStore])

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites])

  const addToRecentlyPlayed = useCallback((id: string) => {
    setRecentlyPlayed(prev => {
      const next = [id, ...prev.filter(x => x !== id)].slice(0, 50)
      persistStore(playlists, favorites, next)
      return next
    })
  }, [playlists, favorites, persistStore])

  const createPlaylist = useCallback((name: string): Playlist => {
    const pl: Playlist = { id: `pl-${Date.now()}`, name, songs: [], createdAt: Date.now() }
    setPlaylists(prev => {
      const next = [...prev, pl]
      persistStore(next, favorites, recentlyPlayed)
      return next
    })
    return pl
  }, [favorites, recentlyPlayed, persistStore])

  const addToPlaylist = useCallback((plId: string, songId: string) => {
    setPlaylists(prev => {
      const next = prev.map(p => p.id === plId ? { ...p, songs: [...p.songs, songId] } : p)
      persistStore(next, favorites, recentlyPlayed)
      return next
    })
  }, [favorites, recentlyPlayed, persistStore])

  const removeFromPlaylist = useCallback((plId: string, songId: string) => {
    setPlaylists(prev => {
      const next = prev.map(p => p.id === plId ? { ...p, songs: p.songs.filter(s => s !== songId) } : p)
      persistStore(next, favorites, recentlyPlayed)
      return next
    })
  }, [favorites, recentlyPlayed, persistStore])

  const deletePlaylist = useCallback((plId: string) => {
    setPlaylists(prev => {
      const next = prev.filter(p => p.id !== plId)
      persistStore(next, favorites, recentlyPlayed)
      return next
    })
  }, [favorites, recentlyPlayed, persistStore])

  const renamePlaylist = useCallback((plId: string, name: string) => {
    setPlaylists(prev => {
      const next = prev.map(p => p.id === plId ? { ...p, name } : p)
      persistStore(next, favorites, recentlyPlayed)
      return next
    })
  }, [favorites, recentlyPlayed, persistStore])

  const getSong = useCallback((id: string) => library?.songs[id] ?? null, [library])

  const getSongsByIds = useCallback((ids: string[]) =>
    ids.map(id => library?.songs[id]).filter(Boolean) as Song[],
    [library])

  const searchSongs = useCallback((query: string): Song[] => {
    if (!library || !query.trim()) return []
    const q = query.toLowerCase()
    return Object.values(library.songs).filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q) ||
      s.album.toLowerCase().includes(q)
    )
  }, [library])

  return (
    <LibraryContext.Provider value={{
      library, playlists, favorites, recentlyPlayed, isLoading,
      setLibrary, addToFavorites, removeFromFavorites, isFavorite,
      addToRecentlyPlayed, createPlaylist, addToPlaylist, removeFromPlaylist,
      deletePlaylist, renamePlaylist, getSong, getSongsByIds, searchSongs,
    }}>
      {children}
    </LibraryContext.Provider>
  )
}

export function useLibrary() {
  const ctx = useContext(LibraryContext)
  if (!ctx) throw new Error('useLibrary must be inside LibraryProvider')
  return ctx
}
