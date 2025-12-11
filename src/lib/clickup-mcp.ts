import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { createMcpClient, callMcpTool, McpToolResult } from "./mcp-client";

let clickupClient: Client | null = null;

export async function initClickUpClient(serverUrl: string, apiKey: string): Promise<Client> {
  const client = await createMcpClient(serverUrl, apiKey, "myhrbuddy-clickup-client");
  clickupClient = client;
  return client;
}

export async function getClickUpClient(): Promise<Client> {
  if (!clickupClient) {
    if (!process.env.CLICKUP_MCP_URL || !process.env.CLICKUP_MCP_TOKEN) {
      throw new Error("ClickUp MCP environment variables not configured");
    }
    clickupClient = await initClickUpClient(
      process.env.CLICKUP_MCP_URL,
      process.env.CLICKUP_MCP_TOKEN
    );
  }
  return clickupClient;
}

export interface CreateTaskParams {
  list_id: string;
  name: string;
  description?: string;
  status?: string;
  priority?: number;
  due_date?: string;
  tags?: string[];
  assignees?: string[];
}

export interface GetTasksParams {
  list_id: string;
  statuses?: string[];
  assignees?: string[];
}

export interface GetTaskParams {
  task_id: string;
}

export interface UpdateTaskParams {
  task_id: string;
  name?: string;
  description?: string;
  status?: string;
  priority?: number;
  due_date?: string;
  tags?: string[];
  assignees?: string[];
}

export interface AddTaskCommentParams {
  task_id: string;
  comment_text: string;
}

export interface GetListsParams {
  folder_id: string;
}

export async function createTask(params: CreateTaskParams): Promise<McpToolResult> {
  const client = await getClickUpClient();
  return callMcpTool(client, "create_task", params as unknown as Record<string, unknown>);
}

export async function getTasks(params: GetTasksParams): Promise<McpToolResult> {
  const client = await getClickUpClient();
  return callMcpTool(client, "get_tasks", params as unknown as Record<string, unknown>);
}

export async function getTask(params: GetTaskParams): Promise<McpToolResult> {
  const client = await getClickUpClient();
  return callMcpTool(client, "get_task", params as unknown as Record<string, unknown>);
}

export async function updateTask(params: UpdateTaskParams): Promise<McpToolResult> {
  const client = await getClickUpClient();
  return callMcpTool(client, "update_task", params as unknown as Record<string, unknown>);
}

export async function addTaskComment(params: AddTaskCommentParams): Promise<McpToolResult> {
  const client = await getClickUpClient();
  return callMcpTool(client, "add_task_comment", params as unknown as Record<string, unknown>);
}

export async function getLists(params: GetListsParams): Promise<McpToolResult> {
  const client = await getClickUpClient();
  return callMcpTool(client, "get_lists", params as unknown as Record<string, unknown>);
}