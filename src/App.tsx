import React from 'react'
import { PlayerProvider } from './context/PlayerContext'
import { LibraryProvider } from './context/LibraryContext'
import { NavProvider, useNav } from './context/NavContext'
import Library from './screens/Library'
import NowPlaying from './screens/NowPlaying'
import ArtistScreen from './screens/Artist'
import AlbumScreen from './screens/Album'
import PlaylistScreen from './screens/Playlist'
import QueueScreen from './screens/Queue'
import FavoritesScreen from './screens/Favorites'
import Settings from './screens/Settings'
import MiniPlayer from './components/MiniPlayer'
import { usePlayer } from './context/PlayerContext'

function AppRoutes() {
  const { screen } = useNav()
  const { currentSong } = usePlayer()

  return (
    <div className="relative h-full flex flex-col overflow-hidden" style={{ maxWidth: 480, margin: '0 auto' }}>
      {/* Screen */}
      <div className="flex-1 overflow-hidden animate-fade-in" key={screen}>
        {screen === 'library'     && <Library />}
        {screen === 'now-playing' && <NowPlaying />}
        {screen === 'artist'      && <ArtistScreen />}
        {screen === 'album'       && <AlbumScreen />}
        {screen === 'playlist'    && <PlaylistScreen />}
        {screen === 'queue'       && <QueueScreen />}
        {screen === 'favorites'   && <FavoritesScreen />}
        {screen === 'settings'    && <Settings />}
      </div>

      {/* Persistent mini player (hidden on now-playing & queue) */}
      {screen !== 'now-playing' && screen !== 'queue' && currentSong && <MiniPlayer />}
    </div>
  )
}

export default function App() {
  return (
    <NavProvider>
      <LibraryProvider>
        <PlayerProvider>
          <AppRoutes />
        </PlayerProvider>
      </LibraryProvider>
    </NavProvider>
  )
}
