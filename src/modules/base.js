export class BaseModule {
  MODULE_KEY = 'base'

  constructor(objects, config) {
    this.config = config
    this.objects = objects
  }

  isApplicable(label) {
    return true
  }
}
