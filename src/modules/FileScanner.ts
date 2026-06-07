import type { Library, Song, Album, Artist } from '../types'
import { saveSongBlob, saveLibraryIndex, setLastSync } from './db'

// ── ID helpers ────────────────────────────────────────────────────────────────

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

// ── Metadata extraction via jsmediatags ──────────────────────────────────────

function parseFilename(name: string): { title: string; track: number } {
  // "01 - Song Name.mp3" or "01. Song Name" or "Song Name"
  const m = name.replace(/\.[^.]+$/, '').match(/^(\d+)[.\s\-]+(.+)$/)
  if (m) return { track: parseInt(m[1]), title: m[2].trim() }
  return { track: 0, title: name.replace(/\.[^.]+$/, '') }
}

async function extractMetadata(file: File, artistName: string, albumName: string): Promise<Partial<Song>> {
  return new Promise((resolve) => {
    try {
      // Dynamically import jsmediatags (UMD/CommonJS)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const jsmediatags = (window as any).jsmediatags
      if (!jsmediatags) {
        const { track, title } = parseFilename(file.name)
        resolve({ title, artist: artistName, album: albumName, track })
        return
      }

      jsmediatags.read(file, {
        onSuccess(tag: any) {
          const t = tag.tags
          let coverArt: string | undefined
          if (t.picture) {
            const { data, format } = t.picture
            const bytes = new Uint8Array(data)
            const blob = new Blob([bytes], { type: format })
            coverArt = URL.createObjectURL(blob)
          }
          const { track: fallbackTrack, title: fallbackTitle } = parseFilename(file.name)
          resolve({
            title: t.title || fallbackTitle,
            artist: t.artist || artistName,
            album: t.album || albumName,
            year: t.year ? parseInt(t.year) : undefined,
            genre: t.genre,
            track: t.track ? parseInt(t.track) : fallbackTrack,
            coverArt,
          })
        },
        onError() {
          const { track, title } = parseFilename(file.name)
          resolve({ title, artist: artistName, album: albumName, track })
        },
      })
    } catch {
      const { track, title } = parseFilename(file.name)
      resolve({ title, artist: artistName, album: albumName, track })
    }
  })
}

// ── Cover art fallback: look for cover.jpg in same folder ───────────────────

async function findCoverInFolder(dirHandle: FileSystemDirectoryHandle): Promise<string | undefined> {
  const names = ['cover.jpg', 'cover.jpeg', 'cover.png', 'folder.jpg', 'artwork.jpg']
  for (const name of names) {
    try {
      const fh = await dirHandle.getFileHandle(name)
      const file = await fh.getFile()
      return URL.createObjectURL(file)
    } catch {
      // not found
    }
  }
  return undefined
}

// ── Audio MIME types ─────────────────────────────────────────────────────────

const AUDIO_EXTS = new Set(['.mp3', '.m4a', '.aac', '.flac', '.ogg', '.opus', '.wav'])

function isAudio(name: string) {
  const ext = name.slice(name.lastIndexOf('.')).toLowerCase()
  return AUDIO_EXTS.has(ext)
}

// ── Progress callback ─────────────────────────────────────────────────────────

export type ScanProgress = {
  total: number
  done: number
  current: string
}

// ── Main scanner ─────────────────────────────────────────────────────────────

