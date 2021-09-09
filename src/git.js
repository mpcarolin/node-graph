const util = require('util')
const exec = util.promisify(require('child_process').exec)
const path = require('path')
const { Repo } = require('./Repo')

/**
 * @param {Repo} repo 
 * @param {Object} branches { current, against }, defaulting to current branch and master respectively
 * @returns {boolean} true if repo's current branch differs from the `against` branch
 */
 const repoHasChanged = async (repo, branches={}) => {
  const { 
    current=(await exec(`git -C ${repo.path} branch --show-current`)),
    against='master'
  } = branches

  const { stdout: diffString } = await exec(`git -C ${repo.path} diff --name-only ${current}..${against}`)

  const repoRoot = await exec(`git -c ${repo.path} rev-parse --show-toplevel`)

  // get differences, but ignore build files
  const differences = diffString
    .split('\n')
    .filter(str => !str.includes('/build/'))
    .map(diff => path.join(repoRoot, diff))

  // we need to do this to account for monorepos
  return differences.some(diff => diff.startsWith(repo.path))
}

module.exports = { repoHasChanged }