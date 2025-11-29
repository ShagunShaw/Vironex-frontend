import React, { useState, useEffect } from 'react';
import { axiosAuth } from '../../utils/axiosConfig';
import { server } from '../../constants';
import PlayListCard from './PlayListCard';
import { useNavigate } from 'react-router-dom';

const PlaylistGrid = () => {
  const navigate=useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlaylists = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        // Get the current user ID first
        const userResponse = await axiosAuth.get(`${server}/users/current-user`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        const userId = userResponse.data.data._id;
        
        // Then fetch the user's playlists
        const res = await axiosAuth.get(`${server}/playlists/getAllPlaylistsOfUser/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        const fetchedData = res.data.data;
        
        setPlaylists(fetchedData || []);
        setPagination(fetchedData.pagination);

        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching playlists:', err);
        setError('Could not load playlists. Please try again later.');
        setIsLoading(false);
      }
    };
    
    fetchPlaylists();
  }, []);

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Your Playlists</h1>
      
      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff3b5c]"></div>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="text-red-500 text-center py-8">
          {error}
        </div>
      )}
      
      {/* Playlists Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {playlists.length > 0 ? (
            playlists.map((playlist) => (
              <PlayListCard key={playlist._id} playlist={playlist} />
            ))
          ) : (
            <div className="text-gray-500 col-span-full text-center py-8">
              No playlists found. Create your first playlist!
            </div>
          )}
        </div>
      )}
      <button
      onClick={() => navigate("/create-playlist")}
      className="fixed bottom-6 right-6 bg-[#ff3b5c] hover:bg-[#ff1f49] hover:scale-105 active:scale-95
                w-14 h-14 rounded-full flex items-center justify-center shadow-xl shadow-[#ff3b5c]/40
                text-white text-5xl font-bold transition transform leading-[56px]"
    >
      +
    </button>

      {/* Pagination debug (optional) */}
      {/* {pagination && <pre>{JSON.stringify(pagination, null, 2)}</pre>} */}
    </div>
  );
};

export default PlaylistGrid;
