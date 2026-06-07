import type { RepeatMode, Song } from '../types'

type PlayerEvent = 'play' | 'pause' | 'ended' | 'timeupdate' | 'error' | 'loaded'
type Listener = () => void

class AudioPlayerClass {
  private audio = new Audio()
  private listeners: Map<PlayerEvent, Set<Listener>> = new Map()
  private _queue: Song[] = []
  private _queueIndex = 0
  private _repeatMode: RepeatMode = 'off'
  private _shuffle = false
  private _shuffledIndices: number[] = []
  private _currentBlobUrl: string | null = null

  constructor() {
    this.audio.preload = 'auto'
    this.audio.addEventListener('ended', () => this.handleEnded())
    this.audio.addEventListener('timeupdate', () => this.emit('timeupdate'))
    this.audio.addEventListener('error', () => this.emit('error'))
    this.audio.addEventListener('loadedmetadata', () => this.emit('loaded'))
  }

  // ── Events ──────────────────────────────────────────────────────────────────

  on(event: PlayerEvent, cb: Listener) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set())
    this.listeners.get(event)!.add(cb)
    return () => this.listeners.get(event)?.delete(cb)
  }

  private emit(event: PlayerEvent) {
    this.listeners.get(event)?.forEach(cb => cb())
  }

  // ── Queue management ─────────────────────────────────────────────────────────

  setQueue(songs: Song[], startIndex = 0) {
    this._queue = songs
    this._queueIndex = startIndex
    this.buildShuffleOrder()
    this.loadCurrent()
  }

  private buildShuffleOrder() {
    this._shuffledIndices = [...Array(this._queue.length).keys()]
    for (let i = this._shuffledIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[this._shuffledIndices[i], this._shuffledIndices[j]] = [this._shuffledIndices[j], this._shuffledIndices[i]]
    }
  }

  private get effectiveIndex() {
    if (this._shuffle) return this._shuffledIndices[this._queueIndex] ?? this._queueIndex
    return this._queueIndex
  }

  get currentSong(): Song | null {
    return this._queue[this.effectiveIndex] ?? null
  }

  get queue() { return this._queue }
  get queueIndex() { return this._queueIndex }

  // ── Playback ─────────────────────────────────────────────────────────────────

  private async loadCurrent() {
    if (this._currentBlobUrl) {
      URL.revokeObjectURL(this._currentBlobUrl)
      this._currentBlobUrl = null
    }
    const song = this.currentSong
    if (!song) return

    // Get blob URL from DB
    const { getSongBlobUrl } = await import('./db')
    const url = await getSongBlobUrl(song.id)
    if (!url) { this.emit('error'); return }
    this._currentBlobUrl = url
    this.audio.src = url
    this.audio.load()
    this.emit('play')
  }

  async play(song?: Song) {
    if (song) {
      const idx = this._queue.findIndex(s => s.id === song.id)
      if (idx !== -1) {
        this._queueIndex = idx
        await this.loadCurrent()
      }
    }
    await this.audio.play().catch(() => {})
    this.emit('play')
  }

  pause() {
    this.audio.pause()
    this.emit('pause')
  }

  toggle() {
    if (this.audio.paused) this.play()
    else this.pause()
  }

  async next() {
    const max = this._queue.length - 1
    if (this._queueIndex < max) {
      this._queueIndex++
    } else {
      if (this._repeatMode === 'all') this._queueIndex = 0
      else return
    }
    await this.loadCurrent()
    await this.audio.play().catch(() => {})
    this.emit('play')
  }

  async prev() {
    // If > 3s in, restart current track
    if (this.audio.currentTime > 3) {
      this.audio.currentTime = 0
      return
    }
    if (this._queueIndex > 0) {
      this._queueIndex--
    } else {
      this._queueIndex = this._repeatMode === 'all' ? this._queue.length - 1 : 0
    }
    await this.loadCurrent()
    await this.audio.play().catch(() => {})
    this.emit('play')
  }

  private async handleEnded() {
    if (this._repeatMode === 'one') {
      this.audio.currentTime = 0
      await this.audio.play().catch(() => {})
      return
    }
    this.emit('ended')
    await this.next()
  }

  seek(time: number) {
    if (isFinite(time)) this.audio.currentTime = time
  }

  setVolume(v: number) {
    this.audio.volume = Math.max(0, Math.min(1, v))
  }

  get volume() { return this.audio.volume }
  get currentTime() { return this.audio.currentTime }
  get duration() { return this.audio.duration || 0 }
  get isPlaying() { return !this.audio.paused }

  get repeatMode() { return this._repeatMode }
  setRepeat(mode: RepeatMode) { this._repeatMode = mode }

  get shuffle() { return this._shuffle }
  toggleShuffle() {
    this._shuffle = !this._shuffle
    if (this._shuffle) this.buildShuffleOrder()
  }

  // Queue reorder
  moveInQueue(from: number, to: number) {
    const arr = [...this._queue]
    const [item] = arr.splice(from, 1)
    arr.splice(to, 0, item)
    this._queue = arr
    this.buildShuffleOrder()
  }
}

export const AudioPlayer = new AudioPlayerClass()
