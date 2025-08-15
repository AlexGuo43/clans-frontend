'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowBigDown, ArrowBigUp, MessageSquare, Share2, Users, Calendar } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { votePost, getClanByName, getClanMembershipStatus, joinClan, leaveClan, getPosts } from "@/lib/auth"
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
  id: string;
  name: string;
  displayName?: string;
  display_name?: string;
  description: string;
  memberCount: number;
  member_count?: number;
  createdAt: string;
  created_at?: string;
}


export default function ClanPage() {
  const params = useParams();
  const clanName = params.subreddit as string;
  
  const [clan, setClan] = useState<Clan | null>(null);
  const [postsState, setPostsState] = useState<Post[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  
  const { token, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Normalize clan data from backend
  const normalizeClan = (clanData: any): Clan => ({
    id: clanData.id,
    name: clanData.name,
    displayName: clanData.display_name || clanData.displayName || clanData.name,
    description: clanData.description || '',
    memberCount: clanData.member_count || clanData.memberCount || 0,
    createdAt: clanData.created_at || clanData.createdAt || 'Unknown'
  });

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

  // Fetch clan data and posts
  useEffect(() => {
    const fetchClanData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch clan info
        const clanData = await getClanByName(clanName);
        const normalizedClan = normalizeClan(clanData);
        setClan(normalizedClan);

        // Fetch membership status if authenticated
        if (isAuthenticated && token) {
          try {
            const membershipStatus = await getClanMembershipStatus(token, normalizedClan.id);
            setIsJoined(!!membershipStatus.isMember || !!membershipStatus.is_member);
          } catch (membershipError) {
            console.log('Membership status not available:', membershipError);
            setIsJoined(false);
          }
        }

        // Fetch posts for this clan - for now we'll fetch all posts and filter
        // Later you might want to add a backend endpoint like /api/posts?clan=clanName
        try {
          const allPosts = await getPosts();
          const clanPosts = Array.isArray(allPosts) 
            ? allPosts.filter(post => {
                const postClan = post.clan || post.subreddit;
                return postClan === clanName;
              }).map(normalizePost)
            : [];
          setPostsState(clanPosts);
        } catch (postsError) {
          console.log('Posts not available:', postsError);
          setPostsState([]);
        }
        
      } catch (error) {
        console.error('Failed to fetch clan:', error);
        toast({
          title: "Error",
          description: "Failed to load clan information",
          variant: "destructive",
        });
        setClan(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClanData();
  }, [clanName, isAuthenticated, token, toast]);

  const handleVoteUpdate = (postId: string, newVotes: number) => {
    setPostsState(postsState.map(post => 
      post.id === postId ? { ...post, votes: newVotes } : post
    ));
  };

  const handleJoinLeave = async () => {
    if (!isAuthenticated || !token || !clan) {
      toast({
        title: "Login required",
        description: "You must be logged in to join clans",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);
    
    try {
      if (isJoined) {
        await leaveClan(token, clan.id);
        setIsJoined(false);
        toast({
          title: "Left clan",
          description: `You left c/${clan.name}`,
        });
      } else {
        await joinClan(token, clan.id);
        setIsJoined(true);
        toast({
          title: "Joined clan",
          description: `You joined c/${clan.name}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update membership",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Loading clan...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
                  onClick={handleJoinLeave}
                  disabled={isJoining}
                >
                  {isJoining ? "..." : (isJoined ? "Joined" : "Join")}
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
                    onClick={handleJoinLeave}
                    disabled={isJoining}
                  >
                    {isJoining ? "..." : (isJoined ? "Joined" : "Join c/" + clan.name)}
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