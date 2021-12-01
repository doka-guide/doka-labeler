import { BaseModule } from "./base.js"
import { filter } from "minimatch"

const FILE_STATUSES = [
  'added',
  'modified',
  'removed',
  'renamed'
]

export class FilesModule extends BaseModule {
  MODULE_KEY = 'files'

  isApplicable(label, caseNumber = null) {
    return this.hasApplicableFiles(this.objects, label, caseNumber)
  }

  hasApplicableFiles(fileObjects, label, caseNumber = null) {
    let config
    if (caseNumber === null) {
      config = this.config[label].files
    } else {
      config = this.config[label][caseNumber].files
    }

    let hasStatus = false
    if (typeof config === 'object') {
      FILE_STATUSES.forEach(s => {
        if (config.hasOwnProperty(s)) {
          hasStatus = true
          break
        }
      })
    } else if (typeof config === 'string') {
      return this.areFilesApplicable(fileObjects, label, [config])
    }

    if (hasStatus) {
      const patterns = Object.keys(config)
      patterns.forEach(s => {
        if (this.areFilesApplicable(fileObjects, label, patterns[s])) {
          return true
        }
      })
    } else if (Array.isArray(config)) {
      return this.areFilesApplicable(fileObjects, label, config)
    }

    return undefined
  }

  areFilesApplicable(fileObjects, label, patterns) {
    if (patterns && patterns.length > 0) {
      FILE_STATUSES.forEach(s => {
        filteredFiles[s] = []
      })

      console.log(`Module — ${MODULE_KEY}, label - ${label}:`)
      for (const index in fileObjects.data) {
        const file = fileObjects.data[index]
        if (typeof file === 'object' && file.status && file.filename) {
          fileList.push(file.filename)
        }
      }

      patterns.forEach(p => {
        fileList.filter(filter(p))
      })
      fileList.forEach(f => {
        console.log(`File ${f} is taken into account`)
      })

      const selectedFilesCount = fileList.length
      console.log(`---\n${selectedFilesCount} files were applicable`)
      return selectedFilesCount > 0
    }
    return false
  }
}
