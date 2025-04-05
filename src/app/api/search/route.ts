import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { processNaturalLanguageQuery } from '@/lib/ai-service';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }
    
    // Process the natural language query with AI to extract search parameters
    const searchParams = await processNaturalLanguageQuery(query);
    
    // Build a database query based on the extracted parameters
    const dbQuery: any = {
      where: {
        AND: [] as any[],
      },
      include: {
        applicant: true,
        position: true,
        files: {
          where: {
            fileCategory: 'resume'
          }
        },
        aiAnalyses: {
          where: {
            analysisType: 'resume_analysis'
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    };
    
    // Add filters based on searchParams
    if (searchParams.skills && searchParams.skills.length > 0) {
      dbQuery.where.AND.push({
        applicant: {
          skills: {
            some: {
              skill: {
                name: {
                  in: searchParams.skills
                }
              }
            }
          }
        }
      });
    }
    
    if (searchParams.experience && searchParams.experience > 0) {
      dbQuery.where.AND.push({
        applicant: {
          skills: {
            some: {
              yearsExperience: {
                gte: searchParams.experience
              }
            }
          }
        }
      });
    }
    
    if (searchParams.jobTitles && searchParams.jobTitles.length > 0) {
      dbQuery.where.AND.push({
        position: {
          title: {
            in: searchParams.jobTitles
          }
        }
      });
    }
    
    if (searchParams.education) {
      dbQuery.where.AND.push({
        aiAnalyses: {
          some: {
            analysisResult: {
              path: ['education'],
              string_contains: searchParams.education
            }
          }
        }
      });
    }
    
    // If no filters were added, search across all applications
    if (dbQuery.where.AND.length === 0) {
      delete dbQuery.where.AND;
    }
    
    // Execute the search query
    const applications = await prisma.application.findMany(dbQuery);
    
    // Format the results
    const results = applications.map(app => ({
      id: app.id,
      applicant: {
        id: app.applicant.id,
        name: `${app.applicant.firstName} ${app.applicant.lastName}`,
        email: app.applicant.email,
        phone: app.applicant.phone,
        location: app.applicant.location,
      },
      position: {
        id: app.position.id,
        title: app.position.title,
      },
      status: app.status,
      appliedAt: app.appliedAt,
      resumeUrl: app.files[0]?.storagePath || null,
      aiAnalysis: app.aiAnalyses[0]?.analysisResult || null,
    }));
    
    return NextResponse.json({
      query,
      interpretedAs: searchParams,
      results,
      count: results.length,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process search query' },
      { status: 500 }
    );
  }
}