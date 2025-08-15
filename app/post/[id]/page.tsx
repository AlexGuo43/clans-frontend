'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getPost, getComments, createComment, createReply, votePost, voteComment } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowBigDown, ArrowBigUp, MessageSquare, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  votes: number;
  vote_score?: number;
  commentCount: number;
  comment_count?: number;
  clan: string;
  subreddit?: string;
  createdAt: string;
  created_at?: string;
  author_id?: string;
}

interface Comment {
  id: string;
  content: string;
  author: string;
  author_id?: string;
  username?: string;
  votes: number;
  vote_score?: number;
  vote_count?: number;
  createdAt: string;
  created_at?: string;
  postId?: string;
  post_id?: string;
  replies?: Comment[];
  reply_count?: number;
  parent_id?: string;
}

// Mock data for now
const MOCK_POST: Post = {
  id: "1",
  title: "Just found this amazing programming tutorial",
  content: "Check out this awesome resource I found for learning TypeScript. It covers all the basics and advanced topics with practical examples. I've been working through it for the past week and it's been incredibly helpful for understanding the type system and how to apply it in real-world projects.",
  author: "techie123",
  votes: 142,
  commentCount: 23,
  clan: "programming",
  createdAt: "2 hours ago"
};

const MOCK_COMMENTS: Comment[] = [
  {
    id: "c1",
    content: "Thanks for sharing this! I've been looking for a good TypeScript resource.",
    author: "developer456",
    votes: 12,
    createdAt: "1 hour ago"
  },
  {
    id: "c2",
    content: "This tutorial helped me land my first TypeScript job. Highly recommend!",
    author: "jobseeker789",
    votes: 8,
    createdAt: "45 minutes ago"
  }
];

export default function PostPage() {
  const params = useParams();
  const postId = params.id as string;
  
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  
  const { token, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Normalize post data from backend
  const normalizePost = (post: any): Post => ({
    id: post.id,
    title: post.title,
    content: post.content,
    author: post.author || post.author_id || 'Unknown',
    votes: post.vote_score || post.votes || 0,
    commentCount: post.comment_count || post.commentCount || 0,
    clan: post.clan || post.subreddit || 'general',
    createdAt: post.created_at || post.createdAt || 'Unknown'
  });

  // Normalize comment data from backend
  const normalizeComment = (comment: any): Comment => ({
    id: comment.id,
    content: comment.content,
    author: comment.author || comment.username || comment.author_id || 'Unknown',
    votes: comment.vote_score || comment.vote_count || comment.votes || 0,
    createdAt: comment.created_at || comment.createdAt || 'Unknown',
    replies: comment.replies ? comment.replies.map(normalizeComment) : [],
    reply_count: comment.reply_count || (comment.replies ? comment.replies.length : 0),
    parent_id: comment.parent_id
  });

  // Fetch post and comments on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch post
        const postData = await getPost(postId);
        console.log('Raw post data from backend:', postData);
        const normalizedPost = normalizePost(postData);
        console.log('Normalized post:', normalizedPost);
        console.log('URL postId:', postId, 'Post DB ID:', normalizedPost.id);
        setPost(normalizedPost);

        // Fetch comments
        try {
          const commentsData = await getComments(postId);
          const normalizedComments = Array.isArray(commentsData) 
            ? commentsData.map(normalizeComment) 
            : [];
          setComments(normalizedComments);
        } catch (commentError) {
          console.log('Comments service error:', commentError);
          setComments([]); // Start with empty comments if service fails
        }
        
      } catch (error) {
        console.error('Failed to fetch post:', error);
        toast({
          title: "Error",
          description: "Failed to load post",
          variant: "destructive",
        });
        // Don't fallback to mock for posts since we want to show real data
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [postId, toast]);

  const handleCommentVoteUpdate = (commentId: string, newVotes: number) => {
    setComments(comments.map(comment => 
      comment.id === commentId ? { ...comment, votes: newVotes } : comment
    ));
  };

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!isAuthenticated || !token || !post) {
      toast({
        title: "Login required",
        description: "You must be logged in to vote",
        variant: "destructive",
      });
      return;
    }

    if (isVoting) return;

    setIsVoting(true);
    
    try {
      await votePost(token, post.id, voteType);
      
      // Update local state
      if (userVote === voteType) {
        // Remove vote
        setUserVote(null);
        setPost(prev => prev ? { ...prev, votes: prev.votes + (voteType === 'up' ? -1 : 1) } : null);
      } else {
        // Add/change vote
        const voteChange = userVote === null 
          ? (voteType === 'up' ? 1 : -1)
          : (voteType === 'up' ? 2 : -2);
        setUserVote(voteType);
        setPost(prev => prev ? { ...prev, votes: prev.votes + voteChange } : null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to vote",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Comment cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (!isAuthenticated || !token) {
      toast({
        title: "Login required",
        description: "You must be logged in to comment",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Use the actual post database ID, not the URL parameter
      const actualPostId = post?.id || postId;
      console.log('Creating comment with postId:', actualPostId, 'URL param was:', postId);
      const createdComment = await createComment(token, actualPostId, newComment.trim());
      
      // Refresh comments to get the latest data
      try {
        const commentsData = await getComments(actualPostId);
        const normalizedComments = Array.isArray(commentsData) 
          ? commentsData.map(normalizeComment) 
          : [];
        setComments(normalizedComments);
      } catch (refreshError) {
        // If refresh fails, add comment locally
        const newCommentObj: Comment = {
          id: createdComment.id || Date.now().toString(),
          content: newComment.trim(),
          author: "You",
          votes: 0,
          createdAt: "Just now"
        };
        setComments(prev => [newCommentObj, ...prev]);
      }
      
      setNewComment('');
      
      if (post) {
        setPost(prev => prev ? { ...prev, commentCount: prev.commentCount + 1 } : null);
      }
      
      toast({
        title: "Success",
        description: "Comment posted!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Loading post...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Post not found</h1>
            <p className="text-gray-600 mb-4">This post may have been deleted or doesn't exist.</p>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-4">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to posts
          </Link>
        </div>
        
        {/* Post */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4">
              {/* Vote buttons */}
              <div className="flex flex-col items-center gap-1">
                <button 
                  className={`text-gray-500 hover:text-orange-500 transition-colors ${
                    userVote === 'up' ? 'text-orange-500' : ''
                  } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => handleVote('up')}
                  disabled={isVoting}
                >
                  <ArrowBigUp className="h-6 w-6" />
                </button>
                <span className="text-sm font-medium">{post.votes}</span>
                <button 
                  className={`text-gray-500 hover:text-blue-500 transition-colors ${
                    userVote === 'down' ? 'text-blue-500' : ''
                  } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => handleVote('down')}
                  disabled={isVoting}
                >
                  <ArrowBigDown className="h-6 w-6" />
                </button>
              </div>
              
              {/* Post content */}
              <div className="flex-1">
                <div className="mb-1 text-sm text-gray-500">
                  Posted by u/{post.author} in c/{post.clan} • {post.createdAt}
                </div>
                <h1 className="mb-4 text-2xl font-bold">{post.title}</h1>
                <div className="mb-4 text-gray-700 whitespace-pre-wrap">{post.content}</div>
                
                {/* Action buttons */}
                <div className="flex gap-4">
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <MessageSquare className="h-4 w-4" />
                    {post.commentCount} Comments
                  </span>
                  <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comment form */}
        {isAuthenticated ? (
          <Card className="mb-6">
            <CardContent className="p-6">
              <form onSubmit={handleSubmitComment}>
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={isSubmitting}
                  rows={3}
                  className="mb-4"
                />
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !newComment.trim()}
                >
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6">
            <CardContent className="p-6 text-center">
              <p className="text-gray-500 mb-4">Log in to join the discussion</p>
              <Link href="/login">
                <Button>Login</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Comments */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Comments</h2>
          {comments.length > 0 ? (
            <CommentThread 
              comments={comments} 
              depth={0}
              postId={post.id}
              onVoteUpdate={handleCommentVoteUpdate}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              onReplySubmit={() => {
                // Refresh comments after reply
                const fetchComments = async () => {
                  try {
                    const actualPostId = post?.id || postId;
                    const commentsData = await getComments(actualPostId);
                    const normalizedComments = Array.isArray(commentsData) 
                      ? commentsData.map(normalizeComment) 
                      : [];
                    setComments(normalizedComments);
                  } catch (error) {
                    console.log('Failed to refresh comments:', error);
                  }
                };
                fetchComments();
                setReplyingTo(null);
              }}
            />
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                No comments yet. Be the first to comment!
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function CommentThread({ 
  comments, 
  depth, 
  postId, 
  onVoteUpdate, 
  replyingTo, 
  setReplyingTo, 
  onReplySubmit 
}: { 
  comments: Comment[];
  depth: number;
  postId: string;
  onVoteUpdate: (commentId: string, newVotes: number) => void;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  onReplySubmit: () => void;
}) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className={depth > 0 ? 'ml-6 border-l-2 border-gray-200 pl-4' : ''}>
          <CommentCard 
            comment={comment}
            onVoteUpdate={onVoteUpdate}
            onReply={(commentId) => setReplyingTo(commentId)}
            isReplying={replyingTo === comment.id}
            onCancelReply={() => setReplyingTo(null)}
            postId={postId}
            onReplySubmit={onReplySubmit}
          />
          
          {/* Render replies recursively - they will be indented by the parent div */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3">
              <CommentThread
                comments={comment.replies}
                depth={depth + 1}
                postId={postId}
                onVoteUpdate={onVoteUpdate}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                onReplySubmit={onReplySubmit}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function CommentCard({ 
  comment, 
  onVoteUpdate, 
  onReply, 
  isReplying, 
  onCancelReply, 
  postId, 
  onReplySubmit 
}: { 
  comment: Comment;
  onVoteUpdate: (commentId: string, newVotes: number) => void;
  onReply: (commentId: string) => void;
  isReplying: boolean;
  onCancelReply: () => void;
  postId: string;
  onReplySubmit: () => void;
}) {
  const { token, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isVoting, setIsVoting] = useState(false);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!isAuthenticated || !token) {
      toast({
        title: "Login required",
        description: "You must be logged in to vote",
        variant: "destructive",
      });
      return;
    }

    if (isVoting) return;

    setIsVoting(true);
    
    try {
      await voteComment(token, comment.id, voteType);
      
      // Update local state
      if (userVote === voteType) {
        // Remove vote
        setUserVote(null);
        onVoteUpdate(comment.id, comment.votes + (voteType === 'up' ? -1 : 1));
      } else {
        // Add/change vote
        const voteChange = userVote === null 
          ? (voteType === 'up' ? 1 : -1)
          : (voteType === 'up' ? 2 : -2);
        setUserVote(voteType);
        onVoteUpdate(comment.id, comment.votes + voteChange);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to vote",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="flex flex-col items-center gap-1">
            <button 
              className={`text-gray-400 hover:text-orange-500 transition-colors ${
                userVote === 'up' ? 'text-orange-500' : ''
              } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleVote('up')}
              disabled={isVoting}
            >
              <ArrowBigUp className="h-4 w-4" />
            </button>
            <span className="text-xs font-medium">{comment.votes}</span>
            <button 
              className={`text-gray-400 hover:text-blue-500 transition-colors ${
                userVote === 'down' ? 'text-blue-500' : ''
              } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleVote('down')}
              disabled={isVoting}
            >
              <ArrowBigDown className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex-1">
            <div className="mb-1 text-sm text-gray-500">
              u/{comment.author} • {comment.createdAt}
            </div>
            <p className="text-gray-700 mb-2">{comment.content}</p>
            
            {/* Reply button */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {isAuthenticated && (
                <button 
                  className="hover:text-gray-700 transition-colors"
                  onClick={() => onReply(comment.id)}
                >
                  Reply {comment.reply_count ? `(${comment.reply_count})` : ''}
                </button>
              )}
            </div>

            {/* Reply form */}
            {isReplying && (
              <div className="mt-3">
                <ReplyForm 
                  postId={postId}
                  parentId={comment.id}
                  onReplySubmit={onReplySubmit}
                  onCancel={onCancelReply}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ReplyForm({ postId, parentId, onReplySubmit, onCancel }: {
  postId: string;
  parentId: string;
  onReplySubmit: () => void;
  onCancel: () => void;
}) {
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!replyContent.trim()) {
      toast({
        title: "Error",
        description: "Reply cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (!isAuthenticated || !token) {
      toast({
        title: "Login required",
        description: "You must be logged in to reply",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createReply(token, postId, parentId, replyContent.trim());
      
      toast({
        title: "Success",
        description: "Reply posted!",
      });
      
      setReplyContent('');
      onReplySubmit(); // Refresh comments and close form
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post reply",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-gray-50">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit}>
          <Textarea
            placeholder="Write a reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            disabled={isSubmitting}
            rows={3}
            className="mb-3 text-sm"
          />
          <div className="flex gap-2">
            <Button 
              type="submit" 
              size="sm"
              disabled={isSubmitting || !replyContent.trim()}
            >
              {isSubmitting ? 'Posting...' : 'Reply'}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}