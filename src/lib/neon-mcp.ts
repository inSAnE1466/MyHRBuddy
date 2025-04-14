// src/lib/neon-mcp.ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { createMcpClient, callMcpTool, McpToolResult } from "./mcp-client";

/**
 * Neon Database MCP Service
 * Based on https://neon.tech/docs/ai/neon-mcp-server
 */

// Store the client instance
let neonClient: Client | null = null;

/**
 * Initialize the Neon MCP client
 */
export async function initNeonClient(serverUrl: string, apiKey: string): Promise<Client> {
  neonClient = await createMcpClient(serverUrl, apiKey, "myhrbuddy-neon-client");
  return neonClient;
}

/**
 * Get the Neon MCP client, initializing if necessary
 */
export async function getNeonClient(): Promise<Client> {
  if (!neonClient) {
    if (!process.env.NEON_MCP_URL || !process.env.NEON_MCP_TOKEN) {
      throw new Error("Neon MCP environment variables not configured");
    }
    await initNeonClient(
      process.env.NEON_MCP_URL,
      process.env.NEON_MCP_TOKEN
    );
  }
  return neonClient;
}

// Parameter interfaces for Neon MCP tools
export interface ExecuteQueryParams {
  query: string;
  params?: any[];
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
  data: Record<string, any>;
  schema?: string;
}

export interface UpdateDataParams {
  tableName: string;
  data: Record<string, any>;
  where: Record<string, any>;
  schema?: string;
}

export interface DeleteDataParams {
  tableName: string;
  where: Record<string, any>;
  schema?: string;
}

/**
 * Execute a SQL query on Neon PostgreSQL
 */
export async function executeQuery(params: ExecuteQueryParams): Promise<McpToolResult> {
  const client = await getNeonClient();
  return callMcpTool<ExecuteQueryParams>(client, "execute_query", params);
}

/**
 * Get database schema information
 */
export async function getSchema(params: GetSchemaParams = {}): Promise<McpToolResult> {
  const client = await getNeonClient();
  return callMcpTool<GetSchemaParams>(client, "get_schema", params);
}

/**
 * Get table information
 */
export async function getTableInfo(params: GetTableInfoParams): Promise<McpToolResult> {
  const client = await getNeonClient();
  return callMcpTool<GetTableInfoParams>(client, "get_table_info", params);
}

/**
 * Insert data into a table
 */
export async function insertData(params: InsertDataParams): Promise<McpToolResult> {
  const client = await getNeonClient();
  return callMcpTool<InsertDataParams>(client, "insert_data", params);
}

/**
 * Update data in a table
 */
export async function updateData(params: UpdateDataParams): Promise<McpToolResult> {
  const client = await getNeonClient();
  return callMcpTool<UpdateDataParams>(client, "update_data", params);
}

/**
 * Delete data from a table
 */
export async function deleteData(params: DeleteDataParams): Promise<McpToolResult> {
  const client = await getNeonClient();
  return callMcpTool<DeleteDataParams>(client, "delete_data", params);
}