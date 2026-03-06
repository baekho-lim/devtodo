import { readTodoFile, writeTodoFile } from '../core/storage.js'
import { nextId } from '../core/parser.js'
import type { Priority, Status } from '../core/types.js'

interface AddOptions {
  repo?: string
  priority?: string
  status?: string
}

function normalizePriority(p: string | undefined): Priority {
  switch (p?.toLowerCase()) {
    case 'high':
    case 'h':
      return 'high'
    case 'medium':
    case 'med':
    case 'm':
      return 'medium'
    default:
      return 'low'
  }
}

function normalizeStatus(s: string | undefined): Status {
  switch (s?.toUpperCase()) {
    case 'IN_PROGRESS':
    case 'WIP':
      return 'IN_PROGRESS'
    case 'BLOCKED':
      return 'BLOCKED'
    case 'PLANNING':
      return 'PLANNING'
    default:
      return 'TODO'
  }
}

export async function add(content: string, options: AddOptions, filePath?: string): Promise<void> {
  if (!content.trim()) {
    throw new Error('TODO content cannot be empty')
  }

  const file = await readTodoFile(filePath)
  const id = nextId(file)
  const today = new Date().toISOString().slice(0, 10)

  file.active.push({
    id,
    content: content.trim(),
    repo: options.repo ?? 'global',
    date: today,
    priority: normalizePriority(options.priority),
    status: normalizeStatus(options.status),
    done: false,
  })

  await writeTodoFile(file, filePath)
  console.log(`Added [${id}] ${content.trim()} (repo: ${options.repo ?? 'global'})`)
}
