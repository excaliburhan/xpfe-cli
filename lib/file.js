/**
 * @author xiaoping
 * @email edwardhjp@gmail.com
 * @create date 2017-06-13 04:38:43
 * @modify date 2017-06-13 04:38:43
 * @desc [xpfe.json file methods]
*/

var fs = require('fs')
var exists = fs.existsSync
var path = require('path')
var userHome = require('user-home')
var tplPath = path.join(userHome, '.xpfe.json')
var chalk = require('chalk')

exports.filePath = function () {
  if (!exists(tplPath)) {
    fs.writeFileSync(tplPath, JSON.stringify({}), function (err) {
      if (err) {
        console.log(chalk.red(err))
        process.exit()
      }
    })
  }
  return tplPath
}

exports.updateFile = function (data, successStr) {
  fs.writeFile(tplPath, data, function (err) {
    console.log()
    if (err) {
      console.log(chalk.red(err))
      process.exit()
    }
    console.log(chalk.green(successStr))
    process.exit()
  })
}
