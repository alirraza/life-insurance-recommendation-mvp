# Life Insurance Recommendation MVP

A full-stack application that provides personalized life insurance recommendations based on user profiles. Built with Next.js (frontend), Express (backend), PostgreSQL (with Prisma), and Tailwind CSS. Includes user authentication (email + password).

## Features
- User registration and login (JWT-based authentication)
- Single-page form for collecting age, income, dependents, and risk tolerance
- Personalized life insurance recommendation engine
- Stores user submissions and recommendations in PostgreSQL
- Responsive, modern UI with Tailwind CSS
- **Security:** Rate limiting, Helmet, and CORS for API protection

## Security Features
- **Rate Limiting:**
  - Global: 200 requests per IP per 15 minutes
  - Auth endpoints: 10 requests per IP per 15 minutes
  - Helps prevent brute-force and abuse attacks
- **Helmet:** Sets secure HTTP headers
- **CORS:** Restricts API access to the configured frontend URL

## Tech Stack
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend:** Node.js with Express (ESM), JavaScript
- **Database:** PostgreSQL with Prisma ORM
- **Validation:** Zod
- **Authentication:** JWT, bcryptjs
- **Deployment:** Vercel (frontend), Supabase/Railway (PostgreSQL)

## Project Structure
```
life-insurance-mvp/
├── app/                    # Next.js App Router (Frontend)
├── backend/               # Express.js Backend
│   ├── lib/              # Backend utilities (Prisma client)
│   ├── routes/           # API routes (recommendation, auth)
│   ├── prisma/           # Database schema
│   ├── server.js         # Express server entry point
│   └── package.json      # Backend dependencies
├── components/           # Reusable UI components
├── contexts/             # React context providers (Auth)
├── types/                # Shared TypeScript types
├── package.json          # Monorepo scripts
└── README.md
```

## Environment Variables

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:5001
```

### Backend (`backend/.env`)
```
DATABASE_URL="postgresql://username:password@localhost:5432/life_insurance_mvp"
PORT=5001
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
JWT_SECRET="your-super-secret-key"
```

## Setup Instructions

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd life-insurance-mvp
pnpm install:all
```

### 2. Configure Environment Variables
- Copy `.env.example` to `.env.local` (frontend)
- Copy `backend/env.example` to `backend/.env` (backend)
- Edit both files with your actual values (see above)

### 3. Set Up the Database
```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push
```

### 4. Run the App (Monolithic Dev)
```bash
pnpm dev
```
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5001](http://localhost:5001)

## Available Commands

| Command                | Description                                 |
|------------------------|---------------------------------------------|
| pnpm dev               | Start both frontend and backend (dev)       |
| pnpm dev:frontend      | Start only frontend (Next.js)               |
| pnpm dev:backend       | Start only backend (Express)                |
| pnpm db:generate       | Generate Prisma client                      |
| pnpm db:push           | Push schema to database                     |
| pnpm db:migrate        | Run migrations                              |
| pnpm db:studio         | Open Prisma Studio                          |
| pnpm install:all       | Install all dependencies (frontend+backend) |

## API Endpoints

### Auth
- `POST /api/auth/register` — Register a new user (email, password)
- `POST /api/auth/login` — Login and receive a JWT

### Recommendation
- `POST /api/recommendation` — Get a personalized recommendation (requires authentication)

---

## Deployment: AWS (ECS & General Notes)

### Docker Image
This project includes a `Dockerfile` for containerized deployment. You can build and run the app as a Docker container:

```bash
docker build -t life-insurance-mvp .
```

### Environment Variables
- Set all required environment variables in your ECS task definition or container environment:
  - `DATABASE_URL`
  - `PORT`
  - `NODE_ENV`
  - `FRONTEND_URL`
  - `JWT_SECRET`
  - (and `NEXT_PUBLIC_API_URL` for frontend)

### Deploying to AWS ECS (Elastic Container Service)
1. **Build and push Docker image to ECR (Elastic Container Registry):**
   ```bash
   # Authenticate Docker to your ECR registry
   aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com

   # Tag and push your image
   docker tag life-insurance-mvp:latest <account-id>.dkr.ecr.<region>.amazonaws.com/life-insurance-mvp:latest
   docker push <account-id>.dkr.ecr.<region>.amazonaws.com/life-insurance-mvp:latest
   ```
2. **Create an ECS cluster and service:**
   - Use the AWS Console or CLI to create a new ECS cluster.
   - Create a new service using your pushed Docker image.
   - Set environment variables in the task definition.
   - Attach a load balancer if needed.
3. **Set up a PostgreSQL database:**
   - Use AWS RDS, Supabase, or Railway for managed PostgreSQL.
   - Update your `DATABASE_URL` accordingly.
4. **(Optional) Use AWS Secrets Manager or SSM Parameter Store for secrets.**
5. **Point your domain or frontend to the ECS service URL.**

### General Production Notes
- **Frontend:** You can deploy the Next.js frontend separately (e.g., Vercel, S3+CloudFront, or as a separate ECS service).
- **Backend:** The Express API can be deployed as a container (see above) or on any Node.js-compatible host.
- **Database:** Use a managed PostgreSQL service for reliability and backups.
- **Environment Variables:** Always set secrets and URLs securely in your cloud provider.
- **Scaling:** ECS supports auto-scaling and load balancing for production workloads.
