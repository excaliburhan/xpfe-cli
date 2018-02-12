// vue-cli/packages/@vue/cli-shared-utils/lib/logger.js
const chalk = require('chalk')
const readline = require('readline')
const padStart = require('string.prototype.padstart')

const format = (label, msg) => {
  // 首行显示`[INFO]`等信息，其他行padStart`[INFO]`的长度
  return msg
    .split('\n')
    .map((line, i) => {
      return i === 0
        ? `${label} ${line}`
        : padStart(line, chalk.reset(label).length)
    })
    .join('\n')
}

exports.log = (msg) => console.log(msg || '')

exports.info = (msg) => console.log(format(chalk.bgBlue.black(' INFO '), msg))

exports.done = (msg) => console.log(format(chalk.bgGreen.black(' DONE '), msg))

exports.warn = (msg) =>
  console.warn(format(chalk.bgYellow.black(' WARN '), chalk.yellow(msg)))

exports.error = (msg) => {
  console.error(format(chalk.bgRed(' ERROR '), chalk.red(msg)))
  if (msg instanceof Error) {
    console.error(msg.stack)
  }
}

exports.clearConsole = title => {
  if (process.stdout.isTTY) {
    const blank = '\n'.repeat(process.stdout.rows)
    console.log(blank)
    readline.cursorTo(process.stdout, 0, 0)
    readline.clearScreenDown(process.stdout)
    if (title) {
      console.log(title)
    }
  }
}
