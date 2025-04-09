# MyHRBuddy Zapier Integration Guide

## Overview
This document outlines the integration between the existing Zapier form solution and the MyHRBuddy ATS system, focusing on how data flows from form submissions into the database and becomes available for AI-powered search and analysis.

## Integration Architecture

### Data Flow
```
Zapier Form Submission → Zapier Webhook → MyHRBuddy API → Database → Available for Search/Analysis
```

## Integration Options

### Option 1: Webhook Integration (Recommended)
This approach uses a webhook to send form data to your application's API, which then processes and stores the data.

#### Implementation Steps:
1. **Create a webhook endpoint in MyHRBuddy**:
   ```typescript
   // In /app/api/webhooks/zapier/route.ts
   import { NextResponse } from 'next/server';
   import { prisma } from '@/lib/prisma';
   import { saveFile } from '@/lib/file-storage';
   
   export async function POST(request: Request) {
     // Verify webhook secret
     const authHeader = request.headers.get('authorization');
     if (authHeader !== `Bearer ${process.env.ZAPIER_WEBHOOK_SECRET}`) {
       return new NextResponse('Unauthorized', { status: 401 });
     }
     
     try {
       const formData = await request.json();
       
       // Create or update applicant record
       const applicant = await prisma.applicants.upsert({
         where: { email: formData.email },
         update: {
           first_name: formData.first_name,
           last_name: formData.last_name,
           // other fields...
         },
         create: {
           email: formData.email,
           first_name: formData.first_name,
           last_name: formData.last_name,
           // other fields...
         },
       });
       
       // Create application record
       const application = await prisma.applications.create({
         data: {
           applicant_id: applicant.id,
           position_id: formData.position_id,
           zapier_form_data: formData,
           // other fields...
         },
       });
       
       // Handle resume upload if included
       if (formData.resume_url) {
         // Download file from temporary Zapier URL
         const response = await fetch(formData.resume_url);
         const fileBuffer = await response.arrayBuffer();
         
         // Save to blob storage
         const storagePath = await saveFile(
           new Uint8Array(fileBuffer),
           formData.resume_filename,
           application.id
         );
         
         // Create file record
         await prisma.files.create({
           data: {
             application_id: application.id,
             file_name: formData.resume_filename,
             file_type: formData.resume_content_type,
             file_size: fileBuffer.byteLength,
             storage_path: storagePath,
             file_category: 'resume'
           }
         });
       }
       
       // Trigger AI analysis (async)
       await fetch('/api/analysis/queue', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ application_id: application.id })
       });
       
       return NextResponse.json({ success: true, application_id: application.id });
     } catch (error) {
       console.error('Webhook error:', error);
       return NextResponse.json(
         { success: false, error: 'Failed to process submission' },
         { status: 500 }
       );
     }
   }
   ```

2. **Configure the Zapier action**:
   - In Zapier, add a "Webhook" action to your Zap
   - Set the webhook URL to your deployed endpoint (e.g., `https://myhrbuddy.vercel.app/api/webhooks/zapier`)
   - Configure the payload to include all form fields
   - Add the authorization header with your webhook secret
   - Set up proper error handling

### Option 2: Direct Database Integration
If you prefer to have Zapier write directly to the database:

#### Implementation Steps:
1. **Create a database connection in Zapier**:
   - Add "PostgreSQL" as an action in your Zap
   - Configure the connection to your Neon Postgres database
   - Create a dedicated read/write user for Zapier with limited permissions
   - Use environment variables for secure credential storage

2. **Set up the database write operation**:
   - Configure Zapier to insert into the `applicants` table first
   - Use a second step to insert into the `applications` table
   - For file attachments, you'll still need a webhook or additional service

3. **Handle asynchronous processing**:
   - Create a scheduled task in your application to process new records
   - Run AI analysis on unprocessed applications
   - Update records with analysis results

## Handling File Attachments

### Resume Storage Options

1. **Zapier Storage to Blob Transfer**:
   - Zapier temporarily stores the file and provides a download URL
   - Your webhook downloads the file and transfers it to your blob storage
   - Store the permanent path in your database

2. **Direct Upload from Zapier to S3**:
   - Configure Zapier's S3 integration to upload files directly
   - Store the S3 path in your database via the webhook or database action

### File Processing Workflow

1. **Resume Reception**:
   - Receive file from form submission
   - Store in blob storage
   - Create database record with file metadata

2. **Document Processing**:
   - Extract text from resume (PDF, DOCX, etc.)
   - Parse structured information (contact details, skills, experience)
   - Store extracted data for searching

3. **AI Analysis**:
   - Send extracted text to AI service for deeper analysis
   - Identify key skills, experience levels, education, etc.
   - Calculate match scores for different positions
   - Store analysis results in database

## Data Mapping

### Zapier Form to Database Mapping

| Zapier Form Field | Database Table | Database Column |
|-------------------|----------------|-----------------|
| email | applicants | email |
| first_name | applicants | first_name |
| last_name | applicants | last_name |
| phone | applicants | phone |
| position_applied | positions | title (lookup) |
| resume | files | (multiple fields) |
| cover_letter | applications | cover_letter |
| linkedin_url | applicants | linkedin_url |
| portfolio_url | applicants | portfolio_url |
| referral_source | applicants | source |
| custom_questions | applications | zapier_form_data (JSON) |

## Error Handling and Monitoring

### Error Scenarios
1. **Duplicate submissions**: Use upsert operations to handle
2. **Missing required fields**: Validate before database insertion
3. **File download failures**: Implement retry logic
4. **Database connection issues**: Queue failed operations

### Monitoring Strategy
1. **Webhook logs**: Track all incoming webhook calls
2. **Integration status dashboard**: View Zapier-to-database health
3. **Error alerts**: Set up notifications for critical failures

## Testing the Integration

### Test Plan
1. **Create test form submissions** in Zapier sandbox
2. **Verify data appears** in database with correct schema
3. **Check file storage** for proper resume storage
4. **Validate AI processing** triggers correctly
5. **Test error scenarios** to ensure robust handling

## Security Considerations

### Authentication
- Use webhook secrets or API keys
- Rotate credentials regularly
- Implement IP restrictions if possible

### Data Protection
- Encrypt sensitive applicant data
- Use TLS for all data transmission
- Implement access controls for HR data

## Recommended Implementation

For your MyHRBuddy ATS system, we recommend Option 1 (Webhook Integration) because:
1. **Greater control** over data processing logic
2. **Better file handling** capabilities
3. **Immediate AI processing** triggers
4. **Cleaner architecture** with proper separation of concerns
5. **Easier testing and debugging**

This approach allows your application to handle the complexity of applicant processing while keeping the Zapier integration simple and focused on data transmission.