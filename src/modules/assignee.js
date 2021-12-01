import { BaseModule } from "./base.js"

export class AssigneeModule extends BaseModule {
  MODULE_KEY = 'assignee'

  isApplicable(label, caseNumber = null) {
    let assignee
    if (caseNumber === null) {
      assignee = this.config[label].assignee
    } else {
      assignee = this.config[label][caseNumber].assignee
    }

    if (Array.isArray(assignee) && Array.isArray(this.objects)) {
      assignee.forEach((a) => {
        if (this.objects.includes(a)) {
          console.log(`Module — ${MODULE_KEY}, label - ${label}: has applicable assignee`)
          return true
        }
      })
    } else if (typeof assignee === 'string' && Array.isArray(this.objects)) {
      if (this.objects.includes(assignee)) {
        console.log(`Module — ${MODULE_KEY}, label - ${label}: has applicable assignee`)
        return true
      }
    } else {
      return undefined
    }

    return false
  }
}
