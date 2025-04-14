// src/lib/clickup-mcp.ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { createMcpClient, callMcpTool, McpToolResult } from "./mcp-client";

/**
 * ClickUp MCP Service for interacting with the ClickUp MCP Server
 * Based on https://github.com/taazkareem/clickup-mcp-server
 */

// Store the client instance
let clickupClient: Client | null = null;

/**
 * Initialize the ClickUp MCP client
 */
export async function initClickUpClient(serverUrl: string, apiKey: string): Promise<Client> {
  clickupClient = await createMcpClient(serverUrl, apiKey, "myhrbuddy-clickup-client");
  return clickupClient;
}

/**
 * Get the ClickUp MCP client, initializing if necessary
 */
export async function getClickUpClient(): Promise<Client> {
  if (!clickupClient) {
    if (!process.env.CLICKUP_MCP_URL || !process.env.CLICKUP_MCP_TOKEN) {
      throw new Error("ClickUp MCP environment variables not configured");
    }
    await initClickUpClient(
      process.env.CLICKUP_MCP_URL,
      process.env.CLICKUP_MCP_TOKEN
    );
  }
  return clickupClient;
}

// Parameter interfaces for ClickUp MCP tools
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

/**
 * Create a task in ClickUp
 */
export async function createTask(params: CreateTaskParams): Promise<McpToolResult> {
  const client = await getClickUpClient();
  return callMcpTool<CreateTaskParams>(client, "create_task", params);
}

/**
 * Get tasks from a ClickUp list
 */
export async function getTasks(params: GetTasksParams): Promise<McpToolResult> {
  const client = await getClickUpClient();
  return callMcpTool<GetTasksParams>(client, "get_tasks", params);
}

/**
 * Get a specific task from ClickUp
 */
export async function getTask(params: GetTaskParams): Promise<McpToolResult> {
  const client = await getClickUpClient();
  return callMcpTool<GetTaskParams>(client, "get_task", params);
}

/**
 * Update a task in ClickUp
 */
export async function updateTask(params: UpdateTaskParams): Promise<McpToolResult> {
  const client = await getClickUpClient();
  return callMcpTool<UpdateTaskParams>(client, "update_task", params);
}

/**
 * Add a comment to a ClickUp task
 */
export async function addTaskComment(params: AddTaskCommentParams): Promise<McpToolResult> {
  const client = await getClickUpClient();
  return callMcpTool<AddTaskCommentParams>(client, "add_task_comment", params);
}

/**
 * Get lists from a ClickUp folder
 */
export async function getLists(params: GetListsParams): Promise<McpToolResult> {
  const client = await getClickUpClient();
  return callMcpTool<GetListsParams>(client, "get_lists", params);
}