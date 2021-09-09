const fs = require('fs')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const readdir = util.promisify(fs.readdir)
const path = require('path')
const Graph = require('dependency-graph').DepGraph
const { ask } = require('repos/keg-cli/repos/ask-it')

const REPOS_PATH = path.resolve('./repos')

const getDependents = (repo, repos) => {
  const allDeps = {
    ...repo.dependencies,
    ...repo.devDependencies,
    ...repo.peerDependencies
  }
  if (!Object.keys(allDeps).length) return []

  const repoNameMap = repos.reduce((obj, repo) => ({ 
    [repo.key]: repo, ...obj 
  }), {})

  return Object.entries(allDeps).reduce(
    (acc, [ depName ]) => {
      const foundDependency = repoNameMap[depName]
      foundDependency && acc.push(foundDependency)
      return acc
    },
    []
  )
}

const buildDependencyGraph = repos => {

  const graph = new Graph()
  const add = node => !graph.hasNode(node) && graph.addNode(node.key, node)
  const addDependency = (nodeA, nodeB) => {
    add(nodeA)
    add(nodeB)
    graph.addDependency(nodeA.key, nodeB.key)
  }

  repos.map(repo => {
    add(repo)
    const dependents = getDependents(repo, repos)
    dependents.map(dependent => addDependency(repo, dependent))
  })

  return graph
}

const buildModel = name => {
  const repoPath = path.resolve(`./repos/${name}`)
  const package = require(path.resolve(`${repoPath}/package.json`))
  return {
    key: package.name || name,
    dirName: name,
    isDirty: false,
    path: repoPath,
    ...package,
    get version() { return package.version },
    set version(v) { package.version = v },
    package,
  }
}

const isRepo = name => {
  const repoPath = path.join(REPOS_PATH, name)
  const pkgPath = path.join(repoPath, 'package.json')
  return fs.existsSync(pkgPath)
}

const flag = node => (node.isDirty = true)

const flagNode = (node, graph) => {
  if (node.isDirty) return node
  flag(node)
  const dependents = graph.dependentsOf(node.key)
  dependents.map(dependent => flagNode(graph.getNodeData(dependent), graph))
  return node
}

const flagDirtyNodes = (nodes, graph) => nodes.map(
  node => flagNode(node, graph)
)

const getChangedRepos = async (repos, against='master') => {
  const { stdout: diffString } = await exec(`git diff --name-only ${against}`)

  // get differences, but ignore build files
  const differences = diffString.split('\n').filter(str => !str.includes('/build/'))

  const dirtyReposSet = differences.reduce(
    (set, changedFile) => {
      repos.map(repo => {
        const repoPath = `repos/${repo.dirName}`
        changedFile.startsWith(repoPath) && set.add(repo)
      })
      return set
    },
    new Set() 
  )

  return Array.from(dirtyReposSet)
}

const updateVersions = async dirtyRepos => {
  for (const repo of dirtyRepos) {
    console.log() 
    const { stdout: version } = await ask.input(`Type next version for ${repo.name} [current=${repo.version}]`)
    console.log(repo.name, version)
  }
}


const publishAll = async (filter=[]) => {
  const repoNames = await readdir('./repos')

  const repos = repoNames
    .filter(repo => isRepo(repo) && !filter.includes(repo))
    .map(buildModel)

  const graph = buildDependencyGraph(repos)
  
  const changedRepos = await getChangedRepos(repos)

  flagDirtyNodes(changedRepos, graph)

  const dirtyNodes = graph
    .overallOrder()
    .map(key => graph.getNodeData(key))
    .filter(node => node.isDirty)

  updateVersions(dirtyNodes)
}

publishAll([ 'keg-cli', ])
