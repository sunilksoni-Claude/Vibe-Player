import { openDB } from 'idb'
import type { DBSchema, IDBPDatabase } from 'idb'
import type { Library, Playlist, Song } from '../types'

interface RaaagDB extends DBSchema {
  songs: {
    key: string
    value: { id: string; blob: Blob; metadata: Song }
  }
  metadata: {
    key: string
    value: { id: string; data: Song }
  }
  syncLog: {
    key: 'lastSync'
    value: number
  }
}

let db: IDBPDatabase<RaaagDB> | null = null

async function getDB() {
  if (!db) {
    db = await openDB<RaaagDB>('raaag-db', 1, {
      upgrade(database) {
        database.createObjectStore('songs', { keyPath: 'id' })
        database.createObjectStore('metadata', { keyPath: 'id' })
        database.createObjectStore('syncLog')
      },
    })
  }
  return db
}

// ── Songs ────────────────────────────────────────────────────────────────────

export async function saveSongBlob(id: string, blob: Blob, metadata: Song) {
  const database = await getDB()
  await database.put('songs', { id, blob, metadata })
  await database.put('metadata', { id, data: metadata })
}

export async function getSongBlobUrl(id: string): Promise<string | null> {
  const database = await getDB()
  const record = await database.get('songs', id)
  if (!record) return null
  return URL.createObjectURL(record.blob)
}

export async function getAllMetadata(): Promise<Song[]> {
  const database = await getDB()
  const all = await database.getAll('metadata')
  return all.map(r => r.data)
}

export async function clearAllSongs() {
  const database = await getDB()
  await database.clear('songs')
  await database.clear('metadata')
}

export async function getLastSync(): Promise<number> {
  const database = await getDB()
  return (await database.get('syncLog', 'lastSync')) ?? 0
}

export async function setLastSync(ts: number) {
  const database = await getDB()
  await database.put('syncLog', ts, 'lastSync')
}

// ── LocalStorage helpers ──────────────────────────────────────────────────────

const LS_KEY = 'raaag-store'

interface LSStore {
  playlists: Playlist[]
  favorites: string[]
  recentlyPlayed: string[]
  settings: {
    volume: number
    repeatMode: 'off' | 'all' | 'one'
    shuffle: boolean
  }
}

function defaultStore(): LSStore {
  return {
    playlists: [],
    favorites: [],
    recentlyPlayed: [],
    settings: { volume: 0.8, repeatMode: 'off', shuffle: false },
  }
}

export function loadStore(): LSStore {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? { ...defaultStore(), ...JSON.parse(raw) } : defaultStore()
  } catch {
    return defaultStore()
  }
}

export function saveStore(store: LSStore) {
  localStorage.setItem(LS_KEY, JSON.stringify(store))
}

// ── Library index (lightweight, stored in LS) ─────────────────────────────────

const LIB_KEY = 'raaag-library'

export function loadLibraryIndex(): Library | null {
  try {
    const raw = localStorage.getItem(LIB_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveLibraryIndex(lib: Library) {
  localStorage.setItem(LIB_KEY, JSON.stringify(lib))
}

export function clearLibraryIndex() {
  localStorage.removeItem(LIB_KEY)
}
