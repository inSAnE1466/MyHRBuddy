# MyHRBuddy Frontend PRD

## Overview
MyHRBuddy is an AI-powered Applicant Tracking System (ATS) that enables HR teams to intelligently search, filter, and analyze job applicants. The frontend provides an intuitive interface for interacting with applicant data stored in the database.

## User Personas
- **HR Managers**: Need to track overall application status and make hiring decisions
- **Recruiters**: Need to search and filter candidates based on specific criteria
- **Hiring Managers**: Need to review specific candidates and provide feedback

## Design System
- **Color Palette**: Green and cream theme
  - Primary: `#10B981` (emerald green)
  - Secondary: `#F5F5DC` (cream)
  - Accent: `#047857` (dark green)
  - Text: `#1F2937` (dark gray)
- **Typography**:
  - Primary font: Inter
  - Headings: 24px-48px
  - Body: 16px
- **Components**: Use shadcn/ui component library

## Core Features

### 1. Dashboard
- **Overview metrics**:
  - Total applicants by position
  - Applicants by stage
  - Recent applications
  - AI insights panel
- **Quick actions**:
  - Search applicants
  - View recent applicants
  - Access saved filters

### 2. Smart Search
- **Natural language search bar**:
  - Example: "Show me all SWEs with UX experience and 5+ years in fintech"
- **Structured filters**:
  - Job position
  - Skills/experience
  - Education
  - Application date
  - Stage in hiring process
- **Save and load searches**

### 3. Candidate List View
- **Sortable, filterable table with**:
  - Name
  - Position applied for
  - Key skills/experience (AI-extracted)
  - Application date
  - Current stage
  - Match score (AI-generated)
- **Bulk actions**:
  - Move to stage
  - Add tags
  - Export data

### 4. Candidate Detail View
- **Applicant profile**:
  - Contact information
  - Resume/CV preview and download
  - Form submission details
- **AI analysis panel**:
  - Skills summary
  - Experience highlights
  - Potential role matches
  - Suggested interview questions
- **Timeline of interactions**
- **Notes and feedback section**

### 5. Database Visualization Component
- **Interactive data table**:
  - View all database records
  - Sort and filter capabilities
  - Column customization
- **AI query interface**:
  - Ask questions about the data
  - Get visualizations and insights
- **Export functionality**

## User Flows

### Main User Flow
1. User logs in to MyHRBuddy
2. Dashboard displays key metrics and recent applications
3. User enters natural language search or uses structured filters
4. System displays matching candidates
5. User reviews candidates and accesses detailed profiles
6. User can add notes, change application stage, or request AI analysis

### AI Query Flow
1. User navigates to database visualization component
2. User enters a natural language query about candidates
3. AI processes the request and returns relevant results
4. Results are displayed as a list or visualization
5. User can refine the query or export the results

## Technical Requirements

### Frontend Architecture
- **Framework**: Next.js with App Router
- **State Management**: React Context with hooks for global state
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui library
- **Authentication**: NextAuth.js with role-based permissions

### API Integration
- **Endpoints**:
  - `/api/applicants`: CRUD operations for applicant data
  - `/api/search`: Natural language search processing
  - `/api/analysis`: AI analysis of applicants and queries
- **Real-time updates**: WebSockets or SWR for live data updates

### Responsive Design
- Fully responsive across desktop, tablet, and mobile
- Optimized layouts for different screen sizes

## Implementation Phases

### Phase 1: Core System
- Basic dashboard
- Structured search and filters
- Candidate list and detail views
- Database connection

### Phase 2: AI Integration
- Natural language search
- AI analysis of candidates
- Smart matching features

### Phase 3: Advanced Features
- Database visualization component
- AI query interface
- Export and reporting tools

## Success Metrics
- Time saved in candidate search and filtering
- Accuracy of AI matching and analysis
- User engagement with AI features
- Reduction in time-to-hire

## Technical Constraints
- Must work with the existing Zapier form integration
- Must support file storage and retrieval (resumes)
- Must maintain performance with large applicant databases