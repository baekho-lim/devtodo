import { add } from '../commands/add.js'
import { list } from '../commands/list.js'
import { done } from '../commands/done.js'
import { init } from '../commands/init.js'

export interface McpTool {
  name: string
  description: string
  inputSchema: Record<string, unknown>
  handler: (args: Record<string, unknown>) => Promise<string>
}

export const tools: McpTool[] = [
  {
    name: 'devtodo_init',
    description: 'Initialize devtodo (~/.devtodo/GLOBAL_TODO.md)',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    handler: async () => {
      const lines: string[] = []
      const origLog = console.log
      console.log = (...args: unknown[]) => lines.push(args.join(' '))
      await init()
      console.log = origLog
      return lines.join('\n')
    },
  },
  {
    name: 'devtodo_add',
    description: 'Add a new TODO item to the global TODO file',
    inputSchema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'TODO item description' },
        repo: { type: 'string', description: 'Repository name (default: global)' },
        priority: {
          type: 'string',
          enum: ['high', 'medium', 'low'],
          description: 'Priority level (default: low)',
        },
        status: {
          type: 'string',
          enum: ['TODO', 'IN_PROGRESS', 'BLOCKED', 'PLANNING'],
          description: 'Status (default: TODO)',
        },
      },
      required: ['content'],
    },
    handler: async (args) => {
      const lines: string[] = []
      const origLog = console.log
      console.log = (...a: unknown[]) => lines.push(a.join(' '))
      await add(String(args['content'] ?? ''), {
        repo: args['repo'] ? String(args['repo']) : undefined,
        priority: args['priority'] ? String(args['priority']) : undefined,
        status: args['status'] ? String(args['status']) : undefined,
      })
      console.log = origLog
      return lines.join('\n')
    },
  },
  {
    name: 'devtodo_list',
    description: 'List active TODO items with optional filters',
    inputSchema: {
      type: 'object',
      properties: {
        repo: { type: 'string', description: 'Filter by repository name' },
        status: { type: 'string', description: 'Filter by status' },
        priority: { type: 'string', description: 'Filter by priority' },
      },
    },
    handler: async (args) => {
      const lines: string[] = []
      const origLog = console.log
      console.log = (...a: unknown[]) => lines.push(a.join(' '))
      await list({
        repo: args['repo'] ? String(args['repo']) : undefined,
        status: args['status'] ? String(args['status']) : undefined,
        priority: args['priority'] ? String(args['priority']) : undefined,
      })
      console.log = origLog
      return lines.join('\n')
    },
  },
  {
    name: 'devtodo_done',
    description: 'Mark a TODO item as done and move it to archive',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'TODO ID (e.g. "001" or "1")' },
      },
      required: ['id'],
    },
    handler: async (args) => {
      const lines: string[] = []
      const origLog = console.log
      console.log = (...a: unknown[]) => lines.push(a.join(' '))
      await done(String(args['id'] ?? ''))
      console.log = origLog
      return lines.join('\n')
    },
  },
]
