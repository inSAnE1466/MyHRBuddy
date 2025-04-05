import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/applicants - List all applicants with filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');
    const skill = searchParams.get('skill');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    // Build the query
    const query: any = {
      include: {
        applications: {
          include: {
            position: true,
          }
        },
        skills: {
          include: {
            skill: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    };
    
    // Add filters
    if (position) {
      query.where = {
        ...query.where,
        applications: {
          some: {
            position: {
              title: {
                contains: position,
                mode: 'insensitive'
              }
            }
          }
        }
      };
    }
    
    if (skill) {
      query.where = {
        ...query.where,
        skills: {
          some: {
            skill: {
              name: {
                contains: skill,
                mode: 'insensitive'
              }
            }
          }
        }
      };
    }
    
    if (status) {
      query.where = {
        ...query.where,
        applications: {
          some: {
            status
          }
        }
      };
    }
    
    if (search) {
      query.where = {
        ...query.where,
        OR: [
          {
            firstName: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            lastName: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            email: {
              contains: search,
              mode: 'insensitive'
            }
          }
        ]
      };
    }
    
    const applicants = await prisma.applicant.findMany(query);
    
    // Format the response
    const formattedApplicants = applicants.map(applicant => ({
      id: applicant.id,
      name: `${applicant.firstName} ${applicant.lastName}`,
      email: applicant.email,
      phone: applicant.phone,
      location: applicant.location,
      positions: applicant.applications.map(app => ({
        id: app.position.id,
        title: app.position.title,
        status: app.status,
        appliedAt: app.appliedAt
      })),
      skills: applicant.skills.map(skill => ({
        id: skill.skill.id,
        name: skill.skill.name,
        yearsExperience: skill.yearsExperience,
        isAiDetected: skill.isAiDetected
      }))
    }));
    
    return NextResponse.json({ 
      applicants: formattedApplicants,
      count: formattedApplicants.length
    });
  } catch (error) {
    console.error('Error fetching applicants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applicants' },
      { status: 500 }
    );
  }
}

// POST /api/applicants - Create a new applicant
export async function POST(request: Request) {
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
      skills,
      position
    } = await request.json();
    
    // Validation
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'firstName, lastName, and email are required fields' },
        { status: 400 }
      );
    }
    
    // Create the applicant with a transaction to handle skills and position
    const result = await prisma.$transaction(async (tx) => {
      // Create the applicant
      const applicant = await tx.applicant.create({
        data: {
          firstName,
          lastName,
          email,
          phone,
          location,
          linkedinUrl,
          portfolioUrl,
          source,
        }
      });
      
      // Handle skills if provided
      if (skills && Array.isArray(skills) && skills.length > 0) {
        for (const skillData of skills) {
          // Find or create skill
          const skill = await tx.skill.upsert({
            where: { name: skillData.name },
            update: {},
            create: { name: skillData.name, category: skillData.category }
          });
          
          // Associate skill with applicant
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
      
      // Handle position if provided
      if (position && position.title) {
        // Find or create position
        const positionRecord = await tx.position.upsert({
          where: { 
            id: position.id || '' 
          },
          update: {},
          create: {
            title: position.title,
            department: position.department || 'General',
            description: position.description || ''
          }
        });
        
        // Create application
        const application = await tx.application.create({
          data: {
            applicantId: applicant.id,
            positionId: positionRecord.id,
            status: 'new',
            coverLetter: position.coverLetter || ''
          }
        });
        
        // Create application stage
        await tx.applicationStage.create({
          data: {
            applicationId: application.id,
            stage: 'applied',
            notes: 'Created via API',
            changedBy: 'system'
          }
        });
      }
      
      return applicant;
    });
    
    return NextResponse.json({ 
      success: true,
      applicant: {
        id: result.id,
        firstName: result.firstName,
        lastName: result.lastName,
        email: result.email
      }
    });
  } catch (error) {
    console.error('Error creating applicant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create applicant' },
      { status: 500 }
    );
  }
}