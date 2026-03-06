import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { readTodoFile, writeTodoFile, todoFileExists } from './storage.js'
import type { TodoFile } from './types.js'

let tmpDir: string

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), 'devtodo-test-'))
})

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true })
})

const SAMPLE_FILE: TodoFile = {
  active: [
    {
      id: '001',
      content: '테스트 할 일',
      repo: 'test-repo',
      date: '2026-03-06',
      priority: 'high',
      status: 'TODO',
      done: false,
    },
  ],
  archive: [],
}

describe('readTodoFile', () => {
  it('returns empty file when path does not exist', async () => {
    const result = await readTodoFile(join(tmpDir, 'nonexistent.md'))
    expect(result.active).toHaveLength(0)
    expect(result.archive).toHaveLength(0)
  })

  it('reads and parses existing file', async () => {
    const path = join(tmpDir, 'GLOBAL_TODO.md')
    await writeTodoFile(SAMPLE_FILE, path)
    const result = await readTodoFile(path)
    expect(result.active).toHaveLength(1)
    expect(result.active[0]?.content).toBe('테스트 할 일')
  })
})

describe('writeTodoFile', () => {
  it('creates directory if not exists', async () => {
    const path = join(tmpDir, 'sub', 'GLOBAL_TODO.md')
    await writeTodoFile(SAMPLE_FILE, path)
    const result = await readTodoFile(path)
    expect(result.active).toHaveLength(1)
  })

  it('overwrites existing file', async () => {
    const path = join(tmpDir, 'GLOBAL_TODO.md')
    await writeTodoFile(SAMPLE_FILE, path)
    await writeTodoFile({ active: [], archive: [] }, path)
    const result = await readTodoFile(path)
    expect(result.active).toHaveLength(0)
  })
})

describe('todoFileExists', () => {
  it('returns false when file does not exist', () => {
    expect(todoFileExists(join(tmpDir, 'missing.md'))).toBe(false)
  })

  it('returns true when file exists', async () => {
    const path = join(tmpDir, 'GLOBAL_TODO.md')
    await writeTodoFile(SAMPLE_FILE, path)
    expect(todoFileExists(path)).toBe(true)
  })
})
