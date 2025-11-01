import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { server } from '../../constants';
import { axiosAuth } from '../../utils/axiosConfig';
import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import ChannelCardSkeleton from './ChannelCardSkeleton';


const Subscriptions = () => {
  const [subscribedChannels, setSubscribedChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [unsubscribingIds, setUnsubscribingIds] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });

  useEffect(() => {
    // Check if user is authenticated first
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setError('Authentication required to view subscriptions');
      setIsLoading(false);
      return;
    }
    
    fetchSubscribedChannels(1);
  }, []);

  const fetchSubscribedChannels = async (page = 1) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Get the current user's ID first
      const userResponse = await axiosAuth.get(`/users/current-user`);
      //console.log('Current user response:', userResponse.data);
      const userId = userResponse.data.data._id;
      
      if (!userId) {
        setError('User information not available');
        setIsLoading(false);
        return;
      }
      
      // Fetch subscribed channels using the user's ID
      const response = await axiosAuth.get(`/subscriptions/getSubscriptions`);    // the actual route has been changed here
      
      if (response.data.success) {
        const data = response.data.data;
        
        // Extract channels from the response according to the backend structure
        // The backend returns subscribedChannels array with channelDetails inside each item
        const channels = data?.map(subscription => ({
          _id: subscription.channel._id,
          username: subscription.channel.username,
          fullName: subscription.channel.fullName,
          avatar: subscription.channel.avatar,
          coverImage: subscription.channel.coverImage,
          // Use subscribersCount from the channel object returned by the backend if available
          subscribersCount: subscription.subscribersCount || 0,
          // Add subscription ID for unsubscribe functionality
          subscriptionId: subscription._id
        })) || [];

        setSubscribedChannels(channels);
        
        // Update pagination based on the controller response
        setPagination({
          currentPage: data.pagination?.currentPage || 1,
          totalPages: data.pagination?.totalPages || 1,
          totalItems: data.subscribedCount || 0
        });
      } else {
        setError('Failed to fetch subscriptions');
      }
    } catch (err) {
      console.error('Error fetching subscribed channels:', err);
      setError(err.response?.data?.message || 'An error occurred while fetching subscriptions');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.currentPage) {
      window.scrollTo(0, 0); // Scroll to top when changing pages
      fetchSubscribedChannels(newPage);
    }
  };

  // Function to format subscriber count
  const formatSubscriberCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M subscribers`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K subscribers`;
    } else {
      return (count == 0 || count == 1) ? `${count} subscriber` : `${count} subscribers`;
    }
  };
  
  // Add a way to unsubscribe directly from this page
  const handleUnsubscribe = async (channelId, channelName, event) => {
    // Prevent navigation to channel page when clicking the unsubscribe button
    event.preventDefault();
    event.stopPropagation();
    
    if (!channelId) {
      console.error('No channel ID provided for unsubscribe action');
      alert('Error: Could not identify the channel to unsubscribe from');
      return;
    }
    
    try {

      // Show loading state for this specific channel
      setUnsubscribingIds(prev => [...prev, channelId]);
      
      const response = await axiosAuth.post(`/subscriptions/toggleSubscription/${channelId}`);
      
      // Check if unsubscribe was successful
      if (response.data.success) {
        // Update the UI by removing the unsubscribed channel
        setSubscribedChannels(prev => prev.filter(channel => channel._id !== channelId));
        
        // Update pagination count
        setPagination(prev => ({
          ...prev,
          totalItems: Math.max(0, prev.totalItems - 1)
        }));
        
        // If this was the last item on the page and not the first page, go to previous page
        if (subscribedChannels.length === 1 && pagination.currentPage > 1) {
          fetchSubscribedChannels(pagination.currentPage - 1);
        }
      } else {
        // Handle unsuccessful unsubscribe
        console.error('Unsubscribe operation unsuccessful:', response.data.message);
        alert('Failed to unsubscribe. Please try again.');
      }
      
    } catch (err) {
      console.error('Error unsubscribing:', err);
      if (err.response?.status === 400) {
        alert('Invalid channel ID. Please reload and try again.');
      } else if (err.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
      } else {
        alert('Failed to unsubscribe. Please try again.');
      }
    } finally {
      setUnsubscribingIds(prev => prev.filter(id => id !== channelId));
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">My Subscriptions</h1>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <ChannelCardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">
          <p className="mb-4">{error}</p>
          {!localStorage.getItem('accessToken') && (
            <p>
              Please <Link to="/login" className="text-[#ff3b5c] underline">log in</Link> to view your subscriptions.
            </p>
          )}
        </div>
      ) : subscribedChannels.length === 0 ? (
        <div className="text-center py-16 bg-gray-800 rounded-lg">
          <h2 className="text-xl mb-2">You haven't subscribed to any channels yet</h2>
          <p className="text-gray-400 mb-6">Subscribe to channels to stay updated with their latest videos</p>
          <Link to="/" className="bg-[#ff3b5c] hover:bg-[#e02d53] text-white px-6 py-2 rounded-full transition">
            Discover Channels
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {subscribedChannels.map(channel => (
              <div key={channel._id} className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition relative group">
                <Link to={`/channel/${channel.username}`}>
                  <div className="relative h-24 bg-gray-700">
                    {/* Only display cover image if available */}
                    {channel.coverImage && (
                      <img 
                        src={channel.coverImage} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </Link>
                
                <div className="p-4 flex">
                  <div className="mr-4">
                    <Link to={`/channel/${channel.username}`}>
                      <img 
                        src={channel.avatar} 
                        alt={channel.fullName} 
                        className="w-12 h-12 rounded-full object-cover bg-gray-700"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/40?text=User';
                        }}
                      />
                    </Link>
                  </div>
                  
                  <div>
                    <Link to={`/channel/${channel.username}`}>
                      <h3 className="font-semibold flex items-center">
                        {channel.fullName}
                        {channel.isVerified && (
                          <FaCheckCircle className="text-[#ff3b5c] ml-1 text-sm" />
                        )}
                      </h3>
                      <p className="text-gray-400 text-sm">@{channel.username}</p>
                      <p className="text-gray-400 text-sm">
                        {formatSubscriberCount(channel.subscribersCount || 0)}
                      </p>
                    </Link>
                    
                    <button
                      onClick={(e) => handleUnsubscribe(channel._id, channel.fullName, e)}
                      disabled={unsubscribingIds.includes(channel._id)}
                      className="mt-2 text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                    >
                      {unsubscribingIds.includes(channel._id) ? (
                        <>
                          <span className="w-3 h-3 rounded-full border-2 border-t-transparent border-white animate-spin inline-block mr-1"></span>
                          <span>Processing</span>
                        </>
                      ) : (
                        <span>Unsubscribe</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col items-center mt-8">
              <div className="flex space-x-2 mb-2">
                <button 
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className={`px-4 py-2 rounded-md ${
                    pagination.currentPage === 1 
                      ? 'bg-gray-700 cursor-not-allowed' 
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                  title={pagination.currentPage === 1 ? "You're on the first page" : "Go to previous page"}
                >
                  Previous
                </button>
                
                {/* For better mobile experience, show limited page numbers */}
                {pagination.totalPages <= 5 ? (
                  // Show all pages if total pages are 5 or less
                  [...Array(pagination.totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-4 py-2 rounded-md ${
                          pagination.currentPage === pageNumber
                            ? 'bg-[#ff3b5c]'
                            : 'bg-gray-800 hover:bg-gray-700'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })
                ) : (
                  // Show limited pages with ellipsis for better UX
                  <>
                    {/* Always show first page */}
                    <button
                      onClick={() => handlePageChange(1)}
                      className={`px-4 py-2 rounded-md ${
                        pagination.currentPage === 1 ? 'bg-[#ff3b5c]' : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      1
                    </button>
                    
                    {/* Show ellipsis if current page is > 3 */}
                    {pagination.currentPage > 3 && (
                      <span className="px-4 py-2">...</span>
                    )}
                    
                    {/* Show current page and adjacent pages */}
                    {[...Array(pagination.totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      // Show current page and one page before/after
                      if (
                        pageNumber !== 1 && 
                        pageNumber !== pagination.totalPages &&
                        (Math.abs(pageNumber - pagination.currentPage) <= 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`px-4 py-2 rounded-md ${
                              pagination.currentPage === pageNumber
                                ? 'bg-[#ff3b5c]'
                                : 'bg-gray-800 hover:bg-gray-700'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      }
                      return null;
                    })}
                    
                    {/* Show ellipsis if current page is < totalPages - 2 */}
                    {pagination.currentPage < pagination.totalPages - 2 && (
                      <span className="px-4 py-2">...</span>
                    )}
                    
                    {/* Always show last page */}
                    <button
                      onClick={() => handlePageChange(pagination.totalPages)}
                      className={`px-4 py-2 rounded-md ${
                        pagination.currentPage === pagination.totalPages ? 'bg-[#ff3b5c]' : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      {pagination.totalPages}
                    </button>
                  </>
                )}
                
                <button 
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className={`px-4 py-2 rounded-md ${
                    pagination.currentPage === pagination.totalPages 
                      ? 'bg-gray-700 cursor-not-allowed' 
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                  title={pagination.currentPage === pagination.totalPages ? "You're on the last page" : "Go to next page"}
                >
                  Next
                </button>
              </div>
              
              <div className="text-gray-400 text-sm mt-2">
                Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} total subscriptions)
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Subscriptions;
