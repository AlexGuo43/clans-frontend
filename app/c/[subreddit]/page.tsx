'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowBigDown, ArrowBigUp, MessageSquare, Share2, Users, Calendar } from "lucide-react"
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

interface Clan {
  name: string;
  description: string;
  memberCount: number;
  createdAt: string;
}

// Mock data
const CLANS: Record<string, Clan> = {
  programming: {
    name: "programming",
    description: "Computer Programming",
    memberCount: 4567890,
    createdAt: "Jan 2008"
  },
  neovim: {
    name: "neovim",
    description: "Neovim is a project that seeks to aggressively refactor Vim",
    memberCount: 89234,
    createdAt: "Mar 2015"
  },
  reactjs: {
    name: "reactjs",
    description: "A JavaScript library for building user interfaces",
    memberCount: 234567,
    createdAt: "Jun 2014"
  }
};

const POSTS_BY_CLAN: Record<string, Post[]> = {
  programming: [
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
      id: "4",
      title: "Best practices for code reviews",
      content: "After working at several companies, here's what I've learned about effective code reviews...",
      author: "seniordev",
      votes: 89,
      commentCount: 34,
      clan: "programming",
      createdAt: "6 hours ago"
    }
  ],
  neovim: [
    {
      id: "2",
      title: "My experience switching to Neovim",
      content: "After 6 months of using Neovim, here are my thoughts...",
      author: "vimmaster",
      votes: 89,
      commentCount: 45,
      clan: "neovim",
      createdAt: "5 hours ago"
    }
  ],
  reactjs: [
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
  ]
};

export default function ClanPage() {
  const params = useParams();
  const clanName = params.subreddit as string;
  
  const clan = CLANS[clanName];
  const posts = POSTS_BY_CLAN[clanName] || [];
  
  const [postsState, setPostsState] = useState(posts);
  const [isJoined, setIsJoined] = useState(false);

  const handleVoteUpdate = (postId: string, newVotes: number) => {
    setPostsState(postsState.map(post => 
      post.id === postId ? { ...post, votes: newVotes } : post
    ));
  };

  if (!clan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">Clan not found</h1>
              <p className="text-gray-600 mb-4">c/{clanName} doesn't exist or has been removed.</p>
              <Link href="/">
                <Button>Browse All Posts</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">c/{clan.name}</h1>
              <div className="flex gap-4 items-center">
                <Link href={`/create-post?clan=${clan.name}`}>
                  <Button>Create Post</Button>
                </Link>
                <Button 
                  variant={isJoined ? "outline" : "default"}
                  onClick={() => setIsJoined(!isJoined)}
                >
                  {isJoined ? "Joined" : "Join"}
                </Button>
              </div>
            </div>
            
            {postsState.length > 0 ? (
              <div className="space-y-4">
                {postsState.map((post) => (
                  <PostCard key={post.id} post={post} onVoteUpdate={handleVoteUpdate} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500 text-lg mb-4">No posts in this community yet</p>
                  <Link href={`/create-post?clan=${clan.name}`}>
                    <Button>Be the first to post!</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">About Clan</h2>
                <p className="text-gray-700 mb-4">{clan.description}</p>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>{clan.memberCount.toLocaleString()} members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Created {clan.createdAt}</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <Button 
                    className="w-full mb-3"
                    variant={isJoined ? "outline" : "default"}
                    onClick={() => setIsJoined(!isJoined)}
                  >
                    {isJoined ? "Joined" : "Join c/" + clan.name}
                  </Button>
                  <Link href={`/create-post?clan=${clan.name}`}>
                    <Button variant="outline" className="w-full">
                      Create Post
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
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
              Posted by u/{post.author} • {post.createdAt}
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
  );
}