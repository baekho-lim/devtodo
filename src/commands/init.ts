import { existsSync } from 'node:fs'
import { ensureDir, writeTodoFile, todoFileExists } from '../core/storage.js'
import { TODO_DIR, TODO_FILE } from '../core/types.js'

export async function init(): Promise<void> {
  await ensureDir()

  if (todoFileExists()) {
    console.log(`Already initialized: ${TODO_FILE}`)
    return
  }

  await writeTodoFile({ active: [], archive: [] })

  console.log(`Initialized devtodo at ${TODO_DIR}`)
  console.log(`  TODO file: ${TODO_FILE}`)
  console.log()
  console.log('Next steps:')
  console.log('  devtodo add "My first task" --repo my-repo')
  console.log('  devtodo list')
}
