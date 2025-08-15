'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createClan } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function CreateClanPage() {
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !description.trim()) {
      toast({
        title: "Error",
        description: "Clan name and description are required",
        variant: "destructive",
      });
      return;
    }

    // Validate clan name (lowercase, no spaces, alphanumeric + underscores)
    const clanNameRegex = /^[a-z0-9_]+$/;
    if (!clanNameRegex.test(name.trim())) {
      toast({
        title: "Invalid Clan Name",
        description: "Clan name must be lowercase letters, numbers, and underscores only",
        variant: "destructive",
      });
      return;
    }

    if (name.trim().length < 3 || name.trim().length > 50) {
      toast({
        title: "Invalid Clan Name",
        description: "Clan name must be between 3 and 50 characters",
        variant: "destructive",
      });
      return;
    }

    if (!token) {
      toast({
        title: "Error",
        description: "You must be logged in to create a clan",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const clanData = {
        name: name.trim().toLowerCase(),
        displayName: displayName.trim() || name.trim(),
        description: description.trim(),
      };

      console.log('Sending clan data to backend:', clanData);

      const newClan = await createClan(token, clanData);
      
      toast({
        title: "Success",
        description: `Clan c/${clanData.name} created successfully!`,
      });
      
      // Redirect to the new clan page
      router.push(`/c/${clanData.name}`);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create clan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="mb-4">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to home
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create a New Clan</CardTitle>
            <p className="text-sm text-gray-600">
              Build a community around your interests and connect with like-minded people.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Clan Name *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    c/
                  </span>
                  <Input
                    id="name"
                    type="text"
                    placeholder="programming"
                    value={name}
                    onChange={(e) => setName(e.target.value.toLowerCase())}
                    disabled={isLoading}
                    className="pl-8"
                    maxLength={50}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Lowercase letters, numbers, and underscores only. 3-50 characters.
                </p>
              </div>
              
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium mb-2">
                  Display Name
                </label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Programming (optional - defaults to clan name)"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={isLoading}
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Friendly name shown to users. If empty, will use clan name.
                </p>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Description *
                </label>
                <Textarea
                  id="description"
                  placeholder="A community for discussing programming, sharing code, and learning together..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Describe what your clan is about. {description.length}/500 characters.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Clan Guidelines</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Choose a clear, descriptive name</li>
                  <li>• Write a helpful description of your community's purpose</li>
                  <li>• As the creator, you'll become the clan moderator</li>
                  <li>• Clan names cannot be changed after creation</li>
                </ul>
              </div>
              
              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Creating Clan...' : 'Create Clan'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.push('/')}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}