import { readTodoFile, writeTodoFile } from '../core/storage.js'

export async function done(id: string, filePath?: string): Promise<void> {
  const normalizedId = id.padStart(3, '0')
  const file = await readTodoFile(filePath)

  const index = file.active.findIndex((item) => item.id === normalizedId)

  if (index === -1) {
    throw new Error(`TODO <${normalizedId}> not found in active list`)
  }

  const item = file.active[index]!
  item.done = true

  file.active.splice(index, 1)
  file.archive.push(item)

  await writeTodoFile(file, filePath)
  console.log(`Done: [${normalizedId}] ${item.content}`)
}
