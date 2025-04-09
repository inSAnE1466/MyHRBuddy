# MyHRBuddy Database PRD

## Overview
The MyHRBuddy database will store all applicant information, resumes, job positions, and AI analysis results. It needs to be optimized for fast querying, support complex search operations, and handle file storage references.

## Database Selection: Neon Postgres

### Justification
1. **Relational Structure**: Applicant data has clear relationships that benefit from SQL
2. **Serverless Compatibility**: Neon's serverless architecture works well with Vercel
3. **Scalability**: Automatic scaling for varying workloads
4. **Advanced Querying**: Support for full-text search and JSON operations
5. **Data Integrity**: ACID compliance for reliable HR data

## Database Schema

### Core Tables

#### `positions`
```sql
CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  description TEXT,
  requirements JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `applicants`
```sql
CREATE TABLE applicants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  location TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `applications`
```sql
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  position_id UUID NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'new',
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cover_letter TEXT,
  zapier_form_data JSONB, -- Raw form data from Zapier
  UNIQUE(applicant_id, position_id)
);
```

#### `files`
```sql
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  storage_provider TEXT NOT NULL DEFAULT 'vercel_blob',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  file_category TEXT NOT NULL -- 'resume', 'cover_letter', 'portfolio', etc.
);
```

#### `skills`
```sql
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `applicant_skills`
```sql
CREATE TABLE applicant_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  years_experience INTEGER,
  proficiency_level TEXT,
  is_highlighted BOOLEAN DEFAULT FALSE,
  is_ai_detected BOOLEAN DEFAULT FALSE,
  UNIQUE(applicant_id, skill_id)
);
```

#### `ai_analyses`
```sql
CREATE TABLE ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL, -- 'resume_analysis', 'job_match', etc.
  analysis_result JSONB NOT NULL,
  confidence_score FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  model_version TEXT
);
```

#### `application_stages`
```sql
CREATE TABLE application_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  stage TEXT NOT NULL, -- 'applied', 'screening', 'interview', 'offer', 'hired', 'rejected'
  notes TEXT,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  changed_by TEXT
);
```

### Indexes

```sql
-- For fast applicant searches
CREATE INDEX idx_applicants_name ON applicants(last_name, first_name);
CREATE INDEX idx_applicants_email ON applicants(email);

-- For application status filtering
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_position ON applications(position_id);

-- For skills searching
CREATE INDEX idx_applicant_skills ON applicant_skills(applicant_id, skill_id);
CREATE INDEX idx_skills_name ON skills(name);

-- For full-text search capabilities
CREATE INDEX idx_positions_text ON positions USING GIN (to_tsvector('english', title || ' ' || description));
CREATE INDEX idx_applications_json ON applications USING GIN (zapier_form_data jsonb_path_ops);
CREATE INDEX idx_ai_analyses_json ON ai_analyses USING GIN (analysis_result jsonb_path_ops);

-- For file retrieval
CREATE INDEX idx_files_application ON files(application_id, file_category);
```

## File Storage Strategy

### Resume and Document Storage
- **Primary Option**: Vercel Blob Storage
  - Seamless integration with Next.js
  - Serverless-friendly
  - Built-in security

- **Alternative Option**: AWS S3
  - Higher customization
  - Potentially lower costs at scale

### File Metadata
- All files will have metadata stored in the `files` table
- Actual file content stored in blob storage
- Access controlled via application logic

## Data Management

### Data Import Process
1. Zapier form triggers webhook to application
2. Application creates/updates applicant record
3. Application creates application record with position reference
4. Raw form data stored in JSON field for future reference
5. Files (resumes, etc.) uploaded to blob storage
6. File references stored in database

### Data Retention Policy
- Application data: 2 years (configurable)
- Resume files: 1 year after application closes
- Analysis results: Tied to application retention

## Database Migrations
- Use Prisma migrations for schema changes
- Version control all migrations
- Automated testing of migrations

## Backup and Recovery
- Daily automated backups
- Point-in-time recovery capability
- 30-day retention of backups

## Search Optimization

### Full-text Search
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enable searching across multiple fields
CREATE OR REPLACE FUNCTION applicant_search_document(a applicants, app applications)
RETURNS tsvector AS $$
BEGIN
  RETURN to_tsvector('english',
    coalesce(a.first_name, '') || ' ' ||
    coalesce(a.last_name, '') || ' ' ||
    coalesce(a.email, '') || ' ' ||
    coalesce(app.zapier_form_data::text, '')
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Materialized view for faster searching
CREATE MATERIALIZED VIEW applicant_search AS
SELECT
  a.id as applicant_id,
  app.id as application_id,
  app.position_id,
  applicant_search_document(a, app) as search_document
FROM
  applicants a
JOIN
  applications app ON a.id = app.applicant_id;

CREATE INDEX idx_applicant_search ON applicant_search USING GIN (search_document);
```

### AI-enhanced Search
- Store extracted entities and keywords in structured format
- Build specialized indexes for common search patterns
- Cache frequent search results

## Performance Considerations
- Consider partitioning for large tables (by year, position)
- Use materialized views for complex reporting queries
- Implement connection pooling
- Monitor query performance and optimize as needed

## Security Measures
- Row-level security for multi-tenant isolation
- Encrypted personally identifiable information (PII)
- Access logging for sensitive operations
- Regular security audits

## Scaling Strategy
- Monitor database size and query performance
- Scale vertically with Neon's compute resources
- Implement read replicas if needed for reporting queries
- Consider sharding for multi-region deployments