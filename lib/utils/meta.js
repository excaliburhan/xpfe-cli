const Metalsmith = require('metalsmith')
const async = require('async')
const minimatch = require('minimatch')
const render = require('consolidate').handlebars.render
const rm = require('rimraf').sync
const { getConfig } = require('./config')

// TODO 过滤不需要的文件
exports.filterFiles = (file) => {
  const config = getConfig()
  const matchArr = (config.filters || []).concat(['package.json', 'README.md'])
  let ret = false
  matchArr.forEach((glob) => {
    if (minimatch(file, glob, { dot: true })) {
      ret = true
    }
  })
  return ret
}

exports.renderFiles = () => {
  return (files, metalsmith, done) => {
    const keys = Object.keys(files)
    const metadata = metalsmith.metadata()
    async.each(
      keys,
      (file, next) => {
        // only render specific files
        if (!exports.filterFiles(file)) {
          return next()
        }
        const str = files[file].contents.toString()
        // filter files that do not have mustaches
        if (!/{{([^{}]+)}}/g.test(str)) {
          return next()
        }
        render(str, metadata, (err, res) => {
          if (err) {
            err.message = `[${file}] ${err.message}`
            return next(err)
          }
          files[file].contents = new Buffer(res)
          next()
        })
      },
      done
    )
  }
}

exports.generate = (options, src, dest) => {
  return new Promise((resolve, reject) => {
    const metalsmith = Metalsmith(src)
    // set global data
    const data = Object.assign(metalsmith.metadata(), options)

    metalsmith
      .use(exports.renderFiles())
      .clean(false)
      .source('.')
      .destination(dest)
      .build((err, files) => {
        if (err) {
          rm(src) // delete project if error occurs
          reject(err)
        } else {
          resolve(files)
        }
      })
  })
}
