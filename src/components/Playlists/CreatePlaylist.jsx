import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosAuth } from "../../utils/axiosConfig";
import { server } from "../../constants";

const CreatePlaylist = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !description.trim()) {
      setError("Both name and description are required.");
      return;
    }

    setLoading(true);

    try {
      const res = await axiosAuth.post(
        `${server}/playlists/createPlaylist`,
        {
          name,
          description,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      setSuccess("Playlist created successfully!");

      setTimeout(() => {
        navigate("/playlists");
      }, 1200);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <div className="px-6 py-10 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Create Playlist</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-[#1e1e1e] p-6 rounded-xl shadow-md"
      >
        {/* Playlist Name */}
        <label className="text-gray-200 text-sm font-semibold">Name</label>
        <input
          type="text"
          className="w-full p-3 mt-1 mb-4 rounded-lg bg-[#2c2c2c] text-white border border-[#3f3f3f] outline-none focus:border-[#ff3b5c]"
          placeholder="My LoFi Playlist"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Playlist Description */}
        <label className="text-gray-200 text-sm font-semibold">
          Description
        </label>
        <textarea
          className="w-full p-3 mt-1 mb-4 rounded-lg bg-[#2c2c2c] text-white border border-[#3f3f3f] outline-none focus:border-[#ff3b5c]"
          placeholder="A playlist for chill vibes..."
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Error */}
        {error && (
          <div className="text-red-400 text-sm mb-3 bg-red-900/30 p-2 rounded">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="text-green-400 text-sm mb-3 bg-green-900/30 p-2 rounded">
            {success}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#ff3b5c] hover:bg-[#ff1f49] transition p-3 rounded-lg text-white font-semibold disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Playlist"}
        </button>
      </form>
    </div>
  );
};

export default CreatePlaylist;