# NAHB - Not Another Hero's Book

A fullstack TypeScript application for creating and playing interactive "Choose Your Own Adventure" stories.

## 📋 Project Description

NAHB is an interactive storytelling platform where:
- **Authors** create branching narratives with pages, choices, and multiple endings
- **Readers** explore published stories, make decisions, and track their progress
- **Admins** manage users, moderate content, and view platform statistics

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React + TypeScript, Vite, TailwindCSS, React Router, React Flow
- **Backend**: Node.js, Express + TypeScript
- **Databases**: 
  - MySQL (Users, Authentication)
  - MongoDB (Stories, Pages, Game Sessions, Ratings, Reports)
- **Testing**: Jest, Supertest, MongoDB Memory Server
- **DevOps**: Docker, Docker Compose

### Database Schema

#### MySQL (Relational Data)
- **Users**: User accounts, roles (admin/author/reader/banned), authentication

#### MongoDB (Content Data)
- **Stories**: Story metadata, tags, status, statistics
- **Pages**: Story content, choices, endings, images
- **GameSessions**: Player progress, history, save states, preview mode
- **Ratings**: User ratings and comments for stories
- **Reports**: User reports for inappropriate content

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+
- Docker & Docker Compose

### Development Setup

1. **Clone the repository**
```bash
git clone <repo-url>
cd RpgBook
```

2. **Backend Setup**
```bash
cd NAHB-BackEnd
npm install
cp .env.example .env  # Configure environment variables
```

3. **Frontend Setup**
```bash
cd NAHB-FrontEnd
npm install
```

4. **Start with Docker Compose**
```bash
# From NAHB-BackEnd directory
docker-compose up
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Manual Setup (Without Docker)

**Backend:**
```bash
cd NAHB-BackEnd
npm run dev
```

**Frontend:**
```bash
cd NAHB-FrontEnd
npm run dev
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Stories (Author)
- `POST /api/stories` - Create story
- `GET /api/stories/my-stories` - Get my stories
- `GET /api/stories/:id` - Get story by ID
- `PUT /api/stories/:id` - Update story
- `DELETE /api/stories/:id` - Delete story

### Pages (Author)
- `POST /api/pages` - Create page
- `GET /api/pages/story/:storyId` - Get pages by story
- `GET /api/pages/:id` - Get page by ID
- `PUT /api/pages/:id` - Update page
- `DELETE /api/pages/:id` - Delete page

### Game (Reader)
- `POST /api/game/start` - Start new game session (supports `preview: true` for authors)
- `POST /api/game/choice` - Make a choice
- `GET /api/game/sessions` - Get my sessions
- `GET /api/game/session/:id` - Get specific session
- `GET /api/game/session/:sessionId/path-stats` - Get path statistics ("X% took same path")
- `GET /api/game/story/:storyId/stats` - Get story statistics (author only)

### Ratings
- `GET /api/ratings/story/:storyId` - Get ratings for a story
- `POST /api/ratings/story/:storyId` - Rate a story (1-5 stars + optional comment)
- `GET /api/ratings/story/:storyId/me` - Get user's rating for a story
- `DELETE /api/ratings/story/:storyId` - Delete user's rating

### Reports
- `POST /api/reports/story/:storyId` - Report a story
- `GET /api/reports/my-reports` - Get user's reports

### Admin (Admin only)
- `GET /api/admin/users` - List all users
- `PATCH /api/admin/users/:userId/ban` - Ban/unban a user
- `GET /api/admin/stories` - List all stories (including suspended)
- `PATCH /api/admin/stories/:storyId/suspend` - Suspend/unsuspend a story
- `GET /api/admin/reports` - List all reports
- `PATCH /api/admin/reports/:reportId` - Update report status
- `GET /api/admin/stats` - Get platform statistics

### Public
- `GET /api/stories/published` - List published stories (with search/filter)

## 🎮 Features

### Phase 1 (10/20) - ✅ Complete
- ✅ User authentication (register, login, sessions)
- ✅ Story CRUD operations
- ✅ Page/Scene management with choices
- ✅ Game play functionality
- ✅ Session recording (save progress)
- ✅ Admin role management

### Phase 2 (13-16/20) - ✅ Complete
- ✅ Story filtering by themes
- ✅ Advanced statistics (path %, endings distribution)
- ✅ Ratings & comments system
- ✅ Story reporting system
- ✅ Image support for pages
- ✅ Author preview mode (test without affecting stats)
- ✅ Admin dashboard with user/story management

### Phase 3 (18/20+) - ✅ Complete
- ✅ Visual story tree editor (React Flow)
- ✅ Dice system for RNG-based choices
- ✅ Unit tests with Jest
- ✅ Docker Compose setup
- ⬜ Interactive illustrations with clickable zones
- ⬜ CI/CD pipeline
- ⬜ Production deployment

## 🧪 Testing

```bash
# Run all tests
cd NAHB-BackEnd
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

### Test Coverage
- Model tests (Story, Page, GameSession, Rating, Report)
- Controller logic validation
- API endpoint integration tests

## 📦 Deployment

### Production Build

**Backend:**
```bash
cd NAHB-BackEnd
npm run build
npm start
```

**Frontend:**
```bash
cd NAHB-FrontEnd
npm run build
```

### Docker Production
```bash
docker-compose up -d
```

## 📊 Database Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         MySQL                                    │
├─────────────────────────────────────────────────────────────────┤
│  Users                                                          │
│  ├── id (PK)                                                    │
│  ├── username                                                   │
│  ├── email                                                      │
│  ├── password_hash                                              │
│  └── role (admin/author/reader/banned)                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        MongoDB                                   │
├─────────────────────────────────────────────────────────────────┤
│  Stories                    │  Pages                            │
│  ├── _id                    │  ├── _id                          │
│  ├── title                  │  ├── storyId (FK)                 │
│  ├── description            │  ├── content                      │
│  ├── authorId (FK)          │  ├── image                        │
│  ├── status                 │  ├── isEnding                     │
│  ├── tags[]                 │  ├── endingType                   │
│  ├── theme                  │  └── choices[]                    │
│  ├── startPageId            │      ├── text                     │
│  └── stats                  │      └── targetPageId             │
│      ├── views              │                                   │
│      ├── completions        ├──────────────────────────────────┤
│      └── endings{}          │  GameSessions                     │
│                             │  ├── _id                          │
├─────────────────────────────│  ├── userId (FK)                  │
│  Ratings                    │  ├── storyId (FK)                 │
│  ├── _id                    │  ├── currentPageId                │
│  ├── storyId (FK)           │  ├── history[]                    │
│  ├── userId (FK)            │  ├── status                       │
│  ├── score (1-5)            │  ├── isPreview                    │
│  └── comment                │  └── diceRolls[]                  │
│                             │                                   │
├─────────────────────────────┼──────────────────────────────────┤
│  Reports                    │                                   │
│  ├── _id                    │                                   │
│  ├── storyId (FK)           │                                   │
│  ├── reporterId (FK)        │                                   │
│  ├── type                   │                                   │
│  ├── description            │                                   │
│  ├── status                 │                                   │
│  └── resolvedBy             │                                   │
└─────────────────────────────┴──────────────────────────────────┘
```

## 🔐 Authentication & Authorization

- JWT-based authentication
- Role-based access control:
  - **Admin**: Full access to all features + admin panel
  - **Author**: Can create/edit own stories, preview mode
  - **Reader**: Can play published stories, rate, report
  - **Banned**: No access to platform features

## 📸 Screenshots

_(Add screenshots of your application here)_

## 👥 Team

Group project by Stephane DEDU and VIDAL Baptiste

## 📄 License

ISC

