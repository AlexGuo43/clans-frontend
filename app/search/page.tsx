'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowBigDown, ArrowBigUp, MessageSquare, Share2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { votePost } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

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

// Mock data - in a real app this would come from search API
const ALL_POSTS: Post[] = [
  {
    id: "1",
    title: "Just found this amazing programming tutorial",
    content: "Check out this awesome resource I found for learning TypeScript...",
    author: "techie123",
    votes: 142,
    commentCount: 23,
    clan: "programming",
    createdAt: "2 hours ago"
  },
  {
    id: "2",
    title: "My experience switching to Neovim",
    content: "After 6 months of using Neovim, here are my thoughts...",
    author: "vimmaster",
    votes: 89,
    commentCount: 45,
    clan: "neovim",
    createdAt: "5 hours ago"
  },
  {
    id: "3",
    title: "Learning React: A Beginner's Guide",
    content: "Starting my React journey, here are the resources that helped me...",
    author: "reactnewbie",
    votes: 67,
    commentCount: 12,
    clan: "reactjs",
    createdAt: "1 day ago"
  }
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    // Filter posts based on search query
    if (query.trim()) {
      const filtered = ALL_POSTS.filter(post => 
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.content.toLowerCase().includes(query.toLowerCase()) ||
        post.clan.toLowerCase().includes(query.toLowerCase()) ||
        post.author.toLowerCase().includes(query.toLowerCase())
      );
      setPosts(filtered);
    } else {
      setPosts([]);
    }
  }, [query]);

  const handleVoteUpdate = (postId: string, newVotes: number) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, votes: newVotes } : post
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">
            Search Results {query && `for "${query}"`}
          </h1>
          <p className="text-gray-600">
            {posts.length} {posts.length === 1 ? 'result' : 'results'} found
          </p>
        </div>
        
        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onVoteUpdate={handleVoteUpdate} query={query} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500 text-lg mb-4">
                {query ? `No results found for "${query}"` : 'Enter a search term to find posts'}
              </p>
              <Link href="/">
                <Button>Browse All Posts</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function PostCard({ post, onVoteUpdate, query }: { 
  post: Post; 
  onVoteUpdate: (postId: string, newVotes: number) => void;
  query: string;
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
      await votePost(token, post.id, voteType);
      
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

  // Highlight search terms in text
  const highlightText = (text: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark>
      ) : part
    );
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
              Posted by u/{highlightText(post.author)} in c/{highlightText(post.clan)} • {post.createdAt}
            </div>
            <Link href={`/post/${post.id}`}>
              <h2 className="mb-2 text-xl font-semibold hover:text-blue-600 transition-colors cursor-pointer">
                {highlightText(post.title)}
              </h2>
            </Link>
            <p className="mb-4 text-gray-700">{highlightText(post.content)}</p>
            
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
  );
}