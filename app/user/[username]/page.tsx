'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowBigDown, ArrowBigUp, MessageSquare, Share2, User, Calendar, Award } from "lucide-react"
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

interface UserProfile {
  username: string;
  karma: number;
  cakeDay: string;
  postCount: number;
  commentCount: number;
}

// Mock data
const USER_PROFILES: Record<string, UserProfile> = {
  techie123: {
    username: "techie123",
    karma: 1250,
    cakeDay: "January 15, 2021",
    postCount: 45,
    commentCount: 189
  },
  vimmaster: {
    username: "vimmaster",
    karma: 890,
    cakeDay: "March 22, 2020",
    postCount: 23,
    commentCount: 156
  },
  reactnewbie: {
    username: "reactnewbie",
    karma: 345,
    cakeDay: "September 8, 2023",
    postCount: 12,
    commentCount: 67
  }
};

const USER_POSTS: Record<string, Post[]> = {
  techie123: [
    {
      id: "1",
      title: "Just found this amazing programming tutorial",
      content: "Check out this awesome resource I found for learning TypeScript...",
      author: "techie123",
      votes: 142,
      commentCount: 23,
      clan: "programming",
      createdAt: "2 hours ago"
    }
  ],
  vimmaster: [
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
  reactnewbie: [
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

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;
  
  const userProfile = USER_PROFILES[username];
  const userPosts = USER_POSTS[username] || [];
  
  const [posts, setPosts] = useState(userPosts);
  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts');

  const handleVoteUpdate = (postId: string, newVotes: number) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, votes: newVotes } : post
    ));
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">User not found</h1>
              <p className="text-gray-600 mb-4">u/{username} doesn't exist or has been deleted.</p>
              <Link href="/">
                <Button>Browse Posts</Button>
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
              <h1 className="text-3xl font-bold mb-2">u/{userProfile.username}</h1>
              
              {/* Tabs */}
              <div className="flex gap-1 mb-4">
                <Button
                  variant={activeTab === 'posts' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('posts')}
                  size="sm"
                >
                  Posts ({userProfile.postCount})
                </Button>
                <Button
                  variant={activeTab === 'comments' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('comments')}
                  size="sm"
                >
                  Comments ({userProfile.commentCount})
                </Button>
              </div>
            </div>
            
            {activeTab === 'posts' ? (
              posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} onVoteUpdate={handleVoteUpdate} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500 text-lg mb-4">No posts yet</p>
                  </CardContent>
                </Card>
              )
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500 text-lg mb-4">Comments not implemented yet</p>
                  <p className="text-sm text-gray-400">This would show the user's comment history</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">u/{userProfile.username}</h2>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-orange-500" />
                    <div>
                      <div className="font-medium">{userProfile.karma.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Karma</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium">{userProfile.cakeDay}</div>
                      <div className="text-sm text-gray-500">Cake day</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{userProfile.postCount}</div>
                      <div className="text-sm text-gray-500">Posts</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{userProfile.commentCount}</div>
                      <div className="text-sm text-gray-500">Comments</div>
                    </div>
                  </div>
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
              Posted in{' '}
              <Link href={`/c/${post.clan}`} className="hover:underline">
                c/{post.clan}
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
  );
}