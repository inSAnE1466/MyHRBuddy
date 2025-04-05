import axios from 'axios';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const API_KEY = process.env.GEMINI_API_KEY;

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

/**
 * Analyzes a resume using Gemini AI
 * @param resumeText - The text content of a resume to analyze
 * @returns Structured data extracted from the resume
 */
export async function analyzeResume(resumeText: string): Promise<any> {
  const prompt = `
    You are an expert HR assistant analyzing a resume. Extract the following information from this resume and format it as JSON:
    
    1. Contact Information (name, email, phone, location)
    2. Work Experience (company, title, dates, responsibilities, achievements)
    3. Education (school, degree, field of study, dates)
    4. Skills (technical, soft, level if mentioned)
    5. Projects (if any)
    
    Provide the response as a valid JSON object without explanations. Resume:
    
    ${resumeText}
  `;

  const response = await callGeminiAPI(prompt);
  
  try {
    // Extract JSON from the response text
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || 
                      response.match(/\{[\s\S]*\}/);
                      
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0].replace(/```json|```/g, '').trim());
    } else {
      // If no JSON format detected, return the raw text
      return { rawAnalysis: response };
    }
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    return { error: 'Failed to parse AI response', rawResponse: response };
  }
}

/**
 * Matches an applicant to job requirements
 * @param applicantData - Structured data about the applicant
 * @param jobRequirements - The job requirements to match against
 * @returns A match analysis with score and reasoning
 */
export async function matchToJob(applicantData: any, jobRequirements: any): Promise<any> {
  const prompt = `
    You are an expert HR assistant matching a candidate to a job. 
    
    CANDIDATE DATA:
    ${JSON.stringify(applicantData)}
    
    JOB REQUIREMENTS:
    ${JSON.stringify(jobRequirements)}
    
    Analyze how well this candidate matches the job requirements. Provide:
    1. Overall match score (0-100)
    2. Strengths (skills and experiences that match well)
    3. Gaps (requirements the candidate doesn't meet)
    4. Recommendation (hire, interview, reject)
    
    Format your response as JSON without explanations.
  `;

  const response = await callGeminiAPI(prompt);
  
  try {
    // Extract JSON from the response
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || 
                      response.match(/\{[\s\S]*\}/);
                      
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0].replace(/```json|```/g, '').trim());
    } else {
      return { rawAnalysis: response };
    }
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    return { error: 'Failed to parse AI response', rawResponse: response };
  }
}

/**
 * Processes a natural language query about applicants
 * @param query - The natural language query (e.g., "Find React developers with 5+ years experience")
 * @returns Structured query parameters to use in database search
 */
export async function processNaturalLanguageQuery(query: string): Promise<any> {
  const prompt = `
    You are an expert HR assistant helping to search for candidates.
    Convert this natural language query into structured search parameters that could be used in a database query:
    
    QUERY: "${query}"
    
    Extract relevant search parameters such as:
    1. Skills or technologies
    2. Years of experience
    3. Education level
    4. Job titles
    5. Industries
    6. Any other relevant filters
    
    Format your response as JSON without explanations.
  `;

  const response = await callGeminiAPI(prompt);
  
  try {
    // Extract JSON from the response
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || 
                      response.match(/\{[\s\S]*\}/);
                      
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0].replace(/```json|```/g, '').trim());
    } else {
      return { rawAnalysis: response };
    }
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    return { error: 'Failed to parse AI response', rawResponse: response };
  }
}

/**
 * Makes a call to the Gemini API
 * @param prompt - The prompt to send to Gemini
 * @returns The text response from Gemini
 */
async function callGeminiAPI(prompt: string): Promise<string> {
  try {
    if (!API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    const response = await axios.post<GeminiResponse>(
      `${GEMINI_API_URL}?key=${API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 4096,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const textResponse = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return textResponse;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    if (axios.isAxiosError(error)) {
      console.error('API Response:', error.response?.data);
    }
    throw new Error('Failed to get response from Gemini API');
  }
}