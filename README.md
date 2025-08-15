# Clans Frontend - Reddit Clone

A modern Reddit clone built with Next.js, featuring communities called "Clans" with full social functionality.

## 🚀 Features

### Core Functionality
- **User Authentication**: Sign up, login, JWT-based authentication
- **Clans (Communities)**: Create and join public/private communities
- **Posts**: Create, vote, and comment on posts within clans
- **Threaded Comments**: Nested comment replies with voting
- **Real-time Updates**: Live updates for votes, comments, and membership

### Key Components
- **Home Feed**: Browse all posts with sorting options (hot, new, top)
- **Clan Pages**: Dedicated pages for each community with member management
- **Post Details**: Full post view with threaded comment discussions
- **Clan Discovery**: Browse public clans and manage personal memberships
- **Responsive Design**: Works on desktop and mobile devices

## 🛠 Tech Stack

- **Frontend**: Next.js 15 with TypeScript and App Router
- **Styling**: Tailwind CSS + Radix UI components
- **State Management**: Zustand with persistence
- **Authentication**: JWT tokens with secure storage
- **API Integration**: REST API with microservices backend
- **Icons**: Lucide React icons

## 📁 Project Structure

```
app/
├── page.tsx                    # Home feed
├── login/                      # Authentication pages
├── signup/
├── create-post/               # Post creation form
├── create-clan/               # Clan creation form
├── post/[id]/                 # Individual post pages
├── c/[subreddit]/             # Clan pages
components/
├── Sidebar.tsx                # Navigation and clan discovery
├── ui/                        # Reusable UI components
lib/
├── auth.ts                    # API functions and backend integration
hooks/
├── useAuth.tsx                # Authentication state management
├── use-toast.tsx              # Toast notifications
```

## 🔧 Setup & Installation

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm
- Backend API running on port 8000

### Installation

1. **Clone the repository**
```bash
git clone <repo-url>
cd clans-frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open in browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 API Integration

The frontend integrates with a microservices backend via API Gateway on `http://localhost:8000/api`

### Backend Services
- **User Service**: Authentication, user management
- **Post Service**: Post creation, voting, retrieval  
- **Comment Service**: Threaded comments, comment voting
- **Clan Service**: Community management, membership

### Key API Functions (`lib/auth.ts`)
```typescript
// Authentication
login(email, password)
signup(username, email, password)

// Posts
getPosts()
createPost(token, {title, content, subreddit})
votePost(token, postId, voteType)

// Comments  
getComments(postId)
createComment(token, postId, content)
createReply(token, postId, parentId, content)

// Clans
getClans()                    // Public clans
getUserClans(token)           // User's clans
createClan(token, clanData)
joinClan(token, clanId)
```

## 🎨 Features Deep Dive

### Clan Management
- **Public/Private Clans**: Toggle visibility during creation
- **Member Management**: Join/leave functionality with real-time updates
- **Clan Discovery**: Sidebar shows popular clans + user's personal clans
- **Post Filtering**: Clan pages show only posts from that community

### Threaded Comments
- **Nested Replies**: Recursive comment threading with visual indentation
- **Reply Forms**: Inline reply creation with proper parent-child relationships
- **Comment Voting**: Upvote/downvote individual comments
- **Real-time Updates**: Comments refresh after posting replies

### Post Creation & Voting
- **Clan Integration**: Posts automatically tagged to specific clans
- **Rich Content**: Title + text content with markdown support
- **Voting System**: Upvote/downvote with optimistic UI updates
- **Author Attribution**: Posts show author and creation time

### State Management
- **Authentication**: Persistent login state with Zustand
- **Optimistic Updates**: Immediate UI feedback before backend confirmation
- **Error Handling**: Comprehensive error states with user-friendly messages
- **Loading States**: Proper loading indicators throughout the app

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: Authentication required for posting/voting
- **Input Validation**: Form validation and sanitization
- **Error Boundaries**: Graceful error handling and fallbacks

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Docker (if configured)
```bash
docker build -t clans-frontend .
docker run -p 3000:3000 clans-frontend
```

## 🧩 Customization

### Adding New Features
1. **API Functions**: Add new backend calls to `lib/auth.ts`
2. **Components**: Create reusable components in `components/`
3. **Pages**: Add new routes in `app/` directory
4. **State**: Extend Zustand stores in `hooks/`

### Styling
- **Tailwind Classes**: Modify existing components
- **Custom Components**: Add to `components/ui/`
- **Theme**: Update Tailwind config for brand colors

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## 🐛 Troubleshooting

### Common Issues

**Posts not showing in correct clan:**
- Check console logs for clan_id vs clan_name mapping
- Verify backend returns proper clan information

**Authentication issues:**
- Clear browser localStorage and re-login
- Check backend API is running on port 8000

**Comments not loading:**
- Verify post_id format (integer vs string)
- Check foreign key relationships in backend

## 📄 License

MIT License - see LICENSE file for details

---

Built with ❤️ using Next.js and modern web technologies