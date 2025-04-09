# MyHRBuddy: AI-Powered ATS System

## Project Overview

MyHRBuddy is an AI-powered Applicant Tracking System (ATS) that enables HR teams to intelligently search, filter, and analyze job applicants. The system integrates with Zapier forms to collect applicant data, uses Gemini AI for intelligent analysis, and provides a Next.js frontend for HR professionals to manage the hiring process.

## Tech Stack

- **Frontend**: Next.js 15.2 with App Router, React 19, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes, TypeScript
- **Database**: Neon PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **File Storage**: Vercel Blob Storage
- **AI Integration**: Gemini Flash 2.0
- **Deployment**: Vercel

## Architecture Overview

```
Zapier Form Submission → Next.js API → Database → AI Analysis → Frontend UI
```

## Core Components

1. **Zapier Integration**: Webhook to receive form submissions including resume files
2. **Database Schema**: PostgreSQL tables for applicants, positions, applications, files, skills, etc.
3. **AI Analysis Engine**: Gemini-powered resume parsing, skill extraction, and matching
4. **Frontend Dashboard**: Search, filter, and visualize applicant data

## Environment Variables

Required environment variables:
- `DATABASE_URL`: Neon PostgreSQL connection string
- `GEMINI_API_KEY`: Google Gemini API key
- `NEXTAUTH_SECRET`: Secret for NextAuth authentication
- `ZAPIER_WEBHOOK_SECRET`: Secret for Zapier webhook authentication
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob Storage token

## Development Commands

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npx prisma db push`: Push schema changes to database
- `npx prisma studio`: Visual database explorer

## Project Structure

- `src/app/api`: API routes for backend functionality
  - `/api/webhooks/zapier`: Webhook endpoint for Zapier integration
  - `/api/applicants`: CRUD endpoints for applicants
  - `/api/search`: Natural language search processing
  - `/api/analysis`: AI analysis of applicants and resumes
- `src/lib`: Utility functions and shared libraries
  - `prisma.ts`: Prisma client initialization
  - `file-storage.ts`: Vercel Blob Storage utilities
  - `ai-service.ts`: Gemini AI integration
  - `auth.ts`: NextAuth configuration
- `prisma`: Database schema and migrations
  - `schema.prisma`: Database models definition

## Completed Backend Setup

1. **Prisma Schema**:
   - Created models for applicants, positions, applications, files, skills, etc.
   - Added indexes for improved query performance
   - Set up relationships between models

2. **Zapier Integration**:
   - Implemented webhook endpoint for receiving form submissions
   - Added validation and error handling
   - Created process for storing resume files
   - Set up application tracking

3. **AI Analysis**:
   - Implemented Gemini AI integration for resume parsing
   - Created natural language search processing
   - Set up skills extraction and storage

4. **API Endpoints**:
   - Created CRUD operations for applicants
   - Implemented search API with natural language processing
   - Added file storage and retrieval endpoints

5. **Authentication**:
   - Set up NextAuth.js with credential provider
   - Implemented route protection via middleware

## Next Steps

1. **Frontend Development**:
   - Create dashboard layout
   - Implement applicant list and details views
   - Build natural language search interface
   - Develop visualizations for applicant data

2. **Database Initialization**:
   - Apply Prisma schema to Neon PostgreSQL
   - Create initial seed data for testing

3. **Deployment**:
   - Configure Vercel project
   - Set up environment variables
   - Deploy application

4. **Testing**:
   - Create test data for API endpoints
   - Test Zapier integration
   - Verify AI analysis functionality

## Integration Notes

- The Zapier webhook expects data in a specific format as outlined in the documentation
- Resume files should be uploaded as URLs or base64-encoded data
- The Gemini AI model requires a valid API key and specific prompt structure
- NextAuth is currently set up with a demo credential provider (replace with your preferred provider)