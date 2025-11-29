import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { axiosAuth } from "../../utils/axiosConfig";
import { server } from "../../constants";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PlaylistDetails = () => {
  const navigate = useNavigate();
  const videoFileRef = useRef();
  const thumbnailRef = useRef();

  const { playlistId } = useParams();

  const [playlist, setPlaylist] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  
  // Upload form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  
  const [addingVideo, setAddingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");

  useEffect(() => {
    const fetchPlaylistDetails = async () => {
      try {
        // 1️⃣ Fetch playlist by ID
        const playlistRes = await axiosAuth.get(
          `${server}/playlists/getPlaylist/${playlistId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        const playlistData = playlistRes.data.data;
        setPlaylist(playlistData);

        // 2️⃣ If playlist has video IDs → fetch those videos
        if (playlistData.videos && playlistData.videos.length > 0) {
          const allVideos = [];

          for (const vid of playlistData.videos) {
            const videoRes = await axiosAuth.get(`${server}/videos/get-video/${vid}`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
            });

            allVideos.push(videoRes.data.data);
          }

          setVideos(allVideos);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Unable to load playlist.");
        setLoading(false);
      }
    };

    fetchPlaylistDetails();
  }, [playlistId]);

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      setAddError("Video file size should be less than 100MB");
      return;
    }

    const validTypes = ["video/mp4", "video/webm", "video/ogg"];
    if (!validTypes.includes(file.type)) {
      setAddError("Please select a valid video file (MP4, WebM, Ogg)");
      return;
    }

    setAddError("");
    const previewURL = URL.createObjectURL(file);
    setVideoPreview(previewURL);
    setVideoFile(file);
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setAddError("Thumbnail size should be less than 2MB");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setAddError("Please select a valid image (JPEG, PNG, WebP)");
      return;
    }

    setAddError("");
    const previewURL = URL.createObjectURL(file);
    setThumbnailPreview(previewURL);
    setThumbnail(file);
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    setAddError("");
    setAddSuccess("");

    if (!title.trim()) {
      setAddError("Title is required");
      return;
    }

    if (!description.trim()) {
      setAddError("Description is required");
      return;
    }

    if (!videoFile) {
      setAddError("Please select a video file");
      return;
    }

    if (!thumbnail) {
      setAddError("Please select a thumbnail");
      return;
    }

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setAddError("You must be logged in to upload videos");
      navigate("/login");
      return;
    }

    setAddingVideo(true);
    setUploadProgress(0);

    try {
      // Upload video directly to playlist
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("videoFile", videoFile);
      formData.append("thumbnail", thumbnail);

      const response = await axios.put(
        `${server}/playlists/${playlistId}/addVideoToPlaylist`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`,
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          },
        }
      );

      if (response.data.success) {
        setAddSuccess("Video uploaded and added to playlist successfully!");

        // Reset form
        setTitle("");
        setDescription("");
        setVideoFile(null);
        setThumbnail(null);
        setVideoPreview("");
        setThumbnailPreview("");
        setUploadProgress(0);

        // Refresh playlist data after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setAddError(response.data.message || "Failed to upload video");
      }
    } catch (err) {
      console.error(err);
      setAddError(
        err.response?.data?.message || "Failed to upload and add video."
      );
    }

    setAddingVideo(false);
  };

  return (
    <div className="px-6 py-8">
      {/* LOADING */}
      {loading && (
        <div className="flex justify-center py-10">
          <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-[#ff3b5c]" />
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="text-red-400 text-center text-lg py-8">{error}</div>
      )}

      {/* CONTENT */}
      {!loading && playlist && (
        <>
          <h1 className="text-3xl font-bold text-white">{playlist.name}</h1>
          <p className="text-gray-400 mt-1 mb-6">{playlist.description}</p>

          <h2 className="text-2xl font-semibold text-white mb-4">Videos</h2>

          {videos.length === 0 ? (
            <p className="text-gray-400">No videos found in this playlist.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {videos.map((video) => (
                <div
                  onClick={()=>navigate(`/watch/${video._id}`)}
                  key={video._id}
                  className="rounded-xl overflow-hidden bg-[#1f1f1f] hover:bg-[#292929] transition cursor-pointer"
                >
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full aspect-video object-cover"
                  />

                  <div className="p-3">
                    <h3 className="text-white font-medium line-clamp-1">
                      {video.title}
                    </h3>

                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                      {video.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Floating Add Video Button */}
      <button
        onClick={() => setShowAddVideoModal(true)}
        className="fixed bottom-6 right-6 bg-[#ff3b5c] hover:bg-[#ff1f49] hover:scale-105 active:scale-95
                  w-14 h-14 rounded-full flex items-center justify-center shadow-xl shadow-[#ff3b5c]/40
                  text-white text-5xl font-bold transition transform leading-[56px]"
      >
        +
      </button>

      {/* Add Video Modal */}
      {showAddVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 px-4 overflow-y-auto">
          <div className="bg-[#1e1e1e] rounded-xl p-6 max-w-2xl w-full my-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Upload Video to Playlist
            </h2>

            <form onSubmit={handleAddVideo}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left column: Video and Thumbnail uploads */}
                <div>
                  {/* Video File Upload */}
                  <label className="text-gray-200 text-sm font-semibold">
                    Video File *
                  </label>
                  {!videoFile ? (
                    <div
                      className="mt-1 mb-4 border-2 border-dashed border-[#3f3f3f] rounded-lg p-6 text-center cursor-pointer hover:border-[#ff3b5c] transition"
                      onClick={() => videoFileRef.current?.click()}
                    >
                      <p className="text-gray-400 text-sm">Click to select video</p>
                      <p className="text-gray-500 text-xs mt-1">MP4, WebM, Ogg (Max: 100MB)</p>
                    </div>
                  ) : (
                    <div className="mt-1 mb-4">
                      <video
                        src={videoPreview}
                        controls
                        className="w-full h-32 object-cover rounded-lg bg-black"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setVideoFile(null);
                          setVideoPreview("");
                          if (videoFileRef.current) videoFileRef.current.value = "";
                        }}
                        className="text-red-400 text-xs mt-1 hover:underline"
                      >
                        Remove video
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={videoFileRef}
                    onChange={handleVideoFileChange}
                    className="hidden"
                    accept="video/mp4,video/webm,video/ogg"
                  />

                  {/* Thumbnail Upload */}
                  <label className="text-gray-200 text-sm font-semibold">
                    Thumbnail *
                  </label>
                  {!thumbnail ? (
                    <div
                      className="mt-1 mb-4 border-2 border-dashed border-[#3f3f3f] rounded-lg p-6 text-center cursor-pointer hover:border-[#ff3b5c] transition"
                      onClick={() => thumbnailRef.current?.click()}
                    >
                      <p className="text-gray-400 text-sm">Click to select thumbnail</p>
                      <p className="text-gray-500 text-xs mt-1">JPEG, PNG, WebP (Max: 2MB)</p>
                    </div>
                  ) : (
                    <div className="mt-1 mb-4">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setThumbnail(null);
                          setThumbnailPreview("");
                          if (thumbnailRef.current) thumbnailRef.current.value = "";
                        }}
                        className="text-red-400 text-xs mt-1 hover:underline"
                      >
                        Remove thumbnail
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={thumbnailRef}
                    onChange={handleThumbnailChange}
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                  />
                </div>

                {/* Right column: Title and Description */}
                <div>
                  <label className="text-gray-200 text-sm font-semibold">
                    Title *
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 mt-1 mb-4 rounded-lg bg-[#2c2c2c] text-white border border-[#3f3f3f] outline-none focus:border-[#ff3b5c]"
                    placeholder="Enter video title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />

                  <label className="text-gray-200 text-sm font-semibold">
                    Description *
                  </label>
                  <textarea
                    className="w-full p-3 mt-1 mb-4 rounded-lg bg-[#2c2c2c] text-white border border-[#3f3f3f] outline-none focus:border-[#ff3b5c] min-h-[120px]"
                    placeholder="Enter video description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Upload Progress */}
              {uploadProgress > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-300 text-sm">Upload Progress</span>
                    <span className="text-gray-300 text-sm">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-[#ff3b5c] h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error */}
              {addError && (
                <div className="text-red-400 text-sm mb-3 bg-red-900/30 p-2 rounded">
                  {addError}
                </div>
              )}

              {/* Success */}
              {addSuccess && (
                <div className="text-green-400 text-sm mb-3 bg-green-900/30 p-2 rounded">
                  {addSuccess}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddVideoModal(false);
                    setTitle("");
                    setDescription("");
                    setVideoFile(null);
                    setThumbnail(null);
                    setVideoPreview("");
                    setThumbnailPreview("");
                    setAddError("");
                    setAddSuccess("");
                    setUploadProgress(0);
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 transition p-3 rounded-lg text-white font-semibold"
                  disabled={addingVideo}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingVideo}
                  className="flex-1 bg-[#ff3b5c] hover:bg-[#ff1f49] transition p-3 rounded-lg text-white font-semibold disabled:opacity-50"
                >
                  {addingVideo ? "Uploading..." : "Upload & Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistDetails;