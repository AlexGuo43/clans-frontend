'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getPost, getComments, createComment, votePost } from '@/lib/auth';
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
  commentCount: number;
  clan: string;
  createdAt: string;
}

interface Comment {
  id: string;
  content: string;
  author: string;
  votes: number;
  createdAt: string;
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
  
  const [post, setPost] = useState<Post | null>(MOCK_POST);
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  
  const { token, isAuthenticated } = useAuth();
  const { toast } = useToast();

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
      await createComment(token, postId, newComment.trim());
      
      // Add new comment to local state
      const newCommentObj: Comment = {
        id: Date.now().toString(),
        content: newComment.trim(),
        author: "You",
        votes: 0,
        createdAt: "Just now"
      };
      
      setComments(prev => [newCommentObj, ...prev]);
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

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Post not found</p>
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
            comments.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))
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

function CommentCard({ comment }: { comment: Comment }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="flex flex-col items-center gap-1">
            <button className="text-gray-400 hover:text-orange-500 transition-colors">
              <ArrowBigUp className="h-4 w-4" />
            </button>
            <span className="text-xs font-medium">{comment.votes}</span>
            <button className="text-gray-400 hover:text-blue-500 transition-colors">
              <ArrowBigDown className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex-1">
            <div className="mb-1 text-sm text-gray-500">
              u/{comment.author} • {comment.createdAt}
            </div>
            <p className="text-gray-700">{comment.content}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}