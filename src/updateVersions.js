const { ask } = require('@keg-hub/ask-it')

/**
 * Updates the versions of each dirty repo, and updates its dependents versions
 * @param {*} dirtyRepos 
 */
const updateVersions = async dirtyRepos => {
  for (const repo of dirtyRepos) {
    const { stdout: version } = await ask.input(`Type next version for ${repo.name} [current=${repo.version}]`)
  }
}

module.exports = { updateVersions }
