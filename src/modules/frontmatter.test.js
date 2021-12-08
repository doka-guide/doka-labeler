import test from 'ava'
import fs from 'fs'
import mock from 'mock-fs'
import { FrontmatterModule } from "./frontmatter.js"

test('FrontmatterModule contains fields object, config', t => {
  const objects = {
  }
  const config = {
    label1: {
      files: 'files'
    },
    label2: {
      meta: 'meta config'
    }}

  const module = new FrontmatterModule(objects, config)

  t.deepEqual(module.objects, objects)
  t.deepEqual(module.config, config)
})

test('FrontmatterModule prepares files and meta correctly', t => {
  const objects = [
    {
      "filename": "/tmp/mock/file1.md",
      "status": "added"
    },
    {
      "filename": "/tmp/mock/file2.txt",
      "status": "added"
    }
  ]
  const config = {
    label1: {
      files: 'files'
    },
    label2: {
      meta: {
        field1: [
          'value1',
          'value2'
        ],
        field2: 'value3'
      }
    }
  }

  mock({
    '/tmp/mock': {
      'file1.md': '---\nfield1:\n  - value1\nfield2:\n  - value4\n---\nFile content here',
      'file2.txt': 'File content here'
    },
  })

  const mdFilePath = '/tmp/mock/file1.md'
  const mdMeta = {
    field1: [
      'value1',
    ],
    field2: [
      'value4',
    ],
  }

  const module = new FrontmatterModule(objects, config)

  t.deepEqual(module.getMarkdownFiles(objects, 'test'), [mdFilePath])
  t.deepEqual(module.getFrontmatterObject(mdFilePath), mdMeta)
  t.is(module.isApplicableValuesForKey(config['label2'].meta, mdMeta), true)
})

test('FrontmatterModule method isApplicable returns correct values', t => {
  const objects = [
    {
      "filename": "/tmp/mock/file1.md",
      "status": "added"
    },
    {
      "filename": "/tmp/mock/file2.txt",
      "status": "added"
    }
  ]
  const config = {
    label1: {
      files: 'files'
    },
    label2: {
      meta: {
        field1: [
          'value5',
          'value6'
        ],
        field2: 'value3'
      }
    },
    label4: {
      meta: [
        'field1'
      ]
    },
    label5: {
      meta: {
        field1: [
          'value1',
          'value2'
        ],
        field2: 'value4'
      }
    },
    label6: {
      meta: 'field1'
    }
  }

  mock({
    '/tmp/mock': {
      'file1.md': '---\nfield1:\n  - value1\nfield2:\n  - value4\n---\nFile content here',
      'file2.txt': 'File content here'
    },
  })

  const module = new FrontmatterModule(objects, config)

  t.is(module.isApplicable('label1'), undefined)
  t.is(module.isApplicable('label2'), false)
  t.is(module.isApplicable('label3'), undefined)
  t.is(module.isApplicable('label4'), true)
  t.is(module.isApplicable('label5'), true)
  t.is(module.isApplicable('label6'), true)
})


