import type { TodoFile, TodoItem, Status, Priority } from './types.js'
import { PRIORITY_EMOJI, PRIORITY_FROM_EMOJI } from './types.js'

const SECTION_HEADER_RE = /^\[([A-Z_]+)\] (.+?) \| (\d{4}-\d{2}-\d{2}) \| (.+)$/
const ITEM_RE = /^- \[([ x])\] <id:(\d+)> (.+)$/

type Section = 'none' | 'active' | 'archive'

export function parseFile(content: string): TodoFile {
  const active: TodoItem[] = []
  const archive: TodoItem[] = []

  let section: Section = 'none'
  let currentMeta: { status: Status; repo: string; date: string; priority: Priority } | null = null

  for (const line of content.split('\n')) {
    const trimmed = line.trim()

    if (trimmed === '## Active') {
      section = 'active'
      currentMeta = null
      continue
    }
    if (trimmed === '## Archive') {
      section = 'archive'
      currentMeta = null
      continue
    }

    // Section header: ### [STATUS] repo | date | priority
    if (trimmed.startsWith('### ')) {
      const inner = trimmed.slice(4)
      const match = SECTION_HEADER_RE.exec(inner)
      if (match) {
        const [, statusStr, repo, date, priorityStr] = match
        currentMeta = {
          status: (statusStr ?? 'TODO') as Status,
          repo: repo ?? '',
          date: date ?? '',
          priority: PRIORITY_FROM_EMOJI[priorityStr ?? ''] ?? 'low',
        }
      }
      continue
    }

    // Todo item line
    const itemMatch = ITEM_RE.exec(trimmed)
    if (itemMatch && currentMeta) {
      const [, checkbox, id, content] = itemMatch
      const item: TodoItem = {
        id: id ?? '',
        content: content ?? '',
        repo: currentMeta.repo,
        date: currentMeta.date,
        priority: currentMeta.priority,
        status: currentMeta.status,
        done: checkbox === 'x',
      }
      if (section === 'active') active.push(item)
      else if (section === 'archive') archive.push(item)
    }
  }

  return { active, archive }
}

export function serialize(file: TodoFile): string {
  const lines: string[] = [
    '# Global TODO',
    '',
    '> Cross-repo 할일 추적. 포맷: [STATUS] repo | YYYY-MM-DD | 우선순위',
    '',
    '## Active',
  ]

  for (const item of file.active) {
    lines.push('')
    lines.push(`### [${item.status}] ${item.repo} | ${item.date} | ${PRIORITY_EMOJI[item.priority]}`)
    lines.push('')
    const check = item.done ? 'x' : ' '
    lines.push(`- [${check}] <id:${item.id}> ${item.content}`)
  }

  lines.push('')
  lines.push('## Archive')
  lines.push('')
  lines.push('<!-- DONE 항목은 여기로 이동. 삭제 금지. -->')

  for (const item of file.archive) {
    lines.push('')
    lines.push(`### [${item.status}] ${item.repo} | ${item.date} | ${PRIORITY_EMOJI[item.priority]}`)
    lines.push('')
    const check = item.done ? 'x' : ' '
    lines.push(`- [${check}] <id:${item.id}> ${item.content}`)
  }

  lines.push('')
  return lines.join('\n')
}

export function nextId(file: TodoFile): string {
  const all = [...file.active, ...file.archive]
  if (all.length === 0) return '001'
  const max = all.reduce((acc, item) => Math.max(acc, parseInt(item.id, 10)), 0)
  return String(max + 1).padStart(3, '0')
}
