import { BaseModule } from './base.js'
import createMatcher from 'picomatch';
import fm from 'front-matter'
import fs from 'fs'

export class FrontmatterModule extends BaseModule {
  MODULE_KEY = 'frontmatter'

  isApplicable(label, caseNumber = null) {
    let config
    if (caseNumber === null) {
      config = this.config[label].meta
    } else {
      config = this.config[label][caseNumber].meta
    }

    const files = this.getMarkdownFiles(this.objects, label)
    if (Array.isArray(files)) {
      files.forEach(f => {
        const meta = this.getFrontmatterObject(f)
        for (const key in config) {
          if (Object.hasOwnProperty.call(config, key)) {
            if (meta.hasOwnProperty(key) && this.isApplicableValuesForKey(config[key], meta[key])) {
              return true
            }
          }
        }
      })
      return false
    }

    return undefined
  }

  getMarkdownFiles(fileObjects, label) {
    const fileList = []
    console.log(`Module — ${MODULE_KEY}, label - ${label}:`)
    for (const index in fileObjects.data) {
      const file = fileObjects.data[index]
      if (typeof file === 'object' && file.status && file.filename) {
        fileList.push(file.filename)
      }
    }
    return fileList.filter(createMatcher('*.md'))
  }

  getFrontmatterObject(filename) {
    try {
      const content = fs.readFileSync(filename, { encoding: 'utf8' })
      return fm(content)
    } catch (err) {
      console.error(err)
    }
  }

  isApplicableValuesForKey(configValues, metaValues) {
    if (Array.isArray(configValues)) {
      configValues.forEach(v => {
        if (metaValues.includes(v)) {
          return true
        }
      })
    } else if (typeof configValues === 'object' && typeof metaValues === 'object') {
      return JSON.stringify(configValues) === JSON.stringify(metaValues)
    } else {
      return configValues === metaValues
    }
    return false
  }
}
