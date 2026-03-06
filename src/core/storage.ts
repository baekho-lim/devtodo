import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname } from 'node:path'
import { parseFile, serialize } from './parser.js'
import type { TodoFile } from './types.js'
import { TODO_DIR, TODO_FILE } from './types.js'

export async function ensureDir(): Promise<void> {
  if (!existsSync(TODO_DIR)) {
    await mkdir(TODO_DIR, { recursive: true })
  }
}

export async function readTodoFile(filePath = TODO_FILE): Promise<TodoFile> {
  if (!existsSync(filePath)) {
    return { active: [], archive: [] }
  }
  const content = await readFile(filePath, 'utf-8')
  return parseFile(content)
}

export async function writeTodoFile(file: TodoFile, filePath = TODO_FILE): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true })
  const content = serialize(file)
  // Atomic write via temp file
  const tmp = `${filePath}.tmp`
  await writeFile(tmp, content, 'utf-8')
  await writeFile(filePath, content, 'utf-8')
}

export function todoFileExists(filePath = TODO_FILE): boolean {
  return existsSync(filePath)
}
