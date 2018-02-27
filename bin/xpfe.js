#!/usr/bin/env node

require('../lib/utils/enhanceCommander')

const semver = require('semver')
const program = require('commander')
const chalk = require('chalk')
const requireVerison = require('../package.json').engines.node

// filter commander options.
function filterArgs(cmd) {
  const args = {}
  cmd.options.forEach((o) => {
    const key = o.long.replace(/^--/, '')
    // if an option is not present and Command has a method with the same name
    // it should not be copied
    if (typeof cmd[key] !== 'function') {
      args[key] = cmd[key]
    }
  })
  return args
}

// node version check
if (!semver.satisfies(process.version, requireVerison)) {
  console.log(
    chalk.red(
      `You are using Node ${process.version}, but xpfe-cli ` +
        `requires Node ${requireVerison}.\nPlease upgrade your Node version.`
    )
  )
  process.exit(1)
}

program.version(require('../package.json').version).usage('<command> [options]')

program
  .command('init <app-name>')
  .description('✈️  create a new project from template')
  .action((name, cmd) => {
    require('../lib/commands/init')(name, filterArgs(cmd))
  })

program
  .command('config')
  .description('🛠  global config for xpfe-cli')
  .option(
    '-f, --filters <ruleName>',
    'Add filter rules for replace files'
  )
  .action((cmd) => {
    require('../lib/commands/config')(filterArgs(cmd))
  })

program
  .command('ls')
  .description('📗  list all templates (force fresh cached templates)')
  .action((cmd) => {
    require('../lib/commands/list')(filterArgs(cmd))
  })

// program
//   .command('add <template-name>')
//   .description('📌  add custom template')
//   .action((name, cmd) => {
//     require('../lib/commands/add')(name, filterArgs(cmd))
//   })

// program
//   .command('del <template-name>')
//   .description('✂️  delete custom template')
//   .action((name, cmd) => {
//     require('../lib/commands/del')(name, filterArgs(cmd))
//   })

program.on('--help', () => {
  console.log()
  console.log(`  Run ${chalk.cyan(`xpfe <command> --help`)} for more help`)
  console.log()
})

program.commands.forEach((c) => c.on('--help', () => console.log()))

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}
