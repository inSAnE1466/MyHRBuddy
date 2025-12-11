import * as clickupMcp from './clickup-mcp';
import * as neonMcp from './neon-mcp';
import { McpToolResult } from './mcp-client';

export class McpService {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      await Promise.all([
        clickupMcp.getClickUpClient(),
        neonMcp.getNeonClient()
      ]);

      this.initialized = true;
      console.log('All MCP services initialized successfully');
    } catch (error) {
      console.error('Error initializing MCP services:', error);
      throw error;
    }
  }

  clickup = {
    createTask: async (params: clickupMcp.CreateTaskParams): Promise<McpToolResult> => {
      await this.ensureInitialized();
      return clickupMcp.createTask(params);
    },

    getTasks: async (params: clickupMcp.GetTasksParams): Promise<McpToolResult> => {
      await this.ensureInitialized();
      return clickupMcp.getTasks(params);
    },

    getTask: async (params: clickupMcp.GetTaskParams): Promise<McpToolResult> => {
      await this.ensureInitialized();
      return clickupMcp.getTask(params);
    },

    updateTask: async (params: clickupMcp.UpdateTaskParams): Promise<McpToolResult> => {
      await this.ensureInitialized();
      return clickupMcp.updateTask(params);
    },

    addTaskComment: async (params: clickupMcp.AddTaskCommentParams): Promise<McpToolResult> => {
      await this.ensureInitialized();
      return clickupMcp.addTaskComment(params);
    },

    getLists: async (params: clickupMcp.GetListsParams): Promise<McpToolResult> => {
      await this.ensureInitialized();
      return clickupMcp.getLists(params);
    }
  };

  neon = {
    executeQuery: async (params: neonMcp.ExecuteQueryParams): Promise<McpToolResult> => {
      await this.ensureInitialized();
      return neonMcp.executeQuery(params);
    },

    getSchema: async (params?: neonMcp.GetSchemaParams): Promise<McpToolResult> => {
      await this.ensureInitialized();
      return neonMcp.getSchema(params);
    },

    getTableInfo: async (params: neonMcp.GetTableInfoParams): Promise<McpToolResult> => {
      await this.ensureInitialized();
      return neonMcp.getTableInfo(params);
    },

    insertData: async (params: neonMcp.InsertDataParams): Promise<McpToolResult> => {
      await this.ensureInitialized();
      return neonMcp.insertData(params);
    },

    updateData: async (params: neonMcp.UpdateDataParams): Promise<McpToolResult> => {
      await this.ensureInitialized();
      return neonMcp.updateData(params);
    },

    deleteData: async (params: neonMcp.DeleteDataParams): Promise<McpToolResult> => {
      await this.ensureInitialized();
      return neonMcp.deleteData(params);
    }
  };

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }
}

export const mcpService = new McpService();