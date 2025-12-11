import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

export interface McpToolResult {
  content: Array<{
    type: string;
    text: string;
  }>;
}

export async function createMcpClient(
  serverUrl: string,
  apiKey: string,
  clientName: string = "myhrbuddy-client"
): Promise<Client> {
  try {
    console.log(`Initializing MCP client for ${serverUrl}...`);

    const url = new URL(serverUrl);
    const transport = new SSEClientTransport(url, {
      requestInit: {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      }
    });

    const client = new Client({
      name: clientName,
      version: "1.0.0"
    });

    console.log(`Connecting to MCP server at ${serverUrl}...`);
    await client.connect(transport);
    console.log("Connected to MCP server successfully");

    return client;
  } catch (error) {
    console.error("Error connecting to MCP server:", error);
    throw new Error(`Failed to connect to MCP server: ${(error as Error).message}`);
  }
}

export async function callMcpTool(
  client: Client,
  toolName: string,
  params: Record<string, unknown>
): Promise<McpToolResult> {
  try {
    const result = await client.callTool({
      name: toolName,
      arguments: params as Record<string, unknown>
    });

    return result as McpToolResult;
  } catch (error) {
    console.error(`Error calling MCP tool ${toolName}:`, error);
    throw error;
  }
}