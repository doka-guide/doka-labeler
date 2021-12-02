import test from "ava"
import { BaseModule } from "./base.js"

test('BaseModule contains fields object, config', t => {
  const objects = {
  }
  const config = {
    label1: {
      files: 'files'
    },
    label2: {
      meta: 'meta config'
    }}

  const module = new BaseModule(objects, config)

  t.deepEqual(module.objects, objects)
  t.deepEqual(module.config, config)
})

test('BaseModule method isApplicable returns true if config has a label', t => {
  const objects = {}
  const config = {
    label1: {
      files: 'files'
    },
    label2: {
      meta: 'meta config'
    }
  }

  const module = new BaseModule(objects, config)

  t.is(module.isApplicable('label1', 1), true)
  t.is(module.isApplicable('label2', 1), true)
  t.is(module.isApplicable('label3', 1), false)
})
