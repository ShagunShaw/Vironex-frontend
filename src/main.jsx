import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import { store } from './redux/store'
import './index.css'
import App from './App.jsx'
import HomePage from './components/Home/HomePage.jsx'
import TrendingPage from './components/Home/TrendingVideos.jsx'
import VideoPlayer from './components/Video/VideoPlayer.jsx'
import UserProfile from './components/User/UserProfile.jsx'
import Login from './components/Auth/Login.jsx'
import Signup from './components/Auth/signup.jsx'
import LandingPage from './components/Landing/LandingPage.jsx'
import LikedVideo from './components/Video/LikedVideo.jsx'
import PlaylistGrid from './components/Playlists/PlaylistGrid.jsx'
import Subscriptions from './components/Subscription/Subscriptions.jsx'
import UploadVideo from './components/Video/UploadVideo.jsx'
import WatchHistory from './components/Video/WatchHistory.jsx'
import WatchLater from './components/Video/WatchLater.jsx'
import PlaylistDetails from './components/Playlists/PlaylistDetails.jsx'
import CreatePlaylist from './components/Playlists/CreatePlaylist.jsx'

// Protected route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('accessToken');
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Landing page is now HomePage */}
          <Route path="/" element={
            <App>
              <HomePage />
            </App>
          } />
          <Route path="/login" element={
            localStorage.getItem('accessToken') ? 
              <Navigate to="/" /> : 
              <Login />
          } />
          <Route path="/signup" element={
            localStorage.getItem('accessToken') ? 
              <Navigate to="/" /> : 
              <Signup />
          } />
          
          {/* Redirect /home to root since HomePage is the landing page */}
          <Route path="/home" element={
            <Navigate to="/" replace />
          } />

          <Route path="/trending" element={
            <App>
              <TrendingPage />
            </App>
          } />

          <Route path="/watch/:videoId" element={
            <App>
              <VideoPlayer />
            </App>
          } />
          <Route path="/channel/:username" element={
            <App>
              <UserProfile />
            </App>
          } />
          <Route path="/liked-videos" element={
            <ProtectedRoute>
              <App>
                <LikedVideo />
              </App>
            </ProtectedRoute>
          } />
          <Route path="/watch-history" element={
            <ProtectedRoute>
              <App>
                <WatchHistory />
              </App>
            </ProtectedRoute>
          } />
          <Route path="/watch-later" element={
            <ProtectedRoute>
              <App>
                <WatchLater />
              </App>
            </ProtectedRoute>
          } />
          <Route path="/subscriptions" element={
            <ProtectedRoute>
              <App>
                <Subscriptions />
              </App>
            </ProtectedRoute>
          } />
          <Route path="/playlist/:playlistId" element={
            <ProtectedRoute>
              <App>
                <PlaylistDetails />
              </App>
            </ProtectedRoute>
          } />
          <Route path="/playlists" element={
            <ProtectedRoute>
              <App>
                <PlaylistGrid />
              </App>
            </ProtectedRoute>
          } />
          <Route path="/create-playlist" element={
            <ProtectedRoute>
              <App>
                <CreatePlaylist />
              </App>
            </ProtectedRoute>
          } />
          
          <Route path="/upload" element={
            <ProtectedRoute>
              <App>
                <UploadVideo />
              </App>
            </ProtectedRoute>
          } />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </Provider>
  </StrictMode>,
)
