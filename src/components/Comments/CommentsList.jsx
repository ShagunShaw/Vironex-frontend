import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { server } from '../../constants';
import { axiosAuth } from '../../utils/axiosConfig'; // Make sure this import is correct
import CommentCard from './CommentCard';
import AddComment from './AddComment';
import { FaCommentAlt, FaSort } from 'react-icons/fa';

const CommentsList = ({ videoId }) => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [commentCount, setCommentCount] = useState(0);
  const [sortOption, setSortOption] = useState('newest'); // 'newest' or 'popular'
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Function to fetch comments
  const fetchComments = useCallback(async (reset = false) => {
    const currentPage = reset ? 1 : page;

    // Prevent duplicate fetches
    if (reset && isLoading) return;
    if (!reset && (isLoading || isFetchingMore)) return;

    const loadingState = reset ? setIsLoading : setIsFetchingMore;
    loadingState(true);
    setError('');

    if (reset) {
      setPage(1);
      setComments([]);
      setHasMore(true);
    }

    try {
      // Use the imported axiosAuth instance directly
      const response = await axiosAuth.get(`/comments/getComments/${videoId}`);
      const commentCount = response.data.data.comments.length;

      // Get the main data object
      const data = response.data.data;
      
      // Get the pagination details (if they exist)
      const pagination = data.pagination || {};

      // Use the correct key 'comments' for the array
      const newComments = data.comments || []; 
      
      // Use the correct key 'totalComments' for the count
      setCommentCount(commentCount || 0);

      // Update comments state (this part was correct)
      if (reset) {
        setComments(newComments);
      } else {
        setComments(prevComments => [...prevComments, ...newComments]);
      }

      // Use the correct key 'totalPages' from pagination object
      setHasMore(currentPage < pagination.totalPages);

      // Increment page for next fetch
      setPage(prevPage => prevPage + 1);

    } catch (err) {
      console.error('Error fetching comments:', err);
      
      if (err.response?.status === 401) {
        setError('Please log in to view comments.');
      } else {
        setError('Could not load comments. Please try again later.');
      }
    } finally {
      loadingState(false);
    }
    // *** FIX 2: Correct dependencies for useCallback ***
  }, [videoId, sortOption, page, isLoading, isFetchingMore]); // page, isLoading, isFetchingMore are needed to prevent race conditions

  // Initial load of comments
  useEffect(() => {
    // *** FIX 3: Correct dependencies for useEffect ***
    // We want this to re-run ONLY when videoId or sortOption changes
    fetchComments(true); 
  }, [videoId, sortOption]); // 'fetchComments' is too unstable, so we call it directly and list its stable dependencies

  // Handle adding a new comment
  const handleAddComment = (newComment) => {
    setComments(prevComments => [newComment, ...prevComments]);
    setCommentCount(prevCount => prevCount + 1);
  };

  // Handle comment deletion
  const handleDeleteComment = (commentId) => {
    setComments(prevComments =>
      prevComments.filter(comment => comment._id !== commentId)
    );
    setCommentCount(prevCount => Math.max(0, prevCount - 1));
  };

  // Load more comments
  const loadMoreComments = () => {
    if (!isFetchingMore && hasMore) {
      fetchComments(false); // 'false' means we are appending, not resetting
    }
  };

  // Toggle sort option
  const toggleSortOption = () => {
    const newSortOption = sortOption === 'newest' ? 'popular' : 'newest';
    setSortOption(newSortOption);
    // The useEffect above will automatically refetch when sortOption changes
  };

  return (
    <div className="comments-section my-8">
      {/* Comments header with count and sort */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FaCommentAlt className="mr-2 text-gray-400" />
          <h3 className="text-lg font-medium">
            {commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}
          </h3>
        </div>
        
        <button
          className="flex items-center text-gray-400 hover:text-white"
          onClick={toggleSortOption}
        >
          <FaSort className="mr-1" />
          <span>Sort by: {sortOption === 'newest' ? 'Newest' : 'Top comments'}</span>
        </button>
      </div>
      
      {/* Add comment form */}
      <div className="mb-8">
        <AddComment videoId={videoId} onCommentAdded={handleAddComment} />
      </div>
      
      {/* Loading state for initial load */}
      {isLoading && (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#ff3b5c]"></div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="text-red-500 text-center py-4">
          No comments in this video. Be the first to comment!
        </div>
      )}
      
      {/* Comments list */}
      {!isLoading && comments.length > 0 && (
        <div className="space-y-6">
          {comments.map(comment => (
            <CommentCard
              key={comment._id}
              comment={comment}
              onDelete={() => handleDeleteComment(comment._id)}
            />
          ))}
          
          {/* Load more button */}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={loadMoreComments}
                disabled={isFetchingMore}
                className={`px-4 py-2 rounded-full ${
                  isFetchingMore
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                {isFetchingMore ? (
                  <span className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-white rounded-full animate-spin mr-2"></div>
                    Loading...
                  </span>
                ) : (
                  'Load more comments'
                )}
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* No comments */}
      {!isLoading && !error && comments.length === 0 && (
        <div className="text-center py-6 text-gray-400">
          No comments yet. Be the first to comment!
        </div>
      )}
    </div>
  );
};

export default CommentsList;