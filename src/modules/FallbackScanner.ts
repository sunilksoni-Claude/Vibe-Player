// Fallback scanner for iOS Safari — uses webkitdirectory file input
// Files have webkitRelativePath: "Artist/Album/Song.mp3"
import type { Library, Song, Album, Artist } from '../types'
import { saveSongBlob, saveLibraryIndex, setLastSync } from './db'

const AUDIO_EXTS = new Set(['.mp3', '.m4a', '.aac', '.flac', '.ogg', '.opus', '.wav'])

function isAudio(name: string) {
  const ext = name.slice(name.lastIndexOf('.')).toLowerCase()
  return AUDIO_EXTS.has(ext)
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function parseFilename(name: string): { title: string; track: number } {
  const m = name.replace(/\.[^.]+$/, '').match(/^(\d+)[.\s\-]+(.+)$/)
  if (m) return { track: parseInt(m[1]), title: m[2].trim() }
  return { track: 0, title: name.replace(/\.[^.]+$/, '') }
}

export type ScanProgress = { total: number; done: number; current: string }

export async function library(
  files: File[],
  onProgress?: (p: ScanProgress) => void
): Promise<Library> {
  const lib: Library = { songs: {}, albums: {}, artists: {}, lastSync: Date.now() }

  const audioFiles = files.filter(f => isAudio(f.name))
  const total = audioFiles.length

  for (let i = 0; i < audioFiles.length; i++) {
    const file = audioFiles[i]
    const parts = (file.webkitRelativePath || file.name).split('/')

    // parts: [root, artist?, album?, song] or [root, song]
    let artistName = 'Unknown Artist'
    let albumName = 'Unknown Album'
    const songFile = parts[parts.length - 1]

    if (parts.length >= 4) {
      artistName = parts[1]
      albumName = parts[2]
    } else if (parts.length === 3) {
      artistName = parts[1]
      albumName = 'Singles'
    } else if (parts.length === 2) {
      artistName = 'Unknown Artist'
      albumName = 'Singles'
    }

    const artistId = slug(artistName) || 'unknown-artist'
    const albumId = `${artistId}-${slug(albumName) || 'singles'}`
    const { title, track } = parseFilename(songFile)
    const songId = `${albumId}-${slug(songFile)}`

    const song: Song = {
      id: songId,
      title,
      artist: artistName,
      album: albumName,
      albumId,
      artistId,
      duration: 0,
      track,
      filePath: file.webkitRelativePath || file.name,
    }

    await saveSongBlob(songId, file, song)
    lib.songs[songId] = song

    if (!lib.albums[albumId]) {
      lib.albums[albumId] = { id: albumId, name: albumName, artist: artistName, artistId, songs: [] }
    }
    if (!lib.albums[albumId].songs.includes(songId)) lib.albums[albumId].songs.push(songId)

    if (!lib.artists[artistId]) {
      lib.artists[artistId] = { id: artistId, name: artistName, albums: [] }
    }
    if (!lib.artists[artistId].albums.includes(albumId)) lib.artists[artistId].albums.push(albumId)

    onProgress?.({ total, done: i + 1, current: title })
  }

  await setLastSync(Date.now())
  saveLibraryIndex(lib)
  return lib
}
