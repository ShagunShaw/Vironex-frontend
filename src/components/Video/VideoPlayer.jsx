import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { server } from '../../constants';
import { FaThumbsUp, FaThumbsDown, FaShare, FaFlag, FaRegBookmark } from 'react-icons/fa';
import VideoGrid from './VideoGrid';
import CommentsList from '../Comments/CommentsList';

const VideoPlayer = () => {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [user, setUser] = useState({});         // For storing user data

  // Debug effect for authentication state
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    // console.log('Authentication state:', {
    //   isAuthenticated: !!accessToken,
    //   tokenLength: accessToken ? accessToken.length : 0
    // });
  }, []);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      setIsLoading(true);
      setError('');
      
      const accessToken = localStorage.getItem('accessToken');
     // console.log('Fetching video with auth state:', !!accessToken);
      
      try {
        const response = await axios.get(`${server}/videos/get-video/${videoId}`, {
          headers: {
            Authorization: accessToken ? `Bearer ${accessToken}` : undefined
          }
        });
        
        // console.log('Full API response:', response);
        // console.log('Video data from API:', response.data.data);
        // console.log('Response structure:', {
        //   responseData: response.data,
        //   videoData: response.data.data, 
        // });
        
        // Check if the API response contains likes information
        const videoData = response.data.data;
        
        // Log all available fields to see what we can use
       // console.log('All video fields:', Object.keys(videoData));
        
        // Store the video data directly
        setVideo(videoData);
        setIsLiked(videoData.isLiked || false);
        setIsDisliked(videoData.isDisliked || false);
        
        // Set subscription state if available in the API response
        if (videoData.owner) {
          const response2 = await axios.get(`${server}/subscriptions/${videoData.owner}/isSubscribed`, {
            headers: {
              Authorization: accessToken ? `Bearer ${accessToken}` : undefined
            }
          });
          setIsSubscribed(response2.data.data);

          const response3 = await axios.get(`${server}/subscriptions/getSubscribers`, {
            headers: {
              Authorization: accessToken ? `Bearer ${accessToken}` : undefined
            }
          });
          setSubscriberCount(response3.data.data.count || 0);

          const response4 = await axios.get(`${server}/users/${videoData.owner}`, {
            headers: {
              Authorization: accessToken ? `Bearer ${accessToken}` : undefined
            }
          });
          setUser(response4.data.data);

        } 
        else {
          console.warn('Video owner data missing in API response');
        }
        
        setIsLoading(false);
      } catch (err) {
        //console.error('Error fetching video details:', err);
        setError('Could not load video. Please try again later.');
        setIsLoading(false);
      }
    };
    
    // Comments are now handled by the CommentsList component
    
    fetchVideoDetails();
  }, [videoId]);

  const handleLikeVideo = async () => {
    try {
      // Make API call to toggle like status
      const response = await axios.post(`${server}/likes/toggleVideoLike/${videoId}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      //console.log('Like toggle API response:', response.data);
      
      // After like operation, fetch the updated video details to get current like count from server
      const videoResponse = await axios.get(`${server}/videos/get-video/${videoId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      const updatedVideoData = videoResponse.data.data;
      //console.log('Updated video data after like:', updatedVideoData);
      
      // Update local state with server data
      const Count = await axios.get(`${server}/likes/getVideoLikes/${videoId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      setLikeCount(Count.data.data || 0);
      setVideo(updatedVideoData);
      setIsLiked(updatedVideoData.isLiked || !isLiked);
      
      if (isDisliked && !isLiked) {
        setIsDisliked(false);
      }
      
    } catch (err) {
      console.error('Error toggling like:', err);

    }
    console.log('Like hogya');
  };
  
  const handleSubscribe = async () => {
    // Check if user is authenticated
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      console.error('Authentication required');
      alert('Please log in to subscribe to channels');
      return;
    }
    
    // Verify channel data is available
    if (!video?.owner) {
      console.error('Video owner data is missing');
      alert('Channel information not available. Please try again later.');
      return;
    }

    // Double check channel ID is present
    const channelId = video.owner;
    if (!channelId) {
      console.error('Channel ID is missing', video.owner);
      alert('Channel ID not available. Please try again later.');
      return;
    }
    
    //console.log('Attempting to subscribe/unsubscribe to channel ID:', channelId);
    
    setIsSubscribing(true);
    try {
      // Using the subscription toggle endpoint from API docs
      const response = await axios.post(
        `${server}/subscriptions/toggleSubscription/${channelId}`, 
        {}, 
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      
      //console.log('Subscription response:', response.data);
      
      // Calculate new subscription state based on toggle action
      const newSubscriptionState = !isSubscribed;
      
      // Store current count to use in calculations
      const currentCount = subscriberCount || 0;
      
      // Temporarily update local state for immediate UI feedback
      setIsSubscribed(newSubscriptionState);
      setSubscriberCount(newSubscriptionState ? currentCount + 1 : Math.max(0, currentCount - 1));

      // Fetch updated video data to refresh all information
      const videoResponse = await axios.get(`${server}/videos/get-video/${videoId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      const updatedVideoData = videoResponse.data.data;
     // console.log('Updated video data after subscription change:', updatedVideoData);
      
      // Update video data with fresh info from server
      setVideo(updatedVideoData);
      
      // Use server data for subscription status and count if available
      if (updatedVideoData.owner) {

        const response2 = await axios.get(`${server}/subscriptions/${updatedVideoData.owner}/isSubscribed`, {
          headers: {
            Authorization: accessToken ? `Bearer ${accessToken}` : undefined
          }
        });
        const isSubscribedFromServer = response2.data.data;

        const response3 = await axios.get(`${server}/subscriptions/getSubscribers`, {
          headers: {
            Authorization: accessToken ? `Bearer ${accessToken}` : undefined
          }
        });
        const subscribersFromServer = response3.data.data.count || 0;
        
        setIsSubscribed(isSubscribedFromServer);
        setSubscriberCount(subscribersFromServer);
      }
    } catch (err) {
     // console.error('Error toggling subscription:', err);
      // Restore previous state on error
      setIsSubscribed(isSubscribed);
      setSubscriberCount(subscriberCount);
      
      // Show specific error message based on response
      if (err.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
      } else {
        alert('Failed to update subscription. Please try again.');
      }
    } finally {
      setIsSubscribing(false);
    }
  };
  
  // Debug effect to log video object when it changes
  useEffect(() => {
    if (video) {
      // console.log('Current video object:', video);
      // console.log('Available fields:', Object.keys(video));
      // console.log('Likes related fields:', {
      //   likes: video.likes,
      //   likesCount: video.likesCount,
      //   likeCount: video.likeCount
      // });
    }
  }, [video]);

  const formatViewCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M views`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K views`;
    } else {
      return `${count} views`;
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return '';
    }
  };
  
  // Debug effect to monitor subscription state changes
  useEffect(() => {
    // console.log('Subscription state changed:', {
    //   isSubscribed,
    //   subscriberCount,
    //   channelId: video?.owner?._id,
    //   isAuthenticated: !!localStorage.getItem('accessToken'),
    //   videoOwner: video?.owner ? {
    //     id: video.owner._id,
    //     fullName: video.owner.fullName,
    //     isSubscribed: video.owner.isSubscribed,
    //     subscribersCount: video.owner.subscribersCount
    //   } : 'Not available'
    // });
  }, [isSubscribed, subscriberCount, video?.owner]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff3b5c]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-8">
        {error}
      </div>
    );
  }

  if (!video) {
    return (
      <div className="text-center py-8">
        Video not found
      </div>
    );
  }
