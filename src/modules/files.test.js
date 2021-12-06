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
