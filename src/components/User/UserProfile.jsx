// src/components/User/UserProfile.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { server } from '../../constants';
import { useChannelData } from "../../custom-hooks/UseChannelData"; // Import the custom hook
import VideoGrid from '../Video/VideoGrid';
import { FaCheckCircle, FaSignOutAlt } from 'react-icons/fa';
import { useLogout } from '../../utils/logoutHelper';
import { useLocation } from 'react-router-dom';

const UserProfile = () => {
  const username = useLocation().state?.loggedInUser || useParams().username;
  const navigate = useNavigate();
  const { channelData, isLoading, error } = useChannelData(useParams().username);
  const handleLogout = useLogout();

  // State specific to user interaction on this page
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false); // For the subscribe button

  // This effect syncs the interactive state (subscription) with the fetched data
  useEffect(() => {
    if (channelData) {
      setIsSubscribed(channelData.isSubscribed || false);
      setSubscriberCount(channelData.subscribersCount || 0);
    }
  }, [channelData]);

  const handleSubscribe = async () => {
    if (!channelData?._id) return; // Guard clause

    setIsSubmitting(true);
    try {
      await axios.post(`${server}/subscriptions/toggleSubscription/${channelData._id}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      // Update state based on the *previous* state for reliability
      setIsSubscribed(currentValue => !currentValue);
      setSubscriberCount(currentCount => isSubscribed ? currentCount - 1 : currentCount + 1);

    } catch (err) {
      console.error('Error toggling subscription:', err);
      // You can add a user-facing error toast here
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatSubscriberCount = (count) => {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
    return count.toString();
  };

  // --- Conditional Rendering ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-6rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff3b5c]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">{error}</div>
        <div className="text-sm text-gray-400">Username: {username}</div>
        <div className="mt-4">
          <button 
            className="bg-[#303030] hover:bg-[#404040] text-white px-4 py-2 rounded"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!channelData) {
    return <div className="text-center text-gray-400 py-8">Channel not found for username: {username}</div>;
  }

  // --- Main Component JSX ---
  return (
    <div>
      {/* Cover Image */}
      <div className="h-40 md:h-56 bg-gradient-to-r from-gray-800 to-gray-900 relative">
        {channelData.coverImage && (
          <img 
            src={channelData.coverImage} 
            alt={`${channelData.fullName}'s cover`}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      
      {/* Channel Info */}
      <div className="px-4 py-6 flex flex-col md:flex-row md:items-start gap-4">
        <div className="relative -mt-16 md:-mt-12 z-10 flex-shrink-0">
          <img 
            src={channelData.avatar} 
            alt={channelData.fullName}
            className="w-24 h-24 rounded-full border-4 border-[#0f0f0f] object-cover"
          />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold">{channelData.fullName}</h1>
            {channelData.isVerified && <FaCheckCircle className="text-gray-400 text-lg" />}
          </div>
          
          <div className="text-gray-400 mb-4 flex items-center flex-wrap gap-x-2">
            <span className="text-sm">@{channelData.username}</span>
            <span className="text-sm">• {formatSubscriberCount(subscriberCount)} subscribers</span>
            {channelData.videosCount > 0 && (
              <span className="text-sm">• {channelData.videosCount} videos</span>
            )}
          </div>
          
          {channelData.about && (
            <p className="text-gray-300 text-sm mb-4 max-w-3xl line-clamp-2">
              {channelData.about}
            </p>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={handleSubscribe}
              disabled={isSubmitting} // Disable button during API call
              className={`px-4 py-2 rounded-full font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${
                isSubscribed 
                  ? 'bg-gray-600 hover:bg-gray-700' 
                  : 'bg-[#ff3b5c] hover:bg-[#e02d53]'
              }`}
            >
              {isSubmitting ? '...' : (isSubscribed ? 'Subscribed' : 'Subscribe')}
            </button>
            
            {username === channelData.username && (
              <button
                onClick={() => {
                  localStorage.removeItem('accessToken');
                  localStorage.removeItem('refreshToken');
                  handleLogout();
                  navigate('/');
                  setTimeout(() => {
                    window.alert('You have logged out successfully.');
                  }, 300);
                }}
                className="px-4 py-2 rounded-full flex items-center gap-2 bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                <FaSignOutAlt /> Logout
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Channel Videos */}
      <div className="px-4 mt-4">
        <h2 className="text-xl font-bold mb-4">Your Videos</h2>
        <VideoGrid 
          endpoint={`/videos`} 
          params={{ userId: channelData._id }}
          limit={12}
          source="channel"
        />
      </div>

      {/* Footer */}
      <footer className="bg-[#0f0f0f] text-gray-400 px-4 py-6 mt-8 text-center">
      </footer>
    </div>
  );
};

export default UserProfile;