const fs = require('fs')
const path = require('path')

const getJsonFile = (jsonPath, type) => {
  let jsonFiles = []
  findJsonFile(jsonPath, type)

  function findJsonFile(json_path, type) {
    const files = fs.readdirSync(json_path)
    files.map((v) => {
      const fpath = path.join(json_path, v)
      const stat = fs.statSync(fpath)
      // stat.isDirectory() && findJsonFile(fpath)
      if (v.split('.')[1] === type && stat.isFile()) {
        const name = v.split('.')[0].slice(1)
        const data = fs.readFileSync(fpath, 'utf-8')
        jsonFiles.push({ name, data: type === 'json' ? JSON.parse(data) : data })
      }
    })
  }
  return jsonFiles
}

const jsonpath = path.join(__dirname, '../colors')
window.jsonData = getJsonFile(jsonpath, 'json')

// const templatePath = path.join(__dirname, '../template')
// window.template = getJsonFile(templatePath, 'template')
// console.log(template[0].data)

