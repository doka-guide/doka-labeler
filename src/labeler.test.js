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

test('calling methods queue gives labels from the config and objects', t => {
  const fileObjects = [
    {
      "sha": "bbcd538c8e72b8c175046e27cc8f907076331401",
      "filename": "file1.txt",
      "status": "added",
      "additions": 103,
      "deletions": 21,
      "changes": 124,
      "blob_url": "https://github.com/octocat/Hello-World/blob/6dcb09b5b57875f334f61aebed695e2e4193db5e/file1.txt",
      "raw_url": "https://github.com/octocat/Hello-World/raw/6dcb09b5b57875f334f61aebed695e2e4193db5e/file1.txt",
      "contents_url": "https://api.github.com/repos/octocat/Hello-World/contents/file1.txt?ref=6dcb09b5b57875f334f61aebed695e2e4193db5e",
      "patch": "@@ -132,7 +132,7 @@ module Test @@ -1000,7 +1000,7 @@ module Test"
    }
  ]
  const assignee = [
    {
      "login": "user1",
      "id": 1,
      "node_id": "MDQ6VXNlcjE=",
      "avatar_url": "https://github.com/images/error/octocat_happy.gif",
      "gravatar_id": "",
      "url": "https://api.github.com/users/octocat",
      "html_url": "https://github.com/octocat",
      "followers_url": "https://api.github.com/users/octocat/followers",
      "following_url": "https://api.github.com/users/octocat/following{/other_user}",
      "gists_url": "https://api.github.com/users/octocat/gists{/gist_id}",
      "starred_url": "https://api.github.com/users/octocat/starred{/owner}{/repo}",
      "subscriptions_url": "https://api.github.com/users/octocat/subscriptions",
      "organizations_url": "https://api.github.com/users/octocat/orgs",
      "repos_url": "https://api.github.com/users/octocat/repos",
      "events_url": "https://api.github.com/users/octocat/events{/privacy}",
      "received_events_url": "https://api.github.com/users/octocat/received_events",
      "type": "User",
      "site_admin": false
    },
    {
      "login": "user2",
      "id": 1,
      "node_id": "MDQ6VXNlcjE=",
      "avatar_url": "https://github.com/images/error/hubot_happy.gif",
      "gravatar_id": "",
      "url": "https://api.github.com/users/hubot",
      "html_url": "https://github.com/hubot",
      "followers_url": "https://api.github.com/users/hubot/followers",
      "following_url": "https://api.github.com/users/hubot/following{/other_user}",
      "gists_url": "https://api.github.com/users/hubot/gists{/gist_id}",
      "starred_url": "https://api.github.com/users/hubot/starred{/owner}{/repo}",
      "subscriptions_url": "https://api.github.com/users/hubot/subscriptions",
      "organizations_url": "https://api.github.com/users/hubot/orgs",
      "repos_url": "https://api.github.com/users/hubot/repos",
      "events_url": "https://api.github.com/users/hubot/events{/privacy}",
      "received_events_url": "https://api.github.com/users/hubot/received_events",
      "type": "User",
      "site_admin": true
    }
  ]
  const objects = { fileObjects, assignee }
  const config = {
    label1: {
      files: '*'
    },
    label2: {
      assignee: 'test',
      strategy: 'only'
    }
  }

  const labeler = new Labeler()
  const modules = labeler.setupModules(config, objects)

  t.is(modules.length, 2)
  t.truthy(modules.find(module => module instanceof AssigneeModule))
  t.truthy(modules.find(module => module instanceof FilesModule))

  const newLabels = labeler.prepareNewLabels(modules, config)
  t.deepEqual(newLabels, new Set(['label1']))
})