export async function scanMasterFolder(
  rootHandle: FileSystemDirectoryHandle,
  onProgress?: (p: ScanProgress) => void
): Promise<Library> {
  const library: Library = {
    songs: {},
    albums: {},
    artists: {},
    lastSync: Date.now(),
  }

  // Collect all audio files first for progress tracking
  const tasks: Array<() => Promise<void>> = []

  // Traverse: root -> Artist -> Album -> Songs
  for await (const [artistName, artistEntry] of rootHandle.entries()) {
    if (artistEntry.kind !== 'directory') continue

    const artistDir = artistEntry as FileSystemDirectoryHandle
    const artistId = slug(artistName)

    const artist: Artist = {
      id: artistId,
      name: artistName,
      albums: [],
    }

    // Look for sub-directories (Albums) and loose audio files (Singles)
    const looseFiles: File[] = []

    for await (const [subName, subEntry] of artistDir.entries()) {
      if (subEntry.kind === 'directory') {
        // Album directory
        const albumDir = subEntry as FileSystemDirectoryHandle
        const albumId = `${artistId}-${slug(subName)}`
        const albumCover = await findCoverInFolder(albumDir)

        const album: Album = {
          id: albumId,
          name: subName,
          artist: artistName,
          artistId,
          coverArt: albumCover,
          songs: [],
        }

        for await (const [fileName, fileEntry] of albumDir.entries()) {
          if (fileEntry.kind !== 'file' || !isAudio(fileName)) continue
          const fileHandle = fileEntry as FileSystemFileHandle
          tasks.push(async () => {
            const file = await fileHandle.getFile()
            const meta = await extractMetadata(file, artistName, subName)
            const songId = `${albumId}-${slug(fileName)}`
            const song: Song = {
              id: songId,
              title: meta.title ?? fileName,
              artist: meta.artist ?? artistName,
              album: meta.album ?? subName,
              albumId,
              artistId,
              duration: meta.duration ?? 0,
              track: meta.track ?? 0,
              year: meta.year,
              genre: meta.genre,
              coverArt: meta.coverArt ?? albumCover ?? artist.coverArt,
              filePath: `${artistName}/${subName}/${fileName}`,
            }
            await saveSongBlob(songId, file, song)
            library.songs[songId] = song
            album.songs.push(songId)
            if (!album.year && song.year) album.year = song.year
            if (!album.coverArt && song.coverArt) album.coverArt = song.coverArt
          })
        }

        if (album.songs.length > 0 || tasks.length > 0) {
          library.albums[albumId] = album
          artist.albums.push(albumId)
        }
      } else if (subEntry.kind === 'file') {
        const fh = subEntry as FileSystemFileHandle
        const file = await fh.getFile()
        if (isAudio(file.name)) looseFiles.push(file)
      }
    }

    // Loose files → "Singles" album
    if (looseFiles.length > 0) {
      const albumId = `${artistId}-singles`
      const album: Album = {
        id: albumId,
        name: 'Singles',
        artist: artistName,
        artistId,
        songs: [],
      }
      for (const file of looseFiles) {
        tasks.push(async () => {
          const meta = await extractMetadata(file, artistName, 'Singles')
          const songId = `${albumId}-${slug(file.name)}`
          const song: Song = {
            id: songId,
            title: meta.title ?? file.name,
            artist: meta.artist ?? artistName,
            album: 'Singles',
            albumId,
            artistId,
            duration: meta.duration ?? 0,
            track: meta.track ?? 0,
            year: meta.year,
            genre: meta.genre,
            coverArt: meta.coverArt,
            filePath: `${artistName}/${file.name}`,
          }
          await saveSongBlob(songId, file, song)
          library.songs[songId] = song
          album.songs.push(songId)
        })
      }
      library.albums[albumId] = album
      artist.albums.push(albumId)
    }

    if (artist.albums.length > 0) {
      library.artists[artistId] = artist
    }
  }

  // Run all song-processing tasks with progress
  const total = tasks.length
  let done = 0
  for (const task of tasks) {
    await task()
    done++
    onProgress?.({ total, done, current: `Song ${done} of ${total}` })
  }

  // Sort album songs by track
  for (const album of Object.values(library.albums)) {
    album.songs.sort((a, b) => (library.songs[a]?.track ?? 0) - (library.songs[b]?.track ?? 0))
    // propagate cover art from first song
    if (!album.coverArt) {
      const firstSongWithArt = album.songs.find(id => library.songs[id]?.coverArt)
      if (firstSongWithArt) album.coverArt = library.songs[firstSongWithArt].coverArt
    }
    // propagate to artist
    const art = library.artists[album.artistId]
    if (art && !art.coverArt && album.coverArt) art.coverArt = album.coverArt
  }

  await setLastSync(Date.now())
  saveLibraryIndex(library)
  return library
}

// ── Duration loader (use Audio element for accuracy) ─────────────────────────

export async function loadDuration(url: string): Promise<number> {
  return new Promise(resolve => {
    const audio = new Audio()
    audio.preload = 'metadata'
    audio.src = url
    audio.onloadedmetadata = () => resolve(audio.duration)
    audio.onerror = () => resolve(0)
  })
}
