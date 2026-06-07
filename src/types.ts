// Types used across the app

export interface Song {
  id: string
  title: string
  artist: string
  album: string
  albumId: string
  artistId: string
  duration: number      // seconds
  track: number
  year?: number
  genre?: string
  coverArt?: string     // data URL or blob URL
  fileBlob?: Blob
  filePath: string      // display path
}

export interface Album {
  id: string
  name: string
  artist: string
  artistId: string
  year?: number
  coverArt?: string
  songs: string[]       // Song ids
}

export interface Artist {
  id: string
  name: string
  albums: string[]      // Album ids
  coverArt?: string
}

export interface Playlist {
  id: string
  name: string
  songs: string[]       // Song ids
  createdAt: number
  coverArt?: string
}

export interface Library {
  songs: Record<string, Song>
  albums: Record<string, Album>
  artists: Record<string, Artist>
  lastSync: number
}

export type RepeatMode = 'off' | 'all' | 'one'

export type Screen =
  | 'library'
  | 'now-playing'
  | 'artist'
  | 'album'
  | 'playlist'
  | 'queue'
  | 'search'
  | 'settings'
  | 'favorites'
  | 'recent'

export type RaagTime = 'morning' | 'afternoon' | 'evening' | 'night'
