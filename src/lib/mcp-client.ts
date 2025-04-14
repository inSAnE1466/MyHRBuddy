// src/lib/mcp-client.ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { HttpClientTransport } from "@modelcontextprotocol/sdk/client/transports/http";

/**
 * Interface for MCP tool result
 */
export interface McpToolResult {
  content: Array<{
    type: string;
    text: string;
  }>;
}

/**
 * Create an MCP client connected to a remote MCP server
 */
export async function createMcpClient(
  serverUrl: string, 
  apiKey: string,
  clientName: string = "myhrbuddy-client"
): Promise<Client> {
  try {
    console.log(`Initializing MCP client for ${serverUrl}...`);
    
    // Create HTTP transport to connect to the remote MCP server
    const transport = new HttpClientTransport({
      url: serverUrl,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });
    
    // Create the client
    const client = new Client({
      name: clientName,
      version: "1.0.0"
    });
    
    // Connect to the remote server
    console.log(`Connecting to MCP server at ${serverUrl}...`);
    await client.connect(transport);
    console.log("Connected to MCP server successfully");
    
    return client;
  } catch (error) {
    console.error("Error connecting to MCP server:", error);
    throw new Error(`Failed to connect to MCP server: ${(error as Error).message}`);
  }
}

/**
 * Call a tool on the remote MCP server
 */
export async function callMcpTool<T extends Record<string, any>>(
  client: Client, 
  toolName: string, 
  params: T
): Promise<McpToolResult> {
  try {
    console.log(`Calling MCP tool: ${toolName} with params:`, params);
    
    const result = await client.callTool({
      name: toolName,
      arguments: params
    });
    
    return result as McpToolResult;
  } catch (error) {
    console.error(`Error calling MCP tool ${toolName}:`, error);
    throw error;
  }
}