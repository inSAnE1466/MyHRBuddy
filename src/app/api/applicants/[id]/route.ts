import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/applicants/:id - Get a specific applicant
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const applicant = await prisma.applicant.findUnique({
      where: { id: params.id },
      include: {
        applications: {
          include: {
            position: true,
            files: true,
            stages: {
              orderBy: {
                changedAt: 'desc'
              }
            },
            aiAnalyses: {
              orderBy: {
                createdAt: 'desc'
              }
            }
          }
        },
        skills: {
          include: {
            skill: true
          }
        }
      }
    });
    
    if (!applicant) {
      return NextResponse.json({ error: 'Applicant not found' }, { status: 404 });
    }
    
    // Format the response
    const formattedApplicant = {
      id: applicant.id,
      firstName: applicant.firstName,
      lastName: applicant.lastName,
      fullName: `${applicant.firstName} ${applicant.lastName}`,
      email: applicant.email,
      phone: applicant.phone,
      location: applicant.location,
      linkedinUrl: applicant.linkedinUrl,
      portfolioUrl: applicant.portfolioUrl,
      source: applicant.source,
      createdAt: applicant.createdAt,
      updatedAt: applicant.updatedAt,
      applications: applicant.applications.map(app => ({
        id: app.id,
        position: {
          id: app.position.id,
          title: app.position.title,
          department: app.position.department
        },
        status: app.status,
        appliedAt: app.appliedAt,
        updatedAt: app.updatedAt,
        coverLetter: app.coverLetter,
        files: app.files.map(file => ({
          id: file.id,
          fileName: file.fileName,
          fileType: file.fileType,
          fileCategory: file.fileCategory,
          uploadedAt: file.uploadedAt,
          storagePath: file.storagePath
        })),
        stages: app.stages.map(stage => ({
          id: stage.id,
          stage: stage.stage,
          notes: stage.notes,
          changedAt: stage.changedAt,
          changedBy: stage.changedBy
        })),
        aiAnalysis: app.aiAnalyses[0] ? {
          id: app.aiAnalyses[0].id,
          type: app.aiAnalyses[0].analysisType,
          result: app.aiAnalyses[0].analysisResult,
          confidenceScore: app.aiAnalyses[0].confidenceScore,
          createdAt: app.aiAnalyses[0].createdAt
        } : null
      })),
      skills: applicant.skills.map(skill => ({
        id: skill.skill.id,
        name: skill.skill.name,
        category: skill.skill.category,
        yearsExperience: skill.yearsExperience,
        proficiencyLevel: skill.proficiencyLevel,
        isHighlighted: skill.isHighlighted,
        isAiDetected: skill.isAiDetected
      }))
    };
    
    return NextResponse.json(formattedApplicant);
  } catch (error) {
    console.error('Error fetching applicant:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applicant' },
      { status: 500 }
    );
  }
}

// PUT /api/applicants/:id - Update an applicant
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      location,
      linkedinUrl,
      portfolioUrl,
      source,
      skills
    } = await request.json();
    
    // Check if applicant exists
    const existingApplicant = await prisma.applicant.findUnique({
      where: { id: params.id }
    });
    
    if (!existingApplicant) {
      return NextResponse.json({ error: 'Applicant not found' }, { status: 404 });
    }
    
    // Update applicant with transaction to handle skills
    const result = await prisma.$transaction(async (tx) => {
      // Update basic applicant info
      const applicant = await tx.applicant.update({
        where: { id: params.id },
        data: {
          firstName,
          lastName,
          email,
          phone,
          location,
          linkedinUrl,
          portfolioUrl,
          source,
          updatedAt: new Date()
        }
      });
      
      // Handle skills if provided
      if (skills && Array.isArray(skills)) {
        // First, get existing skills for this applicant
        const existingSkills = await tx.applicantSkill.findMany({
          where: { applicantId: params.id },
          include: { skill: true }
        });
        
        // Process each skill from the request
        for (const skillData of skills) {
          if (skillData.id) {
            // Update existing applicant skill
            await tx.applicantSkill.update({
              where: { id: skillData.id },
              data: {
                yearsExperience: skillData.yearsExperience,
                proficiencyLevel: skillData.proficiencyLevel,
                isHighlighted: skillData.isHighlighted
              }
            });
          } else {
            // Find or create skill
            const skill = await tx.skill.upsert({
              where: { name: skillData.name },
              update: {},
              create: { name: skillData.name, category: skillData.category }
            });
            
            // Check if this skill is already associated
            const existingLink = existingSkills.find(es => 
              es.skill.name.toLowerCase() === skillData.name.toLowerCase()
            );
            
            if (existingLink) {
              // Update existing link
              await tx.applicantSkill.update({
                where: { id: existingLink.id },
                data: {
                  yearsExperience: skillData.yearsExperience,
                  proficiencyLevel: skillData.proficiencyLevel,
                  isHighlighted: skillData.isHighlighted
                }
              });
            } else {
              // Create new link
              await tx.applicantSkill.create({
                data: {
                  applicantId: applicant.id,
                  skillId: skill.id,
                  yearsExperience: skillData.yearsExperience,
                  proficiencyLevel: skillData.proficiencyLevel,
                  isHighlighted: skillData.isHighlighted || false,
                  isAiDetected: false
                }
              });
            }
          }
        }
        
        // Handle skill removals if needed
        if (skillData.removeSkills && Array.isArray(skillData.removeSkills)) {
          for (const skillId of skillData.removeSkills) {
            await tx.applicantSkill.deleteMany({
              where: {
                applicantId: params.id,
                skillId
              }
            });
          }
        }
      }
      
      return applicant;
    });
    
    return NextResponse.json({ 
      success: true,
      applicant: {
        id: result.id,
        firstName: result.firstName,
        lastName: result.lastName,
        email: result.email,
        updatedAt: result.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating applicant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update applicant' },
      { status: 500 }
    );
  }
}

// DELETE /api/applicants/:id - Delete an applicant
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    // Check if applicant exists
    const existingApplicant = await prisma.applicant.findUnique({
      where: { id: params.id }
    });
    
    if (!existingApplicant) {
      return NextResponse.json({ error: 'Applicant not found' }, { status: 404 });
    }
    
    // Delete the applicant (cascade will handle related records)
    await prisma.applicant.delete({
      where: { id: params.id }
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Applicant deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting applicant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete applicant' },
      { status: 500 }
    );
  }
}