import { BaseModule } from "./base.js"
import picomatch from 'picomatch'

const FILE_STATUSES = [
  'added',
  'modified',
  'removed',
  'renamed'
]

export class FilesModule extends BaseModule {
  MODULE_KEY = 'files'

  isApplicable(label, caseNumber = null) {
    if (caseNumber === 0) {
      return this.hasApplicableFiles(this.objects, label, 0)
    }
    return this.hasApplicableFiles(this.objects, label, caseNumber || null)
  }

  hasApplicableFiles(fileObjects, label, caseNumber) {
    if (typeof this.config[label] !== 'object') {
      return undefined
    }
    let config = null
    if (caseNumber === null) {
      if (this.config[label].hasOwnProperty('files')) {
        config = this.config[label].files
      } else {
        return undefined
      }
    } else {
      if (this.config[label].hasOwnProperty(caseNumber)
        && this.config[label][caseNumber].hasOwnProperty('files')) {
        config = this.config[label][caseNumber].files
      } else {
        return undefined
      }
    }

    if (typeof config === 'string') {
      return this.areFilesApplicable(fileObjects, label, [config])
    } else if (Array.isArray(config)) {
      return this.areFilesApplicable(fileObjects, label, [...config])
    } else {
      return undefined
    }
  }

  areFilesApplicable(fileObjects, label, patterns) {
    if (Array.isArray(patterns)) {
      let fileList = this.getArrayFromGitHubFiles(fileObjects)
      if (Array.isArray(fileList) && fileList.length > 0) {
        console.log(`Module — ${this.MODULE_KEY}, label - ${label}:`)
      } else {
        return false
      }

      for (let i = 0; i < patterns.length; i++) {
        const isMatch = picomatch(patterns[i])
        const filteredList = fileList.filter(p => isMatch(p))
        if (filteredList.length > 0) {
          filteredList.forEach(f => {
            console.log(`File "${f}" is taken into account`)
          })
          return true
        }
      }
    }
    return false
  }

  getArrayFromGitHubFiles(fileObjects) {
    const fileList = []
    for (const i in fileObjects) {
      const file = fileObjects[i]
      if (typeof file === 'object' && file.status && file.filename) {
        fileList.push(file.filename)
      }
    }
    return fileList
  }
}
