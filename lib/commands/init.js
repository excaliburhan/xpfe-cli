const path = require('path')
const fs = require('fs')
const rimraf = require('rimraf')
const inquirer = require('inquirer')
const chalk = require('chalk')
const showConsole = require('../utils/console')
const { log, error } = require('../utils/logger')
const { stopSpinner } = require('../utils/spinner')
const { getConfig } = require('../utils/config')
const { loadTemplates, download, installDeps } = require('../utils/create')

async function create(projectName, options) {
  const targetDir = path.resolve(process.cwd(), projectName)
  if (fs.existsSync(targetDir)) {
    await showConsole(true)
    let { action } = await inquirer.prompt([
      {
        name: 'action',
        type: 'list',
        message:
          `Target directory ${chalk.cyan(targetDir)} already exists.\n` +
          `Pick an action:`,
        choices: [
          { name: 'Overwrite', value: 'overwrite' },
          { name: 'Cancel', value: false },
        ],
      },
    ])
    if (!action) {
      return
    } else if (action === 'overwrite') {
      rimraf.sync(targetDir)
    }
  }

  // download template && install deps
  const config = getConfig()
  log()
  const choices = await loadTemplates()
  let { repoUrl } = await inquirer.prompt([
    {
      name: 'repoUrl',
      type: 'list',
      message: 'Please choose a template below:',
      choices,
    },
  ])
  log()
  const downloadRes = await download(repoUrl, targetDir)
  // TODO 模板替换
  log()
  const cmdRes = await installDeps(targetDir, config)

  stopSpinner()
  log()
  log(`🎉  Successfully created project ${chalk.yellow(projectName)}.`)
  log(
    `👉  Get started with the following commands:\n\n` +
      chalk.cyan(` ${chalk.gray('$')} cd ${projectName}\n`) +
      chalk.cyan(
        ` ${chalk.gray('$')} ${
          cmdRes === 'yarn' ? 'yarn dev' : 'npm run dev'
        }`
      )
  )
  log()
}

module.exports = (...args) => {
  create(...args).catch((err) => {
    stopSpinner(false) // do not persist
    log()
    error(err)
    process.exit(1)
  })
}
