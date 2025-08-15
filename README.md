# Twitter Clone

A full-featured Twitter clone built with Next.js, Supabase, and modern web technologies. Features real-time updates, authentication, and all core social media functionality.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/muhammad-zainal-muttaqins-projects/v0-twitter-clone)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/LdIEzAJRrhh)

## 🚀 Live Demo

**[https://v0-twitter-clone-gold.vercel.app](https://v0-twitter-clone-gold.vercel.app)**

## ✨ Features

### Core Functionality
- **Authentication** - Sign up, login, logout with email verification
- **Tweet Management** - Post, like, retweet, reply to tweets
- **User Profiles** - Customizable profiles with bio, avatar, banner
- **Follow System** - Follow/unfollow users, view followers/following
- **Timeline Feeds** - "For You" and "Following" personalized feeds
- **Search** - Find tweets, users, and hashtags
- **Bookmarks** - Save tweets for later viewing

### Advanced Features
- **Real-time Updates** - Live notifications and tweet updates
- **Direct Messaging** - Private conversations between users
- **Trending Topics** - Discover popular hashtags and topics
- **Tweet Sharing** - Share tweets via Web Share API or copy links
- **Responsive Design** - Works perfectly on desktop and mobile
- **Dark/Light Theme** - Automatic theme switching
- **Performance Optimized** - API caching and debounced requests

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Deployment**: Vercel
- **Analytics**: Vercel Analytics & Speed Insights

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone Repository
\`\`\`bash
git clone https://github.com/muhammad-zainal-muttaqin/twit-clone.git
cd twit-clone
npm install
\`\`\`

### 2. Environment Setup
Create `.env.local` file:
\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database
POSTGRES_URL=your_postgres_url
POSTGRES_PRISMA_URL=your_postgres_prisma_url
POSTGRES_URL_NON_POOLING=your_postgres_non_pooling_url

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

### 3. Database Setup
Run the SQL scripts in order:
\`\`\`bash
# In Supabase SQL Editor, run these scripts:
scripts/01-restore-twitter-schema.sql
scripts/02-create-functions-and-triggers.sql
scripts/07-create-bookmarks-table.sql
\`\`\`

### 4. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to see the app.

## 📁 Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── explore/           # Explore page
│   ├── messages/          # Direct messages
│   └── [username]/        # User profiles
├── components/            # React components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and configurations
├── scripts/               # Database SQL scripts
└── styles/                # Global styles
\`\`\`

## 🔧 Key Components

- **Timeline** - Real-time tweet feed with infinite scroll
- **Tweet Composer** - Rich text tweet creation
- **User Profiles** - Complete profile management
- **Search System** - Full-text search across tweets and users
- **Notification System** - Real-time notifications
- **Messaging** - Direct message conversations

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on every push

### Manual Deployment
\`\`\`bash
npm run build
npm start
\`\`\`

## 🔒 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ |
| `POSTGRES_URL` | PostgreSQL connection string | ✅ |
| `NEXT_PUBLIC_SITE_URL` | Your app's URL | ✅ |

## 📊 Performance

- **API Caching** - Intelligent caching with configurable TTL
- **Debounced Requests** - Prevents excessive API calls
- **Optimized Queries** - Efficient database queries with proper indexing
- **Image Optimization** - Next.js automatic image optimization
- **Bundle Optimization** - Tree shaking and code splitting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [v0.app](https://v0.app) - AI-powered development platform
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide React](https://lucide.dev)
- Hosted on [Vercel](https://vercel.com)
- Database by [Supabase](https://supabase.com)

---

**[Continue building on v0.app](https://v0.app/chat/projects/LdIEzAJRrhh)**
