import test from 'ava'
import { setupModules, setupStrategy } from './labeler.js'
import { AssigneeModule } from './modules/assignee.js';
import { FilesModule } from './modules/files.js';
import { FrontmatterModule } from './modules/frontmatter.js';

test('setupModules connects necessary modules based on config', (t) => {
  const config = {
    label1: {
      files: 'files',
      assignee: 'some assignee'
    },
    label2: {
      meta: 'meta config'
    }
  }

  const modules = setupModules(config, {})

  t.is(modules.length, 3)
  t.truthy(modules.find(module => module instanceof AssigneeModule))
  t.truthy(modules.find(module => module instanceof FilesModule))
  t.truthy(modules.find(module => module instanceof FrontmatterModule))
})

test('setupModules returns empty list of modules when the config is empty', (t) => {
  const config = {}

  const modules = setupModules(config, {})

  t.is(modules.length, 0)
})

test('setupStrategy assigns common strategy to all the labels from the config', (t) => {
  const globalStrategy = 'add-if-not-exists'
  const config = {
    label1: {
      files: '*'
    },
    label2: {
      assignee: 'test'
    }
  }

  const strategyByLabel = setupStrategy(globalStrategy, config)

  t.like(strategyByLabel, {
    label1: globalStrategy,
    label2: globalStrategy,
  })
})

test('setupStrategy gives precedence to strategy defined on the label level over global', (t) => {
  const globalStrategy = 'add-if-not-exists'
  const labelStrategy = 'remove-if-not-applicable'
  const config = {
    label1: {
      files: '*'
    },
    label2: {
      assignee: 'test',
      strategy: labelStrategy
    }
  }

  const strategyByLabel = setupStrategy(globalStrategy, config)

  t.like(strategyByLabel, {
    label1: globalStrategy,
    label2: labelStrategy
  })
})
