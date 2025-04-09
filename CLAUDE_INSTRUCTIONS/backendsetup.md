# MyHRBuddy Backend PRD

## Overview
The MyHRBuddy backend provides the API layer, business logic, and integration services that power the ATS system. It will handle data processing, AI analysis, and serve as the bridge between the frontend UI and the database.

## Core Components

### 1. API Layer
- **REST API endpoints** for:
  - Applicant management (CRUD)
  - Search and filtering
  - File handling (resume upload/download)
  - AI analysis requests
  - Authentication and authorization
- **GraphQL API** (optional for phase 2) for more flexible query capabilities

### 2. Zapier Integration Service
- **Webhook Receiver**:
  - Endpoint to receive form submissions from Zapier
  - Data validation and normalization
  - Error handling and logging
- **Database Writer**:
  - Transform Zapier data to database schema
  - Handle file storage for resumes and attachments
  - Create applicant records

### 3. AI Analysis Engine
- **Document Processing**:
  - Resume parsing and information extraction
  - Skills and experience identification
  - Education verification
- **Query Processing**:
  - Natural language search interpretation
  - Semantic matching of search terms to applicant data
  - Relevance scoring
- **Recommendation Engine**:
  - Candidate-to-job matching
  - Similar candidate identification
  - Interview question generation

### 4. Data Management Service
- **Database Operations**:
  - CRUD operations for all entities
  - Transaction management
  - Data validation
- **File Operations**:
  - Resume storage and retrieval
  - File format conversion (if needed)
  - File metadata management

## Technical Architecture

### Technology Stack
- **Framework**: Next.js API routes for serverless functions
- **Runtime**: Node.js
- **Language**: TypeScript
- **Database Access**: Prisma ORM
- **Authentication**: NextAuth.js
- **File Storage**: Vercel Blob Storage or AWS S3
- **AI Integration**:  GEMINI FLASH 2.0 as model of choice - model is called "gemini-2.0-flash" - use this when creating api call route

### Architecture Diagram
```
Client App → Next.js API Routes → Business Logic Layer → Data Access Layer → Neon Postgres
                                      ↓
                                 AI Services
                                      ↓
                              File Storage Service
```

### API Endpoints

#### Applicants
- `GET /api/applicants`: List all applicants with filtering
- `GET /api/applicants/:id`: Get a specific applicant
- `POST /api/applicants`: Create a new applicant (used by Zapier)
- `PUT /api/applicants/:id`: Update an applicant
- `DELETE /api/applicants/:id`: Delete an applicant

#### Search
- `POST /api/search`: Process natural language search
- `GET /api/search/filters`: Get available filter options

#### Analysis
- `POST /api/analysis/resume`: Analyze a resume
- `POST /api/analysis/match`: Match candidates to job requirements
- `POST /api/analysis/query`: Process a natural language query about the database

#### Files
- `GET /api/files/:id`: Retrieve a file
- `POST /api/files`: Upload a file
- `DELETE /api/files/:id`: Delete a file

### Security
- JWT-based authentication
- Role-based access control
- Rate limiting
- Input validation
- CSRF protection

## Integration Points

### Zapier Integration
- **Webhook Configuration**:
  - Zapier sends form data to `/api/webhooks/zapier/form-submission`
  - Authentication via shared secret or API key
- **Data Mapping**:
  - Zapier form fields → Applicant database schema
  - File attachments → File storage service

### AI Services Integration
- **GEMINI API** for:
  - Resume analysis
  - Natural language search
  - Candidate matching
- **Custom AI Prompts** for different analysis tasks
- **Result caching** to reduce API costs

### File Storage Integration
- **Vercel Blob Storage**:
  - Direct integration with Next.js
  - Secure URL generation for file access
- **Alternative**: AWS S3 with presigned URLs

## Development Considerations

### Error Handling
- Comprehensive error catching and logging
- Graceful failure handling for AI services
- Retry mechanisms for transient failures

### Monitoring and Logging
- Request/response logging
- Performance metrics
- Error tracking
- AI service usage monitoring

### Testing Strategy
- Unit tests for business logic
- Integration tests for API endpoints
- Mock AI services for consistent testing

## Deployment Strategy
- **CI/CD Pipeline**: GitHub Actions
- **Hosting**: Vercel for serverless functions
- **Environment Configuration**:
  - Development
  - Staging
  - Production
- **Database Migration**: Handled by Prisma ORM

## Implementation Phases

### Phase 1: Core Backend
- Basic CRUD API for applicants
- Zapier webhook integration
- File storage for resumes
- Simple search functionality

### Phase 2: AI Integration
- Resume parsing and analysis
- Natural language search processing
- Candidate matching algorithm

### Phase 3: Advanced Features
- Complex database queries
- Bulk operations
- Advanced analytics
- API performance optimizations

## Success Metrics
- API response times under 200ms for basic operations
- 99.9% uptime for critical endpoints
- Error rates below 0.1%
- AI analysis completion in under 5 seconds