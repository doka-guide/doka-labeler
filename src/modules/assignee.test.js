import test from "ava"
import { AssigneeModule } from "./assignee.js"

test('AssigneeModule contains fields object, config', t => {
  const objects = []
  const config = {
    label1: {
      assignee: 'user1'
    },
    label2: {
      assignee: 'user2'
    }
  }

  const module = new AssigneeModule(objects, config)

  t.deepEqual(module.objects, objects)
  t.deepEqual(module.config, config)
})

test('AssignModule parse assignee correctly', t => {
  const objects = [
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
  const config = {
    label1: {
      assignee: 'user1'
    },
    label2: {
      assignee: 'user2'
    }
  }

  const module = new AssigneeModule(objects, config)

  t.deepEqual(['user1', 'user2'], module.getArrayFromGitHubAssignees(objects))
})

test('AssigneeModule method isApplicable returns correct values', t => {
  const objects = [
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
  const config = {
    label1: {
      assignee: 'user1'
    },
    label2: {
      assignee: 'user3'
    }
  }

  const module = new AssigneeModule(objects, config)

  t.is(module.isApplicable('label1'), true)
  t.is(module.isApplicable('label2'), false)
  t.is(module.isApplicable('label3'), undefined)
})
