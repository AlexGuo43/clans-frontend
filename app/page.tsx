// app/page.tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowBigDown, ArrowBigUp, MessageSquare, Share2 } from "lucide-react"

interface Post {
  id: string
  title: string
  content: string
  author: string
  votes: number
  commentCount: number
  subreddit: string
  createdAt: string
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
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Popular Posts</h1>
          <Button>Create Post</Button>
        </div>
        
        <div className="space-y-4">
          {MOCK_POSTS.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </main>
  )
}

function PostCard({ post }: { post: Post }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Vote buttons */}
          <div className="flex flex-col items-center gap-1">
            <button className="text-gray-500 hover:text-orange-500">
              <ArrowBigUp className="h-6 w-6" />
            </button>
            <span className="text-sm font-medium">{post.votes}</span>
            <button className="text-gray-500 hover:text-blue-500">
              <ArrowBigDown className="h-6 w-6" />
            </button>
          </div>
          
          {/* Post content */}
          <div className="flex-1">
            <div className="mb-1 text-sm text-gray-500">
              Posted by u/{post.author} in r/{post.subreddit} • {post.createdAt}
            </div>
            <h2 className="mb-2 text-xl font-semibold">{post.title}</h2>
            <p className="mb-4 text-gray-700">{post.content}</p>
            
            {/* Action buttons */}
            <div className="flex gap-4">
              <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                <MessageSquare className="h-4 w-4" />
                {post.commentCount} Comments
              </button>
              <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
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