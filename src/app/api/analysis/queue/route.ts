import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzeResume } from '@/lib/ai-service';

export async function POST(request: Request) {
  // Verify internal API call authentication
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.ZAPIER_WEBHOOK_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  
  try {
    const { application_id } = await request.json();
    
    if (!application_id) {
      return NextResponse.json({ error: 'application_id is required' }, { status: 400 });
    }
    
    // Get application with related files and data
    const application = await prisma.application.findUnique({
      where: { id: application_id },
      include: {
        applicant: true,
        position: true,
        files: {
          where: {
            fileCategory: 'resume'
          }
        }
      }
    });
    
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    // Process resume if available
    if (application.files.length > 0) {
      const resumeFile = application.files[0];
      
      try {
        // Get resume content (placeholder for actual text extraction)
        // In a real implementation, you would:
        // 1. Download the file from blob storage
        // 2. Extract text using a PDF parser or similar
        // For now, let's assume we have the text from the zapier_form_data
        
        // This would need a real implementation of text extraction
        let resumeText = '';
        
        if (application.zapierFormData && typeof application.zapierFormData === 'object') {
          // Try to get resume text from form data if provided
          resumeText = (application.zapierFormData as any).resume_text || '';
        }
        
        // If no text is available from form data, mark as pending
        if (!resumeText) {
          await prisma.aIAnalysis.create({
            data: {
              applicationId: application_id,
              analysisType: 'resume_parsing',
              analysisResult: { status: 'pending', message: 'Resume text extraction required' },
              modelVersion: 'gemini-2.0-flash'
            }
          });
          
          return NextResponse.json({ 
            status: 'pending', 
            message: 'Resume text extraction required before analysis can proceed'
          });
        }
        
        // Analyze resume with AI
        const analysisResult = await analyzeResume(resumeText);
        
        // Store analysis results
        await prisma.aIAnalysis.create({
          data: {
            applicationId: application_id,
            analysisType: 'resume_analysis',
            analysisResult,
            confidenceScore: 0.9, // Placeholder
            modelVersion: 'gemini-2.0-flash'
          }
        });
        
        // Extract and store skills if available
        if (analysisResult.skills && Array.isArray(analysisResult.skills)) {
          for (const skillName of analysisResult.skills) {
            // Find or create the skill
            const skill = await prisma.skill.upsert({
              where: { name: skillName },
              update: {},
              create: { name: skillName }
            });
            
            // Associate skill with applicant
            await prisma.applicantSkill.upsert({
              where: {
                applicantId_skillId: {
                  applicantId: application.applicantId,
                  skillId: skill.id
                }
              },
              update: { isAiDetected: true },
              create: {
                applicantId: application.applicantId,
                skillId: skill.id,
                isAiDetected: true
              }
            });
          }
        }
        
        return NextResponse.json({ success: true, message: 'Resume analysis completed' });
      } catch (error) {
        console.error('Resume analysis error:', error);
        
        // Log the error in the database
        await prisma.aIAnalysis.create({
          data: {
            applicationId: application_id,
            analysisType: 'resume_analysis',
            analysisResult: { error: 'Failed to analyze resume', message: (error as Error).message },
            modelVersion: 'gemini-2.0-flash'
          }
        });
        
        return NextResponse.json(
          { success: false, error: 'Failed to analyze resume' },
          { status: 500 }
        );
      }
    } else {
      // No resume file found
      await prisma.aIAnalysis.create({
        data: {
          applicationId: application_id,
          analysisType: 'resume_analysis',
          analysisResult: { status: 'no_resume', message: 'No resume file found for analysis' },
          modelVersion: 'gemini-2.0-flash'
        }
      });
      
      return NextResponse.json({ 
        status: 'no_resume', 
        message: 'No resume file found for analysis' 
      });
    }
  } catch (error) {
    console.error('Queue processing error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process analysis queue' },
      { status: 500 }
    );
  }
}