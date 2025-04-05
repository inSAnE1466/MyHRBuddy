# MyHRBuddy

An AI-powered Applicant Tracking System (ATS) that connects with Zapier forms to collect applicant data and provides intelligent search and analysis capabilities.

## Features

- **Zapier Integration**: Automatically import applicant data from forms
- **Resume Processing**: AI-powered resume parsing and analysis
- **Smart Search**: Natural language search for finding the right candidates
- **Applicant Management**: Track applicants through the hiring pipeline
- **AI Matching**: Match candidates to job requirements

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes with TypeScript
- **Database**: Neon PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **File Storage**: Vercel Blob Storage
- **AI Integration**: Gemini Flash 2.0

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Neon Postgres database
- A Vercel account (for deployment and Blob Storage)
- A Google Gemini API key
- A Zapier account (for form integration)

### Environment Variables

Create a `.env.local` file with the following variables:

```
# Database
DATABASE_URL="postgresql://user:password@hostname/database"

# Auth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"

# Gemini AI
GEMINI_API_KEY="your-gemini-api-key"

# Zapier
ZAPIER_WEBHOOK_SECRET="your-webhook-secret"
```

### Installation

1. Clone the repository
2. Install dependencies

```bash
npm install
```

3. Initialize the database

```bash
npx prisma db push
```

4. Run the development server

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Zapier Setup

1. Create a new Zap in Zapier
2. Set up a trigger (e.g., Form submission, Google Form, etc.)
3. Add a Webhook action with the following configuration:
   - Method: POST
   - URL: `https://your-app-url.com/api/webhooks/zapier`
   - Headers: `Authorization: Bearer your-webhook-secret`
   - Data: All form fields in JSON format

## Database Schema

The application uses Prisma ORM with the following models:

- `Applicant`: Stores basic candidate information
- `Position`: Job positions
- `Application`: Links applicants to positions
- `File`: Stores resume and document references
- `Skill`: Catalogue of skills
- `ApplicantSkill`: Links skills to applicants
- `AIAnalysis`: Stores AI analysis results
- `ApplicationStage`: Tracks application progress

## API Endpoints

### Applicants
- `GET /api/applicants`: List all applicants with filtering
- `GET /api/applicants/:id`: Get a specific applicant
- `POST /api/applicants`: Create a new applicant
- `PUT /api/applicants/:id`: Update an applicant
- `DELETE /api/applicants/:id`: Delete an applicant

### Search
- `POST /api/search`: Process natural language search

### Analysis
- `POST /api/analysis/queue`: Queue a resume for analysis

### Zapier Integration
- `POST /api/webhooks/zapier`: Webhook endpoint for form submissions

## Deployment

This project is designed to be deployed on Vercel:

1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. Configure environment variables
4. Deploy

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [Vercel Blob Storage](https://vercel.com/docs/storage/vercel-blob)
- [Next Auth Documentation](https://next-auth.js.org/getting-started/introduction)
- [Zapier Webhooks](https://help.zapier.com/hc/en-us/articles/8496293271693-Send-webhook-requests-from-Zaps)