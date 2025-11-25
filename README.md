# NAHB - Not Another Hero's Book

A fullstack TypeScript application for creating and playing interactive "Choose Your Own Adventure" stories.

## 📋 Project Description

NAHB is an interactive storytelling platform where:
- **Authors** create branching narratives with pages, choices, and multiple endings
- **Readers** explore published stories, make decisions, and track their progress
- **Admins** manage users and content

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React + TypeScript, Vite, TailwindCSS, React Router, React Flow
- **Backend**: Node.js, Express + TypeScript
- **Databases**: 
  - MySQL (Users, Authentication)
  - MongoDB (Stories, Pages, Game Sessions)
- **DevOps**: Docker, Docker Compose

### Database Schema

#### MySQL (Relational Data)
- **Users**: User accounts, roles (admin/author/reader), authentication

#### MongoDB (Content Data)
- **Stories**: Story metadata, tags, status, statistics
- **Pages**: Story content, choices, endings
- **GameSessions**: Player progress, history, save states

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
cd Backend
npm install
cp .env.example .env  # Configure environment variables
```

3. **Frontend Setup**
```bash
cd Frontend
npm install
```

4. **Start with Docker Compose**
```bash
# From project root
docker-compose up
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Manual Setup (Without Docker)

**Backend:**
```bash
cd Backend
npm run dev
```

**Frontend:**
```bash
cd Frontend
npm run dev
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Stories (Author)
- `POST /api/stories` - Create story
- `GET /api/stories/my/stories` - Get my stories
- `PUT /api/stories/:id` - Update story
- `DELETE /api/stories/:id` - Delete story

### Pages (Author)
- `POST /api/pages` - Create page
- `GET /api/pages/story/:storyId` - Get pages by story
- `PUT /api/pages/:id` - Update page
- `DELETE /api/pages/:id` - Delete page

### Game (Reader)
- `POST /api/game/start` - Start new game session
- `POST /api/game/choice` - Make a choice
- `GET /api/game/sessions` - Get my sessions
- `GET /api/game/session/:id` - Get specific session

### Public
- `GET /api/stories/published` - List published stories (with search/filter)

## 🎮 Features

### Phase 1 (10/20) - ✅ Complete
- ✅ User authentication (register, login, sessions)
- ✅ Story CRUD operations
- ✅ Page/Scene management with choices
- ✅ Game play functionality
- ✅ Session recording (save progress)

### Phase 2 (13-16/20) - In Progress
- [ ] Story filtering by themes
- [ ] Advanced statistics (path %, endings distribution)
- [ ] Ratings & comments
- [ ] Image uploads for pages
- [ ] Author preview mode

### Phase 3 (18/20+) - Planned
- [ ] Visual story tree editor (React Flow)
- [ ] Interactive illustrations with clickable zones
- [ ] Dice system for RNG-based choices
- [ ] Unit & Integration tests
- [ ] CI/CD pipeline
- [ ] Production deployment

## 🧪 Testing

```bash
# Backend tests
cd Backend
npm test

# Frontend tests
cd Frontend
npm test
```

## 📦 Deployment

### Production Build

**Backend:**
```bash
cd Backend
npm run build
npm start
```

**Frontend:**
```bash
cd Frontend
npm run build
```

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up
```

## 📸 Screenshots

_(Coming soon)_

## 👥 Team

Group project by 2 students.

## 📄 License

ISC
