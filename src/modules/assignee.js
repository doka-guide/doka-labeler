import { BaseModule } from "./base.js"

export class AssigneeModule extends BaseModule {
  MODULE_KEY = 'assignee'

  isApplicable(label, caseNumber = null) {
    let config
    if (caseNumber === null) {
      config = this.config[label].assignee
    } else {
      config = this.config[label][caseNumber].assignee
    }

    if (Array.isArray(config) && Array.isArray(this.objects)) {
      config.forEach(a => {
        if (this.objects.includes(a)) {
          console.log(`Module — ${MODULE_KEY}, label - ${label}: has applicable assignee`)
          return true
        }
      })
    } else if (typeof config === 'string' && Array.isArray(this.objects)) {
      if (this.objects.includes(config)) {
        console.log(`Module — ${MODULE_KEY}, label - ${label}: has applicable assignee`)
        return true
      }
    } else {
      return undefined
    }

    return false
  }
}
