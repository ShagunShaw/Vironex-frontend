import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { axiosAuth } from '../../utils/axiosConfig';
import { refreshAccessToken, isTokenExpired } from '../../utils/tokenUtils';
import { server } from '../../constants';
import VideoCard from './VideoCard';

const VideoGrid = ({ title, endpoint, params = {}, limit = 12, source = "home" }) => {
  const [videos, setVideos] = useState([]);
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const serializedParams = JSON.stringify(params);

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      setError('');
      
      // Check if we have a token
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        console.warn("No access token found in localStorage!");
        setError('Authentication required. Please log in again.');
        setIsLoading(false);
        return;
      }
      
      // Check if token is expired and refresh if needed
      if (isTokenExpired()) {
        console.log("Token is expired or about to expire, refreshing...");
        const refreshSuccess = await refreshAccessToken();
        if (!refreshSuccess) {
          console.error("Token refresh failed and no valid token is available");
          setError('Your session has expired. Please log in again.');
          setIsLoading(false);
          return;
        }
      }
      
      try {
        const queryParams = new URLSearchParams({
          ...params,
          limit,
          page: 1,
          sortBy: params.sortBy || 'createdAt',
          sortType: params.sortType || 'desc'
        }).toString();
        
        
        // Always get a fresh axios instance with the latest token
        let response;
        try {
          if(source === 'channel') {
            response = await axiosAuth.get(`${endpoint}/get-videos-of-user/${params.userId}?${queryParams}`);

            const responseData = response.data.data;

            setVideos(responseData || []);
            setPagination(responseData.pagination || {});
          } else {
            response = await axiosAuth.get(`${endpoint}/get-all-videos?${queryParams}`);

            const responseData = response.data.data;

            setVideos(responseData.videos || []);
            setPagination(responseData.pagination || {});
          }
        } 
        catch (authError) {
          console.warn("axiosAuth request failed, falling back to manual token handling", authError);
          
          // Fallback to direct axios with manual token if axiosAuth fails
          if(source === 'channel') {
            response = await axios.get(`${server}${endpoint}/get-videos-of-user/${params.userId}?${queryParams}`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              }
            });

            const responseData = response.data.data;

            setVideos(responseData || []);
            setPagination(responseData.pagination || {});
          } else {
            response = await axios.get(`${server}${endpoint}/get-all-videos?${queryParams}`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
              withCredentials: true // Enable cookies for potential refresh token
            });

            const responseData = response.data.data;

            setVideos(responseData.videos || []);
            setPagination(responseData.pagination || {});
          }
          
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching videos:', err);
        
        if (err.response) {
          console.error('Response data:', err.response.data);
          console.error('Response status:', err.response.status);
          
          if (err.response.status === 401) {
           // console.log("Handling 401 error - attempting to refresh token");
            
            // Use our dedicated token refresh utility
            const refreshSuccess = await refreshAccessToken();
            
            if (refreshSuccess) {
              fetchVideos(); 
              return;
            } else {
              console.error("Token refresh failed");
              setError('Your session has expired. Please log in again.');
            }
          } else if (err.response.status === 403) {
            setError('You do not have permission to access these videos.');
          } else {
            setError(`Error: ${err.response.data?.message || 'Could not load videos. Please try again later.'}`);
          }
        } else if (err.request) {

          console.error('Request made but no response received:', err.request);
          setError('Network error. Please check your connection and try again.');
        } else {

          console.error('Error setting up request:', err.message);
          setError('An unexpected error occurred. Please try again later.');
        }
        
        setIsLoading(false);
      }
    };
    
    fetchVideos();
  }, [endpoint, limit, serializedParams, source]);

  return (
    <div className="mb-8">

      {title && (
        <h2 className="text-xl font-bold mb-4 text-white">{title}</h2>
      )}
      

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff3b5c]"></div>
        </div>
      )}
      

      {error && (
        <div className="text-red-500 text-center py-8">
          {error}
        </div>
      )}
      

      {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-6">
          {videos.length > 0 ? (
            videos.map(video => (
              <VideoCard key={video._id} video={video} />
            ))
          ) : (
            <div className="text-gray-500 col-span-full text-center py-8">
              No videos uploaded
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoGrid;
