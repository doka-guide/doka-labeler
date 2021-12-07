import { Octokit } from '@octokit/core'
import * as core from '@actions/core'
import * as github from '@actions/github'
import * as yaml from 'yaml'
import fs from 'fs'

import { BaseModule } from './modules/base.js'
import { AssigneeModule } from './modules/assignee.js'
import { FilesModule } from './modules/files.js'
import { FrontmatterModule } from './modules/frontmatter.js'

const DEFAULT_STRATEGY = {
  'append': true,
  'replace': false,
  'create-if-missing': false,
  'only': false
}

export class Labeler {
  async run() {
    try {
      const configPath = core.getInput('config', { required: true })
      const token = core.getInput('token', { required: true })
      const commonStrategy = core.getInput('strategy', { required: false })

      const file = fs.readFileSync(configPath, 'utf8')
      const labelRules = yaml.parse(file)

      const owner = 'doka-guide'
      const repo = 'content'

      const pullNumber = getPrNumber()
      const pullObject = await getPullObject(owner, repo, pullNumber, token)
      const fileObjects = await getFileObjects(owner, repo, pullNumber, token)
      const assignee = getAssignee(pullObject)

      const modules = setupModules(labelRules, { fileObjects, assignee })
      const newLabels = prepareNewLabels(modules)
      const oldLabels = await getOldLabels(owner, repo, pullNumber, token)
      const allLabels = await getAllLabels(owner, repo, token)

      const strategy = setupStrategy(!!commonStrategy ? commonStrategy : DEFAULT_STRATEGY, labelRules)
      const readyToPostLabels = await mergeLabels(owner, repo, token, allLabels, oldLabels, newLabels, strategy)

      await postNewLabels(owner, repo, pullNumber, token, readyToPostLabels)
    } catch (e) {
      console.log(e)
    }
  }

  getPrNumber() {
    const pullRequest = github.context.payload.pull_request;
    if (!pullRequest) {
      return undefined;
    }
    return pullRequest.number
  }

  async getPullObject(owner, repo, prNumber, ghKey) {
    const octokit = new Octokit({ auth: ghKey })
    return await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
      owner,
      repo,
      pull_number: prNumber
    })
  }

  async getFileObjects(owner, repo, prNumber, ghKey) {
    const octokit = new Octokit({ auth: ghKey })
    return await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/files', {
      owner,
      repo,
      pull_number: prNumber
    })
  }

  async getOldLabels(owner, repo, prNumber, ghKey) {
    const labels = new Set([])
    const octokit = new Octokit({ auth: ghKey })
    const oldLabelsObject = await octokit.request('GET /repos/{owner}/{repo}/issues/{issue_number}/labels', {
      owner,
      repo,
      issue_number: prNumber,
    })
    for (const key in oldLabelsObject) {
      if (oldLabelsObject[key].hasOwnProperty('name')) {
        labels.add(oldLabelsObject[key].name)
      }
    }
    return labels
  }

  async getAllLabels(owner, repo, ghKey) {
    const octokit = new Octokit({ auth: ghKey })
    const labelObjects = await octokit.request('GET /repos/{owner}/{repo}/labels', {
      owner,
      repo
    })
    const labels = new Set([])
    const objectSet = new Set([...labelObjects])
    objectSet.forEach(lo => {
      labels.add(lo.name)
    })
    return labels
  }

  async createLabel(owner, repo, ghKey, label) {
    const octokit = new Octokit({ auth: ghKey })
    await octokit.request('POST /repos/{owner}/{repo}/labels', {
      owner,
      repo,
      name: label
    })
  }

  getAssignee(pullObject) {
    return pullObject.assignees
  }

  setupModules(config, objects) {
    const modules = []
    const moduleNames = new Set([])

    for (const label in config) {
      if (Object.hasOwnProperty.call(config, label)) {
        const setupObject = config[label]
        for (const key in setupObject) {
          if (Object.hasOwnProperty.call(setupObject, key)) {
            moduleNames.add(key)
          }
        }
      }
    }
    moduleNames.forEach(m => {
      switch (m) {
        case 'assignee':
          modules.push(new AssigneeModule(objects.assignee, config))
          break
        case 'files':
          modules.push(new FilesModule(objects.fileObjects, config))
          break
        case 'meta':
          modules.push(new FrontmatterModule(objects.fileObjects, config))
          break
      }
    })

    return modules
  }

  setupStrategy(commonStrategy, config) {
    let readyCommonStrategy = {}
    if (typeof commonStrategy === 'string') {
      readyCommonStrategy[commonStrategy] = true
    } else if (Array.isArray(commonStrategy)) {
      commonStrategy.forEach(s => readyCommonStrategy[s] = true)
    } else {
      readyCommonStrategy = commonStrategy
    }
    const resultedStrategy = {}
    const labels = Object.keys(config)
    labels.forEach(l => {
      const labelConfig = config[l]
      if (labelConfig.hasOwnProperty('strategy')) {
        const strategies = labelConfig['strategy']
        if (Array.isArray(strategies)) {
          const o = {}
          strategies.forEach(s => {
            o[s] = true
          })
          resultedStrategy[l] = Object.assign(o, readyCommonStrategy)
        } else if (typeof strategies === 'object') {
          resultedStrategy[l] = Object.assign(strategies, readyCommonStrategy)
        } else if (typeof strategies === 'string') {
          const o = {}
          o[strategies] = true
          resultedStrategy[l] = Object.assign(o, readyCommonStrategy)
        }
      } else {
        resultedStrategy[l] = readyCommonStrategy
      }
    })
    return { common: readyCommonStrategy, local: resultedStrategy }
  }

  prepareNewLabels(modules, config) {
    const newLabels = new Set([])
    const labels = Object.keys(config)
    labels.forEach(l => {
      let result = false
      modules.forEach(m => {
        if (m instanceof BaseModule) {
          const labelConfigArray = config[l]
          if (Array.isArray(labelConfigArray)) {
            labelConfigArray.forEach((_, i) => {
              result = result || m.isApplicable(l, i)
            })
          } else if (typeof labelConfigArray === 'object') {
            result = result && m.isApplicable(l)
          }
        }
      })
      if (result) newLabels.add(l)
    })
    return newLabels
  }

  async collectNewLabels(owner, repo, ghKey, allLabels, newLabels, strategy) {
    const labels = new Set([])
    let onlyLabel = ''
    for (let i = 0; i < newLabels.length; i++) {
      const l = newLabels[i]
      labels.add(l)
      if (strategy.local[l]['only']) {
        onlyLabel = l
        break
      }
      if (strategy.local[l]['create-if-missing'] && !allLabels.has(l)) {
        await createLabel(owner, repo, ghKey, l)
      }
    }
    if (!!onlyLabel) {
      newLabels.forEach(l => {
        if (l !== onlyLabel) {
          labels.remove(l)
        }
      })
    }
    return labels
  }

  async mergeLabels(owner, repo, ghKey, allLabels, oldLabels, newLabels, strategy) {
    const labels = await collectNewLabels(owner, repo, ghKey, allLabels, newLabels, strategy)
    if (strategy.common.append) {
      oldLabels.forEach(l => {
        labels.add(l)
      })
      return l
    } else if (strategy.common.replace) {
      return labels
    }
  }

  async postNewLabels(owner, repo, prNumber, ghKey, newLabels) {
    const octokit = new Octokit({ auth: ghKey })
    await octokit.request('PATCH /repos/{owner}/{repo}/issues/{issue_number}', {
      owner,
      repo,
      issue_number: prNumber,
      labels: [...newLabels]
    })
  }
}
