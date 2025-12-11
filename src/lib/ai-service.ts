import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from '@google/generative-ai';
import { mcpService } from './mcp-service';
import { prisma } from './prisma';
import { Applicant, Application, Position, Skill } from '@prisma/client';
import * as clickupMcp from './clickup-mcp';
import { sendEmail } from './email-service';

type ResumeAnalysis = {
  skills?: string[];
  yearsOfExperience?: number;
  education?: string;
  previousRoles?: Array<{ title: string; company: string }>;
  assessment?: string;
  rawAnalysis?: string;
  error?: string;
  rawOutput?: string;
};

type ApplicantSummaryResult = {
  html: string;
  generatedAt: string;
  modelVersion: string;
};

type ApplicantWithRelations = Applicant & {
  applications: (Application & { position: Position })[];
  skills: Array<{ skill: Skill; skillId: string; applicantId: string }>;
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const defaultGenerationConfig: GenerationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 2048,
};

function getModel(modelName = "gemini-2.0-flash"): GenerativeModel {
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: defaultGenerationConfig,
  });
}

export async function generateEmailContent(params: {
  applicantName: string;
  positionTitle: string;
  stage: string;
  customMessage?: string;
}): Promise<string> {
  const model = getModel();

  const prompt = `
    Write a professional email to an applicant named ${params.applicantName} 
    regarding their application for the ${params.positionTitle} position.
    The application is currently in the "${params.stage}" stage.
    ${params.customMessage ? `Include this custom message: ${params.customMessage}` : ''}
    
    The email should be professional, concise, and provide clear next steps.
    Format the email with appropriate HTML tags (<p>, <h2>, etc.) for display in an email client.
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  return text;
}

export async function analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
  const model = getModel();

  const prompt = `
    Analyze the following resume and extract key information:
    
    ${resumeText}
    
    Please provide the following in JSON format:
    1. A list of skills identified
    2. Years of experience (if specified)
    3. Education details
    4. Previous job titles and companies
    5. A brief assessment of their qualifications
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    const jsonMatch = text.match(/```json([\s\S]*?)```/) || text.match(/{[\s\S]*}/);

    if (jsonMatch) {
      const jsonStr = jsonMatch[0].replace(/```json|```/g, '').trim();
      return JSON.parse(jsonStr);
    }
    return { rawAnalysis: text };
  } catch (error) {
    console.error('Error parsing resume analysis:', error);
    return {
      error: 'Failed to parse analysis',
      rawOutput: text
    };
  }
}

export async function generateApplicantSummary(applicant: ApplicantWithRelations): Promise<ApplicantSummaryResult> {
  const model = getModel();

  const application = applicant.applications[0];
  const position = application?.position;
  const skills = applicant.skills.map(s => s.skill.name).join(', ');

  const prompt = `
    Generate a comprehensive HTML summary for the following job applicant:

    Name: ${applicant.firstName} ${applicant.lastName || ''}
    Email: ${applicant.email}
    Phone: ${applicant.phone || 'Not provided'}
    Location: ${applicant.location || 'Not provided'}
    Position Applied For: ${position?.title || 'Not specified'}
    Skills: ${skills || 'None specified'}
    LinkedIn: ${applicant.linkedinUrl || 'Not provided'}
    Portfolio: ${applicant.portfolioUrl || 'Not provided'}
    
    Please format the summary with HTML that includes:
    - A header with the applicant's name
    - Sections for contact information, skills, and qualifications
    - A brief assessment of their fit for the position
    - Styling with appropriate CSS classes (we use Tailwind CSS)
  `;

  const result = await model.generateContent(prompt);
  const htmlSummary = result.response.text();
  
  return {
    html: htmlSummary,
    generatedAt: new Date().toISOString(),
    modelVersion: 'gemini-2.0-flash'
  };
}

export async function processApplicantWorkflow(params: {
  applicantId: string;
  positionTitle: string;
  stage: string;
  comments?: string;
  listId: string;
}): Promise<{ success: boolean; taskCreated?: boolean; emailSent?: boolean; error?: string }> {
  try {
    const applicant = await prisma.applicant.findUnique({
      where: { id: params.applicantId },
      include: {
        applications: {
          include: { position: true },
          take: 1,
          orderBy: { appliedAt: 'desc' }
        }
      }
    });
    
    if (!applicant) {
      throw new Error('Applicant not found');
    }

    await mcpService.initialize();

    const emailHtml = await generateEmailContent({
      applicantName: `${applicant.firstName} ${applicant.lastName || ''}`,
      positionTitle: params.positionTitle,
      stage: params.stage,
      customMessage: params.comments
    });

    const createTaskParams: clickupMcp.CreateTaskParams = {
      list_id: params.listId,
      name: `Applicant: ${applicant.firstName} ${applicant.lastName || ''}`,
      description: params.comments || `Applicant is in the ${params.stage} stage.`,
      status: params.stage
    };
    
    const taskResult = await mcpService.clickup.createTask(createTaskParams);

    await sendEmail({
      to: applicant.email,
      subject: `Your Application Status: ${params.positionTitle}`,
      html: emailHtml,
      from: process.env.SENDGRID_FROM_EMAIL || 'hr@myhrbuddy.com'
    });

    await prisma.applicationStage.create({
      data: {
        applicationId: applicant.applications[0].id,
        stage: params.stage,
        notes: params.comments || `Updated via workflow.`,
        changedBy: 'system'
      }
    });

    return {
      success: true,
      taskCreated: !!taskResult,
      emailSent: true
    };
  } catch (error) {
    console.error('Error in workflow:', error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
}
