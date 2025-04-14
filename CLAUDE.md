MyHRBuddy: AI-Powered ATS System
Project Overview
MyHRBuddy is an AI-powered Applicant Tracking System (ATS) that enables HR teams to intelligently search, filter, and analyze job applicants. The system integrates with ClickUp for applicant tracking, uses Gemini AI for intelligent analysis, and provides a Next.js frontend for HR professionals to manage the hiring process.
Tech Stack

Frontend: Next.js 15.2 with App Router, React 19, Tailwind CSS, shadcn/ui
Backend: Next.js API routes, TypeScript
Database: Neon PostgreSQL with Prisma ORM
Authentication: NextAuth.js with Google/Gmail provider
File Storage: Vercel Blob Storage
AI Integration: Gemini 2.0 Flash
MCP Integrations:

ClickUp MCP Server (remote on Cloudflare)
Gmail MCP Server (remote on Cloudflare)
Neon DB MCP Server (remote on Cloudflare)


Deployment: Vercel (application), Cloudflare Workers (MCP servers)

Architecture Overview
Form Submission → ClickUp → MCP Integration → Database → AI Analysis → Frontend UI → Email Notifications
Core Components

ClickUp Integration:

Source of applicant data through ClickUp API
Task management for applicant tracking
Remote MCP server for AI interaction with ClickUp


Gmail Integration:

Email notifications for applicants and HR staff
Email template management
Remote MCP server for AI interaction with Gmail


Database Layer:

Neon PostgreSQL for data storage
Prisma ORM for database access
Remote MCP server for AI interaction with the database


AI Analysis Engine:

Gemini-powered resume parsing, skill extraction, and matching
Natural language search capabilities
AI-powered applicant evaluation


Authentication:

NextAuth.js with Google provider for secure authentication
Role-based access control
Secure API endpoints


Frontend Dashboard:

Intuitive UI for applicant management
Natural language search interface
Visualizations and reporting



MCP Integration
The system uses Model Context Protocol (MCP) to enable AI assistants to interact with external services:
ClickUp MCP Server

Deployed as a remote server on Cloudflare Workers
Provides tools for task creation, updates, and management
Connects to ClickUp API for applicant data retrieval and updates
Enables natural language interaction with ClickUp tasks

Gmail MCP Server

Deployed as a remote server on Cloudflare Workers
Provides tools for email composition, sending, and management
Connects to Gmail API for email communications
Enables natural language generation of email content

Neon DB MCP Server

Deployed as a remote server on Cloudflare Workers
Provides tools for database querying and updates
Connects to Neon PostgreSQL for data operations
Enables natural language querying of applicant data

MCP Client Integration

Web application connects to remote MCP servers via secure API
Authentication handled through OAuth
Enables AI assistant to perform actions on behalf of users

Authentication System
The authentication system uses NextAuth.js with Google provider:

Login Flow: Simple "Sign in with Google" button
User Management: Authorized users stored in database
Role-Based Access: Admin and standard user roles
Session Management: Secure session handling
Protected Routes: API and page routes protected based on authentication

Environment Variables
# Database
DATABASE_URL=your_neon_postgres_connection_string

# Authentication
NEXTAUTH_URL=your_app_url
NEXTAUTH_SECRET=your_nextauth_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AI
GEMINI_API_KEY=your_gemini_api_key

# MCP Servers
CLICKUP_MCP_URL=your_clickup_mcp_url
CLICKUP_MCP_TOKEN=your_clickup_mcp_token
GMAIL_MCP_URL=your_gmail_mcp_url
GMAIL_MCP_TOKEN=your_gmail_mcp_token
NEON_MCP_URL=your_neon_mcp_url
NEON_MCP_TOKEN=your_neon_mcp_token

# ClickUp API
CLICKUP_API_KEY=your_clickup_api_key

# File Storage
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
Implementation Plan
Phase 1: Core Infrastructure

Set up Prisma schema and database connection
Implement NextAuth with Google provider
Create basic dashboard layout

Phase 2: ClickUp Integration

Deploy ClickUp MCP server on Cloudflare
Implement ClickUp API connection
Create data sync between ClickUp and database

Phase 3: AI Analysis Engine

Implement Gemini AI integration
Create resume parsing and skill extraction
Build natural language search capabilities

Phase 4: Email Integration

Deploy Gmail MCP server on Cloudflare
Implement email template system
Create notification workflows

Phase 5: Database Operations

Deploy Neon DB MCP server on Cloudflare
Implement data querying and manipulation tools
Create reporting and analytics features

Phase 6: UI/UX Refinement

Enhance dashboard with visualizations
Implement applicant comparison features
Create user-friendly natural language interface

Development Guidelines
File Structure

/app/(dashboard) - Dashboard and authenticated routes
/app/api - API endpoints
/app/login - Authentication pages
/lib - Shared utilities and services
/components - Reusable UI components
/prisma - Database schema and migrations

Best Practices

Use TypeScript for type safety
Leverage Next.js App Router features
Implement proper error handling and logging
Follow security best practices for authentication
Use React Server Components where appropriate
Create reusable components with shadcn/ui

Testing Strategy

Unit tests for utility functions
Integration tests for API endpoints
E2E tests for critical workflows
Manual testing for UI components

Deployment

Application: Deploy to Vercel
MCP Servers: Deploy to Cloudflare Workers using Wrangler
Database: Hosted on Neon PostgreSQL
Authentication: Configured with Google Cloud Console

Next Steps

Complete Prisma schema setup and database connection
Implement NextAuth with Google provider
Deploy remote MCP servers on Cloudflare
Create MCP client integration in the application
Implement ClickUp data synchronization
Build out dashboard UI components
Create AI-powered natural language search