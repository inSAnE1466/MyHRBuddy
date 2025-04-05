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
    const applicant = await prisma.applicant.upsert({
      where: { email: formData.email },
      update: {
        firstName: formData.first_name,
        lastName: formData.last_name,
        phone: formData.phone,
        location: formData.location,
        linkedinUrl: formData.linkedin_url,
        portfolioUrl: formData.portfolio_url,
        source: formData.referral_source,
      },
      create: {
        email: formData.email,
        firstName: formData.first_name,
        lastName: formData.last_name,
        phone: formData.phone,
        location: formData.location,
        linkedinUrl: formData.linkedin_url,
        portfolioUrl: formData.portfolio_url,
        source: formData.referral_source,
      },
    });
    
    // Find or create position
    let position = await prisma.position.findFirst({
      where: {
        title: formData.position_applied,
      },
    });
    
    if (!position) {
      position = await prisma.position.create({
        data: {
          title: formData.position_applied,
          department: formData.department || 'Unknown',
          description: formData.position_description || '',
        },
      });
    }
    
    // Create application record
    const application = await prisma.application.create({
      data: {
        applicantId: applicant.id,
        positionId: position.id,
        status: 'new',
        coverLetter: formData.cover_letter,
        zapierFormData: formData,
      },
    });
    
    // Create initial application stage
    await prisma.applicationStage.create({
      data: {
        applicationId: application.id,
        stage: 'applied',
        notes: 'Application received via Zapier form',
        changedBy: 'system',
      },
    });
    
    // Handle resume upload if included
    if (formData.resume_url) {
      try {
        // Download file from temporary Zapier URL
        const response = await fetch(formData.resume_url);
        
        if (!response.ok) {
          throw new Error(`Failed to download resume: ${response.statusText}`);
        }
        
        const fileBuffer = await response.arrayBuffer();
        
        // Save to blob storage
        const storagePath = await saveFile(
          new Uint8Array(fileBuffer),
          formData.resume_filename || 'resume.pdf',
          application.id
        );
        
        // Create file record
        await prisma.file.create({
          data: {
            applicationId: application.id,
            fileName: formData.resume_filename || 'resume.pdf',
            fileType: formData.resume_content_type || 'application/pdf',
            fileSize: fileBuffer.byteLength,
            storagePath: storagePath,
            fileCategory: 'resume'
          }
        });
      } catch (fileError) {
        console.error('Error processing resume file:', fileError);
        // Continue processing the application even if file handling fails
      }
    }
    
    // Queue AI analysis asynchronously
    try {
      await fetch(new URL('/api/analysis/queue', request.url).toString(), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // Pass through the authorization header for internal API calls
          'Authorization': authHeader 
        },
        body: JSON.stringify({ application_id: application.id })
      });
    } catch (analysisError) {
      console.error('Failed to queue analysis:', analysisError);
      // Continue - analysis can be triggered later
    }
    
    return NextResponse.json({ 
      success: true, 
      applicant_id: applicant.id,
      application_id: application.id 
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process submission' },
      { status: 500 }
    );
  }
}