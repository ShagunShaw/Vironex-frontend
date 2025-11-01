import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosAuth } from '../../utils/axiosConfig';
import { server } from '../../constants';
import { FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';

const timeAgo = (date) => {
  try {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return Math.floor(seconds) + ' seconds ago';
  } catch (e) {
    return 'some time ago';
  }
};

const VideoCard = ({ video }) => {
  const navigate = useNavigate();
  const [channelDetails, setChannelDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchChannelDetails = async () => {
      
      if (!video) return;
      
      const ownerInfo = video.ownerDetails || video.owner;
      if (!ownerInfo) return;
      
      try {
        setIsLoading(true);

        const userId = ownerInfo;
        
        if (!userId) {
          throw new Error("User ID not available in video owner details");
        }

        const userDetails = await axios.get(`${server}/users/${userId}`);
        const response = await axios.get(`${server}/users/channel/${userDetails.data.data.username}`);
        
        setChannelDetails(response.data.data);
      } 
      catch (err) {
        console.error('Error fetching channel details:', err);
        setError('Could not load channel information');
        
        setChannelDetails({
          isVerified: ownerInfo.isVerified || false
        });
      } 
      finally {
        setIsLoading(false);
      }
    };

    fetchChannelDetails();
  }, [video]);

  if (!video) {
    return null;
  }

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const formatViewCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M views`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K views`;
    } else {
      return `${count} views`;
    }
  };

  const getTimeAgo = (dateString) => {
    try {
      return timeAgo(dateString);
    } catch (error) {
      return 'some time ago';
    }
  };

  const handleCardClick = () => {
    navigate(`/watch/${video._id}`);
  };

  const handleChannelClick = (e) => {
    e.stopPropagation();
    const ownerInfo = video.ownerDetails || video.owner;
    if (ownerInfo && ownerInfo.username) {
      navigate(`/channel/${ownerInfo.username}`);
    }
  };

  const ownerInfo = video.ownerDetails || video.owner;

  return (
    <div 
      className="cursor-pointer group"
      onClick={handleCardClick}
    >

      <div className="relative rounded-xl overflow-hidden mb-2">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full aspect-video object-cover transition-all group-hover:scale-105"
        />
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded">
            {formatDuration(video.duration)}
          </div>
        )}
      </div>

      <div className="flex">
        <div 
          className="mr-3 mt-1"
          onClick={handleChannelClick}
        >
          {ownerInfo && (
            <img
              src={channelDetails?.avatar}
              alt={channelDetails?.username}
              className="w-9 h-9 rounded-full object-cover"
            />
          )}
        </div>
        

        <div className="flex-1">
          <h3 className="text-white text-base font-medium mb-1 line-clamp-2">
            {video.title}
          </h3>
          
          <div 
            className="flex items-center text-gray-400 text-sm"
            onClick={handleChannelClick}
          >
            {channelDetails?.fullName}
            {true && (
              <FaCheckCircle className="ml-1 text-blue-500 text-xs" />
            )}
          </div>
          
          <div className="text-gray-400 text-sm">
            <span>{formatViewCount(video.views || 0)}</span>
            <span className="mx-1">•</span>
            <span>{getTimeAgo(video.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
