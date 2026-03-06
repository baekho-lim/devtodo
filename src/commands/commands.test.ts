import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { readTodoFile, writeTodoFile, todoFileExists } from '../core/storage.js'
import { add } from './add.js'
import { done } from './done.js'
import { list } from './list.js'

let tmpDir: string
let todoPath: string

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), 'devtodo-cmd-test-'))
  todoPath = join(tmpDir, 'GLOBAL_TODO.md')
})

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true })
})

describe('add', () => {
  it('adds item to empty file', async () => {
    await writeTodoFile({ active: [], archive: [] }, todoPath)
    await add('첫 번째 할 일', { repo: 'test-repo', priority: 'high' }, todoPath)
    const file = await readTodoFile(todoPath)
    expect(file.active).toHaveLength(1)
    expect(file.active[0]?.content).toBe('첫 번째 할 일')
    expect(file.active[0]?.repo).toBe('test-repo')
    expect(file.active[0]?.priority).toBe('high')
    expect(file.active[0]?.id).toBe('001')
  })

  it('auto-increments id', async () => {
    await writeTodoFile({ active: [], archive: [] }, todoPath)
    await add('첫 번째', { repo: 'r' }, todoPath)
    await add('두 번째', { repo: 'r' }, todoPath)
    const file = await readTodoFile(todoPath)
    expect(file.active[1]?.id).toBe('002')
  })

  it('throws on empty content', async () => {
    await writeTodoFile({ active: [], archive: [] }, todoPath)
    await expect(add('   ', {}, todoPath)).rejects.toThrow('TODO content cannot be empty')
  })

  it('defaults repo to global when not specified', async () => {
    await writeTodoFile({ active: [], archive: [] }, todoPath)
    await add('할 일', {}, todoPath)
    const file = await readTodoFile(todoPath)
    expect(file.active[0]?.repo).toBe('global')
  })

  it('accepts medium priority alias (med)', async () => {
    await writeTodoFile({ active: [], archive: [] }, todoPath)
    await add('할 일', { priority: 'med' }, todoPath)
    const file = await readTodoFile(todoPath)
    expect(file.active[0]?.priority).toBe('medium')
  })

  it('accepts medium priority alias (m)', async () => {
    await writeTodoFile({ active: [], archive: [] }, todoPath)
    await add('할 일', { priority: 'm' }, todoPath)
    const file = await readTodoFile(todoPath)
    expect(file.active[0]?.priority).toBe('medium')
  })

  it('accepts high priority alias (h)', async () => {
    await writeTodoFile({ active: [], archive: [] }, todoPath)
    await add('할 일', { priority: 'h' }, todoPath)
    const file = await readTodoFile(todoPath)
    expect(file.active[0]?.priority).toBe('high')
  })

  it('accepts IN_PROGRESS status via WIP alias', async () => {
    await writeTodoFile({ active: [], archive: [] }, todoPath)
    await add('할 일', { status: 'WIP' }, todoPath)
    const file = await readTodoFile(todoPath)
    expect(file.active[0]?.status).toBe('IN_PROGRESS')
  })

  it('accepts BLOCKED status', async () => {
    await writeTodoFile({ active: [], archive: [] }, todoPath)
    await add('할 일', { status: 'BLOCKED' }, todoPath)
    const file = await readTodoFile(todoPath)
    expect(file.active[0]?.status).toBe('BLOCKED')
  })

  it('accepts PLANNING status', async () => {
    await writeTodoFile({ active: [], archive: [] }, todoPath)
    await add('할 일', { status: 'PLANNING' }, todoPath)
    const file = await readTodoFile(todoPath)
    expect(file.active[0]?.status).toBe('PLANNING')
  })
})

