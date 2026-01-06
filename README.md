# Pastebin Lite

A modern, fast, and secure code sharing platform built with React, TypeScript, Node.js, and PostgreSQL. Features syntax highlighting, auto-expiration, and a sleek dark theme inspired by premium automotive design.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-20.x-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)

## Features

- **Instant Sharing** - Create and share code snippets in seconds, no signup required
- **Syntax Highlighting** - Support for 17+ programming languages with beautiful formatting
- **Auto-Expiration** - Time-based (10min to 1 month) and view-based expiration options
- **Burn After Reading** - Self-destructing pastes that delete after being viewed
- **Modern UI** - Premium dark theme with clean, minimal design
- **Rate Limiting** - Protection against abuse with configurable limits
- **RESTful API** - Full API access for programmatic paste creation

## Tech Stack

### Backend
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Validation**: Zod
- **Security**: Helmet, CORS, express-rate-limit

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Language**: TypeScript
- **Routing**: React Router DOM
- **Syntax Highlighting**: prism-react-renderer
- **Styling**: CSS Custom Properties

## Project Structure

```
pastebin-lite/
├── backend/
│   ├── lib/
│   │   ├── prisma.ts       # Database client singleton
│   │   ├── ratelimit.ts    # Rate limiting middleware
│   │   ├── types.ts        # TypeScript type definitions
│   │   ├── utils.ts        # Utility functions
│   │   └── validation.ts   # Zod validation schemas
│   ├── routes/
│   │   ├── cleanup.ts      # Cron job endpoints
│   │   └── pastes.ts       # Paste CRUD endpoints
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── server.ts           # Express server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── config.ts   # API configuration
│   │   │   └── types.ts    # API type definitions
│   │   ├── components/
│   │   │   ├── Footer.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── Layout.tsx
│   │   │   ├── PasteForm.tsx
│   │   │   └── PasteViewer.tsx
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── NotFound.tsx
│   │   │   └── PastePage.tsx
│   │   ├── App.tsx
│   │   └── index.css       # Global styles
│   ├── netlify.toml        # Netlify deployment config
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn
- PostgreSQL database (or Neon account for serverless)

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
PORT=3001
NODE_ENV=development
CRON_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
```

#### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:3001
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/umangkumarchaudhary/Pastebin-Lite--Aganitha.git
   cd Pastebin-Lite--Aganitha
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma db push
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## API Reference

### Create Paste
```http
POST /api/pastes
Content-Type: application/json

{
  "content": "console.log('Hello World');",
  "language": "javascript",
  "expiresIn": 60,
  "maxViews": 10
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "abc123XY",
    "url": "http://localhost:3001/api/pastes/abc123XY",
    "expiresAt": "2026-01-06T08:00:00.000Z",
    "maxViews": 10,
    "createdAt": "2026-01-06T07:00:00.000Z"
  }
}
```

### Get Paste
```http
GET /api/pastes/:id
```

### Get Raw Content
```http
GET /api/pastes/:id/raw
```

### Health Check
```http
GET /health
GET /health/db
```

### Cleanup Endpoints (Protected)
```http
GET /api/cleanup         # Mark expired pastes
POST /api/cleanup/purge  # Delete old expired pastes
GET /api/cleanup/stats   # Database statistics
```

## Deployment

### Backend (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure build settings:
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`
4. Add environment variables from `.env.example`

### Frontend (Netlify)

1. Create a new site on Netlify
2. Connect your GitHub repository
3. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
4. Add environment variable: `VITE_API_URL`

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| Global | 1000 requests | 15 min |
| Create Paste | 10 requests | 1 min |
| Get Paste | 100 requests | 1 min |
| Cleanup | 10 requests | 1 hour |

## Supported Languages

JavaScript, TypeScript, Python, Java, C++, C#, Go, Rust, Ruby, PHP, HTML, CSS, JSON, SQL, Bash, Markdown, and Plain Text.

## Expiration Options

### Time-based
- 10 minutes
- 1 hour
- 1 day
- 1 week
- 1 month
- Never

### View-based
- 1 view (Burn after reading)
- 10 views
- 100 views
- 1,000 views
- Unlimited

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built for the Aganitha coding assessment
- Inspired by Pastebin and GitHub Gists
- Design influenced by premium automotive aesthetics
