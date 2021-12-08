import test from "ava"
import { FilesModule } from "./files.js"

test('FilesModule contains fields object, config', t => {
  const objects = {
  }
  const config = {
    label1: {
      files: 'files'
    },
    label2: {
      meta: 'meta config'
    }
  }

  const module = new FilesModule(objects, config)

  t.deepEqual(module.objects, objects)
  t.deepEqual(module.config, config)
})

test('FilesModule method parse files correctly', t => {
  const objects = [
    {
      "filename": "file1.txt",
      "status": "added"
    }
  ]
  const config = {
    label1: {
      files: 'file1.txt'
    },
    label2: {
      files: 'file2.txt'
    }
  }

  const module = new FilesModule(objects, config)

  t.deepEqual(['file1.txt'], module.getArrayFromGitHubFiles(objects))
})

test('FilesModule method isApplicable returns correct values for string', t => {
  const objects = [
    {
      "filename": "file1.txt",
      "status": "added"
    }
  ]
  const config = {
    label1: {
      files: 'file1.txt'
    },
    label2: {
      files: 'file2.txt'
    }
  }

  const module = new FilesModule(objects, config)

  t.is(module.isApplicable('label1'), true)
  t.is(module.isApplicable('label2'), false)
  t.is(module.isApplicable('label3'), undefined)
})

test('FilesModule method isApplicable returns correct values for array', t => {
  const objects = [
    {
      "filename": "file1.txt",
      "status": "added"
    }
  ]
  const config = {
    label1: {
      files: [
        'file1.txt',
        'file2.txt'
      ]
    },
    label2: {
      files: [
        'file2.txt',
        'file3.txt'
      ]
    }
  }

  const module = new FilesModule(objects, config)

  t.is(module.isApplicable('label1'), true)
  t.is(module.isApplicable('label2'), false)
  t.is(module.isApplicable('label3'), undefined)
})

test('FilesModule method isApplicable returns correct values for mix values in array case', t => {
  const objects = [
    {
      "filename": "file1.txt",
      "status": "added"
    }
  ]
  const config = {
    label1: [
      {
        files: [
          'file1.txt',
          'file2.txt'
        ],
        meta: {
          field: 'example'
        }
      },
      {
        files: '*.txt'
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
      files: [
        'file1.txt',
        'file3.txt'
      ]
    },
    label3: {
      files: 'file3.txt'
    },
    label4: {
      files: 'file2.txt'
    }
  }

  const module = new FilesModule(objects, config)

  t.is(module.isApplicable('label1', 0), true)
  t.is(module.isApplicable('label1', 1), true)
  t.is(module.isApplicable('label2'), true)
  t.is(module.isApplicable('label3'), false)
  t.is(module.isApplicable('label4'), false)
})
