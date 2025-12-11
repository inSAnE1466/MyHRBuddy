import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { createMcpClient, callMcpTool, McpToolResult } from "./mcp-client";

let neonClient: Client | null = null;

export async function initNeonClient(serverUrl: string, apiKey: string): Promise<Client> {
  const client = await createMcpClient(serverUrl, apiKey, "myhrbuddy-neon-client");
  neonClient = client;
  return client;
}

export async function getNeonClient(): Promise<Client> {
  if (!neonClient) {
    if (!process.env.NEON_MCP_URL || !process.env.NEON_MCP_TOKEN) {
      throw new Error("Neon MCP environment variables not configured");
    }
    neonClient = await initNeonClient(
      process.env.NEON_MCP_URL,
      process.env.NEON_MCP_TOKEN
    );
  }
  return neonClient;
}

export interface ExecuteQueryParams {
  query: string;
  params?: unknown[];
}

export interface GetSchemaParams {
  schema?: string;
}

export interface GetTableInfoParams {
  tableName: string;
  schema?: string;
}

export interface InsertDataParams {
  tableName: string;
  data: Record<string, unknown>;
  schema?: string;
}

export interface UpdateDataParams {
  tableName: string;
  data: Record<string, unknown>;
  where: Record<string, unknown>;
  schema?: string;
}

export interface DeleteDataParams {
  tableName: string;
  where: Record<string, unknown>;
  schema?: string;
}

export async function executeQuery(params: ExecuteQueryParams): Promise<McpToolResult> {
  const client = await getNeonClient();
  return callMcpTool(client, "execute_query", params as unknown as Record<string, unknown>);
}

export async function getSchema(params: GetSchemaParams = {}): Promise<McpToolResult> {
  const client = await getNeonClient();
  return callMcpTool(client, "get_schema", params as unknown as Record<string, unknown>);
}

export async function getTableInfo(params: GetTableInfoParams): Promise<McpToolResult> {
  const client = await getNeonClient();
  return callMcpTool(client, "get_table_info", params as unknown as Record<string, unknown>);
}

export async function insertData(params: InsertDataParams): Promise<McpToolResult> {
  const client = await getNeonClient();
  return callMcpTool(client, "insert_data", params as unknown as Record<string, unknown>);
}

export async function updateData(params: UpdateDataParams): Promise<McpToolResult> {
  const client = await getNeonClient();
  return callMcpTool(client, "update_data", params as unknown as Record<string, unknown>);
}

export async function deleteData(params: DeleteDataParams): Promise<McpToolResult> {
  const client = await getNeonClient();
  return callMcpTool(client, "delete_data", params as unknown as Record<string, unknown>);
}