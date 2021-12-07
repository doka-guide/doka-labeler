import test from 'ava'
import { Labeler } from './labeler.js'
import { AssigneeModule } from './modules/assignee.js'
import { FilesModule } from './modules/files.js'
import { FrontmatterModule } from './modules/frontmatter.js'

test('setupModules connects necessary modules based on config', t => {
  const config = {
    label1: {
      files: 'files',
      assignee: 'some assignee'
    },
    label2: {
      meta: 'meta config'
    }
  }

  const labeler = new Labeler()
  const modules = labeler.setupModules(config, {})

  t.is(modules.length, 3)
  t.truthy(modules.find(module => module instanceof AssigneeModule))
  t.truthy(modules.find(module => module instanceof FilesModule))
  t.truthy(modules.find(module => module instanceof FrontmatterModule))
})

test('setupModules returns empty list of modules when the config is empty', t => {
  const config = {}

  const labeler = new Labeler()
  const modules = labeler.setupModules(config, {})

  t.is(modules.length, 0)
})

test('setupStrategy assigns common strategy to all the labels from the config', t => {
  const globalStrategy = [
    'replace'
  ]
  const config = {
    label1: {
      files: '*'
    },
    label2: {
      assignee: 'test'
    }
  }

  const labeler = new Labeler()
  const strategyByLabel = labeler.setupStrategy(globalStrategy, config)

  t.like(strategyByLabel.local, {
    label1: {
      replace: true,
    },
    label2: {
      replace: true,
    }
  })
  t.like(strategyByLabel.common, {
    replace: true,
  })
})

test('setupStrategy gives precedence to strategy defined on the label level over global', t => {
  const globalStrategy = 'append'
  const labelStrategy = 'only'
  const config = {
    label1: {
      files: '*'
    },
    label2: {
      assignee: 'test',
      strategy: labelStrategy
    }
  }

  const labeler = new Labeler()
  const strategyByLabel = labeler.setupStrategy(globalStrategy, config)

  t.like(strategyByLabel.local, {
    label1: {
      append: true
    },
    label2: {
      append: true,
      only: true
    }
  })
})
