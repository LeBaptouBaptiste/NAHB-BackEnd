# NAHB - Not Another Hero's Book

A fullstack TypeScript application for creating and playing interactive "Choose Your Own Adventure" stories.

## 📋 Project Description

NAHB is an interactive storytelling platform where:
- **Authors** create branching narratives with pages, choices, and multiple endings
- **Readers** explore published stories, make decisions, and track their progress
- **Admins** manage users, moderate content, and view platform statistics

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 19 + TypeScript, Vite, TailwindCSS, React Router, React Flow
- **Backend**: Node.js, Express + TypeScript
- **Databases**: 
  - **MongoDB** (via Mongoose): For flexible schemas (Stories, Pages, Game Sessions)
  - **MySQL** (via Sequelize): For structured relational data (Users, Authentication)
  - **Hybrid Architecture**: Uses the **Repository Pattern** to abstract data sources.
- **Architecture Pattern**: **Service Layer Pattern** (Controllers -> Services -> Repositories)
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

## 🌟 Killer Features

This project distinguishes itself with three major technical and UX features:

### 1. Visual Node Editor (React Flow)
Authors have a **"God Mode" view** of their story as a node graph. They can visualize all pages and links, making it easy to detect dead ends or infinite loops. This transforms story creation into a professional game design experience.

### 2. Visual & Audio Immersion (Hotspots & Audio)
- **Hotspots**: Images are playable. Users can explore scenes by clicking on interactive zones.
- **Audio**: Ambient music and sound effects change with scenes, creating a unique atmosphere.

### 3. RPG Mechanics (Dice & Inventory)
Integrated 3D dice engine and inventory system add true RPG elements. Success is not guaranteed, adding suspense and replayability.

## 📱 Responsive Design

The application is designed "Mobile First" but adapts perfectly to large screens.
- **Mobile**: Clean interface, thumb-friendly menus.
- **Desktop**: Utilizes space for story trees, detailed stats, and immersive views.

![Responsive Design](./responsive_screenshot.png)

## 🎮 Features Evaluation
For a detailed breakdown of all implemented features and their evaluation criteria, please see [README_EVALUATION.md](./README_EVALUATION.md).

### 1. Base Features (10/20) - ✅ Validated
- **Authentication**: Register, Login/Logout, Session management (JWT).
- **Story Management**: Create, Edit, Delete, Draft/Publish status.
- **Pages & Choices**: Create scenes with text/media, multiple choices, ending indicators.
- **Reading**: Browse stories, fluid navigation, clear endings.
- **Save System**: Automatic progress saving.
- **Admin**: Dashboard, User banning, Story suspension, Global stats.

### 2. Advanced Features (13/20) - ✅ Validated
- **Reader Experience**: 
  - Story filtering (themes, search).
  - Advanced stats (endings reached, path comparison).
  - Badges collection for unlocked endings.
  - Ratings (1-5 stars) & Comments.
  - Resume reading from dashboard.
  - Report system.
- **Author Experience**:
  - Author profile & story list.
  - Advanced stats (views, avg rating).
  - Preview mode (test without affecting stats).
  - **Image Support**: For stories and pages.
- **UX/UI**: Premium Glassmorphism design, Toasts, Confirmation dialogs.

### 3. High-Level Quality (16-18/20) - ✅ Validated
- **Story Trees**: React Flow integration for authors and readers.
- **Interactive Illustrations**: Hotspot system for clickable image zones.
- **RNG System**: 3D Dice rolling for conditional choices.
- **Audio**: Music & SFX support.
- **Quality**: Modular architecture (Service Layer, Atomic Design), Strong TypeScript typing.

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
- `POST /api/game/start` - Start new game session
- `POST /api/game/choice` - Make a choice
- `GET /api/game/sessions` - Get my sessions
- `GET /api/game/session/:id` - Get specific session
- `GET /api/game/story/:storyId/stats` - Get story statistics

### Ratings
- `GET /api/ratings/story/:storyId` - Get ratings
- `POST /api/ratings/story/:storyId` - Rate a story

### Admin
- `GET /api/admin/users` - List users
- `PATCH /api/admin/users/:userId/ban` - Ban user
- `GET /api/admin/stories` - List all stories
- `PATCH /api/admin/stories/:storyId/suspend` - Suspend story
- `GET /api/admin/stats` - Platform stats

## 🧪 Testing

```bash
# Run all tests
cd NAHB-BackEnd
npm test

# Run tests with coverage
npm test -- --coverage
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
│  ├── theme                  │  ├── startPageId                  │
│  └── stats                  │  └── choices[]                    │
│                             │      ├── text                     │
│                             │      └── targetPageId             │
├─────────────────────────────┼──────────────────────────────────┤
│  GameSessions               │  Ratings / Reports               │
│  ├── _id                    │  ├── _id                         │
│  ├── userId (FK)            │  ├── storyId (FK)                │
│  ├── storyId (FK)           │  ├── userId (FK)                 │
│  ├── currentPageId          │  ├── score / type                │
│  ├── history[]              │  └── comment / description       │
│  └── status                 │                                  │
└─────────────────────────────┴──────────────────────────────────┘
```

## 👥 Team

Group project by Stephane DEDU and VIDAL Baptiste

## 📄 License

ISC
