import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { mcpService } from '@/lib/mcp-service';
import { z } from 'zod';

const McpRequestSchema = z.object({
  service: z.enum(['clickup', 'neon']),
  operation: z.string(),
  params: z.record(z.unknown()).optional(),
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

    const services = {
      clickup: mcpService.clickup,
      neon: mcpService.neon
    };

    const serviceObj = services[service];
    const operationFn = (serviceObj as Record<string, unknown>)[operation];

    if (typeof operationFn !== 'function') {
      return NextResponse.json(
        { error: `Unknown operation: ${operation} for service: ${service}` },
        { status: 400 }
      );
    }

    const result = await operationFn(params);
    
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