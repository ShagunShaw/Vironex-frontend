import React, { useState, useEffect } from 'react';
import { server } from '../../constants';
import VideoCard from './VideoCard';
import { axiosAuth } from '../../utils/axiosConfig'; // Ensure this path is correct

const LikedVideo = () => {
  const [likedVideos, setLikedVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLikedVideos = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await axiosAuth.get(`/likes/videos`);     

        // 1. Get the main data object which contains 'likedVideos' and 'pagination'
        const responseData = response.data.data; 
        console.log('Fetched liked videos data:', responseData);

        // 2. Get the array of like objects (which contain videoDetails)
        const likesArray = responseData.likedVideos || [];

        // 3. Extract the actual video object from 'videoDetails' in each like
        const videos = likesArray.map(like => like.videoDetails) || []; 
        setLikedVideos(videos);

      } catch (err) {
        console.error('Error fetching liked videos:', err);
        // Better error message based on status
        if (err.response?.status === 401) {
            setError('Your session may have expired. Please log in again.');
        } else {
            setError('Could not load liked videos. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikedVideos();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Liked Videos</h1>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff3b5c]"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-red-500 text-center py-8">
          {error}
        </div>
      )}

      {/* Content Area */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {likedVideos.length > 0 ? (
            // Now 'video' is actually a video object
            likedVideos.map(video => (
              video ? <VideoCard key={video._id} video={video} /> : null // Add check for null video
            ))
          ) : (
            <div className="text-gray-500 col-span-full text-center py-8">
              No liked videos yet
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LikedVideo; 