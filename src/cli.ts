import { Command } from 'commander'
import { init } from './commands/init.js'
import { add } from './commands/add.js'
import { list } from './commands/list.js'
import { done } from './commands/done.js'

const program = new Command()

program
  .name('devtodo')
  .description('Cross-repo TODO manager for developers')
  .version('0.1.0')

program
  .command('init')
  .description('Initialize devtodo (~/.devtodo/GLOBAL_TODO.md)')
  .action(async () => {
    await init().catch(handleError)
  })

program
  .command('add <content>')
  .description('Add a new TODO item')
  .option('-r, --repo <repo>', 'Repository name', 'global')
  .option('-p, --priority <priority>', 'Priority: high, medium, low', 'low')
  .option('-s, --status <status>', 'Status: TODO, IN_PROGRESS, BLOCKED, PLANNING', 'TODO')
  .action(async (content: string, options: { repo: string; priority: string; status: string }) => {
    await add(content, options).catch(handleError)
  })

program
  .command('list')
  .description('List active TODO items')
  .option('-r, --repo <repo>', 'Filter by repository')
  .option('-s, --status <status>', 'Filter by status')
  .option('-p, --priority <priority>', 'Filter by priority')
  .action(async (options: { repo?: string; status?: string; priority?: string }) => {
    await list(options).catch(handleError)
  })

program
  .command('done <id>')
  .description('Mark a TODO as done and move to archive')
  .action(async (id: string) => {
    await done(id).catch(handleError)
  })

function handleError(err: unknown): never {
  if (err instanceof Error) {
    console.error(`Error: ${err.message}`)
  } else {
    console.error('An unexpected error occurred')
  }
  process.exit(1)
}

program.parse()
