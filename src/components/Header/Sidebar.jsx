import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { server } from '../../constants';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSideBar } from '../../redux/sideBar';
import {
  FaHome,
  FaHistory,
  FaClock,
  FaThumbsUp,
  FaPlay,
  FaUserFriends,
  FaFire,
  FaGamepad,
  FaMusic,
  FaNewspaper,
  FaTrophy,
  FaLightbulb,
  FaTshirt,
  FaCog,
  FaFlag,
  FaQuestionCircle,
  FaExclamationTriangle,
  FaVideo
} from 'react-icons/fa';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const isOpen = useSelector(state => state.sideBar.status);
  const { status: isLoggedIn } = useSelector(state => state.auth);
  const [userProfileData, setUserProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const closeSidebar = () => {
    if (window.innerWidth < 1024) {
      dispatch(toggleSideBar());
    }
  };

  const isActive = (path) => {
    return location.pathname === path ? 'bg-[#272727]' : '';
  };

  const getUsername = async () => {
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
      } 
      else {
        console.warn('No user data found in response');
        setUserProfileData(null);
      }
    } 
    catch (err) {
      console.error('Error fetching username:', err);
      setUserProfileData(null);
    } 
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsername();
  }, []);

  const mainMenuItems = [
    { icon: <FaHome className="text-xl" />, label: 'Home', path: '/' },
    { icon: <FaFire className="text-xl" />, label: 'Trending', path: '/home?sort=trending' },
    { icon: <FaPlay className="text-xl" />, label: 'Subscriptions', path: '/subscriptions' },
  ];


  const libraryItems = [
    { icon: <FaVideo className="text-xl" />, label: 'Your Videos', path: `/channel/${userProfileData?.username}` },
    { icon: <FaHistory className="text-xl" />, label: 'History', path: '/watch-history' },
    { icon: <FaThumbsUp className="text-xl" />, label: 'Liked Videos', path: '/liked-videos' },
    { icon: <FaClock className="text-xl" />, label: 'Watch later', path: '/watch-later' },
    { icon: <FaPlay className="text-xl" />, label: 'Playlists', path: '/playlists' }
  ];


  const exploreItems = [
    { icon: <FaMusic className="text-xl" />, label: 'Music', path: '/music' },
    { icon: <FaGamepad className="text-xl" />, label: 'Gaming', path: '/gaming' },
    { icon: <FaNewspaper className="text-xl" />, label: 'News', path: '/news' },
    { icon: <FaTrophy className="text-xl" />, label: 'Sports', path: '/sports' },
    { icon: <FaLightbulb className="text-xl" />, label: 'Learning', path: '/learning' },
    { icon: <FaTshirt className="text-xl" />, label: 'Fashion', path: '/fashion' }
  ];


  const footerLinks = [
    { label: 'About', path: '/about' },
    { label: 'Press', path: '/press' },
    { label: 'Copyright', path: '/copyright' },
    { label: 'Contact', path: '/contact' },
    { label: 'Creators', path: '/creators' },
    { label: 'Advertise', path: '/advertise' },
    { label: 'Developers', path: '/developers' },
    { label: 'Terms', path: '/terms' },
    { label: 'Privacy', path: '/privacy' },
    { label: 'Policy & Safety', path: '/policy' },
    { label: 'How Vironex works', path: '/how-vironex-works' }
  ];


  const settingsItems = [
    { icon: <FaCog className="text-xl" />, label: 'Settings', path: '/settings' },
    { icon: <FaFlag className="text-xl" />, label: 'Report history', path: '/report-history' },
    { icon: <FaQuestionCircle className="text-xl" />, label: 'Help', path: '/help' },
    { icon: <FaExclamationTriangle className="text-xl" />, label: 'Send feedback', path: '/feedback' }
  ];


  const renderMenuItems = (items) => {
    return items.map((item, index) => (
      <div
        key={index}
        className={`flex items-center p-2 cursor-pointer hover:bg-[#272727] rounded-lg ${isActive(item.path)}`}
        onClick={() => {
          navigate(item.path);
          closeSidebar();
        }}
      >
        <div className="mr-4 text-lg">{item.icon}</div>
        {isOpen && <span className="text-sm">{item.label}</span>}
      </div>
    ));
  };


  if (!isOpen) {
    return (
      <aside className="fixed top-14 left-0 h-full bg-[#0f0f0f] text-white w-16 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 z-10 py-2">
        <div className="flex flex-col items-center">
          {mainMenuItems.map((item, index) => (
            <div
              key={index}
              className={`flex flex-col items-center justify-center p-3 cursor-pointer hover:bg-[#272727] rounded-lg w-12 h-12 mx-auto my-1 ${isActive(item.path)}`}
              onClick={() => {
                navigate(item.path);
                closeSidebar();
              }}
              title={item.label}
            >
              {item.icon}
            </div>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="fixed top-14 left-0 h-full bg-[#0f0f0f] text-white w-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 z-10 py-2">
      <div className="px-4">

        <div className="mb-4">
          {renderMenuItems(mainMenuItems)}
        </div>


        {isLoggedIn && (
          <>
            <div className="border-t border-[#272727] my-2 pt-2">
              <h3 className="font-medium px-2 py-1">Library</h3>
              {renderMenuItems(libraryItems)}
            </div>
          </>
        )}


        <div className="border-t border-[#272727] my-2 pt-2">
          <h3 className="font-medium px-2 py-1">Explore</h3>
          {renderMenuItems(exploreItems.slice(0, 3))}
        </div>


        <div className="border-t border-[#272727] my-2 pt-2">
          <h3 className="font-medium px-2 py-1">More from Vironex</h3>
          {renderMenuItems(settingsItems.slice(0, 2))}
        </div>


        <div className="border-t border-[#272727] my-2 pt-4 pb-8">
          <div className="flex flex-wrap text-xs text-gray-400">
            {footerLinks.slice(0, 6).map((link, index) => (
              <span key={index} className="mr-2 mb-2 hover:text-white cursor-pointer">
                {link.label}
              </span>
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-4">
            © 2025 Vironex
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
