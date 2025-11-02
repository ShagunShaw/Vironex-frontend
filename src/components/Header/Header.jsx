import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaSearch, FaVideo, FaUserCircle, FaBars } from 'react-icons/fa';
import { toggleSideBar } from '../../redux/sideBar';
import { axiosAuth } from '../../utils/axiosConfig';
import { server } from '../../constants';
import axios from 'axios';
import videostreamer from "/video streamer.png";

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const { status: isLoggedIn, userData } = useSelector(state => state.auth);
  const sidebarOpen = useSelector(state => state.sideBar.status);
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userProfileData, setUserProfileData] = useState(null);
  
  //console.log("Auth Status:", { isLoggedIn, userData });
  
  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const response = await axiosAuth.get(`${server}/users/channelName/${searchQuery.trim()}`);

      if(response.data.success)
      {
        navigate(`/channel/${response.data.data.username}`, {
          state: {
            loggedInUser: userProfileData.username 
          }
        });
      }
      
    }

    setSearchQuery('');
  };

  const handleUpload = () => {
    if (isLoggedIn) {
      navigate('/upload');
    } else {
      navigate('/login');
    }
  };

  const handleProfile = () => {
    if (isLoggedIn) {
      if (userProfileData && userProfileData.username) {
        navigate(`/channel/${userProfileData.username}`);
        return;
      }
      
      if (userData && userData.username) {
        navigate(`/channel/${userData.username}`);
        return;
      }
      
      if (!loading) {
        getAvatar();
        navigate('/profile');
      } else {
        navigate('/profile');
      }
    } else {
      navigate('/login');
    }
  };

  const getAvatar = async () => {
    setLoading(true);
    setError(null);
    
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.warn('No access token found, cannot fetch avatar');
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.get(`${server}/users/current-user`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      });
      
      //console.log('User data response:', response.data);
      
      if (response.data?.data) {
        setUserProfileData(response.data.data);
        
        if (response.data.data.avatar) {
          setAvatar(response.data.data.avatar);
          //console.log('Avatar URL set:', response.data.data.avatar);
        } else {
          console.warn('No avatar found in user data');
          setAvatar(null);
        }
      } else {
        console.warn('No user data found in response');
        setUserProfileData(null);
        setAvatar(null);
      }
    } catch (err) {
      console.error('Error fetching avatar:', err);
      setError('Failed to load avatar');
      setAvatar(null);
      setUserProfileData(null);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (isLoggedIn) {
      getAvatar();
    }
  }, [isLoggedIn]);

  const toggleSidebar = () => {
    dispatch(toggleSideBar());
    sessionStorage.setItem("sidebarOpen", JSON.stringify(!sidebarOpen));
  };  
  
  return (
    <header className="fixed top-0 left-0 w-full bg-[#0f0f0f] text-white z-10 shadow-md">
      <div className="flex items-center justify-between px-4 py-2 h-14">
        {/* Left section: Logo and sidebar toggle */}
        <div className="flex items-center">
          <button 
            className="p-2 mr-2 rounded-full hover:bg-[#272727]"
            onClick={toggleSidebar}
          >
            <FaBars className="text-xl" />
          </button>
          
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            {/* Logo image */}
            <div className="h-8 w-auto mr-2">
              <img 
                src={videostreamer} 
                alt="Vironex Logo" 
                className="h-full w-auto object-contain"
              />
            </div>
            <span className="text-xl font-bold">ViroNex</span>
          </div>
        </div>

        {/* Center section: Search bar */}
        <div className="hidden sm:flex flex-1 max-w-2xl mx-4">
          <form onSubmit={handleSearch} className="flex w-full">
            <div className="relative flex flex-1">
              <input
                type="text"
                placeholder="Search by Channel Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 px-4 rounded-l-full border border-[#303030] bg-[#121212] focus:border-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2 bg-[#272727] border border-[#303030] rounded-r-full hover:bg-[#373737]"
              >
                <FaSearch />
              </button>
            </div>
          </form>
        </div>

        {/* Right section: Create and Profile/Auth */}
        <div className="flex items-center">
          {/* Mobile search icon */}
          <button className="p-2.5 sm:hidden rounded-full hover:bg-[#272727]">
            <FaSearch className="text-xl" />
          </button>
          
          <button 
            className="ml-2 p-2.5 rounded-full hover:bg-[#272727]" 
            onClick={handleUpload}
            title="Create"
          >
            <FaVideo className="text-xl" />
          </button>
          
          {isLoggedIn ? (
            <div 
              className="ml-4 cursor-pointer flex items-center"
              onClick={handleProfile}
            >
              {loading ? (
                // Show loading spinner while fetching avatar
                <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse"></div>
              ) : avatar ? (
                // Show avatar if available
                <div className="relative group">
                  <img 
                    src={avatar} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover border-2 border-[#ff3b5c]"
                  />
                  {error && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        getAvatar();
                      }}
                      className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                      title="Reload avatar"
                    >
                      !
                    </button>
                  )}
                </div>
              ) : (
                // Fallback to icon with refresh button if there was an error
                <div className="relative">
                  <FaUserCircle className="text-3xl text-gray-400" />
                  {error && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        getAvatar();
                      }}
                      className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                      title="Reload avatar"
                    >
                      !
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="ml-4 flex items-center border border-[#303030] rounded-full px-3 py-1.5 text-blue-500 hover:bg-[#222233]"
            >
              <FaUserCircle className="mr-2" />
              <span>Sign in</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile search bar - shown only on small screens */}
      <div className="sm:hidden px-4 pb-2">
        <form onSubmit={handleSearch} className="flex w-full">
          <div className="relative flex flex-1">
            <input
              type="text"
              placeholder="Search by Channel Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 px-4 rounded-l-full border border-[#303030] bg-[#121212] focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-5 py-2 bg-[#272727] border border-[#303030] rounded-r-full hover:bg-[#373737]"
            >
              <FaSearch />
            </button>
          </div>
        </form>
      </div>
    </header>
  );
};

export default Header;
