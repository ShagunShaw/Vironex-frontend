import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PlayListCard = ({ playlist }) => {
  const navigate = useNavigate();
  const [thumbnail, setThumbnail] = useState("/video streamer.png");

  const handleClick = () => {
    if (!playlist?._id) return;
    navigate(`/playlist/${playlist._id}`);
  };

  useEffect(() => {
    if (playlist?.thumbnail) {
      setThumbnail(playlist.thumbnail);
    } else {
      setThumbnail("/video streamer.png");
    }
  }, [playlist]);

  // Get video count
  const getVideoCount = () => {
    const count = playlist.videos?.length || 0;
    return `${count} ${count === 1 ? 'video' : 'videos'}`;
  };

  return (
    <div 
      className="cursor-pointer rounded-xl overflow-hidden bg-[#1f1f1f] hover:bg-[#2d2d2d] 
               transition-colors max-w-[280px] mx-auto"
      onClick={handleClick}
    >
      {/* Playlist Thumbnail */}
      <div className="relative">
        <img
          src= {thumbnail}
          alt={playlist?.name || "Playlist Thumbnail"}
          className="w-full aspect-[6/3] object-cover"
        />

        <div className="flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-3xl font-bold">{getVideoCount()}</div>
            <div className="text-sm opacity-50">VIEW ALL</div>
          </div>
        </div>
      </div>
      
      {/* Playlist Info */}
      <div className="p-3">
        <h3 className="text-white text-[30px] font-medium line-clamp-1">
          {playlist?.name || "Untitled Playlist"}
        </h3>

        {playlist.description && (
          <p className="text-white text-[15px] font-medium line-clamp-1">
            {playlist.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default PlayListCard;