//console.log("FINAL VIDEO URL:", video?.videoFile);
  return (
    <div className="px-4 py-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2">

          <div className="aspect-video bg-black mb-4 rounded-lg overflow-hidden">
            <video 
              src={video?.videoFile}
              poster={video?.thumbnail}
              controls
              className="w-full h-full"
            />
          </div>
          

          <div>
            <h1 className="text-xl font-bold mb-2">{video.title}</h1>
            
            <div className="flex flex-wrap items-center justify-between mb-4">
              <div className="text-gray-400 text-sm">
                {formatViewCount(Math.ceil(video.views / 2))}
                <span className="mx-1">•</span>
                {formatDate(video.createdAt)}
              </div>
              

              <div className="flex space-x-4">
                <button 
                  className={`flex items-center gap-1 ${isLiked ? 'text-[#ff3b5c]' : 'text-white'}`}
                  onClick={handleLikeVideo}
                >
                  <FaThumbsUp />
                  <span>{likeCount}</span>
                </button>
                
                <button className="flex items-center gap-1">
                  <FaThumbsDown />
                </button>
                
                <button className="flex items-center gap-1">
                  <FaShare />
                  <span>Share</span>
                </button>
                
                <button className="flex items-center gap-1">
                  <FaRegBookmark />
                  <span>Save</span>
                </button>
                
                <button className="flex items-center gap-1">
                  <FaFlag />
                </button>
              </div>
            </div>
            

            <div className="flex items-start gap-4 py-4 border-t border-b border-gray-700">
              <img 
                src={user.avatar}
                alt={user.fullName}
                className="w-12 h-12 rounded-full object-cover"
              />
              
              <div className="flex-1">
                <h3 className="text-lg font-medium">{user.fullName}</h3>
                <p className="text-gray-400 text-sm">
                  {subscriberCount || user.subscribersCount || 0} subscribers
                </p>
                <p className="text-sm text-gray-300 mt-2 line-clamp-2">
                  {video.description}
                </p>
              </div>
              
              <button 
                className={`px-4 py-2 rounded-full transition-colors disabled:opacity-70 ${
                  isSubscribed 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-[#ff3b5c] hover:bg-[#e02d53]'
                } ${!localStorage.getItem('accessToken') ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={handleSubscribe}
                disabled={isSubscribing || !localStorage.getItem('accessToken')}
                title={!localStorage.getItem('accessToken') 
                  ? "Please log in to subscribe" 
                  : isSubscribed 
                    ? "Click to unsubscribe" 
                    : "Click to subscribe"}
              >
                {isSubscribing 
                  ? 'Processing...' 
                  : isSubscribed 
                    ? 'Subscribed' 
                    : localStorage.getItem('accessToken') 
                      ? 'Subscribe' 
                      : 'Login to Subscribe'}
              </button>
            </div>
            

            <div className="mt-6">
              {/* Using the new CommentsList component */}
              <CommentsList videoId={videoId} />
            </div>
          </div>
        </div>
        

        <div>
          <h3 className="text-lg font-medium mb-4">Related Videos</h3>

          <VideoGrid 
            endpoint="/videos" 
            params={{ 
              limit: 10,
              exclude: videoId,

            }}
            limit={10}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;  
