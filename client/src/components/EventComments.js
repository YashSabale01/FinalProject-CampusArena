import React, { useState, useEffect, useCallback } from 'react';
import { commentsAPI } from '../api/axiosInstance';

const EventComments = ({ eventId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyText, setReplyText] = useState({});
  const [showReply, setShowReply] = useState({});

  const loadComments = useCallback(async () => {
    try {
      const response = await commentsAPI.getByEvent(eventId);
      setComments(response.comments || []);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  }, [eventId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const submitComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      await commentsAPI.create(eventId, { text: newComment });
      setNewComment('');
      loadComments();
    } catch (error) {
      alert('Failed to post comment');
    }
  };

  const toggleLike = async (commentId) => {
    try {
      await commentsAPI.like(commentId);
      loadComments();
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const submitReply = async (commentId) => {
    const text = replyText[commentId];
    if (!text?.trim()) return;

    try {
      await commentsAPI.reply(commentId, { text });
      setReplyText({ ...replyText, [commentId]: '' });
      setShowReply({ ...showReply, [commentId]: false });
      loadComments();
    } catch (error) {
      alert('Failed to post reply');
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Discussion ({comments.length})</h3>
      
      <div className="mb-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full border rounded px-3 py-2 h-20"
          placeholder="Join the discussion..."
          maxLength={300}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-500">{newComment.length}/300</span>
          <button
            onClick={submitComment}
            disabled={!newComment.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            💬 Comment
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment._id} className="bg-white p-4 rounded-lg border">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {comment.user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium">{comment.user.username}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 mb-2">{comment.text}</p>
                
                <div className="flex items-center space-x-4 text-sm">
                  <button
                    onClick={() => toggleLike(comment._id)}
                    className="text-gray-500 hover:text-blue-600"
                  >
                    👍 {comment.likes?.length || 0}
                  </button>
                  <button
                    onClick={() => setShowReply({
                      ...showReply,
                      [comment._id]: !showReply[comment._id]
                    })}
                    className="text-gray-500 hover:text-blue-600"
                  >
                    💬 Reply
                  </button>
                </div>

                {showReply[comment._id] && (
                  <div className="mt-3">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={replyText[comment._id] || ''}
                        onChange={(e) => setReplyText({
                          ...replyText,
                          [comment._id]: e.target.value
                        })}
                        className="flex-1 border rounded px-3 py-1 text-sm"
                        placeholder="Write a reply..."
                        maxLength={200}
                      />
                      <button
                        onClick={() => submitReply(comment._id)}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                )}

                {comment.replies?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {comment.replies.map((reply, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded ml-4">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">{reply.user.username}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(reply.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{reply.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {comments.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            No comments yet. Start the discussion!
          </p>
        )}
      </div>
    </div>
  );
};

export default EventComments;