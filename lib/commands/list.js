const { showConsole, showTable } = require('../utils/console')
const { log, error } = require('../utils/logger')
const { getTemplates } = require('../utils/config')

async function showList() {
  await showConsole(true)
  const templates = await getTemplates(true)
  const tableBody = templates.map(t => {
    return [t.name, t.description]
  })
  log('📗  current templates list:')
  showTable(['Name', 'Description'], tableBody)
}

module.exports = (...args) => {
  showList(...args).catch((err) => {
    log()
    error(err)
    process.exit(1)
  })
}
