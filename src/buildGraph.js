const fs = require('fs')
const path = require('path')
const { repoHasChanged } = require('./git')
const { Repo } = require('./Repo')
const { Graph } = require('./Graph')

/**
 * @param {Repo} repo 
 * @param {Array<Repo>} repos 
 * @returns {Array<Repo>} list of repos that are dependent on `repo`
 */
const getDependents = (repo, repos) => {
  const deps = repo.allDependencies
  
  if (!Object.keys(deps).length) return []

  const repoNameMap = repos.reduce((obj, repo) => ({ 
    [repo.key]: repo, ...obj 
  }), {})

  return Object.entries(deps).reduce(
    (acc, [ depName ]) => {
      const foundDependency = repoNameMap[depName]
      foundDependency && acc.push(foundDependency)
      return acc
    },
    []
  )
}

/**
 * Builds a graph where nodes are nodejs projects, with
 * edges representing dependencies between them
 * @param {Array<Repo>} repos 
 * @returns {Graph}
 */
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

/**
 * @param {string} repoPath 
 * @returns {boolean} true if repo at path is a nodejs repo
 */
const isRepo = repoPath => {
  const pkgPath = path.join(repoPath, 'package.json')
  return fs.existsSync(pkgPath)
}


/**
 * Flags the node as dirty then does the same for all its dependents, recursively
 * @param {Repo} node 
 * @param {Graph<Repo>} graph 
 * @returns {Repo} the same node
 */
const flagNode = (node, graph) => {
  if (node.isDirty) return node

  node.isDirty = true

  graph
    .dependentsOf(node.key)
    .map(dependent => flagNode(graph.getNodeData(dependent), graph))

  return node
}

/**
 * 
 * @param {Array<Repo>} repos 
 * @param {Object} branches { current, against }, defaulting to current branch and master respectively
 * @returns {Array<Repo>} subset of repos whose current branch differs from the `against` branch
 */
const getChangedRepos = async (repos, branches={}) => {
  const statuses = await Promise.all(
    repos.map(repo => repoHasChanged(repo, branches))
  )
  return repos.filter((_, idx) => statuses[idx])
}

/**
 * 
 * @param {*} paths 
 * @param {*} filter 
 */
const buildGraph = async (paths, filter=[]) => {
  const repos = paths
    .filter(path => isRepo(path) && !filter.includes(path))
    .map(path => new Repo(path))

  const graph = buildDependencyGraph(repos)
  
  const changedRepos = await getChangedRepos(repos)

  changedRepos.map(repo => flagNode(repo, graph))

  return graph
}

module.exports = { buildGraph }
