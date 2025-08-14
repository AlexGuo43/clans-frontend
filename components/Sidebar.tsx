'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, Home, TrendingUp, Clock, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Clan {
  name: string;
  displayName: string;
  memberCount: number;
  description: string;
  isJoined?: boolean;
}

const POPULAR_CLANS: Clan[] = [
  {
    name: 'programming',
    displayName: 'Programming',
    memberCount: 4567890,
    description: 'Computer Programming Discussion',
    isJoined: false
  },
  {
    name: 'webdev',
    displayName: 'Web Development',
    memberCount: 1234567,
    description: 'Web Development Community',
    isJoined: false
  },
  {
    name: 'javascript',
    displayName: 'JavaScript',
    memberCount: 2345678,
    description: 'JavaScript Programming',
    isJoined: true
  },
  {
    name: 'react',
    displayName: 'React',
    memberCount: 1876543,
    description: 'React.js Community',
    isJoined: true
  },
  {
    name: 'python',
    displayName: 'Python',
    memberCount: 3456789,
    description: 'Python Programming',
    isJoined: false
  },
  {
    name: 'nextjs',
    displayName: 'Next.js',
    memberCount: 987654,
    description: 'Next.js Framework',
    isJoined: false
  }
];

const FEED_OPTIONS = [
  { name: 'Home', icon: Home, href: '/', description: 'Your personalized feed' },
  { name: 'Popular', icon: TrendingUp, href: '/popular', description: 'Most popular posts' },
  { name: 'Recent', icon: Clock, href: '/recent', description: 'Latest posts' },
  { name: 'Top', icon: Award, href: '/top', description: 'Top rated posts' }
];

export function Sidebar() {
  const { isAuthenticated } = useAuth();
  const [showAllClans, setShowAllClans] = useState(false);
  const [joinedClans, setJoinedClans] = useState<string[]>(
    POPULAR_CLANS.filter(clan => clan.isJoined).map(clan => clan.name)
  );

  const toggleClanJoin = (clanName: string) => {
    setJoinedClans(prev => 
      prev.includes(clanName) 
        ? prev.filter(name => name !== clanName)
        : [...prev, clanName]
    );
  };

  const displayedClans = showAllClans ? POPULAR_CLANS : POPULAR_CLANS.slice(0, 5);
  const myClans = POPULAR_CLANS.filter(clan => joinedClans.includes(clan.name));

  return (
    <div className="w-80 space-y-4">
      {/* Create Post Card */}
      {isAuthenticated && (
        <Card>
          <CardContent className="p-4">
            <Link href="/create-post">
              <Button className="w-full" size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Create Post
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Feed Navigation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            Feeds
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1">
            {FEED_OPTIONS.map((option) => (
              <Link key={option.name} href={option.href}>
                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 transition-colors group">
                  <option.icon className="h-5 w-5 text-gray-500 group-hover:text-gray-700" />
                  <div>
                    <div className="font-medium text-sm">{option.name}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* My Clans */}
      {isAuthenticated && myClans.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              My Clans
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              {myClans.map((clan) => (
                <Link key={clan.name} href={`/c/${clan.name}`}>
                  <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {clan.displayName[0]}
                      </div>
                      <div>
                        <div className="font-medium text-sm">c/{clan.name}</div>
                        <div className="text-xs text-gray-500">
                          {clan.memberCount.toLocaleString()} members
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Popular Clans */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            Popular Clans
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1">
            {displayedClans.map((clan) => (
              <div key={clan.name} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 transition-colors group">
                <Link href={`/c/${clan.name}`} className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {clan.displayName[0]}
                  </div>
                  <div>
                    <div className="font-medium text-sm">c/{clan.name}</div>
                    <div className="text-xs text-gray-500">
                      {clan.memberCount.toLocaleString()} members
                    </div>
                  </div>
                </Link>
                {isAuthenticated && (
                  <Button
                    variant={joinedClans.includes(clan.name) ? "outline" : "default"}
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleClanJoin(clan.name);
                    }}
                    className="ml-2"
                  >
                    {joinedClans.includes(clan.name) ? 'Joined' : 'Join'}
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          {POPULAR_CLANS.length > 5 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllClans(!showAllClans)}
              className="w-full mt-2 text-xs"
            >
              {showAllClans ? (
                <>
                  <ChevronUp className="mr-1 h-3 w-3" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="mr-1 h-3 w-3" />
                  View All Clans
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <h3 className="font-semibold">Welcome to Reddit Clone</h3>
            <p className="text-xs text-gray-600">
              Connect with communities of people who share your interests. 
              Join clans, create posts, and engage in discussions.
            </p>
            {!isAuthenticated && (
              <div className="pt-3 space-y-2">
                <Link href="/signup">
                  <Button className="w-full" size="sm">
                    Sign Up
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="w-full" size="sm">
                    Log In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}