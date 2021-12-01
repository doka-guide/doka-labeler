export class BaseModule {
  MODULE_KEY = 'base'

  constructor(objects, config) {
    this.config = config
    this.objects = objects
  }

  isApplicable(label, caseNumber = null) {
    console.log(label)
    if (caseNumber) console.log(caseNumber)
    return true
  }
}
