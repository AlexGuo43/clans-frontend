'use client';

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowBigDown, ArrowBigUp, MessageSquare, Share2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { votePost, getPosts } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { Sidebar } from "@/components/Sidebar"

interface Post {
  id: string
  title: string
  content: string
  author: string
  votes: number
  vote_score?: number // Backend might use this instead
  commentCount: number
  comment_count?: number // Backend might use this instead
  subreddit: string
  clan?: string // Backend uses this
  createdAt: string
  created_at?: string // Backend might use this format
}

// Mock data - in a real app this would come from your database
const MOCK_POSTS: Post[] = [
  {
    id: "1",
    title: "Just found this amazing programming tutorial",
    content: "Check out this awesome resource I found for learning TypeScript...",
    author: "techie123",
    votes: 142,
    commentCount: 23,
    subreddit: "programming",
    createdAt: "2 hours ago"
  },
  {
    id: "2",
    title: "My experience switching to Neovim",
    content: "After 6 months of using Neovim, here are my thoughts...",
    author: "vimmaster",
    votes: 89,
    commentCount: 45,
    subreddit: "neovim",
    createdAt: "5 hours ago"
  }
]

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top'>('hot');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Normalize post data from backend
  const normalizePost = (post: any): Post => ({
    id: post.id,
    title: post.title,
    content: post.content,
    author: post.author || post.author_id,
    votes: post.vote_score || post.votes || 0,
    commentCount: post.comment_count || post.commentCount || 0,
    subreddit: post.clan || post.subreddit || 'general',
    createdAt: post.created_at || post.createdAt || 'Unknown'
  });

  // Fetch posts from backend
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPosts();
        const normalizedPosts = Array.isArray(data) ? data.map(normalizePost) : [];
        setPosts(normalizedPosts);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
        // Fall back to mock data if API fails
        setPosts(MOCK_POSTS);
        toast({
          title: "Notice",
          description: "Using demo data - backend not available",
          variant: "default",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [toast]);

  const handleVoteUpdate = (postId: string, newVotes: number) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, votes: newVotes } : post
    ));
  };

  const sortedPosts = [...posts].sort((a, b) => {
    switch (sortBy) {
      case 'top':
        return b.votes - a.votes;
      case 'new':
        // For demo purposes, using votes as proxy for time
        return b.id.localeCompare(a.id);
      case 'hot':
      default:
        // Hot = combination of votes and recency (simplified)
        return (b.votes + b.commentCount) - (a.votes + a.commentCount);
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="hidden lg:block flex-shrink-0">
            <Sidebar />
          </div>
          
          {/* Main content */}
          <div className="flex-1 max-w-4xl">
            <div className="mb-8 flex items-center justify-between">
              <h1 className="text-2xl font-bold">Posts</h1>
              <Link href="/create-post">
                <Button>Create Post</Button>
              </Link>
            </div>
            
            {/* Sort buttons */}
            <div className="mb-6 flex gap-2">
              {(['hot', 'new', 'top'] as const).map((sort) => (
                <Button
                  key={sort}
                  variant={sortBy === sort ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy(sort)}
                  className="capitalize"
                >
                  {sort}
                </Button>
              ))}
            </div>
            
            <div className="space-y-4">
              {isLoading ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500">Loading posts...</p>
                  </CardContent>
                </Card>
              ) : sortedPosts.length > 0 ? (
                sortedPosts.map((post) => (
                  <PostCard key={post.id} post={post} onVoteUpdate={handleVoteUpdate} />
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500 text-lg mb-4">No posts yet</p>
                    <Link href="/create-post">
                      <Button>Create the first post!</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PostCard({ post, onVoteUpdate }: { 
  post: Post; 
  onVoteUpdate: (postId: string, newVotes: number) => void;
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
      const response = await votePost(token, post.id, voteType);
      
      // Update local state
      if (userVote === voteType) {
        // Remove vote
        setUserVote(null);
        onVoteUpdate(post.id, post.votes + (voteType === 'up' ? -1 : 1));
      } else {
        // Add/change vote
        const voteChange = userVote === null 
          ? (voteType === 'up' ? 1 : -1)
          : (voteType === 'up' ? 2 : -2);
        setUserVote(voteType);
        onVoteUpdate(post.id, post.votes + voteChange);
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
              Posted by{' '}
              <Link href={`/user/${post.author}`} className="hover:underline">
                u/{post.author}
              </Link>{' '}
              in{' '}
              <Link href={`/c/${post.subreddit}`} className="hover:underline">
                c/{post.subreddit}
              </Link>{' '}
              • {post.createdAt}
            </div>
            <Link href={`/post/${post.id}`}>
              <h2 className="mb-2 text-xl font-semibold hover:text-blue-600 transition-colors cursor-pointer">
                {post.title}
              </h2>
            </Link>
            <p className="mb-4 text-gray-700">{post.content}</p>
            
            {/* Action buttons */}
            <div className="flex gap-4">
              <Link href={`/post/${post.id}`}>
                <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                  <MessageSquare className="h-4 w-4" />
                  {post.commentCount} Comments
                </button>
              </Link>
              <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}