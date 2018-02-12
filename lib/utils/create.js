const download = require('download-git-repo')
const chalk = require('chalk')
const execa = require('execa')
const readline = require('readline')
const { hasYarn } = require('./env')
const { getTemplates } = require('../utils/config')
const { log, error } = require('./logger')
const { logWithSpinner, stopSpinner } = require('./spinner')

const registries = {
  yarn: 'https://registry.yarnpkg.com',
  npm: 'https://registry.npmjs.org',
  taobao: 'https://registry.npm.taobao.org',
}
const taobaoDistUrl = 'https://npm.taobao.org/dist'

// render yarn progress
function renderProgressBar(curr, total) {
  const ratio = Math.min(Math.max(curr / total, 0), 1)
  const bar = ` ${curr}/${total}`
  const availableSpace = Math.max(0, process.stderr.columns - bar.length - 3)
  const width = Math.min(total, availableSpace)
  const completeLength = Math.round(width * ratio)
  const complete = `#`.repeat(completeLength)
  const incomplete = `-`.repeat(width - completeLength)
  toStartOfLine(process.stderr)
  process.stderr.write(`[${complete}${incomplete}]${bar}`)
}

function toStartOfLine(stream) {
  if (!chalk.supportsColor) {
    stream.write('\r')
    return
  }
  readline.cursorTo(stream, 0)
}

exports.loadTemplates = async () => {
  logWithSpinner('🌀', 'Loading templates, please wait...')
  const templates = await getTemplates()
  stopSpinner()
  const list = []
  templates.forEach((t) => {
    list.push({
      name: `${t.name} (${t.description})`,
      value: t.full_name || t.url,
    })
  })
  return list
}

exports.download = (url, dir) => {
  return new Promise((resolve, reject) => {
    logWithSpinner('✨', `Creating project in ${chalk.yellow(dir)}`)
    download(url, dir, (err) => {
      if (err) {
        reject(err)
      } else {
        stopSpinner()
        resolve(dir)
      }
    })
  })
}

exports.installDeps = async (targetDir, options = {}) => {
  const args = []
  let npmClient = 'npm'
  if (hasYarn) {
    npmClient = 'yarn'
  }
  if (options.npmClient) {
    npmClient = options.npmClient
  }
  let registry = options.registry
  if (npmClient === 'yarn') {
    // do nothing
  } else {
    args.push('install', '--loglevel', 'error')
  }

  // polyfill taobao settings
  if (npmClient === 'taobao') {
    registry = registries.taobao
  }
  if (registry) {
    args.push(`--registry=${registry}`)
    if (npmClient === 'taobao') {
      npmClient = 'npm'
      args.push(`--disturl=${taobaoDistUrl}`)
    }
  }

  return await new Promise((resolve, reject) => {
    const cmd = npmClient
    const child = execa(cmd, args, {
      cwd: targetDir,
      stdio: ['inherit', 'inherit', cmd === 'yarn' ? 'pipe' : 'inherit'],
    })

    if (cmd === 'yarn') {
      child.stderr.on('data', (buffer) => {
        const str = buffer.toString()
        if (/warning/.test(str)) {
          return
        }
        // progress bar
        const progressBarMatch = str.match(/\[.*\] (\d+)\/(\d+)/)
        if (progressBarMatch) {
          // since yarn is in a child process, it's unable to get the width of
          // the terminal. reimplement the progress bar ourselves!
          renderProgressBar(progressBarMatch[1], progressBarMatch[2])
          return
        }
        process.stderr.write(buffer)
      })
    }

    child.on('close', (code) => {
      if (code !== 0) {
        reject(`command failed: ${cmd} ${args.join(' ')}`)
        return
      }
      resolve(cmd)
    })
  })
}
