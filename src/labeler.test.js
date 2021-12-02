import test from 'ava'
import { setupModules } from './labeler.js'
import { AssigneeModule } from './modules/assignee.js';
import { FilesModule } from './modules/files.js';
import { FrontmatterModule } from './modules/frontmatter.js';

test('setupModules connects necessary modules based on config', (t) => {
  const config = {
    label1: {
      files: "files",
      assignee: "some assignee"
    },
    label2: {
      meta: "meta config"
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
