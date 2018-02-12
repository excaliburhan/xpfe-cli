const chalk = require('chalk')
const semver = require('semver')
const getVersions = require('./version')
const { clearConsole } = require('./logger')

module.exports = async function showConsole(checkUpdate) {
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