describe('done', () => {
  it('moves item from active to archive', async () => {
    await writeTodoFile({
      active: [{ id: '001', content: '완료할 일', repo: 'r', date: '2026-03-06', priority: 'high', status: 'TODO', done: false }],
      archive: [],
    }, todoPath)

    await done('001', todoPath)
    const file = await readTodoFile(todoPath)
    expect(file.active).toHaveLength(0)
    expect(file.archive).toHaveLength(1)
    expect(file.archive[0]?.done).toBe(true)
    expect(file.archive[0]?.content).toBe('완료할 일')
  })

  it('pads id to 3 digits (1 → 001)', async () => {
    await writeTodoFile({
      active: [{ id: '001', content: '할 일', repo: 'r', date: '2026-03-06', priority: 'low', status: 'TODO', done: false }],
      archive: [],
    }, todoPath)
    await done('1', todoPath)
    const file = await readTodoFile(todoPath)
    expect(file.active).toHaveLength(0)
  })

  it('throws when id not found', async () => {
    await writeTodoFile({ active: [], archive: [] }, todoPath)
    await expect(done('999', todoPath)).rejects.toThrow('not found in active list')
  })
})

describe('list', () => {
  beforeEach(async () => {
    await writeTodoFile({
      active: [
        { id: '001', content: 'a', repo: 'repo-a', date: '2026-03-06', priority: 'high', status: 'TODO', done: false },
        { id: '002', content: 'b', repo: 'repo-b', date: '2026-03-06', priority: 'medium', status: 'BLOCKED', done: false },
        { id: '003', content: 'c', repo: 'repo-a', date: '2026-03-06', priority: 'low', status: 'TODO', done: false },
      ],
      archive: [],
    }, todoPath)
  })

  it('lists all active items when no filter', async () => {
    const lines: string[] = []
    const orig = console.log
    console.log = (...args: unknown[]) => lines.push(args.join(' '))
    await list({}, todoPath)
    console.log = orig
    expect(lines.some((l) => l.includes('Active TODOs (3)'))).toBe(true)
  })

  it('filters by repo', async () => {
    const lines: string[] = []
    const orig = console.log
    console.log = (...args: unknown[]) => lines.push(args.join(' '))
    await list({ repo: 'repo-a' }, todoPath)
    console.log = orig
    expect(lines.some((l) => l.includes('Active TODOs (2)'))).toBe(true)
  })

  it('filters by status', async () => {
    const lines: string[] = []
    const orig = console.log
    console.log = (...args: unknown[]) => lines.push(args.join(' '))
    await list({ status: 'BLOCKED' }, todoPath)
    console.log = orig
    expect(lines.some((l) => l.includes('Active TODOs (1)'))).toBe(true)
  })

  it('filters by priority (high)', async () => {
    const lines: string[] = []
    const orig = console.log
    console.log = (...args: unknown[]) => lines.push(args.join(' '))
    await list({ priority: 'high' }, todoPath)
    console.log = orig
    expect(lines.some((l) => l.includes('Active TODOs (1)'))).toBe(true)
  })

  it('filters by priority alias (h)', async () => {
    const lines: string[] = []
    const orig = console.log
    console.log = (...args: unknown[]) => lines.push(args.join(' '))
    await list({ priority: 'h' }, todoPath)
    console.log = orig
    expect(lines.some((l) => l.includes('Active TODOs (1)'))).toBe(true)
  })

  it('shows no items message when filter returns empty', async () => {
    const lines: string[] = []
    const orig = console.log
    console.log = (...args: unknown[]) => lines.push(args.join(' '))
    await list({ repo: 'nonexistent' }, todoPath)
    console.log = orig
    expect(lines.some((l) => l.includes('No active TODO items found'))).toBe(true)
  })
})

describe('init (via storage helpers)', () => {
  it('todoFileExists returns false before init, true after write', async () => {
    expect(todoFileExists(todoPath)).toBe(false)
    await writeTodoFile({ active: [], archive: [] }, todoPath)
    expect(todoFileExists(todoPath)).toBe(true)
  })
})
