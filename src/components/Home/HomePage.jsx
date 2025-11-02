import React, { useEffect, useState } from 'react';
import VideoGrid from '../Video/VideoGrid';
import { debugAuthToken } from '../../utils/authUtils';
import axios from 'axios';
import { server } from '../../constants';

const HomePage = () => {
  const [authStatus, setAuthStatus] = useState(null);
  
  useEffect(() => {
    // Run token debug on component mount
    debugAuthToken();
    
    // Test authentication status
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setAuthStatus({
            status: 'error',
            message: 'No token found in localStorage'
          });
          return;
        }
        
        // Attempt to access a protected endpoint
        const response = await axios.get(`${server}/users/current-user`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setAuthStatus({
          status: 'success',
          message: 'Authentication successful',
          user: response.data?.data
        });
        
      } catch (error) {
        console.error('Auth check failed:', error);
        setAuthStatus({
          status: 'error',
          message: error.response?.data?.message || 'Authentication failed',
          error: error.response?.status
        });
      }
    };
    
    checkAuthStatus();
  }, []);
  
  return (
    <div className="px-4 py-6">
      
      {/* Recent Uploads - Based on creation date as per controller */}
      <VideoGrid 
        title={<span className="text-2xl font-bold">Recent Uploads</span>} 
        endpoint="/videos" 
        params={{ sortBy: 'createdAt', sortType: 'desc' }} 
        limit={8} 
        source="home"
      />
    </div>
  );
};

export default HomePage;
