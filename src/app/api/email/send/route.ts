// src/app/api/email/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sendEmail } from '@/lib/email-service';
import { z } from 'zod';

// Validation schema for email request
const EmailRequestSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  subject: z.string().min(1, "Subject cannot be empty"),
  html: z.string().min(1, "Email body cannot be empty"),
  from: z.string().email().optional(),
  cc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
  bcc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
  replyTo: z.string().email().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate the request
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // 2. Parse and validate the request body
    const body = await request.json();
    
    const validationResult = EmailRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid email request format',
          details: validationResult.error.format() 
        },
        { status: 400 }
      );
    }
    
    // 3. Send the email
    await sendEmail(validationResult.data);
    
    // 4. Return success response
    return NextResponse.json({
      success: true,
      message: 'Email sent successfully'
    });
  } catch (error) {
    console.error('Email sending error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: (error as Error).message 
      },
      { status: 500 }
    );
  }
}
