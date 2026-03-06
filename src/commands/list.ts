import { readTodoFile } from '../core/storage.js'
import { PRIORITY_EMOJI } from '../core/types.js'
import type { Priority, Status, TodoItem } from '../core/types.js'

interface ListOptions {
  repo?: string
  status?: string
  priority?: string
}

function formatItem(item: TodoItem): string {
  const check = item.done ? '[x]' : '[ ]'
  const priority = PRIORITY_EMOJI[item.priority]
  return `  ${check} <${item.id}> [${item.status}] ${item.content} — ${item.repo} ${item.date} ${priority}`
}

export async function list(options: ListOptions, filePath?: string): Promise<void> {
  const file = await readTodoFile(filePath)

  let items = file.active

  if (options.repo) {
    items = items.filter((i) => i.repo === options.repo)
  }

  if (options.status) {
    const statusFilter = options.status.toUpperCase() as Status
    items = items.filter((i) => i.status === statusFilter)
  }

  if (options.priority) {
    const priorityMap: Record<string, Priority> = {
      high: 'high',
      h: 'high',
      medium: 'medium',
      med: 'medium',
      m: 'medium',
      low: 'low',
      l: 'low',
    }
    const p = priorityMap[options.priority.toLowerCase()]
    if (p) items = items.filter((i) => i.priority === p)
  }

  if (items.length === 0) {
    console.log('No active TODO items found.')
    return
  }

  console.log(`Active TODOs (${items.length}):`)
  console.log()
  for (const item of items) {
    console.log(formatItem(item))
  }
}
