const chalk = require('chalk')
const semver = require('semver')
const Table = require('cli-table3')
const getVersions = require('./version')
const { clearConsole } = require('./logger')

exports.showConsole = async (checkUpdate) => {
  const { current, latest } = await getVersions()

  let title = chalk.bold.blue(`XPFE CLI v${current}`)

  if (checkUpdate && semver.gt(latest, current)) {
    title += chalk.green(`
┌──────────────────────────────${`─`.repeat(latest.length)}─┐
│ ✨  New version available: ${latest} ✨  │
└──────────────────────────────${`─`.repeat(latest.length)}─┘`)
  }

  clearConsole(title)
}

exports.showTable = async (head, body) => {
  const table = new Table({
    head,
    style: {
      head: ['cyan'],
      border: ['white'],
    },
    compact: true,
  })
  body.forEach(item => {
    table.push(item)
  })
  console.log(table.toString())
}
