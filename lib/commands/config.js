const inquirer = require('inquirer')
const chalk = require('chalk')
const { showConsole, showTable } = require('../utils/console')
const { log, error } = require('../utils/logger')
const { getConfig, updateConfig } = require('../utils/config')

function uniqueArr(arr) {
  return Array.from(new Set(arr))
}

async function showConfig(options) {
  await showConsole(true)
  let prompts = [
    {
      name: 'packageManager',
      type: 'list',
      message: 'Please select a packageManager',
      choices: [{ name: 'yarn', value: 'yarn' }, { name: 'npm', value: 'npm' }],
      default: 'yarn',
    },
    {
      name: 'registry',
      type: 'input',
      message: 'Please input your registry',
      default: '',
    },
    {
      name: 'cacheDays',
      type: 'input',
      message: 'Please input cacheDays for templates results, 0 means no cache',
      default: 30,
      filter: (input) => Number(input),
      validate: (input) => {
        return typeof input === 'number'
      },
    },
  ]

  let config = getConfig()
  config.filters = config.filters || []
  if (options.filters && config.filters.length > 0) {
    const tableBody = config.filters.map((f) => [f])
    log()
    log('🛠  current filter config:')
    showTable(['ruleName'], tableBody)
  }
  if (options.filters) {
    log()
    const filterPrompt = [
      {
        name: 'action',
        type: 'list',
        message: `What do you want to do with rule: ${chalk.cyan(
          options.filters
        )}`,
        choices: [
          { name: 'add', value: 'add' },
          { name: 'delete', value: 'delete' },
        ],
      },
    ]
    const { action } = await inquirer.prompt(filterPrompt)
    if (action === 'add') {
      config.filters = uniqueArr(config.filters.concat([options.filters]))
    } else {
      config.filters = config.filters.filter(f => f !== options.filters)
    }
    updateConfig(config)
  } else {
    // usual prompts
    let answers = await inquirer.prompt(prompts)
    config = Object.assign(config, answers)
    updateConfig(config)
  }
}

module.exports = (...args) => {
  showConfig(...args).catch((err) => {
    log()
    error(err)
    process.exit(1)
  })
}
