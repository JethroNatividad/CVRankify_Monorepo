# CVRankify Web

A modern web application for ranking and managing CVs/resumes, built with T3 Stack - Next.js, tRPC, Prisma, and NextAuth.

## Getting Started

### Prerequisites

- Node.js 18+ 
- Docker (for local database)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cvrankify-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and fill in the required values:
   - `AUTH_SECRET` - Generate with `npx auth secret`
   - `DATABASE_URL` - MySQL connection string (default works with local setup)

4. **Start the database and storage bucket**
   ```bash
   ./start-database.sh
   docker-compose up -d
   ```

5. **Set up the database schema**
   ```bash
   npx prisma db push
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## Development Scripts

- `npm run dev` - Start development server with Turbo mode
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format:check` - Check code formatting
- `npm run format:write` - Format code with Prettier
- `npm run typecheck` - Run TypeScript type checking
- `npm run db:studio` - Open Prisma Studio
- `npm run db:generate` - Generate Prisma client and run migrations
- `npm run db:push` - Push schema changes to database

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── _components/    # Shared components
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── server/             # Server-side code
│   ├── api/           # tRPC routers and procedures
│   ├── auth/          # Authentication configuration
│   └── db.ts          # Database client
├── styles/            # Global styles
└── trpc/              # tRPC client configuration
```

## Database

This project uses MySQL with Prisma ORM. The database schema is defined in `prisma/schema.prisma`.

### Database Commands

- **View data:** `npm run db:studio`
- **Apply schema changes:** `npm run db:push`
- **Create migration:** `npm run db:generate`
- **Reset database:** `npx prisma migrate reset`