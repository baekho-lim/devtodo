import { describe, it, expect } from 'vitest'
import { parseFile, serialize, nextId } from './parser.js'
import type { TodoFile } from './types.js'

const SAMPLE_MD = `# Global TODO

> Cross-repo 할일 추적. 포맷: [STATUS] repo | YYYY-MM-DD | 우선순위

## Active

### [TODO] my-repo | 2026-03-06 | 🔴 긴급

- [ ] <id:001> 첫 번째 할 일

### [BLOCKED] other-repo | 2026-03-05 | 🟡 중요

- [ ] <id:002> 두 번째 할 일

## Archive

### [TODO] archived-repo | 2026-03-01 | 🟢 일반

- [x] <id:000> 완료된 작업
`

describe('parseFile', () => {
  it('parses active items correctly', () => {
    const result = parseFile(SAMPLE_MD)
    expect(result.active).toHaveLength(2)
  })

  it('parses archive items correctly', () => {
    const result = parseFile(SAMPLE_MD)
    expect(result.archive).toHaveLength(1)
    expect(result.archive[0]?.done).toBe(true)
  })

  it('parses id, content, repo, date, priority, status', () => {
    const result = parseFile(SAMPLE_MD)
    const first = result.active[0]!
    expect(first.id).toBe('001')
    expect(first.content).toBe('첫 번째 할 일')
    expect(first.repo).toBe('my-repo')
    expect(first.date).toBe('2026-03-06')
    expect(first.priority).toBe('high')
    expect(first.status).toBe('TODO')
    expect(first.done).toBe(false)
  })

  it('parses second item with BLOCKED status and medium priority', () => {
    const result = parseFile(SAMPLE_MD)
    const second = result.active[1]!
    expect(second.status).toBe('BLOCKED')
    expect(second.priority).toBe('medium')
  })

  it('returns empty lists for empty file', () => {
    const result = parseFile('# Global TODO\n\n## Active\n\n## Archive\n')
    expect(result.active).toHaveLength(0)
    expect(result.archive).toHaveLength(0)
  })
})

describe('serialize', () => {
  it('round-trips through parse → serialize → parse', () => {
    const parsed = parseFile(SAMPLE_MD)
    const serialized = serialize(parsed)
    const reparsed = parseFile(serialized)
    expect(reparsed.active).toHaveLength(parsed.active.length)
    expect(reparsed.archive).toHaveLength(parsed.archive.length)
    expect(reparsed.active[0]?.id).toBe(parsed.active[0]?.id)
    expect(reparsed.active[0]?.content).toBe(parsed.active[0]?.content)
  })

  it('produces valid markdown sections', () => {
    const file: TodoFile = {
      active: [
        {
          id: '001',
          content: '테스트',
          repo: 'test-repo',
          date: '2026-03-06',
          priority: 'high',
          status: 'TODO',
          done: false,
        },
      ],
      archive: [],
    }
    const md = serialize(file)
    expect(md).toContain('## Active')
    expect(md).toContain('## Archive')
    expect(md).toContain('<id:001>')
    expect(md).toContain('[TODO] test-repo')
    expect(md).toContain('🔴 긴급')
  })
})

describe('nextId', () => {
  it('returns 001 for empty file', () => {
    expect(nextId({ active: [], archive: [] })).toBe('001')
  })

  it('returns next incremented id', () => {
    const file = parseFile(SAMPLE_MD)
    expect(nextId(file)).toBe('003')
  })

  it('pads to 3 digits', () => {
    const file: TodoFile = {
      active: [
        { id: '009', content: '', repo: '', date: '', priority: 'low', status: 'TODO', done: false },
      ],
      archive: [],
    }
    expect(nextId(file)).toBe('010')
  })
})
