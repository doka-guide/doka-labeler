import { BaseModule } from "./base.js"

export class AssigneeModule extends BaseModule {
  MODULE_KEY = 'assignee'

  isApplicable(label, caseNumber = null) {
    if (typeof this.config[label] !== 'object') {
      return undefined
    }

    let config
    if (caseNumber === null) {
      if (this.config[label].hasOwnProperty('assignee')) {
        config = this.config[label].assignee
      } else {
        return undefined
      }
    } else {
      if (this.config[label].hasOwnProperty(caseNumber)
        && this.config[label][caseNumber].hasOwnProperty('assignee')) {
        config = this.config[label][caseNumber].assignee
      } else {
        return undefined
      }
    }

    const assignees = this.getArrayFromGitHubAssignees(this.objects)
    if (Array.isArray(config)) {
      for (let i = 0; i < config.length; i++) {
        const a = config[i]
        if (assignees.includes(a)) {
          console.log(`Module — ${this.MODULE_KEY}, label - ${label}: array has applicable assignee`)
          return true
        }
      }
    } else if (typeof config === 'string') {
      if (assignees.includes(config)) {
        console.log(`Module — ${this.MODULE_KEY}, label - ${label}: string has applicable assignee`)
        return true
      }
    } else {
      return undefined
    }

    return false
  }

  getArrayFromGitHubAssignees(assigneesObject) {
    const assignees = []
    for (const key in assigneesObject) {
      if (Object.hasOwnProperty.call(assigneesObject, key)) {
        const a = assigneesObject[key]
        assignees.push(a.login)
      }
    }
    return assignees
  }
}
