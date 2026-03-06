export type Priority = 'high' | 'medium' | 'low'

export type Status = 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'PLANNING'

export interface TodoItem {
  id: string // e.g. "001"
  content: string
  repo: string
  date: string // YYYY-MM-DD
  priority: Priority
  status: Status
  done: boolean
}

export interface TodoFile {
  active: TodoItem[]
  archive: TodoItem[]
}

export const PRIORITY_EMOJI: Record<Priority, string> = {
  high: '🔴 긴급',
  medium: '🟡 중요',
  low: '🟢 일반',
}

export const PRIORITY_FROM_EMOJI: Record<string, Priority> = {
  '🔴 긴급': 'high',
  '🟡 중요': 'medium',
  '🟢 일반': 'low',
}

export const TODO_DIR = `${process.env['HOME']}/.devtodo`
export const TODO_FILE = `${TODO_DIR}/GLOBAL_TODO.md`
