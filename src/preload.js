const fs = require('fs')
const path = require('path')

const getJsonFile = (jsonPath) => {
  let jsonFiles = []
  findJsonFile(jsonpath)

  function findJsonFile(json_path) {
    const files = fs.readdirSync(json_path)
    files.map((v) => {
      const fpath = path.join(json_path, v)
      const stat = fs.statSync(fpath)
      // stat.isDirectory() && findJsonFile(fpath)
      if (v.slice(-4) === 'json' && stat.isFile()) {
        const name = v.slice(0, -5)
        const dataJson = fs.readFileSync(fpath, 'utf-8')
        jsonFiles.push({ name, data: JSON.parse(dataJson) })
      }
    })
  }
  return jsonFiles
}

const jsonpath = path.join(__dirname, '../colors')
window.jsonData = getJsonFile(jsonpath)
