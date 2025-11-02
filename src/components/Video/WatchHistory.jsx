import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosAuth} from '../../utils/axiosConfig';
import { server } from '../../constants';
import VideoCard from './VideoCard';
import { FaHistory, FaTrash, FaExclamationTriangle } from 'react-icons/fa';

const WatchHistory = () => {
  const navigate = useNavigate();
  const [historyVideos, setHistoryVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('accessToken'));
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setError('Please log in to view your watch history');
      return;
    }

    fetchWatchHistory();
  }, [isAuthenticated]);

  const fetchWatchHistory = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Get a fresh axios instance with the latest token
      //const freshAxios = getAxiosAuth();
      
      const response = await axiosAuth.get('/users/watch-history');

      // API returns array of video objects in the watch history
      const videos = response.data.data || [];
      
      // Sort by most recently watched (assuming there's a lastWatched or timestamp field)
      // If not provided by API, the array should already be in the correct order
      setHistoryVideos(videos);
      
    } catch (err) {
      console.error('Error fetching watch history:', err);
      
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        setIsAuthenticated(false);
        // Could redirect to login page here
      } else {
        setError('Could not load watch history. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to clear watch history
  const clearWatchHistory = async () => {
    if (window.confirm('Are you sure you want to clear your entire watch history? This action cannot be undone.')) {
      setIsClearing(true);
      
      try {
        await axiosAuth.delete('/users/watch-history');       // where is this route 
        //await freshAxios.delete('/users/watch-history');
        
        // Clear local state
        setHistoryVideos([]);
        
        // Show success message or toast notification here
      } catch (err) {
        console.error('Error clearing watch history:', err);
        setError('Failed to clear watch history. Please try again.');
      } finally {
        setIsClearing(false);
      }
    }
  };

  // Function to remove a single video from watch history
  const removeFromHistory = async (videoId) => {
    try {
      //const freshAxios = getAxiosAuth();
      await axiosAuth.delete(`/users/watch-history/${videoId}`);      // where is this route

      // Remove from local state
      setHistoryVideos(prev => prev.filter(video => video._id !== videoId));
      
      // Show success message or toast notification here
    } catch (err) {
      console.error(`Error removing video ${videoId} from history:`, err);
      // Show error message or toast notification here
    }
  };

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <FaHistory className="text-[#ff3b5c] mr-2 text-xl" />
          <h1 className="text-2xl font-bold">Watch History</h1>
        </div>
        
        {historyVideos.length > 0 && (
          <button
            onClick={clearWatchHistory}
            disabled={isClearing}
            className={`flex items-center px-4 py-2 rounded-full ${
              isClearing 
                ? 'bg-gray-700 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700'
            } transition-colors`}
          >
            <FaTrash className="mr-2" />
            {isClearing ? 'Clearing...' : 'Clear History'}
          </button>
        )}
      </div>

      {/* Not Authenticated State */}
      {!isAuthenticated && (
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <FaExclamationTriangle className="text-yellow-500 text-4xl mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-gray-300 mb-4">
            You need to be logged in to view your watch history.
          </p>
          <button 
            className="bg-[#ff3b5c] hover:bg-[#e02d53] px-6 py-2 rounded-full transition-colors"
            onClick={() => navigate('/login')}
          >
            Log In
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff3b5c]"></div>
        </div>
      )}

      {/* Error State */}
      {error && isAuthenticated && (
        <div className="text-red-500 text-center py-8 bg-gray-800 rounded-lg p-6">
          <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
          <p>{error}</p>
          <button 
            onClick={fetchWatchHistory}
            className="mt-4 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-full transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Content Area */}
      {!isLoading && !error && isAuthenticated && (
        <>
          {historyVideos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {historyVideos.map(video => (
                <div key={video._id} className="relative group">
                  <VideoCard video={video} />
                  
                  {/* Remove from history button - shows on hover */}
                  <button
                    onClick={() => removeFromHistory(video._id)}
                    className="absolute top-2 right-2 bg-black bg-opacity-70 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove from history"
                  >
                    <FaTrash className="text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-center py-16 bg-gray-800 rounded-lg">
              <FaHistory className="text-5xl mx-auto mb-4 text-gray-500" />
              <h2 className="text-xl font-semibold mb-2">No watch history yet</h2>
              <p className="mb-6">Videos you watch will appear here</p>
              <button 
                onClick={() => navigate('/')}
                className="bg-[#ff3b5c] hover:bg-[#e02d53] px-6 py-2 rounded-full transition-colors"
              >
                Discover Videos
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WatchHistory;
