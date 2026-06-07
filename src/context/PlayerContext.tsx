import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react'
import { AudioPlayer } from '../modules/AudioPlayer'
import type { Song, RepeatMode } from '../types'

interface PlayerState {
  currentSong: Song | null
  isPlaying: boolean
  currentTime: number
  duration: number
  repeatMode: RepeatMode
  shuffle: boolean
  volume: number
  queue: Song[]
  queueIndex: number
}

type Action =
  | { type: 'TICK' }
  | { type: 'SET_SONG'; song: Song | null }
  | { type: 'SET_PLAYING'; playing: boolean }
  | { type: 'SET_REPEAT'; mode: RepeatMode }
  | { type: 'SET_SHUFFLE'; shuffle: boolean }
  | { type: 'SET_VOLUME'; volume: number }
  | { type: 'SET_QUEUE'; queue: Song[]; index: number }

function reducer(state: PlayerState, action: Action): PlayerState {
  switch (action.type) {
    case 'TICK':
      return { ...state, currentTime: AudioPlayer.currentTime, duration: AudioPlayer.duration, isPlaying: AudioPlayer.isPlaying, currentSong: AudioPlayer.currentSong }
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.playing }
    case 'SET_REPEAT':
      return { ...state, repeatMode: action.mode }
    case 'SET_SHUFFLE':
      return { ...state, shuffle: action.shuffle }
    case 'SET_VOLUME':
      return { ...state, volume: action.volume }
    case 'SET_QUEUE':
      return { ...state, queue: action.queue, queueIndex: action.index }
    default:
      return state
  }
}

interface PlayerContextValue extends PlayerState {
  playSong: (song: Song, queue?: Song[]) => void
  togglePlay: () => void
  next: () => void
  prev: () => void
  seek: (t: number) => void
  setVolume: (v: number) => void
  cycleRepeat: () => void
  toggleShuffle: () => void
}

const PlayerContext = createContext<PlayerContextValue | null>(null)

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    currentSong: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    repeatMode: 'off',
    shuffle: false,
    volume: 0.8,
    queue: [],
    queueIndex: 0,
  })

  useEffect(() => {
    const unsubs = [
      AudioPlayer.on('play',       () => dispatch({ type: 'TICK' })),
      AudioPlayer.on('pause',      () => dispatch({ type: 'TICK' })),
      AudioPlayer.on('ended',      () => dispatch({ type: 'TICK' })),
      AudioPlayer.on('timeupdate', () => dispatch({ type: 'TICK' })),
      AudioPlayer.on('loaded',     () => dispatch({ type: 'TICK' })),
    ]
    return () => unsubs.forEach(u => u())
  }, [])

  const playSong = useCallback((song: Song, queue?: Song[]) => {
    const q = queue ?? [song]
    const idx = q.findIndex(s => s.id === song.id)
    AudioPlayer.setQueue(q, Math.max(0, idx))
    AudioPlayer.play()
    dispatch({ type: 'SET_QUEUE', queue: q, index: Math.max(0, idx) })
  }, [])

  const togglePlay = useCallback(() => AudioPlayer.toggle(), [])
  const next = useCallback(() => AudioPlayer.next(), [])
  const prev = useCallback(() => AudioPlayer.prev(), [])
  const seek = useCallback((t: number) => AudioPlayer.seek(t), [])

  const setVolume = useCallback((v: number) => {
    AudioPlayer.setVolume(v)
    dispatch({ type: 'SET_VOLUME', volume: v })
  }, [])

  const cycleRepeat = useCallback(() => {
    const modes: RepeatMode[] = ['off', 'all', 'one']
    const next = modes[(modes.indexOf(state.repeatMode) + 1) % modes.length]
    AudioPlayer.setRepeat(next)
    dispatch({ type: 'SET_REPEAT', mode: next })
  }, [state.repeatMode])

  const toggleShuffle = useCallback(() => {
    AudioPlayer.toggleShuffle()
    dispatch({ type: 'SET_SHUFFLE', shuffle: AudioPlayer.shuffle })
  }, [])

  return (
    <PlayerContext.Provider value={{ ...state, playSong, togglePlay, next, prev, seek, setVolume, cycleRepeat, toggleShuffle }}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be inside PlayerProvider')
  return ctx
}
