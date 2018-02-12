const axios = require('axios')
const config = require('./config').getConfig()

const pkgName = 'xpfe-cli'

module.exports = async function getVersions(updateConfig) {
  const current = require(`../../package.json`).version
  let latest
  if (process.env.XPFE_CLI_VERSION) {
    // cached value
    latest = process.env.XPFE_CLI_VERSION
  } else {
    const registry = config.registry || 'https://registry.npmjs.org'
    const res = await axios.get(`${registry}/${pkgName}`)
    if (res.status === 200) {
      latest = process.env.XPFE_CLI_VERSION = res.data['dist-tags'].latest
    } else {
      // use local version instead
      latest = process.env.XPFE_CLI_VERSION = current
    }
  }
  return {
    current,
    latest,
  }
}
