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
      "login": "user1"
    },
    {
      "login": "user2"
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

test('AssigneeModule method isApplicable returns correct values for string', t => {
  const objects = [
    {
      "login": "user1"
    },
    {
      "login": "user2"
    }
  ]
  const config1 = {
    label1: {
      assignee: 'user1'
    },
    label2: {
      assignee: 'user3'
    }
  }

  const module1 = new AssigneeModule(objects, config1)

  t.is(module1.isApplicable('label1'), true)
  t.is(module1.isApplicable('label2'), false)
  t.is(module1.isApplicable('label3'), undefined)
})

test('AssigneeModule method isApplicable returns correct values for array', t => {
  const objects = [
    {
      "login": "user1"
    },
    {
      "login": "user2"
    }
  ]
  const config2 = {
    label1: {
      assignee: [
        'user1',
        'user3'
      ]
    },
    label2: {
      assignee: [
        'user2',
        'user3'
      ]
    },
    label3: {
      assignee: [
        'user3'
      ]
    }
  }

  const module2 = new AssigneeModule(objects, config2)

  t.is(module2.isApplicable('label1'), true)
  t.is(module2.isApplicable('label2'), true)
  t.is(module2.isApplicable('label3'), false)
})

test('AssigneeModule method isApplicable returns correct values for mix values in array case', t => {
  const objects = [
    {
      "login": "user1"
    },
    {
      "login": "user2"
    }
  ]
  const config3 = {
    label1: [
      {
        assignee: [
          'user1',
          'user3'
        ],
        meta: {
          field: 'example'
        }
      },
      {
        files: [
          '*.md'
        ]
      },
      {
        meta: {
          field: [
            'example 1',
            'example 2'
          ]
        }
      }
    ],
    label2: {
      assignee: [
        'user2',
        'user3'
      ]
    },
    label3: {
      assignee: 'user1'
    },
    label4: {
      assignee: 'user3'
    }
  }

  const module3 = new AssigneeModule(objects, config3)

  t.is(module3.isApplicable('label1', 0), true)
  t.is(module3.isApplicable('label1', 1), undefined)
  t.is(module3.isApplicable('label2'), true)
  t.is(module3.isApplicable('label3'), true)
  t.is(module3.isApplicable('label4'), false)
})
