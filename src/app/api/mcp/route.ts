// src/app/api/mcp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { mcpService } from '@/lib/mcp-service';
import { z } from 'zod';

// Type for the service operations
type ServiceOperation = {
  [key: string]: (...args: any[]) => Promise<any>;
};

// Validation schema for MCP request
const McpRequestSchema = z.object({
  service: z.enum(['clickup', 'neon']),
  operation: z.string(),
  params: z.record(z.any()).optional(),
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
    
    const validationResult = McpRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request format',
          details: validationResult.error.format() 
        },
        { status: 400 }
      );
    }
    
    const { service, operation, params = {} } = validationResult.data;
    
    // 3. Execute the operation using our MCP service
    let serviceObj: ServiceOperation;
    
    switch (service) {
      case 'clickup':
        serviceObj = mcpService.clickup;
        break;
        
      case 'neon':
        serviceObj = mcpService.neon;
        break;
        
      default:
        return NextResponse.json(
          { error: `Unknown service: ${service}` },
          { status: 400 }
        );
    }
    
    // Check if the operation exists
    if (typeof serviceObj[operation] !== 'function') {
      return NextResponse.json(
        { error: `Unknown operation: ${operation} for service: ${service}` },
        { status: 400 }
      );
    }
    
    // Execute the operation
    const result = await serviceObj[operation](params);
    
    // 4. Return the result
    return NextResponse.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('MCP route error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: (error as Error).message 
      },
      { status: 500 }
    );
  }
}