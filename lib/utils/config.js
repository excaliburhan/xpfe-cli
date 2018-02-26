const fs = require('fs')
const path = require('path')
const userHome = require('user-home')
const cloneDeep = require('lodash.clonedeep')
const axios = require('axios')

const { error, done } = require('./logger')

const configPath = (exports.configPath = path.join(userHome, '.xpfe.json'))
let cachedConfig

exports.getConfig = () => {
  if (cachedConfig) {
    return cachedConfig
  }
  if (fs.existsSync(configPath)) {
    try {
      cachedConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    } catch (e) {
      error(
        `Error getting config: ` +
          `~/.xpfe.json may be corrupted or have syntax errors.\n` +
          `(${e.message})`
      )
    }
    return cachedConfig
  } else {
    fs.writeFileSync(configPath, JSON.stringify({}, null, 2))
    return {}
  }
}

exports.updateConfig = (data, msg) => {
  const config = Object.assign(cloneDeep(exports.getConfig()), data)
  cachedConfig = config
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    msg && done(msg)
  } catch (e) {
    error(
      `Error updating config: ` +
        `make sure you have write access to ${configPath}.\n` +
        `(${e.message})`
    )
  }
}

// get templates
exports.getTemplates = async function getTemplates(forceUpdate) {
  const config = exports.getConfig()
  let templates = config.dist || []
  const now = Date.now()
  // check version, cache for days, default is 30 days
  let cacheDays = config.cacheDays
  if (cacheDays === 0) {
    forceUpdate = true
  } else {
    if (!cacheDays) cacheDays = 30
    if (!config.dist || !config.version || now - config.version > cacheDays * 86400 * 1000) {
      forceUpdate = true
    }
  }
  if (forceUpdate) {
    const templateUrl = 'https://api.github.com/users/xpfe-templates/repos'
    const res = await axios.get(templateUrl)
    if (res.status === 200) {
      const repos = res.data
      let ret = []
      repos.forEach((repo) => {
        let temp = {}
        temp.name = repo.name
        temp.full_name = repo.full_name
        temp.description = repo.description
        temp.url = repo.url
        ret.push(temp)
      })
      exports.updateConfig({ dist: ret, version: now }) // update dist templates
      templates = ret
    }
  }
  templates = templates.concat(config.local || []) // combine local templates
  return templates
}
