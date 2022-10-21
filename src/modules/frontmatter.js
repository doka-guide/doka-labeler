import { BaseModule } from './base.js'
import fm from 'front-matter'
import fs from 'fs'

export class FrontmatterModule extends BaseModule {
  MODULE_KEY = 'frontmatter'

  isApplicable(label, caseNumber = null) {
    if (typeof this.config[label] !== 'object') {
      return undefined
    }

    let config
    if (caseNumber === null) {
      if (this.config[label].hasOwnProperty('meta')) {
        config = this.config[label].meta
      } else {
        return undefined
      }
    } else {
      if (this.config[label].hasOwnProperty(caseNumber)
        && this.config[label][caseNumber].hasOwnProperty('meta')) {
        config = this.config[label][caseNumber].meta
      } else {
        return undefined
      }
    }

    const files = this.getMarkdownFiles(this.objects, label)
    if (Array.isArray(files)) {
      for (let i = 0; i < files.length; i++) {
        const f = files[i]
        const [isOk, meta] = this.getFrontmatterMeta(f)
        if (isOk) {
          const result = this.isApplicableValuesForKey(config, meta)
          if (typeof result === 'boolean' && result) {
            return true
          }
        }
      }
      return false
    }

    return undefined
  }

  getMarkdownFiles(fileObjects, label) {
    let fileList = []
    console.log(`Module — ${this.MODULE_KEY}, label - ${label}:`)
    for (const index in fileObjects) {
      const file = fileObjects[index]
      if (typeof file === 'object' && file.status && file.filename) {
        fileList.push(file.filename)
      }
    }
    const mdRegEx = /.\.md$/i
    fileList = fileList.filter(p => mdRegEx.test(p))
    fileList.forEach(f => console.log(`File "${f}" is taken into account`))
    return fileList
  }

  getFrontmatterMeta(filename) {
    try {
      const content = fs.readFileSync(filename, { encoding: 'utf8' })
      return [true, fm(content).attributes]
    } catch (err) {
      console.error(err)
      return [false, err]
    }
  }

  isApplicableValuesForKey(configValues, metaValues) {
    if (Array.isArray(configValues)) {
      for (let i = 0; i < configValues.length; i++) {
        if (metaValues.hasOwnProperty(configValues[i])) {
          return true
        }
      }
    } else if (typeof configValues === 'object') {
      for (const key in configValues) {
        if (configValues.hasOwnProperty(key)) {
          const valuesForKey = configValues[key]
          if (Array.isArray(valuesForKey)) {
            for (let i = 0; i < valuesForKey.length; i++) {
              const v = valuesForKey[i]
              if (Array.isArray(metaValues[key])) {
                if (metaValues[key].includes(v)) {
                  return true
                }
              } else if (typeof metaValues[key] === 'string') {
                if (metaValues[key] === v) {
                  return true
                }
              }
            }
          } else if (typeof valuesForKey === 'string') {
            if (Array.isArray(metaValues[key])) {
              if (metaValues[key].includes(valuesForKey)) {
                return true
              }
            } else if (typeof metaValues[key] === 'string') {
              if (metaValues[key] === valuesForKey) {
                return true
              }
            }
          } else {
            return false
          }
        }
      }
    } else if (typeof configValues === 'string') {
      return metaValues.hasOwnProperty(configValues)
    } else {
      return false
    }
  }
}
